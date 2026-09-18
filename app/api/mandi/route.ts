// app/api/mandi/route.ts
import { NextResponse } from "next/server";
import { getPrices } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const crop = searchParams.get("crop") || "Tomato";
  const state = searchParams.get("state");
  const district = searchParams.get("district");
  const limit = parseInt(searchParams.get("limit") || "500", 10);

  try {
    // Fetch base records from your DB or external AGMARKNET API
    let prices = await getPrices({ crop: crop === "All" ? undefined : crop });

    // Filter dynamically based on query params sent from frontend
    if (state) {
      prices = prices.filter(p => p.state.toLowerCase() === state.toLowerCase());
    }
    if (district && district !== "All") {
      prices = prices.filter(p => p.city.toLowerCase().includes(district.toLowerCase()));
    }

    return NextResponse.json({
      source: "govt",
      prices: prices.slice(0, limit)
    });
  } catch (error) {
    return NextResponse.json({ source: "seed", prices: [] }, { status: 500 });
  }
}