import { NextResponse } from "next/server";

import { signJWT } from "@/lib/auth";
import type { SessionTokenPayload } from "@/lib/backend-api";

export async function createAuthSessionResponse(
  request: Request,
  session: SessionTokenPayload,
  status = 200,
) {
  const token = await signJWT({
    id: session.id,
    name: session.name,
    username: session.username ?? "",
    email: session.email,
    role: session.role,
    branchId: session.branchId ?? "",
    trialEndsAt: session.trialEndsAt ?? null,
    licenseActive: session.licenseActive ?? false,
  });

  const response = NextResponse.json(
    {
      ok: true,
      user: session,
      redirectTo: "/dashboard",
    },
    { status },
  );

  response.cookies.set("pos_auth_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: request.url.startsWith("https://") || process.env.FORCE_SECURE_COOKIES === "true",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return response;
}
