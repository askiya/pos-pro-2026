import { NextResponse } from "next/server";

import { fetchLaravel, readLaravelPayload, type SessionTokenPayload } from "@/lib/backend-api";
import { createAuthSessionResponse } from "@/app/api/auth/shared";

const BACKEND_API_URL = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000/api";

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
    };

    if (!backendResponse.ok) {
      const fallbackError =
        backendResponse.status >= 500
          ? `Backend POS PRO sedang bermasalah. Jalankan Laravel API lewat ${BACKEND_API_URL}.`
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

    const session = payload.user;
    if (!session?.id || !session.email || !session.role) {
      return NextResponse.json({ error: "Data session dari backend tidak lengkap." }, { status: 502 });
    }

    return createAuthSessionResponse(request, session);
  } catch {
    return NextResponse.json(
      {
        error: `Backend POS PRO belum dapat dihubungi. Pastikan Laravel API aktif di ${BACKEND_API_URL}.`,
      },
      { status: 502 },
    );
  }
}
