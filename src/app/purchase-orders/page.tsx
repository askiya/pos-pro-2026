"use client";
import { useState, useEffect } from "react";
import ResponsiveLayout from "@/components/layout/ResponsiveLayout";

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
  totalAmount: number;
  status: string;
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

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-yellow-50 text-yellow-700 border-yellow-200",
  SUBMITTED: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-[#e6f5f0] text-[#005236] border-[#4edea3]/30",
  CANCELLED: "bg-error-container/30 text-error border-error-container",
};

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // New PO form state
  const [supplier, setSupplier] = useState("");
  const [poItems, setPoItems] = useState<POItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchPOs = async () => {
    setLoading(true);
    const res = await fetch("/api/purchase-orders");
    if (res.ok) setPurchaseOrders(await res.json());
    setLoading(false);
  };

  const fetchProducts = async () => {
    const res = await fetch("/api/products");
    if (res.ok) {
      const data = await res.json();
      setProducts(data);
    }
  };

  useEffect(() => {
    fetchPOs();
    fetchProducts();
  }, []);

  const addPOItem = () => {
    setPoItems([...poItems, { productId: "", productName: "", sku: "", quantity: 1, unitCost: 0 }]);
  };

  const updatePOItem = (index: number, field: keyof POItem, value: string | number) => {
    const updated = [...poItems];
    if (field === "productId") {
      const product = products.find((p) => p.id === value);
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
    setPoItems(poItems.filter((_, i) => i !== index));
  };

  const totalAmount = poItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

  const handleSubmitPO = async () => {
    if (!supplier || poItems.length === 0) {
      alert("Supplier name and at least one item are required.");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/purchase-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        supplier,
        items: poItems.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitCost: i.unitCost,
        })),
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      setIsCreating(false);
      setSupplier("");
      setPoItems([]);
      fetchPOs();
    } else {
      const err = await res.json();
      alert(err.error);
    }
  };

  return (
    <ResponsiveLayout>
      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-0 relative w-full">
        <div className="p-4 md:p-8 flex-1 overflow-y-auto">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="font-headline font-bold text-3xl md:text-4xl text-on-surface tracking-tight">
                {isCreating ? "New Purchase Order" : "Purchase Orders"}
              </h1>
              <p className="font-body text-sm text-on-surface-variant mt-1">
                {isCreating ? "Create a new PO to restock inventory." : `${purchaseOrders.length} purchase orders total`}
              </p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              {isCreating ? (
                <>
                  <button
                    onClick={() => setIsCreating(false)}
                    className="flex-1 md:flex-none px-4 py-2 bg-surface-container-highest text-on-surface font-label font-medium rounded-lg hover:bg-surface-dim transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitPO}
                    disabled={submitting}
                    className="flex-1 md:flex-none px-6 py-2 bg-gradient-to-br from-secondary to-secondary-container text-white font-label font-medium rounded-lg shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    {submitting ? "Submitting..." : "Submit Order"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setIsCreating(true); setSelectedPO(null); }}
                  className="flex-1 md:flex-none px-6 py-2 bg-gradient-to-br from-secondary to-secondary-container text-white font-label font-medium rounded-lg shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  New PO
                </button>
              )}
            </div>
          </div>

          {isCreating ? (
            /* ── CREATE PO FORM ── */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 flex flex-col gap-6">
                {/* Supplier */}
                <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/15 p-6">
                  <h2 className="font-headline font-semibold text-xl text-on-surface mb-5">Supplier Details</h2>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="font-label text-xs text-on-surface-variant uppercase font-semibold block mb-1.5">Supplier Name *</label>
                      <input
                        type="text"
                        value={supplier}
                        onChange={(e) => setSupplier(e.target.value)}
                        placeholder="e.g. PT Distributor Nusantara"
                        className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 text-on-surface text-sm rounded-lg focus:ring-1 focus:ring-secondary outline-none"
                      />
                    </div>
                  </div>
                </section>

                {/* Order Items */}
                <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/15 overflow-hidden">
                  <div className="p-6 border-b border-surface-container-high flex justify-between items-center">
                    <h2 className="font-headline font-semibold text-xl text-on-surface">Order Items</h2>
                    <button
                      onClick={addPOItem}
                      className="text-secondary hover:bg-surface-container p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-label font-medium"
                    >
                      <span className="material-symbols-outlined text-[18px]">add_circle</span> Add Product
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-surface text-on-surface-variant font-label text-xs uppercase tracking-wider border-b border-surface-container-high">
                          <th className="px-6 py-4 font-medium">Product</th>
                          <th className="px-6 py-4 font-medium text-right w-24">Qty</th>
                          <th className="px-6 py-4 font-medium text-right w-36">Unit Cost (Rp)</th>
                          <th className="px-6 py-4 font-medium text-right w-36">Subtotal</th>
                          <th className="px-4 py-4 w-12"></th>
                        </tr>
                      </thead>
                      <tbody className="font-body text-sm divide-y divide-surface-container-low">
                        {poItems.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant text-sm">
                              Click &quot;Add Product&quot; to add items to this PO.
                            </td>
                          </tr>
                        ) : (
                          poItems.map((item, i) => (
                            <tr key={i} className="hover:bg-surface-container-highest transition-colors group">
                              <td className="px-6 py-4">
                                <select
                                  value={item.productId}
                                  onChange={(e) => updatePOItem(i, "productId", e.target.value)}
                                  className="w-full bg-surface-container-low border border-outline-variant/30 text-on-surface text-sm rounded-lg py-2 px-3 outline-none focus:ring-1 focus:ring-secondary"
                                >
                                  <option value="">— Select product —</option>
                                  {products.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}{p.sku ? ` (${p.sku})` : ""}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <input
                                  type="number"
                                  min={1}
                                  value={item.quantity}
                                  onChange={(e) => updatePOItem(i, "quantity", parseInt(e.target.value) || 1)}
                                  className="w-16 text-right bg-transparent border-b border-outline-variant/50 focus:border-secondary focus:ring-0 py-1 px-2 text-on-surface font-mono outline-none"
                                />
                              </td>
                              <td className="px-6 py-4 text-right">
                                <input
                                  type="number"
                                  min={0}
                                  value={item.unitCost}
                                  onChange={(e) => updatePOItem(i, "unitCost", parseFloat(e.target.value) || 0)}
                                  className="w-28 text-right bg-transparent border-b border-outline-variant/50 focus:border-secondary focus:ring-0 py-1 px-2 text-on-surface font-mono outline-none"
                                />
                              </td>
                              <td className="px-6 py-4 text-right font-medium text-on-surface font-mono">
                                Rp {(item.quantity * item.unitCost).toLocaleString("id-ID")}
                              </td>
                              <td className="px-4 py-4 text-right">
                                <button onClick={() => removePOItem(i)} className="text-on-surface-variant hover:text-error transition-colors opacity-0 group-hover:opacity-100">
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              {/* Summary Sidebar */}
              <div className="flex flex-col gap-6">
                <div className="bg-primary-container text-white rounded-xl p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-secondary opacity-20 blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
                  <h3 className="font-headline font-semibold text-lg mb-6 text-on-primary">Order Summary</h3>
                  <div className="space-y-4 font-body text-sm relative z-10">
                    <div className="flex justify-between text-on-primary-container">
                      <span>Items</span>
                      <span className="font-mono text-on-primary">{poItems.length}</span>
                    </div>
                    <div className="flex justify-between text-on-primary-container">
                      <span>Total Qty</span>
                      <span className="font-mono text-on-primary">{poItems.reduce((s, i) => s + i.quantity, 0)}</span>
                    </div>
                    <div className="pt-4 border-t border-on-primary-fixed-variant flex justify-between items-center mt-4">
                      <span className="font-headline font-bold text-base text-on-primary">Total</span>
                      <span className="font-headline font-bold text-2xl text-[#6ffbbe] font-mono">
                        Rp {totalAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ── PO LIST VIEW ── */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* PO List */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                {loading ? (
                  <div className="bg-surface-container-lowest p-8 rounded-xl text-center text-on-surface-variant">Loading purchase orders...</div>
                ) : purchaseOrders.length === 0 ? (
                  <div className="bg-surface-container-lowest p-8 rounded-xl text-center">
                    <span className="material-symbols-outlined text-5xl opacity-30 mb-3 block text-on-surface-variant">local_shipping</span>
                    <p className="font-body text-sm text-on-surface-variant">No purchase orders yet.</p>
                    <button
                      onClick={() => setIsCreating(true)}
                      className="mt-4 px-6 py-2.5 bg-secondary text-on-secondary rounded-lg text-sm font-medium hover:opacity-90 transition-all"
                    >
                      Create First PO
                    </button>
                  </div>
                ) : (
                  purchaseOrders.map((po) => (
                    <div
                      key={po.id}
                      onClick={() => setSelectedPO(po)}
                      className={`bg-surface-container-lowest rounded-xl p-5 border cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${selectedPO?.id === po.id ? "border-secondary/50 shadow-md" : "border-outline-variant/15"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-headline font-bold text-on-surface">{po.poNumber}</h3>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLES[po.status] ?? "bg-surface-container text-on-surface-variant border-outline-variant/20"}`}>
                              {po.status}
                            </span>
                          </div>
                          <p className="font-body text-sm text-on-surface-variant mt-1">{po.supplier}</p>
                          <p className="font-body text-xs text-on-surface-variant mt-0.5">
                            {new Date(po.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })} •{" "}
                            {po.items.length} item{po.items.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-headline font-bold text-on-surface text-lg font-mono">
                            Rp {Number(po.totalAmount).toLocaleString("id-ID")}
                          </p>
                          <span className="material-symbols-outlined text-on-surface-variant text-sm mt-1">chevron_right</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* PO Detail Panel */}
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 sticky top-6 self-start overflow-hidden">
                {selectedPO ? (
                  <>
                    <div className="p-5 border-b border-surface-container-high">
                      <div className="flex items-center justify-between">
                        <h3 className="font-headline font-bold text-on-surface">{selectedPO.poNumber}</h3>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLES[selectedPO.status] ?? "bg-surface-container text-on-surface-variant border-outline-variant/20"}`}>
                          {selectedPO.status}
                        </span>
                      </div>
                      <p className="font-body text-sm text-on-surface-variant mt-1">{selectedPO.supplier}</p>
                    </div>
                    <div className="p-5">
                      <table className="w-full text-sm font-body">
                        <thead>
                          <tr className="text-on-surface-variant text-xs uppercase tracking-wider">
                            <th className="text-left pb-3">Product</th>
                            <th className="text-right pb-3">Qty</th>
                            <th className="text-right pb-3">Cost</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container-low">
                          {selectedPO.items.map((item) => (
                            <tr key={item.id}>
                              <td className="py-2 text-on-surface font-medium">{item.product.name}</td>
                              <td className="py-2 text-right text-on-surface-variant">{item.quantity}</td>
                              <td className="py-2 text-right text-on-surface font-mono">Rp {Number(item.unitCost).toLocaleString("id-ID")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="mt-4 pt-4 border-t border-surface-container flex justify-between items-center">
                        <span className="font-headline font-bold text-on-surface">Total</span>
                        <span className="font-headline font-bold text-lg text-secondary font-mono">
                          Rp {Number(selectedPO.totalAmount).toLocaleString("id-ID")}
                        </span>
                      </div>

                    </div>
                  </>
                ) : (
                  <div className="p-8 flex flex-col items-center justify-center text-on-surface-variant gap-2">
                    <span className="material-symbols-outlined text-4xl opacity-30">receipt_long</span>
                    <p className="text-sm font-body text-center">Select a purchase order to view details</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ResponsiveLayout>
  );
}
