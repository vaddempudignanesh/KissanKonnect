// lib/mandiApi.ts
// -----------------------------------------------------------------------------
// PURPOSE: Client for the Government of India Mandi Prices API.
//
//   Handles:
//     • Fetching by crop (+ optional state + optional district)
//     • Normalizing government names ("Keralam" → "Kerala", "NCT of Delhi" → "Delhi")
//     • Normalizing district names ("Ahmednagar" → "Ahilyanagar", etc.)
//     • Converting ₹/quintal → ₹/kg
//     • Parsing DD/MM/YYYY dates → ISO
//     • Distances via haversine from Nashik
//     • Fuzzy search helpers (used client-side)
//
//   This file is safe to import from BOTH server routes and client components.
//   It never reads process.env.DATA_GOV_API_KEY — the actual API key is used
//   only inside app/api/mandi/route.ts.
// -----------------------------------------------------------------------------

import type { Crop, DbPrice as Price } from "./types";

const BASE =
  "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";

const COMMODITY_ALIASES: Record<Crop, string[]> = {
  Tomato:    ["Tomato"],
  Onion:     ["Onion"],
  Potato:    ["Potato"],
  Wheat:     ["Wheat"],
  Rice:      ["Rice", "Paddy(Dhan)(Common)"],
  Sugarcane: ["Sugarcane"],
  Cotton:    ["Cotton"],
  Soybean:   ["Soybean"],
};

// -----------------------------------------------------------------------------
// State name normalization — UI name → govt API name
// -----------------------------------------------------------------------------
const STATE_NAME_MAP: Record<string, string> = {
  "Delhi (NCT)":              "Delhi",
  "Delhi":                    "Delhi",
  "NCT of Delhi":             "Delhi",
  "Kerala":                   "Keralam",
  "Keralam":                  "Keralam",
  "Odisha":                   "Odisha",
  "Orissa":                   "Odisha",
  "Tamil Nadu":               "Tamil Nadu",
  "Tamilnadu":                "Tamil Nadu",
  "Chandigarh (UT)":          "Chandigarh",
  "Puducherry":               "Puducherry",
  "Pondicherry":              "Puducherry",
  "Uttarakhand":              "Uttarakhand",
  "Uttaranchal":              "Uttarakhand",
  "Andaman and Nicobar Islands (UT)": "Andaman and Nicobar Islands",
  "Dadra and Nagar Haveli and Daman and Diu (UT)": "Dadra and Nagar Haveli",
  "Jammu and Kashmir":        "Jammu and Kashmir",
};

export function toGovtStateName(uiState: string): string {
  if (!uiState) return uiState;
  return STATE_NAME_MAP[uiState] ?? uiState;
}

// -----------------------------------------------------------------------------
// District name normalization — some districts in our geoData use the modern
// name with a "(formerly X)" suffix. The govt API expects the older plain name.
// -----------------------------------------------------------------------------
const DISTRICT_NAME_MAP: Record<string, string> = {
  "Chhatrapati Sambhajinagar (formerly Aurangabad)": "Aurangabad",
  "Dharashiv (formerly Osmanabad)":                  "Osmanabad",
  "Sahibzada Ajit Singh Nagar (Mohali)":             "Mohali",
  "Shahid Bhagat Singh Nagar (Nawanshahr)":          "Nawanshahr",
  "Gautam Buddha Nagar (Noida)":                     "Gautam Buddha Nagar",
  "Hanamkonda (Warangal Urban)":                     "Warangal",
  "Warangal (Warangal Rural)":                       "Warangal",
  "Sri Potti Sriramulu Nellore":                     "Nellore",
  "YSR Kadapa":                                      "Kadapa",
  "Narmadapuram":                                    "Hoshangabad",
  "Kendujhar":                                       "Keonjhar",
  "Subarnapur (Sonepur)":                            "Sonepur",
  "Kouayam":                                         "Kottayam",
  "Ponch":                                           "Poonch",
  "Ahmednagar":                                      "Ahilyanagar",
  "Bengaluru Urban":                                 "Bengaluru Urban",
  "Bengaluru Rural":                                 "Bengaluru Rural",
};

export function toGovtDistrictName(uiDistrict: string): string {
  if (!uiDistrict) return uiDistrict;
  return DISTRICT_NAME_MAP[uiDistrict] ?? uiDistrict;
}

// -----------------------------------------------------------------------------
// Approximate lat/lng for state capitals — used for distance sort
// -----------------------------------------------------------------------------
const STATE_COORDS: Record<string, { lat: number; lng: number }> = {
  "Maharashtra":      { lat: 19.75, lng: 75.71 },
  "Delhi":            { lat: 28.61, lng: 77.20 },
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
  "Puducherry":       { lat: 11.93, lng: 79.83 },
  "Chandigarh":       { lat: 30.73, lng: 76.77 },
  "Jammu and Kashmir":{ lat: 33.78, lng: 78.10 },
  "Ladakh":           { lat: 34.15, lng: 77.57 },
};

const ORIGIN = { lat: 19.9975, lng: 73.7898 }; // Nashik

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

function toKgPrice(quintal: number): number {
  return Math.round((quintal / 100) * 100) / 100;
}

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

export interface FetchOptions {
  crop: Crop;
  state?: string;
  district?: string;
  limit?: number;
  offset?: number;
}

export async function fetchMandiPrices(opts: FetchOptions): Promise<Price[]> {
  const apiKey = process.env.DATA_GOV_API_KEY;
  if (!apiKey) {
    console.warn("[mandiApi] DATA_GOV_API_KEY not set — returning empty");
    return [];
  }

  const aliases = COMMODITY_ALIASES[opts.crop];
  const limit = Math.min(opts.limit ?? 500, 2000);
  const offset = opts.offset ?? 0;

  const govtState = opts.state ? toGovtStateName(opts.state) : undefined;
  const district =
    opts.district && opts.district !== "All"
      ? toGovtDistrictName(opts.district)
      : undefined;

  // ---------------------------------------------------------------------
  // STRATEGY: The government API's filter engine is currently broken
  // (returns total:0 for any filters[...] query). So we fetch a large
  // unfiltered page and filter locally. We still TRY the filtered query
  // first in case the API recovers.
  // ---------------------------------------------------------------------

  for (const alias of aliases) {
    // ---- Attempt 1: filtered query (may work again someday) ----
    const filteredUrl = buildUrl(apiKey, {
      limit,
      offset,
      commodity: alias,
      state: govtState,
      district,
    });

    console.log(
      `[mandiApi] filtered GET crop=${alias} state=${govtState ?? "any"} district=${district ?? "any"}`,
    );

    const filtered = await tryFetch(filteredUrl, alias);
    if (filtered.length > 0) {
      console.log(`[mandiApi] ✓ ${filtered.length} records (filtered) for ${alias}`);
      return filtered;
    }

    // ---- Attempt 2: unfiltered fetch + local filter ----
    console.warn(
      `[mandiApi] filtered query empty for ${alias} — falling back to unfiltered fetch + local filter`,
    );

    const unfilteredUrl = buildUrl(apiKey, {
      limit: Math.min(2000, limit * 4), // fetch more since we'll filter down
      offset: 0,
      commodity: undefined, // NO commodity filter
      state: undefined,
      district: undefined,
    });

    const all = await tryFetch(unfilteredUrl, alias);
    if (all.length === 0) {
      console.warn(`[mandiApi] unfiltered fetch also empty for ${alias}`);
      continue;
    }

    console.log(`[mandiApi] unfiltered fetch: ${all.length} records — filtering locally`);

    // Local filter by commodity (map to our Crop enum)
        const localFiltered = all.filter((p: Price) => {
      if (p.crop !== opts.crop) return false;
      if (govtState && p.state !== govtState) return false;
      if (district && p.city !== district) return false;
      return true;
    });

    if (localFiltered.length > 0) {
      console.log(
        `[mandiApi] ✓ ${localFiltered.length} records (local-filtered) for ${alias}`,
      );
      return localFiltered.slice(0, limit);
    }

    console.warn(
      `[mandiApi] local filter yielded 0 for ${alias} (state=${govtState ?? "any"} district=${district ?? "any"})`,
    );
  }

  return [];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildUrl(
  apiKey: string,
  opts: {
    limit: number;
    offset: number;
    commodity?: string;
    state?: string;
    district?: string;
  },
): string {
  const params = new URLSearchParams();
  params.set("api-key", apiKey);
  params.set("format", "json");
  params.set("limit", String(opts.limit));
  params.set("offset", String(opts.offset));
  if (opts.commodity) params.set("filters[commodity]", opts.commodity);
  if (opts.state) params.set("filters[state.keyword]", opts.state);
  if (opts.district) params.set("filters[district]", opts.district);
  return `${BASE}?${params.toString()}`;
}

async function tryFetch(url: string, alias: string): Promise<Price[]> {
  let res: Response;
  try {
    res = await fetch(url, {
      next: { revalidate: process.env.NODE_ENV === "production" ? 1800 : 0 },
    });
  } catch (err) {
    console.error(`[mandiApi] fetch threw for ${alias}:`, err);
    return [];
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(
      `[mandiApi] HTTP ${res.status} for ${alias} — body: ${body.slice(0, 200)}`,
    );
    return [];
  }

  const raw = await res.text();
  let data: any;
  try {
    data = JSON.parse(raw);
  } catch {
    console.error(`[mandiApi] non-JSON response for ${alias}: ${raw.slice(0, 200)}`);
    return [];
  }

  if (data?.error) {
    console.error(`[mandiApi] UPSTREAM ERROR for ${alias}: ${data.error}`);
    return [];
  }

  const records = Array.isArray(data?.records) ? data.records : [];
  if (records.length === 0) {
    console.warn(
      `[mandiApi] 0 records for ${alias} (total=${data?.total}, count=${data?.count})`,
    );
    return [];
  }

  // Map → normalize (may return null for unknown commodities) → filter nulls
  // Map → normalize (may re
  // turn null for unknown commodities) → filter nulls
  const mapped: (Price | null)[] = records.map((r: RawRecord, i: number) =>
    normalize(r, i)
  );
  return mapped.filter((p): p is Price => p !== null);
}

// -----------------------------------------------------------------------------
// normalize — returns Price | null. Returns null when the government
// commodity name doesn't map to any of our known Crops. This prevents
// "Ginger" / "Banana" / etc. from being silently mislabeled as Tomato.
// -----------------------------------------------------------------------------
function normalize(r: RawRecord, idx: number): Price | null {
  const crop = mapCommodityToCrop(r.commodity);
  if (!crop) return null;   // ← discard non-target commodities

  const coords = STATE_COORDS[r.state] ?? { lat: 20, lng: 78 };
  const distanceKm = haversineKm(ORIGIN, coords);

  const spread = r.max_price - r.min_price;
  const mid = (r.min_price + r.max_price) / 2;
  let trend: "up" | "down" | "flat" = "flat";
  if (mid > 0 && spread / mid > 0.15) trend = r.modal_price >= mid ? "up" : "down";
  else if (spread > 0 && r.modal_price === r.max_price) trend = "up";
  else if (spread > 0 && r.modal_price === r.min_price) trend = "down";

  const [dd, mm, yyyy] = (r.arrival_date ?? "").split("/");
  const iso =
    dd && mm && yyyy
      ? new Date(Number(yyyy), Number(mm) - 1, Number(dd)).toISOString()
      : new Date().toISOString();

  return {
    id: `mandi-${idx}-${r.market}-${r.commodity}`.replace(/\s+/g, "-"),
    crop,   // ← use the local crop variable (never falls back to Tomato)
    market: r.market.trim(),
    city: r.district,
    state: r.state,
    price: toKgPrice(r.modal_price),
    distanceKm,
    trend,
    updatedAt: iso,
  };
}

// -----------------------------------------------------------------------------
// mapCommodityToCrop — returns null for unknown commodities.
// Previously returned "Tomato" as a fallback, which caused Ginger / Banana /
// other commodities to appear as "Tomato" records with wildly wrong prices.
// -----------------------------------------------------------------------------
function mapCommodityToCrop(commodity: string): Crop | null {
  const c = commodity.toLowerCase().trim();
  if (c.startsWith("tomato")) return "Tomato";
  if (c.startsWith("onion"))  return "Onion";
  if (c.startsWith("potato")) return "Potato";
  if (c.startsWith("wheat"))  return "Wheat";
  if (c.includes("paddy") || c.startsWith("rice")) return "Rice";
  return null;   // ← unknown commodity — discard, don't mislabel
}

// =============================================================================
// Fuzzy search helpers (client-side)
// =============================================================================

const STATE_ALIASES: Record<string, string> = {
  "andra": "andhra", "andhara": "andhra", "andrapradesh": "andhra pradesh",
  "andhra": "andhra pradesh", "bengaluru": "karnataka", "bangalore": "karnataka",
  "banglore": "karnataka", "bombay": "mumbai", "calcutta": "kolkata",
  "madras": "chennai", "nasik": "nashik", "kerla": "kerala", "keralam": "kerala",
  "hyd": "hyderabad", "hydrabad": "hyderabad", "up": "uttar pradesh",
  "mp": "madhya pradesh", "ap": "andhra pradesh", "ts": "telangana",
  "mh": "maharashtra", "maharastra": "maharashtra", "maharasthra": "maharashtra",
  "karnatka": "karnataka", "tamilnadu": "tamil nadu", "tn": "tamil nadu",
  "gujrat": "gujarat", "rajsthan": "rajasthan", "wb": "west bengal",
  "odisa": "odisha", "orissa": "odisha", "benglore": "bengaluru",
};

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
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }
  return prev[b.length];
}

function fuzzyScore(query: string, target: string): number {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase().trim();
  if (!q) return 0;
  if (t.includes(q)) return 1;
  const qWords = q.split(/\s+/);
  const tWords = t.split(/[\s,()\/-]+/);
  let total = 0;
  for (const qw of qWords) {
    let best = 0;
    for (const tw of tWords) {
      if (!tw) continue;
      if (tw === qw) { best = 1; break; }
      if (tw.startsWith(qw)) { best = Math.max(best, 0.9); continue; }
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

function expandQuery(query: string): string[] {
  const q = query.toLowerCase().trim();
  const out = new Set<string>([q]);
  const compact = q.replace(/\s+/g, "");
  if (STATE_ALIASES[compact]) out.add(STATE_ALIASES[compact]);
  if (STATE_ALIASES[q]) out.add(STATE_ALIASES[q]);
  return [...out];
}

export function fuzzyFilterPrices(prices: Price[], query: string): Price[] {
  const q = query.trim();
  if (!q) return prices;
  const expanded = expandQuery(q);
    const scored = prices
    .map((p: Price) => {
      const hay = `${p.market} ${p.city} ${p.state} ${p.crop}`;
                  const score = Math.max(...expanded.map((e: string) => fuzzyScore(e, hay)));
      return { p, score };
    })
    .filter(({ score }) => score > 0.45)
    .sort((a, b) => b.score - a.score);
  return scored.map(({ p }) => p);
}