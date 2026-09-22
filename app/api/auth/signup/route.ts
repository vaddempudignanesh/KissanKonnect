import { NextRequest, NextResponse } from "next/server";
import { queryOne, withTransaction } from "@/lib/db-client";
import { hashPassword, signSession, setSessionCookie } from "@/lib/auth";
import type { SessionRole } from "@/lib/auth";

// Allowed roles for regular signup (admin is via /api/auth/admin only)
const ALLOWED_ROLES: SessionRole[] = ["farmer", "buyer", "logistics", "fpo"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, phone, password, role,
      // farmer fields
      village, district, state,
      // buyer fields
      companyName, city, buyerType,
      // logistics fields
      contactName, vehicleCount, serviceRadius,
      // fpo fields
      fpoName, memberCount,
    } = body;

    // ---- validate ----
    if (!name || !phone || !password || !role) {
      return NextResponse.json(
        { error: "name, phone, password, role are required" },
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
    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json(
        { error: `role must be one of: ${ALLOWED_ROLES.join(", ")}` },
        { status: 400 },
      );
    }

    // ---- duplicate phone check ----
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
        if (!village || !district || !state) {
          throw new Error("village, district and state are required for farmers");
        }
        await client.query(
          `INSERT INTO farmers
             (user_id, village, district, state, verified, rating)
           VALUES ($1, $2, $3, $4, FALSE, 0)`,
          [user.id, village, district, state],
        );
      } else if (role === "buyer") {
        if (!companyName || !city || !state) {
          throw new Error("companyName, city and state are required for buyers");
        }
        await client.query(
          `INSERT INTO buyers
             (user_id, company_name, buyer_type, city, state, verified, rating)
           VALUES ($1, $2, $3, $4, $5, FALSE, 0)`,
          [user.id, companyName, buyerType ?? "local", city, state],
        );
      } else if (role === "logistics") {
        if (!companyName || !city || !state) {
          throw new Error("companyName, city and state are required for logistics");
        }
        await client.query(
          `INSERT INTO logistics_profiles
             (user_id, company_name, contact_name, city, state,
              vehicle_count, service_radius, verified, rating)
           VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE, 0)`,
          [
            user.id,
            companyName,
            contactName ?? name,
            city,
            state,
            Number(vehicleCount) || 1,
            Number(serviceRadius) || 100,
          ],
        );
      } else if (role === "fpo") {
        if (!fpoName || !village || !district || !state) {
          throw new Error("fpoName, village, district and state are required for FPOs");
        }
        await client.query(
          `INSERT INTO fpo_profiles
             (user_id, fpo_name, contact_name, village, district, state,
              member_count, verified, rating)
           VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE, 0)`,
          [
            user.id,
            fpoName,
            contactName ?? name,
            village,
            district,
            state,
            Number(memberCount) || 0,
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

    return NextResponse.json({ ok: true, user: result });
  } catch (e: any) {
    console.error("[/api/auth/signup]", e);
    return NextResponse.json(
      { error: e.message ?? "Signup failed" },
      { status: 500 },
    );
  }
}