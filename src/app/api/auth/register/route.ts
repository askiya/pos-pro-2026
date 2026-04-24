import { NextResponse } from "next/server";

import { createAuthSessionResponse } from "@/app/api/auth/shared";
import { fetchLaravel, readLaravelPayload, type SessionTokenPayload } from "@/lib/backend-api";

const BACKEND_API_URL = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000/api";

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
    };

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          error:
            payload?.error ||
            (backendResponse.status >= 500
              ? `Backend POS PRO sedang bermasalah. Jalankan Laravel API lewat ${BACKEND_API_URL}.`
              : "Pendaftaran trial belum berhasil."),
          errors: payload?.errors ?? null,
        },
        { status: backendResponse.status },
      );
    }

    const session = payload.user;
    if (!session?.id || !session.email || !session.role) {
      return NextResponse.json({ error: "Data session dari backend tidak lengkap." }, { status: 502 });
    }

    return createAuthSessionResponse(request, session, 201);
  } catch {
    return NextResponse.json(
      {
        error: `Backend POS PRO belum dapat dihubungi. Pastikan Laravel API aktif di ${BACKEND_API_URL}.`,
      },
      { status: 502 },
    );
  }
}
