const encoder = new TextEncoder();
const decoder = new TextDecoder();
const secretKey = encoder.encode(process.env.JWT_SECRET || "super-secret-fallback-key-2026");

function base64UrlEncode(input: string | Uint8Array) {
  const bytes = typeof input === "string" ? encoder.encode(input) : input;
  let binary = "";

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function createSignature(signingInput: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    secretKey,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(signingInput));

  return base64UrlEncode(new Uint8Array(signature));
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return diff === 0;
}

export async function signJWT(payload: Record<string, unknown>) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64UrlEncode(JSON.stringify({ ...payload, iat: now, exp: now + 60 * 60 * 24 }));
  const signingInput = `${header}.${body}`;
  const signature = await createSignature(signingInput);

  return `${signingInput}.${signature}`;
}

export async function verifyJWT(token: string) {
  try {
    const [header, body, signature] = token.split(".");
    if (!header || !body || !signature) {
      return null;
    }

    const expectedSignature = await createSignature(`${header}.${body}`);
    if (!safeEqual(signature, expectedSignature)) {
      return null;
    }

    const payload = JSON.parse(decoder.decode(base64UrlDecode(body))) as Record<string, unknown>;
    const expiresAt = typeof payload.exp === "number" ? payload.exp : 0;
    if (expiresAt && expiresAt < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
