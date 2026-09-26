import { NextRequest, NextResponse } from "next/server";
import { getListings, createListing, getListing } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  try {
    if (id) {
      const listing = await getListing(Number(id));
      return NextResponse.json({ listing });
    }
    const listings = await getListings();
    return NextResponse.json({ listings });
  } catch (e: any) {
    console.error("[/api/listings GET]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const listing = await createListing({
      farmerId: body.farmerId,
      cropId: body.cropId,
      crop: body.crop,                    // ← THE FIX — forward crop name
      quantityKg: body.quantityKg,
      qualityGrade: body.qualityGrade,
      expectedPrice: body.expectedPrice,
      description: body.description,
      pickupAddress: body.pickupAddress,
      latitude: body.latitude,
      longitude: body.longitude,
      // also forward these if present (unused for now, but future-proof)
      village: body.village,
      district: body.district,
      state: body.state,
      photo: body.photo,
    });

    return NextResponse.json({ listing });
  } catch (e: any) {
    console.error("[/api/listings POST]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}