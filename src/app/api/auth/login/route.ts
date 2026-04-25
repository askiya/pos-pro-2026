import { NextResponse } from "next/server";

import {
  fetchLaravel,
  getBackendProblemMessage,
  getBackendUnavailableMessage,
  readLaravelPayload,
  type SessionTokenPayload,
} from "@/lib/backend-api";
import { createAuthSessionResponse } from "@/app/api/auth/shared";

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
      identifier?: string;
      email?: string;
      password?: string;
      isGoogle?: boolean;
      googleIdToken?: string;
    };
    const identifier = body.identifier?.trim() ?? body.email?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const password = body.password?.trim() ?? "";
    const isGoogle = body.isGoogle === true;
    const googleIdToken = body.googleIdToken?.trim() ?? "";

    if (!isGoogle && (!(identifier || email) || !password)) {
      return NextResponse.json({ error: "Username/email dan password wajib diisi." }, { status: 400 });
    }

    if (isGoogle && !googleIdToken) {
      return NextResponse.json({ error: "Google credential wajib ada." }, { status: 400 });
    }

    const backendEndpoint = isGoogle ? "/login/google" : "/login";
    const backendBody = isGoogle
      ? { id_token: googleIdToken }
      : { identifier: identifier || email, password };

    const backendResponse = await fetchLaravel(
      backendEndpoint,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backendBody),
      },
      { authRequired: false },
    );

    const payload = (await readLaravelPayload(backendResponse)) as {
      error?: string;
      errors?: Record<string, unknown>;
      user?: SessionTokenPayload;
    } & Partial<SessionTokenPayload>;

    if (!backendResponse.ok) {
      const fallbackError =
        backendResponse.status >= 500
          ? getBackendProblemMessage()
          : isGoogle
            ? "Gagal masuk menggunakan Google."
            : "Username/email atau password salah.";

      return NextResponse.json(
        {
          error: payload?.error || fallbackError,
          errors: payload?.errors ?? null,
        },
        { status: backendResponse.status },
      );
    }

    const session = resolveSessionPayload(payload);
    if (!session) {
      return NextResponse.json({ error: "Data session dari backend tidak lengkap." }, { status: 502 });
    }

    return createAuthSessionResponse(request, session);
  } catch {
    return NextResponse.json(
      {
        error: getBackendUnavailableMessage(),
      },
      { status: 502 },
    );
  }
}
