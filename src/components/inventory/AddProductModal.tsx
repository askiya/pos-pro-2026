import React, { useEffect, useState } from "react";

import { AppModal } from "@/components/ui/AppModal";
import { useToast } from "@/components/ui/ToastProvider";
import { getApiErrorMessage, readApiPayload, toApiArray, toApiObject } from "@/lib/client-api";

interface Category {
  id: string;
  name: string;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddProductModal({ isOpen, onClose, onSuccess }: AddProductModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCategoryCreator, setShowCategoryCreator] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    barcode: "",
    price: "",
    stock: "",
    categoryId: "",
  });
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      void fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const payload = await readApiPayload(res);

      if (res.ok) {
        setCategories(toApiArray<Category>(payload));
      } else {
        setCategories([]);
        console.error("Failed to fetch categories:", getApiErrorMessage(payload, "Kategori belum bisa dimuat."));
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", sku: "", barcode: "", price: "", stock: "", categoryId: "" });
    setShowCategoryCreator(false);
    setNewCategoryName("");
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock || "0", 10),
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
        resetForm();
        showToast({
          title: "Produk berhasil ditambahkan",
          description: `${formData.name} sudah masuk ke inventory.`,
        variant: "success",
      });
    } else {
      const payload = await readApiPayload(res);
      showToast({
        title: "Produk belum tersimpan",
        description: getApiErrorMessage(payload, "Failed to add product"),
        variant: "error",
      });
    }
    } catch (error) {
      console.error(error);
      showToast({
        title: "Produk belum tersimpan",
        description: "Terjadi kendala saat mengirim data produk.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      showToast({
        title: "Nama kategori masih kosong",
        description: "Isi nama kategori sebelum menyimpan.",
        variant: "error",
      });
      return;
    }

    setCreatingCategory(true);
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategoryName.trim() }),
    });
    setCreatingCategory(false);
    const payload = await readApiPayload(response);

    if (response.ok) {
      const category = toApiObject<Category>(payload);
      if (!category?.id || !category.name) {
        showToast({
          title: "Kategori gagal dibuat",
          description: "Format respons kategori tidak valid.",
          variant: "error",
        });
        return;
      }

      setCategories((current) => [...current, category]);
      setFormData((current) => ({ ...current, categoryId: category.id }));
      setNewCategoryName("");
      setShowCategoryCreator(false);
      showToast({
        title: "Kategori berhasil dibuat",
        description: `${category.name} siap dipakai untuk produk baru.`,
        variant: "success",
      });
    } else {
      showToast({
        title: "Kategori gagal dibuat",
        description: getApiErrorMessage(payload, "Kategori belum berhasil dibuat."),
        variant: "error",
      });
    }
  };

  return (
    <AppModal
      open={isOpen}
      onClose={() => {
        onClose();
        resetForm();
      }}
      title="Tambah Produk Baru"
      description="Isi detail SKU, harga jual, stok awal, dan kategori supaya inventory langsung siap dipakai."
      icon="inventory_2"
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-4 lg:grid-cols-[1.35fr_0.95fr]">
          <div className="space-y-4">
            <div className="rounded-xl border border-outline-variant/15 bg-white/72 p-4 shadow-[0_16px_40px_-34px_rgba(39, 23, 68,0.34)]">
              <div className="mb-4">
                <h3 className="font-headline text-lg font-bold text-on-surface">Informasi Produk</h3>
                <p className="mt-1 text-sm text-on-surface-variant">Pastikan nama produk jelas dan mudah ditemukan saat kasir mencari.</p>
              </div>
              <div className="space-y-4">
                <Field label="Product Name *">
                  <input
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="app-field px-4 py-3.5 text-sm"
                    placeholder="e.g. Artisan Coffee Beans"
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="SKU">
                    <input
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      className="app-field px-4 py-2.5 text-sm uppercase"
                      placeholder="SKU-123"
                    />
                  </Field>
                  <Field label="Barcode">
                    <input
                      name="barcode"
                      value={formData.barcode}
                      onChange={handleChange}
                      className="app-field px-4 py-2.5 text-sm"
                      placeholder="899..."
                    />
                  </Field>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-outline-variant/15 bg-white/72 p-4 shadow-[0_16px_40px_-34px_rgba(39, 23, 68,0.34)]">
              <div className="mb-4">
                <h3 className="font-headline text-lg font-bold text-on-surface">Harga & Stok</h3>
                <p className="mt-1 text-sm text-on-surface-variant">Atur harga jual dan stok pembuka supaya produk langsung siap dijual.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Price *">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">Rp</span>
                    <input
                      required
                      type="number"
                      step="1"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="app-field pl-10 pr-4 py-2.5 text-sm"
                      placeholder="0"
                    />
                  </div>
                </Field>
                <Field label="Initial Stock">
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    className="app-field px-4 py-2.5 text-sm"
                    placeholder="0"
                  />
                </Field>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-outline-variant/15 bg-gradient-to-br from-primary-container to-secondary p-4 text-white shadow-[0_26px_54px_-32px_rgba(162, 119, 255,0.86)]">
              <p className="text-xs uppercase tracking-[0.22em] text-white/60">Preview</p>
              <h3 className="mt-2 font-headline text-xl font-bold leading-tight">
                {formData.name || "Produk baru kamu akan tampil di sini"}
              </h3>
              <div className="mt-4 grid gap-2.5">
                <PreviewRow label="SKU" value={formData.sku || "Belum diisi"} />
                <PreviewRow label="Harga" value={formData.price ? `Rp ${Number(formData.price).toLocaleString("id-ID")}` : "Belum diisi"} />
                <PreviewRow label="Stok Awal" value={formData.stock || "0"} />
              </div>
            </div>

            <div className="rounded-xl border border-outline-variant/15 bg-white/72 p-4 shadow-[0_16px_40px_-34px_rgba(39, 23, 68,0.34)]">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-headline text-lg font-bold text-on-surface">Kategori</h3>
                  <p className="mt-1 text-sm text-on-surface-variant">Kelompokkan produk agar pencarian dan filtering lebih nyaman.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCategoryCreator((current) => !current)}
                  className="rounded-xl border border-outline-variant/20 bg-white/85 px-2.5 py-1.5 text-xs font-semibold text-secondary shadow-[0_12px_26px_-22px_rgba(162, 119, 255,0.5)]"
                >
                  {showCategoryCreator ? "Tutup" : "Quick add"}
                </button>
              </div>
              <Field label="Category">
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="app-field px-4 py-2.5 text-sm"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>

              {showCategoryCreator ? (
                <div className="mt-3 rounded-xl border border-secondary/14 bg-secondary/5 p-3">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                    Nama Kategori Baru
                  </label>
                  <div className="flex flex-col gap-3">
                    <input
                      value={newCategoryName}
                      onChange={(event) => setNewCategoryName(event.target.value)}
                      className="app-field w-full px-4 py-2.5 text-sm"
                      placeholder="e.g. Cold Brew Series"
                    />
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      disabled={creatingCategory}
                      className="app-primary-btn w-full rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
                    >
                      {creatingCategory ? "Menyimpan..." : "Simpan Kategori"}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-outline-variant/12 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="app-secondary-btn rounded-xl px-4 py-2.5 text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="app-primary-btn rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Product"}
          </button>
        </div>
      </form>
    </AppModal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
        {label}
      </span>
      {children}
    </label>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/10 px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-[0.18em] text-white/60">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}
