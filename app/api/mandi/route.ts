// app/api/mandi/route.ts
// -----------------------------------------------------------------------------
// PURPOSE: Server-side proxy for the government mandi prices API.
//          Keeps the API key server-side and applies a 30-minute cache.
//
// GET /api/mandi?crop=Tomato&state=Maharashtra&limit=100
// GET /api/mandi?crop=all
// -----------------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";
import { fetchMandiPrices, fetchAllCrops } from "@/lib/mandiApi";
import { getPrices, type Crop } from "@/lib/db";

export const runtime = "nodejs";
// Cache at the CDN/Next.js level for 30 min; serve stale for up to 5 min more.
export const revalidate = 1800;

const VALID_CROPS: Crop[] = ["Tomato", "Onion", "Potato", "Wheat", "Rice"];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cropParam = searchParams.get("crop") ?? "Tomato";
  const state = searchParams.get("state") ?? undefined;
  const limit = Number(searchParams.get("limit") ?? "100");

  try {
    // Fetch all crops
    if (cropParam === "all") {
      const prices = await fetchAllCrops();
      if (prices.length > 0) {
        return NextResponse.json({ ok: true, source: "govt", prices });
      }
      // Fallback to seed
      const seed = await getPrices();
      return NextResponse.json({ ok: true, source: "seed", prices: seed });
    }

    // Fetch one crop
    const crop = VALID_CROPS.includes(cropParam as Crop)
      ? (cropParam as Crop)
      : "Tomato";

    const prices = await fetchMandiPrices({ crop, state, limit });
    if (prices.length > 0) {
      return NextResponse.json({ ok: true, source: "govt", prices });
    }

    // Fallback: seed data for this crop
    const seed = await getPrices(crop);
    return NextResponse.json({ ok: true, source: "seed", prices: seed });
  } catch (err) {
    console.error("[/api/mandi] error:", err);
    // Last-resort fallback so /market never looks broken
    const seed = await getPrices();
    return NextResponse.json(
      { ok: false, source: "seed", prices: seed, error: String(err) },
      { status: 200 },
    );
  }
}