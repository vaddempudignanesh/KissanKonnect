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

// -----------------------------------------------------------------------------
// Realistic seed prices — spread across major Indian states so that picking
// any state from the geo picker returns at least a few mandis.
// Distances are approximate kilometres from Nashik (the ORIGIN in mandiApi).
// -----------------------------------------------------------------------------
const prices: Price[] = [
  // ============================== TOMATO ==============================
  // Maharashtra
  { id: "P-T-MH-1", crop: "Tomato", market: "Pune APMC",        city: "Pune",        state: "Maharashtra",   price: 17, distanceKm: 210,  trend: "up",   updatedAt: new Date().toISOString() },
  { id: "P-T-MH-2", crop: "Tomato", market: "Mumbai Vashi APMC", city: "Mumbai",      state: "Maharashtra",   price: 18, distanceKm: 165,  trend: "flat", updatedAt: new Date().toISOString() },
  { id: "P-T-MH-3", crop: "Tomato", market: "Nashik APMC",      city: "Nashik",      state: "Maharashtra",   price: 15, distanceKm: 5,    trend: "down", updatedAt: new Date().toISOString() },
  { id: "P-T-MH-4", crop: "Tomato", market: "Nagpur APMC",      city: "Nagpur",      state: "Maharashtra",   price: 19, distanceKm: 600,  trend: "up",   updatedAt: new Date().toISOString() },
  // Delhi
  { id: "P-T-DL-1", crop: "Tomato", market: "Azadpur Mandi",    city: "Delhi",       state: "Delhi",         price: 22, distanceKm: 1200, trend: "up",   updatedAt: new Date().toISOString() },
  { id: "P-T-DL-2", crop: "Tomato", market: "Okhla Mandi",      city: "Delhi",       state: "Delhi",         price: 21, distanceKm: 1210, trend: "flat", updatedAt: new Date().toISOString() },
  // Uttar Pradesh
  { id: "P-T-UP-1", crop: "Tomato", market: "Kanpur Mandi",     city: "Kanpur Nagar",state: "Uttar Pradesh", price: 19, distanceKm: 1100, trend: "up",   updatedAt: new Date().toISOString() },
  { id: "P-T-UP-2", crop: "Tomato", market: "Agra Mandi",       city: "Agra",        state: "Uttar Pradesh", price: 18, distanceKm: 1055, trend: "flat", updatedAt: new Date().toISOString() },
  { id: "P-T-UP-3", crop: "Tomato", market: "Lucknow Mandi",    city: "Lucknow",     state: "Uttar Pradesh", price: 20, distanceKm: 1240, trend: "up",   updatedAt: new Date().toISOString() },
  { id: "P-T-UP-4", crop: "Tomato", market: "Varanasi Mandi",   city: "Varanasi",    state: "Uttar Pradesh", price: 21, distanceKm: 1360, trend: "up",   updatedAt: new Date().toISOString() },
  // Karnataka
  { id: "P-T-KA-1", crop: "Tomato", market: "Yeshwanthpur APMC",city: "Bengaluru",   state: "Karnataka",     price: 20, distanceKm: 900,  trend: "up",   updatedAt: new Date().toISOString() },
  { id: "P-T-KA-2", crop: "Tomato", market: "Hubballi APMC",    city: "Hubballi",    state: "Karnataka",     price: 18, distanceKm: 700,  trend: "flat", updatedAt: new Date().toISOString() },
  // Telangana
  { id: "P-T-TG-1", crop: "Tomato", market: "Bowenpally Mandi", city: "Hyderabad",   state: "Telangana",     price: 19, distanceKm: 700,  trend: "flat", updatedAt: new Date().toISOString() },
  { id: "P-T-TG-2", crop: "Tomato", market: "Warangal Mandi",   city: "Warangal",    state: "Telangana",     price: 18, distanceKm: 750,  trend: "down", updatedAt: new Date().toISOString() },
  // Tamil Nadu
  { id: "P-T-TN-1", crop: "Tomato", market: "Koyambedu Mandi",  city: "Chennai",     state: "Tamil Nadu",    price: 18, distanceKm: 1100, trend: "down", updatedAt: new Date().toISOString() },
  { id: "P-T-TN-2", crop: "Tomato", market: "Madurai Mandi",    city: "Madurai",     state: "Tamil Nadu",    price: 17, distanceKm: 1250, trend: "flat", updatedAt: new Date().toISOString() },
  // West Bengal
  { id: "P-T-WB-1", crop: "Tomato", market: "Sealdah Mandi",    city: "Kolkata",     state: "West Bengal",   price: 17, distanceKm: 1500, trend: "flat", updatedAt: new Date().toISOString() },
  // Gujarat
  { id: "P-T-GJ-1", crop: "Tomato", market: "Ahmedabad APMC",   city: "Ahmedabad",   state: "Gujarat",       price: 19, distanceKm: 480,  trend: "up",   updatedAt: new Date().toISOString() },
  { id: "P-T-GJ-2", crop: "Tomato", market: "Surat APMC",       city: "Surat",       state: "Gujarat",       price: 18, distanceKm: 350,  trend: "flat", updatedAt: new Date().toISOString() },
  // Rajasthan
  { id: "P-T-RJ-1", crop: "Tomato", market: "Jaipur Mandi",     city: "Jaipur",      state: "Rajasthan",     price: 20, distanceKm: 1000, trend: "up",   updatedAt: new Date().toISOString() },
  { id: "P-T-RJ-2", crop: "Tomato", market: "Jodhpur Mandi",    city: "Jodhpur",     state: "Rajasthan",     price: 21, distanceKm: 1050, trend: "flat", updatedAt: new Date().toISOString() },
  // Punjab
  { id: "P-T-PB-1", crop: "Tomato", market: "Ludhiana Mandi",   city: "Ludhiana",    state: "Punjab",        price: 23, distanceKm: 1450, trend: "up",   updatedAt: new Date().toISOString() },
  { id: "P-T-PB-2", crop: "Tomato", market: "Amritsar Mandi",   city: "Amritsar",    state: "Punjab",        price: 24, distanceKm: 1550, trend: "up",   updatedAt: new Date().toISOString() },
  // Haryana
  { id: "P-T-HR-1", crop: "Tomato", market: "Karnal Mandi",     city: "Karnal",      state: "Haryana",       price: 22, distanceKm: 1300, trend: "flat", updatedAt: new Date().toISOString() },
  { id: "P-T-HR-2", crop: "Tomato", market: "Hisar Mandi",      city: "Hisar",       state: "Haryana",       price: 21, distanceKm: 1350, trend: "up",   updatedAt: new Date().toISOString() },
  // Madhya Pradesh
  { id: "P-T-MP-1", crop: "Tomato", market: "Indore Mandi",     city: "Indore",      state: "Madhya Pradesh",price: 18, distanceKm: 480,  trend: "flat", updatedAt: new Date().toISOString() },
  { id: "P-T-MP-2", crop: "Tomato", market: "Bhopal Mandi",     city: "Bhopal",      state: "Madhya Pradesh",price: 19, distanceKm: 620,  trend: "up",   updatedAt: new Date().toISOString() },
  // Bihar
  { id: "P-T-BR-1", crop: "Tomato", market: "Patna Mandi",      city: "Patna",       state: "Bihar",         price: 22, distanceKm: 1500, trend: "flat", updatedAt: new Date().toISOString() },
  // Andhra Pradesh
  { id: "P-T-AP-1", crop: "Tomato", market: "Vijayawada Mandi", city: "Vijayawada",  state: "Andhra Pradesh",price: 17, distanceKm: 900,  trend: "down", updatedAt: new Date().toISOString() },
  // Kerala
  { id: "P-T-KL-1", crop: "Tomato", market: "Kochi Mandi",      city: "Kochi",       state: "Keralam",       price: 25, distanceKm: 1300, trend: "up",   updatedAt: new Date().toISOString() },
  // Odisha
  { id: "P-T-OD-1", crop: "Tomato", market: "Bhubaneswar Mandi",city: "Bhubaneswar", state: "Odisha",        price: 20, distanceKm: 1500, trend: "flat", updatedAt: new Date().toISOString() },
  // Assam
  { id: "P-T-AS-1", crop: "Tomato", market: "Guwahati Mandi",   city: "Guwahati",    state: "Assam",         price: 28, distanceKm: 2200, trend: "up",   updatedAt: new Date().toISOString() },

  // ============================== ONION ==============================
  { id: "P-O-MH-1", crop: "Onion", market: "Lasalgaon APMC",   city: "Nashik",      state: "Maharashtra",   price: 18, distanceKm: 30,   trend: "up",   updatedAt: new Date().toISOString() },
  { id: "P-O-MH-2", crop: "Onion", market: "Pune APMC",        city: "Pune",        state: "Maharashtra",   price: 19, distanceKm: 210,  trend: "flat", updatedAt: new Date().toISOString() },
  { id: "P-O-MH-3", crop: "Onion", market: "Mumbai Vashi APMC",city: "Mumbai",      state: "Maharashtra",   price: 20, distanceKm: 165,  trend: "up",   updatedAt: new Date().toISOString() },
  { id: "P-O-GJ-1", crop: "Onion", market: "Rajkot APMC",      city: "Rajkot",      state: "Gujarat",       price: 17, distanceKm: 620,  trend: "down", updatedAt: new Date().toISOString() },
  { id: "P-O-KA-1", crop: "Onion", market: "Bengaluru APMC",   city: "Bengaluru",   state: "Karnataka",     price: 22, distanceKm: 900,  trend: "up",   updatedAt: new Date().toISOString() },
  { id: "P-O-DL-1", crop: "Onion", market: "Azadpur Mandi",    city: "Delhi",       state: "Delhi",         price: 24, distanceKm: 1200, trend: "up",   updatedAt: new Date().toISOString() },
  { id: "P-O-MP-1", crop: "Onion", market: "Indore Mandi",     city: "Indore",      state: "Madhya Pradesh",price: 19, distanceKm: 480,  trend: "flat", updatedAt: new Date().toISOString() },
  { id: "P-O-RJ-1", crop: "Onion", market: "Jaipur Mandi",     city: "Jaipur",      state: "Rajasthan",     price: 21, distanceKm: 1000, trend: "up",   updatedAt: new Date().toISOString() },
  { id: "P-O-TG-1", crop: "Onion", market: "Hyderabad Mandi",  city: "Hyderabad",   state: "Telangana",     price: 20, distanceKm: 700,  trend: "flat", updatedAt: new Date().toISOString() },
  { id: "P-O-TN-1", crop: "Onion", market: "Chennai Mandi",    city: "Chennai",     state: "Tamil Nadu",    price: 21, distanceKm: 1100, trend: "up",   updatedAt: new Date().toISOString() },
  { id: "P-O-WB-1", crop: "Onion", market: "Kolkata Mandi",    city: "Kolkata",     state: "West Bengal",   price: 22, distanceKm: 1500, trend: "flat", updatedAt: new Date().toISOString() },
  { id: "P-O-UP-1", crop: "Onion", market: "Kanpur Mandi",     city: "Kanpur Nagar",state: "Uttar Pradesh", price: 20, distanceKm: 1100, trend: "up",   updatedAt: new Date().toISOString() },
  { id: "P-O-UP-2", crop: "Onion", market: "Lucknow Mandi",    city: "Lucknow",     state: "Uttar Pradesh", price: 21, distanceKm: 1240, trend: "up",   updatedAt: new Date().toISOString() },
  { id: "P-O-BR-1", crop: "Onion", market: "Patna Mandi",      city: "Patna",       state: "Bihar",         price: 23, distanceKm: 1500, trend: "up",   updatedAt: new Date().toISOString() },
  { id: "P-O-AP-1", crop: "Onion", market: "Guntur Mandi",     city: "Guntur",      state: "Andhra Pradesh",price: 19, distanceKm: 900,  trend: "flat", updatedAt: new Date().toISOString() },

  // ============================== POTATO ==============================
  { id: "P-P-UP-1", crop: "Potato", market: "Agra Mandi",      city: "Agra",        state: "Uttar Pradesh", price: 14, distanceKm: 1055, trend: "flat", updatedAt: new Date().toISOString() },
  { id: "P-P-UP-2", crop: "Potato", market: "Kanpur Mandi",    city: "Kanpur Nagar",state: "Uttar Pradesh", price: 15, distanceKm: 1100, trend: "up",   updatedAt: new Date().toISOString() },
  { id: "P-P-UP-3", crop: "Potato", market: "Meerut Mandi",    city: "Meerut",      state: "Uttar Pradesh", price: 13, distanceKm: 1250, trend: "down", updatedAt: new Date().toISOString() },
  { id: "P-P-WB-1", crop: "Potato", market: "Kolkata Mandi",   city: "Kolkata",     state: "West Bengal",   price: 16, distanceKm: 1500, trend: "flat", updatedAt: new Date().toISOString() },
  { id: "P-P-WB-2", crop: "Potato", market: "Hooghly Mandi",   city: "Hooghly",     state: "West Bengal",   price: 15, distanceKm: 1520, trend: "flat", updatedAt: new Date().toISOString() },
  { id: "P-P-PB-1", crop: "Potato", market: "Jalandhar Mandi", city: "Jalandhar",   state: "Punjab",        price: 13, distanceKm: 1500, trend: "flat", updatedAt: new Date().toISOString() },
  { id: "P-P-MP-1", crop: "Potato", market: "Indore Mandi",    city: "Indore",      state: "Madhya Pradesh",price: 14, distanceKm: 480,  trend: "flat", updatedAt: new Date().toISOString() },
  { id: "P-P-MH-1", crop: "Potato", market: "Pune APMC",       city: "Pune",        state: "Maharashtra",   price: 16, distanceKm: 210,  trend: "up",   updatedAt: new Date().toISOString() },
  { id: "P-P-DL-1", crop: "Potato", market: "Azadpur Mandi",   city: "Delhi",       state: "Delhi",         price: 15, distanceKm: 1200, trend: "flat", updatedAt: new Date().toISOString() },
  { id: "P-P-KA-1", crop: "Potato", market: "Bengaluru APMC",  city: "Bengaluru",   state: "Karnataka",     price: 17, distanceKm: 900,  trend: "up",   updatedAt: new Date().toISOString() },
  { id: "P-P-GJ-1", crop: "Potato", market: "Ahmedabad APMC",  city: "Ahmedabad",   state: "Gujarat",       price: 15, distanceKm: 480,  trend: "flat", updatedAt: new Date().toISOString() },
  { id: "P-P-BR-1", crop: "Potato", market: "Patna Mandi",     city: "Patna",       state: "Bihar",         price: 14, distanceKm: 1500, trend: "down", updatedAt: new Date().toISOString() },

  // ============================== WHEAT ==============================
  { id: "P-W-PB-1", crop: "Wheat", market: "Ludhiana Mandi",   city: "Ludhiana",    state: "Punjab",        price: 28, distanceKm: 1450, trend: "up",   updatedAt: new Date().toISOString() },
  { id: "P-W-PB-2", crop: "Wheat", market: "Amritsar Mandi",   city: "Amritsar",    state: "Punjab",        price: 29, distanceKm: 1550, trend: "up",   updatedAt: new Date().toISOString() },
  { id: "P-W-HR-1", crop: "Wheat", market: "Karnal Mandi",     city: "Karnal",      state: "Haryana",       price: 27, distanceKm: 1300, trend: "flat", updatedAt: new Date().toISOString() },
  { id: "P-W-HR-2", crop: "Wheat", market: "Hisar Mandi",      city: "Hisar",       state: "Haryana",       price: 26, distanceKm: 1350, trend: "up",   updatedAt: new Date().toISOString() },
  { id: "P-W-UP-1", crop: "Wheat", market: "Kanpur Mandi",     city: "Kanpur Nagar",state: "Uttar Pradesh", price: 25, distanceKm: 1100, trend: "up",   updatedAt: new Date().toISOString() },
  { id: "P-W-UP-2", crop: "Wheat", market: "Lucknow Mandi",    city: "Lucknow",     state: "Uttar Pradesh", price: 26, distanceKm: 1240, trend: "flat", updatedAt: new Date().toISOString() },
  { id: "P-W-UP-3", crop: "Wheat", market: "Meerut Mandi",     city: "Meerut",      state: "Uttar Pradesh", price: 25, distanceKm: 1250, trend: "flat", updatedAt: new Date().toISOString() },
  { id: "P-W-MP-1", crop: "Wheat", market: "Indore Mandi",     city: "Indore",      state: "Madhya Pradesh",price: 26, distanceKm: 480,  trend: "up",   updatedAt: new Date().toISOString() },
  { id: "P-W-MP-2", crop: "Wheat", market: "Bhopal Mandi",     city: "Bhopal",      state: "Madhya Pradesh",price: 25, distanceKm: 620,  trend: "flat", updatedAt: new Date().toISOString() },
  { id: "P-W-RJ-1", crop: "Wheat", market: "Jaipur Mandi",     city: "Jaipur",      state: "Rajasthan",     price: 27, distanceKm: 1000, trend: "up",   updatedAt: new Date().toISOString() },
  { id: "P-W-MH-1", crop: "Wheat", market: "Pune APMC",        city: "Pune",        state: "Maharashtra",   price: 27, distanceKm: 210,  trend: "flat", updatedAt: new Date().toISOString() },
  { id: "P-W-GJ-1", crop: "Wheat", market: "Ahmedabad APMC",   city: "Ahmedabad",   state: "Gujarat",       price: 27, distanceKm: 480,  trend: "up",   updatedAt: new Date().toISOString() },
  { id: "P-W-BR-1", crop: "Wheat", market: "Patna Mandi",      city: "Patna",       state: "Bihar",         price: 26, distanceKm: 1500, trend: "flat", updatedAt: new Date().toISOString() },
  { id: "P-W-DL-1", crop: "Wheat", market: "Azadpur Mandi",    city: "Delhi",       state: "Delhi",         price: 28, distanceKm: 1200, trend: "up",   updatedAt: new Date().toISOString() },

  // ============================== RICE ==============================
  { id: "P-R-WB-1", crop: "Rice", market: "Kolkata Mandi",     city: "Kolkata",     state: "West Bengal",   price: 32, distanceKm: 1500, trend: "up",   updatedAt: new Date().toISOString() },
  { id: "P-R-WB-2", crop: "Rice", market: "Bardhaman Mandi",   city: "Bardhaman",   state: "West Bengal",   price: 31, distanceKm: 1550, trend: "flat", updatedAt: new Date().toISOString() },
  { id: "P-R-TN-1", crop: "Rice", market: "Thanjavur Mandi",   city: "Thanjavur",   state: "Tamil Nadu",    price: 33, distanceKm: 1200, trend: "up",   updatedAt: new Date().toISOString() },
  { id: "P-R-TN-2", crop: "Rice", market: "Koyambedu Mandi",   city: "Chennai",     state: "Tamil Nadu",    price: 34, distanceKm: 1100, trend: "flat", updatedAt: new Date().toISOString() },
  { id: "P-R-AP-1", crop: "Rice", market: "Guntur Mandi",      city: "Guntur",      state: "Andhra Pradesh",price: 30, distanceKm: 900,  trend: "up",   updatedAt: new Date().toISOString() },
  { id: "P-R-AP-2", crop: "Rice", market: "Vijayawada Mandi",  city: "Vijayawada",  state: "Andhra Pradesh",price: 31, distanceKm: 900,  trend: "up",   updatedAt: new Date().toISOString() },
  { id: "P-R-TG-1", crop: "Rice", market: "Hyderabad Mandi",   city: "Hyderabad",   state: "Telangana",     price: 32, distanceKm: 700,  trend: "flat", updatedAt: new Date().toISOString() },
  { id: "P-R-KA-1", crop: "Rice", market: "Bengaluru APMC",    city: "Bengaluru",   state: "Karnataka",     price: 34, distanceKm: 900,  trend: "up",   updatedAt: new Date().toISOString() },
  { id: "P-R-KL-1", crop: "Rice", market: "Kochi Mandi",       city: "Kochi",       state: "Keralam",       price: 36, distanceKm: 1300, trend: "up",   updatedAt: new Date().toISOString() },
  { id: "P-R-OD-1", crop: "Rice", market: "Bhubaneswar Mandi", city: "Bhubaneswar", state: "Odisha",        price: 30, distanceKm: 1500, trend: "flat", updatedAt: new Date().toISOString() },
  { id: "P-R-MP-1", crop: "Rice", market: "Indore Mandi",      city: "Indore",      state: "Madhya Pradesh",price: 30, distanceKm: 480,  trend: "flat", updatedAt: new Date().toISOString() },
  { id: "P-R-UP-1", crop: "Rice", market: "Lucknow Mandi",     city: "Lucknow",     state: "Uttar Pradesh", price: 29, distanceKm: 1240, trend: "flat", updatedAt: new Date().toISOString() },
  { id: "P-R-UP-2", crop: "Rice", market: "Varanasi Mandi",    city: "Varanasi",    state: "Uttar Pradesh", price: 30, distanceKm: 1360, trend: "up",   updatedAt: new Date().toISOString() },
  { id: "P-R-AS-1", crop: "Rice", market: "Guwahati Mandi",    city: "Guwahati",    state: "Assam",         price: 35, distanceKm: 2200, trend: "up",   updatedAt: new Date().toISOString() },
  { id: "P-R-BR-1", crop: "Rice", market: "Patna Mandi",       city: "Patna",       state: "Bihar",         price: 31, distanceKm: 1500, trend: "flat", updatedAt: new Date().toISOString() },
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


// -----------------------------------------------------------------------------
// Real-data bridge helpers
// -----------------------------------------------------------------------------

// Compute a realistic "market rate" for a crop by averaging the seed prices.
// Used by dashboards to show "you're getting ₹X more than the local mandi".
export function getLocalMandiRate(crop: Crop): number {
  const rows = prices.filter(p => p.crop === crop);
  if (rows.length === 0) return 0;
  return Math.round(rows.reduce((s, p) => s + p.price, 0) / rows.length);
}