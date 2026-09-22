-- ============================================
-- SEED DATA
-- ============================================

-- Crops
INSERT INTO crops (name, name_hi, category, shelf_life_days) VALUES
('Tomato', 'टमाटर', 'vegetable', 7),
('Onion', 'प्याज', 'vegetable', 30),
('Potato', 'आलू', 'vegetable', 45),
('Wheat', 'गेहूं', 'grain', 180),
('Rice', 'चावल', 'grain', 365),
('Sugarcane', 'गन्ना', 'cash_crop', 15),
('Cotton', 'कपास', 'cash_crop', 365),
('Soybean', 'सोयाबीन', 'oilseed', 180);

-- Markets (local + national + export)
INSERT INTO markets (name, state, latitude, longitude, market_type) VALUES
('Pune Mandi', 'Maharashtra', 18.5204, 73.8567, 'local'),
('Mumbai Mandi', 'Maharashtra', 19.0760, 72.8777, 'local'),
('Nashik Mandi', 'Maharashtra', 19.9975, 73.7898, 'local'),
('Delhi Azadpur Mandi', 'Delhi', 28.7041, 77.1025, 'national'),
('Bangalore Mandi', 'Karnataka', 12.9716, 77.5946, 'national'),
('Hyderabad Mandi', 'Telangana', 17.3850, 78.4867, 'national'),
('Chennai Mandi', 'Tamil Nadu', 13.0827, 80.2707, 'national'),
('Kolkata Mandi', 'West Bengal', 22.5726, 88.3639, 'national'),
('Dubai Export Market', 'International', 25.2048, 55.2708, 'export'),
('Singapore Export Market', 'International', 1.3521, 103.8198, 'export'),
('London Export Market', 'International', 51.5074, -0.1278, 'export');

-- Mandi prices for Tomato (crop_id = 1)
INSERT INTO mandi_prices (crop_id, market_id, price_per_kg, min_price, max_price, recorded_date)
SELECT 1, id,
    CASE
        WHEN market_type = 'local' THEN 15 + (random() * 3)::numeric(10,2)
        WHEN market_type = 'national' THEN 18 + (random() * 5)::numeric(10,2)
        WHEN market_type = 'export' THEN 40 + (random() * 25)::numeric(10,2)
    END,
    10, 70, CURRENT_DATE
FROM markets;

-- Demo users
INSERT INTO users (phone, name, role, password_hash) VALUES
('9876543210', 'Rajesh Patil', 'farmer', '$2a$10$dummyhash'),
('9876543211', 'Reliance Fresh', 'buyer', '$2a$10$dummyhash'),
('9876543212', 'BigBasket', 'buyer', '$2a$10$dummyhash'),
('9876543213', 'ITC Foods', 'buyer', '$2a$10$dummyhash');

-- Farmer profile
INSERT INTO farmers (user_id, village, district, state, pincode, latitude, longitude, land_size_acres, verified, rating)
VALUES (1, 'Nashik', 'Nashik', 'Maharashtra', '422001', 19.9975, 73.7898, 5.5, TRUE, 4.8);

-- Buyer profiles
INSERT INTO buyers (user_id, company_name, buyer_type, city, state, latitude, longitude, rating, verified)
VALUES
(2, 'Reliance Fresh', 'mnc', 'Delhi', 'Delhi', 28.7041, 77.1025, 4.9, TRUE),
(3, 'BigBasket', 'mnc', 'Mumbai', 'Maharashtra', 19.0760, 72.8777, 4.7, TRUE),
(4, 'ITC Foods', 'mnc', 'Pune', 'Maharashtra', 18.5204, 73.8567, 4.6, TRUE);