import { NextRequest, NextResponse } from "next/server";
import { getFarmer, getFarmers, getBuyer, getBuyers } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");
  const id = searchParams.get("id");

  try {
    if (role === "farmer") {
      const farmer = id
        ? await getFarmer(Number(id))
        : (await getFarmers())[0] ?? null;
      return NextResponse.json({ farmer });
    }
    if (role === "buyer") {
      const buyer = id
        ? await getBuyer(Number(id))
        : (await getBuyers())[0] ?? null;
      return NextResponse.json({ buyer });
    }
    return NextResponse.json({ error: "role required" }, { status: 400 });
  } catch (e: any) {
    console.error("[/api/session]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
