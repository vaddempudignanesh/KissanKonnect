// lib/types.ts
export type Crop = 'Tomato' | 'Onion' | 'Potato' | 'Wheat' | 'Rice'
                 | 'Sugarcane' | 'Cotton' | 'Soybean';

export type UserRole = 'farmer' | 'buyer' | 'logistics' | 'fpo' | 'admin';

export interface DbUser {
  id: number;
  phone: string;
  name: string;
  email?: string;
  role: UserRole;
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
  name: string;
  buyer_type: 'mnc' | 'local' | 'exporter' | 'hotel' | 'mandi';
  type: string;
  city: string;
  state: string;
  distanceKm: number;
  latitude: number;
  longitude: number;
  rating: number;
  total_orders: number;
  verified: boolean;
  avatar: string;
  logoColor: string;
}

export interface DbLogistics {
  id: number;
  user_id: number;
  company_name: string;
  name: string;
  contact_name: string | null;
  city: string;
  state: string;
  vehicle_count: number;
  service_radius: number;
  verified: boolean;
  rating: number;
  avatar: string;
  logoColor: string;
}

export interface DbFpo {
  id: number;
  user_id: number;
  fpo_name: string;
  name: string;
  contact_name: string | null;
  village: string;
  district: string;
  state: string;
  member_count: number;
  verified: boolean;
  rating: number;
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
  id: string;
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