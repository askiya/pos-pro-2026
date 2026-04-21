"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function ResponsiveLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-surface" />; // Prevent hydration mismatch

  return (
    <div className="bg-surface text-on-surface font-body h-full overflow-hidden flex flex-col antialiased">
      {/* TopAppBar */}
      <header className="sticky top-0 z-40 w-full bg-[#faf8ff]/80 backdrop-blur-xl flex justify-between items-center px-6 h-16 shadow-none">
        <div className="flex items-center gap-6">
          <div className="hidden md:block text-lg font-black text-on-surface font-headline tracking-tight">POS Pro 2026</div>
          <nav className="hidden md:flex items-center gap-2">
            <a className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-all px-3 py-1 font-body text-sm font-medium" href="#">Branches</a>
            <a className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-all px-3 py-1 font-body text-sm font-medium" href="#">Shift Management</a>
            <a className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-all px-3 py-1 font-body text-sm font-medium" href="#">Transfers</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-4 mr-4 text-sm font-body">
            <div className="flex flex-col items-end">
              <span className="text-on-surface font-semibold">Sarah Jenkins</span>
              <span className="text-on-surface-variant text-xs">Downtown Branch</span>
            </div>
            <div className="w-px h-8 bg-surface-dim mx-2"></div>
            <div className="flex flex-col">
              <span className="text-on-surface-variant text-xs">Shift Timer</span>
              <span className="text-secondary font-semibold font-headline">04:22:15</span>
            </div>
            <div className="w-px h-8 bg-surface-dim mx-2"></div>
            <div className="flex flex-col">
              <span className="text-on-surface-variant text-xs">Today&apos;s Sales</span>
              <span className="text-on-surface font-semibold font-headline">$2,450.00</span>
            </div>
          </div>
          <button className="text-secondary hover:bg-surface-container rounded-lg transition-all p-2 flex items-center justify-center">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="text-secondary hover:bg-surface-container rounded-lg transition-all p-2 flex items-center justify-center">
            <span className="material-symbols-outlined">storefront</span>
          </button>
          <button onClick={handleLogout} title="Logout" className="text-error hover:bg-error-container/30 rounded-lg transition-all p-2 flex items-center justify-center">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex flex-1 overflow-hidden h-full pb-20 md:pb-0">
        {/* SideNavBar */}
        <aside className="hidden md:flex h-full w-64 flex-col sticky top-0 bg-surface-container p-4 gap-2 border-r border-outline-variant/10">
          <nav className="flex-1 flex flex-col gap-1 mt-4">
            <NavItem icon="dashboard" label="Dashboard" href="/dashboard" active={pathname === "/dashboard"} />
            <NavItem icon="point_of_sale" label="POS Cashier" href="/" active={pathname === "/"} />
            <NavItem icon="inventory_2" label="Inventory" href="/inventory" active={pathname === "/inventory"} />
            <NavItem icon="groups" label="Customer CRM" href="/crm" active={pathname === "/crm"} />
            <NavItem icon="payments" label="PPOB Module" href="/ppob" active={pathname === "/ppob"} />
            <NavItem icon="analytics" label="Reports" href="/reports" active={pathname === "/reports"} />
          </nav>
          <div className="mt-auto flex flex-col gap-1 pt-4">
            <NavItem icon="settings" label="Settings" href="/settings" active={pathname === "/settings"} />
            <NavItem icon="help_outline" label="Support" href="#" />
          </div>
        </aside>

        {/* Workspace */}
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-surface relative">
          {children}
        </main>
      </div>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 rounded-t-3xl bg-white/90 backdrop-blur-2xl border-t border-secondary/10 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
        <div className="flex justify-around items-center px-4 pb-safe h-20">
          <MobileNavItem icon="home" label="Home" href="/dashboard" active={pathname === "/dashboard"} />
          <MobileNavItem icon="shopping_cart" label="POS" href="/" active={pathname === "/"} />
          <MobileNavItem icon="receipt_long" label="Orders" href="/purchase-orders" active={pathname === "/purchase-orders"} />
          <MobileNavItem icon="person" label="CRM" href="/crm" active={pathname === "/crm"} />
          <MobileNavItem icon="menu" label="More" href="/settings" active={pathname === "/settings"} />
        </div>
      </nav>
    </div>
  );
}

function NavItem({ icon, label, href = "#", active = false }: { icon: string; label: string; href?: string; active?: boolean }) {
  if (active) {
    return (
      <Link href={href} className="flex items-center gap-3 px-4 py-3 bg-surface-container-lowest text-secondary rounded-xl font-bold shadow-sm font-body text-sm">
        <span className="material-symbols-outlined icon-fill">{icon}</span>
        {label}
      </Link>
    );
  }
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-white/50 rounded-xl transition-all font-body text-sm font-medium">
      <span className="material-symbols-outlined">{icon}</span>
      {label}
    </Link>
  );
}

function MobileNavItem({ icon, label, href = "#", active = false }: { icon: string; label: string; href?: string; active?: boolean }) {
  if (active) {
    return (
      <Link href={href} className="flex flex-col items-center justify-center bg-secondary text-white rounded-2xl px-4 py-2 mt-[-10px] shadow-lg shadow-secondary/30 scale-95 active:scale-90 transition-all duration-150">
        <span className="material-symbols-outlined icon-fill">{icon}</span>
        <span className="font-body text-[10px] font-medium mt-1">{label}</span>
      </Link>
    );
  }
  return (
    <Link href={href} className="flex flex-col items-center justify-center text-on-surface-variant py-2 scale-95 active:scale-90 transition-all duration-150 active:bg-surface-container rounded-full">
      <span className="material-symbols-outlined">{icon}</span>
      <span className="font-body text-[10px] font-medium mt-1">{label}</span>
    </Link>
  );
}
