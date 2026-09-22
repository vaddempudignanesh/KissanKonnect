-- ============================================
-- Migration 004: Multi-role support + admin bootstrap
-- ============================================
-- Expands users.role to include 'logistics' and 'fpo'.
-- Adds email column for admin.
-- Creates logistics_profiles and fpo_profiles tables.
-- ============================================

-- 1) Drop the old CHECK constraint on role and add expanded one
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('farmer', 'buyer', 'logistics', 'fpo', 'admin'));

-- 2) Add email column (nullable — only admins use it for now)
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- 3) Logistics profiles
CREATE TABLE IF NOT EXISTS logistics_profiles (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    company_name    VARCHAR(200) NOT NULL,
    contact_name    VARCHAR(100),
    city            VARCHAR(100),
    state           VARCHAR(100),
    vehicle_count   INTEGER DEFAULT 1,
    service_radius  INTEGER DEFAULT 100,   -- km
    verified        BOOLEAN DEFAULT FALSE,
    rating          DECIMAL(3, 2) DEFAULT 0.00,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_logistics_user ON logistics_profiles(user_id);

-- 4) FPO profiles
CREATE TABLE IF NOT EXISTS fpo_profiles (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    fpo_name        VARCHAR(200) NOT NULL,
    contact_name    VARCHAR(100),
    village         VARCHAR(100),
    district        VARCHAR(100),
    state           VARCHAR(100),
    member_count    INTEGER DEFAULT 0,
    verified        BOOLEAN DEFAULT FALSE,
    rating          DECIMAL(3, 2) DEFAULT 0.00,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fpo_user ON fpo_profiles(user_id);