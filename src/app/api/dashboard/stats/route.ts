import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Build last 7 days
    const days: { label: string; start: Date; end: Date }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const start = new Date(d); start.setHours(0, 0, 0, 0);
      const end   = new Date(d); end.setHours(23, 59, 59, 999);
      days.push({ label: d.toLocaleDateString('id-ID', { weekday: 'short' }), start, end });
    }

    const [
      todayOrders,
      monthOrders,
      lowStockProducts,
      totalProducts,
      totalCustomers,
      recentOrders,
      dailyRaw,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { createdAt: { gte: todayStart, lte: todayEnd } },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.order.aggregate({
        where: { createdAt: { gte: thisMonthStart } },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.product.findMany({
        where: { stock: { lte: 10 } },
        select: { id: true, name: true, stock: true },
        orderBy: { stock: 'asc' },
        take: 5,
      }),
      prisma.product.count(),
      prisma.customer.count(),
      // Recent 5 orders
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          orderNumber: true,
          totalAmount: true,
          paymentType: true,
          status: true,
          createdAt: true,
          customer: { select: { name: true } },
          items: { select: { quantity: true } },
        },
      }),
      // Daily revenue for last 7 days
      Promise.all(
        days.map((day) =>
          prisma.order.aggregate({
            where: { createdAt: { gte: day.start, lte: day.end } },
            _sum: { totalAmount: true },
            _count: true,
          })
        )
      ),
    ]);

    const dailyChart = days.map((day, i) => ({
      label:        day.label,
      revenue:      Number(dailyRaw[i]._sum.totalAmount ?? 0),
      transactions: dailyRaw[i]._count,
    }));

    return NextResponse.json({
      today: {
        revenue:      Number(todayOrders._sum.totalAmount ?? 0),
        transactions: todayOrders._count,
      },
      month: {
        revenue:      Number(monthOrders._sum.totalAmount ?? 0),
        transactions: monthOrders._count,
      },
      lowStockProducts,
      totalProducts,
      totalCustomers,
      recentOrders,
      dailyChart,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
