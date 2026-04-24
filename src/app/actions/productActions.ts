"use server";

import { fetchLaravel, readLaravelPayload } from "@/lib/backend-api";

export async function getProducts() {
  try {
    const response = await fetchLaravel("/products", {}, { authRequired: false });
    const payload = await readLaravelPayload(response);
    return Array.isArray(payload) ? payload : [];
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}
