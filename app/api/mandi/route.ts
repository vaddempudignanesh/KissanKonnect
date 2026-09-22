import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db-client";
import { calculateDistance } from "@/lib/utils";

export const runtime = "nodejs";
export const revalidate = 0;

const STATE_COORDS: Record<string, { lat: number; lng: number }> = {
  "Maharashtra":       { lat: 19.75, lng: 75.71 },
  "Delhi":             { lat: 28.61, lng: 77.20 },
  "Karnataka":         { lat: 12.97, lng: 77.59 },
  "Telangana":         { lat: 17.38, lng: 78.48 },
  "Tamil Nadu":        { lat: 13.08, lng: 80.27 },
  "Kerala":            { lat: 8.52,  lng: 76.93 },
  "Keralam":           { lat: 8.52,  lng: 76.93 },
  "Gujarat":           { lat: 23.02, lng: 72.57 },
  "Rajasthan":         { lat: 26.91, lng: 75.79 },
  "Punjab":            { lat: 30.90, lng: 75.85 },
  "Haryana":           { lat: 29.06, lng: 76.08 },
  "Uttar Pradesh":     { lat: 26.85, lng: 80.95 },
  "Madhya Pradesh":    { lat: 23.25, lng: 77.41 },
  "West Bengal":       { lat: 22.57, lng: 88.36 },
  "Andhra Pradesh":    { lat: 17.68, lng: 83.21 },
  "Odisha":            { lat: 20.29, lng: 85.82 },
  "Bihar":             { lat: 25.59, lng: 85.13 },
  "Jharkhand":         { lat: 23.34, lng: 85.31 },
  "Chhattisgarh":      { lat: 21.25, lng: 81.62 },
  "Assam":             { lat: 26.14, lng: 91.73 },
  "Uttarakhand":       { lat: 30.31, lng: 78.03 },
  "Himachal Pradesh":  { lat: 31.10, lng: 77.17 },
  "Goa":               { lat: 15.49, lng: 73.82 },
  "Puducherry":        { lat: 11.93, lng: 79.83 },
  "Chandigarh":        { lat: 30.73, lng: 76.77 },
  "Jammu and Kashmir": { lat: 33.78, lng: 78.10 },
  "Ladakh":            { lat: 34.15, lng: 77.57 },
};
const ORIGIN = { lat: 19.9975, lng: 73.7898 };

interface DbRow {
  state: string;
  district: string;
  market: string;
  commodity: string;
  arrival_date: string;
  min_price: number;
  max_price: number;
  modal_price: number;
}

interface Price {
  id: string;
  crop: string;
  market: string;
  city: string;
  state: string;
  price: number;
  distanceKm: number;
  trend: "up" | "down" | "flat";
  updatedAt: string;
}

function toPrice(row: DbRow, idx: number): Price {
  const coords = STATE_COORDS[row.state] ?? { lat: 20, lng: 78 };
  const distanceKm = calculateDistance(ORIGIN.lat, ORIGIN.lng, coords.lat, coords.lng);

  const spread = Number(row.max_price) - Number(row.min_price);
  const mid = (Number(row.min_price) + Number(row.max_price)) / 2;
  const modal = Number(row.modal_price);
  let trend: "up" | "down" | "flat" = "flat";
  if (mid > 0 && spread / mid > 0.15) trend = modal >= mid ? "up" : "down";
  else if (spread > 0 && modal === Number(row.max_price)) trend = "up";
  else if (spread > 0 && modal === Number(row.min_price)) trend = "down";

  return {
    id: `db-${idx}-${row.market}-${row.commodity}`.replace(/\s+/g, "-"),
    crop: row.commodity,
    market: row.market,
    city: row.district,
    state: row.state,
    price: Math.round((Number(row.modal_price) / 100) * 100) / 100,
    distanceKm,
    trend,
    updatedAt: new Date(row.arrival_date).toISOString(),
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const crop     = searchParams.get("crop") ?? "";
  const state    = searchParams.get("state") ?? "";
  const district = searchParams.get("district") ?? "";
  const q        = searchParams.get("q") ?? "";
  const limit    = Math.min(Number(searchParams.get("limit") ?? 1000), 2000);

  // Debug: log exactly what came in
  console.log("[/api/mandi] params:", { crop, state, district, q, limit });

  try {
    const params: any[] = [];
    const conditions: string[] = [];

    if (crop && crop !== "All" && crop !== "all") {
      params.push(crop);
      conditions.push(`commodity = $${params.length}`);
    }

    if (state && state !== "All") {
      params.push(state);
      conditions.push(`state = $${params.length}`);
    }

    if (district && district !== "All") {
      params.push(district);
      conditions.push(`district = $${params.length}`);
    }

    if (q.trim()) {
      params.push(`%${q.trim()}%`);
      const p = params.length;
      conditions.push(
        `(state ILIKE $${p} OR district ILIKE $${p} OR market ILIKE $${p} OR commodity ILIKE $${p})`,
      );
    }

    const whereSql = conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    params.push(limit);

    const sql = `
      SELECT state, district, market, commodity, arrival_date,
             min_price, max_price, modal_price
      FROM mandi_records
      ${whereSql}
      ORDER BY arrival_date DESC, modal_price DESC
      LIMIT $${params.length}
    `;

    console.log("[/api/mandi] sql:", sql);
    console.log("[/api/mandi] params:", params);

    const rows = await query<DbRow>(sql, params);
    const prices = rows.map((r, i) => toPrice(r, i));

    console.log(`[/api/mandi] returned ${prices.length} rows`);

    return NextResponse.json({
      ok: true,
      source: "db",
      fetchedAt: new Date().toISOString(),
      count: prices.length,
      prices,
    });
  } catch (e: any) {
    console.error("[/api/mandi]", e);
    return NextResponse.json(
      { ok: false, error: e.message, prices: [] },
      { status: 500 },
    );
  }
}