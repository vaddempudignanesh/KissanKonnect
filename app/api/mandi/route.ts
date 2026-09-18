// app/api/mandi/route.ts
// PURPOSE: Server-side proxy for the Government of India Mandi Prices API.
//
//   GET /api/mandi?crop=Tomato&state=Delhi&district=New%20Delhi&limit=500
//   GET /api/mandi?crop=all
//   GET /api/mandi?crop=Onion&state=Maharashtra
//
// Behavior:
//   1. Try crop + state + district
//   2. If 0 rows → retry with crop + state (drop district)
//   3. If still 0 → retry with crop only (all India)
//   4. If still 0 → fall back to seed data
//   The user always sees something, and the response includes a `note`
//   explaining what happened.
import { NextRequest, NextResponse } from "next/server";
import { fetchMandiPrices, toGovtStateName } from "@/lib/mandiApi";
import { getPrices, type Crop } from "@/lib/db";

export const runtime = "nodejs";
export const revalidate = 1800;

const VALID_CROPS: Crop[] = ["Tomato", "Onion", "Potato", "Wheat", "Rice"];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const cropParam = searchParams.get("crop") ?? "Tomato";
  const stateRaw  = searchParams.get("state") ?? "";
  const district  = searchParams.get("district") ?? "";
  const limit     = Number(searchParams.get("limit") ?? "500");

  const state = stateRaw ? toGovtStateName(stateRaw) : "";

  try {
    // =========================================================================
    // BULK MODE
    // =========================================================================
    if (cropParam === "all") {
      const [tomato, onion, potato, wheat, rice] = await Promise.all([
        fetchMandiPrices({ crop: "Tomato", limit }),
        fetchMandiPrices({ crop: "Onion",  limit }),
        fetchMandiPrices({ crop: "Potato", limit }),
        fetchMandiPrices({ crop: "Wheat",  limit }),
        fetchMandiPrices({ crop: "Rice",   limit }),
      ]);
      const all = [...tomato, ...onion, ...potato, ...wheat, ...rice];
      if (all.length > 0) {
        return NextResponse.json({
          ok: true, source: "govt",
          fetchedAt: new Date().toISOString(),
          count: all.length, prices: all,
        });
      }
      const seed = await getPrices();
      return NextResponse.json({
        ok: true, source: "seed",
        fetchedAt: new Date().toISOString(),
        count: seed.length, prices: seed,
      });
    }

    // =========================================================================
    // SINGLE CROP — 3-tier fallback
    // =========================================================================
    const crop: Crop = VALID_CROPS.includes(cropParam as Crop)
      ? (cropParam as Crop)
      : "Tomato";

    console.log(
      `[/api/mandi] crop=${crop} state=${state || "any"} district=${district || "any"} limit=${limit}`,
    );

    // -------- Attempt 1: crop + state + district --------
    let prices = await fetchMandiPrices({
      crop,
      state: state || undefined,
      district: district !== "All" && district ? district : undefined,
      limit,
    });
    let note: string | undefined;

    // -------- Attempt 2: drop district, retry with state --------
    if (prices.length === 0 && district && district !== "All" && state) {
      console.log(
        `[/api/mandi] district=${district} returned 0 — retrying without district`,
      );
      prices = await fetchMandiPrices({ crop, state, limit });
      if (prices.length > 0) {
        note = `No ${crop} arrivals in ${district} today — showing nearby mandis across ${state}.`;
      }
    }

    // -------- Attempt 3: drop state too, retry all India --------
    if (prices.length === 0 && state) {
      console.log(
        `[/api/mandi] state=${state} returned 0 — retrying across all India`,
      );
      prices = await fetchMandiPrices({ crop, limit });
      if (prices.length > 0) {
        note = `No ${crop} arrivals in ${state} today — showing all-India mandis.`;
      }
    }

    if (prices.length > 0) {
      return NextResponse.json({
        ok: true, source: "govt",
        fetchedAt: new Date().toISOString(),
        count: prices.length, prices, note,
      });
    }

    // -------- Attempt 4: seed fallback --------
    console.warn(
      `[/api/mandi] 0 rows from govt for ${crop} — falling back to seed`,
    );
    const seed = await getPrices(crop);
    return NextResponse.json({
      ok: true, source: "seed",
      fetchedAt: new Date().toISOString(),
      count: seed.length, prices: seed,
      note: `No live ${crop} data available right now — showing cached sample data.`,
    });
  } catch (err) {
    console.error("[/api/mandi] unhandled error:", err);
    const seed = await getPrices();
    return NextResponse.json(
      {
        ok: false, source: "seed",
        fetchedAt: new Date().toISOString(),
        count: seed.length, prices: seed,
        error: String(err),
      },
      { status: 200 },
    );
  }
}