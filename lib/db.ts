import 'server-only';
import { query, queryOne } from './db-client';
import { calculateDistance } from './utils';
import type {
  Crop, DbFarmer, DbBuyer, DbPrice, DbListing, DbOffer, DbOrder, DbOrderEvent, Truck,
  DbLogistics, DbFpo,
} from './types';

export const CROP_EMOJI: Record<Crop, string> = {
  Tomato: '🍅', Onion: '🧅', Potato: '🥔',
  Wheat: '🌾', Rice: '🍚', Sugarcane: '🎋', Cotton: '🌱', Soybean: '🫘',
};

const BUYER_COLORS: Record<string, string> = {
  'Reliance Fresh': '#003DA5',
  'BigBasket':      '#84C225',
  'ITC Foods':      '#003A70',
  'ITC Agri':       '#003A70',
  'Amazon Fresh':   '#FF9900',
};

function buyerAvatar(type: string): string {
  if (type === 'exporter') return '✈️';
  if (type === 'hotel')    return '🏨';
  if (type === 'local')    return '🏪';
  return '🏢';
}

function buyerTypeLabel(type: string): string {
  if (type === 'mnc') return 'MNC';
  if (type === 'exporter') return 'Export';
  if (type === 'local') return 'Local';
  if (type === 'hotel') return 'Hotel';
  if (type === 'mandi') return 'Mandi';
  return type;
}

// ---------------------------------------------------------------------------
// FARMERS
// ---------------------------------------------------------------------------
export async function getFarmers(): Promise<DbFarmer[]> {
  const rows = await query<any>(`
    SELECT f.*, u.name, u.phone
    FROM farmers f
    JOIN users u ON u.id = f.user_id
    ORDER BY f.id
  `);
  return rows.map(r => ({
    ...r,
    latitude:  Number(r.latitude),
    longitude: Number(r.longitude),
    land_size_acres: Number(r.land_size_acres),
    rating: Number(r.rating),
    avatar: '🧑‍🌾',
  }));
}

export async function getFarmer(id: string | number): Promise<DbFarmer | null> {
  const row = await queryOne<any>(`
    SELECT f.*, u.name, u.phone
    FROM farmers f
    JOIN users u ON u.id = f.user_id
    WHERE f.id = $1
  `, [id]);
  if (!row) return null;
  return {
    ...row,
    latitude:  Number(row.latitude),
    longitude: Number(row.longitude),
    land_size_acres: Number(row.land_size_acres),
    rating: Number(row.rating),
    avatar: '🧑‍🌾',
  };
}

// ---------------------------------------------------------------------------
// BUYERS
// ---------------------------------------------------------------------------
function mapBuyer(r: any): DbBuyer {
  const type = buyerTypeLabel(r.buyer_type);
  return {
    ...r,
    name: r.company_name,          // UI alias
    type,                          // UI alias
    latitude:  Number(r.latitude),
    longitude: Number(r.longitude),
    rating: Number(r.rating),
    distanceKm: 0,                 // computed later when needed
    avatar: buyerAvatar(r.buyer_type),
    logoColor: BUYER_COLORS[r.company_name] ?? '#0F766E',
  };
}

export async function getBuyers(): Promise<DbBuyer[]> {
  const rows = await query<any>(`SELECT * FROM buyers ORDER BY id`);
  return rows.map(mapBuyer);
}

export async function getBuyer(id: string | number): Promise<DbBuyer | null> {
  const row = await queryOne<any>(`SELECT * FROM buyers WHERE id = $1`, [id]);
  return row ? mapBuyer(row) : null;
}

// ---------------------------------------------------------------------------
// PRICES
// ---------------------------------------------------------------------------
const ORIGIN = { lat: 19.9975, lng: 73.7898 };

export async function getPrices(crop?: Crop): Promise<DbPrice[]> {
  const params: any[] = [];
  let filter = '';
  if (crop) {
    filter = 'AND c.name = $1';
    params.push(crop);
  }

  const rows = await query<any>(`
    SELECT
      mp.id,
      c.name AS crop,
      m.name AS market,
      m.state AS state,
      m.latitude, m.longitude,
      mp.price_per_kg,
      mp.recorded_date
    FROM mandi_prices mp
    JOIN crops   c ON c.id = mp.crop_id
    JOIN markets m ON m.id = mp.market_id
    WHERE mp.recorded_date = (
      SELECT MAX(recorded_date) FROM mandi_prices
    )
    ${filter}
    ORDER BY mp.price_per_kg DESC
  `, params);

  return rows.map(r => {
    const distanceKm = calculateDistance(
      ORIGIN.lat, ORIGIN.lng,
      Number(r.latitude), Number(r.longitude),
    );
    return {
      id: `P-${r.id}`,
      crop: r.crop as Crop,
      market: r.market,
      city: r.market.replace(/ (Mandi|APMC).*$/, ''),
      state: r.state,
      price: Number(r.price_per_kg),
      distanceKm,
      trend: 'flat' as const,
      updatedAt: r.recorded_date,
    };
  });
}

export function getLocalMandiRate(_crop: Crop): number {
  return 18;
}

// ---------------------------------------------------------------------------
// LISTINGS
// ---------------------------------------------------------------------------
function mapListing(r: any): DbListing {
  const quantityKg = Number(r.quantity_kg);
  const expectedPrice = Number(r.expected_price_per_kg);
  return {
    ...r,
    quantity_kg: quantityKg,
    expected_price_per_kg: expectedPrice,
    latitude:  r.latitude  ? Number(r.latitude)  : null,
    longitude: r.longitude ? Number(r.longitude) : null,
    photo: CROP_EMOJI[r.crop as Crop] ?? '🌱',
    // UI aliases
    farmerId: r.farmer_id,
    quantityKg,
    quality: r.quality_grade,
    expectedPrice,
  };
}

export async function getListings(): Promise<DbListing[]> {
  const rows = await query<any>(`
    SELECT
      l.*,
      c.name AS crop,
      u.name AS farmer_name,
      f.village, f.district, f.state
    FROM listings l
    JOIN crops   c ON c.id = l.crop_id
    JOIN farmers f ON f.id = l.farmer_id
    JOIN users   u ON u.id = f.user_id
    WHERE l.status = 'active'
    ORDER BY l.created_at DESC
  `);
  return rows.map(mapListing);
}

export async function getListing(id: string | number): Promise<DbListing | null> {
  const row = await queryOne<any>(`
    SELECT
      l.*,
      c.name AS crop,
      u.name AS farmer_name,
      f.village, f.district, f.state
    FROM listings l
    JOIN crops   c ON c.id = l.crop_id
    JOIN farmers f ON f.id = l.farmer_id
    JOIN users   u ON u.id = f.user_id
    WHERE l.id = $1
  `, [id]);
  return row ? mapListing(row) : null;
}

export async function createListing(input: {
  farmerId: number;
  cropId: number;
  quantityKg: number;
  qualityGrade: 'A' | 'B' | 'C';
  expectedPrice: number;
  description?: string;
  photoUrl?: string;
  pickupAddress?: string;
  latitude?: number;
  longitude?: number;
  // UI-friendly alternates accepted too
  crop?: Crop;
  quantity?: number;
  quality?: 'A' | 'B' | 'C';
  village?: string;
  district?: string;
  state?: string;
  photo?: string;
}): Promise<DbListing> {
  // If caller passed crop name instead of cropId, resolve it.
    // If caller passed crop name instead of cropId, resolve it.
  let cropId = input.cropId;
  if (!cropId && input.crop) {
    const row = await queryOne<any>(`SELECT id FROM crops WHERE name = $1`, [input.crop]);
    if (!row) throw new Error(`Unknown crop: ${input.crop}`);
    cropId = row.id;
  }

  // Guard: crop_id is NOT NULL in the schema — reject if neither was provided
  if (!cropId) {
    throw new Error(
      `crop_id is required. Got cropId=${input.cropId}, crop=${input.crop}`,
    );
  }

  const quantityKg = input.quantityKg ?? input.quantity ?? 0;
  const qualityGrade = input.qualityGrade ?? input.quality ?? 'A';
  const expectedPrice = input.expectedPrice ?? 0;
  const pickupAddress = input.pickupAddress
    ?? [input.village, input.district, input.state].filter(Boolean).join(', ');

  const row = await queryOne<any>(`
    INSERT INTO listings
      (farmer_id, crop_id, quantity_kg, quality_grade,
       expected_price_per_kg, description, photo_url,
       pickup_address, latitude, longitude)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *
  `, [
    input.farmerId, cropId, quantityKg, qualityGrade,
    expectedPrice, input.description ?? null, input.photoUrl ?? null,
    pickupAddress || null, input.latitude ?? null, input.longitude ?? null,
  ]);
  return mapListing(row);
}

// ---------------------------------------------------------------------------
// OFFERS
// ---------------------------------------------------------------------------
export async function getOffersForListing(listingId: string | number): Promise<DbOffer[]> {
  const rows = await query<any>(`
    SELECT
      o.*,
      b.company_name, b.buyer_type, b.city, b.state,
      b.latitude, b.longitude, b.rating
    FROM buyer_offers o
    JOIN buyers b ON b.id = o.buyer_id
    WHERE o.listing_id = $1
    ORDER BY o.offer_price_per_kg DESC
  `, [listingId]);

  const listing = await getListing(listingId);

  return rows.map(r => ({
    ...r,
    offer_price_per_kg: Number(r.offer_price_per_kg),
    quantity_kg: Number(r.quantity_kg),
    rating: Number(r.rating),
    avatar: buyerAvatar(r.buyer_type),
    logoColor: BUYER_COLORS[r.company_name] ?? '#0F766E',
    distance_km:
      listing?.latitude && r.latitude
        ? calculateDistance(
            listing.latitude, listing.longitude ?? 0,
            Number(r.latitude), Number(r.longitude),
          )
        : null,
    // UI aliases
    buyerId: r.buyer_id,
    pricePerKg: Number(r.offer_price_per_kg),
  }));
}

export async function createOffer(input: {
  listingId: number;
  buyerId: number;
  pricePerKg: number;
  quantityKg: number;
  message?: string;
}): Promise<DbOffer> {
  const row = await queryOne<any>(`
    INSERT INTO buyer_offers
      (listing_id, buyer_id, offer_price_per_kg, quantity_kg, message)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *
  `, [
    input.listingId, input.buyerId,
    input.pricePerKg, input.quantityKg, input.message ?? null,
  ]);
  return {
    ...row,
    offer_price_per_kg: Number(row.offer_price_per_kg),
    quantity_kg: Number(row.quantity_kg),
    buyerId: row.buyer_id,
    pricePerKg: Number(row.offer_price_per_kg),
  };
}

// ---------------------------------------------------------------------------
// ORDERS
// ---------------------------------------------------------------------------
function synthTruck(order: any): Truck {
  const route = [
    { name: order.pickup_address || 'Farm', lat: 19.99, lng: 73.78, reached: true },
    { name: order.delivery_address || 'Buyer', lat: 28.61, lng: 77.20, reached: false },
  ];
  return {
    id: `T-${order.id}`,
    number: order.truck_number || 'MH-12-XX-0000',
    driverName: order.driver_name || 'To be assigned',
    driverPhone: order.driver_phone || '—',
    currentStopIndex: order.status === 'in_transit' ? 1 : 0,
    route,
  };
}

function mapOrder(r: any): DbOrder {
  const quantityKg = Number(r.quantity_kg);
  const totalAmount = Number(r.total_amount);
  const netToFarmer = Number(r.net_to_farmer);
  return {
    ...r,
    id: r.order_number,           // UI uses order_number as id
    quantity_kg: quantityKg,
    price_per_kg: Number(r.price_per_kg),
    total_amount: totalAmount,
    platform_fee: Number(r.platform_fee),
    net_to_farmer: netToFarmer,
    truck: synthTruck(r),
    cropEmoji: r.crop_name ? CROP_EMOJI[r.crop_name as Crop] : undefined,
    // UI aliases
    farmerId: r.farmer_id,
    buyerId: r.buyer_id,
    quantityKg,
    totalAmount,
    netToFarmer,
  };
}

export async function getOrders(): Promise<DbOrder[]> {
  const rows = await query<any>(`
    SELECT
      o.*,
      c.name AS crop_name,
      uf.name AS farmer_name,
      b.company_name
    FROM orders o
    JOIN listings l ON l.id = o.listing_id
    JOIN crops    c ON c.id = l.crop_id
    JOIN farmers  f ON f.id = o.farmer_id
    JOIN users   uf ON uf.id = f.user_id
    JOIN buyers   b ON b.id = o.buyer_id
    ORDER BY o.created_at DESC
  `);
  return rows.map(mapOrder);
}

export async function getOrder(id: string | number): Promise<DbOrder | null> {
  const row = await queryOne<any>(`
    SELECT
      o.*,
      c.name AS crop_name,
      uf.name AS farmer_name,
      b.company_name
    FROM orders o
    JOIN listings l ON l.id = o.listing_id
    JOIN crops    c ON c.id = l.crop_id
    JOIN farmers  f ON f.id = o.farmer_id
    JOIN users   uf ON uf.id = f.user_id
    JOIN buyers   b ON b.id = o.buyer_id
    WHERE o.order_number = $1 OR o.id::text = $1
  `, [id]);
  return row ? mapOrder(row) : null;
}

export async function getOrdersForFarmer(farmerId: number): Promise<DbOrder[]> {
  const rows = await query<any>(`
    SELECT o.*, c.name AS crop_name, b.company_name
    FROM orders o
    JOIN listings l ON l.id = o.listing_id
    JOIN crops    c ON c.id = l.crop_id
    JOIN buyers   b ON b.id = o.buyer_id
    WHERE o.farmer_id = $1
    ORDER BY o.created_at DESC
  `, [farmerId]);
  return rows.map(mapOrder);
}

export async function getOrdersForBuyer(buyerId: number): Promise<DbOrder[]> {
  const rows = await query<any>(`
    SELECT o.*, c.name AS crop_name, uf.name AS farmer_name
    FROM orders o
    JOIN listings l ON l.id = o.listing_id
    JOIN crops    c ON c.id = l.crop_id
    JOIN farmers  f ON f.id = o.farmer_id
    JOIN users   uf ON uf.id = f.user_id
    WHERE o.buyer_id = $1
    ORDER BY o.created_at DESC
  `, [buyerId]);
  return rows.map(mapOrder);
}

export async function getOrderEvents(orderId: number): Promise<DbOrderEvent[]> {
  return await query<DbOrderEvent>(`
    SELECT * FROM order_events WHERE order_id = $1 ORDER BY created_at ASC
  `, [orderId]);
}


// ---------------------------------------------------------------------------
// BACKWARD-COMPAT TYPE RE-EXPORTS
// ---------------------------------------------------------------------------
// Old pages and components still import { Order, Listing, Buyer, Price, Crop,
// Farmer, Offer, Truck } from "@/lib/db". These types now live in lib/types.ts
// with a `Db` prefix. Re-exporting here keeps every existing import working
// with zero page edits.
// ---------------------------------------------------------------------------
export type {
  Crop,
  DbFarmer     as Farmer,
  DbBuyer      as Buyer,
  DbLogistics  as Logistics,
  DbFpo        as Fpo,
  DbPrice      as Price,
  DbListing    as Listing,
  DbOffer      as Offer,
  DbOrder      as Order,
  DbOrderEvent as OrderEvent,
  Truck,
} from './types';



// ---------------------------------------------------------------------------
// createOrder — convenience: accept an offer → create an order (client-side).
// The transactional version lives in app/api/orders/route.ts. This is a thin
// wrapper that pages/components (BuyerOfferCard, buyer/listings) can import
// without needing to know about the API.
// ---------------------------------------------------------------------------
export async function createOrder(input: {
  listingId: number;
  buyerId: number;
  pricePerKg: number;
  quantityKg: number;
  message?: string;
}): Promise<DbOrder> {
  // 1. Create the offer
  const offer = await createOffer({
    listingId: input.listingId,
    buyerId: input.buyerId,
    pricePerKg: input.pricePerKg,
    quantityKg: input.quantityKg,
    message: input.message,
  });

  // 2. Accept it (transactionally) via the API
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ offerId: offer.id }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Could not create order");
  }
  const { order } = await res.json();
  return mapOrder(order);
}

// ---------------------------------------------------------------------------
// LOGISTICS
// ---------------------------------------------------------------------------
export async function getLogistics(id: number | string): Promise<DbLogistics | null> {
  const row = await queryOne<any>(
    `SELECT * FROM logistics_profiles WHERE id = $1`, [id],
  );
  if (!row) return null;
  return {
    ...row,
    name: row.company_name,
    vehicle_count: Number(row.vehicle_count),
    service_radius: Number(row.service_radius),
    rating: Number(row.rating),
    avatar: '🚚',
    logoColor: '#0F766E',
  };
}

// ---------------------------------------------------------------------------
// FPO
// ---------------------------------------------------------------------------
export async function getFpo(id: number | string): Promise<DbFpo | null> {
  const row = await queryOne<any>(
    `SELECT * FROM fpo_profiles WHERE id = $1`, [id],
  );
  if (!row) return null;
  return {
    ...row,
    name: row.fpo_name,
    member_count: Number(row.member_count),
    rating: Number(row.rating),
    avatar: '🏘️',
    logoColor: '#7C3AED',
  };
}
