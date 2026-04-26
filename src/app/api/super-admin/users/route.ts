import { NextResponse } from "next/server";
import { proxyToLaravel, requireSessionToken } from "@/lib/backend-api";

export async function GET(request: Request) {
  try {
    const session = await requireSessionToken();
    if (session.email !== process.env.SUPER_ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized Super Admin" }, { status: 403 });
    }
    
    return proxyToLaravel(request, "/super-admin/users");
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
