import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signJWT } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { branch: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Since we seeded the DB with plain 'password', we fallback if bcrypt fails and the string matches.
    // In a real production app, all passwords would be hashed.
    let isValid = false;
    if (user.password === password) {
      // It matches plaintext (from seed)
      isValid = true;
    } else {
      isValid = await bcrypt.compare(password, user.password);
    }

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create JWT
    const token = await signJWT({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      branchId: user.branchId,
      branchName: user.branch?.name
    });

    // Set cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: 'pos_auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 day
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
