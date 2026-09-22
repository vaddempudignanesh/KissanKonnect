import { NextRequest, NextResponse } from "next/server";
import { query, queryOne, withTransaction } from "@/lib/db-client";
import { hashPassword, signSession, setSessionCookie } from "@/db/migrations/auth";

type Role = "farmer" | "buyer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, phone, password, role,
      // farmer fields
      village, district, state,
      // buyer fields
      companyName, city, buyerType,
    } = body;

    // ---- validate ----
    if (!name || !phone || !password || !role) {
      return NextResponse.json(
        { error: "name, phone, password, role are required" },
        { status: 400 },
      );
    }
    if (!/^\d{10}$/.test(String(phone))) {
      return NextResponse.json(
        { error: "phone must be 10 digits" },
        { status: 400 },
      );
    }
    if (String(password).length < 6) {
      return NextResponse.json(
        { error: "password must be at least 6 characters" },
        { status: 400 },
      );
    }
    if (role !== "farmer" && role !== "buyer") {
      return NextResponse.json(
        { error: "role must be farmer or buyer" },
        { status: 400 },
      );
    }

    // ---- check duplicate phone ----
    const existing = await queryOne<{ id: number }>(
      `SELECT id FROM users WHERE phone = $1`,
      [phone],
    );
    if (existing) {
      return NextResponse.json(
        { error: "An account with this phone already exists" },
        { status: 409 },
      );
    }

    // ---- create user + profile in a transaction ----
    const passwordHash = await hashPassword(password);

    const result = await withTransaction(async (client) => {
      const { rows: [user] } = await client.query(
        `INSERT INTO users (phone, name, role, password_hash)
         VALUES ($1, $2, $3, $4)
         RETURNING id, phone, name, role`,
        [phone, name, role, passwordHash],
      );

      if (role === "farmer") {
        await client.query(
          `INSERT INTO farmers
             (user_id, village, district, state, latitude, longitude,
              land_size_acres, verified, rating)
           VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE, 0)`,
          [
            user.id,
            village ?? "",
            district ?? "",
            state ?? "",
            null, null, null,
          ],
        );
      } else {
        await client.query(
          `INSERT INTO buyers
             (user_id, company_name, buyer_type, city, state,
              latitude, longitude, rating, verified)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 0, FALSE)`,
          [
            user.id,
            companyName ?? name,
            buyerType ?? "local",
            city ?? "",
            state ?? "",
            null, null,
          ],
        );
      }

      return user;
    });

    // ---- sign session cookie ----
    const token = await signSession({
      userId: result.id,
      role: result.role,
      name: result.name,
    });
    await setSessionCookie(token);

    return NextResponse.json({
      ok: true,
      user: result,
    });
  } catch (e: any) {
    console.error("[/api/auth/signup]", e);
    return NextResponse.json(
      { error: e.message ?? "Signup failed" },
      { status: 500 },
    );
  }
}