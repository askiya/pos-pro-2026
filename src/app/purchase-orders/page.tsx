"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";

import ResponsiveLayout from "@/components/layout/ResponsiveLayout";
import { useToast } from "@/components/ui/ToastProvider";
import { getApiErrorMessage, readApiPayload, toApiArray, toApiObject } from "@/lib/client-api";
import { formatCurrency } from "@/lib/format";

interface POItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  supplierId?: string;
  supplierModel?: Supplier | null;
  branch?: { name?: string } | null;
  totalAmount: number;
  status: string;
  notes?: string | null;
  receivedAt?: string | null;
  receiver?: { id: string; name: string } | null;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    unitCost: number;
    product: { name: string; sku?: string };
  }[];
}

interface Product {
  id: string;
  name: string;
  sku?: string;
}

interface Supplier {
  id: string;
  name: string;
  code?: string;
  phone?: string;
  email?: string;
}

type ProcurementTone = "indigo" | "emerald" | "amber" | "coral";

const procurementPalette = [
  { name: "Procurement Navy", value: "#271744", label: "Alur pembelian" },
  { name: "Electric Indigo", value: "#a277ff", label: "Aksi PO" },
  { name: "Amber Supply", value: "#f59e0b", label: "Follow-up" },
];

const STATUS_CONFIG: Record<string, { label: string; badge: string; icon: string; tone: ProcurementTone }> = {
  DRAFT: {
    label: "Draft",
    badge: "bg-[#fff7df] text-[#b45309] border-[#fde68a]",
    icon: "edit_note",
    tone: "amber",
  },
  SUBMITTED: {
    label: "Submitted",
    badge: "bg-[#f5edff] text-[#8657ea] border-[#c9cff8]",
    icon: "outgoing_mail",
    tone: "indigo",
  },
  COMPLETED: {
    label: "Completed",
    badge: "bg-[#e6f7ef] text-[#047857] border-[#bbf7d0]",
    icon: "verified",
    tone: "emerald",
  },
  CANCELLED: {
    label: "Cancelled",
    badge: "bg-[#fff1f2] text-[#be123c] border-[#fecdd3]",
    icon: "cancel",
    tone: "coral",
  },
};

const toneClass: Record<ProcurementTone, { icon: string; chip: string; line: string; glow: string }> = {
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

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [supplier, setSupplier] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [poNotes, setPoNotes] = useState("");
  const [poItems, setPoItems] = useState<POItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [receiving, setReceiving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const router = useRouter();
  const { showToast } = useToast();

  const fetchPOs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/purchase-orders");
      const payload = await readApiPayload(res);
      if (res.ok) {
        const data = toApiArray<PurchaseOrder>(payload);
        setPurchaseOrders(data);
        setSelectedPO((current) => data.find((po) => po.id === current?.id) ?? data[0] ?? null);
        setLoadError(null);
      } else {
        setPurchaseOrders([]);
        setSelectedPO(null);
        setLoadError(getApiErrorMessage(payload, "Purchase order belum bisa dimuat."));
      }
    } catch (error) {
      console.error("Failed to fetch purchase orders:", error);
      setPurchaseOrders([]);
      setSelectedPO(null);
      setLoadError("Purchase order belum bisa dimuat. Coba refresh halaman.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products");
      const payload = await readApiPayload(res);
      if (res.ok) {
        setProducts(toApiArray<Product>(payload));
      } else {
        setProducts([]);
        setLoadError((current) => current ?? getApiErrorMessage(payload, "Daftar produk belum bisa dimuat."));
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
      setLoadError((current) => current ?? "Daftar produk belum bisa dimuat. Coba refresh halaman.");
    }
  }, []);

  const fetchSuppliers = useCallback(async () => {
    try {
      const res = await fetch("/api/suppliers");
      const payload = await readApiPayload(res);
      if (res.ok) {
        setSuppliers(toApiArray<Supplier>(payload));
      } else {
        setSuppliers([]);
        showToast({
          title: "Supplier belum termuat",
          description: getApiErrorMessage(payload, "Data supplier belum bisa dimuat."),
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
      setSuppliers([]);
    }
  }, [showToast]);

  useEffect(() => {
    void fetchPOs();
    void fetchProducts();
    void fetchSuppliers();
  }, [fetchPOs, fetchProducts, fetchSuppliers]);

  const stats = useMemo(() => {
    const needsFollowUp = purchaseOrders.filter((po) => po.status === "SUBMITTED" || po.status === "DRAFT").length;
    const totalValue = purchaseOrders.reduce((sum, po) => sum + Number(po.totalAmount), 0);
    const completed = purchaseOrders.filter((po) => po.status === "COMPLETED").length;
    const completionRate = purchaseOrders.length > 0 ? Math.round((completed / purchaseOrders.length) * 100) : 100;

    return {
      needsFollowUp,
      totalValue,
      completed,
      completionRate,
    };
  }, [purchaseOrders]);

  const addPOItem = () => {
    setPoItems((current) => [...current, { productId: "", productName: "", sku: "", quantity: 1, unitCost: 0 }]);
  };

  const updatePOItem = (index: number, field: keyof POItem, value: string | number) => {
    const updated = [...poItems];
    if (field === "productId") {
      const product = products.find((entry) => entry.id === value);
      updated[index] = {
        ...updated[index],
        productId: value as string,
        productName: product?.name ?? "",
        sku: product?.sku ?? "",
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setPoItems(updated);
  };

  const removePOItem = (index: number) => {
    setPoItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const resetCreateForm = () => {
    setIsCreating(false);
    setSupplier("");
    setSupplierId("");
    setPoNotes("");
    setPoItems([]);
    setSelectedPO(purchaseOrders[0] ?? null);
  };

  const setSupplierSelection = (value: string) => {
    setSupplier(value);
    const normalized = value.trim().toLowerCase();
    const matchedSupplier = suppliers.find((entry) => entry.name.trim().toLowerCase() === normalized);
    setSupplierId(matchedSupplier?.id ?? "");
  };

  const totalAmount = poItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  const totalQuantity = poItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmitPO = async () => {
    const hasInvalidItem = poItems.some((item) => !item.productId || item.quantity < 1 || item.unitCost < 0);

    if (!supplier.trim() || poItems.length === 0 || hasInvalidItem) {
      showToast({
        title: "PO belum lengkap",
        description: "Isi supplier, produk, qty, dan unit cost sebelum submit.",
        variant: "error",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplier: supplier.trim(),
          supplierId: supplierId || undefined,
          notes: poNotes.trim() || undefined,
          items: poItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitCost: item.unitCost,
          })),
        }),
      });
      const payload = await readApiPayload(res);

      if (res.ok) {
        const savedPO = toApiObject<PurchaseOrder>(payload);
        if (!savedPO?.id || !savedPO.poNumber) {
          showToast({
            title: "Purchase order gagal dibuat",
            description: "Format respons purchase order tidak valid.",
            variant: "error",
          });
          return;
        }

        setIsCreating(false);
        setSupplier("");
        setSupplierId("");
        setPoNotes("");
        setPoItems([]);
        await fetchPOs();
        setSelectedPO(savedPO);
        showToast({
          title: "Purchase order berhasil dibuat",
          description: `${savedPO.poNumber} siap diproses supplier.`,
          variant: "success",
        });
      } else {
        showToast({
          title: "Purchase order gagal dibuat",
          description: getApiErrorMessage(payload, "Purchase order belum berhasil dibuat."),
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Failed to create purchase order:", error);
      showToast({
        title: "Purchase order gagal dibuat",
        description: "Cek koneksi backend atau coba ulang beberapa saat lagi.",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReceivePO = async () => {
    if (!selectedPO) {
      return;
    }

    setReceiving(true);
    try {
      const res = await fetch(`/api/purchase-orders/${selectedPO.id}/receive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note: selectedPO.notes || `Penerimaan ${selectedPO.poNumber}`,
        }),
      });
      const payload = await readApiPayload(res);

      if (!res.ok) {
        showToast({
          title: "Receive PO gagal",
          description: getApiErrorMessage(payload, "Purchase order belum berhasil diterima."),
          variant: "error",
        });
        return;
      }

      const receivedPO = toApiObject<PurchaseOrder>(payload);
      await fetchPOs();
      if (receivedPO?.id) {
        setSelectedPO(receivedPO);
      }
      showToast({
        title: "Purchase order diterima",
        description: `${selectedPO.poNumber} sudah masuk ke stok cabang aktif.`,
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to receive purchase order:", error);
      showToast({
        title: "Receive PO gagal",
        description: "Cek koneksi backend atau coba ulang beberapa saat lagi.",
        variant: "error",
      });
    } finally {
      setReceiving(false);
    }
  };

  return (
    <ResponsiveLayout>
      <div className="h-full overflow-y-auto px-4 py-5 pb-28 md:px-6 md:pb-8">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-6">
          <section className="po-entrance po-sheen relative overflow-hidden rounded-[36px] border border-white/70 bg-[linear-gradient(135deg,#271744_0%,#25245f_48%,#a277ff_100%)] p-5 text-white shadow-[0_28px_90px_-58px_rgba(17,24,39,0.82)] sm:p-7">
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#f59e0b]/22" />
            <div className="pointer-events-none absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-[#12b981]/14" />

            <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(420px,0.8fr)] xl:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-white/75">
                  <span className="h-2 w-2 rounded-full bg-[#f59e0b] po-live-dot" />
                  Procurement Command Center
                </div>
                <h1 className="mt-5 max-w-3xl font-headline text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl xl:text-6xl">
                  Purchase order lebih rapi, cepat dibuat, dan mudah dipantau.
                </h1>
                <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-white/72 sm:text-base">
                  Kelola order supplier, follow-up status, dan detail item restock dari satu layar procurement yang lebih premium.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {procurementPalette.map((color) => (
                    <div key={color.name} className="flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-3 py-2 text-xs font-bold text-white/82">
                      <span className="h-3 w-3 rounded-full" style={{ background: color.value }} />
                      <span>{color.name}</span>
                      <span className="hidden text-white/45 sm:inline">/ {color.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <HeroMiniStat label="Total PO" value={String(purchaseOrders.length)} icon="receipt_long" />
                <HeroMiniStat label="Follow Up" value={String(stats.needsFollowUp)} icon="priority_high" />
                <HeroMiniStat label="PO Value" value={formatCurrency(stats.totalValue)} icon="payments" />
              </div>
            </div>
          </section>

          {!isCreating ? (
            <>
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <ProcurementKpi
                  label="Total PO"
                  value={String(purchaseOrders.length)}
                  icon="receipt_long"
                  tone="indigo"
                  meta={`${stats.completed} completed`}
                  delay={40}
                />
                <ProcurementKpi
                  label="Perlu Follow-up"
                  value={String(stats.needsFollowUp)}
                  icon="notification_important"
                  tone={stats.needsFollowUp > 0 ? "amber" : "emerald"}
                  meta="Draft + submitted"
                  delay={90}
                />
                <ProcurementKpi
                  label="Total Nilai"
                  value={formatCurrency(stats.totalValue)}
                  icon="payments"
                  tone="emerald"
                  meta={`${stats.completionRate}% completion`}
                  delay={140}
                />
                <button
                  onClick={() => {
                    setIsCreating(true);
                    setSelectedPO(null);
                    if (poItems.length === 0) addPOItem();
                  }}
                  className="po-entrance group overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#271744_0%,#a277ff_100%)] p-5 text-left text-white shadow-[0_24px_64px_-44px_rgba(162, 119, 255,0.92)] hover:-translate-y-1"
                  style={{ "--delay": "190ms" } as CSSProperties}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-white/55">Quick Action</p>
                      <p className="mt-4 font-headline text-3xl font-black tracking-[-0.05em]">New PO</p>
                      <p className="mt-2 text-sm font-medium text-white/68">Buat restock order</p>
                    </div>
                    <span className="material-symbols-outlined rounded-2xl bg-white/12 p-3 text-[24px] transition group-hover:rotate-90">add</span>
                  </div>
                </button>
              </section>

              <section className="po-entrance grid gap-3 lg:grid-cols-3" style={{ "--delay": "240ms" } as CSSProperties}>
                <ActionButton
                  icon="inventory_2"
                  label="Cek Inventory"
                  description="Pastikan SKU sebelum order"
                  tone="indigo"
                  onClick={() => router.push("/inventory")}
                />
                <ActionButton
                  icon="swap_horiz"
                  label="Transfer Stock"
                  description="Pindah antar cabang"
                  tone="emerald"
                  onClick={() => router.push("/transfers")}
                />
                <ActionButton
                  icon="refresh"
                  label="Refresh PO"
                  description="Sinkron ulang data"
                  tone="amber"
                  onClick={() => {
                    void fetchPOs();
                    void fetchProducts();
                  }}
                />
              </section>

              <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.8fr)]">
                <div className="po-entrance overflow-hidden rounded-[34px] border border-white/70 bg-white/76 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)]" style={{ "--delay": "290ms" } as CSSProperties}>
                  <div className="border-b border-[#ecdfff] px-5 py-4">
                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#a277ff]/75">PO Ledger</p>
                        <h2 className="mt-2 font-headline text-2xl font-black tracking-[-0.05em] text-on-surface">Daftar Purchase Order</h2>
                      </div>
                      <div className="rounded-full bg-[#f5edff] px-4 py-2 text-sm font-black text-[#8657ea]">
                        {purchaseOrders.length} order total
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 p-4">
                    {loading ? (
                      Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="h-28 animate-pulse rounded-[28px] bg-white/80" />
                      ))
                    ) : loadError ? (
                      <ErrorState
                        message={loadError}
                        onRetry={() => {
                          void fetchPOs();
                          void fetchProducts();
                          void fetchSuppliers();
                        }}
                      />
                    ) : purchaseOrders.length === 0 ? (
                      <EmptyPOState onCreate={() => setIsCreating(true)} />
                    ) : (
                      purchaseOrders.map((purchaseOrder, index) => (
                        <PurchaseOrderCard
                          key={purchaseOrder.id}
                          purchaseOrder={purchaseOrder}
                          selected={selectedPO?.id === purchaseOrder.id}
                          delay={index * 32}
                          onSelect={() => setSelectedPO(purchaseOrder)}
                        />
                      ))
                    )}
                  </div>
                </div>

                <PurchaseOrderDetail selectedPO={selectedPO} receiving={receiving} onReceive={handleReceivePO} />
              </section>
            </>
          ) : (
            <CreatePurchaseOrderView
              supplier={supplier}
              supplierId={supplierId}
              setSupplier={setSupplierSelection}
              suppliers={suppliers}
              poNotes={poNotes}
              setPoNotes={setPoNotes}
              products={products}
              poItems={poItems}
              totalAmount={totalAmount}
              totalQuantity={totalQuantity}
              submitting={submitting}
              onCancel={resetCreateForm}
              onAddItem={addPOItem}
              onRemoveItem={removePOItem}
              onUpdateItem={updatePOItem}
              onSubmit={handleSubmitPO}
            />
          )}
        </div>
      </div>
    </ResponsiveLayout>
  );
}

function CreatePurchaseOrderView({
  supplier,
  supplierId,
  setSupplier,
  suppliers,
  poNotes,
  setPoNotes,
  products,
  poItems,
  totalAmount,
  totalQuantity,
  submitting,
  onCancel,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  onSubmit,
}: {
  supplier: string;
  supplierId: string;
  setSupplier: (value: string) => void;
  suppliers: Supplier[];
  poNotes: string;
  setPoNotes: (value: string) => void;
  products: Product[];
  poItems: POItem[];
  totalAmount: number;
  totalQuantity: number;
  submitting: boolean;
  onCancel: () => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onUpdateItem: (index: number, field: keyof POItem, value: string | number) => void;
  onSubmit: () => void;
}) {
  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.75fr)]">
      <div className="flex flex-col gap-6">
        <section className="po-entrance rounded-[34px] border border-white/70 bg-white/76 p-5 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)]">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#a277ff]/75">Create Purchase Order</p>
              <h2 className="mt-2 font-headline text-3xl font-black tracking-[-0.05em] text-on-surface">Supplier & PO details</h2>
              <p className="mt-2 text-sm font-medium text-on-surface-variant">Isi supplier lalu masukkan item yang ingin direstock.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={onCancel} className="app-secondary-btn rounded-2xl px-5 py-3 text-sm font-black" type="button">
                Cancel
              </button>
              <button
                onClick={onSubmit}
                disabled={submitting}
                className="app-primary-btn inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-black disabled:opacity-60"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                {submitting ? "Submitting..." : "Submit PO"}
              </button>
            </div>
          </div>

          <div className="mt-5">
            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant">
                Supplier Name *
              </span>
              <input
                type="text"
                value={supplier}
                onChange={(event) => setSupplier(event.target.value)}
                placeholder="e.g. PT Distributor Nusantara"
                className="app-field px-4 py-4 text-sm font-semibold"
                list="supplier-reference-list"
              />
            </label>

            <datalist id="supplier-reference-list">
              {suppliers.map((entry) => (
                <option key={entry.id} value={entry.name}>
                  {entry.code ? `${entry.code} - ${entry.name}` : entry.name}
                </option>
              ))}
            </datalist>

            {suppliers.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {suppliers.slice(0, 6).map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => setSupplier(entry.name)}
                    className={`rounded-full px-3 py-1.5 text-xs font-black ${
                      supplierId === entry.id ? "bg-[#f5edff] text-[#8657ea]" : "bg-[#f8f9ff] text-on-surface-variant"
                    }`}
                    type="button"
                  >
                    {entry.name}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="mt-5">
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant">
                  Notes
                </span>
                <textarea
                  value={poNotes}
                  onChange={(event) => setPoNotes(event.target.value)}
                  placeholder="Opsional: catatan pengiriman, termin pembayaran, atau detail follow-up supplier"
                  className="app-field min-h-[120px] px-4 py-3.5 text-sm font-medium"
                />
              </label>
            </div>
          </div>
        </section>

        <section className="po-entrance overflow-hidden rounded-[34px] border border-white/70 bg-white/76 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)]" style={{ "--delay": "80ms" } as CSSProperties}>
          <div className="flex flex-col justify-between gap-3 border-b border-[#ecdfff] px-5 py-4 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#f59e0b]/80">Order Items</p>
              <h2 className="mt-2 font-headline text-2xl font-black tracking-[-0.05em] text-on-surface">Produk Restock</h2>
            </div>
            <button
              onClick={onAddItem}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f5edff] px-4 py-2 text-sm font-black text-[#8657ea] hover:bg-[#e6d9ff]"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              Add Product
            </button>
          </div>

          <div className="grid gap-3 p-4">
            {poItems.length === 0 ? (
              <div className="rounded-[30px] border border-dashed border-[#d4c8e3] bg-white/70 p-8 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[30px] bg-[#fff7df] text-[#b45309]">
                  <span className="material-symbols-outlined icon-fill text-4xl">add_shopping_cart</span>
                </div>
                <p className="mt-5 font-headline text-2xl font-black text-on-surface">Belum ada item PO</p>
                <p className="mt-2 text-sm text-on-surface-variant">Klik Add Product untuk mulai menyusun order supplier.</p>
                <button onClick={onAddItem} className="app-primary-btn mt-5 rounded-2xl px-5 py-3 text-sm font-black" type="button">
                  Tambah Item
                </button>
              </div>
            ) : (
              poItems.map((item, index) => (
                <POItemCard
                  key={index}
                  item={item}
                  index={index}
                  products={products}
                  onUpdate={onUpdateItem}
                  onRemove={onRemoveItem}
                />
              ))
            )}
          </div>
        </section>
      </div>

      <aside className="po-entrance rounded-[34px] border border-white/70 bg-white/76 p-4 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)] xl:sticky xl:top-4" style={{ "--delay": "120ms" } as CSSProperties}>
        <div className="overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#271744_0%,#a277ff_100%)] p-5 text-white shadow-[0_28px_70px_-44px_rgba(162, 119, 255,0.92)]">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-white/55">Order Summary</p>
          <h3 className="mt-3 font-headline text-3xl font-black tracking-[-0.05em]">PO Preview</h3>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <SummaryBox label="Items" value={String(poItems.length)} />
            <SummaryBox label="Total Qty" value={String(totalQuantity)} />
          </div>

          <div className="mt-5 rounded-[26px] border border-white/14 bg-white/10 p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/52">Supplier</p>
            <p className="mt-2 truncate font-headline text-xl font-black">{supplier || "Belum diisi"}</p>
            <p className="mt-2 text-xs font-semibold text-white/65">
              {supplierId ? "Supplier existing terdeteksi" : "Supplier baru akan dibuat otomatis jika belum ada"}
            </p>
          </div>

          <div className="mt-4 rounded-[26px] border border-white/14 bg-white/10 p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/52">Notes</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-white/78">{poNotes || "Belum ada catatan PO"}</p>
          </div>

          <div className="mt-5 border-t border-white/12 pt-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/52">Total Purchase</p>
            <p className="mt-2 font-headline text-4xl font-black tracking-[-0.06em] text-[#a7f3d0]">{formatCurrency(totalAmount)}</p>
          </div>

          <button
            onClick={onSubmit}
            disabled={submitting}
            className="mt-6 flex w-full items-center justify-between rounded-[26px] bg-white px-5 py-4 text-left text-[#a277ff] shadow-[0_24px_52px_-32px_rgba(255,255,255,0.78)] hover:-translate-y-0.5 disabled:opacity-55"
            type="button"
          >
            <span className="font-headline text-xl font-black">{submitting ? "Submitting..." : "Submit Order"}</span>
            <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
          </button>
        </div>
      </aside>
    </section>
  );
}

function POItemCard({
  item,
  index,
  products,
  onUpdate,
  onRemove,
}: {
  item: POItem;
  index: number;
  products: Product[];
  onUpdate: (index: number, field: keyof POItem, value: string | number) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="po-row rounded-[28px] border border-white/70 bg-white/78 p-4 shadow-[0_20px_54px_-42px_rgba(39, 23, 68,0.38)]" style={{ "--delay": `${index * 30}ms` } as CSSProperties}>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_120px_160px_160px_48px] xl:items-end">
        <label className="block">
          <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-on-surface-variant">Product</span>
          <select
            value={item.productId}
            onChange={(event) => onUpdate(index, "productId", event.target.value)}
            className="app-field px-4 py-3 text-sm font-semibold"
          >
            <option value="">-- Select product --</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
                {product.sku ? ` (${product.sku})` : ""}
              </option>
            ))}
          </select>
        </label>

        <NumberField
          label="Qty"
          value={item.quantity}
          min={1}
          onChange={(value) => onUpdate(index, "quantity", parseInt(value, 10) || 1)}
        />
        <NumberField
          label="Unit Cost"
          value={item.unitCost}
          min={0}
          onChange={(value) => onUpdate(index, "unitCost", parseFloat(value) || 0)}
        />

        <div>
          <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-on-surface-variant">Subtotal</span>
          <div className="rounded-[22px] bg-[#f5edff] px-4 py-3 text-right font-headline text-lg font-black text-[#8657ea]">
            {formatCurrency(item.quantity * item.unitCost)}
          </div>
        </div>

        <button
          onClick={() => onRemove(index)}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff1f2] text-[#be123c] hover:bg-[#ffe4e6]"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">delete</span>
        </button>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-on-surface-variant">{label}</span>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="app-field px-4 py-3 text-right text-sm font-black"
      />
    </label>
  );
}

function PurchaseOrderCard({
  purchaseOrder,
  selected,
  delay,
  onSelect,
}: {
  purchaseOrder: PurchaseOrder;
  selected: boolean;
  delay: number;
  onSelect: () => void;
}) {
  const status = STATUS_CONFIG[purchaseOrder.status] ?? STATUS_CONFIG.DRAFT;

  return (
    <button
      onClick={onSelect}
      className={`po-row w-full rounded-[28px] border p-4 text-left shadow-[0_20px_54px_-42px_rgba(39, 23, 68,0.38)] ${
        selected ? "border-[#a277ff]/45 bg-[#f6f7ff]" : "border-white/70 bg-white/78 hover:bg-white"
      }`}
      style={{ "--delay": `${delay}ms` } as CSSProperties}
      type="button"
    >
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex min-w-0 gap-4">
          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] ${toneClass[status.tone].icon}`}>
            <span className="material-symbols-outlined icon-fill text-[24px]">{status.icon}</span>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-headline text-xl font-black tracking-[-0.04em] text-on-surface">{purchaseOrder.poNumber}</h3>
              <StatusBadge status={purchaseOrder.status} />
            </div>
            <p className="mt-1 truncate text-sm font-semibold text-on-surface-variant">{purchaseOrder.supplier}</p>
            <p className="mt-1 text-xs font-semibold text-on-surface-variant">
              {formatDate(purchaseOrder.createdAt)} - {purchaseOrder.items.length} item
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 md:block md:text-right">
          <p className="font-headline text-2xl font-black tracking-[-0.05em] text-on-surface">
            {formatCurrency(Number(purchaseOrder.totalAmount))}
          </p>
          <span className="material-symbols-outlined mt-1 text-[#a277ff]">chevron_right</span>
        </div>
      </div>
    </button>
  );
}

function PurchaseOrderDetail({
  selectedPO,
  receiving,
  onReceive,
}: {
  selectedPO: PurchaseOrder | null;
  receiving: boolean;
  onReceive: () => void;
}) {
  if (!selectedPO) {
    return (
      <aside className="po-entrance rounded-[34px] border border-white/70 bg-white/76 p-5 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)] xl:sticky xl:top-4" style={{ "--delay": "340ms" } as CSSProperties}>
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[30px] border border-dashed border-[#d4c8e3] bg-white/60 p-8 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-[30px] bg-[#f5edff] text-[#a277ff]">
            <span className="material-symbols-outlined icon-fill text-4xl">receipt_long</span>
          </div>
          <p className="mt-5 font-headline text-2xl font-black text-on-surface">Pilih purchase order</p>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">Detail supplier dan item restock akan tampil di panel ini.</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="po-entrance rounded-[34px] border border-white/70 bg-white/76 p-4 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)] xl:sticky xl:top-4" style={{ "--delay": "340ms" } as CSSProperties}>
      <div className="overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#271744_0%,#a277ff_100%)] p-5 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-white/55">PO Detail</p>
            <h3 className="mt-3 font-headline text-3xl font-black tracking-[-0.05em]">{selectedPO.poNumber}</h3>
            <p className="mt-2 text-sm font-medium text-white/68">{selectedPO.supplier}</p>
          </div>
          <StatusBadge status={selectedPO.status} inverted />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <SummaryBox label="Items" value={String(selectedPO.items.length)} />
          <SummaryBox label="Created" value={formatDate(selectedPO.createdAt)} />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <DetailBox label="Cabang" value={selectedPO.branch?.name || "Cabang aktif"} />
        <DetailBox label="Received" value={selectedPO.receivedAt ? formatDate(selectedPO.receivedAt) : "Belum diterima"} />
      </div>

      {selectedPO.status !== "COMPLETED" ? (
        <button
          onClick={onReceive}
          disabled={receiving}
          className="mt-4 flex w-full items-center justify-between rounded-[26px] bg-[#047857] px-5 py-4 text-left text-white shadow-[0_22px_52px_-32px_rgba(4,120,87,0.62)] disabled:opacity-60"
          type="button"
        >
          <span>
            <span className="block text-xs font-black uppercase tracking-[0.18em] text-white/60">Receiving</span>
            <span className="mt-1 block font-headline text-xl font-black">
              {receiving ? "Memproses penerimaan..." : "Receive PO ke Inventory"}
            </span>
          </span>
          <span className="material-symbols-outlined text-[24px]">inventory_2</span>
        </button>
      ) : (
        <div className="mt-4 rounded-[26px] border border-[#bbf7d0] bg-[#e6f7ef] px-4 py-3 text-sm font-semibold text-[#047857]">
          {selectedPO.receiver?.name
            ? `PO ini sudah diterima oleh ${selectedPO.receiver.name}.`
            : "PO ini sudah diterima dan masuk ke stok cabang."}
        </div>
      )}

      {selectedPO.notes ? (
        <div className="mt-4 rounded-[30px] border border-[#ecdfff] bg-white/70 p-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant/70">Catatan PO</p>
          <p className="mt-3 text-sm font-medium leading-6 text-on-surface">{selectedPO.notes}</p>
        </div>
      ) : null}

      <div className="mt-4 rounded-[30px] border border-[#ecdfff] bg-white/70 p-4">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant/70">Item Breakdown</p>
        <div className="mt-4 space-y-3">
          {selectedPO.items.map((item) => (
            <div key={item.id} className="rounded-[24px] bg-white/84 p-4 shadow-[0_18px_42px_-34px_rgba(39, 23, 68,0.32)]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-headline text-base font-black text-on-surface">{item.product.name}</p>
                  <p className="mt-1 text-xs font-semibold text-on-surface-variant">{item.product.sku || "No SKU"}</p>
                </div>
                <span className="rounded-full bg-[#f5edff] px-3 py-1 text-xs font-black text-[#8657ea]">x{item.quantity}</span>
              </div>
              <div className="mt-3 flex justify-between text-sm font-semibold text-on-surface-variant">
                <span>Unit cost</span>
                <span className="text-on-surface">{formatCurrency(Number(item.unitCost))}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-[#ecdfff] pt-5">
          <span className="font-headline text-lg font-black text-on-surface">Total</span>
          <span className="font-headline text-2xl font-black tracking-[-0.05em] text-[#a277ff]">
            {formatCurrency(Number(selectedPO.totalAmount))}
          </span>
        </div>
      </div>
    </aside>
  );
}

function ProcurementKpi({
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
  tone: ProcurementTone;
  meta: string;
  delay: number;
}) {
  const style = toneClass[tone];

  return (
    <div
      className="po-entrance group relative overflow-hidden rounded-[30px] border border-white/70 bg-white/78 p-5 shadow-[0_24px_70px_-48px_rgba(39, 23, 68,0.38)] hover:-translate-y-1 hover:bg-white"
      style={{ "--delay": `${delay}ms` } as CSSProperties}
    >
      <div className={`pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-gradient-to-br ${style.glow}`} />
      <div className={`absolute inset-x-5 bottom-0 h-1 rounded-full bg-gradient-to-r ${style.line}`} />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant/70">{label}</p>
          <p className="mt-4 font-headline text-3xl font-black tracking-[-0.05em] text-on-surface sm:text-4xl">{value}</p>
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
  tone: ProcurementTone;
  onClick: () => void;
}) {
  const style = toneClass[tone];

  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-[28px] border border-white/70 bg-white/76 p-5 text-left shadow-[0_20px_54px_-42px_rgba(39, 23, 68,0.38)] hover:-translate-y-1 hover:bg-white"
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
    <div className="rounded-[24px] border border-white/16 bg-white/10 p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/55">{label}</span>
        <span className="material-symbols-outlined text-[18px] text-[#fde68a]">{icon}</span>
      </div>
      <div className="mt-3 truncate font-headline text-xl font-black tracking-[-0.04em]">{value}</div>
    </div>
  );
}

function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/14 bg-white/10 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/52">{label}</p>
      <p className="mt-2 truncate font-headline text-xl font-black tracking-[-0.04em] text-white">{value}</p>
    </div>
  );
}

function DetailBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-[#ecdfff] bg-white/70 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant/60">{label}</p>
      <p className="mt-2 font-headline text-lg font-black text-on-surface">{value}</p>
    </div>
  );
}

function StatusBadge({ status, inverted = false }: { status: string; inverted?: boolean }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT;

  if (inverted) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-white/16 bg-white/12 px-3 py-1.5 text-xs font-black text-white">
        <span className="material-symbols-outlined text-[14px]">{config.icon}</span>
        {config.label}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-black ${config.badge}`}>
      <span className="material-symbols-outlined text-[14px]">{config.icon}</span>
      {config.label}
    </span>
  );
}

function EmptyPOState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-[30px] border border-dashed border-[#d4c8e3] bg-white/70 p-8 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[30px] bg-[#f5edff] text-[#a277ff]">
        <span className="material-symbols-outlined icon-fill text-4xl">local_shipping</span>
      </div>
      <p className="mt-5 font-headline text-3xl font-black tracking-[-0.05em] text-on-surface">Belum ada purchase order</p>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-on-surface-variant">
        Buat PO pertama untuk memulai alur restock supplier.
      </p>
      <button onClick={onCreate} className="app-primary-btn mt-6 rounded-2xl px-5 py-3 text-sm font-black" type="button">
        Create First PO
      </button>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-[30px] border border-dashed border-[#fecdd3] bg-[#fff7f7] p-8 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[30px] bg-[#fff1f2] text-[#be123c]">
        <span className="material-symbols-outlined icon-fill text-4xl">cloud_off</span>
      </div>
      <p className="mt-5 font-headline text-2xl font-black text-on-surface">Data PO belum termuat</p>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-on-surface-variant">{message}</p>
      <button onClick={onRetry} className="mt-6 rounded-2xl bg-[#be123c] px-5 py-3 text-sm font-black text-white" type="button">
        Muat Ulang
      </button>
    </div>
  );
}
