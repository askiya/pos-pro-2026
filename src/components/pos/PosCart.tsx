"use client";

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';

type PaymentType = 'CASH' | 'TRANSFER' | 'QRIS' | 'CARD';

export default function PosCart({ isMobileHidden }: { isMobileHidden?: boolean }) {
  const { items, discount, removeItem, updateQuantity, clearCart, setDiscount, getSubtotal, getTaxAmount, getTotal } = useCartStore();
  const [selectedPayment, setSelectedPayment] = useState<PaymentType>('CASH');
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = getSubtotal();
  const tax = getTaxAmount();
  const total = getTotal();
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  const handleCharge = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
          paymentType: selectedPayment,
          discount
        })
      });
      if (res.ok) {
        const order = await res.json();
        clearCart();
        alert(`✅ Transaksi berhasil!\nNo. Order: ${order.orderNumber}\nTotal: $${total.toFixed(2)}`);
      } else {
        const err = await res.json();
        alert(`❌ Error: ${err.error}`);
      }
    } catch (error) {
      console.error(error);
      alert('Gagal memproses transaksi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentMethods: { type: PaymentType; label: string; icon: string }[] = [
    { type: 'CASH', label: 'Cash', icon: 'payments' },
    { type: 'TRANSFER', label: 'Transfer', icon: 'account_balance' },
    { type: 'QRIS', label: 'QRIS', icon: 'qr_code_scanner' },
    { type: 'CARD', label: 'Card', icon: 'credit_card' },
  ];

  return (
    <section className={`w-full lg:w-[400px] xl:w-[480px] bg-surface-container-lowest flex-col h-full shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.05)] z-20 shrink-0 ${isMobileHidden ? 'hidden lg:flex' : 'flex'}`}>
      {/* Cart Header */}
      <div className="p-6 pb-4 bg-surface-container-lowest flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="font-headline text-xl font-bold text-on-surface">Current Order</h2>
          {itemCount > 0 && (
            <span className="px-2 py-0.5 bg-secondary text-on-secondary text-xs font-bold rounded-md">{itemCount}</span>
          )}
        </div>
        <div className="flex gap-2">
          <button className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-all" title="More Options">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto px-6 pb-4 flex flex-col gap-3">
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant gap-3 py-16">
            <span className="material-symbols-outlined text-5xl opacity-30">shopping_cart</span>
            <p className="font-body text-sm">Tap a product to add it here</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="group flex gap-4 p-3 bg-surface rounded-xl hover:bg-surface-container-highest transition-colors">
              <div className="w-14 h-14 rounded-lg bg-surface-container-low overflow-hidden shrink-0 flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-2xl">inventory_2</span>
              </div>
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-body text-sm font-semibold text-on-surface line-clamp-2 flex-1">{item.name}</h4>
                  <span className="font-headline font-bold text-on-surface shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center bg-surface-container-lowest rounded-md ring-1 ring-outline-variant/20 shadow-sm overflow-hidden">
                    <button onClick={() => item.quantity === 1 ? removeItem(item.id) : updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 text-on-surface-variant hover:bg-surface-variant transition-colors active:bg-surface-dim">
                      <span className="material-symbols-outlined text-[16px]">{item.quantity === 1 ? 'delete' : 'remove'}</span>
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-on-surface font-body">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock} className="px-2 py-1 text-on-surface-variant hover:bg-surface-variant transition-colors active:bg-surface-dim disabled:opacity-40">
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  </div>
                  <span className="text-xs text-on-surface-variant font-body">${item.price.toFixed(2)} / unit</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="bg-surface-container p-6 flex flex-col gap-4 rounded-tl-2xl mt-auto pb-32 md:pb-6 shrink-0">
        {/* Breakdown */}
        <div className="flex flex-col gap-2 font-body text-sm">
          <div className="flex justify-between text-on-surface-variant">
            <span>Subtotal ({itemCount} items)</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-on-surface-variant">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">sell</span> Discount
            </span>
            <div className="flex items-center gap-1">
              <span>-$</span>
              <input
                type="number"
                value={discount || ''}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-16 text-right bg-surface-container-low border-0 rounded px-1 py-0.5 text-sm outline-none focus:ring-1 focus:ring-secondary"
                placeholder="0.00"
                min="0"
              />
            </div>
          </div>
          <div className="flex justify-between items-center text-on-surface-variant pt-2 border-t border-outline-variant/20">
            <span>Tax (PPN 11%)</span>
            <span className="font-medium">${tax.toFixed(2)}</span>
          </div>
        </div>

        {/* Grand Total */}
        <div className="flex justify-between items-end pt-1 pb-1">
          <span className="font-body text-sm font-semibold text-on-surface">Total</span>
          <span className="font-headline text-3xl font-black text-on-surface tracking-tight">${total.toFixed(2)}</span>
        </div>

        {/* Payment Methods */}
        <div className="grid grid-cols-4 gap-2">
          {paymentMethods.map(pm => (
            <button
              key={pm.type}
              onClick={() => setSelectedPayment(pm.type)}
              className={`py-3 px-2 font-body text-sm font-bold rounded-lg shadow-sm transition-all active:scale-95 flex flex-col items-center justify-center gap-1 ${selectedPayment === pm.type ? 'bg-secondary text-on-secondary shadow-md' : 'bg-surface-container-lowest text-on-surface hover:bg-surface-variant'}`}
            >
              <span className="material-symbols-outlined">{pm.icon}</span>
              {pm.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleCharge}
          disabled={items.length === 0 || isProcessing}
          className="w-full py-4 px-6 bg-gradient-to-br from-secondary to-secondary-container text-white font-headline text-lg font-bold rounded-xl shadow-[0_8px_24px_-8px_rgba(70,72,212,0.5)] hover:shadow-[0_12px_32px_-8px_rgba(70,72,212,0.6)] hover:-translate-y-0.5 active:scale-[0.98] transition-all flex justify-between items-center disabled:opacity-50 disabled:pointer-events-none"
        >
          <span>{isProcessing ? 'Processing...' : 'Charge'}</span>
          <div className="flex items-center gap-2">
            <span>${total.toFixed(2)}</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </div>
        </button>

        <div className="grid grid-cols-2 gap-2 mt-1">
          <button className="py-2 text-on-surface-variant bg-transparent hover:bg-surface-container-highest rounded-lg font-body text-sm font-medium transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">pause_circle</span> Hold
          </button>
          <button onClick={clearCart} className="py-2 text-error bg-error-container/30 hover:bg-error-container/60 rounded-lg font-body text-sm font-medium transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">delete_sweep</span> Clear
          </button>
        </div>
      </div>
    </section>
  );
}
