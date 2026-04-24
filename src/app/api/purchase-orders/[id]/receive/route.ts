export async function POST(
  request: Request,
  context: { params: { id: string } },
) {
  const { proxyToLaravel } = await import("@/lib/backend-api");
  const { id } = context.params;

  return proxyToLaravel(request, `/purchase-orders/${id}/receive`);
}
