import { NextRequest, NextResponse } from "next/server";
import { getBuyer } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const buyer = await getBuyer(Number(id));
    if (!buyer) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    }
    return NextResponse.json({ buyer });
  } catch (e: any) {
    console.error("[/api/buyers/[id]]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}