export async function GET(request: Request) {
  const { proxyToLaravel } = await import("@/lib/backend-api");
  return proxyToLaravel(request, "/products");
}

export async function POST(request: Request) {
  const { proxyToLaravel } = await import("@/lib/backend-api");
  return proxyToLaravel(request, "/products");
}
