"use client";
import { useState, useEffect } from "react";
import ResponsiveLayout from "@/components/layout/ResponsiveLayout";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DayData {
  label: string;
  revenue: number;
  transactions: number;
}
interface TopProduct {
  productId: string;
  name: string;
  sku: string;
  category: string;
  unitsSold: number;
  revenue: number;
}
interface LowStockItem {
  name: string;
  sku: string | null;
  stock: number;
}
interface KPI {
  monthRevenue: number;
  revenuePct: number | null;
  monthTx: number;
  txPct: number | null;
  avgOrderValue: number;
  avgOrderPct: number | null;
  totalCustomers: number;
  totalTransactions: number;
}
interface ReportsData {
  kpi: KPI;
  dailyChart: DayData[];
  topProducts: TopProduct[];
  lowStock: LowStockItem[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n);

function PctBadge({ pct }: { pct: number | null }) {
  if (pct === null)
    return <span className="text-xs text-on-surface-variant font-body">— no prev data</span>;
  const up = pct >= 0;
  return (
    <div
      className={`flex items-center gap-1 text-xs font-medium font-body ${
        up ? "text-[#005236]" : "text-error"
      }`}
    >
      <span className="material-symbols-outlined text-[14px]">
        {up ? "trending_up" : "trending_down"}
      </span>
      <span>
        {up ? "+" : ""}
        {pct.toFixed(1)}% vs bulan lalu
      </span>
    </div>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-surface-container-high ${className}`}
    />
  );
}

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────
function BarChart({ data }: { data: DayData[] }) {
  const maxRev = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div className="flex items-end gap-2 h-40 w-full">
      {data.map((d, i) => {
        const pct = (d.revenue / maxRev) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
              <div className="bg-on-surface text-surface text-[10px] px-2 py-1 rounded-lg whitespace-nowrap shadow-lg">
                Rp {fmt(d.revenue)}
                <br />
                {d.transactions} transaksi
              </div>
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-on-surface" />
            </div>
            {/* Bar */}
            <div className="w-full relative flex flex-col justify-end" style={{ height: "130px" }}>
              <div
                className="w-full rounded-t-md transition-all duration-500 bg-gradient-to-t from-secondary to-secondary/60 group-hover:from-secondary group-hover:to-[#6ffbbe]"
                style={{ height: `${Math.max(pct, 3)}%` }}
              />
            </div>
            {/* Label */}
            <span className="text-[10px] text-on-surface-variant font-medium">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => {
        if (!r.ok) throw new Error("Gagal mengambil data laporan");
        return r.json();
      })
      .then((d: ReportsData) => {
        setData(d);
        setLoading(false);
      })
      .catch((e: Error) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const kpi = data?.kpi;

  return (
    <ResponsiveLayout>
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-surface pb-24 md:pb-0 w-full">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full">

          {/* ── Header ──────────────────────────────────────────── */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div>
              <h1 className="font-headline font-bold text-3xl md:text-4xl text-on-surface tracking-tight mb-2">
                Reports Hub
              </h1>
              <p className="font-body text-on-surface-variant text-sm md:text-base max-w-xl">
                Insight real-time kinerja penjualan, inventori, dan pelanggan.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-surface-container-highest text-on-surface px-4 py-2.5 rounded-xl font-body text-sm font-medium">
                <span className="material-symbols-outlined text-[18px] text-secondary">calendar_month</span>
                <span>Bulan Ini</span>
              </div>
              {loading && (
                <div className="flex items-center gap-2 text-on-surface-variant text-sm font-body">
                  <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                  Memuat data…
                </div>
              )}
            </div>
          </div>

          {/* ── Error State ─────────────────────────────────────── */}
          {error && (
            <div className="bg-error-container/30 border border-error-container text-on-error-container rounded-xl p-6 mb-8 flex items-center gap-3">
              <span className="material-symbols-outlined text-[24px]">error</span>
              <div>
                <p className="font-headline font-semibold">Gagal memuat laporan</p>
                <p className="font-body text-sm mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* ── KPI Cards ───────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Revenue */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/10 flex flex-col hover:-translate-y-1 transition-transform duration-300">
              <div className="flex justify-between items-start mb-4">
                <span className="font-body text-sm text-on-surface-variant font-medium">Revenue Bulan Ini</span>
                <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                </div>
              </div>
              {loading ? (
                <Skeleton className="h-9 w-3/4 mb-3" />
              ) : (
                <div className="font-headline font-bold text-3xl text-on-surface mb-2">
                  Rp {fmt(kpi?.monthRevenue ?? 0)}
                </div>
              )}
              {loading ? <Skeleton className="h-4 w-1/2" /> : <PctBadge pct={kpi?.revenuePct ?? null} />}
            </div>

            {/* Transactions */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/10 flex flex-col hover:-translate-y-1 transition-transform duration-300">
              <div className="flex justify-between items-start mb-4">
                <span className="font-body text-sm text-on-surface-variant font-medium">Transaksi Bulan Ini</span>
                <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                </div>
              </div>
              {loading ? (
                <Skeleton className="h-9 w-1/2 mb-3" />
              ) : (
                <div className="font-headline font-bold text-3xl text-on-surface mb-2">
                  {fmt(kpi?.monthTx ?? 0)}
                </div>
              )}
              {loading ? <Skeleton className="h-4 w-1/2" /> : <PctBadge pct={kpi?.txPct ?? null} />}
            </div>

            {/* Avg Order */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/10 flex flex-col hover:-translate-y-1 transition-transform duration-300">
              <div className="flex justify-between items-start mb-4">
                <span className="font-body text-sm text-on-surface-variant font-medium">Rata-rata Transaksi</span>
                <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                </div>
              </div>
              {loading ? (
                <Skeleton className="h-9 w-3/4 mb-3" />
              ) : (
                <div className="font-headline font-bold text-3xl text-on-surface mb-2">
                  Rp {fmt(kpi?.avgOrderValue ?? 0)}
                </div>
              )}
              {loading ? <Skeleton className="h-4 w-1/2" /> : <PctBadge pct={kpi?.avgOrderPct ?? null} />}
            </div>

            {/* Customers */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/10 flex flex-col hover:-translate-y-1 transition-transform duration-300">
              <div className="flex justify-between items-start mb-4">
                <span className="font-body text-sm text-on-surface-variant font-medium">Total Pelanggan</span>
                <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[18px]">group</span>
                </div>
              </div>
              {loading ? (
                <Skeleton className="h-9 w-1/2 mb-3" />
              ) : (
                <div className="font-headline font-bold text-3xl text-on-surface mb-2">
                  {fmt(kpi?.totalCustomers ?? 0)}
                </div>
              )}
              {loading ? (
                <Skeleton className="h-4 w-2/3" />
              ) : (
                <p className="text-xs text-on-surface-variant font-body">
                  {fmt(kpi?.totalTransactions ?? 0)} total transaksi
                </p>
              )}
            </div>
          </div>

          {/* ── Chart + Low Stock ────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Bar Chart */}
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/10">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="font-headline font-bold text-lg text-on-surface">Revenue 7 Hari Terakhir</h2>
                  <p className="text-xs text-on-surface-variant font-body mt-0.5">Hover bar untuk detail</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-secondary" />
                  <span className="font-body text-xs text-on-surface-variant">Revenue</span>
                </div>
              </div>
              {loading ? (
                <div className="flex items-end gap-2 h-40">
                  {[65, 80, 50, 90, 75, 95, 70].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 animate-pulse rounded-t-md bg-surface-container-high"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              ) : data?.dailyChart && data.dailyChart.length > 0 ? (
                <BarChart data={data.dailyChart} />
              ) : (
                <div className="h-40 flex items-center justify-center text-on-surface-variant text-sm font-body">
                  Belum ada data transaksi.
                </div>
              )}
            </div>

            {/* Low Stock Panel */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/10">
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-headline font-bold text-lg text-on-surface">Stok Hampir Habis</h2>
                <span className="material-symbols-outlined text-error text-[20px]">warning</span>
              </div>
              {loading ? (
                <div className="flex flex-col gap-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : data?.lowStock && data.lowStock.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {data.lowStock.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surface-container transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="font-label font-semibold text-sm text-on-surface truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-on-surface-variant">{item.sku ?? "—"}</p>
                      </div>
                      <span
                        className={`ml-3 shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${
                          item.stock === 0
                            ? "bg-error-container/40 text-error"
                            : "bg-yellow-50 text-yellow-700"
                        }`}
                      >
                        {item.stock === 0 ? "HABIS" : `${item.stock} pcs`}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-on-surface-variant">
                  <span className="material-symbols-outlined text-3xl opacity-40">inventory_2</span>
                  <p className="text-sm font-body">Stok semua produk aman 👍</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Top Products Table ───────────────────────────────── */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-surface-container gap-4">
              <div>
                <h2 className="font-headline font-bold text-lg text-on-surface">Produk Terlaris</h2>
                <p className="text-xs text-on-surface-variant font-body mt-0.5">Berdasarkan jumlah unit terjual</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-6 flex flex-col gap-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : data?.topProducts && data.topProducts.length > 0 ? (
                <table className="w-full text-left font-body text-sm whitespace-nowrap min-w-[600px]">
                  <thead>
                    <tr className="text-on-surface-variant border-b border-outline-variant/20">
                      <th className="py-3 px-6 font-medium">#</th>
                      <th className="py-3 px-4 font-medium">Nama Produk</th>
                      <th className="py-3 px-4 font-medium">SKU</th>
                      <th className="py-3 px-4 font-medium">Kategori</th>
                      <th className="py-3 px-4 font-medium text-right">Unit Terjual</th>
                      <th className="py-3 px-6 font-medium text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="text-on-surface divide-y divide-surface-container-low">
                    {data.topProducts.map((p, i) => (
                      <tr
                        key={p.productId}
                        className="hover:bg-surface-container-highest transition-colors cursor-default"
                      >
                        <td className="py-3 px-6">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              i === 0
                                ? "bg-yellow-100 text-yellow-700"
                                : i === 1
                                ? "bg-slate-100 text-slate-600"
                                : i === 2
                                ? "bg-orange-100 text-orange-600"
                                : "bg-surface-container text-on-surface-variant"
                            }`}
                          >
                            {i + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium">{p.name}</td>
                        <td className="py-3 px-4 text-on-surface-variant">{p.sku || "—"}</td>
                        <td className="py-3 px-4">
                          <span className="bg-secondary/10 text-secondary text-xs px-2 py-0.5 rounded-full font-medium">
                            {p.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-medium">{fmt(p.unitsSold)}</td>
                        <td className="py-3 px-6 text-right font-mono font-medium">
                          Rp {fmt(p.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-on-surface-variant">
                  <span className="material-symbols-outlined text-5xl opacity-30">bar_chart</span>
                  <p className="font-body text-sm">Belum ada transaksi yang dicatat.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </ResponsiveLayout>
  );
}
