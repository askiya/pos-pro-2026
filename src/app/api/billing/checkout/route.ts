import { NextResponse } from "next/server";
import { proxyToLaravel, requireSessionToken } from "@/lib/backend-api";

export async function POST(request: Request) {
  try {
    const session = await requireSessionToken();
    
    // proxyToLaravel automatically forwards the POST body and attaches the auth headers
    return proxyToLaravel(request, '/billing/checkout');
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 401 });
  }
}
