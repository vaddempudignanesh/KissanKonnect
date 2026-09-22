import { NextRequest, NextResponse } from "next/server";
import { getFarmer } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const farmer = await getFarmer(Number(id));
    if (!farmer) {
      return NextResponse.json({ error: "Farmer not found" }, { status: 404 });
    }
    return NextResponse.json({ farmer });
  } catch (e: any) {
    console.error("[/api/farmers/[id]]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}