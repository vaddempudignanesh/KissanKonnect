-- ============================================
-- KISANKONNECT DATABASE SCHEMA
-- ============================================

-- Drop existing (for fresh start)
DROP TABLE IF EXISTS order_events CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS buyer_offers CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS buyers CASCADE;
DROP TABLE IF EXISTS farmers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS mandi_prices CASCADE;
DROP TABLE IF EXISTS markets CASCADE;
DROP TABLE IF EXISTS crops CASCADE;

-- ============================================
-- USERS (auth base table)
-- ============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('farmer', 'buyer', 'admin')),
    password_hash VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- FARMERS
-- ============================================
CREATE TABLE farmers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    village VARCHAR(100),
    district VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    land_size_acres DECIMAL(10, 2),
    verified BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_orders INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BUYERS (MNCs, local, exporters)
-- ============================================
CREATE TABLE buyers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    company_name VARCHAR(200) NOT NULL,
    buyer_type VARCHAR(30) CHECK (buyer_type IN ('mnc', 'local', 'exporter', 'hotel', 'mandi')),
    city VARCHAR(100),
    state VARCHAR(100),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_orders INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    contact_email VARCHAR(200),
    contact_phone VARCHAR(15),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CROPS (reference data)
-- ============================================
CREATE TABLE crops (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    name_hi VARCHAR(100),
    category VARCHAR(50),
    unit VARCHAR(20) DEFAULT 'kg',
    shelf_life_days INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MARKETS (mandis, cities for price discovery)
-- ============================================
CREATE TABLE markets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    state VARCHAR(100),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    market_type VARCHAR(30) CHECK (market_type IN ('local', 'national', 'export')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MANDI PRICES (daily price feed)
-- ============================================
CREATE TABLE mandi_prices (
    id SERIAL PRIMARY KEY,
    crop_id INTEGER REFERENCES crops(id) ON DELETE CASCADE,
    market_id INTEGER REFERENCES markets(id) ON DELETE CASCADE,
    price_per_kg DECIMAL(10, 2) NOT NULL,
    min_price DECIMAL(10, 2),
    max_price DECIMAL(10, 2),
    recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
    source VARCHAR(50) DEFAULT 'manual',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(crop_id, market_id, recorded_date)
);

CREATE INDEX idx_mandi_prices_date ON mandi_prices(recorded_date DESC);
CREATE INDEX idx_mandi_prices_crop ON mandi_prices(crop_id);

-- ============================================
-- LISTINGS (farmer's produce)
-- ============================================
CREATE TABLE listings (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER REFERENCES farmers(id) ON DELETE CASCADE,
    crop_id INTEGER REFERENCES crops(id),
    quantity_kg DECIMAL(10, 2) NOT NULL,
    quality_grade VARCHAR(20) CHECK (quality_grade IN ('A', 'B', 'C')),
    expected_price_per_kg DECIMAL(10, 2) NOT NULL,
    description TEXT,
    photo_url TEXT,
    pickup_address TEXT,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    available_from DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'sold', 'expired', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_farmer ON listings(farmer_id);
CREATE INDEX idx_listings_crop ON listings(crop_id);

-- ============================================
-- BUYER OFFERS (bids on listings)
-- ============================================
CREATE TABLE buyer_offers (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
    buyer_id INTEGER REFERENCES buyers(id) ON DELETE CASCADE,
    offer_price_per_kg DECIMAL(10, 2) NOT NULL,
    quantity_kg DECIMAL(10, 2) NOT NULL,
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_offers_listing ON buyer_offers(listing_id);
CREATE INDEX idx_offers_buyer ON buyer_offers(buyer_id);
CREATE INDEX idx_offers_status ON buyer_offers(status);

-- ============================================
-- ORDERS (accepted offers → actual orders)
-- ============================================
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(30) UNIQUE NOT NULL,
    listing_id INTEGER REFERENCES listings(id),
    farmer_id INTEGER REFERENCES farmers(id),
    buyer_id INTEGER REFERENCES buyers(id),
    offer_id INTEGER REFERENCES buyer_offers(id),
    quantity_kg DECIMAL(10, 2) NOT NULL,
    price_per_kg DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    platform_fee DECIMAL(10, 2) NOT NULL,
    net_to_farmer DECIMAL(12, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'confirmed' CHECK (status IN (
        'confirmed', 'pickup_scheduled', 'in_transit',
        'delivered', 'quality_check', 'completed', 'cancelled'
    )),
    payment_status VARCHAR(20) DEFAULT 'escrow' CHECK (payment_status IN ('pending', 'escrow', 'released', 'refunded')),
    pickup_address TEXT,
    delivery_address TEXT,
    pickup_date TIMESTAMPTZ,
    expected_delivery TIMESTAMPTZ,
    actual_delivery TIMESTAMPTZ,
    truck_number VARCHAR(20),
    driver_name VARCHAR(100),
    driver_phone VARCHAR(15),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_farmer ON orders(farmer_id);
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);

-- ============================================
-- ORDER EVENTS (tracking timeline)
-- ============================================
CREATE TABLE order_events (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    description TEXT,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    location_name VARCHAR(200),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_order ON order_events(order_id);
CREATE INDEX idx_events_created ON order_events(created_at DESC);

-- ============================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_listings_updated BEFORE UPDATE ON listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();