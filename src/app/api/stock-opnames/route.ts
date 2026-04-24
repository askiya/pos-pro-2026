export async function POST(request: Request) {
  const { proxyToLaravel } = await import("@/lib/backend-api");
  return proxyToLaravel(request, "/stock-opnames");
}
