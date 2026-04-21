import { create } from 'zustand';
import { Product } from '@prisma/client';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  discount: number;
  taxRate: number; // e.g. 0.11 for 11% PPN
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setDiscount: (amount: number) => void;
  clearCart: () => void;
  // Getters
  getSubtotal: () => number;
  getTaxAmount: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  discount: 0,
  taxRate: 0.11, // 11% default PPN

  addItem: (product) => set((state) => {
    const existing = state.items.find(item => item.product.id === product.id);
    if (existing) {
      return {
        items: state.items.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      };
    }
    return { items: [...state.items, { product, quantity: 1 }] };
  }),

  removeItem: (productId) => set((state) => ({
    items: state.items.filter(item => item.product.id !== productId)
  })),

  updateQuantity: (productId, quantity) => set((state) => {
    if (quantity <= 0) {
      return { items: state.items.filter(item => item.product.id !== productId) };
    }
    return {
      items: state.items.map(item => 
        item.product.id === productId 
          ? { ...item, quantity }
          : item
      )
    };
  }),

  setDiscount: (amount) => set({ discount: amount }),
  
  clearCart: () => set({ items: [], discount: 0 }),

  getSubtotal: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
  },

  getTaxAmount: () => {
    const { getSubtotal, discount, taxRate } = get();
    const taxable = Math.max(0, getSubtotal() - discount);
    return taxable * taxRate;
  },

  getTotal: () => {
    const { getSubtotal, getTaxAmount, discount } = get();
    return Math.max(0, getSubtotal() - discount) + getTaxAmount();
  }
}));
