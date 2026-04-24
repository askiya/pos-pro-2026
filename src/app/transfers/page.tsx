"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

import ResponsiveLayout from "@/components/layout/ResponsiveLayout";
import { useToast } from "@/components/ui/ToastProvider";
import { getApiErrorMessage, readApiPayload, toApiArray } from "@/lib/client-api";
import { formatCurrency, formatNumber } from "@/lib/format";

interface Branch {
  id: string;
  name: string;
  location?: string | null;
  _count?: {
    users?: number;
  };
}

interface Product {
  id: string;
  name: string;
  sku?: string;
  barcode?: string;
  stock: number;
  price: number | string;
  category?: { name: string };
}

type TransferTone = "indigo" | "emerald" | "amber" | "coral" | "blue";

const transferPalette = [
  { name: "Midnight Transfer", value: "#271744", label: "Kontrol mutasi" },
  { name: "Electric Indigo", value: "#a277ff", label: "Aksi review" },
  { name: "Mint Route", value: "#12b981", label: "Cabang aman" },
];

const toneClass: Record<TransferTone, { icon: string; chip: string; line: string; glow: string }> = {
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

const transferSteps = [
  { label: "Source", icon: "storefront" },
  { label: "Destination", icon: "local_shipping" },
  { label: "Products", icon: "inventory_2" },
  { label: "Review", icon: "fact_check" },
];

function getProductStockTone(stock: number): TransferTone {
  if (stock === 0) return "coral";
  if (stock <= 5) return "amber";
  return "emerald";
}

function getProductPrice(product: Product) {
  return typeof product.price === "string" ? Number(product.price) : Number(product.price);
}

export default function TransfersPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sourceBranchId, setSourceBranchId] = useState("");
  const [destinationBranchId, setDestinationBranchId] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const { showToast } = useToast();

  const fetchTransferData = useCallback(async () => {
    setLoading(true);
    try {
      const [branchesRes, productsRes] = await Promise.all([
        fetch("/api/branches"),
        fetch("/api/products"),
      ]);
      const [branchesPayload, productsPayload] = await Promise.all([
        readApiPayload(branchesRes),
        readApiPayload(productsRes),
      ]);

      const nextBranches = branchesRes.ok ? toApiArray<Branch>(branchesPayload) : [];
      const nextProducts = productsRes.ok ? toApiArray<Product>(productsPayload) : [];

      setBranches(nextBranches);
      setProducts(nextProducts);
      setSourceBranchId((current) => current || nextBranches[0]?.id || "");
      setDestinationBranchId((current) => {
        if (current) return current;
        return nextBranches.find((branch) => branch.id !== nextBranches[0]?.id)?.id || "";
      });

      if (!branchesRes.ok || !productsRes.ok) {
        const message = getApiErrorMessage(
          !branchesRes.ok ? branchesPayload : productsPayload,
          "Sebagian data transfer belum bisa dimuat.",
        );
        setLoadError(message);
        showToast({
          title: "Transfer data belum lengkap",
          description: message,
          variant: "error",
        });
      } else {
        setLoadError(null);
      }
    } catch (error) {
      console.error("Failed to fetch transfer data:", error);
      setBranches([]);
      setProducts([]);
      setLoadError("Data transfer belum bisa dimuat. Coba refresh halaman.");
      showToast({
        title: "Transfer belum bisa dimuat",
        description: "Cek koneksi backend atau coba ulang beberapa saat lagi.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void fetchTransferData();
  }, [fetchTransferData]);

  const sourceBranch = branches.find((branch) => branch.id === sourceBranchId) ?? null;
  const destinationBranch = branches.find((branch) => branch.id === destinationBranchId) ?? null;

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return products.filter((product) => {
      if (!keyword) return true;
      return (
        product.name.toLowerCase().includes(keyword) ||
        product.sku?.toLowerCase().includes(keyword) ||
        product.barcode?.toLowerCase().includes(keyword) ||
        product.category?.name.toLowerCase().includes(keyword)
      );
    });
  }, [products, search]);

  const selectedItems = useMemo(() => {
    return products
      .map((product) => ({
        product,
        quantity: quantities[product.id] ?? 0,
      }))
      .filter((item) => item.quantity > 0);
  }, [products, quantities]);

  const totalQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const transferValue = selectedItems.reduce(
    (sum, item) => sum + getProductPrice(item.product) * item.quantity,
    0,
  );
  const activeStep = selectedItems.length > 0 ? 4 : destinationBranch ? 3 : sourceBranch ? 2 : 1;
  const canReview = Boolean(sourceBranch && destinationBranch && sourceBranch.id !== destinationBranch.id && selectedItems.length > 0);

  const setProductQuantity = (product: Product, nextQuantity: number) => {
    const safeQuantity = Math.max(0, Math.min(product.stock, Math.round(nextQuantity || 0)));
    setQuantities((current) => {
      if (safeQuantity === 0) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [product.id]: _removed, ...rest } = current;
        return rest;
      }

      return { ...current, [product.id]: safeQuantity };
    });
  };

  const resetTransfer = () => {
    setQuantities({});
    setSearch("");
    setIsReviewOpen(false);
  };

  const handleReview = () => {
    if (!canReview) {
      showToast({
        title: "Transfer belum lengkap",
        description: "Pilih source, destination yang berbeda, dan minimal satu produk.",
        variant: "error",
      });
      return;
    }

    setIsReviewOpen(true);
  };

  const handleSubmitTransfer = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceBranchId,
          destinationBranchId,
          items: selectedItems.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        }),
      });

      const payload = await readApiPayload(response);

      if (!response.ok) {
        showToast({
          title: "Transfer gagal",
          description: getApiErrorMessage(payload, "Gagal memproses mutasi stok."),
          variant: "error",
        });
        return;
      }

      showToast({
        title: "Transfer Berhasil",
        description: "Mutasi stok antar cabang telah dicatat di sistem.",
        variant: "success",
      });
      
      resetTransfer();
      void fetchTransferData();
    } catch {
      showToast({
        title: "Koneksi Error",
        description: "Gagal menghubungi server. Silakan coba lagi.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResponsiveLayout>
      <div className="h-full overflow-y-auto px-4 py-5 pb-28 md:px-6 md:pb-8">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-6">
          <section className="transfer-entrance transfer-sheen relative overflow-hidden rounded-[36px] border border-white/70 bg-[linear-gradient(135deg,#271744_0%,#5c3d99_48%,#a277ff_100%)] p-5 text-white shadow-[0_28px_90px_-58px_rgba(17,24,39,0.82)] sm:p-7">
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#12b981]/22" />
            <div className="pointer-events-none absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-[#f59e0b]/14" />

            <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(420px,0.8fr)] xl:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-white/75">
                  <span className="h-2 w-2 rounded-full bg-[#12b981] transfer-live-dot" />
                  Stock Transfer Command
                </div>
                <h1 className="mt-5 max-w-3xl font-headline text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl xl:text-6xl">
                  Mutasi stok antar cabang jadi lebih rapi, cepat, dan aman direview.
                </h1>
                <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-white/72 sm:text-base">
                  Pilih source, destination, produk, lalu buka review drawer untuk memastikan kuantitas sebelum transfer diproses.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {transferPalette.map((color) => (
                    <div key={color.name} className="flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-3 py-2 text-xs font-bold text-white/82">
                      <span className="h-3 w-3 rounded-full" style={{ background: color.value }} />
                      <span>{color.name}</span>
                      <span className="hidden text-white/45 sm:inline">/ {color.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <HeroMiniStat label="Items" value={String(selectedItems.length)} icon="inventory_2" />
                <HeroMiniStat label="Quantity" value={formatNumber(totalQuantity)} icon="move_down" />
                <HeroMiniStat label="Value" value={formatCurrency(transferValue)} icon="payments" />
              </div>
            </div>
          </section>

          {loadError ? (
            <TransferError message={loadError} onRetry={() => void fetchTransferData()} />
          ) : null}

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <TransferKpi label="Cabang" value={String(branches.length)} icon="storefront" tone="indigo" meta="Source dan destination" delay={40} />
            <TransferKpi label="Produk" value={String(products.length)} icon="inventory_2" tone="blue" meta={`${filteredProducts.length} tampil`} delay={90} />
            <TransferKpi label="Selected" value={String(selectedItems.length)} icon="checklist" tone="emerald" meta={`${formatNumber(totalQuantity)} total qty`} delay={140} />
            <TransferKpi label="Transfer Value" value={formatCurrency(transferValue)} icon="payments" tone="amber" meta="Estimasi nilai stok" delay={190} />
          </section>

          <TransferStepper activeStep={activeStep} />

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
            <div className="flex min-w-0 flex-col gap-6">
              <BranchSelector
                branches={branches}
                sourceBranchId={sourceBranchId}
                destinationBranchId={destinationBranchId}
                onSourceChange={setSourceBranchId}
                onDestinationChange={setDestinationBranchId}
                loading={loading}
              />

              <ProductTransferList
                products={filteredProducts}
                quantities={quantities}
                loading={loading}
                search={search}
                onSearchChange={setSearch}
                onQuantityChange={setProductQuantity}
                onResetSearch={() => setSearch("")}
              />
            </div>

            <TransferContext
              sourceBranch={sourceBranch}
              destinationBranch={destinationBranch}
              selectedItems={selectedItems}
              totalQuantity={totalQuantity}
              transferValue={transferValue}
              canReview={canReview}
              onReview={handleReview}
              onReset={resetTransfer}
            />
          </section>
        </div>
      </div>

      <TransferReviewDock
        selectedCount={selectedItems.length}
        totalQuantity={totalQuantity}
        transferValue={transferValue}
        hidden={isReviewOpen}
        onReview={handleReview}
      />

      <TransferReviewDrawer
        open={isReviewOpen}
        sourceBranch={sourceBranch}
        destinationBranch={destinationBranch}
        selectedItems={selectedItems}
        totalQuantity={totalQuantity}
        transferValue={transferValue}
        isSubmitting={isSubmitting}
        onClose={() => setIsReviewOpen(false)}
        onSubmit={handleSubmitTransfer}
      />
    </ResponsiveLayout>
  );
}

function TransferStepper({ activeStep }: { activeStep: number }) {
  return (
    <section className="transfer-entrance rounded-[34px] border border-white/70 bg-white/76 p-4 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)]" style={{ "--delay": "230ms" } as CSSProperties}>
      <div className="grid gap-3 sm:grid-cols-4">
        {transferSteps.map((step, index) => {
          const stepNumber = index + 1;
          const isDone = activeStep > stepNumber;
          const isActive = activeStep === stepNumber;
          return (
            <div key={step.label} className="relative overflow-hidden rounded-[26px] border border-[#ecdfff] bg-white/70 p-4">
              <div className={`absolute inset-x-0 bottom-0 h-1 ${isDone || isActive ? "bg-[linear-gradient(90deg,#12b981,#a277ff)]" : "bg-[#ecdfff]"}`} />
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isDone ? "bg-[#e6f7ef] text-[#047857]" : isActive ? "bg-[#f5edff] text-[#a277ff]" : "bg-[#f4f6ff] text-on-surface-variant"}`}>
                  <span className="material-symbols-outlined icon-fill text-[21px]">{isDone ? "check" : step.icon}</span>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant/60">Step {stepNumber}</p>
                  <p className="mt-1 font-headline text-lg font-black text-on-surface">{step.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function BranchSelector({
  branches,
  sourceBranchId,
  destinationBranchId,
  onSourceChange,
  onDestinationChange,
  loading,
}: {
  branches: Branch[];
  sourceBranchId: string;
  destinationBranchId: string;
  onSourceChange: (id: string) => void;
  onDestinationChange: (id: string) => void;
  loading: boolean;
}) {
  return (
    <section className="transfer-entrance overflow-hidden rounded-[34px] border border-white/70 bg-white/76 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)]" style={{ "--delay": "280ms" } as CSSProperties}>
      <div className="border-b border-[#ecdfff] px-5 py-4">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#a277ff]/75">Route Builder</p>
        <h2 className="mt-2 font-headline text-2xl font-black tracking-[-0.05em] text-on-surface">Pilih rute transfer</h2>
        <p className="mt-1 text-sm font-medium text-on-surface-variant">Source dan destination harus berbeda supaya mutasi stok jelas.</p>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center">
        <BranchSelectCard
          title="From Source"
          icon="storefront"
          value={sourceBranchId}
          branches={branches}
          excludeBranchId={destinationBranchId}
          onChange={onSourceChange}
          loading={loading}
          tone="indigo"
        />
        <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-[#f5edff] text-[#a277ff] lg:flex">
          <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
        </div>
        <BranchSelectCard
          title="To Destination"
          icon="local_shipping"
          value={destinationBranchId}
          branches={branches}
          excludeBranchId={sourceBranchId}
          onChange={onDestinationChange}
          loading={loading}
          tone="emerald"
        />
      </div>
    </section>
  );
}

function BranchSelectCard({
  title,
  icon,
  value,
  branches,
  excludeBranchId,
  onChange,
  loading,
  tone,
}: {
  title: string;
  icon: string;
  value: string;
  branches: Branch[];
  excludeBranchId: string;
  onChange: (id: string) => void;
  loading: boolean;
  tone: TransferTone;
}) {
  const selectedBranch = branches.find((branch) => branch.id === value);
  const style = toneClass[tone];

  return (
    <div className="rounded-[30px] border border-white/70 bg-white/78 p-4 shadow-[0_18px_48px_-40px_rgba(39, 23, 68,0.4)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant/70">{title}</p>
          <h3 className="mt-2 font-headline text-xl font-black text-on-surface">{selectedBranch?.name ?? "Belum dipilih"}</h3>
          <p className="mt-1 text-sm font-medium text-on-surface-variant">{selectedBranch?.location || "Pilih cabang dari daftar"}</p>
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${style.icon}`}>
          <span className="material-symbols-outlined icon-fill text-[23px]">{icon}</span>
        </div>
      </div>

      <select
        disabled={loading || branches.length === 0}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="app-field mt-4 px-4 py-3 text-sm font-black"
      >
        <option value="">Pilih cabang</option>
        {branches
          .filter((branch) => branch.id !== excludeBranchId)
          .map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
      </select>
    </div>
  );
}

function ProductTransferList({
  products: filteredProducts,
  quantities,
  loading,
  search,
  onSearchChange,
  onQuantityChange,
  onResetSearch,
}: {
  products: Product[];
  quantities: Record<string, number>;
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onQuantityChange: (product: Product, quantity: number) => void;
  onResetSearch: () => void;
}) {
  return (
    <section className="transfer-entrance overflow-hidden rounded-[34px] border border-white/70 bg-white/76 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)]" style={{ "--delay": "330ms" } as CSSProperties}>
      <div className="border-b border-[#ecdfff] px-5 py-4">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#12b981]/80">Product Manifest</p>
            <h2 className="mt-2 font-headline text-2xl font-black tracking-[-0.05em] text-on-surface">Pilih item transfer</h2>
            <p className="mt-1 text-sm font-medium text-on-surface-variant">Atur quantity tanpa melebihi stok source.</p>
          </div>
          <button
            onClick={onResetSearch}
            className="rounded-full bg-[#f5edff] px-4 py-2 text-sm font-black text-[#8657ea] hover:bg-[#e6d9ff]"
            type="button"
          >
            Reset Search
          </button>
        </div>
      </div>

      <div className="border-b border-[#ecdfff] bg-[#f8f9ff] p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              className="app-field py-4 pl-12 pr-4 text-sm font-semibold"
              placeholder="Cari produk, SKU, kategori, atau barcode..."
              type="text"
            />
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-[22px] bg-[#271744] px-5 py-3 text-sm font-black text-white shadow-[0_18px_36px_-28px_rgba(17,24,39,0.75)] hover:-translate-y-0.5"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">barcode_scanner</span>
            Scan Item
          </button>
        </div>
      </div>

      <div className="grid gap-3 p-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-[28px] bg-white/80" />
          ))
        ) : filteredProducts.length === 0 ? (
          <EmptyTransferState />
        ) : (
          filteredProducts.map((product, index) => (
            <ProductTransferRow
              key={product.id}
              product={product}
              quantity={quantities[product.id] ?? 0}
              delay={index * 30}
              onQuantityChange={(quantity) => onQuantityChange(product, quantity)}
            />
          ))
        )}
      </div>
    </section>
  );
}

function ProductTransferRow({
  product,
  quantity,
  delay,
  onQuantityChange,
}: {
  product: Product;
  quantity: number;
  delay: number;
  onQuantityChange: (quantity: number) => void;
}) {
  const stockTone = getProductStockTone(product.stock);
  const style = toneClass[stockTone];
  const selected = quantity > 0;

  return (
    <div
      className={`transfer-row grid gap-4 rounded-[28px] border p-4 shadow-[0_20px_54px_-42px_rgba(39, 23, 68,0.38)] lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center ${
        selected ? "border-[#a277ff]/38 bg-[#f6f7ff]" : "border-white/70 bg-white/78 hover:bg-white"
      }`}
      style={{ "--delay": `${delay}ms` } as CSSProperties}
    >
      <div className="flex min-w-0 gap-4">
        <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[24px] ${style.icon}`}>
          <span className="material-symbols-outlined icon-fill text-[28px]">inventory_2</span>
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="line-clamp-1 font-headline text-lg font-black tracking-[-0.04em] text-on-surface">{product.name}</h3>
            <span className={`rounded-full px-3 py-1 text-xs font-black ${style.chip}`}>
              {product.stock === 0 ? "Out" : product.stock <= 5 ? "Low" : "Ready"}
            </span>
          </div>
          <p className="mt-1 truncate text-xs font-semibold text-on-surface-variant">
            SKU {product.sku || "-"} - {product.category?.name || "Uncategorized"}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <MiniBadge label="Stock" value={formatNumber(product.stock)} />
            <MiniBadge label="Value" value={formatCurrency(getProductPrice(product))} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 lg:justify-end">
        <button
          onClick={() => onQuantityChange(quantity - 1)}
          disabled={quantity === 0}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5edff] text-[#a277ff] hover:bg-[#e6d9ff] disabled:opacity-40"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">remove</span>
        </button>
        <input
          value={quantity}
          min={0}
          max={product.stock}
          onChange={(event) => onQuantityChange(Number(event.target.value))}
          className="app-field w-24 px-3 py-3 text-center font-headline text-lg font-black"
          type="number"
        />
        <button
          onClick={() => onQuantityChange(quantity + 1)}
          disabled={quantity >= product.stock}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#271744_0%,#a277ff_100%)] text-white hover:-translate-y-0.5 disabled:opacity-40"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
        </button>
      </div>
    </div>
  );
}

function TransferContext({
  sourceBranch,
  destinationBranch,
  selectedItems,
  totalQuantity,
  transferValue,
  canReview,
  onReview,
  onReset,
}: {
  sourceBranch: Branch | null;
  destinationBranch: Branch | null;
  selectedItems: { product: Product; quantity: number }[];
  totalQuantity: number;
  transferValue: number;
  canReview: boolean;
  onReview: () => void;
  onReset: () => void;
}) {
  return (
    <aside className="transfer-entrance flex flex-col gap-6 xl:sticky xl:top-4 xl:self-start" style={{ "--delay": "360ms" } as CSSProperties}>
      <section className="overflow-hidden rounded-[34px] border border-white/70 bg-white/76 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)]">
        <div className="transfer-sheen relative overflow-hidden bg-[linear-gradient(135deg,#271744_0%,#a277ff_100%)] p-5 text-white">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-white/55">Transfer Route</p>
          <h2 className="mt-3 font-headline text-3xl font-black tracking-[-0.05em]">Konteks mutasi</h2>
          <p className="mt-2 text-sm font-medium leading-6 text-white/68">Pastikan source dan destination sudah benar sebelum review.</p>
        </div>
        <div className="grid gap-4 p-4">
          <RouteLine icon="storefront" label="From Source" branch={sourceBranch} tone="indigo" />
          <div className="ml-6 h-8 w-px bg-[#d4c8e3]" />
          <RouteLine icon="local_shipping" label="To Destination" branch={destinationBranch} tone="emerald" />
        </div>
      </section>

      <section className="rounded-[34px] border border-white/70 bg-white/76 p-4 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)]">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#a277ff]/75">Transfer Summary</p>
        <div className="mt-4 grid gap-3">
          <SummaryLine label="Items Selected" value={String(selectedItems.length)} />
          <SummaryLine label="Total Quantity" value={formatNumber(totalQuantity)} />
          <SummaryLine label="Transfer Value" value={formatCurrency(transferValue)} />
        </div>

        <button
          onClick={onReview}
          disabled={!canReview}
          className="mt-5 flex w-full items-center justify-between rounded-[26px] bg-[linear-gradient(135deg,#271744_0%,#a277ff_100%)] px-5 py-4 text-left text-white shadow-[0_24px_52px_-34px_rgba(162, 119, 255,0.85)] hover:-translate-y-0.5 disabled:opacity-45"
          type="button"
        >
          <span className="font-headline text-xl font-black">Review Transfer</span>
          <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
        </button>
        <button
          onClick={onReset}
          className="mt-3 w-full rounded-[22px] border border-[#ecdfff] bg-white/80 px-5 py-3 text-sm font-black text-on-surface-variant hover:bg-white hover:text-[#a277ff]"
          type="button"
        >
          Reset Transfer
        </button>
      </section>
    </aside>
  );
}

function TransferReviewDock({
  selectedCount,
  totalQuantity,
  transferValue,
  hidden,
  onReview,
}: {
  selectedCount: number;
  totalQuantity: number;
  transferValue: number;
  hidden: boolean;
  onReview: () => void;
}) {
  return (
    <div
      className={`fixed bottom-5 left-4 right-4 z-[70] transition duration-300 md:left-auto md:right-6 md:w-[350px] xl:w-[368px] ${
        hidden ? "pointer-events-none translate-y-4 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="rounded-[24px] border border-white/70 bg-white/92 p-2.5 shadow-[0_26px_80px_-42px_rgba(39, 23, 68,0.55)] backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] bg-[#f5edff] text-[#a277ff]">
            <span className="material-symbols-outlined icon-fill text-[22px]">swap_horiz</span>
            {selectedCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#12b981] px-1 text-[9px] font-black text-white">
                {selectedCount}
              </span>
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-headline text-[15px] font-black text-on-surface">
              {selectedCount > 0 ? `${formatNumber(totalQuantity)} qty siap direview` : "Belum ada item transfer"}
            </p>
            <p className="mt-0.5 text-[11px] font-semibold text-on-surface-variant">{formatCurrency(transferValue)}</p>
          </div>
          <button
            onClick={onReview}
            className="shrink-0 rounded-[16px] bg-[linear-gradient(135deg,#271744_0%,#a277ff_100%)] px-3.5 py-2.5 text-[13px] font-black text-white shadow-[0_18px_38px_-26px_rgba(162, 119, 255,0.85)] hover:-translate-y-0.5"
            type="button"
          >
            Review
          </button>
        </div>
      </div>
    </div>
  );
}

function TransferReviewDrawer({
  open,
  sourceBranch,
  destinationBranch,
  selectedItems,
  totalQuantity,
  transferValue,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  open: boolean;
  sourceBranch: Branch | null;
  destinationBranch: Branch | null;
  selectedItems: { product: Product; quantity: number }[];
  totalQuantity: number;
  transferValue: number;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className={`fixed inset-0 z-[95] transition ${open ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!open}>
      <button
        aria-label="Close transfer review"
        className={`absolute inset-0 bg-[#271744]/42 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
        type="button"
      />

      <aside className={`absolute right-0 top-0 flex h-full w-full max-w-[430px] flex-col overflow-hidden border-l border-white/60 bg-[#f7f8ff]/96 shadow-[0_34px_110px_-44px_rgba(17,24,39,0.72)] backdrop-blur-2xl transition-transform duration-300 ease-out xl:max-w-[448px] ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between gap-3 border-b border-[#ecdfff] px-4 py-3.5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#a277ff]/75">Review Drawer</p>
            <h2 className="mt-1 font-headline text-[1.7rem] font-black tracking-[-0.05em] text-on-surface">Review Transfer</h2>
          </div>
          <button onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] border border-[#ecdfff] bg-white/84 text-on-surface-variant hover:bg-white hover:text-[#a277ff]" type="button">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="transfer-sheen relative overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#271744_0%,#a277ff_100%)] p-4 text-white shadow-[0_28px_70px_-44px_rgba(162, 119, 255,0.92)]">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-white/55">Transfer Summary</p>
            <h3 className="mt-2.5 font-headline text-[2rem] font-black tracking-[-0.05em]">Siap diproses</h3>
            <p className="mt-2 text-[13px] font-medium leading-5 text-white/68">
              {sourceBranch?.name ?? "Source"} ke {destinationBranch?.name ?? "Destination"}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <SummaryBox label="Qty" value={formatNumber(totalQuantity)} />
              <SummaryBox label="Value" value={formatCurrency(transferValue)} />
            </div>
          </div>

          <div className="mt-3.5 grid gap-2.5">
            {selectedItems.length === 0 ? (
              <EmptyTransferState compact />
            ) : (
              selectedItems.map((item, index) => (
                <div
                  key={item.product.id}
                  className="transfer-row rounded-[20px] border border-white/70 bg-white/78 p-3.5 shadow-[0_18px_42px_-34px_rgba(39, 23, 68,0.38)]"
                  style={{ "--delay": `${index * 28}ms` } as CSSProperties}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-headline text-[15px] font-black text-on-surface">{item.product.name}</p>
                      <p className="mt-1 text-[11px] font-semibold text-on-surface-variant">SKU {item.product.sku || "-"}</p>
                    </div>
                    <span className="rounded-full bg-[#f5edff] px-2.5 py-1 text-[11px] font-black text-[#8657ea]">
                      x{formatNumber(item.quantity)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-[#ecdfff] bg-white/80 p-3">
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex w-full items-center justify-between rounded-[20px] bg-[linear-gradient(135deg,#271744_0%,#a277ff_100%)] px-4 py-3 text-left text-white shadow-[0_24px_52px_-34px_rgba(162, 119, 255,0.85)] hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
            type="button"
          >
            <span className="font-headline text-lg font-black">{isSubmitting ? "Processing..." : "Confirm Transfer"}</span>
            <span className={`material-symbols-outlined text-[22px] ${isSubmitting ? "animate-spin" : ""}`}>{isSubmitting ? "progress_activity" : "arrow_forward"}</span>
          </button>
        </div>
      </aside>
    </div>
  );
}

function RouteLine({ icon, label, branch, tone }: { icon: string; label: string; branch: Branch | null; tone: TransferTone }) {
  const style = toneClass[tone];

  return (
    <div className="flex gap-4">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${style.icon}`}>
        <span className="material-symbols-outlined icon-fill text-[22px]">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant/65">{label}</p>
        <p className="mt-1 truncate font-headline text-xl font-black text-on-surface">{branch?.name ?? "Belum dipilih"}</p>
        <p className="mt-1 text-sm font-medium text-on-surface-variant">{branch?.location || "Pilih cabang untuk melanjutkan"}</p>
      </div>
    </div>
  );
}

function TransferKpi({
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
  tone: TransferTone;
  meta: string;
  delay: number;
}) {
  const style = toneClass[tone];

  return (
    <div
      className="transfer-entrance group relative overflow-hidden rounded-[30px] border border-white/70 bg-white/78 p-5 shadow-[0_24px_70px_-48px_rgba(39, 23, 68,0.38)] hover:-translate-y-1 hover:bg-white"
      style={{ "--delay": `${delay}ms` } as CSSProperties}
    >
      <div className={`pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-gradient-to-br ${style.glow}`} />
      <div className={`absolute inset-x-5 bottom-0 h-1 rounded-full bg-gradient-to-r ${style.line}`} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant/70">{label}</p>
          <p className="mt-4 truncate font-headline text-3xl font-black tracking-[-0.05em] text-on-surface sm:text-4xl">{value}</p>
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
    <div className="rounded-[24px] border border-white/16 bg-white/10 p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/55">{label}</span>
        <span className="material-symbols-outlined text-[18px] text-[#a7f3d0]">{icon}</span>
      </div>
      <div className="mt-3 truncate font-headline text-xl font-black tracking-[-0.04em]">{value}</div>
    </div>
  );
}

function MiniBadge({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full bg-[#f4f6ff] px-3 py-1 text-xs font-black text-on-surface-variant">
      {label}: {value}
    </span>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[22px] border border-[#ecdfff] bg-white/72 px-4 py-3">
      <span className="text-sm font-bold text-on-surface-variant">{label}</span>
      <span className="font-headline text-lg font-black text-on-surface">{value}</span>
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

function EmptyTransferState({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center border border-dashed border-[#d4c8e3] bg-white/60 text-center ${compact ? "min-h-[190px] rounded-[24px] p-6" : "min-h-[320px] rounded-[30px] p-8"}`}>
      <div className={`flex items-center justify-center bg-[#f5edff] text-[#a277ff] ${compact ? "h-16 w-16 rounded-[22px]" : "h-20 w-20 rounded-[30px]"}`}>
        <span className={`material-symbols-outlined icon-fill ${compact ? "text-[30px]" : "text-4xl"}`}>inventory_2</span>
      </div>
      <p className={`font-headline font-black text-on-surface ${compact ? "mt-4 text-xl" : "mt-5 text-2xl"}`}>Belum ada item transfer</p>
      <p className={`mt-2 max-w-sm text-on-surface-variant ${compact ? "text-[13px] leading-5" : "text-sm leading-6"}`}>Pilih produk dan isi quantity untuk mulai membuat mutasi stok antar cabang.</p>
    </div>
  );
}

function TransferError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="transfer-entrance rounded-[30px] border border-[#fecdd3] bg-[#fff7f7] p-5 text-[#be123c]" style={{ "--delay": "20ms" } as CSSProperties}>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff1f2]">
            <span className="material-symbols-outlined icon-fill text-[24px]">cloud_off</span>
          </div>
          <div>
            <p className="font-headline text-xl font-black text-on-surface">Data transfer belum termuat</p>
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
