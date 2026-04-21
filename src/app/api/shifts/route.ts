import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ShiftStatus } from '@prisma/client';

export async function GET() {
  try {
    const shifts = await prisma.shift.findMany({
      include: {
        user: { select: { name: true } },
        branch: { select: { name: true } }
      },
      orderBy: { startTime: 'desc' },
      take: 20
    });
    return NextResponse.json(shifts);
  } catch (error) {
    console.error('Error fetching shifts:', error);
    return NextResponse.json({ error: 'Failed to fetch shifts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, shiftId, startingCash, actualCash, userId, branchId } = body;

    // Open a new shift
    if (action === 'open') {
      const shift = await prisma.shift.create({
        data: {
          userId,
          branchId,
          startingCash: parseFloat(startingCash),
          status: ShiftStatus.ACTIVE,
          startTime: new Date()
        },
        include: {
          user: { select: { name: true } },
          branch: { select: { name: true } }
        }
      });
      return NextResponse.json(shift, { status: 201 });
    }

    // Close an existing shift
    if (action === 'close' && shiftId) {
      const shift = await prisma.shift.update({
        where: { id: shiftId },
        data: {
          actualCash: parseFloat(actualCash),
          status: ShiftStatus.CLOSED,
          endTime: new Date()
        }
      });
      return NextResponse.json(shift);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error managing shift:', error);
    return NextResponse.json({ error: 'Failed to manage shift' }, { status: 500 });
  }
}
