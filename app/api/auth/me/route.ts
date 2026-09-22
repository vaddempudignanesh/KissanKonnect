import { NextResponse } from "next/server";
import { readSessionCookie } from "@/lib/auth";
import { queryOne } from "@/lib/db-client";
import {
  getFarmer, getBuyer, getLogistics, getFpo,
} from "@/lib/db";

export async function GET() {
  try {
    const session = await readSessionCookie();
    if (!session) {
      return NextResponse.json({
        user: null, farmer: null, buyer: null, logistics: null, fpo: null,
      });
    }

    const user = await queryOne<{
      id: number;
      phone: string;
      name: string;
      email: string | null;
      role: "farmer" | "buyer" | "logistics" | "fpo" | "admin";
    }>(
      `SELECT id, phone, name, email, role FROM users WHERE id = $1`,
      [session.userId],
    );
    if (!user) {
      return NextResponse.json({
        user: null, farmer: null, buyer: null, logistics: null, fpo: null,
      });
    }

    let farmer = null, buyer = null, logistics = null, fpo = null;

    if (user.role === "farmer") {
      const f = await queryOne<{ id: number }>(
        `SELECT id FROM farmers WHERE user_id = $1`, [user.id],
      );
      if (f) farmer = await getFarmer(f.id);
    } else if (user.role === "buyer") {
      const b = await queryOne<{ id: number }>(
        `SELECT id FROM buyers WHERE user_id = $1`, [user.id],
      );
      if (b) buyer = await getBuyer(b.id);
    } else if (user.role === "logistics") {
      const l = await queryOne<{ id: number }>(
        `SELECT id FROM logistics_profiles WHERE user_id = $1`, [user.id],
      );
      if (l) logistics = await getLogistics(l.id);
    } else if (user.role === "fpo") {
      const f = await queryOne<{ id: number }>(
        `SELECT id FROM fpo_profiles WHERE user_id = $1`, [user.id],
      );
      if (f) fpo = await getFpo(f.id);
    }

    return NextResponse.json({ user, farmer, buyer, logistics, fpo });
  } catch (e: any) {
    console.error("[/api/auth/me]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}