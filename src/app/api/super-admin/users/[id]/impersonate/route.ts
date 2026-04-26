import { NextResponse } from "next/server";
import { requireSessionToken, proxyToLaravel } from "@/lib/backend-api";
import { createAuthSessionResponse } from "@/app/api/auth/shared";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Verify caller is Super Admin
    const session = await requireSessionToken();
    if (session.email !== process.env.SUPER_ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized Super Admin" }, { status: 403 });
    }

    // 2. Fetch target user data from body
    // The frontend already has the user data in its state, so to save a backend roundtrip, 
    // it will pass the target user data in the body.
    const body = await request.json();
    const { id, name, email, trialEndsAt, licenseActive } = body;

    if (id !== params.id) {
      return NextResponse.json({ error: "ID mismatch" }, { status: 400 });
    }

    // 3. Create a new session for the target user (Impersonation)
    return createAuthSessionResponse(request, {
      id: id,
      name: name,
      username: email, // Usually username is same as email
      email: email,
      role: "owner", // Assuming the impersonated user is the owner
      branchId: "",
      trialEndsAt: trialEndsAt,
      licenseActive: licenseActive,
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 401 });
  }
}
