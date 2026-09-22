// scripts/import-mandi.mjs
// -----------------------------------------------------------------------------
// Imports the govt mandi CSV into Postgres `mandi_records` table.
// Run:  node scripts/import-mandi.mjs
// -----------------------------------------------------------------------------
import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CSV = path.join(ROOT, "9ef84268-d588-465a-a308-a864a43d0070.csv");

// ----- Load DATABASE_URL from .env.local -----
const envText = await fs.readFile(path.join(ROOT, ".env.local"), "utf8");
for (const line of envText.split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].trim();
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// ----- CSV parser (handles quoted fields with commas inside) -----
function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuote = !inQuote;
    } else if (ch === "," && !inQuote) {
      out.push(cur); cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

// ----- DD/MM/YYYY → YYYY-MM-DD -----
function toIsoDate(ddmmyyyy) {
  const [dd, mm, yyyy] = ddmmyyyy.split("/");
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

// ----- MAIN -----
async function main() {
  console.log("📂 Reading", CSV);
  const raw = await fs.readFile(CSV, "utf8");
  const lines = raw.split("\n").filter((l) => l.trim().length > 0);

  // Parse header (quirk: "Min_x0020_Price" → "Min Price")
  const header = parseCsvLine(lines[0]).map((h) =>
    h.replace(/_x0020_/g, " ").trim().toLowerCase().replace(/\s+/g, "_"),
  );
  console.log("📋 Columns:", header.join(", "));

  const idx = {
    state:        header.indexOf("state"),
    district:     header.indexOf("district"),
    market:       header.indexOf("market"),
    commodity:    header.indexOf("commodity"),
    variety:      header.indexOf("variety"),
    grade:        header.indexOf("grade"),
    arrival_date: header.indexOf("arrival_date"),
    min_price:    header.indexOf("min_price"),
    max_price:    header.indexOf("max_price"),
    modal_price:  header.indexOf("modal_price"),
  };

  // Sanity check
  for (const [k, v] of Object.entries(idx)) {
    if (v === -1) throw new Error(`Missing column in CSV: ${k}`);
  }

  console.log(`📊 Parsing ${lines.length - 1} data rows…`);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("TRUNCATE mandi_records RESTART IDENTITY");

    const BATCH = 500;
    let batch = [];
    let total = 0;

    for (let i = 1; i < lines.length; i++) {
      const f = parseCsvLine(lines[i]);
      if (f.length < 10) continue;

      const state       = f[idx.state].trim();
      const district    = f[idx.district].trim();
      const market      = f[idx.market].trim();
      const commodity   = f[idx.commodity].trim();
      const variety     = f[idx.variety]?.trim() || null;
      const grade       = f[idx.grade]?.trim() || null;
      const arrivalDate = toIsoDate(f[idx.arrival_date].trim());
      const minPrice    = Number(f[idx.min_price]);
      const maxPrice    = Number(f[idx.max_price]);
      const modalPrice  = Number(f[idx.modal_price]);

      if (isNaN(minPrice) || isNaN(maxPrice) || isNaN(modalPrice)) {
        console.warn(`Skipping row ${i} — bad prices:`, f);
        continue;
      }

      batch.push([state, district, market, commodity, variety, grade,
                  arrivalDate, minPrice, maxPrice, modalPrice]);

      if (batch.length >= BATCH) {
        await insertBatch(client, batch);
        total += batch.length;
        batch = [];
      }
    }
    if (batch.length > 0) {
      await insertBatch(client, batch);
      total += batch.length;
    }

    await client.query("COMMIT");
    console.log(`✅ Inserted ${total} rows into mandi_records`);
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("❌ Import failed:", e.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

async function insertBatch(client, rows) {
  // Build ($1,$2,...) tuples with 10 values each
  const values = [];
  const params = [];
  let p = 1;
  for (const row of rows) {
    values.push(`($${p++},$${p++},$${p++},$${p++},$${p++},$${p++},$${p++},$${p++},$${p++},$${p++})`);
    params.push(...row);
  }
  await client.query(
    `INSERT INTO mandi_records
       (state, district, market, commodity, variety, grade,
        arrival_date, min_price, max_price, modal_price)
     VALUES ${values.join(",")}`,
    params,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});