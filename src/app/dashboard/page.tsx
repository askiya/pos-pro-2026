"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

import ResponsiveLayout from "@/components/layout/ResponsiveLayout";
import { readApiPayload, toApiObject } from "@/lib/client-api";

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

type KpiTone = "indigo" | "emerald" | "amber" | "coral";

const PAYMENT_LABEL: Record<string, string> = {
  CASH: "Tunai",
  TRANSFER: "Transfer",
  QRIS: "QRIS",
  SPLIT: "Split",
};

const palette = [
  { name: "Royal Indigo", hex: "#a277ff", note: "Brand & fokus" },
  { name: "Emerald Mint", hex: "#12b981", note: "Growth & aman" },
  { name: "Amber Coral", hex: "#f59e0b", note: "Alert & aksi" },
];

const quickActions = [
  {
    href: "/",
    icon: "point_of_sale",
    title: "Buka Kasir",
    subtitle: "Mulai transaksi",
    tone: "from-[#271744] to-[#a277ff]",
  },
  {
    href: "/purchase-orders",
    icon: "add_shopping_cart",
    title: "Purchase Order",
    subtitle: "Restock cepat",
    tone: "from-[#a277ff] to-[#7c3aed]",
  },
  {
    href: "/inventory",
    icon: "inventory_2",
    title: "Inventori",
    subtitle: "Cek stok",
    tone: "from-[#047857] to-[#12b981]",
  },
  {
    href: "/reports",
    icon: "analytics",
    title: "Laporan",
    subtitle: "Pantau performa",
    tone: "from-[#b45309] to-[#f59e0b]",
  },
];

const toneClass: Record<KpiTone, { icon: string; glow: string; pill: string; line: string }> = {
  indigo: {
    icon: "bg-[#f5edff] text-[#a277ff]",
    glow: "from-[#a277ff]/18 to-transparent",
    pill: "bg-[#f5edff] text-[#8657ea]",
    line: "from-[#a277ff] to-[#8b5cf6]",
  },
  emerald: {
    icon: "bg-[#e6f7ef] text-[#047857]",
    glow: "from-[#12b981]/18 to-transparent",
    pill: "bg-[#e6f7ef] text-[#047857]",
    line: "from-[#047857] to-[#12b981]",
  },
  amber: {
    icon: "bg-[#fff7df] text-[#b45309]",
    glow: "from-[#f59e0b]/18 to-transparent",
    pill: "bg-[#fff7df] text-[#b45309]",
    line: "from-[#f59e0b] to-[#fb7185]",
  },
  coral: {
    icon: "bg-[#fff1f2] text-[#be123c]",
    glow: "from-[#fb7185]/18 to-transparent",
    pill: "bg-[#fff1f2] text-[#be123c]",
    line: "from-[#fb7185] to-[#f59e0b]",
  },
};

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(Number(n) || 0);

const compactMoney = (n: number) => {
  const value = Number(n) || 0;
  if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)}M`;
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 1_000) return `Rp ${Math.round(value / 1000)}rb`;
  return `Rp ${fmt(value)}`;
};

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} mnt lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hari lalu`;
};

function Skeleton({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return <div className={`animate-pulse rounded-[22px] bg-white/70 ${className}`} style={style} />;
}

function DashboardBarChart({ data }: { data: DayData[] }) {
  const maxRevenue = Math.max(...data.map((item) => Number(item.revenue) || 0), 1);

  return (
    <div className="relative h-[200px] rounded-xl border border-white/70 bg-white/55 p-3 sm:p-4">
      <div className="pointer-events-none absolute inset-x-5 bottom-[74px] top-5 grid grid-rows-4">
        {[0, 1, 2, 3].map((line) => (
          <div key={line} className="border-t border-dashed border-[#d4c8e3]/80" />
        ))}
      </div>

      <div className="relative flex h-full items-end gap-2 sm:gap-3">
        {data.map((item, index) => {
          const isToday = index === data.length - 1;
          const revenue = Number(item.revenue) || 0;
          const percent = revenue > 0 ? Math.max((revenue / maxRevenue) * 100, 12) : 7;
          const style = {
            "--bar-height": `${percent}%`,
            "--delay": `${index * 70}ms`,
          } as CSSProperties;

          return (
            <div key={`${item.label}-${index}`} className="group flex h-full min-w-0 flex-1 flex-col justify-end gap-3">
              <div className="relative flex h-[140px] items-end">
                <div className="absolute bottom-full left-1/2 z-20 mb-3 hidden -translate-x-1/2 rounded-xl border border-white/65 bg-[#271744] px-3 py-2 text-center text-[10px] font-semibold text-white shadow-[0_20px_44px_-24px_rgba(17,24,39,0.7)] group-hover:block">
                  <span className="block whitespace-nowrap">{compactMoney(revenue)}</span>
                  <span className="block whitespace-nowrap text-white/65">{item.transactions} transaksi</span>
                </div>
                <div className="h-full w-full rounded-full bg-[#eef1fb] p-1">
                  <div
                    className={`dashboard-bar-fill min-h-[12px] w-full rounded-full bg-gradient-to-t ${
                      isToday ? "from-[#a277ff] via-[#12b981] to-[#a7f3d0]" : "from-[#c9cff8] to-[#f5edff]"
                    } shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] group-hover:from-[#a277ff] group-hover:to-[#12b981]`}
                    style={{ ...style, height: "var(--bar-height)" }}
                  />
                </div>
              </div>
              <div className={`truncate text-center text-xs font-bold ${isToday ? "text-[#a277ff]" : "text-on-surface-variant"}`}>
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  icon,
  tone,
  meta,
  delay,
}: {
  title: string;
  value: string;
  icon: string;
  tone: KpiTone;
  meta: string;
  delay: number;
}) {
  const toneStyle = toneClass[tone];

  return (
    <section
      className="dashboard-entrance group relative overflow-hidden rounded-xl border border-white/70 bg-white/78 p-4 shadow-[0_24px_70px_-48px_rgba(39, 23, 68,0.38)] transition duration-300 hover:-translate-y-1 hover:bg-white"
      style={{ "--delay": `${delay}ms` } as CSSProperties}
    >
      <div className={`pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-gradient-to-br ${toneStyle.glow}`} />
      <div className={`absolute inset-x-5 bottom-0 h-1 rounded-full bg-gradient-to-r ${toneStyle.line}`} />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant/70">{title}</p>
          <h3 className="mt-2 font-headline text-2xl font-black tracking-[-0.05em] text-on-surface sm:text-3xl">
            {value}
          </h3>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneStyle.icon}`}>
          <span className="material-symbols-outlined icon-fill text-[20px]">{icon}</span>
        </div>
      </div>

      <div className={`relative mt-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${toneStyle.pill}`}>
        <span className="material-symbols-outlined text-[13px]">auto_graph</span>
        {meta}
      </div>
    </section>
  );
}

function HeroStat({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-xl border border-white/16 bg-white/10 p-3 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/58">{label}</span>
        <span className="material-symbols-outlined text-[16px] text-[#a7f3d0]">{icon}</span>
      </div>
      <div className="mt-2 font-headline text-lg font-black tracking-[-0.04em]">{value}</div>
    </div>
  );
}

function QuickActionCard({
  href,
  icon,
  title,
  subtitle,
  tone,
}: {
  href: string;
  icon: string;
  title: string;
  subtitle: string;
  tone: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-xl border border-white/70 bg-white/75 p-3 shadow-[0_18px_44px_-36px_rgba(39, 23, 68,0.32)] transition duration-300 hover:-translate-y-1 hover:bg-white"
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tone}`} />
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tone} text-white shadow-[0_18px_34px_-26px_rgba(162, 119, 255,0.8)]`}>
          <span className="material-symbols-outlined icon-fill text-[20px]">{icon}</span>
        </div>
        <div className="min-w-0">
          <p className="truncate font-headline text-xs font-black text-on-surface">{title}</p>
          <p className="mt-0.5 truncate text-[10px] font-medium text-on-surface-variant">{subtitle}</p>
        </div>
        <span className="material-symbols-outlined ml-auto text-[18px] text-on-surface-variant transition group-hover:translate-x-1 group-hover:text-[#a277ff]">
          arrow_forward
        </span>
      </div>
    </Link>
  );
}

function RecentOrderRow({ order }: { order: RecentOrder }) {
  const isCancelled = order.status === "CANCELLED";
  const quantity = (order.items ?? []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  return (
    <li className="group rounded-lg border border-transparent bg-white/58 p-2.5 transition duration-300 hover:border-white hover:bg-white hover:shadow-[0_18px_50px_-40px_rgba(39, 23, 68,0.38)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              isCancelled ? "bg-[#fff1f2] text-[#be123c]" : "bg-[#f5edff] text-[#a277ff]"
            }`}
          >
            <span className="material-symbols-outlined icon-fill text-[18px]">
              {isCancelled ? "cancel" : "receipt_long"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="truncate font-headline text-sm font-black text-on-surface">{order.orderNumber}</p>
            <p className="truncate text-xs font-medium text-on-surface-variant">
              {order.customer?.name ?? "Walk-in"} - {quantity || 1} item - {timeAgo(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className={`font-headline text-sm font-black ${isCancelled ? "text-on-surface-variant line-through" : "text-on-surface"}`}>
            Rp {fmt(Number(order.totalAmount))}
          </p>
          <span
            className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${
              isCancelled ? "bg-[#fff1f2] text-[#be123c]" : "bg-[#e6f7ef] text-[#047857]"
            }`}
          >
            {isCancelled ? "Batal" : PAYMENT_LABEL[order.paymentType] ?? order.paymentType}
          </span>
        </div>
      </div>
    </li>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats");
        if (!response.ok) {
          setStats(null);
          return;
        }

        const payload = await readApiPayload(response);
        if (!cancelled) {
          setStats(toApiObject<DashboardStats>(payload));
        }
      } catch {
        if (!cancelled) {
          setStats(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadStats();

    return () => {
      cancelled = true;
    };
  }, []);

  const lowStockCount = stats?.lowStockProducts?.length ?? 0;
  const stockHealth = useMemo(() => {
    if (loading) return "Memuat inventory";
    if (lowStockCount === 0) return "Stok sehat";
    if (lowStockCount < 3) return "Perlu pantauan";
    return "Butuh restock";
  }, [loading, lowStockCount]);

  const dailyChart = stats?.dailyChart ?? [];
  const recentOrders = stats?.recentOrders ?? [];

  return (
    <ResponsiveLayout>
      <div className="dashboard-page h-full overflow-y-auto px-4 py-5 pb-28 sm:px-5 md:px-6 md:pb-8">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4">
          <section className="dashboard-entrance dashboard-sheen relative overflow-hidden rounded-2xl border border-white/70 bg-[linear-gradient(135deg,#271744_0%,#5c3d99_48%,#a277ff_100%)] p-4 text-white shadow-[0_28px_90px_-56px_rgba(17,24,39,0.78)] sm:p-6">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#12b981]/24" />
            <div className="pointer-events-none absolute bottom-0 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-[#f59e0b]/16" />

            <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)] xl:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white/75">
                  <span className="h-2 w-2 rounded-full bg-[#12b981] dashboard-soft-pulse" />
                  Live Business Cockpit
                </div>
                <h1 className="mt-4 max-w-3xl font-headline text-2xl font-black tracking-[-0.06em] text-white sm:text-3xl xl:text-4xl">
                  Dashboard yang lebih cepat, jelas, dan siap dipakai tim cabang.
                </h1>
                <p className="mt-3 max-w-2xl text-xs font-medium leading-6 text-white/72 sm:text-sm">
                  Pantau sales, transaksi, stok kritis, dan aksi operasional dari satu layar yang lebih premium.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {palette.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-3 py-2 text-xs font-bold text-white/82">
                      <span className="h-3 w-3 rounded-full" style={{ background: item.hex }} />
                      <span>{item.name}</span>
                      <span className="hidden text-white/45 sm:inline">/ {item.note}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <HeroStat
                  label="Sales Hari Ini"
                  value={loading ? "Memuat" : `Rp ${fmt(stats?.today?.revenue ?? 0)}`}
                  icon="payments"
                />
                <HeroStat
                  label="Transaksi"
                  value={loading ? "Memuat" : `${stats?.today?.transactions ?? 0} order`}
                  icon="receipt_long"
                />
                <HeroStat label="Inventory" value={stockHealth} icon="inventory_2" />
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Revenue Hari Ini"
              value={loading ? "..." : `Rp ${fmt(stats?.today?.revenue ?? 0)}`}
              icon="paid"
              tone="indigo"
              meta={loading ? "Sinkronisasi data" : `${stats?.month?.transactions ?? 0} order bulan ini`}
              delay={50}
            />
            <KpiCard
              title="Transaksi Hari Ini"
              value={loading ? "..." : String(stats?.today?.transactions ?? 0)}
              icon="bolt"
              tone="emerald"
              meta={loading ? "Memuat aktivitas" : `${compactMoney(stats?.month?.revenue ?? 0)} bulan ini`}
              delay={110}
            />
            <KpiCard
              title="Total Produk"
              value={loading ? "..." : String(stats?.totalProducts ?? 0)}
              icon="inventory_2"
              tone="amber"
              meta={loading ? "Memuat katalog" : `${stats?.totalCustomers ?? 0} pelanggan terdaftar`}
              delay={170}
            />
            <KpiCard
              title="Stok Kritis"
              value={loading ? "..." : String(lowStockCount)}
              icon="emergency_home"
              tone={lowStockCount > 0 ? "coral" : "emerald"}
              meta={stockHealth}
              delay={230}
            />
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,0.8fr)]">
            <div className="flex flex-col gap-4">
              <section className="dashboard-entrance rounded-2xl border border-white/70 bg-white/75 p-4 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)] sm:p-5" style={{ "--delay": "280ms" } as CSSProperties}>
                <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a277ff]/70">Revenue Flow</p>
                    <h2 className="mt-1 font-headline text-xl font-black tracking-[-0.05em] text-on-surface">Revenue 7 Hari</h2>
                    <p className="mt-1 text-xs font-medium text-on-surface-variant">Hover bar untuk detail transaksi.</p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-[#f5edff] px-2.5 py-1.5 text-[10px] font-black text-[#8657ea]">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#12b981]" />
                    Live revenue
                  </div>
                </div>

                {loading ? (
                  <div className="grid h-[200px] grid-cols-7 items-end gap-2 rounded-xl border border-white/70 bg-white/55 p-4">
                    {[58, 36, 72, 48, 82, 64, 90].map((height, index) => (
                      <Skeleton key={index} className="w-full rounded-full" style={{ height: `${height}%` } as CSSProperties} />
                    ))}
                  </div>
                ) : dailyChart.length > 0 ? (
                  <DashboardBarChart data={dailyChart} />
                ) : (
                  <div className="flex h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-[#d4c8e3] bg-white/55 text-center p-4">
                    <span className="material-symbols-outlined text-3xl text-[#c9cff8]">monitoring</span>
                    <p className="mt-2 font-headline text-base font-black text-on-surface">Belum ada transaksi</p>
                    <p className="mt-1 max-w-sm text-xs text-on-surface-variant">Begitu transaksi masuk, grafik akan hidup otomatis.</p>
                  </div>
                )}
              </section>

              <section className="dashboard-entrance rounded-2xl border border-white/70 bg-white/75 p-4 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)] sm:p-5" style={{ "--delay": "340ms" } as CSSProperties}>
                <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f59e0b]/80">Inventory Radar</p>
                    <h2 className="mt-1 font-headline text-xl font-black tracking-[-0.05em] text-on-surface">Stok Perlu Perhatian</h2>
                  </div>
                  <Link href="/inventory" className="inline-flex items-center gap-2 rounded-full bg-[#fff7df] px-3 py-1.5 text-xs font-black text-[#b45309] hover:bg-[#ffefbd]">
                    Kelola Stok
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Link>
                </div>

                {loading ? (
                  <div className="grid gap-3 md:grid-cols-3">
                    {[1, 2, 3].map((item) => (
                      <Skeleton key={item} className="h-24" />
                    ))}
                  </div>
                ) : lowStockCount === 0 ? (
                  <div className="rounded-xl border border-[#bbf7d0] bg-[linear-gradient(135deg,#ecfdf5_0%,#f8fffb_100%)] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#12b981] text-white shadow-[0_18px_36px_-24px_rgba(18,185,129,0.9)]">
                          <span className="material-symbols-outlined icon-fill text-[20px]">verified</span>
                        </div>
                        <div>
                          <p className="font-headline text-lg font-black text-[#064e3b]">Semua stok aman</p>
                          <p className="mt-0.5 text-xs font-medium text-[#047857]">Tidak ada produk kritis.</p>
                        </div>
                      </div>
                      <div className="rounded-full bg-white/80 px-4 py-2 text-sm font-black text-[#047857]">Healthy inventory</div>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-2 md:grid-cols-2">
                    {stats?.lowStockProducts?.map((product) => (
                      <div key={product.id} className="rounded-xl border border-[#fee2e2] bg-[#fff7f7] p-3 transition hover:-translate-y-0.5 hover:bg-white">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#be123c]">
                              <span className="material-symbols-outlined icon-fill text-[18px]">warning</span>
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-headline text-xs font-black text-on-surface">{product.name}</p>
                              <p className="text-[10px] font-medium text-on-surface-variant">Cek stok cabang</p>
                            </div>
                          </div>
                          <span className="rounded-full bg-[#fff1f2] px-2.5 py-1 text-[10px] font-black text-[#be123c]">
                            {product.stock === 0 ? "Habis" : `${product.stock} pcs`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <aside className="flex flex-col gap-4">
              <section className="dashboard-entrance rounded-2xl border border-white/70 bg-white/75 p-4 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)]" style={{ "--delay": "380ms" } as CSSProperties}>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a277ff]/70">Command Center</p>
                    <h2 className="mt-1 font-headline text-xl font-black tracking-[-0.05em] text-on-surface">Aksi Cepat</h2>
                  </div>
                  <span className="rounded-full bg-[#f5edff] px-2.5 py-1 text-[10px] font-black text-[#8657ea]">4 aksi</span>
                </div>
                <div className="grid gap-3">
                  {quickActions.map((action) => (
                    <QuickActionCard key={action.href} {...action} />
                  ))}
                </div>
              </section>

              <section className="dashboard-entrance min-h-[420px] rounded-2xl border border-white/70 bg-white/75 p-4 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)]" style={{ "--delay": "440ms" } as CSSProperties}>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#12b981]/80">Activity Stream</p>
                    <h2 className="mt-1 font-headline text-xl font-black tracking-[-0.05em] text-on-surface">Transaksi Terbaru</h2>
                  </div>
                  <Link href="/reports" className="rounded-full bg-[#e6f7ef] px-2.5 py-1 text-[10px] font-black text-[#047857] hover:bg-[#d8f8e8]">
                    Semua
                  </Link>
                </div>

                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((item) => (
                      <Skeleton key={item} className="h-20" />
                    ))}
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="flex min-h-[290px] flex-col items-center justify-center rounded-[28px] border border-dashed border-[#d4c8e3] bg-white/55 px-6 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-[#f5edff] text-[#a277ff]">
                      <span className="material-symbols-outlined icon-fill text-[30px]">receipt_long</span>
                    </div>
                    <p className="mt-4 font-headline text-lg font-black text-on-surface">Belum ada transaksi</p>
                    <p className="mt-1 text-sm leading-6 text-on-surface-variant">Mulai transaksi pertama dari POS Cashier, nanti aktivitasnya muncul di sini.</p>
                    <Link href="/" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#a277ff] px-5 py-3 text-sm font-black text-white shadow-[0_18px_38px_-26px_rgba(162, 119, 255,0.9)] hover:bg-[#8657ea]">
                      Buka Kasir
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </Link>
                  </div>
                ) : (
                  <ul className="max-h-[430px] space-y-2 overflow-y-auto pr-1">
                    {recentOrders.map((order) => (
                      <RecentOrderRow key={order.id} order={order} />
                    ))}
                  </ul>
                )}
              </section>
            </aside>
          </section>
        </div>
      </div>
    </ResponsiveLayout>
  );
}
