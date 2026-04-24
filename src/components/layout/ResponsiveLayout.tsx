"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { BrandLockup } from "@/components/branding/BrandLogo";
import { useToast } from "@/components/ui/ToastProvider";
import { readApiPayload, toApiObject } from "@/lib/client-api";
import { formatCurrency } from "@/lib/format";
import { getLicenseSummary } from "@/lib/license";

interface SessionData {
  name: string;
  email: string;
  role: string;
  branch: { name: string } | null;
  activeShift: { startTime: string } | null;
  trialEndsAt?: string | null;
  licenseActive?: boolean;
  createdAt?: string;
}

interface DashboardSnapshot {
  today: { revenue: number };
}

type NavEntry = {
  icon: string;
  label: string;
  href?: string;
  onClick?: () => void;
  ability?:
    | "viewDashboard"
    | "viewInventory"
    | "managePurchaseOrders"
    | "manageShifts"
    | "manageCustomers"
    | "viewReports"
    | "managePpob"
    | "manageTransfers"
    | "manageBilling"
    | "manageSettings"
    | "manageBranches"
    | "createOrders";
};

let shellSessionCache: SessionData | null = null;
let shellRevenueCache = 0;
let shellCacheAt = 0;
const SHELL_CACHE_TTL_MS = 30_000;
const ResponsiveLayoutContext = createContext(false);

function isActivePath(pathname: string, href?: string) {
  if (!href) {
    return false;
  }

  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function hasAbility(role: string | undefined, ability?: NavEntry["ability"]) {
  if (!ability) {
    return true;
  }

  const resolvedRole = role ?? "KASIR";
  const permissionMap: Record<NonNullable<NavEntry["ability"]>, string[]> = {
    viewDashboard: ["OWNER", "ADMIN", "MANAGER", "KASIR"],
    viewInventory: ["OWNER", "ADMIN", "MANAGER", "KASIR"],
    managePurchaseOrders: ["OWNER", "ADMIN", "MANAGER"],
    manageShifts: ["OWNER", "ADMIN", "MANAGER", "KASIR"],
    manageCustomers: ["OWNER", "ADMIN", "MANAGER", "KASIR"],
    viewReports: ["OWNER", "ADMIN", "MANAGER"],
    managePpob: ["OWNER", "ADMIN", "MANAGER", "KASIR"],
    manageTransfers: ["OWNER", "ADMIN", "MANAGER"],
    manageBilling: ["OWNER"],
    manageSettings: ["OWNER", "ADMIN"],
    manageBranches: ["OWNER", "ADMIN"],
    createOrders: ["OWNER", "ADMIN", "MANAGER", "KASIR"],
  };

  return permissionMap[ability].includes(resolvedRole);
}

export default function ResponsiveLayout({ children }: { children: React.ReactNode }) {
  const alreadyInsideLayout = useContext(ResponsiveLayoutContext);

  if (alreadyInsideLayout) {
    return <>{children}</>;
  }

  return <ResponsiveShell>{children}</ResponsiveShell>;
}

function ResponsiveShell({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionData | null>(() => shellSessionCache);
  const [todayRevenue, setTodayRevenue] = useState(() => shellRevenueCache);
  const [shiftTimer, setShiftTimer] = useState("Belum ada shift aktif");
  const pathname = usePathname();
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const router = useRouter();
  const { showToast } = useToast();
  const shiftStart = session?.activeShift?.startTime;
  const licenseSummary = useMemo(() => getLicenseSummary(session), [session]);

  useEffect(() => {
    // Whenever pathname actually changes, clear the pending state
    setPendingPath(null);
  }, [pathname]);

  // Use pendingPath if set, otherwise fallback to pathname
  const currentActivePath = pendingPath || pathname;

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      showToast({
        title: "Logout belum berhasil",
        description: "Coba ulangi beberapa saat lagi.",
        variant: "error",
      });
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadShellSnapshot = async () => {
      if (Date.now() - shellCacheAt < SHELL_CACHE_TTL_MS) {
        setSession(shellSessionCache);
        setTodayRevenue(shellRevenueCache);
        return;
      }

      try {
        const [sessionResponse, statsResponse] = await Promise.all([
          fetch("/api/auth/session"),
          fetch("/api/dashboard/stats"),
        ]);

        if (cancelled) {
          return;
        }

        if (sessionResponse.ok) {
          const sessionPayload = await readApiPayload(sessionResponse);
          const nextSession = toApiObject<SessionData>(sessionPayload);
          shellSessionCache = nextSession;
          setSession(nextSession);
        } else if (!shellSessionCache) {
          setSession(null);
        }

        if (statsResponse.ok) {
          const statsPayload = await readApiPayload(statsResponse);
          const stats = toApiObject<DashboardSnapshot>(statsPayload);
          shellRevenueCache = Number(stats?.today?.revenue ?? 0);
          setTodayRevenue(shellRevenueCache);
        } else if (!shellRevenueCache) {
          setTodayRevenue(0);
        }

        shellCacheAt = Date.now();
      } catch {
        if (!cancelled && !shellSessionCache) {
          setSession(null);
          setTodayRevenue(0);
        }
      }
    };

    void loadShellSnapshot();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!shiftStart) {
      setShiftTimer("Belum ada shift aktif");
      return;
    }

    const tick = () => {
      const diff = Date.now() - new Date(shiftStart).getTime();
      const hours = String(Math.floor(diff / 3600000)).padStart(2, "0");
      const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
      const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
      setShiftTimer(`${hours}:${minutes}:${seconds}`);
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [shiftStart]);

  const primaryNav = useMemo<NavEntry[]>(
    () => [
      { icon: "dashboard", label: "Dashboard", href: "/dashboard", ability: "viewDashboard" },
      { icon: "point_of_sale", label: "POS Cashier", href: "/", ability: "createOrders" },
      { icon: "inventory_2", label: "Inventory", href: "/inventory", ability: "viewInventory" },
      { icon: "receipt_long", label: "Purchase Orders", href: "/purchase-orders", ability: "managePurchaseOrders" },
      { icon: "schedule", label: "Shift Management", href: "/shifts", ability: "manageShifts" },
      { icon: "groups", label: "Customer CRM", href: "/crm", ability: "manageCustomers" },
      { icon: "analytics", label: "Reports", href: "/reports", ability: "viewReports" },
      { icon: "payments", label: "PPOB Module", href: "/ppob", ability: "managePpob" },
      { icon: "swap_horiz", label: "Transfers", href: "/transfers", ability: "manageTransfers" },
    ],
    [],
  );

  const utilityNav = useMemo<NavEntry[]>(
    () => [
      { icon: "workspace_premium", label: "Billing", href: "/billing", ability: "manageBilling" },
      { icon: "settings", label: "Settings", href: "/settings", ability: "manageSettings" },
      { icon: "support_agent", label: "Support", href: "/support" },
    ],
    [],
  );

  const headerShortcuts = useMemo<NavEntry[]>(
    () => [
      { icon: "storefront", label: "Branches", href: "/settings?tab=branches", ability: "manageBranches" },
      { icon: "schedule", label: "Shift Management", href: "/shifts", ability: "manageShifts" },
      { icon: "swap_horiz", label: "Transfers", href: "/transfers", ability: "manageTransfers" },
      { icon: "workspace_premium", label: "Billing", href: "/billing", ability: "manageBilling" },
    ],
    [],
  );

  const visiblePrimaryNav = useMemo(
    () => primaryNav.filter((item) => hasAbility(session?.role, item.ability)),
    [primaryNav, session?.role],
  );

  const visibleUtilityNav = useMemo(
    () => utilityNav.filter((item) => hasAbility(session?.role, item.ability)),
    [session?.role, utilityNav],
  );

  const visibleHeaderShortcuts = useMemo(
    () => headerShortcuts.filter((item) => hasAbility(session?.role, item.ability)),
    [headerShortcuts, session?.role],
  );

  const mobileNav = useMemo<NavEntry[]>(() => {
      const items: NavEntry[] = [
        { icon: "dashboard", label: "Home", href: "/dashboard", ability: "viewDashboard" },
        { icon: "point_of_sale", label: "POS", href: "/", ability: "createOrders" },
        { icon: "receipt_long", label: "Orders", href: "/purchase-orders", ability: "managePurchaseOrders" },
        { icon: "groups", label: "CRM", href: "/crm", ability: "manageCustomers" },
        { icon: "settings", label: "More", href: "/settings", ability: "manageSettings" },
      ];

      return items.filter((item) => hasAbility(session?.role, item.ability));
    }, [session?.role]);

  return (
    <ResponsiveLayoutContext.Provider value>
      <div className="app-shell performance-ui relative h-dvh overflow-hidden text-on-surface">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[220px] bg-gradient-to-b from-white/65 to-transparent" />
          <div className="absolute -left-10 top-14 h-52 w-52 rounded-full bg-secondary/[0.07]" />
          <div className="absolute right-0 top-24 h-48 w-48 rounded-full bg-[#4edea3]/[0.055]" />
        </div>

        <div className="relative flex h-full min-h-0 flex-col overflow-hidden px-3 pb-24 pt-3 md:px-3.5 md:pb-5 md:pt-3.5">
          <header className="relative z-40 shrink-0">
            <div className="app-surface rounded-[28px] px-3.5 py-2.5 md:px-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3 md:gap-5">
                  <Link href="/dashboard" className="group flex items-center gap-3">
                    <div className="hidden min-w-0 sm:block">
                      <BrandLockup
                        markSizeClassName="h-10 w-10"
                        markClassName="bg-gradient-to-br from-primary-container to-secondary shadow-[0_16px_28px_-22px_rgba(162,119,255,0.82)] p-1.5"
                      />
                    </div>
                    <div className="sm:hidden">
                      <BrandLockup
                        markSizeClassName="h-10 w-10"
                        markClassName="bg-gradient-to-br from-primary-container to-secondary shadow-[0_16px_28px_-22px_rgba(162,119,255,0.82)] p-1.5"
                        showSubtitle={false}
                        titleClassName="sr-only"
                      />
                    </div>
                  </Link>

                  <nav className="hidden xl:flex items-center gap-1.5">
                    {visibleHeaderShortcuts.map((shortcut) => {
                      const active = isActivePath(currentActivePath, shortcut.href?.split("?")[0]);
                      return (
                        <Link
                          key={shortcut.label}
                          href={shortcut.href ?? "#"}
                          className={`rounded-[18px] px-3.5 py-1.5 text-[13px] font-medium ${
                            active ? "app-chip-active" : "app-chip"
                          }`}
                        >
                          {shortcut.label}
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                <div className="flex items-center gap-2 md:gap-2.5">
                  <div className="hidden 2xl:flex items-center gap-2.5 rounded-[22px] border border-outline-variant/15 bg-white/65 px-3.5 py-1.5 shadow-[0_12px_28px_-24px_rgba(39, 23, 68,0.32)]">
                    <StatPill label="User Aktif" value={session?.name ?? "Tim POS PRO"} />
                    <Separator />
                    <StatPill
                      label="Status Lisensi"
                      value={licenseSummary.badgeLabel}
                      tone={licenseSummary.tone}
                    />
                    <Separator />
                    <StatPill label="Shift Timer" value={shiftTimer} accent />
                    <Separator />
                    <StatPill label="Sales Hari Ini" value={formatCurrency(todayRevenue)} />
                  </div>

                  <button
                    className="app-icon-btn"
                    onClick={() =>
                      showToast({
                        title: "Notifikasi sudah siap",
                        description: "Begitu ada approval atau stok kritis, notifikasi akan muncul di sini.",
                        variant: "info",
                      })
                    }
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">notifications</span>
                  </button>
                  <button
                    className="app-icon-btn"
                    onClick={() => router.push("/settings?tab=branches")}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">storefront</span>
                  </button>
                  <button
                    className="app-icon-btn"
                    onClick={() => router.push("/billing")}
                    title="Billing"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
                  </button>
                  <button
                    className="app-icon-btn text-error hover:text-error"
                    onClick={handleLogout}
                    title="Logout"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          <div className="mt-3 flex min-h-0 flex-1 gap-3 overflow-hidden">
            <aside className="hidden h-full w-[248px] shrink-0 md:block xl:w-[252px]">
              <div className="app-surface flex h-full flex-col rounded-[30px] px-3 py-3.5">
                <div className="mb-3.5 rounded-[22px] border border-outline-variant/15 bg-gradient-to-br from-primary-container to-secondary px-3.5 py-3.5 text-white shadow-[0_20px_44px_-34px_rgba(162, 119, 255,0.78)]">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/70">Operator</p>
                  <h2 className="mt-2 font-headline text-lg font-bold leading-tight">{session?.name ?? "Tim POS PRO"}</h2>
                  <p className="mt-1 text-[13px] text-white/80">{session?.branch?.name ?? "Siapkan cabang aktif"}</p>
                  <div className="mt-3 grid grid-cols-2 gap-1.5">
                    <InfoMini label="Role" value={session?.role ?? "USER"} />
                    <InfoMini label="Sales" value={formatCurrency(todayRevenue)} />
                  </div>
                  <div className="mt-2.5 rounded-[20px] border border-white/15 bg-white/10 px-3 py-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.18em] text-white/65">Billing</div>
                        <div className="mt-1 font-headline text-[13px] font-bold leading-5 text-white">
                          {licenseSummary.statusLabel}
                        </div>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${statusBadgeClass(licenseSummary.tone)}`}>
                        {licenseSummary.badgeLabel}
                      </span>
                    </div>
                    <Link
                      href="/billing"
                      className="mt-2 inline-flex items-center gap-2 text-[11px] font-bold text-white/85 transition hover:text-white"
                    >
                      Buka Billing
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>

                <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto pr-0.5">
                  {visiblePrimaryNav.map((item) => (
                    <SidebarItem
                      key={item.label}
                      icon={item.icon}
                      label={item.label}
                      href={item.href}
                      active={isActivePath(currentActivePath, item.href)}
                      onNavigate={() => { if (item.href) setPendingPath(item.href.split("?")[0]); }}
                    />
                  ))}
                </nav>

                <div className="mt-3 flex flex-col gap-0.5 border-t border-outline-variant/12 pt-3">
                  {visibleUtilityNav.map((item) => (
                    <SidebarItem
                      key={item.label}
                      icon={item.icon}
                      label={item.label}
                      href={item.href}
                      onClick={item.onClick}
                      active={isActivePath(currentActivePath, item.href)}
                      onNavigate={() => { if (item.href) setPendingPath(item.href.split("?")[0]); }}
                    />
                  ))}
                </div>
              </div>
            </aside>

            <main className="min-h-0 flex-1 overflow-hidden">
              <div className="flex h-full min-h-0 flex-col rounded-[30px] md:p-0.5">
                {children}
              </div>
            </main>
          </div>
        </div>

        <nav className="md:hidden fixed bottom-3 left-3 right-3 z-50">
          <div className="app-surface rounded-[28px] px-3 py-3">
            <div className="flex justify-between gap-2">
              {mobileNav.map((item) => (
                <MobileNavItem
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  href={item.href ?? "/"}
                  active={isActivePath(currentActivePath, item.href)}
                  onNavigate={() => {
                    if (item.href) {
                      setPendingPath(item.href.split("?")[0]);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </nav>
      </div>
    </ResponsiveLayoutContext.Provider>
  );
}

function SidebarItem({
  icon,
  label,
  href,
  onClick,
  onNavigate,
  active = false,
}: {
  icon: string;
  label: string;
  href?: string;
  onClick?: () => void;
  onNavigate?: () => void;
  active?: boolean;
}) {
  const content = (
    <>
      {active ? (
        <motion.div
          layoutId="sidebarActiveIndicator"
          className="absolute inset-0 z-0 rounded-[20px] bg-[linear-gradient(135deg,#271744_0%,#a277ff_100%)] shadow-[0_20px_40px_-30px_rgba(162, 119, 255,0.88)]"
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
        />
      ) : null}
      <span className={`relative z-10 material-symbols-outlined text-[18px] transition-colors duration-200 ${active ? "icon-fill text-white" : "group-hover:text-primary"}`}>{icon}</span>
      <span className={`relative z-10 font-headline text-[13px] transition-colors duration-200 ${active ? "font-bold text-white tracking-wide" : "font-semibold group-hover:text-on-surface"}`}>{label}</span>
      {active ? <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="relative z-10 ml-auto h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse-soft shadow-[0_0_8px_2px_rgba(255,255,255,0.35)]" /> : null}
    </>
  );

  const className = `group relative flex items-center gap-2.5 overflow-hidden rounded-[20px] px-3 py-2.5 text-[13px] transition-all duration-300 ${
    active
      ? "text-white"
      : "text-on-surface-variant hover:bg-white/80 hover:shadow-sm"
  }`;

  if (href) {
    return (
      <Link href={href}>
        <motion.div 
          className={className}
          onClick={() => {
            if (onNavigate) onNavigate();
            if (onClick) onClick();
          }}
          whileHover={{ scale: 1.01, x: 1 }}
          whileTap={{ scale: 0.98 }}
        >
          {content}
        </motion.div>
      </Link>
    );
  }

  return (
    <motion.button 
      className={`w-full ${className}`} 
      onClick={onClick} 
      type="button"
      whileHover={{ scale: 1.01, x: 1 }}
      whileTap={{ scale: 0.98 }}
    >
      {content}
    </motion.button>
  );
}

function MobileNavItem({
  icon,
  label,
  href = "#",
  onNavigate,
  active = false,
}: {
  icon: string;
  label: string;
  href?: string;
  onNavigate?: () => void;
  active?: boolean;
}) {
  return (
    <Link href={href} className="flex min-w-0 flex-1 flex-col items-center justify-center relative">
      <motion.div
        onClick={onNavigate}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.9 }}
        className={`relative flex flex-col items-center justify-center w-full gap-1 rounded-[20px] px-2 py-2.5 text-[11px] font-black tracking-wide transition-colors z-10 ${
          active ? "text-white" : "text-on-surface-variant hover:text-primary"
        }`}
      >
        {active && (
          <motion.div
            layoutId="mobileNavIndicator"
            className="absolute inset-0 z-0 rounded-[20px] bg-[linear-gradient(135deg,#271744_0%,#a277ff_100%)] shadow-[0_12px_24px_-12px_rgba(162, 119, 255,0.8)]"
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          />
        )}
        <span className={`relative z-10 material-symbols-outlined text-[22px] transition-transform ${active ? "icon-fill scale-110" : ""}`}>{icon}</span>
        <span className="relative z-10 truncate mt-0.5">{label}</span>
      </motion.div>
    </Link>
  );
}

function StatPill({
  label,
  value,
  accent = false,
  tone = "default",
}: {
  label: string;
  value: string;
  accent?: boolean;
  tone?: "default" | "indigo" | "emerald" | "amber" | "rose" | "slate";
}) {
  const toneClass =
    tone === "emerald"
      ? "text-[#047857]"
      : tone === "amber"
        ? "text-[#b45309]"
        : tone === "rose"
          ? "text-[#be123c]"
          : tone === "indigo"
            ? "text-[#7c3aed]"
            : tone === "slate"
              ? "text-on-surface"
              : accent
                ? "text-secondary"
                : "text-on-surface";

  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-[0.16em] text-on-surface-variant/70">{label}</span>
      <span className={`font-headline text-[13px] font-bold ${toneClass}`}>{value}</span>
    </div>
  );
}

function InfoMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-white/15 bg-white/10 px-3 py-1.5">
      <div className="text-[10px] uppercase tracking-[0.16em] text-white/65">{label}</div>
      <div className="mt-1 font-headline text-[13px] font-bold text-white">{value}</div>
    </div>
  );
}

function Separator() {
  return <div className="h-8 w-px bg-outline-variant/30" />;
}

function statusBadgeClass(tone: "indigo" | "emerald" | "amber" | "rose" | "slate") {
  if (tone === "emerald") {
    return "bg-emerald-500/20 text-emerald-100";
  }

  if (tone === "amber") {
    return "bg-amber-400/20 text-amber-100";
  }

  if (tone === "rose") {
    return "bg-rose-400/20 text-rose-100";
  }

  if (tone === "indigo") {
    return "bg-indigo-400/20 text-indigo-100";
  }

  return "bg-white/15 text-white/85";
}
