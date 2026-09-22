import { NextRequest, NextResponse } from "next/server";
import { getOffersForListing, createOffer } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const listingId = searchParams.get("listingId");
  if (!listingId) {
    return NextResponse.json({ error: "listingId required" }, { status: 400 });
  }
  try {
    const offers = await getOffersForListing(Number(listingId));
    return NextResponse.json({ offers });
  } catch (e: any) {
    console.error("[/api/offers GET]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const offer = await createOffer({
      listingId: body.listingId,
      buyerId: body.buyerId,
      pricePerKg: body.pricePerKg,
      quantityKg: body.quantityKg,
      message: body.message,
    });
    return NextResponse.json({ offer });
  } catch (e: any) {
    console.error("[/api/offers POST]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
