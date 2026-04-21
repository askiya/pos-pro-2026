import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PaymentType } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, paymentType, discount = 0, customerId } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Order items are required' }, { status: 400 });
    }

    if (!paymentType || !Object.values(PaymentType).includes(paymentType)) {
      return NextResponse.json({ error: 'Valid payment type is required' }, { status: 400 });
    }

    // Calculate totals on the server for security
    let subtotal = 0;
    const orderItemsData: { productId: string; quantity: number; price: import('@prisma/client').Prisma.Decimal }[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 404 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 400 });
      }

      const itemTotal = Number(product.price) * item.quantity;
      subtotal += itemTotal;

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price
      });
    }

    const subtotalAfterDiscount = Math.max(0, subtotal - discount);
    const taxAmount = subtotalAfterDiscount * 0.11; // 11% Tax
    const totalAmount = subtotalAfterDiscount + taxAmount;

    // Generate Order Number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });
    const orderNumber = `TRX-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;

    // Execute Transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          totalAmount,
          taxAmount,
          discount,
          paymentType,
          customerId,
          items: {
            create: orderItemsData
          }
        },
        include: {
          items: true,
          customer: true
        }
      });

      // 2. Decrement Stock
      for (const item of orderItemsData) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity }
          }
        });
      }

      return order;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
