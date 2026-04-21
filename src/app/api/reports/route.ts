import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();

    // ── Date boundaries ──────────────────────────────────────────
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // ── Build last-7-days date array ──────────────────────────────
    const days: { label: string; start: Date; end: Date }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const start = new Date(d);
      start.setHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setHours(23, 59, 59, 999);
      days.push({
        label: d.toLocaleDateString('id-ID', { weekday: 'short' }),
        start,
        end,
      });
    }

    // ── Parallel queries ──────────────────────────────────────────
    const [
      monthOrders,
      lastMonthOrders,
      totalTransactions,
      lastMonthTxCount,
      topProducts,
      lowStock,
      totalCustomers,
      dailyRaw,
    ] = await Promise.all([
      // This month revenue
      prisma.order.aggregate({
        where: { createdAt: { gte: thisMonthStart } },
        _sum: { totalAmount: true },
        _count: true,
      }),
      // Last month revenue (for % change)
      prisma.order.aggregate({
        where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
        _sum: { totalAmount: true },
        _count: true,
      }),
      // Total transactions ever
      prisma.order.count(),
      // Last month tx count
      prisma.order.count({
        where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
      }),
      // Top selling products
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true, price: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
      // Low stock products
      prisma.product.findMany({
        where: { stock: { lte: 10 } },
        select: { name: true, stock: true, sku: true },
        orderBy: { stock: 'asc' },
        take: 5,
      }),
      // Total customers
      prisma.customer.count(),
      // Daily revenue for the last 7 days
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

    // ── Enrich top products with names ────────────────────────────
    const productIds = topProducts.map((p) => p.productId);
    const productDetails = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, sku: true, category: { select: { name: true } } },
    });
    const productMap = Object.fromEntries(productDetails.map((p) => [p.id, p]));

    const enrichedTopProducts = topProducts.map((p) => ({
      productId:  p.productId,
      name:       productMap[p.productId]?.name ?? 'Unknown',
      sku:        productMap[p.productId]?.sku ?? '-',
      category:   productMap[p.productId]?.category?.name ?? '-',
      unitsSold:  p._sum.quantity ?? 0,
      revenue:    Number(p._sum.price ?? 0),
    }));

    // ── Compute % changes ─────────────────────────────────────────
    const thisRevenue  = Number(monthOrders._sum.totalAmount ?? 0);
    const lastRevenue  = Number(lastMonthOrders._sum.totalAmount ?? 0);
    const revenuePct   = lastRevenue === 0 ? null : ((thisRevenue - lastRevenue) / lastRevenue) * 100;

    const thisTxCount  = monthOrders._count;
    const lastTxCount  = lastMonthTxCount;
    const txPct        = lastTxCount === 0 ? null : ((thisTxCount - lastTxCount) / lastTxCount) * 100;

    const avgOrderValue   = thisTxCount > 0 ? thisRevenue / thisTxCount : 0;
    const lastAvgOrder    = lastMonthOrders._count > 0 ? lastRevenue / lastMonthOrders._count : 0;
    const avgOrderPct     = lastAvgOrder === 0 ? null : ((avgOrderValue - lastAvgOrder) / lastAvgOrder) * 100;

    // ── Build daily chart data ────────────────────────────────────
    const dailyChart = days.map((day, i) => ({
      label:        day.label,
      revenue:      Number(dailyRaw[i]._sum.totalAmount ?? 0),
      transactions: dailyRaw[i]._count,
    }));

    return NextResponse.json({
      kpi: {
        monthRevenue:  thisRevenue,
        revenuePct,
        monthTx:       thisTxCount,
        txPct,
        avgOrderValue,
        avgOrderPct,
        totalCustomers,
        totalTransactions,
      },
      dailyChart,
      topProducts: enrichedTopProducts,
      lowStock,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}
