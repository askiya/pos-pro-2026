import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { POStatus } from '@prisma/client';

export async function GET() {
  try {
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      include: {
        items: {
          include: {
            product: { select: { name: true, sku: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    return NextResponse.json(purchaseOrders);
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return NextResponse.json({ error: 'Failed to fetch purchase orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { supplier, items } = body;

    if (!supplier || !items || items.length === 0) {
      return NextResponse.json({ error: 'Supplier name and items are required' }, { status: 400 });
    }

    // Calculate total
    let totalAmount = 0;
    for (const item of items) {
      totalAmount += item.quantity * item.unitCost;
    }

    // Generate PO number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await prisma.purchaseOrder.count();
    const poNumber = `PO-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        supplier,
        totalAmount,
        status: POStatus.DRAFT,
        items: {
          create: items.map((item: { productId: string; quantity: number; unitCost: number }) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitCost: item.unitCost
          }))
        }
      },
      include: {
        items: { include: { product: { select: { name: true } } } }
      }
    });

    return NextResponse.json(purchaseOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating purchase order:', error);
    return NextResponse.json({ error: 'Failed to create purchase order' }, { status: 500 });
  }
}

