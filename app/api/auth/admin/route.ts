import { NextRequest, NextResponse } from "next/server";
import { query, queryOne, withTransaction } from "@/lib/db-client";
import { hashPassword, signSession, setSessionCookie } from "@/lib/auth";

// GET → { hasAdmin: boolean }
export async function GET() {
  try {
    const row = await queryOne<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM users WHERE role = 'admin'`,
    );
    const hasAdmin = row ? Number(row.count) > 0 : false;
    return NextResponse.json({ hasAdmin });
  } catch (e: any) {
    console.error("[/api/auth/admin GET]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST → create the FIRST admin (fails if one already exists)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, password } = body;

    if (!name || !phone || !email || !password) {
      return NextResponse.json(
        { error: "name, phone, email, password are required" },
        { status: 400 },
      );
    }
    if (!/^\d{10}$/.test(String(phone))) {
      return NextResponse.json({ error: "phone must be 10 digits" }, { status: 400 });
    }
    if (String(password).length < 6) {
      return NextResponse.json(
        { error: "password must be at least 6 characters" },
        { status: 400 },
      );
    }

    // ---- bootstrap guard ----
    const existing = await queryOne<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM users WHERE role = 'admin'`,
    );
    if (existing && Number(existing.count) > 0) {
      return NextResponse.json(
        { error: "An admin already exists. Admin signup is closed." },
        { status: 403 },
      );
    }

    // ---- duplicate phone ----
    const dup = await queryOne<{ id: number }>(
      `SELECT id FROM users WHERE phone = $1`, [phone],
    );
    if (dup) {
      return NextResponse.json(
        { error: "An account with this phone already exists" },
        { status: 409 },
      );
    }

    const hash = await hashPassword(password);

    const admin = await withTransaction(async (client) => {
      const { rows: [user] } = await client.query(
        `INSERT INTO users (phone, name, email, role, password_hash)
         VALUES ($1, $2, $3, 'admin', $4)
         RETURNING id, phone, name, email, role`,
        [phone, name, email, hash],
      );
      return user;
    });

    const token = await signSession({
      userId: admin.id,
      role: "admin",
      name: admin.name,
    });
    await setSessionCookie(token);

    return NextResponse.json({ ok: true, user: admin });
  } catch (e: any) {
    console.error("[/api/auth/admin POST]", e);
    return NextResponse.json(
      { error: e.message ?? "Admin creation failed" },
      { status: 500 },
    );
  }
}