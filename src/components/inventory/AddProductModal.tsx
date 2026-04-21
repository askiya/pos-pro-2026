import React, { useState, useEffect } from 'react';

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
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    price: '',
    stock: '',
    categoryId: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock)
        })
      });

      if (res.ok) {
        onSuccess();
        onClose();
        setFormData({ name: '', sku: '', barcode: '', price: '', stock: '', categoryId: '' });
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add product');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-surface-container flex justify-between items-center">
          <h2 className="font-headline font-bold text-lg text-on-surface">Add New Product</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
          <div className="flex flex-col gap-1.5">
            <label className="font-label text-xs font-semibold text-on-surface-variant uppercase">Product Name *</label>
            <input 
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary text-sm font-body outline-none" 
              placeholder="e.g. Artisan Coffee Beans" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-label text-xs font-semibold text-on-surface-variant uppercase">SKU</label>
              <input 
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary text-sm font-body outline-none uppercase" 
                placeholder="SKU-123" 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-label text-xs font-semibold text-on-surface-variant uppercase">Barcode</label>
              <input 
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                className="px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary text-sm font-body outline-none" 
                placeholder="899..." 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-label text-xs font-semibold text-on-surface-variant uppercase">Price *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">$</span>
                <input 
                  required
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full pl-7 pr-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary text-sm font-body outline-none" 
                  placeholder="0.00" 
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-label text-xs font-semibold text-on-surface-variant uppercase">Initial Stock</label>
              <input 
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary text-sm font-body outline-none" 
                placeholder="0" 
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label text-xs font-semibold text-on-surface-variant uppercase">Category</label>
            <select 
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary text-sm font-body outline-none"
            >
              <option value="">-- Select Category --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <div className="text-right">
              <button type="button" onClick={async () => {
                const name = prompt("New category name:");
                if (name) {
                  await fetch('/api/categories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name })
                  });
                  fetchCategories();
                }
              }} className="text-secondary text-xs hover:underline font-medium">
                + Quick add category
              </button>
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-surface-container flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2 text-sm font-medium bg-secondary text-on-secondary rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
