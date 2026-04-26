"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

import ResponsiveLayout from "@/components/layout/ResponsiveLayout";
import { useToast } from "@/components/ui/ToastProvider";
import { formatCurrency } from "@/lib/format";

type CategoryId = "pulsa" | "data" | "pln" | "bpjs" | "game" | "internet";
type PpobTone = "indigo" | "emerald" | "amber" | "coral" | "blue";

interface PpobCategory {
  id: CategoryId;
  label: string;
  icon: string;
  description: string;
}

interface Operator {
  id: string;
  categoryId: CategoryId;
  name: string;
  shortName: string;
  icon: string;
  tone: PpobTone;
}

interface Product {
  id: string;
  categoryId: CategoryId;
  operatorId: string;
  name: string;
  description: string;
  cost: number;
  price: number;
  margin: number;
  icon: string;
  tone: PpobTone;
  badge: string;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  amount: number;
  status: "SUCCESS" | "PENDING" | "FAILED";
  icon: string;
}

const categories: PpobCategory[] = [
  { id: "pulsa", label: "Pulsa", icon: "phone_iphone", description: "Isi pulsa reguler" },
  { id: "data", label: "Paket Data", icon: "wifi", description: "Kuota internet" },
  { id: "pln", label: "PLN", icon: "bolt", description: "Token listrik" },
  { id: "bpjs", label: "BPJS", icon: "health_and_safety", description: "Tagihan kesehatan" },
  { id: "game", label: "Game Voucher", icon: "sports_esports", description: "Top up game" },
  { id: "internet", label: "Internet", icon: "router", description: "Tagihan internet" },
];

const operators: Operator[] = [
  { id: "telkomsel", categoryId: "pulsa", name: "Telkomsel", shortName: "TSEL", icon: "T", tone: "coral" },
  { id: "xl", categoryId: "pulsa", name: "XL/Axis", shortName: "XL", icon: "XL", tone: "blue" },
  { id: "indosat", categoryId: "pulsa", name: "Indosat", shortName: "ISAT", icon: "I", tone: "amber" },
  { id: "smartfren", categoryId: "pulsa", name: "Smartfren", shortName: "SF", icon: "S", tone: "indigo" },
  { id: "tsel-data", categoryId: "data", name: "Telkomsel Data", shortName: "TSEL", icon: "T", tone: "coral" },
  { id: "xl-data", categoryId: "data", name: "XL Data", shortName: "XL", icon: "XL", tone: "blue" },
  { id: "pln-token", categoryId: "pln", name: "PLN Token", shortName: "PLN", icon: "PLN", tone: "amber" },
  { id: "bpjs-kes", categoryId: "bpjs", name: "BPJS Kesehatan", shortName: "BPJS", icon: "B", tone: "emerald" },
  { id: "mlbb", categoryId: "game", name: "Mobile Legends", shortName: "MLBB", icon: "ML", tone: "blue" },
  { id: "steam", categoryId: "game", name: "Steam Wallet", shortName: "STM", icon: "S", tone: "indigo" },
  { id: "indihome", categoryId: "internet", name: "IndiHome", shortName: "IDH", icon: "IH", tone: "coral" },
  { id: "biznet", categoryId: "internet", name: "Biznet", shortName: "BZN", icon: "B", tone: "emerald" },
];

const products: Product[] = [
  { id: "pulsa-50", categoryId: "pulsa", operatorId: "telkomsel", name: "Pulsa 50.000", description: "Produk cepat untuk transaksi harian", cost: 49500, price: 51000, margin: 12, icon: "phone_iphone", tone: "coral", badge: "Best seller" },
  { id: "pulsa-100", categoryId: "pulsa", operatorId: "telkomsel", name: "Pulsa 100.000", description: "Nominal besar dengan margin stabil", cost: 98000, price: 100500, margin: 8, icon: "phone_iphone", tone: "coral", badge: "Fast" },
  { id: "pulsa-20", categoryId: "pulsa", operatorId: "telkomsel", name: "Pulsa 20.000", description: "Cocok untuk top up cepat", cost: 19800, price: 22000, margin: 15, icon: "phone_iphone", tone: "coral", badge: "High margin" },
  { id: "xl-25", categoryId: "pulsa", operatorId: "xl", name: "Pulsa XL 25.000", description: "XL/Axis reguler", cost: 24750, price: 26000, margin: 10, icon: "phone_iphone", tone: "blue", badge: "Ready" },
  { id: "isat-50", categoryId: "pulsa", operatorId: "indosat", name: "Pulsa Indosat 50.000", description: "Pulsa reguler Indosat", cost: 49200, price: 50500, margin: 9, icon: "phone_iphone", tone: "amber", badge: "Ready" },
  { id: "sf-30", categoryId: "pulsa", operatorId: "smartfren", name: "Pulsa Smartfren 30.000", description: "Top up Smartfren reguler", cost: 29600, price: 31000, margin: 10, icon: "phone_iphone", tone: "indigo", badge: "Ready" },
  { id: "data-t-5gb", categoryId: "data", operatorId: "tsel-data", name: "Data 5GB 30 Hari", description: "Kuota nasional Telkomsel", cost: 43000, price: 46500, margin: 13, icon: "wifi", tone: "coral", badge: "Popular" },
  { id: "data-xl-8gb", categoryId: "data", operatorId: "xl-data", name: "Data 8GB 30 Hari", description: "Paket XL nasional", cost: 47500, price: 50500, margin: 12, icon: "wifi", tone: "blue", badge: "Value" },
  { id: "pln-100", categoryId: "pln", operatorId: "pln-token", name: "Token PLN 100.000", description: "Token listrik prabayar", cost: 100000, price: 102500, margin: 7, icon: "bolt", tone: "amber", badge: "Utility" },
  { id: "pln-200", categoryId: "pln", operatorId: "pln-token", name: "Token PLN 200.000", description: "Token nominal besar", cost: 200000, price: 203000, margin: 6, icon: "bolt", tone: "amber", badge: "Utility" },
  { id: "bpjs-1", categoryId: "bpjs", operatorId: "bpjs-kes", name: "BPJS Kelas 1", description: "Pembayaran tagihan BPJS", cost: 150000, price: 152500, margin: 5, icon: "health_and_safety", tone: "emerald", badge: "Bill" },
  { id: "mlbb-86", categoryId: "game", operatorId: "mlbb", name: "MLBB 86 Diamonds", description: "Voucher game instan", cost: 20500, price: 23000, margin: 16, icon: "sports_esports", tone: "blue", badge: "Gaming" },
  { id: "steam-60", categoryId: "game", operatorId: "steam", name: "Steam Wallet 60.000", description: "Voucher wallet digital", cost: 59000, price: 62500, margin: 11, icon: "sports_esports", tone: "indigo", badge: "Gaming" },
  { id: "indihome-bill", categoryId: "internet", operatorId: "indihome", name: "Tagihan IndiHome", description: "Cek dan bayar tagihan", cost: 350000, price: 352500, margin: 4, icon: "router", tone: "coral", badge: "Bill" },
  { id: "biznet-bill", categoryId: "internet", operatorId: "biznet", name: "Tagihan Biznet", description: "Pembayaran internet rumah", cost: 300000, price: 302500, margin: 4, icon: "router", tone: "emerald", badge: "Bill" },
];

const recentActivities: Activity[] = [
  { id: "act-1", title: "0812***7890", description: "Pulsa 50k - 10:42 AM", amount: 51000, status: "SUCCESS", icon: "phone_iphone" },
  { id: "act-2", title: "PLN 123***89", description: "Token 100k - 09:15 AM", amount: 102500, status: "PENDING", icon: "bolt" },
  { id: "act-3", title: "MLBB 89***12", description: "86 Diamonds - Yesterday", amount: 23000, status: "FAILED", icon: "sports_esports" },
];

const toneClass: Record<PpobTone, { icon: string; chip: string; line: string; glow: string }> = {
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
  blue: {
    icon: "bg-[#e8f1ff] text-[#2563eb]",
    chip: "bg-[#e8f1ff] text-[#1d4ed8]",
    line: "from-[#2563eb] to-[#38bdf8]",
    glow: "from-[#38bdf8]/20 to-transparent",
  },
};

const ppobPalette = [
  { name: "Midnight Counter", value: "#271744", label: "Fokus transaksi" },
  { name: "Electric Indigo", value: "#a277ff", label: "Aksi utama" },
  { name: "Mint Success", value: "#12b981", label: "Status aman" },
];

export default function PPOBPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("pulsa");
  const initialOperator = operators.find((operator) => operator.categoryId === "pulsa")?.id ?? operators[0].id;
  const [activeOperator, setActiveOperator] = useState(initialOperator);
  const initialProduct = products.find((product) => product.categoryId === "pulsa" && product.operatorId === initialOperator)?.id ?? products[0].id;
  const [activeProduct, setActiveProduct] = useState(initialProduct);
  const [destination, setDestination] = useState("0812 3456 7890");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { showToast } = useToast();

  const categoryOperators = useMemo(
    () => operators.filter((operator) => operator.categoryId === activeCategory),
    [activeCategory],
  );

  const visibleProducts = useMemo(
    () =>
      products.filter(
        (product) => product.categoryId === activeCategory && product.operatorId === activeOperator,
      ),
    [activeCategory, activeOperator],
  );

  const selectedProduct = useMemo(() => {
    return (
      products.find((product) => product.id === activeProduct) ??
      visibleProducts[0] ??
      products[0]
    );
  }, [activeProduct, visibleProducts]);

  const selectedOperator = useMemo(() => {
    return operators.find((operator) => operator.id === activeOperator) ?? categoryOperators[0] ?? operators[0];
  }, [activeOperator, categoryOperators]);

  const totalMargin = selectedProduct.price - selectedProduct.cost;

  const handleSelectCategory = (categoryId: CategoryId) => {
    const nextOperator = operators.find((operator) => operator.categoryId === categoryId) ?? operators[0];
    const nextProduct =
      products.find((product) => product.categoryId === categoryId && product.operatorId === nextOperator.id) ??
      products[0];

    setActiveCategory(categoryId);
    setActiveOperator(nextOperator.id);
    setActiveProduct(nextProduct.id);
  };

  const handleSelectOperator = (operatorId: string) => {
    const nextProduct =
      products.find((product) => product.categoryId === activeCategory && product.operatorId === operatorId) ??
      products.find((product) => product.categoryId === activeCategory) ??
      products[0];

    setActiveOperator(operatorId);
    setActiveProduct(nextProduct.id);
  };

  const handleConfirm = () => {
    showToast({
      title: "Flow PPOB siap disambungkan",
      description: `${selectedProduct.name} untuk ${destination || "nomor tujuan"} belum dikirim karena provider PPOB asli belum terhubung.`,
      variant: "info",
    });
    setIsCheckoutOpen(false);
  };

  return (
    <ResponsiveLayout>
      <div className="h-full overflow-y-auto px-4 py-5 pb-28 md:px-6 md:pb-8">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4">
          <section className="ppob-entrance ppob-sheen relative overflow-hidden rounded-2xl border border-white/70 bg-[linear-gradient(135deg,#271744_0%,#25245f_48%,#a277ff_100%)] p-5 text-white shadow-[0_28px_90px_-58px_rgba(17,24,39,0.82)] sm:p-7">
            <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#12b981]/22" />
            <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-[#f59e0b]/14" />

            <div className="relative grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(430px,0.85fr)] xl:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-white/75">
                  <span className="h-2 w-2 rounded-full bg-[#12b981] ppob-live-dot" />
                  Digital Payment Counter
                </div>
                <h1 className="mt-5 max-w-3xl font-headline text-3xl font-black tracking-[-0.06em] text-white sm:text-5xl xl:text-6xl">
                  PPOB lebih cepat, rapi, dan nyaman untuk ritme kasir harian.
                </h1>
                <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-white/72 sm:text-base">
                  Pilih layanan, operator, produk, lalu konfirmasi transaksi dari panel yang lebih jelas dan responsif.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {ppobPalette.map((color) => (
                    <div key={color.name} className="flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-3 py-2 text-xs font-bold text-white/82">
                      <span className="h-3 w-3 rounded-full" style={{ background: color.value }} />
                      <span>{color.name}</span>
                      <span className="hidden text-white/45 sm:inline">/ {color.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <HeroMiniStat label="Produk Aktif" value={String(visibleProducts.length)} icon="inventory_2" />
                <HeroMiniStat label="Margin" value={formatCurrency(totalMargin)} icon="trending_up" />
                <HeroMiniStat label="Status" value="Ready UI" icon="verified" />
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <PpobKpi label="Kategori" value={String(categories.length)} icon="category" tone="indigo" meta="Pulsa, data, tagihan" delay={40} />
            <PpobKpi label="Operator" value={String(categoryOperators.length)} icon="hub" tone="blue" meta={`Aktif: ${selectedOperator.name}`} delay={90} />
            <PpobKpi label="Produk" value={String(visibleProducts.length)} icon="widgets" tone="emerald" meta={selectedProduct.badge} delay={140} />
            <PpobKpi label="Estimasi Profit" value={formatCurrency(totalMargin)} icon="payments" tone="amber" meta={`${selectedProduct.margin}% margin produk`} delay={190} />
          </section>

          <section className="flex min-w-0 flex-col gap-4">
            <CategoryStrip activeCategory={activeCategory} onSelect={handleSelectCategory} />

            <OperatorStrip
              operators={categoryOperators}
              activeOperator={activeOperator}
              onSelect={handleSelectOperator}
            />

            <ProductCatalog
              products={visibleProducts}
              selectedProduct={selectedProduct}
              onSelect={(productId) => setActiveProduct(productId)}
              onCheckout={() => setIsCheckoutOpen(true)}
            />

            <RecentActivity activities={recentActivities} />
          </section>
        </div>
      </div>

      <CheckoutDock
        product={selectedProduct}
        operator={selectedOperator}
        onCheckout={() => setIsCheckoutOpen(true)}
        hidden={isCheckoutOpen}
      />

      <CheckoutDrawer
        open={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        destination={destination}
        onDestinationChange={setDestination}
        operator={selectedOperator}
        product={selectedProduct}
        onConfirm={handleConfirm}
      />
    </ResponsiveLayout>
  );
}

function CategoryStrip({
  activeCategory,
  onSelect,
}: {
  activeCategory: CategoryId;
  onSelect: (categoryId: CategoryId) => void;
}) {
  return (
    <section className="ppob-entrance rounded-2xl border border-white/70 bg-white/76 p-4 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)]" style={{ "--delay": "230ms" } as CSSProperties}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#a277ff]/75">Service Dock</p>
          <h2 className="mt-2 font-headline text-xl font-black tracking-[-0.05em] text-on-surface">Pilih layanan</h2>
        </div>
        <span className="hidden rounded-full bg-[#f5edff] px-4 py-2 text-xs font-black text-[#8657ea] sm:inline-flex">
          {categories.length} kategori
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 hide-scrollbar">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={`group min-w-[154px] rounded-xl border p-4 text-left ${
              activeCategory === category.id
                ? "border-[#a277ff]/30 bg-[linear-gradient(135deg,#271744_0%,#a277ff_100%)] text-white shadow-[0_20px_52px_-32px_rgba(162, 119, 255,0.82)]"
                : "border-white/70 bg-white/72 text-on-surface hover:-translate-y-1 hover:bg-white"
            }`}
            type="button"
          >
            <div className="flex items-center justify-between gap-3">
              <span className={`material-symbols-outlined rounded-2xl p-2.5 text-[22px] ${activeCategory === category.id ? "bg-white/14 text-white" : "bg-[#f5edff] text-[#a277ff]"}`}>
                {category.icon}
              </span>
              <span className={`h-2 w-2 rounded-full ${activeCategory === category.id ? "bg-[#12b981]" : "bg-[#d4c8e3]"}`} />
            </div>
            <p className="mt-4 font-headline text-lg font-black">{category.label}</p>
            <p className={`mt-1 text-xs font-semibold ${activeCategory === category.id ? "text-white/62" : "text-on-surface-variant"}`}>{category.description}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function OperatorStrip({
  operators: categoryOperators,
  activeOperator,
  onSelect,
}: {
  operators: Operator[];
  activeOperator: string;
  onSelect: (operatorId: string) => void;
}) {
  return (
    <section className="ppob-entrance rounded-2xl border border-white/70 bg-white/76 p-4 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)]" style={{ "--delay": "280ms" } as CSSProperties}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#12b981]/80">Operator Lane</p>
          <h2 className="mt-2 font-headline text-xl font-black tracking-[-0.05em] text-on-surface">Pilih operator</h2>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 hide-scrollbar">
        {categoryOperators.map((operator) => {
          const style = toneClass[operator.tone];
          const isActive = activeOperator === operator.id;

          return (
            <button
              key={operator.id}
              onClick={() => onSelect(operator.id)}
              className={`ppob-row min-w-[142px] rounded-xl border p-4 text-left ${
                isActive
                  ? "border-[#a277ff]/35 bg-[#f6f7ff] shadow-[0_20px_54px_-38px_rgba(162, 119, 255,0.55)]"
                  : "border-white/70 bg-white/72 hover:bg-white"
              }`}
              type="button"
            >
              <div className="flex items-center justify-between gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl font-headline text-sm font-black ${style.icon}`}>
                  {operator.icon}
                </div>
                {isActive ? <span className="h-2.5 w-2.5 rounded-full bg-[#12b981] ppob-live-dot" /> : null}
              </div>
              <p className="mt-4 font-headline text-base font-black text-on-surface">{operator.name}</p>
              <p className="mt-1 text-xs font-semibold text-on-surface-variant">{operator.shortName}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ProductCatalog({
  products: visibleProducts,
  selectedProduct,
  onSelect,
  onCheckout,
}: {
  products: Product[];
  selectedProduct: Product;
  onSelect: (productId: string) => void;
  onCheckout: () => void;
}) {
  return (
    <section className="ppob-entrance overflow-hidden rounded-2xl border border-white/70 bg-white/76 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)]" style={{ "--delay": "330ms" } as CSSProperties}>
      <div className="border-b border-[#ecdfff] px-5 py-4">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#a277ff]/75">Product Grid</p>
            <h2 className="mt-2 font-headline text-xl font-black tracking-[-0.05em] text-on-surface">Pilih produk PPOB</h2>
            <p className="mt-1 text-sm font-medium text-on-surface-variant">Harga dan margin langsung ikut update di drawer checkout.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="rounded-full bg-[#f5edff] px-4 py-2 text-sm font-black text-[#8657ea]">
              {visibleProducts.length} produk aktif
            </div>
            <button
              onClick={onCheckout}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#271744_0%,#a277ff_100%)] px-5 py-2.5 text-sm font-black text-white shadow-[0_16px_34px_-24px_rgba(162, 119, 255,0.82)] hover:-translate-y-0.5"
              type="button"
            >
              Checkout
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 2xl:grid-cols-3">
        {visibleProducts.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            selected={selectedProduct.id === product.id}
            delay={index * 34}
            onSelect={() => onSelect(product.id)}
          />
        ))}
      </div>
    </section>
  );
}

function ProductCard({
  product,
  selected,
  delay,
  onSelect,
}: {
  product: Product;
  selected: boolean;
  delay: number;
  onSelect: () => void;
}) {
  const style = toneClass[product.tone];

  return (
    <button
      onClick={onSelect}
      className={`ppob-row group relative overflow-hidden rounded-xl border p-4 text-left ${
        selected
          ? "border-[#a277ff]/45 bg-[#f6f7ff] shadow-[0_24px_60px_-38px_rgba(162, 119, 255,0.62)]"
          : "border-white/70 bg-white/78 shadow-[0_20px_54px_-42px_rgba(39, 23, 68,0.38)] hover:bg-white"
      }`}
      style={{ "--delay": `${delay}ms` } as CSSProperties}
      type="button"
    >
      <div className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${style.glow}`} />
      <div className={`absolute inset-x-4 bottom-0 h-1 rounded-full bg-gradient-to-r ${style.line}`} />
      <div className="relative flex items-start justify-between gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-[20px] ${style.icon}`}>
          <span className="material-symbols-outlined icon-fill text-[24px]">{product.icon}</span>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-black ${style.chip}`}>{product.badge}</span>
      </div>

      <div className="relative mt-5">
        <h3 className="font-headline text-xl font-black tracking-[-0.04em] text-on-surface">{product.name}</h3>
        <p className="mt-2 text-sm font-medium leading-6 text-on-surface-variant">{product.description}</p>
        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-on-surface-variant">Cost {formatCurrency(product.cost)}</p>
            <p className="mt-1 font-headline text-xl font-black tracking-[-0.04em] text-[#a277ff]">{formatCurrency(product.price)}</p>
          </div>
          <span className="rounded-full bg-[#e6f7ef] px-3 py-1.5 text-xs font-black text-[#047857]">
            {product.margin}% margin
          </span>
        </div>
      </div>
    </button>
  );
}

function CheckoutDrawer({
  open,
  onClose,
  destination,
  onDestinationChange,
  operator,
  product,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  destination: string;
  onDestinationChange: (value: string) => void;
  operator: Operator;
  product: Product;
  onConfirm: () => void;
}) {
  const operatorStyle = toneClass[operator.tone];

  return (
    <div
      className={`fixed inset-0 z-[95] transition ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
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
        className={`absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col overflow-hidden border-l border-white/60 bg-[#f7f8ff]/96 shadow-[0_34px_110px_-44px_rgba(17,24,39,0.72)] backdrop-blur-2xl transition-transform duration-300 ease-out xl:max-w-[438px] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#ecdfff] px-4 py-3.5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#a277ff]/75">Checkout Drawer</p>
            <h2 className="mt-1 font-headline text-[1.7rem] font-black tracking-[-0.05em] text-on-surface">Konfirmasi PPOB</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] border border-[#ecdfff] bg-white/84 text-on-surface-variant hover:bg-white hover:text-[#a277ff]"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="ppob-sheen relative overflow-hidden rounded-xl bg-[linear-gradient(135deg,#271744_0%,#a277ff_100%)] p-4 text-white shadow-[0_28px_70px_-44px_rgba(162, 119, 255,0.92)]">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#12b981]/20" />
            <div className="relative">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-white/55">New Transaction</p>
              <h3 className="mt-2.5 font-headline text-[2rem] font-black tracking-[-0.05em]">Checkout PPOB</h3>
              <p className="mt-2 text-[13px] font-medium leading-5 text-white/68">Validasi nomor, cek produk, lalu lanjutkan pembayaran.</p>

              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <SummaryBox label="Produk" value={product.name} />
                <SummaryBox label="Total" value={formatCurrency(product.price)} />
              </div>
            </div>
          </div>

          <div className="mt-3.5 grid gap-3.5">
            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant">Destination Number</span>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[21px] text-[#a277ff]">
                  smartphone
                </span>
                <input
                  className="app-field py-3.5 pl-11 pr-11 font-headline text-base font-black"
                  type="tel"
                  value={destination}
                  onChange={(event) => onDestinationChange(event.target.value)}
                  placeholder="Masukkan nomor tujuan"
                />
                <button className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#f5edff] text-[#a277ff] hover:bg-[#e6d9ff]" type="button">
                  <span className="material-symbols-outlined text-[18px]">contacts</span>
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black ${operatorStyle.icon}`}>{operator.icon}</span>
                <span className="text-xs font-bold text-[#a277ff]">Detected: {operator.name}</span>
              </div>
            </label>

            <div className="rounded-xl border border-[#ecdfff] bg-white/72 p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant/70">Selected Product</p>
                  <h3 className="mt-2.5 font-headline text-[1.55rem] font-black tracking-[-0.04em] text-on-surface">{product.name}</h3>
                  <p className="mt-1 text-[13px] font-semibold text-on-surface-variant">Cost {formatCurrency(product.cost)}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-[18px] ${toneClass[product.tone].icon}`}>
                  <span className="material-symbols-outlined icon-fill text-[20px]">{product.icon}</span>
                </div>
              </div>
              <div className="mt-3.5 flex items-center justify-between border-t border-[#ecdfff] pt-3.5">
                <span className="text-[13px] font-bold text-on-surface-variant">Customer Pays</span>
                <span className="font-headline text-[1.9rem] font-black tracking-[-0.05em] text-on-surface">{formatCurrency(product.price)}</span>
              </div>
            </div>

            <div className="rounded-xl border border-[#ecdfff] bg-white/72 p-3.5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant/70">Profit Snapshot</p>
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <MiniSummary label="Margin" value={`${product.margin}%`} />
                <MiniSummary label="Profit" value={formatCurrency(product.price - product.cost)} />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#ecdfff] bg-white/80 p-3">
          <button
            onClick={onConfirm}
            className="flex w-full items-center justify-between rounded-[20px] bg-[linear-gradient(135deg,#271744_0%,#a277ff_100%)] px-4 py-3 text-left text-white shadow-[0_24px_52px_-34px_rgba(162, 119, 255,0.85)] hover:-translate-y-0.5"
            type="button"
          >
            <span className="font-headline text-lg font-black">Confirm & Pay</span>
            <span className="material-symbols-outlined text-[22px]">arrow_forward</span>
          </button>
        </div>
      </aside>
    </div>
  );
}

function CheckoutDock({
  product,
  operator,
  onCheckout,
  hidden,
}: {
  product: Product;
  operator: Operator;
  onCheckout: () => void;
  hidden: boolean;
}) {
  return (
    <div
      className={`fixed bottom-5 left-4 right-4 z-[70] transition duration-300 md:left-auto md:right-6 md:w-[345px] xl:w-[360px] ${
        hidden ? "pointer-events-none translate-y-4 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="rounded-xl border border-white/70 bg-white/92 p-2.5 shadow-[0_26px_80px_-42px_rgba(39, 23, 68,0.55)] backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] font-headline text-[11px] font-black ${toneClass[operator.tone].icon}`}>
            {operator.icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-headline text-[15px] font-black text-on-surface">{product.name}</p>
            <p className="mt-0.5 text-[11px] font-semibold text-on-surface-variant">{operator.name} - {formatCurrency(product.price)}</p>
          </div>
          <button
            onClick={onCheckout}
            className="shrink-0 rounded-[16px] bg-[linear-gradient(135deg,#271744_0%,#a277ff_100%)] px-3 py-2.5 text-[13px] font-black text-white shadow-[0_18px_38px_-26px_rgba(162, 119, 255,0.85)] hover:-translate-y-0.5"
            type="button"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

function RecentActivity({ activities }: { activities: Activity[] }) {
  return (
    <section className="ppob-entrance overflow-hidden rounded-2xl border border-white/70 bg-white/76 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)]" style={{ "--delay": "430ms" } as CSSProperties}>
      <div className="border-b border-[#ecdfff] px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#a277ff]/75">Recent Activity</p>
            <h2 className="mt-2 font-headline text-xl font-black tracking-[-0.05em] text-on-surface">Aktivitas terbaru</h2>
          </div>
          <button className="rounded-full bg-[#f5edff] px-4 py-2 text-xs font-black text-[#8657ea] hover:bg-[#e6d9ff]" type="button">
            View All
          </button>
        </div>
      </div>

      <div className="grid gap-3 p-4">
        {activities.map((activity, index) => (
          <ActivityRow key={activity.id} activity={activity} delay={index * 36} />
        ))}
      </div>
    </section>
  );
}

function ActivityRow({ activity, delay }: { activity: Activity; delay: number }) {
  const statusClass =
    activity.status === "SUCCESS"
      ? "bg-[#e6f7ef] text-[#047857]"
      : activity.status === "PENDING"
        ? "bg-[#fff7df] text-[#b45309]"
        : "bg-[#fff1f2] text-[#be123c]";

  return (
    <div
      className="ppob-row rounded-xl border border-white/70 bg-white/78 p-4 shadow-[0_18px_42px_-34px_rgba(39, 23, 68,0.38)]"
      style={{ "--delay": `${delay}ms` } as CSSProperties}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f5edff] text-[#a277ff]">
            <span className="material-symbols-outlined text-[22px]">{activity.icon}</span>
          </div>
          <div className="min-w-0">
            <p className="truncate font-headline text-base font-black text-on-surface">{activity.title}</p>
            <p className="mt-1 truncate text-xs font-semibold text-on-surface-variant">{activity.description}</p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-headline text-base font-black text-on-surface">{formatCurrency(activity.amount)}</p>
          <span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[10px] font-black ${statusClass}`}>
            {activity.status}
          </span>
        </div>
      </div>
    </div>
  );
}

function PpobKpi({
  label,
  value,
  icon,
  tone,
  meta,
  delay,
}: {
  label: string;
  value: string;
  icon: string;
  tone: PpobTone;
  meta: string;
  delay: number;
}) {
  const style = toneClass[tone];

  return (
    <div
      className="ppob-entrance group relative overflow-hidden rounded-xl border border-white/70 bg-white/78 p-5 shadow-[0_24px_70px_-48px_rgba(39, 23, 68,0.38)] hover:-translate-y-1 hover:bg-white"
      style={{ "--delay": `${delay}ms` } as CSSProperties}
    >
      <div className={`pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-gradient-to-br ${style.glow}`} />
      <div className={`absolute inset-x-5 bottom-0 h-1 rounded-full bg-gradient-to-r ${style.line}`} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant/70">{label}</p>
          <p className="mt-4 truncate font-headline text-xl font-black tracking-[-0.05em] text-on-surface sm:text-4xl">{value}</p>
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${style.icon}`}>
          <span className="material-symbols-outlined icon-fill text-[23px]">{icon}</span>
        </div>
      </div>
      <div className={`relative mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${style.chip}`}>
        <span className="material-symbols-outlined text-[15px]">analytics</span>
        {meta}
      </div>
    </div>
  );
}

function HeroMiniStat({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-xl border border-white/16 bg-white/10 p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/55">{label}</span>
        <span className="material-symbols-outlined text-[18px] text-[#a7f3d0]">{icon}</span>
      </div>
      <div className="mt-3 truncate font-headline text-xl font-black tracking-[-0.04em]">{value}</div>
    </div>
  );
}

function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-white/14 bg-white/10 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/52">{label}</p>
      <p className="mt-1.5 truncate font-headline text-base font-black tracking-[-0.04em] text-white">{value}</p>
    </div>
  );
}

function MiniSummary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[#ecdfff] bg-white/80 px-3 py-2.5 text-center">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-on-surface-variant/60">{label}</p>
      <p className="mt-1 truncate font-headline text-[15px] font-black tracking-[-0.04em] text-on-surface">{value}</p>
    </div>
  );
}

