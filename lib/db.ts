// lib/db.ts
// -----------------------------------------------------------------------------
// PURPOSE:
//   This is the SINGLE SOURCE OF TRUTH for all data in the app.
//   Right now it's an in-memory store with seed data so the SIH demo works
//   with zero setup (no Postgres, no migrations, no .env).
//
//   WHEN YOU'RE READY FOR POSTGRES:
//   Replace the body of this file with Prisma/Postgres calls. Every function
//   below keeps the SAME SIGNATURE, so no page or component needs to change.
// -----------------------------------------------------------------------------

// ----- Types (these match what Postgres tables will look like later) -----

export type Crop = "Tomato" | "Onion" | "Potato" | "Wheat" | "Rice";

export interface Farmer {
  id: string;
  name: string;
  village: string;
  district: string;
  state: string;
  phone: string;
  avatar: string;      // emoji for demo, real URL later
  rating: number;
  totalSales: number;  // in ₹
}

export interface Buyer {
  id: string;
  name: string;         // "Reliance Fresh", "BigBasket", etc.
  type: "MNC" | "Local" | "Export";
  city: string;
  state: string;
  distanceKm: number;   // distance from farmer (demo value)
  avatar: string;
  rating: number;
  logoColor: string;    // hex, for brand-like tile
}

export interface Price {
  id: string;
  crop: Crop;
  market: string;       // "Pune Mandi"
  city: string;
  state: string;
  price: number;        // ₹ per kg
  distanceKm: number;
  trend: "up" | "down" | "flat";
  updatedAt: string;    // ISO
}

export interface Listing {
  id: string;
  farmerId: string;
  crop: Crop;
  quantityKg: number;
  quality: "A" | "B" | "C";
  expectedPrice: number; // ₹ per kg
  village: string;
  district: string;
  state: string;
  photo: string;         // emoji for demo
  createdAt: string;
  status: "open" | "matched" | "shipped" | "delivered";
}

export interface Offer {
  id: string;
  listingId: string;
  buyerId: string;
  pricePerKg: number;
  quantityKg: number;
  message: string;
  createdAt: string;
  status: "pending" | "accepted" | "rejected";
}

export interface Order {
  id: string;
  listingId: string;
  farmerId: string;
  buyerId: string;
  crop: Crop;
  quantityKg: number;
  pricePerKg: number;
  totalAmount: number;
  platformFee: number;   // 1%
  netToFarmer: number;
  status: "confirmed" | "picked_up" | "in_transit" | "delivered" | "paid";
  pickupAt: string;
  deliveryEta: string;
  truck: Truck;
}

export interface Truck {
  id: string;
  number: string;        // "MH-12-AB-1234"
  driverName: string;
  driverPhone: string;
  route: { name: string; lat: number; lng: number; reached: boolean }[];
  currentStopIndex: number;
}

// ----- Seed data -----

const farmers: Farmer[] = [
  { id: "F1", name: "Rajesh Patil", village: "Nashik", district: "Nashik", state: "Maharashtra", phone: "9876543210", avatar: "🧑‍🌾", rating: 4.8, totalSales: 245000 },
  { id: "F2", name: "Sunita Devi", village: "Karnal", district: "Karnal", state: "Haryana", phone: "9876500001", avatar: "👩‍🌾", rating: 4.9, totalSales: 512000 },
  { id: "F3", name: "Mohan Reddy", village: "Warangal", district: "Warangal", state: "Telangana", phone: "9876500002", avatar: "🧑‍🌾", rating: 4.6, totalSales: 128000 },
  { id: "F4", name: "Lakshmi Iyer", village: "Thanjavur", district: "Thanjavur", state: "Tamil Nadu", phone: "9876500003", avatar: "👩‍🌾", rating: 4.7, totalSales: 310000 },
  { id: "F5", name: "Gurpreet Singh", village: "Ludhiana", district: "Ludhiana", state: "Punjab", phone: "9876500004", avatar: "🧑‍🌾", rating: 4.9, totalSales: 680000 },
];

const buyers: Buyer[] = [
  { id: "B1", name: "Reliance Fresh", type: "MNC", city: "Delhi", state: "Delhi", distanceKm: 1200, avatar: "🏢", rating: 4.9, logoColor: "#003DA5" },
  { id: "B2", name: "BigBasket", type: "MNC", city: "Mumbai", state: "Maharashtra", distanceKm: 150, avatar: "🏢", rating: 4.7, logoColor: "#84C225" },
  { id: "B3", name: "ITC Agri", type: "MNC", city: "Pune", state: "Maharashtra", distanceKm: 90, avatar: "🏢", rating: 4.6, logoColor: "#003A70" },
  { id: "B4", name: "Amazon Fresh", type: "MNC", city: "Delhi", state: "Delhi", distanceKm: 1200, avatar: "🏢", rating: 4.8, logoColor: "#FF9900" },
  { id: "B5", name: "Hotel Grand Nashik", type: "Local", city: "Nashik", state: "Maharashtra", distanceKm: 10, avatar: "🏨", rating: 4.5, logoColor: "#8B0000" },
  { id: "B6", name: "Dubai Fresh Exports", type: "Export", city: "Dubai", state: "UAE", distanceKm: 1900, avatar: "✈️", rating: 4.7, logoColor: "#006400" },
];

const prices: Price[] = [
  { id: "P1", crop: "Tomato", market: "Pune Mandi", city: "Pune", state: "Maharashtra", price: 17, distanceKm: 50, trend: "up", updatedAt: new Date().toISOString() },
  { id: "P2", crop: "Tomato", market: "Mumbai Mandi", city: "Mumbai", state: "Maharashtra", price: 18, distanceKm: 80, trend: "flat", updatedAt: new Date().toISOString() },
  { id: "P3", crop: "Tomato", market: "Nashik Mandi", city: "Nashik", state: "Maharashtra", price: 15, distanceKm: 90, trend: "down", updatedAt: new Date().toISOString() },
  { id: "P4", crop: "Tomato", market: "Azadpur Mandi", city: "Delhi", state: "Delhi", price: 22, distanceKm: 1200, trend: "up", updatedAt: new Date().toISOString() },
  { id: "P5", crop: "Tomato", market: "Yeshwanthpur", city: "Bangalore", state: "Karnataka", price: 20, distanceKm: 900, trend: "up", updatedAt: new Date().toISOString() },
  { id: "P6", crop: "Tomato", market: "Bowenpally", city: "Hyderabad", state: "Telangana", price: 19, distanceKm: 700, trend: "flat", updatedAt: new Date().toISOString() },
  { id: "P7", crop: "Tomato", market: "Koyambedu", city: "Chennai", state: "Tamil Nadu", price: 18, distanceKm: 1100, trend: "down", updatedAt: new Date().toISOString() },
  { id: "P8", crop: "Tomato", market: "Sealdah", city: "Kolkata", state: "West Bengal", price: 17, distanceKm: 1500, trend: "flat", updatedAt: new Date().toISOString() },
  { id: "P9", crop: "Tomato", market: "Dubai Central", city: "Dubai", state: "UAE", price: 45, distanceKm: 1900, trend: "up", updatedAt: new Date().toISOString() },
  { id: "P10", crop: "Tomato", market: "Singapore Mkt", city: "Singapore", state: "Singapore", price: 50, distanceKm: 3900, trend: "up", updatedAt: new Date().toISOString() },
];

const listings: Listing[] = [
  { id: "L1", farmerId: "F1", crop: "Tomato", quantityKg: 700, quality: "A", expectedPrice: 22, village: "Nashik", district: "Nashik", state: "Maharashtra", photo: "🍅", createdAt: new Date().toISOString(), status: "open" },
  { id: "L2", farmerId: "F2", crop: "Wheat", quantityKg: 2000, quality: "A", expectedPrice: 28, village: "Karnal", district: "Karnal", state: "Haryana", photo: "🌾", createdAt: new Date().toISOString(), status: "open" },
  { id: "L3", farmerId: "F3", crop: "Onion", quantityKg: 1500, quality: "B", expectedPrice: 18, village: "Warangal", district: "Warangal", state: "Telangana", photo: "🧅", createdAt: new Date().toISOString(), status: "open" },
];

const offers: Offer[] = [
  { id: "O1", listingId: "L1", buyerId: "B1", pricePerKg: 22, quantityKg: 700, message: "Best national price, we send our own truck.", createdAt: new Date().toISOString(), status: "pending" },
  { id: "O2", listingId: "L1", buyerId: "B2", pricePerKg: 20, quantityKg: 500, message: "Bulk pickup, Mumbai warehouse.", createdAt: new Date().toISOString(), status: "pending" },
  { id: "O3", listingId: "L1", buyerId: "B3", pricePerKg: 19, quantityKg: 300, message: "Weekly contract possible.", createdAt: new Date().toISOString(), status: "pending" },
  { id: "O4", listingId: "L1", buyerId: "B4", pricePerKg: 21, quantityKg: 600, message: "Amazon Fresh Delhi DC.", createdAt: new Date().toISOString(), status: "pending" },
  { id: "O5", listingId: "L1", buyerId: "B5", pricePerKg: 16, quantityKg: 50, message: "Daily supply for hotel.", createdAt: new Date().toISOString(), status: "pending" },
];

const orders: Order[] = [
  {
    id: "ORD-2026-001",
    listingId: "L1",
    farmerId: "F1",
    buyerId: "B1",
    crop: "Tomato",
    quantityKg: 700,
    pricePerKg: 22,
    totalAmount: 15400,
    platformFee: 154,
    netToFarmer: 15246,
    status: "in_transit",
    pickupAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    deliveryEta: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
    truck: {
      id: "T1",
      number: "MH-12-AB-1234",
      driverName: "Suresh Kumar",
      driverPhone: "9876543210",
      currentStopIndex: 2,
      route: [
        { name: "Nashik", lat: 19.99, lng: 73.78, reached: true },
        { name: "Pune",   lat: 18.52, lng: 73.85, reached: true },
        { name: "Mumbai", lat: 19.07, lng: 72.87, reached: false },
        { name: "Surat",  lat: 21.17, lng: 72.83, reached: false },
        { name: "Ahmedabad", lat: 23.02, lng: 72.57, reached: false },
        { name: "Delhi",  lat: 28.61, lng: 77.20, reached: false },
      ],
    },
  },
];

// ----- Query functions (the API every page uses) -----

export async function getFarmers() { return farmers; }
export async function getFarmer(id: string) { return farmers.find(f => f.id === id); }
export async function getBuyers() { return buyers; }
export async function getBuyer(id: string) { return buyers.find(b => b.id === id); }
export async function getPrices(crop?: Crop) {
  return crop ? prices.filter(p => p.crop === crop) : prices;
}
export async function getListings() { return listings; }
export async function getListing(id: string) { return listings.find(l => l.id === id); }
export async function getOffersForListing(listingId: string) {
  return offers.filter(o => o.listingId === listingId);
}
export async function getOrders() { return orders; }
export async function getOrder(id: string) { return orders.find(o => o.id === id); }

// ----- Write functions (currently no-op for demo; later write to Postgres) -----

export async function createListing(data: Omit<Listing, "id" | "createdAt" | "status">) {
  const newListing: Listing = {
    ...data,
    id: `L${listings.length + 1}`,
    createdAt: new Date().toISOString(),
    status: "open",
  };
  listings.push(newListing);
  return newListing;
}

export async function createOrder(input: {
  listingId: string; buyerId: string; pricePerKg: number; quantityKg: number;
}) {
  const listing = listings.find(l => l.id === input.listingId);
  if (!listing) throw new Error("Listing not found");
  const total = input.pricePerKg * input.quantityKg;
  const order: Order = {
    id: `ORD-${Date.now()}`,
    listingId: input.listingId,
    farmerId: listing.farmerId,
    buyerId: input.buyerId,
    crop: listing.crop,
    quantityKg: input.quantityKg,
    pricePerKg: input.pricePerKg,
    totalAmount: total,
    platformFee: Math.round(total * 0.01),
    netToFarmer: Math.round(total * 0.99),
    status: "confirmed",
    pickupAt: new Date(Date.now() + 86400000).toISOString(),
    deliveryEta: new Date(Date.now() + 2 * 86400000).toISOString(),
    truck: {
      id: "T-new",
      number: "MH-12-XX-9999",
      driverName: "Ramesh",
      driverPhone: "9000000000",
      currentStopIndex: 0,
      route: [
        { name: listing.village, lat: 19.99, lng: 73.78, reached: true },
        { name: "Delhi", lat: 28.61, lng: 77.20, reached: false },
      ],
    },
  };
  orders.push(order);
  return order;
}