"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import { useRouter } from "next/navigation";

import ResponsiveLayout from "@/components/layout/ResponsiveLayout";
import AddProductModal from "@/components/inventory/AddProductModal";
import { AppModal } from "@/components/ui/AppModal";
import { useToast } from "@/components/ui/ToastProvider";
import { getApiErrorMessage, readApiPayload, toApiArray, toApiObject } from "@/lib/client-api";
import { formatCurrency } from "@/lib/format";

interface Product {
  id: string;
  name: string;
  barcode: string;
  sku: string;
  stock: number;
  price: number | string;
  lowStockThreshold?: number;
  aggregateStock?: number;
  imageUrl?: string;
  category?: { name: string };
}

interface Category {
  id: string;
  name: string;
}

type StockFilter = "ALL" | "HEALTHY" | "LOW" | "OUT";
type ProductStockStatus = "HEALTHY" | "LOW" | "OUT";
type InventoryTone = "indigo" | "emerald" | "amber" | "coral";

const inventoryPalette = [
  { name: "Deep Inventory", value: "#271744", label: "Kontrol stok" },
  { name: "Electric Indigo", value: "#a277ff", label: "Aksi cepat" },
  { name: "Fresh Mint", value: "#12b981", label: "Stok sehat" },
];

const toneClass: Record<InventoryTone, { icon: string; chip: string; line: string; glow: string }> = {
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

function getStockStatus(stock: number, lowStockThreshold = 5): ProductStockStatus {
  if (stock === 0) return "OUT";
  if (stock <= Math.max(1, lowStockThreshold)) return "LOW";
  return "HEALTHY";
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [isOpnameOpen, setIsOpnameOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [stockFilter, setStockFilter] = useState<StockFilter>("ALL");
  const [adjustmentSubmitting, setAdjustmentSubmitting] = useState(false);
  const [opnameSubmitting, setOpnameSubmitting] = useState(false);
  const [adjustmentForm, setAdjustmentForm] = useState({
    productId: "",
    quantity: "",
    reason: "Penyesuaian manual",
    note: "",
  });
  const [opnameForm, setOpnameForm] = useState({
    productId: "",
    physicalQuantity: "",
    reason: "Stock opname rutin",
    note: "",
  });
  const router = useRouter();
  const { showToast } = useToast();

  const resetAdjustmentForm = () => {
    setAdjustmentForm({
      productId: "",
      quantity: "",
      reason: "Penyesuaian manual",
      note: "",
    });
  };

  const resetOpnameForm = () => {
    setOpnameForm({
      productId: "",
      physicalQuantity: "",
      reason: "Stock opname rutin",
      note: "",
    });
  };

  const openAdjustmentModal = (productId = "") => {
    setAdjustmentForm({
      productId,
      quantity: "",
      reason: "Penyesuaian manual",
      note: "",
    });
    setIsAdjustmentOpen(true);
  };

  const openOpnameModal = (productId = "", physicalQuantity?: number) => {
    setOpnameForm({
      productId,
      physicalQuantity: physicalQuantity !== undefined ? String(physicalQuantity) : "",
      reason: "Stock opname rutin",
      note: "",
    });
    setIsOpnameOpen(true);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/categories"),
      ]);
      const [productsPayload, categoriesPayload] = await Promise.all([
        readApiPayload(productsRes),
        readApiPayload(categoriesRes),
      ]);

      if (productsRes.ok) {
        setProducts(toApiArray<Product>(productsPayload));
      } else {
        setProducts([]);
      }

      if (categoriesRes.ok) {
        setCategories(toApiArray<Category>(categoriesPayload));
      } else {
        setCategories([]);
      }

      if (!productsRes.ok || !categoriesRes.ok) {
        showToast({
          title: "Sebagian data inventory belum termuat",
          description: getApiErrorMessage(
            !productsRes.ok ? productsPayload : categoriesPayload,
            "Coba refresh halaman atau cek koneksi backend.",
          ),
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
      showToast({
        title: "Inventory belum bisa dimuat",
        description: "Coba refresh halaman atau cek koneksi backend.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const keyword = search.trim().toLowerCase();
      const matchesSearch =
        keyword === "" ||
        product.name.toLowerCase().includes(keyword) ||
        product.sku?.toLowerCase().includes(keyword) ||
        product.barcode?.toLowerCase().includes(keyword);

      const matchesCategory =
        selectedCategory === "ALL" || product.category?.name === selectedCategory;

      const status = getStockStatus(product.stock, product.lowStockThreshold);
      const matchesStock =
        stockFilter === "ALL" ||
        (stockFilter === "OUT" && status === "OUT") ||
        (stockFilter === "LOW" && status === "LOW") ||
        (stockFilter === "HEALTHY" && status === "HEALTHY");

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, search, selectedCategory, stockFilter]);

  const inventoryStats = useMemo(() => {
    const lowStockCount = products.filter((product) => getStockStatus(product.stock, product.lowStockThreshold) === "LOW").length;
    const outOfStockCount = products.filter((product) => getStockStatus(product.stock, product.lowStockThreshold) === "OUT").length;
    const healthyCount = products.filter((product) => getStockStatus(product.stock, product.lowStockThreshold) === "HEALTHY").length;
    const inventoryValue = products.reduce((sum, product) => sum + Number(product.price) * product.stock, 0);
    const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
    const healthRate = products.length > 0 ? Math.round((healthyCount / products.length) * 100) : 100;

    return {
      lowStockCount,
      outOfStockCount,
      healthyCount,
      inventoryValue,
      totalStock,
      healthRate,
    };
  }, [products]);

  const activeFilterCount =
    (search.trim() ? 1 : 0) +
    (selectedCategory !== "ALL" ? 1 : 0) +
    (stockFilter !== "ALL" ? 1 : 0);

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("ALL");
    setStockFilter("ALL");
  };

  const handleSubmitAdjustment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const quantity = Number(adjustmentForm.quantity);
    if (!adjustmentForm.productId || !Number.isInteger(quantity) || quantity === 0 || !adjustmentForm.reason.trim()) {
      showToast({
        title: "Adjustment belum lengkap",
        description: "Pilih produk, isi quantity selain 0, lalu tulis alasan adjustment.",
        variant: "error",
      });
      return;
    }

    setAdjustmentSubmitting(true);
    try {
      const response = await fetch("/api/stock-adjustments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: adjustmentForm.productId,
          quantity,
          reason: adjustmentForm.reason.trim(),
          note: adjustmentForm.note.trim() || undefined,
        }),
      });
      const payload = await readApiPayload(response);

      if (!response.ok) {
        showToast({
          title: "Adjustment stok gagal",
          description: getApiErrorMessage(payload, "Adjustment stok belum berhasil disimpan."),
          variant: "error",
        });
        return;
      }

      const result = toApiObject<{ quantityAfter?: number }>(payload);
      setIsAdjustmentOpen(false);
      resetAdjustmentForm();
      await fetchProducts();
      showToast({
        title: "Adjustment stok tersimpan",
        description:
          typeof result?.quantityAfter === "number"
            ? `Stok terbaru sekarang ${result.quantityAfter} unit.`
            : "Perubahan stok sudah tersimpan ke ledger inventory.",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to submit stock adjustment", error);
      showToast({
        title: "Adjustment stok gagal",
        description: "Cek koneksi backend atau coba ulang beberapa saat lagi.",
        variant: "error",
      });
    } finally {
      setAdjustmentSubmitting(false);
    }
  };

  const handleSubmitOpname = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const physicalQuantity = Number(opnameForm.physicalQuantity);
    if (!opnameForm.productId || !Number.isInteger(physicalQuantity) || physicalQuantity < 0 || !opnameForm.reason.trim()) {
      showToast({
        title: "Stock opname belum lengkap",
        description: "Pilih produk, isi stok fisik, lalu tulis alasan opname.",
        variant: "error",
      });
      return;
    }

    setOpnameSubmitting(true);
    try {
      const response = await fetch("/api/stock-opnames", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: opnameForm.productId,
          physicalQuantity,
          reason: opnameForm.reason.trim(),
          note: opnameForm.note.trim() || undefined,
        }),
      });
      const payload = await readApiPayload(response);

      if (!response.ok) {
        showToast({
          title: "Stock opname gagal",
          description: getApiErrorMessage(payload, "Stock opname belum berhasil disimpan."),
          variant: "error",
        });
        return;
      }

      const result = toApiObject<{ quantityAfter?: number; deltaQuantity?: number }>(payload);
      setIsOpnameOpen(false);
      resetOpnameForm();
      await fetchProducts();
      showToast({
        title: "Stock opname tersimpan",
        description:
          typeof result?.deltaQuantity === "number"
            ? `Selisih opname ${result.deltaQuantity >= 0 ? "+" : ""}${result.deltaQuantity} unit.`
            : "Hasil stock opname sudah tersimpan ke ledger inventory.",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to submit stock opname", error);
      showToast({
        title: "Stock opname gagal",
        description: "Cek koneksi backend atau coba ulang beberapa saat lagi.",
        variant: "error",
      });
    } finally {
      setOpnameSubmitting(false);
    }
  };

  return (
    <ResponsiveLayout>
      <AddProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchProducts} />
      <AppModal
        open={isAdjustmentOpen}
        onClose={() => {
          setIsAdjustmentOpen(false);
          resetAdjustmentForm();
        }}
        title="Stock Adjustment"
        description="Gunakan untuk koreksi stok rusak, hilang, bonus supplier, atau penyesuaian manual lainnya."
        icon="tune"
        size="md"
      >
        <form className="flex flex-col gap-5" onSubmit={handleSubmitAdjustment}>
          <div className="rounded-xl bg-[linear-gradient(135deg,#271744_0%,#a277ff_100%)] p-5 text-white">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/55">Adjustment Ledger</p>
            <h3 className="mt-2 font-headline text-xl font-black tracking-[-0.04em]">Koreksi stok dengan jejak yang rapi.</h3>
            <p className="mt-2 text-sm font-medium leading-6 text-white/70">
              Quantity bisa positif untuk stok masuk, atau negatif untuk stok keluar.
            </p>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant">Produk *</span>
            <select
              className="app-field px-4 py-3.5 text-sm font-semibold"
              value={adjustmentForm.productId}
              onChange={(event) => setAdjustmentForm((current) => ({ ...current, productId: event.target.value }))}
            >
              <option value="">-- Pilih produk --</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                  {product.sku ? ` (${product.sku})` : ""}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <InventoryField
              label="Delta Quantity *"
              type="number"
              value={adjustmentForm.quantity}
              placeholder="contoh: -2 atau 10"
              onChange={(value) => setAdjustmentForm((current) => ({ ...current, quantity: value }))}
            />
            <InventoryField
              label="Reason *"
              value={adjustmentForm.reason}
              placeholder="contoh: Barang rusak"
              onChange={(value) => setAdjustmentForm((current) => ({ ...current, reason: value }))}
            />
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant">Catatan</span>
            <textarea
              value={adjustmentForm.note}
              onChange={(event) => setAdjustmentForm((current) => ({ ...current, note: event.target.value }))}
              className="app-field min-h-[110px] px-4 py-3.5 text-sm font-medium"
              placeholder="Opsional: jelaskan konteks penyesuaian stok"
            />
          </label>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setIsAdjustmentOpen(false);
                resetAdjustmentForm();
              }}
              className="app-secondary-btn rounded-2xl px-5 py-3 text-sm font-black"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={adjustmentSubmitting}
              className="app-primary-btn rounded-2xl px-6 py-3 text-sm font-black disabled:opacity-60"
            >
              {adjustmentSubmitting ? "Menyimpan..." : "Simpan Adjustment"}
            </button>
          </div>
        </form>
      </AppModal>

      <AppModal
        open={isOpnameOpen}
        onClose={() => {
          setIsOpnameOpen(false);
          resetOpnameForm();
        }}
        title="Stock Opname"
        description="Masukkan stok fisik aktual agar sistem menghitung selisih dan mencatat koreksi inventory."
        icon="checklist"
        size="md"
      >
        <form className="flex flex-col gap-5" onSubmit={handleSubmitOpname}>
          <div className="rounded-xl bg-[linear-gradient(135deg,#0f766e_0%,#12b981_100%)] p-5 text-white">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Audit Stok</p>
            <h3 className="mt-2 font-headline text-xl font-black tracking-[-0.04em]">Rekonsiliasi stok fisik cabang.</h3>
            <p className="mt-2 text-sm font-medium leading-6 text-white/75">
              Cocokkan angka fisik dengan sistem, lalu selisihnya akan dibukukan otomatis.
            </p>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant">Produk *</span>
            <select
              className="app-field px-4 py-3.5 text-sm font-semibold"
              value={opnameForm.productId}
              onChange={(event) => setOpnameForm((current) => ({ ...current, productId: event.target.value }))}
            >
              <option value="">-- Pilih produk --</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                  {product.sku ? ` (${product.sku})` : ""}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <InventoryField
              label="Stok Fisik *"
              type="number"
              value={opnameForm.physicalQuantity}
              placeholder="0"
              onChange={(value) => setOpnameForm((current) => ({ ...current, physicalQuantity: value }))}
            />
            <InventoryField
              label="Reason *"
              value={opnameForm.reason}
              placeholder="contoh: Audit mingguan"
              onChange={(value) => setOpnameForm((current) => ({ ...current, reason: value }))}
            />
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant">Catatan</span>
            <textarea
              value={opnameForm.note}
              onChange={(event) => setOpnameForm((current) => ({ ...current, note: event.target.value }))}
              className="app-field min-h-[110px] px-4 py-3.5 text-sm font-medium"
              placeholder="Opsional: catat hasil audit, lokasi rak, atau temuan selisih"
            />
          </label>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setIsOpnameOpen(false);
                resetOpnameForm();
              }}
              className="app-secondary-btn rounded-2xl px-5 py-3 text-sm font-black"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={opnameSubmitting}
              className="rounded-2xl bg-[#047857] px-6 py-3 text-sm font-black text-white disabled:opacity-60"
            >
              {opnameSubmitting ? "Menyimpan..." : "Simpan Opname"}
            </button>
          </div>
        </form>
      </AppModal>

      <div className="h-full overflow-y-auto px-4 py-5 pb-28 md:px-6 md:pb-8">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4">
          <section className="inventory-entrance inventory-sheen relative overflow-hidden rounded-2xl border border-white/70 bg-[linear-gradient(135deg,#271744_0%,#5c3d99_50%,#a277ff_100%)] p-5 text-white shadow-[0_28px_90px_-58px_rgba(17,24,39,0.82)] sm:p-7">
            <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#12b981]/22" />
            <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-[#f59e0b]/14" />

            <div className="relative grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(420px,0.75fr)] xl:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-white/75">
                  <span className="h-2 w-2 rounded-full bg-[#12b981] inventory-live-dot" />
                  Inventory Command Center
                </div>
                <h1 className="mt-5 max-w-3xl font-headline text-3xl font-black tracking-[-0.06em] text-white sm:text-5xl xl:text-6xl">
                  Stok lebih rapi, cepat dicek, dan siap restock.
                </h1>
                <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-white/72 sm:text-base">
                  Pantau SKU, stok kritis, kategori, barcode, dan nilai inventory dengan tampilan yang lebih enak untuk operasional harian.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {inventoryPalette.map((color) => (
                    <div key={color.name} className="flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-3 py-2 text-xs font-bold text-white/82">
                      <span className="h-3 w-3 rounded-full" style={{ background: color.value }} />
                      <span>{color.name}</span>
                      <span className="hidden text-white/45 sm:inline">/ {color.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <HeroMiniStat label="Health Rate" value={`${inventoryStats.healthRate}%`} icon="verified" />
                <HeroMiniStat label="Total Stock" value={String(inventoryStats.totalStock)} icon="inventory" />
                <HeroMiniStat label="Value" value={formatCurrency(inventoryStats.inventoryValue)} icon="payments" />
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <InventoryKpi
              label="Total SKU"
              value={String(products.length)}
              icon="inventory_2"
              tone="indigo"
              meta={`${categories.length} kategori aktif`}
              delay={40}
            />
            <InventoryKpi
              label="Stok Aman"
              value={String(inventoryStats.healthyCount)}
              icon="health_and_safety"
              tone="emerald"
              meta={`${inventoryStats.healthRate}% inventory sehat`}
              delay={90}
            />
            <InventoryKpi
              label="Low Stock"
              value={String(inventoryStats.lowStockCount)}
              icon="priority_high"
              tone="amber"
              meta="Butuh pantauan"
              delay={140}
            />
            <InventoryKpi
              label="Stok Habis"
              value={String(inventoryStats.outOfStockCount)}
              icon="warning"
              tone={inventoryStats.outOfStockCount > 0 ? "coral" : "emerald"}
              meta={inventoryStats.outOfStockCount > 0 ? "Segera restock" : "Tidak ada stok habis"}
              delay={190}
            />
          </section>

          <section className="inventory-entrance grid gap-3 xl:grid-cols-[repeat(4,minmax(0,1fr))]" style={{ "--delay": "230ms" } as CSSProperties}>
            <ActionButton
              icon="tune"
              label="Stock Adjustment"
              description="Koreksi stok manual"
              tone="indigo"
              onClick={() => openAdjustmentModal()}
            />
            <ActionButton
              icon="checklist"
              label="Stock Opname"
              description="Audit stok cabang"
              tone="emerald"
              onClick={() => openOpnameModal()}
            />
            <ActionButton
              icon="swap_horiz"
              label="Stock Transfer"
              description="Pindah antar cabang"
              tone="amber"
              onClick={() => router.push("/transfers")}
            />
            <button
              onClick={() => setIsModalOpen(true)}
              className="group overflow-hidden rounded-xl bg-[linear-gradient(135deg,#271744_0%,#a277ff_100%)] p-5 text-left text-white shadow-[0_24px_64px_-44px_rgba(162, 119, 255,0.92)] hover:-translate-y-1"
              type="button"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-headline text-lg font-black">Add Product</p>
                  <p className="mt-1 text-sm font-medium text-white/68">Tambah SKU baru</p>
                </div>
                <span className="material-symbols-outlined rounded-2xl bg-white/12 p-3 text-[24px] transition group-hover:rotate-90">add</span>
              </div>
            </button>
          </section>

          <section className="inventory-entrance rounded-2xl border border-white/70 bg-white/76 p-4 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)] sm:p-5" style={{ "--delay": "280ms" } as CSSProperties}>
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
              <div>
                <div className="group relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant transition group-focus-within:text-[#a277ff]">
                    search
                  </span>
                  <input
                    className="app-field w-full py-4 pl-12 pr-4 text-sm font-semibold"
                    placeholder="Cari produk, SKU, atau barcode..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>

                <div className="mt-4 flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                  <FilterChip active={selectedCategory === "ALL"} onClick={() => setSelectedCategory("ALL")}>
                    Semua Kategori
                  </FilterChip>
                  {categories.map((category) => (
                    <FilterChip
                      key={category.id}
                      active={selectedCategory === category.name}
                      onClick={() => setSelectedCategory(category.name)}
                    >
                      {category.name}
                    </FilterChip>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 xl:justify-end">
                {([
                  { key: "ALL", label: "Semua Stok" },
                  { key: "HEALTHY", label: `Aman (${inventoryStats.healthyCount})` },
                  { key: "LOW", label: `Low (${inventoryStats.lowStockCount})` },
                  { key: "OUT", label: `Habis (${inventoryStats.outOfStockCount})` },
                ] as const).map((item) => (
                  <FilterChip key={item.key} active={stockFilter === item.key} onClick={() => setStockFilter(item.key)}>
                    {item.label}
                  </FilterChip>
                ))}
                <button
                  onClick={resetFilters}
                  className="rounded-full border border-[#ecdfff] bg-white/75 px-4 py-2 text-sm font-black text-on-surface-variant hover:bg-white hover:text-[#a277ff]"
                  type="button"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-col justify-between gap-3 rounded-xl border border-[#ecdfff] bg-[#f8f9ff] px-4 py-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant/65">Hasil Inventory</p>
                <p className="mt-1 font-headline text-xl font-black text-on-surface">
                  {loading ? "Memuat data" : `${filteredProducts.length} dari ${products.length} produk`}
                </p>
              </div>
              <div className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-[#a277ff]">
                {activeFilterCount > 0 ? `${activeFilterCount} filter aktif` : "Tanpa filter"}
              </div>
            </div>
          </section>

          <section className="inventory-entrance overflow-hidden rounded-2xl border border-white/70 bg-white/76 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)]" style={{ "--delay": "330ms" } as CSSProperties}>
            <div className="border-b border-[#ecdfff] px-5 py-4">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#a277ff]/75">Product Ledger</p>
                  <h2 className="mt-2 font-headline text-xl font-black tracking-[-0.05em] text-on-surface">Daftar Produk</h2>
                </div>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f5edff] px-4 py-2 text-sm font-black text-[#8657ea] hover:bg-[#e6d9ff]"
                  onClick={fetchProducts}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                  Refresh Data
                </button>
              </div>
            </div>

            <div className="hidden grid-cols-12 gap-4 border-b border-[#ecdfff] bg-[#f8f9ff] px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-on-surface-variant/70 lg:grid">
              <div className="col-span-4">Product</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-1 text-right">Stock</div>
              <div className="col-span-2">Barcode</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-1 text-right">Status</div>
            </div>

            {loading ? (
              <div className="grid gap-3 p-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-24 animate-pulse rounded-xl bg-white/80" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="m-4 rounded-xl border border-dashed border-[#d4c8e3] bg-white/70 p-5 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-xl bg-[#f5edff] text-[#a277ff]">
                  <span className="material-symbols-outlined icon-fill text-4xl">inventory_2</span>
                </div>
                <p className="mt-5 font-headline text-xl font-black tracking-[-0.05em] text-on-surface">
                  Belum ada produk yang cocok
                </p>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-on-surface-variant">
                  Coba ubah filter, reset pencarian, atau tambahkan SKU baru supaya inventory mulai terisi.
                </p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  <button onClick={resetFilters} className="app-secondary-btn rounded-2xl px-5 py-3 text-sm font-black" type="button">
                    Reset Filter
                  </button>
                  <button onClick={() => setIsModalOpen(true)} className="app-primary-btn rounded-2xl px-5 py-3 text-sm font-black" type="button">
                    Tambah Produk Baru
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-3 p-4">
                {filteredProducts.map((product, index) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    delay={index * 28}
                    onAdjust={() => openAdjustmentModal(product.id)}
                    onOpname={() => openOpnameModal(product.id, product.stock)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </ResponsiveLayout>
  );
}

function InventoryKpi({
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
  tone: InventoryTone;
  meta: string;
  delay: number;
}) {
  const style = toneClass[tone];

  return (
    <div
      className="inventory-entrance group relative overflow-hidden rounded-xl border border-white/70 bg-white/78 p-5 shadow-[0_24px_70px_-48px_rgba(39, 23, 68,0.38)] hover:-translate-y-1 hover:bg-white"
      style={{ "--delay": `${delay}ms` } as CSSProperties}
    >
      <div className={`pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-gradient-to-br ${style.glow}`} />
      <div className={`absolute inset-x-5 bottom-0 h-1 rounded-full bg-gradient-to-r ${style.line}`} />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant/70">{label}</p>
          <p className="mt-4 font-headline text-3xl font-black tracking-[-0.05em] text-on-surface">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${style.icon}`}>
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

function ActionButton({
  icon,
  label,
  description,
  tone,
  onClick,
}: {
  icon: string;
  label: string;
  description: string;
  tone: InventoryTone;
  onClick: () => void;
}) {
  const style = toneClass[tone];

  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-xl border border-white/70 bg-white/76 p-5 text-left shadow-[0_20px_54px_-42px_rgba(39, 23, 68,0.38)] hover:-translate-y-1 hover:bg-white"
      type="button"
    >
      <div className={`absolute inset-x-5 top-0 h-1 rounded-full bg-gradient-to-r ${style.line}`} />
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-headline text-lg font-black text-on-surface">{label}</p>
          <p className="mt-1 text-sm font-medium text-on-surface-variant">{description}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${style.icon}`}>
          <span className="material-symbols-outlined text-[23px]">{icon}</span>
        </div>
      </div>
    </button>
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

function FilterChip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-black ${
        active ? "app-chip-active" : "app-chip"
      }`}
      type="button"
    >
      {children}
    </button>
  );
}

function ProductRow({
  product,
  delay,
  onAdjust,
  onOpname,
}: {
  product: Product;
  delay: number;
  onAdjust: () => void;
  onOpname: () => void;
}) {
  const status = getStockStatus(product.stock, product.lowStockThreshold);
  const stockWidth = Math.min(100, Math.max(status === "OUT" ? 0 : 12, product.stock * 10));

  return (
    <div
      className="inventory-row grid gap-4 rounded-xl border border-white/70 bg-white/78 p-4 shadow-[0_20px_54px_-42px_rgba(39, 23, 68,0.38)] hover:bg-white lg:grid-cols-12 lg:items-center"
      style={{ "--delay": `${delay}ms` } as CSSProperties}
    >
      <div className="flex min-w-0 items-center gap-3 lg:col-span-4">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#f5edff] to-white text-[#a277ff]">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={product.name} className="h-full w-full object-cover" src={product.imageUrl} />
          ) : (
            <span className="material-symbols-outlined icon-fill text-[30px] text-[#a277ff]/48">inventory_2</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate font-headline text-lg font-black leading-tight text-on-surface">{product.name}</p>
          <p className="mt-1 truncate text-xs font-semibold text-on-surface-variant">
            {product.sku || "No SKU"} - {product.barcode || "No barcode"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
        <span className="inline-flex rounded-full bg-[#f5edff] px-3 py-1.5 text-xs font-black text-[#8657ea]">
          {product.category?.name || "Uncategorized"}
        </span>
      </div>

      <div className="lg:col-span-1 lg:text-right">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-on-surface-variant/65 lg:hidden">Stock</p>
        <p className="font-headline text-xl font-black text-on-surface">{product.stock}</p>
      </div>

      <div className="min-w-0 lg:col-span-2">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-on-surface-variant/65 lg:hidden">Barcode</p>
        <p className="truncate text-sm font-semibold text-on-surface-variant">{product.barcode || "-"}</p>
      </div>

      <div className="lg:col-span-2 lg:text-right">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-on-surface-variant/65 lg:hidden">Price</p>
        <p className="font-headline text-lg font-black text-on-surface">{formatCurrency(Number(product.price))}</p>
      </div>

      <div className="flex items-center justify-between gap-3 lg:col-span-1 lg:justify-end">
        <div className="h-2 w-24 overflow-hidden rounded-full bg-[#eef1fb] lg:hidden">
          <div
            className={`h-full rounded-full ${status === "OUT" ? "bg-[#be123c]" : status === "LOW" ? "bg-[#f59e0b]" : "bg-[#12b981]"}`}
            style={{ width: `${stockWidth}%` }}
          />
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="flex flex-wrap justify-end gap-2 lg:col-span-12">
        <button
          onClick={onAdjust}
          className="rounded-full bg-[#f5edff] px-3.5 py-2 text-xs font-black text-[#8657ea] hover:bg-[#e6d9ff]"
          type="button"
        >
          Adjustment
        </button>
        <button
          onClick={onOpname}
          className="rounded-full bg-[#e6f7ef] px-3.5 py-2 text-xs font-black text-[#047857] hover:bg-[#d1fae5]"
          type="button"
        >
          Opname
        </button>
      </div>
    </div>
  );
}

function InventoryField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="app-field px-4 py-3.5 text-sm font-semibold"
        placeholder={placeholder}
      />
    </label>
  );
}

function StatusBadge({ status }: { status: ProductStockStatus }) {
  const styles =
    status === "OUT"
      ? "bg-[#fff1f2] text-[#be123c]"
      : status === "LOW"
        ? "bg-[#fff7df] text-[#b45309]"
        : "bg-[#e6f7ef] text-[#047857]";

  const labels: Record<ProductStockStatus, string> = {
    HEALTHY: "Healthy",
    LOW: "Low",
    OUT: "Out",
  };

  return <span className={`rounded-full px-3 py-1.5 text-xs font-black ${styles}`}>{labels[status]}</span>;
}

