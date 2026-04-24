export async function readApiPayload(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export function toApiArray<T>(payload: unknown): T[] {
  return Array.isArray(payload) ? (payload as T[]) : [];
}

export function toApiObject<T>(payload: unknown): T | null {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    return payload as T;
  }

  return null;
}

export function getApiErrorMessage(
  payload: unknown,
  fallback = "Terjadi kendala saat memuat data.",
) {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  const record = toApiObject<Record<string, unknown>>(payload);
  if (!record) {
    return fallback;
  }

  if (typeof record.error === "string" && record.error.trim()) {
    return record.error;
  }

  if (typeof record.message === "string" && record.message.trim()) {
    return record.message;
  }

  const validationErrors = record.errors;
  if (
    validationErrors &&
    typeof validationErrors === "object" &&
    !Array.isArray(validationErrors)
  ) {
    for (const value of Object.values(validationErrors as Record<string, unknown>)) {
      if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) {
        return value[0];
      }

      if (typeof value === "string" && value.trim()) {
        return value;
      }
    }
  }

  return fallback;
}
