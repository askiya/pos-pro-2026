"use client";
import { useState, useEffect } from "react";
import ResponsiveLayout from "@/components/layout/ResponsiveLayout";
import DataTable from "@/components/ui/DataTable";
import AddProductModal from "@/components/inventory/AddProductModal";

export default function InventoryPage() {
  const [products, setProducts] = useState<Array<{
    id: string;
    name: string;
    barcode: string;
    sku: string;
    stock: number;
    price: string;
    imageUrl?: string;
    category?: { name: string };
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ResponsiveLayout>
      <AddProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchProducts} 
      />
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface relative pb-20 md:pb-0 w-full">
        {/* Page Header & Actions */}
        <div className="px-6 md:px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 bg-surface">
          <div>
            <h1 className="font-headline font-bold text-2xl text-on-surface tracking-tight">Inventory Hub</h1>
            <p className="font-body text-sm text-on-surface-variant mt-1">Manage {products.length} SKUs across all branches.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container-highest text-on-surface font-body font-medium text-sm hover:bg-surface-dim transition-colors">
              <span className="material-symbols-outlined text-sm">download</span>
              Import CSV
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container-highest text-on-surface font-body font-medium text-sm hover:bg-surface-dim transition-colors">
              <span className="material-symbols-outlined text-sm">inventory</span>
              Stock Opname
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container-highest text-on-surface font-body font-medium text-sm hover:bg-surface-dim transition-colors">
              <span className="material-symbols-outlined text-sm">local_shipping</span>
              Stock Transfer
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-br from-secondary to-secondary-container flex items-center gap-2 px-5 py-2 rounded-lg text-on-secondary font-body font-medium text-sm shadow-md hover:shadow-lg hover:opacity-95 transition-all"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Add Product
            </button>
          </div>
        </div>

        {/* Main Content Layout: Sidebar + Data Table */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden px-6 md:px-8 pb-8 gap-6 z-10">
          {/* Filters Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0 bg-surface-container-low rounded-xl p-5 flex flex-col gap-6 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-headline font-bold text-sm text-on-surface uppercase tracking-wider">Filters</h2>
              <button className="text-secondary font-body text-xs font-medium hover:text-secondary-container transition-colors">Clear All</button>
            </div>
            
            {/* Branch Filter */}
            <div className="flex flex-col gap-3">
              <h3 className="font-body text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Branch</h3>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input defaultChecked className="form-checkbox h-4 w-4 text-secondary rounded border-outline-variant focus:ring-secondary/20 bg-surface-container-lowest" type="checkbox"/>
                  <span className="font-body text-sm text-on-surface group-hover:text-secondary transition-colors">Downtown Branch</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input className="form-checkbox h-4 w-4 text-secondary rounded border-outline-variant focus:ring-secondary/20 bg-surface-container-lowest" type="checkbox"/>
                  <span className="font-body text-sm text-on-surface group-hover:text-secondary transition-colors">Uptown Mall</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input className="form-checkbox h-4 w-4 text-secondary rounded border-outline-variant focus:ring-secondary/20 bg-surface-container-lowest" type="checkbox"/>
                  <span className="font-body text-sm text-on-surface group-hover:text-secondary transition-colors">Westside Hub</span>
                </label>
              </div>
            </div>
            
            {/* Category Filter */}
            <div className="flex flex-col gap-3">
              <h3 className="font-body text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Category</h3>
              <div className="flex flex-wrap gap-2">
                <button className="px-3 py-1 rounded-full bg-surface-container-highest text-on-surface font-body text-xs hover:bg-secondary/10 hover:text-secondary transition-colors">Beverages</button>
                <button className="px-3 py-1 rounded-full bg-secondary text-on-secondary font-body text-xs shadow-sm">Snacks</button>
                <button className="px-3 py-1 rounded-full bg-surface-container-highest text-on-surface font-body text-xs hover:bg-secondary/10 hover:text-secondary transition-colors">Electronics</button>
                <button className="px-3 py-1 rounded-full bg-surface-container-highest text-on-surface font-body text-xs hover:bg-secondary/10 hover:text-secondary transition-colors">Apparel</button>
                <button className="px-3 py-1 rounded-full bg-surface-container-highest text-on-surface font-body text-xs hover:bg-secondary/10 hover:text-secondary transition-colors">Accessories</button>
              </div>
            </div>

            {/* Stock Status Filter */}
            <div className="flex flex-col gap-3">
              <h3 className="font-body text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Stock Status</h3>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input className="form-radio h-4 w-4 text-secondary border-outline-variant focus:ring-secondary/20 bg-surface-container-lowest" name="stock_status" type="radio"/>
                  <span className="font-body text-sm text-on-surface group-hover:text-secondary transition-colors">All Status</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input className="form-radio h-4 w-4 text-secondary border-outline-variant focus:ring-secondary/20 bg-surface-container-lowest" name="stock_status" type="radio"/>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#009668]"></span>
                    <span className="font-body text-sm text-on-surface group-hover:text-secondary transition-colors">Normal</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input defaultChecked className="form-radio h-4 w-4 text-secondary border-outline-variant focus:ring-secondary/20 bg-surface-container-lowest" name="stock_status" type="radio"/>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#d97706]"></span>
                    <span className="font-body text-sm text-on-surface group-hover:text-secondary transition-colors">Low Stock</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input className="form-radio h-4 w-4 text-secondary border-outline-variant focus:ring-secondary/20 bg-surface-container-lowest" name="stock_status" type="radio"/>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-error"></span>
                    <span className="font-body text-sm text-on-surface group-hover:text-secondary transition-colors">Out of Stock</span>
                  </div>
                </label>
              </div>
            </div>
          </aside>

          {/* Data Table Container */}
          <DataTable
            columns={[
              { header: <><input className="form-checkbox h-4 w-4 text-secondary rounded border-outline-variant focus:ring-secondary/20 bg-surface mr-2" type="checkbox"/>Product Name</>, className: "col-span-3 flex items-center gap-2" },
              { header: "SKU", className: "col-span-2 flex items-center" },
              { header: "Category", className: "col-span-2 flex items-center" },
              { header: "Stock", className: "col-span-1 flex items-center justify-end" },
              { header: "HPP (FIFO)", className: "col-span-1 flex items-center justify-end" },
              { header: "Price", className: "col-span-1 flex items-center justify-end" },
              { header: "Status", className: "col-span-2 flex items-center justify-center" }
            ]}
            pagination={{
              currentPage: 1,
              totalPages: Math.ceil(products.length / 10) || 1,
              totalItems: products.length,
              itemsPerPage: 10,
              onPageChange: () => {}
            }}
          >
            {loading ? (
              <div className="p-8 text-center text-on-surface-variant font-body text-sm">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant font-body text-sm">No products found. Add one!</div>
            ) : (
              products.map((product) => (
                <div key={product.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-surface-container-highest transition-colors cursor-pointer group rounded-xl mx-2 my-1">
                  <div className="col-span-3 flex items-center gap-3">
                    <input className="form-checkbox h-4 w-4 text-secondary rounded border-outline-variant focus:ring-secondary/20 bg-surface opacity-0 group-hover:opacity-100 transition-opacity" type="checkbox"/>
                    <div className="w-10 h-10 rounded-lg bg-surface-container-low overflow-hidden flex-shrink-0 flex items-center justify-center text-on-surface-variant">
                      {product.imageUrl ? (
                        <img alt={product.name} className="w-full h-full object-cover" src={product.imageUrl}/>
                      ) : (
                        <span className="material-symbols-outlined text-xl">image</span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-headline font-bold text-sm text-on-surface group-hover:text-secondary transition-colors truncate">{product.name}</span>
                      <span className="font-body text-xs text-on-surface-variant">{product.barcode || 'No Barcode'}</span>
                    </div>
                  </div>
                  <div className="col-span-2 font-body text-sm text-on-surface-variant font-mono">{product.sku || '-'}</div>
                  <div className="col-span-2 flex items-center">
                    <span className="px-2 py-1 rounded bg-surface-container text-on-surface-variant text-xs font-medium">
                      {product.category?.name || 'Uncategorized'}
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center justify-end font-headline font-semibold text-sm text-on-surface">
                    {product.stock}
                  </div>
                  <div className="col-span-1 flex items-center justify-end font-body text-sm text-on-surface-variant">
                    -
                  </div>
                  <div className="col-span-1 flex items-center justify-end font-headline font-bold text-sm text-on-surface">
                    ${parseFloat(product.price).toFixed(2)}
                  </div>
                  <div className="col-span-2 flex items-center justify-center">
                    {product.stock > 10 ? (
                      <span className="px-3 py-1 rounded-full bg-[#e6f5f0] text-[#005236] text-xs font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#009668]"></span> Normal
                      </span>
                    ) : product.stock > 0 ? (
                      <span className="px-3 py-1 rounded-full bg-[#fef3c7] text-[#92400e] text-xs font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#d97706]"></span> Low Stock
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-error-container text-on-error-container text-xs font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-error"></span> Out of Stock
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </DataTable>
        </div>
      </div>
    </ResponsiveLayout>
  );
}
