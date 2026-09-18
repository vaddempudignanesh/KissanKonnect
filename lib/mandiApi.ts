// lib/mandiApi.ts
// -----------------------------------------------------------------------------
// PURPOSE: Client for the Government of India Mandi Prices API.
//          Fetches raw data from data.gov.in, normalizes it into our internal
//          `Price` shape, and caches the response for 30 minutes.
//
//          Used ONLY on the server (API route). Never import this in a "use
//          client" component — the API key must stay server-side.
// -----------------------------------------------------------------------------

import type { Crop, Price } from "./db";

const BASE = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";

// Map our internal crop names to the exact names the govt API uses.
// Some crops exist under multiple names (e.g. Rice is also Paddy).
const COMMODITY_ALIASES: Record<Crop, string[]> = {
  Tomato: ["Tomato"],
  Onion:  ["Onion"],
  Potato: ["Potato"],
  Wheat:  ["Wheat"],
  Rice:   ["Rice", "Paddy(Dhan)(Common)"],
};

// Approximate lat/lng for each state's capital, used to compute distance
// from the farmer's location (Nashik by default).
const STATE_COORDS: Record<string, { lat: number; lng: number }> = {
  "Maharashtra":      { lat: 19.75, lng: 75.71 },
  "Delhi":            { lat: 28.61, lng: 77.20 },
  "NCT of Delhi":     { lat: 28.61, lng: 77.20 },
  "Karnataka":        { lat: 12.97, lng: 77.59 },
  "Telangana":        { lat: 17.38, lng: 78.48 },
  "Tamil Nadu":       { lat: 13.08, lng: 80.27 },
  "Keralam":          { lat: 8.52,  lng: 76.93 },
  "Kerala":           { lat: 8.52,  lng: 76.93 },
  "Gujarat":          { lat: 23.02, lng: 72.57 },
  "Rajasthan":        { lat: 26.91, lng: 75.79 },
  "Punjab":           { lat: 30.90, lng: 75.85 },
  "Haryana":          { lat: 29.06, lng: 76.08 },
  "Uttar Pradesh":    { lat: 26.85, lng: 80.95 },
  "Madhya Pradesh":   { lat: 23.25, lng: 77.41 },
  "West Bengal":      { lat: 22.57, lng: 88.36 },
  "Andhra Pradesh":   { lat: 17.68, lng: 83.21 },
  "Odisha":           { lat: 20.29, lng: 85.82 },
  "Bihar":            { lat: 25.59, lng: 85.13 },
  "Jharkhand":        { lat: 23.34, lng: 85.31 },
  "Chhattisgarh":     { lat: 21.25, lng: 81.62 },
  "Assam":            { lat: 26.14, lng: 91.73 },
  "Uttarakhand":      { lat: 30.31, lng: 78.03 },
  "Himachal Pradesh": { lat: 31.10, lng: 77.17 },
  "Goa":              { lat: 15.49, lng: 73.82 },
};

// Default origin for distance calculations (farmer's location).
const ORIGIN = { lat: 19.9975, lng: 73.7898 }; // Nashik

// Haversine formula: distance in km between two lat/lng points.
function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

// Format an API price (₹ per quintal) into ₹/kg.
function toKgPrice(quintal: number): number {
  return Math.round((quintal / 100) * 100) / 100;
}

// -----------------------------------------------------------------------------
// Raw govt record shape (only the fields we use)
// -----------------------------------------------------------------------------
interface RawRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrival_date: string;
  min_price: number;
  max_price: number;
  modal_price: number;
}

interface ApiResponse {
  total: number;
  count: number;
  records: RawRecord[];
}

// -----------------------------------------------------------------------------
// Fetch + normalize
// -----------------------------------------------------------------------------

export interface FetchOptions {
  crop: Crop;
  state?: string;     // optional state filter
  limit?: number;     // max records to fetch
  offset?: number;
}

/**
 * Fetch prices for a single crop from the govt API and normalize to `Price[]`.
 * Falls back to alternate commodity names if the primary returns 0 rows.
 */
export async function fetchMandiPrices(opts: FetchOptions): Promise<Price[]> {
  const apiKey = process.env.DATA_GOV_API_KEY;
  if (!apiKey) {
    console.warn("[mandiApi] DATA_GOV_API_KEY not set — returning empty list");
    return [];
  }

  const aliases = COMMODITY_ALIASES[opts.crop];
  const limit = Math.min(opts.limit ?? 100, 500);
  const offset = opts.offset ?? 0;

  for (const alias of aliases) {
    const params = new URLSearchParams();
    params.set("api-key", apiKey);
    params.set("format", "json");
    params.set("limit", String(limit));
    params.set("offset", String(offset));
    params.set("filters[commodity]", alias);
    if (opts.state) params.set("filters[state.keyword]", opts.state);

    const url = `${BASE}?${params.toString()}`;

    let res: Response;
    try {
      res = await fetch(url, {
        // Next.js fetch cache — revalidate every 30 minutes
        next: { revalidate: 1800 },
      });
    } catch (err) {
      console.error(`[mandiApi] fetch failed for ${alias}:`, err);
      continue;
    }

    if (!res.ok) {
      console.error(`[mandiApi] HTTP ${res.status} for ${alias}`);
      continue;
    }

    const data = (await res.json()) as ApiResponse;
    if (!data.records || data.records.length === 0) continue;

    return data.records.map((r, i) => normalize(r, i));
  }

  return [];
}

/**
 * Convert one raw govt record into our internal `Price` shape.
 */
function normalize(r: RawRecord, idx: number): Price {
  const coords = STATE_COORDS[r.state] ?? { lat: 20, lng: 78 };
  const distanceKm = haversineKm(ORIGIN, coords);

  // Trend heuristic: we don't have historical data from the API, so derive
  // a plausible trend from the min/max spread and modal position.
  const spread = r.max_price - r.min_price;
  const mid = (r.min_price + r.max_price) / 2;
  let trend: "up" | "down" | "flat" = "flat";
  if (mid > 0 && spread / mid > 0.15) trend = r.modal_price >= mid ? "up" : "down";
  else if (spread > 0 && r.modal_price === r.max_price) trend = "up";
  else if (spread > 0 && r.modal_price === r.min_price) trend = "down";

  // Convert DD/MM/YYYY → ISO
  const [dd, mm, yyyy] = (r.arrival_date ?? "").split("/");
  const iso = dd && mm && yyyy
    ? new Date(Number(yyyy), Number(mm) - 1, Number(dd)).toISOString()
    : new Date().toISOString();

  return {
    id: `mandi-${idx}-${r.market}-${r.commodity}`.replace(/\s+/g, "-"),
    crop: mapCommodityToCrop(r.commodity),
    market: r.market.trim(),
    city: r.district,
    state: r.state,
    price: toKgPrice(r.modal_price),
    distanceKm,
    trend,
    updatedAt: iso,
  };
}

function mapCommodityToCrop(commodity: string): Crop {
  const c = commodity.toLowerCase();
  if (c.startsWith("tomato")) return "Tomato";
  if (c.startsWith("onion"))  return "Onion";
  if (c.startsWith("potato")) return "Potato";
  if (c.startsWith("wheat"))  return "Wheat";
  if (c.includes("paddy") || c.startsWith("rice")) return "Rice";
  return "Tomato"; // default — shouldn't happen for our filters
}

// -----------------------------------------------------------------------------
// Public: fetch many crops at once (used by /api/mandi?crop=all)
// -----------------------------------------------------------------------------
export async function fetchAllCrops(): Promise<Price[]> {
  const crops: Crop[] = ["Tomato", "Onion", "Potato", "Wheat", "Rice"];
  const results = await Promise.all(
    crops.map((crop) => fetchMandiPrices({ crop, limit: 100 })),
  );
  // De-duplicate by id
  const seen = new Set<string>();
  const flat: Price[] = [];
  for (const list of results) {
    for (const p of list) {
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      flat.push(p);
    }
  }
  return flat;
}


// -----------------------------------------------------------------------------
// Fuzzy search helpers
// -----------------------------------------------------------------------------

// Common spellings/typos → canonical government spelling.
// Add more as users find them.
const STATE_ALIASES: Record<string, string> = {
  "andra": "andhra",
  "andhara": "andhra",
  "andrapradesh": "andhra pradesh",
  "andhra": "andhra pradesh",
  "bengaluru": "karnataka",
  "bangalore": "karnataka",
  "banglore": "karnataka",
  "bombay": "mumbai",
  "calcutta": "kolkata",
  "madras": "chennai",
  "nasik": "nashik",
  "kerla": "kerala",
  "keralam": "kerala",
  "hyd": "hyderabad",
  "hydrabad": "hyderabad",
  "up": "uttar pradesh",
  "mp": "madhya pradesh",
  "ap": "andhra pradesh",
  "ts": "telangana",
  "mh": "maharashtra",
  "maharastra": "maharashtra",
  "maharasthra": "maharashtra",
  "karnatka": "karnataka",
  "tamilnadu": "tamil nadu",
  "tamil nadu": "tamil nadu",
  "tn": "tamil nadu",
  "punjab": "punjab",
  "gujrat": "gujarat",
  "rajsthan": "rajasthan",
  "rajasthan": "rajasthan",
  "wb": "west bengal",
  "odisa": "odisha",
  "orissa": "odisha",
  "benglore": "bengaluru",
};

/** Levenshtein distance between two strings (edit distance). */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const prev = new Array(b.length + 1);
  const curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,        // deletion
        curr[j - 1] + 1,    // insertion
        prev[j - 1] + cost, // substitution
      );
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }
  return prev[b.length];
}

/**
 * Score how well a query matches a target string. Returns 0..1 where 1 is a
 * perfect match. Combines:
 *   - exact substring (score 1)
 *   - start-of-word match (score 0.9)
 *   - fuzzy Levenshtein match on words (score depends on distance)
 */
function fuzzyScore(query: string, target: string): number {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase().trim();
  if (!q) return 0;
  if (t.includes(q)) return 1;

  // Word-level fuzzy
  const qWords = q.split(/\s+/);
  const tWords = t.split(/[\s,()\/-]+/);

  let total = 0;
  for (const qw of qWords) {
    let best = 0;
    for (const tw of tWords) {
      if (!tw) continue;
      // Exact word match
      if (tw === qw) { best = 1; break; }
      // Prefix match (e.g. "beng" → "bengaluru")
      if (tw.startsWith(qw)) { best = Math.max(best, 0.9); continue; }
      // Fuzzy: accept up to 40% edit distance
      const dist = levenshtein(qw, tw);
      const maxLen = Math.max(qw.length, tw.length);
      if (maxLen > 0 && dist / maxLen <= 0.4) {
        best = Math.max(best, 1 - dist / maxLen);
      }
    }
    total += best;
  }
  return total / qWords.length;
}

/**
 * Expand a user query through the alias table.
 * Returns the original query plus any canonical form it maps to.
 */
function expandQuery(query: string): string[] {
  const q = query.toLowerCase().trim();
  const out = new Set<string>([q]);
  // Strip spaces to check compact aliases like "andrapradesh"
  const compact = q.replace(/\s+/g, "");
  if (STATE_ALIASES[compact]) out.add(STATE_ALIASES[compact]);
  if (STATE_ALIASES[q]) out.add(STATE_ALIASES[q]);
  return [...out];
}

/**
 * Client-side fuzzy filter. Call this on the array of prices, pass the raw
 * query, and get back only rows that match with score > 0.5.
 */
export function fuzzyFilterPrices(prices: Price[], query: string): Price[] {
  const q = query.trim();
  if (!q) return prices;
  const expanded = expandQuery(q);
  const scored = prices
    .map((p) => {
      const hay = `${p.market} ${p.city} ${p.state} ${p.crop}`;
      const score = Math.max(...expanded.map((e) => fuzzyScore(e, hay)));
      return { p, score };
    })
    .filter(({ score }) => score > 0.45)
    .sort((a, b) => b.score - a.score);
  return scored.map(({ p }) => p);
}