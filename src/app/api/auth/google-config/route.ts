import { NextResponse } from "next/server";

import { fetchLaravel, getBackendUnavailableMessage, readLaravelPayload } from "@/lib/backend-api";

export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

function jsonResponse(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: NO_STORE_HEADERS,
  });
}

function resolveLocalGoogleClientId() {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ||
    process.env.GOOGLE_CLIENT_ID?.trim() ||
    ""
  );
}

export async function GET() {
  const localClientId = resolveLocalGoogleClientId();

  if (localClientId) {
    return jsonResponse({
      ok: true,
      googleEnabled: true,
      clientId: localClientId,
      source: "web-env",
      backendReachable: null,
      reason: "frontend_client_id_ready",
    });
  }

  try {
    const backendResponse = await fetchLaravel(
      "/google/config",
      { method: "GET" },
      { authRequired: false },
    );
    const payload = (await readLaravelPayload(backendResponse)) as {
      client_id?: string | null;
      error?: string;
    };
    const backendClientId =
      typeof payload.client_id === "string" ? payload.client_id.trim() : "";

    if (!backendResponse.ok) {
      return jsonResponse(
        {
          ok: false,
          googleEnabled: false,
          clientId: "",
          source: "backend",
          backendReachable: false,
          reason: "backend_unavailable",
          error: payload.error ?? getBackendUnavailableMessage(),
        },
        backendResponse.status,
      );
    }

    return jsonResponse({
      ok: true,
      googleEnabled: backendClientId.length > 0,
      clientId: backendClientId,
      source: "backend",
      backendReachable: true,
      reason:
        backendClientId.length > 0
          ? "backend_client_id_ready"
          : "backend_client_id_missing",
    });
  } catch {
    return jsonResponse(
      {
        ok: false,
        googleEnabled: false,
        clientId: "",
        source: "backend",
        backendReachable: false,
        reason: "backend_unavailable",
        error: getBackendUnavailableMessage(),
      },
      502,
    );
  }
}
