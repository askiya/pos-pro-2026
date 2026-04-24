"use client";

import { useState } from "react";

import ResponsiveLayout from "@/components/layout/ResponsiveLayout";
import PosCatalog from "@/components/pos/PosCatalog";
import PosCart from "@/components/pos/PosCart";
import { formatCurrency } from "@/lib/format";
import { useCartStore } from "@/store/cartStore";

const cashierPalette = [
  { name: "Midnight Navy", value: "#271744", label: "Fokus transaksi" },
  { name: "Electric Indigo", value: "#a277ff", label: "Aksi utama" },
  { name: "Mint Revenue", value: "#12b981", label: "Sukses & aman" },
];

export default function Home() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const itemCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const total = useCartStore((state) => state.getTotal());

  return (
    <ResponsiveLayout>
      <div className="h-full min-h-0 overflow-y-auto px-4 py-5 pb-28 md:px-6 md:pb-7">
        <div className="mx-auto flex min-h-full max-w-[1540px] flex-col gap-4">
          <section className="pos-entrance relative shrink-0 overflow-hidden rounded-[34px] border border-white/70 bg-[linear-gradient(135deg,#271744_0%,#20246e_52%,#a277ff_100%)] p-5 text-white shadow-[0_28px_90px_-58px_rgba(17,24,39,0.82)]">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#12b981]/22" />
            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-[#f59e0b]/14" />

            <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-white/72">
                  <span className="h-2 w-2 rounded-full bg-[#12b981] pos-live-dot" />
                  Premium Cashier Lane
                </div>
                <h1 className="mt-4 font-headline text-3xl font-black tracking-[-0.06em] text-white sm:text-4xl xl:text-5xl">
                  Kasir cepat, rapi, dan nyaman untuk transaksi padat.
                </h1>
                <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-white/70">
                  Cari produk, tap item, pilih pembayaran, lalu charge. Semua dibuat lebih jelas untuk ritme kasir harian.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {cashierPalette.map((color) => (
                    <div key={color.name} className="flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-3 py-2 text-xs font-bold text-white/82">
                      <span className="h-3 w-3 rounded-full" style={{ background: color.value }} />
                      <span>{color.name}</span>
                      <span className="hidden text-white/45 sm:inline">/ {color.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[26px] border border-white/16 bg-white/10 p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/55">Cart Items</p>
                  <p className="mt-3 font-headline text-3xl font-black tracking-[-0.05em]">{itemCount}</p>
                </div>
                <div className="rounded-[26px] border border-white/16 bg-white/10 p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/55">Total</p>
                  <p className="mt-3 truncate font-headline text-3xl font-black tracking-[-0.05em]">{formatCurrency(total)}</p>
                </div>
              </div>
            </div>
          </section>

          <div className="flex min-w-0 flex-col">
            <PosCatalog />
          </div>
        </div>
      </div>

      <CashierCheckoutDock
        itemCount={itemCount}
        total={total}
        hidden={isCheckoutOpen}
        onCheckout={() => setIsCheckoutOpen(true)}
      />

      <CashierCheckoutDrawer
        open={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </ResponsiveLayout>
  );
}

function CashierCheckoutDock({
  itemCount,
  total,
  hidden,
  onCheckout,
}: {
  itemCount: number;
  total: number;
  hidden: boolean;
  onCheckout: () => void;
}) {
  return (
    <div
      className={`fixed bottom-5 left-4 right-4 z-[70] transition duration-300 md:left-auto md:right-6 md:w-[360px] xl:w-[376px] ${
        hidden ? "pointer-events-none translate-y-4 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="rounded-[24px] border border-white/70 bg-white/92 p-2.5 shadow-[0_26px_80px_-42px_rgba(39, 23, 68,0.55)] backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] bg-[#f5edff] text-[#a277ff]">
            <span className="material-symbols-outlined icon-fill text-[22px]">shopping_cart</span>
            {itemCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#12b981] px-1 text-[9px] font-black text-white">
                {itemCount}
              </span>
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-headline text-[15px] font-black text-on-surface">
              {itemCount > 0 ? `${itemCount} item siap checkout` : "Keranjang masih kosong"}
            </p>
            <p className="mt-0.5 text-[11px] font-semibold text-on-surface-variant">{formatCurrency(total)}</p>
          </div>
          <button
            onClick={onCheckout}
            className="shrink-0 rounded-[16px] bg-[linear-gradient(135deg,#271744_0%,#a277ff_100%)] px-3.5 py-2.5 text-[13px] font-black text-white shadow-[0_18px_38px_-26px_rgba(162, 119, 255,0.85)] hover:-translate-y-0.5"
            type="button"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

function CashierCheckoutDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className={`fixed inset-0 z-[95] transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <button
        aria-label="Close checkout drawer"
        className={`absolute inset-0 bg-[#271744]/42 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        type="button"
      />

      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-[430px] flex-col overflow-hidden border-l border-white/60 bg-[#f7f8ff]/96 p-2.5 shadow-[0_34px_110px_-44px_rgba(17,24,39,0.72)] backdrop-blur-2xl transition-transform duration-300 ease-out sm:max-w-[448px] sm:p-3 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <PosCart variant="drawer" onClose={onClose} onCharged={onClose} />
      </aside>
    </div>
  );
}
