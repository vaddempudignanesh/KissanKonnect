import { NextRequest, NextResponse } from "next/server";
import { withTransaction } from "@/lib/db-client";
import { getOrders, getOrdersForFarmer, getOrdersForBuyer } from "@/lib/db";

// GET /api/orders                      → all orders
// GET /api/orders?farmerId=1           → orders for that farmer
// GET /api/orders?buyerId=2            → orders for that buyer
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const farmerId = searchParams.get("farmerId");
  const buyerId = searchParams.get("buyerId");

  try {
    if (farmerId) {
      const orders = await getOrdersForFarmer(Number(farmerId));
      return NextResponse.json({ orders });
    }
    if (buyerId) {
      const orders = await getOrdersForBuyer(Number(buyerId));
      return NextResponse.json({ orders });
    }
    const orders = await getOrders();
    return NextResponse.json({ orders });
  } catch (e: any) {
    console.error("[/api/orders GET]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/orders   { offerId }
// Accepts an offer and creates an order inside a transaction.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const offerId = Number(body.offerId);
    if (!offerId) {
      return NextResponse.json({ error: "offerId required" }, { status: 400 });
    }

    const order = await withTransaction(async (client) => {
      const { rows: [offer] } = await client.query(`
        SELECT
          o.*,
          l.farmer_id, l.pickup_address,
          b.company_name
        FROM buyer_offers o
        JOIN listings l ON l.id = o.listing_id
        JOIN buyers  b ON b.id = o.buyer_id
        WHERE o.id = $1 AND o.status = 'pending'
        FOR UPDATE
      `, [offerId]);

      if (!offer) throw new Error("Offer not found or already processed");

      const total = Number(offer.offer_price_per_kg) * Number(offer.quantity_kg);
      const fee = +(total * 0.01).toFixed(2);
      const net = +(total - fee).toFixed(2);
      const orderNumber = `ORD-${Date.now()}`;

      const { rows: [ord] } = await client.query(`
        INSERT INTO orders (
          order_number, listing_id, farmer_id, buyer_id, offer_id,
          quantity_kg, price_per_kg, total_amount, platform_fee,
          net_to_farmer, status, payment_status, pickup_address
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'confirmed','escrow',$11)
        RETURNING *
      `, [
        orderNumber, offer.listing_id, offer.farmer_id, offer.buyer_id,
        offer.id, offer.quantity_kg, offer.offer_price_per_kg,
        total, fee, net, offer.pickup_address,
      ]);

      await client.query(
        `UPDATE buyer_offers SET status = 'accepted' WHERE id = $1`,
        [offerId],
      );

      await client.query(
        `UPDATE buyer_offers SET status = 'rejected'
         WHERE listing_id = $1 AND id != $2 AND status = 'pending'`,
        [offer.listing_id, offerId],
      );

      await client.query(
        `UPDATE listings SET status = 'sold' WHERE id = $1`,
        [offer.listing_id],
      );

      await client.query(`
        INSERT INTO order_events (order_id, event_type, description, location_name)
        VALUES ($1, 'confirmed', 'Order confirmed. Awaiting pickup.', $2)
      `, [ord.id, offer.pickup_address]);

      return ord;
    });

    return NextResponse.json({ order });
  } catch (e: any) {
    console.error("[/api/orders POST]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}