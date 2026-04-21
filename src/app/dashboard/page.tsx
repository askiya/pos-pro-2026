"use client";
import { useEffect, useState } from "react";
import ResponsiveLayout from "@/components/layout/ResponsiveLayout";
import MetricCard from "@/components/ui/MetricCard";

// ─── Types ───────────────────────────────────────────────────────────────────
interface RecentOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  paymentType: string;
  status: string;
  createdAt: string;
  customer: { name: string } | null;
  items: { quantity: number }[];
}
interface DayData {
  label: string;
  revenue: number;
  transactions: number;
}
interface DashboardStats {
  today: { revenue: number; transactions: number };
  month: { revenue: number; transactions: number };
  lowStockProducts: { id: string; name: string; stock: number }[];
  totalProducts: number;
  totalCustomers: number;
  recentOrders: RecentOrder[];
  dailyChart: DayData[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n);

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "Baru saja";
  if (m < 60) return `${m} mnt lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  return `${Math.floor(h / 24)} hari lalu`;
};

const PAYMENT_LABEL: Record<string, string> = {
  CASH: "Tunai", TRANSFER: "Transfer", QRIS: "QRIS", SPLIT: "Split",
};

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────
function DashboardBarChart({ data }: { data: DayData[] }) {
  const maxRev = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div className="flex items-end gap-1.5 h-40 w-full">
      {data.map((d, i) => {
        const isToday = i === data.length - 1;
        const pct = (d.revenue / maxRev) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
              <div className="bg-on-surface text-surface text-[10px] px-2 py-1 rounded-lg whitespace-nowrap shadow-lg">
                Rp {fmt(d.revenue)}<br />{d.transactions} trx
              </div>
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-on-surface" />
            </div>
            {/* Bar */}
            <div className="w-full flex flex-col justify-end" style={{ height: "120px" }}>
              <div
                className={`w-full rounded-t-md transition-all duration-500 ${
                  isToday
                    ? "bg-gradient-to-t from-secondary to-[#6ffbbe]"
                    : "bg-surface-container-high group-hover:bg-secondary/50"
                }`}
                style={{ height: `${Math.max(pct, 3)}%` }}
              />
            </div>
            <span className={`text-[10px] font-medium ${isToday ? "text-secondary font-semibold" : "text-on-surface-variant"}`}>
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Sk({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-surface-container-high ${className}`} />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((d: DashboardStats) => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <ResponsiveLayout>
      <div className="flex-1 p-6 pb-24 md:pb-6 overflow-y-auto w-full">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* ── Header ──────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">Overview</h1>
              <p className="font-body text-sm text-on-surface-variant mt-1">
                Performa hari ini di semua cabang.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="px-4 py-2 bg-surface-container-highest text-on-surface rounded-lg font-body text-sm font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-secondary">calendar_today</span>
                Hari Ini
              </div>
            </div>
          </div>

          {/* ── KPI Cards ────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Revenue Hari Ini"
              value={loading ? "..." : `Rp ${fmt(stats?.today.revenue ?? 0)}`}
              icon="payments"
              trend={{
                value: loading ? "..." : `${stats?.month.transactions ?? 0} order bulan ini`,
                icon: "trending_up",
                isPositive: true,
              }}
            />
            <MetricCard
              title="Transaksi Hari Ini"
              value={loading ? "..." : String(stats?.today.transactions ?? 0)}
              icon="receipt_long"
              trend={{
                value: loading ? "..." : `Rp ${fmt(stats?.month.revenue ?? 0)} bulan ini`,
                icon: "trending_up",
                isPositive: true,
              }}
            />
            <MetricCard
              title="Total Produk"
              value={loading ? "..." : String(stats?.totalProducts ?? 0)}
              icon="inventory_2"
              subtitle={loading ? "..." : `${stats?.totalCustomers ?? 0} pelanggan terdaftar`}
            />
            <MetricCard
              title="Stok Kritis"
              value={loading ? "..." : String(stats?.lowStockProducts.length ?? 0)}
              icon="warning"
              subtitle={
                loading
                  ? "..."
                  : (stats?.lowStockProducts.length ?? 0) > 0
                  ? stats!.lowStockProducts[0].name
                  : "Semua stok aman"
              }
              isAlert={(stats?.lowStockProducts.length ?? 0) > 0}
            />
          </div>

          {/* ── Main Grid ────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left: Chart + Low Stock */}
            <div className="lg:col-span-2 space-y-6">
              {/* Revenue Chart */}
              <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/10">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-headline text-lg font-bold text-on-surface">Revenue 7 Hari</h3>
                    <p className="text-xs text-on-surface-variant font-body mt-0.5">Hover untuk melihat detail</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-secondary" />
                    <span className="font-body text-xs text-on-surface-variant">Revenue</span>
                  </div>
                </div>
                {loading ? (
                  <div className="flex items-end gap-1.5 h-40">
                    {[65, 40, 80, 55, 90, 70, 95].map((h, i) => (
                      <div key={i} className="flex-1 animate-pulse rounded-t-md bg-surface-container-high"
                        style={{ height: `${h}%` }} />
                    ))}
                  </div>
                ) : stats?.dailyChart && stats.dailyChart.length > 0 ? (
                  <DashboardBarChart data={stats.dailyChart} />
                ) : (
                  <div className="h-40 flex items-center justify-center text-on-surface-variant text-sm font-body">
                    Belum ada data transaksi.
                  </div>
                )}
              </div>

              {/* Top Selling (dari low stock jadi lebih berguna) */}
              <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/10">
                <h3 className="font-headline text-lg font-bold text-on-surface mb-4">Stok Perlu Perhatian</h3>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => <Sk key={i} className="h-8 w-full" />)}
                  </div>
                ) : (stats?.lowStockProducts.length ?? 0) === 0 ? (
                  <div className="flex items-center gap-3 p-4 bg-[#e6f5f0] rounded-xl">
                    <span className="material-symbols-outlined text-[#005236]">check_circle</span>
                    <p className="font-body text-sm text-[#005236] font-medium">Semua stok produk dalam kondisi aman! 🎉</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {stats!.lowStockProducts.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-3 hover:bg-surface-container-highest rounded-xl transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-error-container/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-error text-[16px]">warning</span>
                          </div>
                          <span className="font-body text-sm font-medium text-on-surface">{p.name}</span>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          p.stock === 0 ? "bg-error-container/40 text-error" : "bg-yellow-50 text-yellow-700"
                        }`}>
                          {p.stock === 0 ? "HABIS" : `${p.stock} pcs`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Recent Transactions */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/10">
                <h3 className="font-headline text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">Aksi Cepat</h3>
                <div className="grid grid-cols-2 gap-3">
                  <a href="/purchase-orders" className="flex flex-col items-center justify-center p-3 bg-surface-container hover:bg-surface-container-highest rounded-lg transition-colors gap-2 text-on-surface font-body text-xs font-medium">
                    <span className="material-symbols-outlined text-[20px] text-secondary">add_shopping_cart</span>
                    Purchase Order
                  </a>
                  <a href="/inventory" className="flex flex-col items-center justify-center p-3 bg-surface-container hover:bg-surface-container-highest rounded-lg transition-colors gap-2 text-on-surface font-body text-xs font-medium">
                    <span className="material-symbols-outlined text-[20px] text-secondary">inventory_2</span>
                    Inventori
                  </a>
                  <a href="/reports" className="flex flex-col items-center justify-center p-3 bg-surface-container hover:bg-surface-container-highest rounded-lg transition-colors gap-2 text-on-surface font-body text-xs font-medium">
                    <span className="material-symbols-outlined text-[20px] text-secondary">bar_chart</span>
                    Laporan
                  </a>
                  <a href="/shifts" className="flex flex-col items-center justify-center p-3 bg-surface-container hover:bg-surface-container-highest rounded-lg transition-colors gap-2 text-on-surface font-body text-xs font-medium">
                    <span className="material-symbols-outlined text-[20px] text-secondary">schedule</span>
                    Shift
                  </a>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/10 flex flex-col">
                <div className="p-5 pb-3 border-b border-surface-container flex justify-between items-center">
                  <h3 className="font-headline text-lg font-bold text-on-surface">Transaksi Terbaru</h3>
                  <a href="/reports" className="text-secondary text-xs font-body font-medium hover:underline">Lihat Semua</a>
                </div>
                <div className="overflow-y-auto flex-1 p-2 max-h-[380px]">
                  {loading ? (
                    <div className="p-3 space-y-3">
                      {[1, 2, 3].map((i) => <Sk key={i} className="h-14 w-full" />)}
                    </div>
                  ) : (stats?.recentOrders.length ?? 0) === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-8 text-on-surface-variant">
                      <span className="material-symbols-outlined text-4xl opacity-30">receipt_long</span>
                      <p className="text-sm font-body">Belum ada transaksi hari ini.</p>
                    </div>
                  ) : (
                    <ul className="space-y-1">
                      {stats!.recentOrders.map((order) => (
                        <li key={order.id} className="flex items-center justify-between p-3 hover:bg-surface-container-highest rounded-xl transition-colors cursor-pointer group">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                              order.status === "CANCELLED"
                                ? "bg-error-container/30 text-error"
                                : "bg-secondary/10 text-secondary"
                            }`}>
                              <span className="material-symbols-outlined text-[18px]">
                                {order.status === "CANCELLED" ? "cancel" : "receipt"}
                              </span>
                            </div>
                            <div>
                              <p className="font-body text-sm font-semibold text-on-surface">{order.orderNumber}</p>
                              <p className="font-body text-xs text-on-surface-variant">
                                {order.customer?.name ?? "Walk-in"} • {timeAgo(order.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`font-headline text-sm font-bold ${order.status === "CANCELLED" ? "line-through text-on-surface-variant" : "text-on-surface"}`}>
                              Rp {fmt(Number(order.totalAmount))}
                            </p>
                            <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium mt-0.5 ${
                              order.status === "CANCELLED"
                                ? "bg-error-container text-on-error-container"
                                : "bg-[#e6f5f0] text-[#005236]"
                            }`}>
                              {order.status === "CANCELLED" ? "Dibatalkan" : PAYMENT_LABEL[order.paymentType] ?? order.paymentType}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </ResponsiveLayout>
  );
}
