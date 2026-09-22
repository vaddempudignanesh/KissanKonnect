import { NextResponse } from "next/server";
import { query } from "@/lib/db-client";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET() {
  try {
    const [cropRows, stateRows, districtRows] = await Promise.all([
      query<{ commodity: string; count: number }>(`
        SELECT commodity, COUNT(*)::int AS count
        FROM mandi_records
        GROUP BY commodity
        ORDER BY COUNT(*) DESC, commodity ASC
      `),
      query<{ state: string; count: number }>(`
        SELECT state, COUNT(*)::int AS count
        FROM mandi_records
        GROUP BY state
        ORDER BY COUNT(*) DESC, state ASC
      `),
      query<{ state: string; district: string; count: number }>(`
        SELECT state, district, COUNT(*)::int AS count
        FROM mandi_records
        GROUP BY state, district
        ORDER BY state ASC, COUNT(*) DESC, district ASC
      `),
    ]);

    // Group districts by state → { "Maharashtra": ["Nashik", "Pune", ...], ... }
    const districtsByState: Record<string, string[]> = {};
    for (const row of districtRows) {
      if (!districtsByState[row.state]) districtsByState[row.state] = [];
      districtsByState[row.state].push(row.district);
    }

    return NextResponse.json({
      ok: true,
      crops: cropRows.map((r) => r.commodity),
      cropCounts: Object.fromEntries(cropRows.map((r) => [r.commodity, r.count])),
      states: stateRows.map((r) => r.state),
      stateCounts: Object.fromEntries(stateRows.map((r) => [r.state, r.count])),
      districtsByState,
    });
  } catch (e: any) {
    console.error("[/api/mandi/crops]", e);
    return NextResponse.json(
      { ok: false, error: e.message, crops: [], states: [], districtsByState: {} },
      { status: 500 },
    );
  }
}