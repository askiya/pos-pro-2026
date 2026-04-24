import { proxyToLaravel } from "@/lib/backend-api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return proxyToLaravel(request, "/reports");
}
