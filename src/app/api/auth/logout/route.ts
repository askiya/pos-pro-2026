import { NextResponse } from "next/server";

import { fetchLaravel } from "@/lib/backend-api";

export async function POST() {
  try {
    await fetchLaravel("/logout", { method: "POST" });
  } catch {
    // Cookie tetap dibersihkan walau backend sedang tidak aktif.
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("pos_auth_token", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
