import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { useToast } from "@/components/ui/ToastProvider";
import { getApiErrorMessage, readApiPayload, toApiArray } from "@/lib/client-api";
import { formatCurrency } from "@/lib/format";
import { useCartStore } from "@/store/cartStore";

interface Product {
  id: string;
  name: string;
  price: number | string;
  stock: number;
  imageUrl?: string;
  category?: { name: string };
}

interface Category {
  id: string;
  name: string;
}

export default function PosCatalog({ isMobileHidden }: { isMobileHidden?: boolean }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const payload = await readApiPayload(response);

        if (cancelled) return;

        if (!response.ok) {
          setCategories([]);
          setCatalogError(getApiErrorMessage(payload, "Kategori belum bisa dimuat."));
          return;
        }

        setCategories(toApiArray<Category>(payload));
      } catch (error) {
        if (cancelled) return;

        console.error("Failed to load categories", error);
        setCategories([]);
        setCatalogError("Kategori belum bisa dimuat. Coba refresh halaman.");
      }
    };

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      const query = new URLSearchParams();
      if (search) query.set("search", search);
      if (activeCategory) query.set("categoryId", activeCategory);

      setLoadingProducts(true);

      try {
        const response = await fetch(`/api/products?${query.toString()}`);
        const payload = await readApiPayload(response);

        if (cancelled) return;

        if (!response.ok) {
          setProducts([]);
          setCatalogError(getApiErrorMessage(payload, "Katalog belum bisa dimuat saat ini."));
          return;
        }

        setProducts(toApiArray<Product>(payload));
        setCatalogError(null);
      } catch (error) {
        if (cancelled) return;

        console.error("Failed to load products", error);
        setProducts([]);
        setCatalogError("Katalog belum bisa dimuat. Coba refresh halaman.");
      } finally {
        if (!cancelled) {
          setLoadingProducts(false);
        }
      }
    };

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, [search, activeCategory]);

  const activeCategoryName = activeCategory
    ? categories.find((category) => category.id === activeCategory)?.name ?? "Filter aktif"
    : "Semua produk";

  const resetFilter = () => {
    setSearch("");
    setActiveCategory("");
  };

  return (
    <section className={`min-h-[620px] ${isMobileHidden ? "hidden xl:flex" : "flex"} flex-col`}>
      <div className="app-surface pos-entrance relative flex h-full min-h-0 flex-col overflow-hidden rounded-[34px] p-4 md:p-5">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#f5edff] to-transparent" />
        <div className="pointer-events-none absolute -right-20 top-8 h-52 w-52 rounded-full bg-[#12b981]/10" />

        <div className="relative flex min-h-0 flex-1 flex-col">
          <div className="shrink-0 rounded-[30px] border border-white/70 bg-white/76 p-4 shadow-[0_20px_55px_-42px_rgba(39, 23, 68,0.42)]">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[#a277ff]">Product Command</p>
                  <h2 className="mt-2 font-headline text-2xl font-black tracking-[-0.04em] text-on-surface sm:text-3xl">
                    Pilih produk dengan cepat
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                  <div className="rounded-[22px] border border-[#ecdfff] bg-white/75 px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant/65">Item tampil</p>
                    <p className="mt-1 font-headline text-xl font-black text-on-surface">{products.length}</p>
                  </div>
                  <div className="rounded-[22px] border border-[#ecdfff] bg-[#f5edff] px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8657ea]/65">Kategori</p>
                    <p className="mt-1 truncate font-headline text-xl font-black text-[#8657ea]">{activeCategoryName}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
                <div className="group relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-[#a277ff]">
                    search
                  </span>
                  <input
                    className="app-field w-full py-4 pl-12 pr-14 text-sm font-semibold"
                    placeholder="Cari nama produk, SKU, atau scan barcode..."
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                  <button
                    className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-2xl bg-[#f5edff] text-[#a277ff] hover:bg-[#e6d9ff]"
                    onClick={() =>
                      showToast({
                        title: "Scanner segera hadir",
                        description: "Untuk saat ini, cari produk lewat nama, SKU, atau barcode manual.",
                        variant: "info",
                      })
                    }
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">barcode_scanner</span>
                  </button>
                </div>

                <button
                  className="rounded-[22px] bg-[#271744] px-5 py-3 text-sm font-black text-white shadow-[0_18px_36px_-28px_rgba(17,24,39,0.75)] hover:-translate-y-0.5 hover:bg-[#20246e]"
                  onClick={resetFilter}
                  type="button"
                >
                  Reset Filter
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                <button
                  onClick={() => setActiveCategory("")}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-black ${!activeCategory ? "app-chip-active" : "app-chip"}`}
                  type="button"
                >
                  Semua Produk
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-black ${
                      activeCategory === category.id ? "app-chip-active" : "app-chip"
                    }`}
                    type="button"
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pt-4">
            {loadingProducts ? (
              <div className="grid grid-cols-1 gap-3 pb-4 sm:grid-cols-2 2xl:grid-cols-3">
                {Array.from({ length: 9 }).map((_, index) => (
                  <div key={index} className="h-40 animate-pulse rounded-[28px] bg-white/68 shadow-[0_18px_44px_-38px_rgba(39, 23, 68,0.36)]" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex h-full min-h-[360px] items-center justify-center pb-4">
                <div className="w-full max-w-2xl rounded-[34px] border border-dashed border-[#d4c8e3] bg-white/70 p-8 text-center shadow-[0_28px_70px_-46px_rgba(39, 23, 68,0.36)]">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[30px] bg-[#f5edff] text-[#a277ff]">
                    <span className="material-symbols-outlined icon-fill text-4xl">
                      {catalogError ? "cloud_off" : "inventory_2"}
                    </span>
                  </div>
                  <p className="mt-5 font-headline text-3xl font-black tracking-[-0.05em] text-on-surface">
                    {catalogError ? "Katalog belum bisa dimuat" : "Produk belum tersedia"}
                  </p>
                  <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-on-surface-variant">
                    {catalogError ??
                      "Tambahkan produk dari Inventory dulu. Setelah data masuk, item akan langsung muncul di layar POS cashier."}
                  </p>
                  <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    <button
                      onClick={() => (catalogError ? window.location.reload() : router.push("/inventory"))}
                      className="app-primary-btn rounded-2xl px-5 py-3 text-sm font-black"
                      type="button"
                    >
                      {catalogError ? "Muat Ulang" : "Tambah Produk"}
                    </button>
                    {catalogError ? null : (
                      <button onClick={resetFilter} className="app-secondary-btn rounded-2xl px-5 py-3 text-sm font-black" type="button">
                        Reset Filter
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 pb-4 sm:grid-cols-2 2xl:grid-cols-3">
                {products.map((product, index) => {
                  const isLowStock = product.stock <= 5;
                  const price = typeof product.price === "string" ? parseFloat(product.price) : Number(product.price);

                  return (
                    <motion.button
                      key={product.id}
                      onClick={() => addItem({ productId: product.id, name: product.name, price, stock: product.stock })}
                      disabled={product.stock === 0}
                      className="pos-product-card group relative overflow-hidden rounded-[28px] border border-white/70 bg-white/82 p-3 text-left shadow-[0_20px_56px_-42px_rgba(39, 23, 68,0.42)] hover:bg-white disabled:pointer-events-none disabled:opacity-45"
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.24, delay: Math.min(index * 0.025, 0.2) }}
                      type="button"
                    >
                      <div className="flex gap-3">
                        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[24px] bg-gradient-to-br from-[#f5edff] to-white">
                          {product.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                          ) : (
                            <span className="material-symbols-outlined icon-fill text-4xl text-[#a277ff]/45">inventory_2</span>
                          )}
                          <div className="absolute inset-x-3 bottom-2 h-1 rounded-full bg-white/80">
                            <div className={`h-full rounded-full ${isLowStock ? "bg-[#f59e0b]" : "bg-[#12b981]"}`} style={{ width: `${Math.min(100, Math.max(12, product.stock * 10))}%` }} />
                          </div>
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${
                              product.stock === 0
                                ? "bg-[#fff1f2] text-[#be123c]"
                                : isLowStock
                                  ? "bg-[#fff7df] text-[#b45309]"
                                  : "bg-[#e6f7ef] text-[#047857]"
                            }`}>
                              {product.stock === 0 ? "Habis" : isLowStock ? `${product.stock} tersisa` : `${product.stock} stok`}
                            </span>
                            <span className="material-symbols-outlined rounded-2xl bg-[#271744] p-2 text-[18px] text-white shadow-[0_16px_28px_-22px_rgba(17,24,39,0.75)] transition group-hover:rotate-90 group-hover:bg-[#a277ff]">
                              add
                            </span>
                          </div>

                          <p className="mt-3 truncate text-[11px] font-black uppercase tracking-[0.16em] text-[#a277ff]">
                            {product.category?.name || "Uncategorized"}
                          </p>
                          <h3 className="mt-1 line-clamp-2 font-headline text-lg font-black leading-tight text-on-surface">
                            {product.name}
                          </h3>
                          <p className="mt-auto pt-3 font-headline text-2xl font-black tracking-[-0.04em] text-on-surface">
                            {formatCurrency(price)}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
