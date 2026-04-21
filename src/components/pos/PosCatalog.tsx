import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';

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
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('');
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    fetch('/api/categories').then(res => res.json()).then(setCategories);
  }, []);

  useEffect(() => {
    const query = new URLSearchParams();
    if (search) query.set('search', search);
    if (activeCategory) query.set('categoryId', activeCategory);
    
    fetch(`/api/products?${query.toString()}`)
      .then(res => res.json())
      .then(setProducts);
  }, [search, activeCategory]);

  return (
    <section className={`flex-1 flex-col h-full overflow-hidden bg-surface-container-low ${isMobileHidden ? 'hidden lg:flex' : 'flex'}`}>
      {/* Search & Filters Header */}
      <div className="p-6 pb-2 flex flex-col gap-4 z-10 bg-surface-container-low sticky top-0">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors">search</span>
            <input 
              className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest text-on-surface font-body text-sm rounded-xl border-0 ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-secondary/50 focus:bg-surface-bright transition-all shadow-sm placeholder:text-on-surface-variant/70" 
              placeholder="Search products, SKU, or scan barcode..." 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant hover:bg-surface-container rounded-lg">
              <span className="material-symbols-outlined text-xl">barcode_scanner</span>
            </button>
          </div>
        </div>
        
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 hide-scrollbar">
          <button 
            onClick={() => setActiveCategory('')}
            className={`whitespace-nowrap px-4 py-2 rounded-md font-body text-sm font-medium transition-all active:scale-95 ${!activeCategory ? 'bg-primary-container text-on-primary' : 'bg-surface-container-lowest text-on-surface shadow-sm ring-1 ring-outline-variant/10'}`}
          >
            All Items
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-md font-body text-sm font-medium transition-all active:scale-95 ${activeCategory === cat.id ? 'bg-primary-container text-on-primary' : 'bg-surface-container-lowest text-on-surface hover:bg-surface-variant shadow-sm ring-1 ring-outline-variant/10'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto p-6 pt-2">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-20 lg:pb-0">
          {products.map(product => {
            const isLowStock = product.stock <= 5;
            const price = typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price);
            return (
              <button 
                key={product.id} 
                onClick={() => addItem({ productId: product.id, name: product.name, price: price, stock: product.stock })}
                disabled={product.stock === 0}
                className="group flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-[0_12px_40px_-12px_rgba(19,27,46,0.08)] hover:-translate-y-1 transition-all duration-200 ring-1 ring-outline-variant/15 text-left h-full active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                <div className="relative w-full aspect-square bg-surface-variant overflow-hidden flex items-center justify-center">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/50">inventory_2</span>
                  )}
                  <div className={`absolute top-2 left-2 px-2 py-1 backdrop-blur-md rounded-full text-[10px] font-bold font-body shadow-sm ${isLowStock ? 'bg-error-container/90 text-on-error-container' : 'bg-surface-container-lowest/90 text-on-surface'}`}>
                    {product.stock === 0 ? 'Out of stock' : isLowStock ? `Only ${product.stock} left` : `${product.stock} in stock`}
                  </div>
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <span className="text-on-surface-variant text-[11px] font-medium font-body mb-1">{product.category?.name || 'Uncategorized'}</span>
                  <h3 className="font-body text-sm font-semibold text-on-surface leading-tight mb-2 line-clamp-2">{product.name}</h3>
                  <div className="mt-auto font-headline text-base font-bold text-on-surface">${price.toFixed(2)}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
