import { NextResponse } from "next/server";

import { createAuthSessionResponse } from "@/app/api/auth/shared";
import {
  fetchLaravel,
  getBackendProblemMessage,
  getBackendUnavailableMessage,
  readLaravelPayload,
  type SessionTokenPayload,
} from "@/lib/backend-api";

function resolveSessionPayload(
  payload: {
    user?: SessionTokenPayload;
  } & Partial<SessionTokenPayload>,
): SessionTokenPayload | null {
  const candidate = payload.user && typeof payload.user === "object"
    ? payload.user
    : payload;

  if (!candidate?.id || !candidate.email || !candidate.role || !candidate.name) {
    return null;
  }

  return {
    id: candidate.id,
    name: candidate.name,
    username: candidate.username,
    email: candidate.email,
    role: candidate.role,
    branchId: candidate.branchId,
    trialEndsAt: candidate.trialEndsAt,
    licenseActive: candidate.licenseActive,
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      username?: string;
      email?: string;
      password?: string;
      passwordConfirmation?: string;
    };

    const name = body.name?.trim() ?? "";
    const username = body.username?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const password = body.password?.trim() ?? "";
    const passwordConfirmation = body.passwordConfirmation?.trim() ?? "";

    if (!name || !username || !email || !password || !passwordConfirmation) {
      return NextResponse.json(
        { error: "Nama, username, email, password, dan konfirmasi password wajib diisi." },
        { status: 400 },
      );
    }

    const backendResponse = await fetchLaravel(
      "/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          username,
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      },
      { authRequired: false },
    );

    const payload = (await readLaravelPayload(backendResponse)) as {
      error?: string;
      errors?: Record<string, unknown>;
      user?: SessionTokenPayload;
    } & Partial<SessionTokenPayload>;

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          error:
            payload?.error ||
            (backendResponse.status >= 500
              ? getBackendProblemMessage()
              : "Pendaftaran trial belum berhasil."),
          errors: payload?.errors ?? null,
        },
        { status: backendResponse.status },
      );
    }

    const session = resolveSessionPayload(payload);
    if (!session) {
      return NextResponse.json({ error: "Data session dari backend tidak lengkap." }, { status: 502 });
    }

    return createAuthSessionResponse(request, session, 201);
  } catch {
    return NextResponse.json(
      {
        error: getBackendUnavailableMessage(),
      },
      { status: 502 },
    );
  }
}
