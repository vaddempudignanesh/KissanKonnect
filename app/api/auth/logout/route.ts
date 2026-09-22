import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/db/migrations/auth";

export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[/api/auth/logout]", e);
    return NextResponse.json(
      { error: e.message ?? "Logout failed" },
      { status: 500 },
    );
  }
}