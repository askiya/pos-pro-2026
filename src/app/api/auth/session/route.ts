import { proxyToLaravel } from "@/lib/backend-api";

export async function GET(request: Request) {
  return proxyToLaravel(request, "/user");
}
