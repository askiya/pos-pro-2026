import "server-only";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { verifyJWT } from "@/lib/auth";

export interface SessionTokenPayload {
  id: string;
  name: string;
  username?: string;
  email: string;
  role: string;
  branchId?: string;
  trialEndsAt?: string | null;
  licenseActive?: boolean;
}

class BackendConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BackendConfigurationError";
  }
}

class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

const BACKEND_API_URL = (process.env.LARAVEL_API_URL?.trim() ?? "").replace(/\/$/, "");
const BACKEND_API_KEY = process.env.LARAVEL_INTERNAL_API_KEY ?? "pospro-v2-internal-dev-key";

export function getBackendApiUrl() {
  return BACKEND_API_URL;
}

export function getBackendUnavailableMessage() {
  if (!BACKEND_API_URL) {
    return "Backend POS PRO belum dikonfigurasi. Isi LARAVEL_API_URL di pos-pro-web/.env lalu restart frontend Next.js.";
  }

  return `Backend POS PRO belum dapat dihubungi. Pastikan Laravel API aktif di ${BACKEND_API_URL}.`;
}

export function getBackendProblemMessage() {
  if (!BACKEND_API_URL) {
    return "Backend POS PRO belum dikonfigurasi. Isi LARAVEL_API_URL di pos-pro-web/.env lalu restart frontend Next.js.";
  }

  return `Backend POS PRO sedang bermasalah. Pastikan Laravel API aktif di ${BACKEND_API_URL}.`;
}

function ensureBackendConfigured() {
  if (!BACKEND_API_URL) {
    throw new BackendConfigurationError(getBackendUnavailableMessage());
  }
}

function backendUrl(path: string, search = "") {
  ensureBackendConfigured();
  return `${BACKEND_API_URL}${path}${search}`;
}

function normalizeJsonPayload(payload: unknown) {
  if (payload === null || payload === undefined) {
    return { ok: true };
  }

  if (typeof payload === "string") {
    return payload ? { message: payload } : { ok: true };
  }

  return payload;
}

export async function getSessionToken(): Promise<SessionTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("pos_auth_token")?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyJWT(token);
  if (
    !payload ||
    typeof payload.id !== "string" ||
    typeof payload.name !== "string" ||
    typeof payload.email !== "string" ||
    typeof payload.role !== "string"
  ) {
    return null;
  }

  return {
    id: payload.id,
    name: payload.name,
    email: payload.email,
    username: typeof payload.username === "string" ? payload.username : undefined,
    role: payload.role,
    branchId: typeof payload.branchId === "string" ? payload.branchId : undefined,
    trialEndsAt:
      typeof payload.trialEndsAt === "string" || payload.trialEndsAt === null
        ? payload.trialEndsAt
        : undefined,
    licenseActive: typeof payload.licenseActive === "boolean" ? payload.licenseActive : undefined,
  };
}

export async function requireSessionToken() {
  const session = await getSessionToken();

  if (!session) {
    throw new UnauthorizedError("Session tidak valid.");
  }

  return session;
}

export async function buildLaravelHeaders(
  inputHeaders?: HeadersInit,
  options: { authRequired?: boolean } = {},
) {
  const headers = new Headers(inputHeaders);
  headers.set("Accept", "application/json");
  headers.set("X-Internal-Api-Key", BACKEND_API_KEY);

  if (options.authRequired !== false) {
    const session = await requireSessionToken();
    headers.set("X-Pos-User-Id", session.id);
    headers.set("X-Pos-User-Role", session.role);
    headers.set("X-Pos-User-Email", session.email);
    headers.set("X-Pos-Branch-Id", session.branchId ?? "");
  }

  return headers;
}

export async function fetchLaravel(
  path: string,
  init: RequestInit = {},
  options: { authRequired?: boolean } = {},
) {
  ensureBackendConfigured();
  const headers = await buildLaravelHeaders(init.headers, options);

  return fetch(backendUrl(path), {
    ...init,
    headers,
    cache: "no-store",
  });
}

export async function readLaravelPayload(response: Response) {
  const text = await response.text();

  if (!text) {
    return { ok: response.ok };
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { error: text };
  }
}

export async function nextJsonFromLaravel(response: Response) {
  const payload = normalizeJsonPayload(await readLaravelPayload(response));
  return NextResponse.json(payload, { status: response.status });
}

export async function proxyToLaravel(
  request: Request,
  path: string,
  options: { authRequired?: boolean } = {},
) {
  try {
    const url = new URL(request.url);
    const headers = await buildLaravelHeaders(undefined, options);
    const method = request.method.toUpperCase();
    const contentType = request.headers.get("content-type");

    if (contentType) {
      headers.set("Content-Type", contentType);
    }

    const init: RequestInit = {
      method,
      headers,
      cache: "no-store",
    };

    if (method !== "GET" && method !== "HEAD") {
      const body = await request.text();
      if (body) {
        init.body = body;
      }
    }

    const response = await fetch(backendUrl(path, url.search), init);
    return nextJsonFromLaravel(response);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      {
        error:
          error instanceof BackendConfigurationError
            ? error.message
            : getBackendUnavailableMessage(),
      },
      { status: error instanceof BackendConfigurationError ? 500 : 502 },
    );
  }
}
