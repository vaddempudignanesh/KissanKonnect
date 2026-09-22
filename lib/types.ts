// lib/types.ts
// These mirror Postgres tables exactly.

export type Crop = 'Tomato' | 'Onion' | 'Potato' | 'Wheat' | 'Rice'
                 | 'Sugarcane' | 'Cotton' | 'Soybean';

export interface DbUser {
  id: number;
  phone: string;
  name: string;
  role: 'farmer' | 'buyer' | 'admin';
  created_at: string;
}

export interface DbFarmer {
  id: number;
  user_id: number;
  name: string;
  phone?: string;
  village: string;
  district: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  land_size_acres: number;
  verified: boolean;
  rating: number;
  total_orders: number;
  avatar: string;
}

export interface DbBuyer {
  id: number;
  user_id: number;
  company_name: string;
  name: string;          // alias for company_name (UI convenience)
  buyer_type: 'mnc' | 'local' | 'exporter' | 'hotel' | 'mandi';
  type: string;          // UI alias for buyer_type (MNC / Local / Export)
  city: string;
  state: string;
  distanceKm: number;    // computed relative to current farmer
  latitude: number;
  longitude: number;
  rating: number;
  total_orders: number;
  verified: boolean;
  avatar: string;
  logoColor: string;
}

export interface DbPrice {
  id: string;
  crop: Crop;
  market: string;
  city: string;
  state: string;
  price: number;
  distanceKm: number;
  trend: 'up' | 'down' | 'flat';
  updatedAt: string;
}

export interface DbListing {
  id: number;
  farmer_id: number;
  crop_id: number;
  crop: Crop;
  quantity_kg: number;
  quality_grade: 'A' | 'B' | 'C';
  expected_price_per_kg: number;
  description: string;
  photo_url: string;
  pickup_address: string;
  latitude: number | null;
  longitude: number | null;
  available_from: string;
  status: 'active' | 'sold' | 'expired' | 'cancelled';
  created_at: string;
  farmer_name?: string;
  village?: string;
  district?: string;
  state?: string;
  photo?: string;

  // ---------- UI aliases (kept so pages don't need mass edits) ----------
  // ---------- UI aliases (kept so pages don't need mass edits) ----------
  farmerId: number;
  quantityKg: number;
  quality: 'A' | 'B' | 'C';
  expectedPrice: number;
}

export interface DbOffer {
  id: number;
  listing_id: number;
  buyer_id: number;
  offer_price_per_kg: number;
  quantity_kg: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  created_at: string;
  company_name?: string;
  buyer_type?: string;
  city?: string;
  state?: string;
  rating?: number;
  distance_km?: number;
  logoColor?: string;
  avatar?: string;

  // UI aliases
  buyerId: number;
  pricePerKg: number;
  quantityKg: number;
}

export interface Truck {
  id: string;
  number: string;
  driverName: string;
  driverPhone: string;
  route: { name: string; lat: number; lng: number; reached: boolean }[];
  currentStopIndex: number;
}

export interface DbOrder {
  id: string;                // order_number used as primary key in UI
  order_number: string;
  listing_id: number;
  farmer_id: number;
  buyer_id: number;
  quantity_kg: number;
  price_per_kg: number;
  total_amount: number;
  platform_fee: number;
  net_to_farmer: number;
  status: string;
  payment_status: string;
  pickup_address: string;
  delivery_address: string;
  pickup_date: string;
  expected_delivery: string;
  actual_delivery: string | null;
  truck_number: string;
  driver_name: string;
  driver_phone: string;
  created_at: string;
  crop?: Crop;
  crop_name?: string;
  farmer_name?: string;
  company_name?: string;
  truck: Truck;

   // UI aliases
  farmerId: number;
  buyerId: number;
  cropEmoji?: string;
  quantityKg: number;
  netToFarmer: number;
  totalAmount: number;

}

export interface DbOrderEvent {
  id: number;
  order_id: number;
  event_type: string;
  description: string;
  latitude: number;
  longitude: number;
  location_name: string;
  created_at: string;
}
