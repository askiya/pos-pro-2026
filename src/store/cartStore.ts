import { create } from 'zustand';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
}

interface CartState {
  items: CartItem[];
  discount: number;
  taxRate: number;
  
  // Actions
  addItem: (item: Omit<CartItem, 'quantity' | 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  setDiscount: (discount: number) => void;
  setTaxRate: (rate: number) => void;
  clearCart: () => void;
  
  // Computed (accessed via store.getState() or hooks)
  getSubtotal: () => number;
  getTaxAmount: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  discount: 0,
  taxRate: 0.11, // 11% PPN by default

  addItem: (product) => set((state) => {
    const existingItem = state.items.find(item => item.productId === product.productId);
    
    if (existingItem) {
      // Increase quantity if it doesn't exceed stock
      if (existingItem.quantity < existingItem.stock) {
        return {
          items: state.items.map(item => 
            item.productId === product.productId 
              ? { ...item, quantity: item.quantity + 1 } 
              : item
          )
        };
      }
      return state; // No change if out of stock
    }

    // Add new item
    const newItem: CartItem = {
      ...product,
      id: crypto.randomUUID(),
      quantity: 1
    };
    
    return { items: [...state.items, newItem] };
  }),

  removeItem: (id) => set((state) => ({
    items: state.items.filter(item => item.id !== id)
  })),

  updateQuantity: (id, quantity) => set((state) => ({
    items: state.items.map(item => {
      if (item.id === id) {
        // Ensure quantity is between 1 and stock
        const validQuantity = Math.max(1, Math.min(quantity, item.stock));
        return { ...item, quantity: validQuantity };
      }
      return item;
    })
  })),

  setDiscount: (discount) => set({ discount }),
  
  setTaxRate: (taxRate) => set({ taxRate }),

  clearCart: () => set({ items: [], discount: 0 }),

  getSubtotal: () => {
    const state = get();
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  },

  getTaxAmount: () => {
    const state = get();
    const subtotal = state.getSubtotal();
    const subtotalAfterDiscount = Math.max(0, subtotal - state.discount);
    return subtotalAfterDiscount * state.taxRate;
  },

  getTotal: () => {
    const state = get();
    const subtotal = state.getSubtotal();
    const tax = state.getTaxAmount();
    return Math.max(0, subtotal - state.discount) + tax;
  }
}));
