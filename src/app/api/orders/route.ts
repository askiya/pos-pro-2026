import { proxyToLaravel } from "@/lib/backend-api";

export async function GET(request: Request) {
  return proxyToLaravel(request, "/orders");
}

export async function POST(request: Request) {
  return proxyToLaravel(request, "/orders");
}
