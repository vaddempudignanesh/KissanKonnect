import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db-client";
import { verifyPassword, signSession, setSessionCookie } from "@/db/migrations/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json(
        { error: "phone and password are required" },
        { status: 400 },
      );
    }

    const user = await queryOne<{
      id: number;
      name: string;
      role: "farmer" | "buyer" | "admin";
      password_hash: string | null;
    }>(
      `SELECT id, name, role, password_hash FROM users WHERE phone = $1`,
      [phone],
    );

    if (!user || !user.password_hash) {
      return NextResponse.json(
        { error: "Invalid phone or password" },
        { status: 401 },
      );
    }

    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) {
      return NextResponse.json(
        { error: "Invalid phone or password" },
        { status: 401 },
      );
    }

    // Update last login
    await queryOne(
      `UPDATE users SET last_login_at = NOW() WHERE id = $1`,
      [user.id],
    );

    // Sign session
    const token = await signSession({
      userId: user.id,
      role: user.role,
      name: user.name,
    });
    await setSessionCookie(token);

    return NextResponse.json({
      ok: true,
      user: { id: user.id, name: user.name, role: user.role },
    });
  } catch (e: any) {
    console.error("[/api/auth/login]", e);
    return NextResponse.json(
      { error: e.message ?? "Login failed" },
      { status: 500 },
    );
  }
}