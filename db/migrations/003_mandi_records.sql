-- ============================================
-- Migration 003: Store govt mandi prices in Postgres
-- ============================================
-- The govt API (data.gov.in) is rate-limited and sometimes down.
-- We import a snapshot CSV once, then serve from this table.
-- Table can be refreshed by re-running scripts/import-mandi.mjs.
-- ============================================

CREATE TABLE IF NOT EXISTS mandi_records (
    id              SERIAL PRIMARY KEY,
    state           VARCHAR(100) NOT NULL,
    district        VARCHAR(100) NOT NULL,
    market          VARCHAR(200) NOT NULL,
    commodity       VARCHAR(100) NOT NULL,
    variety         VARCHAR(100),
    grade           VARCHAR(50),
    arrival_date    DATE NOT NULL,
    min_price       NUMERIC(10,2) NOT NULL,     -- ₹/quintal
    max_price       NUMERIC(10,2) NOT NULL,
    modal_price     NUMERIC(10,2) NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mandi_state       ON mandi_records(state);
CREATE INDEX IF NOT EXISTS idx_mandi_district    ON mandi_records(district);
CREATE INDEX IF NOT EXISTS idx_mandi_commodity   ON mandi_records(commodity);
CREATE INDEX IF NOT EXISTS idx_mandi_arrival     ON mandi_records(arrival_date DESC);
CREATE INDEX IF NOT EXISTS idx_mandi_state_crop  ON mandi_records(state, commodity);