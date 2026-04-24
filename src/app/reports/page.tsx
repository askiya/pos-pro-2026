"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

import ResponsiveLayout from "@/components/layout/ResponsiveLayout";
import { useToast } from "@/components/ui/ToastProvider";
import { getApiErrorMessage, readApiPayload, toApiObject } from "@/lib/client-api";
import { formatCurrency, formatNumber } from "@/lib/format";

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

type ReportTone = "indigo" | "emerald" | "amber" | "coral";

const reportPalette = [
  { name: "Midnight Analytics", value: "#271744", label: "Panel insight" },
  { name: "Electric Indigo", value: "#a277ff", label: "Revenue focus" },
  { name: "Amber Signal", value: "#f59e0b", label: "Alert bisnis" },
];

const emptyKpi: KPI = {
  monthRevenue: 0,
  revenuePct: null,
  monthTx: 0,
  txPct: null,
  avgOrderValue: 0,
  avgOrderPct: null,
  totalCustomers: 0,
  totalTransactions: 0,
};

const emptyDailyChart: DayData[] = [];
const emptyTopProducts: TopProduct[] = [];
const emptyLowStock: LowStockItem[] = [];

const toneClass: Record<ReportTone, { icon: string; chip: string; line: string; glow: string }> = {
  indigo: {
    icon: "bg-[#f5edff] text-[#a277ff]",
    chip: "bg-[#f5edff] text-[#8657ea]",
    line: "from-[#a277ff] to-[#8b5cf6]",
    glow: "from-[#a277ff]/20 to-transparent",
  },
  emerald: {
    icon: "bg-[#e6f7ef] text-[#047857]",
    chip: "bg-[#e6f7ef] text-[#047857]",
    line: "from-[#047857] to-[#12b981]",
    glow: "from-[#12b981]/20 to-transparent",
  },
  amber: {
    icon: "bg-[#fff7df] text-[#b45309]",
    chip: "bg-[#fff7df] text-[#b45309]",
    line: "from-[#f59e0b] to-[#fb7185]",
    glow: "from-[#f59e0b]/20 to-transparent",
  },
  coral: {
    icon: "bg-[#fff1f2] text-[#be123c]",
    chip: "bg-[#fff1f2] text-[#be123c]",
    line: "from-[#fb7185] to-[#f59e0b]",
    glow: "from-[#fb7185]/20 to-transparent",
  },
};

function getTrendTone(value: number | null): ReportTone {
  if (value === null) return "indigo";
  return value >= 0 ? "emerald" : "coral";
}

function getTrendLabel(value: number | null) {
  if (value === null) return "Belum ada pembanding";
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}% vs bulan lalu`;
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reports");
      const payload = await readApiPayload(res);

      if (!res.ok) {
        const message = getApiErrorMessage(payload, "Data laporan belum bisa dimuat.");
        setError(message);
        setData(null);
        showToast({
          title: "Reports belum bisa dimuat",
          description: message,
          variant: "error",
        });
        return;
      }

      const reports = toApiObject<ReportsData>(payload);
      if (!reports?.kpi) {
        setError("Format data laporan tidak valid.");
        setData(null);
        return;
      }

      setData({
        kpi: reports.kpi,
        dailyChart: reports.dailyChart ?? [],
        topProducts: reports.topProducts ?? [],
        lowStock: reports.lowStock ?? [],
      });
      setError(null);
    } catch (fetchError) {
      console.error("Failed to fetch reports:", fetchError);
      setError("Data laporan belum bisa dimuat. Coba refresh halaman.");
      setData(null);
      showToast({
        title: "Reports belum bisa dimuat",
        description: "Cek koneksi backend atau coba ulang beberapa saat lagi.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  const kpi = data?.kpi ?? emptyKpi;
  const chartData = data?.dailyChart ?? emptyDailyChart;
  const topProducts = data?.topProducts ?? emptyTopProducts;
  const lowStock = data?.lowStock ?? emptyLowStock;

  const reportStats = useMemo(() => {
    const weekRevenue = chartData.reduce((sum, item) => sum + Number(item.revenue), 0);
    const weekTransactions = chartData.reduce((sum, item) => sum + Number(item.transactions), 0);
    const bestDay = chartData.reduce<DayData | null>((best, item) => {
      if (!best || item.revenue > best.revenue) return item;
      return best;
    }, null);
    const bestProduct = topProducts[0] ?? null;
    const riskStock = lowStock.filter((item) => item.stock === 0).length;

    return {
      weekRevenue,
      weekTransactions,
      bestDay,
      bestProduct,
      riskStock,
    };
  }, [chartData, topProducts, lowStock]);

  return (
    <ResponsiveLayout>
      <div className="h-full overflow-y-auto px-4 py-5 pb-28 md:px-6 md:pb-8">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-6">
          <section className="report-entrance report-sheen relative overflow-hidden rounded-[36px] border border-white/70 bg-[linear-gradient(135deg,#271744_0%,#25245f_48%,#a277ff_100%)] p-5 text-white shadow-[0_28px_90px_-58px_rgba(17,24,39,0.82)] sm:p-7">
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#f59e0b]/22" />
            <div className="pointer-events-none absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-[#12b981]/14" />

            <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(420px,0.8fr)] xl:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-white/75">
                  <span className="h-2 w-2 rounded-full bg-[#f59e0b] report-live-dot" />
                  Analytics Command Center
                </div>
                <h1 className="mt-5 max-w-3xl font-headline text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl xl:text-6xl">
                  Laporan bisnis yang lebih tajam, cepat dibaca, dan siap dipakai ambil keputusan.
                </h1>
                <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-white/72 sm:text-base">
                  Pantau revenue, transaksi, produk terlaris, dan risiko stok dari satu dashboard analitik yang lebih premium.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {reportPalette.map((color) => (
                    <div key={color.name} className="flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-3 py-2 text-xs font-bold text-white/82">
                      <span className="h-3 w-3 rounded-full" style={{ background: color.value }} />
                      <span>{color.name}</span>
                      <span className="hidden text-white/45 sm:inline">/ {color.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <HeroMiniStat label="Revenue" value={formatCurrency(kpi.monthRevenue)} icon="payments" />
                <HeroMiniStat label="Transaksi" value={formatNumber(kpi.monthTx)} icon="receipt_long" />
                <HeroMiniStat label="Best Day" value={reportStats.bestDay?.label ?? "-"} icon="monitoring" />
              </div>
            </div>
          </section>

          {error ? <ReportError message={error} onRetry={() => void fetchReports()} /> : null}

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ReportKpi
              label="Revenue Bulan Ini"
              value={formatCurrency(kpi.monthRevenue)}
              icon="payments"
              tone={getTrendTone(kpi.revenuePct)}
              meta={getTrendLabel(kpi.revenuePct)}
              loading={loading}
              delay={40}
            />
            <ReportKpi
              label="Transaksi Bulan Ini"
              value={formatNumber(kpi.monthTx)}
              icon="receipt_long"
              tone={getTrendTone(kpi.txPct)}
              meta={getTrendLabel(kpi.txPct)}
              loading={loading}
              delay={90}
            />
            <ReportKpi
              label="Rata-rata Order"
              value={formatCurrency(kpi.avgOrderValue)}
              icon="shopping_bag"
              tone={getTrendTone(kpi.avgOrderPct)}
              meta={getTrendLabel(kpi.avgOrderPct)}
              loading={loading}
              delay={140}
            />
            <ReportKpi
              label="Total Pelanggan"
              value={formatNumber(kpi.totalCustomers)}
              icon="groups"
              tone="indigo"
              meta={`${formatNumber(kpi.totalTransactions)} total transaksi`}
              loading={loading}
              delay={190}
            />
          </section>

          <section className="grid gap-3 lg:grid-cols-3">
            <InsightCard
              icon="calendar_month"
              label="Periode Aktif"
              value="Bulan Ini"
              description="Data mengikuti periode laporan aktif dari backend."
              tone="indigo"
              delay={230}
            />
            <InsightCard
              icon="query_stats"
              label="Revenue 7 Hari"
              value={formatCurrency(reportStats.weekRevenue)}
              description={`${formatNumber(reportStats.weekTransactions)} transaksi tercatat di grafik mingguan.`}
              tone="emerald"
              delay={270}
            />
            <InsightCard
              icon={reportStats.riskStock > 0 ? "warning" : "verified"}
              label="Risiko Stok"
              value={reportStats.riskStock > 0 ? `${reportStats.riskStock} habis` : "Aman"}
              description={reportStats.riskStock > 0 ? "Ada item yang perlu diprioritaskan restock." : "Tidak ada stok kosong dari data laporan."}
              tone={reportStats.riskStock > 0 ? "coral" : "emerald"}
              delay={310}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.75fr)]">
            <RevenueChart data={chartData} loading={loading} />
            <LowStockPanel items={lowStock} loading={loading} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
            <TopProductsPanel products={topProducts} loading={loading} />
            <ExecutiveSummary
              bestProduct={reportStats.bestProduct}
              weekRevenue={reportStats.weekRevenue}
              kpi={kpi}
              loading={loading}
              onRefresh={() => void fetchReports()}
            />
          </section>
        </div>
      </div>
    </ResponsiveLayout>
  );
}

function ReportKpi({
  label,
  value,
  icon,
  tone,
  meta,
  loading,
  delay,
}: {
  label: string;
  value: string;
  icon: string;
  tone: ReportTone;
  meta: string;
  loading: boolean;
  delay: number;
}) {
  const style = toneClass[tone];

  return (
    <div
      className="report-entrance group relative overflow-hidden rounded-[30px] border border-white/70 bg-white/78 p-5 shadow-[0_24px_70px_-48px_rgba(39, 23, 68,0.38)] hover:-translate-y-1 hover:bg-white"
      style={{ "--delay": `${delay}ms` } as CSSProperties}
    >
      <div className={`pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-gradient-to-br ${style.glow}`} />
      <div className={`absolute inset-x-5 bottom-0 h-1 rounded-full bg-gradient-to-r ${style.line}`} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant/70">{label}</p>
          {loading ? (
            <div className="mt-4 h-10 w-36 animate-pulse rounded-2xl bg-[#eef1fb]" />
          ) : (
            <p className="mt-4 truncate font-headline text-3xl font-black tracking-[-0.05em] text-on-surface sm:text-4xl">{value}</p>
          )}
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${style.icon}`}>
          <span className="material-symbols-outlined icon-fill text-[23px]">{icon}</span>
        </div>
      </div>
      {loading ? (
        <div className="mt-5 h-8 w-40 animate-pulse rounded-full bg-[#eef1fb]" />
      ) : (
        <div className={`relative mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${style.chip}`}>
          <span className="material-symbols-outlined text-[15px]">analytics</span>
          {meta}
        </div>
      )}
    </div>
  );
}

function InsightCard({
  icon,
  label,
  value,
  description,
  tone,
  delay,
}: {
  icon: string;
  label: string;
  value: string;
  description: string;
  tone: ReportTone;
  delay: number;
}) {
  const style = toneClass[tone];

  return (
    <div
      className="report-entrance group relative overflow-hidden rounded-[28px] border border-white/70 bg-white/76 p-5 shadow-[0_20px_54px_-42px_rgba(39, 23, 68,0.38)] hover:-translate-y-1 hover:bg-white"
      style={{ "--delay": `${delay}ms` } as CSSProperties}
    >
      <div className={`absolute inset-x-5 top-0 h-1 rounded-full bg-gradient-to-r ${style.line}`} />
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant/70">{label}</p>
          <p className="mt-3 truncate font-headline text-2xl font-black tracking-[-0.04em] text-on-surface">{value}</p>
          <p className="mt-2 text-sm font-medium leading-6 text-on-surface-variant">{description}</p>
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${style.icon}`}>
          <span className="material-symbols-outlined text-[23px]">{icon}</span>
        </div>
      </div>
    </div>
  );
}

function RevenueChart({ data, loading }: { data: DayData[]; loading: boolean }) {
  const maxRevenue = Math.max(...data.map((item) => Number(item.revenue)), 1);

  return (
    <section className="report-entrance overflow-hidden rounded-[34px] border border-white/70 bg-white/76 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)]" style={{ "--delay": "350ms" } as CSSProperties}>
      <div className="border-b border-[#ecdfff] px-5 py-4">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#a277ff]/75">Revenue Pulse</p>
            <h2 className="mt-2 font-headline text-2xl font-black tracking-[-0.05em] text-on-surface">Revenue 7 Hari Terakhir</h2>
            <p className="mt-1 text-sm font-medium text-on-surface-variant">Hover bar untuk melihat detail transaksi.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f5edff] px-4 py-2 text-xs font-black text-[#8657ea]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#a277ff]" />
            Revenue
          </div>
        </div>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="grid h-[280px] grid-cols-7 items-end gap-3">
            {[62, 78, 46, 88, 66, 94, 72].map((height, index) => (
              <div key={index} className="rounded-t-[18px] bg-[#eef1fb] report-pulse" style={{ height: `${height}%` }} />
            ))}
          </div>
        ) : data.length === 0 ? (
          <EmptyPanel icon="bar_chart" title="Belum ada revenue" description="Transaksi yang masuk akan otomatis membentuk grafik laporan di sini." />
        ) : (
          <div className="grid h-[300px] grid-cols-7 items-end gap-2 sm:gap-3">
            {data.map((item, index) => {
              const percentage = Math.max(6, (Number(item.revenue) / maxRevenue) * 100);
              return (
                <div key={`${item.label}-${index}`} className="group relative flex h-full flex-col justify-end gap-2">
                  <div className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-20 hidden -translate-x-1/2 rounded-2xl bg-[#271744] px-3 py-2 text-center text-[11px] font-bold text-white shadow-[0_16px_34px_-18px_rgba(17,24,39,0.8)] group-hover:block">
                    <span className="block whitespace-nowrap">{formatCurrency(Number(item.revenue))}</span>
                    <span className="mt-1 block whitespace-nowrap text-white/60">{formatNumber(Number(item.transactions))} transaksi</span>
                  </div>
                  <div className="relative flex flex-1 items-end overflow-hidden rounded-[18px] bg-[#f4f6ff]">
                    <div
                      className="report-bar w-full rounded-[18px] bg-[linear-gradient(180deg,#12b981_0%,#a277ff_100%)] shadow-[0_18px_34px_-20px_rgba(162, 119, 255,0.8)]"
                      style={{ height: `${percentage}%`, "--delay": `${index * 48}ms` } as CSSProperties}
                    />
                  </div>
                  <span className="truncate text-center text-[11px] font-black text-on-surface-variant">{item.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function LowStockPanel({ items, loading }: { items: LowStockItem[]; loading: boolean }) {
  return (
    <section className="report-entrance overflow-hidden rounded-[34px] border border-white/70 bg-white/76 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)]" style={{ "--delay": "390ms" } as CSSProperties}>
      <div className="border-b border-[#ecdfff] px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#f59e0b]/80">Stock Risk</p>
            <h2 className="mt-2 font-headline text-2xl font-black tracking-[-0.05em] text-on-surface">Stok Hampir Habis</h2>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${items.length > 0 ? "bg-[#fff7df] text-[#b45309]" : "bg-[#e6f7ef] text-[#047857]"}`}>
            <span className="material-symbols-outlined icon-fill text-[24px]">{items.length > 0 ? "warning" : "verified"}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-20 animate-pulse rounded-[24px] bg-white/80" />)
        ) : items.length === 0 ? (
          <EmptyPanel icon="inventory_2" title="Stok aman" description="Tidak ada produk yang perlu perhatian dari data laporan saat ini." compact />
        ) : (
          items.map((item, index) => (
            <div
              key={`${item.sku ?? item.name}-${index}`}
              className="report-row rounded-[24px] border border-white/70 bg-white/78 p-4 shadow-[0_18px_42px_-34px_rgba(39, 23, 68,0.38)]"
              style={{ "--delay": `${index * 34}ms` } as CSSProperties}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-headline text-base font-black text-on-surface">{item.name}</p>
                  <p className="mt-1 text-xs font-semibold text-on-surface-variant">{item.sku || "No SKU"}</p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-black ${item.stock === 0 ? "bg-[#fff1f2] text-[#be123c]" : "bg-[#fff7df] text-[#b45309]"}`}>
                  {item.stock === 0 ? "Habis" : `${formatNumber(item.stock)} pcs`}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function TopProductsPanel({ products, loading }: { products: TopProduct[]; loading: boolean }) {
  return (
    <section className="report-entrance overflow-hidden rounded-[34px] border border-white/70 bg-white/76 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)]" style={{ "--delay": "430ms" } as CSSProperties}>
      <div className="border-b border-[#ecdfff] px-5 py-4">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#12b981]/80">Best Sellers</p>
            <h2 className="mt-2 font-headline text-2xl font-black tracking-[-0.05em] text-on-surface">Produk Terlaris</h2>
            <p className="mt-1 text-sm font-medium text-on-surface-variant">Berdasarkan jumlah unit terjual.</p>
          </div>
          <div className="rounded-full bg-[#e6f7ef] px-4 py-2 text-sm font-black text-[#047857]">
            {products.length} produk
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-[28px] bg-white/80" />)
        ) : products.length === 0 ? (
          <EmptyPanel icon="leaderboard" title="Belum ada produk terlaris" description="Produk akan muncul setelah transaksi mulai tercatat." />
        ) : (
          products.map((product, index) => <TopProductRow key={product.productId} product={product} rank={index + 1} delay={index * 34} />)
        )}
      </div>
    </section>
  );
}

function TopProductRow({ product, rank, delay }: { product: TopProduct; rank: number; delay: number }) {
  const rankStyle =
    rank === 1
      ? "bg-[#fff7df] text-[#b45309]"
      : rank === 2
        ? "bg-[#f5edff] text-[#8657ea]"
        : rank === 3
          ? "bg-[#e6f7ef] text-[#047857]"
          : "bg-[#f4f6ff] text-on-surface-variant";

  return (
    <div
      className="report-row grid gap-4 rounded-[28px] border border-white/70 bg-white/78 p-4 shadow-[0_20px_54px_-42px_rgba(39, 23, 68,0.38)] hover:bg-white md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center"
      style={{ "--delay": `${delay}ms` } as CSSProperties}
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl font-headline text-lg font-black ${rankStyle}`}>
        {rank}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate font-headline text-lg font-black tracking-[-0.04em] text-on-surface">{product.name}</h3>
          <span className="rounded-full bg-[#f5edff] px-3 py-1 text-xs font-black text-[#8657ea]">{product.category}</span>
        </div>
        <p className="mt-1 truncate text-xs font-semibold text-on-surface-variant">{product.sku || "No SKU"}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 md:min-w-[260px]">
        <MiniData label="Unit" value={formatNumber(product.unitsSold)} />
        <MiniData label="Revenue" value={formatCurrency(product.revenue)} />
      </div>
    </div>
  );
}

function ExecutiveSummary({
  bestProduct,
  weekRevenue,
  kpi,
  loading,
  onRefresh,
}: {
  bestProduct: TopProduct | null;
  weekRevenue: number;
  kpi: KPI;
  loading: boolean;
  onRefresh: () => void;
}) {
  return (
    <aside className="report-entrance rounded-[34px] border border-white/70 bg-white/76 p-4 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)] xl:sticky xl:top-4" style={{ "--delay": "470ms" } as CSSProperties}>
      <div className="report-sheen relative overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#271744_0%,#a277ff_100%)] p-5 text-white shadow-[0_28px_70px_-44px_rgba(162, 119, 255,0.92)]">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#f59e0b]/20" />
        <div className="relative">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-white/55">Executive Summary</p>
          <h3 className="mt-3 font-headline text-3xl font-black tracking-[-0.05em]">Ringkasan performa</h3>
          <p className="mt-2 text-sm font-medium leading-6 text-white/68">
            Snapshot cepat untuk melihat kondisi penjualan dan prioritas operasional.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <SummaryBox label="Month Revenue" value={loading ? "..." : formatCurrency(kpi.monthRevenue)} />
            <SummaryBox label="7D Revenue" value={loading ? "..." : formatCurrency(weekRevenue)} />
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <DetailStat
          icon="workspace_premium"
          label="Produk unggulan"
          value={loading ? "Memuat" : bestProduct?.name ?? "Belum ada data"}
          description={bestProduct ? `${formatNumber(bestProduct.unitsSold)} unit terjual` : "Akan muncul setelah ada transaksi."}
        />
        <DetailStat
          icon="receipt_long"
          label="Total transaksi"
          value={loading ? "Memuat" : formatNumber(kpi.totalTransactions)}
          description="Akumulasi transaksi dari backend reports."
        />
        <DetailStat
          icon="avg_pace"
          label="Average order"
          value={loading ? "Memuat" : formatCurrency(kpi.avgOrderValue)}
          description="Nilai rata-rata transaksi pada periode aktif."
        />
      </div>

      <button
        onClick={onRefresh}
        className="mt-4 flex w-full items-center justify-between rounded-[26px] bg-[#f5edff] px-5 py-4 text-left text-[#8657ea] hover:-translate-y-0.5 hover:bg-[#e6d9ff]"
        type="button"
      >
        <span className="font-headline text-lg font-black">Refresh laporan</span>
        <span className="material-symbols-outlined text-[22px]">refresh</span>
      </button>
    </aside>
  );
}

function HeroMiniStat({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-[24px] border border-white/16 bg-white/10 p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/55">{label}</span>
        <span className="material-symbols-outlined text-[18px] text-[#fde68a]">{icon}</span>
      </div>
      <div className="mt-3 truncate font-headline text-xl font-black tracking-[-0.04em]">{value}</div>
    </div>
  );
}

function MiniData({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-[#ecdfff] bg-white/70 px-3 py-2 text-center">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-on-surface-variant/60">{label}</p>
      <p className="mt-1 truncate font-headline text-sm font-black text-on-surface">{value}</p>
    </div>
  );
}

function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/14 bg-white/10 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/52">{label}</p>
      <p className="mt-2 truncate font-headline text-lg font-black tracking-[-0.04em] text-white">{value}</p>
    </div>
  );
}

function DetailStat({
  icon,
  label,
  value,
  description,
}: {
  icon: string;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-[#ecdfff] bg-white/72 p-4 shadow-[0_18px_42px_-36px_rgba(39, 23, 68,0.34)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-on-surface-variant/65">{label}</p>
          <p className="mt-1 truncate font-headline text-lg font-black text-on-surface">{value}</p>
          <p className="mt-1 text-sm leading-6 text-on-surface-variant">{description}</p>
        </div>
        <span className="material-symbols-outlined text-[22px] text-[#a277ff]">{icon}</span>
      </div>
    </div>
  );
}

function EmptyPanel({
  icon,
  title,
  description,
  compact = false,
}: {
  icon: string;
  title: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-[30px] border border-dashed border-[#d4c8e3] bg-white/60 p-8 text-center ${compact ? "min-h-[260px]" : "min-h-[300px]"}`}>
      <div className="flex h-20 w-20 items-center justify-center rounded-[30px] bg-[#f5edff] text-[#a277ff]">
        <span className="material-symbols-outlined icon-fill text-4xl">{icon}</span>
      </div>
      <p className="mt-5 font-headline text-2xl font-black text-on-surface">{title}</p>
      <p className="mt-2 max-w-sm text-sm leading-6 text-on-surface-variant">{description}</p>
    </div>
  );
}

function ReportError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="report-entrance rounded-[30px] border border-[#fecdd3] bg-[#fff7f7] p-5 text-[#be123c]" style={{ "--delay": "20ms" } as CSSProperties}>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff1f2]">
            <span className="material-symbols-outlined icon-fill text-[24px]">cloud_off</span>
          </div>
          <div>
            <p className="font-headline text-xl font-black text-on-surface">Gagal memuat laporan</p>
            <p className="mt-1 text-sm font-medium text-on-surface-variant">{message}</p>
          </div>
        </div>
        <button onClick={onRetry} className="rounded-2xl bg-[#be123c] px-5 py-3 text-sm font-black text-white hover:-translate-y-0.5" type="button">
          Muat Ulang
        </button>
      </div>
    </div>
  );
}
