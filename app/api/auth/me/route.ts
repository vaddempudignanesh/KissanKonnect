import { NextResponse } from "next/server";
import { readSessionCookie } from "@/lib/auth";
import { queryOne } from "@/lib/db-client";
import { getFarmer, getBuyer } from "@/lib/db";

export async function GET() {
  try {
    const session = await readSessionCookie();
    if (!session) {
      return NextResponse.json({ user: null, farmer: null, buyer: null });
    }

    const user = await queryOne<{
      id: number;
      phone: string;
      name: string;
      role: "farmer" | "buyer" | "admin";
    }>(
      `SELECT id, phone, name, role FROM users WHERE id = $1`,
      [session.userId],
    );
    if (!user) {
      return NextResponse.json({ user: null, farmer: null, buyer: null });
    }

    let farmer = null;
    let buyer = null;

    if (user.role === "farmer") {
      const f = await queryOne<{ id: number }>(
        `SELECT id FROM farmers WHERE user_id = $1`,
        [user.id],
      );
      if (f) farmer = await getFarmer(f.id);
    } else if (user.role === "buyer") {
      const b = await queryOne<{ id: number }>(
        `SELECT id FROM buyers WHERE user_id = $1`,
        [user.id],
      );
      if (b) buyer = await getBuyer(b.id);
    }

    return NextResponse.json({ user, farmer, buyer });
  } catch (e: any) {
    console.error("[/api/auth/me]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}