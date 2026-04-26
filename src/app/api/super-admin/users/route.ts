import { NextResponse } from "next/server";
import { proxyToLaravel, requireSessionToken } from "@/lib/backend-api";

export async function GET(request: Request) {
  try {
    const session = await requireSessionToken();
    if (session.email !== process.env.SUPER_ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized Super Admin" }, { status: 403 });
    }
    
    return proxyToLaravel(request, "/super-admin/users");
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 401 });
  }
}
