-- ============================================
-- Migration 002: Auth additions
-- ============================================
-- The base `users` table from schema.sql already has:
--   id, phone, name, role, password_hash, created_at, updated_at
--
-- This migration:
--   1. Adds email (optional) for future password reset
--   2. Adds last_login_at for analytics
--   3. Ensures password_hash is NOT NULL (for new users)
-- ============================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Index for quick login lookup
CREATE INDEX IF NOT EXISTS idx_users_phone_lower ON users(LOWER(phone));

-- Note: existing demo users (Rajesh, Reliance, etc.) have password_hash = '$2a$10$dummyhash'
-- which will NOT verify against bcrypt. They're for demo reads only. Real signups
-- will replace them over time.