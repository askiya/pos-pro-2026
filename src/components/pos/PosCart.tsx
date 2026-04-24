"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import { useToast } from "@/components/ui/ToastProvider";
import { formatCurrency } from "@/lib/format";
import { useCartStore } from "@/store/cartStore";

type PaymentType = "CASH" | "TRANSFER" | "QRIS" | "SPLIT";

const paymentMethods: { type: PaymentType; label: string; icon: string; tone: string }[] = [
  { type: "CASH", label: "Tunai", icon: "payments", tone: "from-[#271744] to-[#a277ff]" },
  { type: "TRANSFER", label: "Transfer", icon: "account_balance", tone: "from-[#a277ff] to-[#7c3aed]" },
  { type: "QRIS", label: "QRIS", icon: "qr_code_scanner", tone: "from-[#047857] to-[#12b981]" },
  { type: "SPLIT", label: "Split", icon: "credit_score", tone: "from-[#b45309] to-[#f59e0b]" },
];

type PosCartProps = {
  isMobileHidden?: boolean;
  variant?: "panel" | "drawer";
  onClose?: () => void;
  onCharged?: () => void;
};

export default function PosCart({
  isMobileHidden,
  variant = "panel",
  onClose,
  onCharged,
}: PosCartProps) {
  const { items, discount, removeItem, updateQuantity, clearCart, setDiscount, getSubtotal, getTaxAmount, getTotal } =
    useCartStore();
  const [selectedPayment, setSelectedPayment] = useState<PaymentType>("CASH");
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useToast();

  const subtotal = getSubtotal();
  const tax = getTaxAmount();
  const total = getTotal();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const selectedPaymentLabel = paymentMethods.find((method) => method.type === selectedPayment)?.label ?? selectedPayment;
  const compact = variant === "drawer";

  const handleCharge = async () => {
    if (items.length === 0) return;

    setIsProcessing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
          paymentType: selectedPayment,
          discount,
        }),
      });

      const payload = await res.json();

      if (res.ok) {
        clearCart();
        showToast({
          title: "Transaksi berhasil",
          description: `${payload.orderNumber ?? "Order baru"} - ${formatCurrency(total)}`,
          variant: "success",
        });
        onCharged?.();
      } else {
        showToast({
          title: "Transaksi gagal",
          description: payload.error ?? "Order belum bisa diproses.",
          variant: "error",
        });
      }
    } catch (error) {
      console.error(error);
      showToast({
        title: "Transaksi gagal",
        description: "Cek koneksi atau coba lagi beberapa saat lagi.",
        variant: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section
      className={`${
        compact ? "flex h-full min-h-0" : "min-h-[680px]"
      } ${isMobileHidden ? "hidden xl:flex" : "flex"}`}
    >
      <div className={`app-surface pos-entrance flex h-full min-h-0 flex-1 flex-col overflow-hidden ${compact ? "rounded-[24px] p-2.5 sm:p-3" : "rounded-[34px] p-4 md:p-5"}`}>
        <div className={`shrink-0 overflow-hidden bg-[linear-gradient(135deg,#271744_0%,#5c3d99_58%,#a277ff_100%)] text-white shadow-[0_26px_70px_-44px_rgba(17,24,39,0.86)] ${compact ? "rounded-[24px] p-4" : "rounded-[30px] p-5"}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-white/55">Order Dock</p>
              <h2 className={`mt-2 font-headline font-black tracking-[-0.05em] ${compact ? "text-[2rem] leading-none" : "text-3xl"}`}>Current Order</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                className={`flex items-center justify-center border border-white/14 bg-white/10 text-white/82 hover:bg-white/16 ${compact ? "h-10 w-10 rounded-[18px]" : "h-12 w-12 rounded-2xl"}`}
                onClick={() =>
                  showToast({
                    title: "Order actions siap dikembangkan",
                    description: "Nanti bisa kita sambungkan untuk hold order, split customer, atau draft transaksi.",
                    variant: "info",
                  })
                }
                type="button"
              >
                <span className={`material-symbols-outlined ${compact ? "text-[20px]" : "text-[22px]"}`}>more_vert</span>
              </button>
              {onClose ? (
                <button
                  className={`flex items-center justify-center border border-white/14 bg-white/10 text-white/82 hover:bg-white/16 ${compact ? "h-10 w-10 rounded-[18px]" : "h-12 w-12 rounded-2xl"}`}
                  onClick={onClose}
                  type="button"
                >
                  <span className={`material-symbols-outlined ${compact ? "text-[20px]" : "text-[22px]"}`}>close</span>
                </button>
              ) : null}
            </div>
          </div>

          <div className={`grid grid-cols-2 gap-3 ${compact ? "mt-4" : "mt-5"}`}>
            <div className={`border border-white/14 bg-white/10 ${compact ? "rounded-[20px] p-3" : "rounded-[24px] p-4"}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/52">Items</p>
              <p className={`mt-2 font-headline font-black tracking-[-0.05em] ${compact ? "text-[2rem]" : "text-3xl"}`}>{itemCount}</p>
            </div>
            <div className={`border border-white/14 bg-white/10 ${compact ? "rounded-[20px] p-3" : "rounded-[24px] p-4"}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/52">Payment</p>
              <p className={`mt-2 truncate font-headline font-black tracking-[-0.05em] ${compact ? "text-[1.7rem]" : "text-3xl"}`}>{selectedPaymentLabel}</p>
            </div>
          </div>
        </div>

        <div className={`min-h-0 flex-1 overflow-y-auto pr-1 ${compact ? "py-3" : "py-4"}`}>
          {items.length === 0 ? (
            <div className={`flex h-full flex-col items-center justify-center border border-dashed border-[#d4c8e3] bg-white/58 text-center ${compact ? "min-h-[260px] rounded-[24px] p-6" : "min-h-[330px] rounded-[30px] p-8"}`}>
              <div className={`relative flex items-center justify-center bg-[#f5edff] text-[#a277ff] ${compact ? "h-20 w-20 rounded-[26px]" : "h-24 w-24 rounded-[34px]"}`}>
                <span className={`material-symbols-outlined icon-fill ${compact ? "text-[42px]" : "text-5xl"}`}>shopping_cart</span>
                <span className="pos-soft-scan absolute inset-x-4 bottom-5 h-1 rounded-full bg-[#12b981]" />
              </div>
              <p className={`mt-5 font-headline font-black tracking-[-0.05em] text-on-surface ${compact ? "text-2xl" : "text-3xl"}`}>Keranjang kosong</p>
              <p className={`mt-2 max-w-sm text-on-surface-variant ${compact ? "text-[13px] leading-5" : "text-sm leading-6"}`}>
                Tap produk dari katalog. Total, diskon, pajak, dan tombol charge akan aktif otomatis.
              </p>
            </div>
          ) : (
            <div className={compact ? "space-y-2.5" : "space-y-3"}>
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  className={`rounded-[28px] border border-white/70 bg-white/82 shadow-[0_20px_54px_-42px_rgba(39, 23, 68,0.42)] ${compact ? "rounded-[22px] p-3.5" : "p-4"}`}
                  initial={{ opacity: 0, x: 22 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.24, delay: Math.min(index * 0.03, 0.18) }}
                >
                  <div className="flex gap-3">
                    <div className={`flex shrink-0 items-center justify-center bg-[#f5edff] text-[#a277ff] ${compact ? "h-14 w-14 rounded-[20px]" : "h-16 w-16 rounded-[24px]"}`}>
                      <span className={`material-symbols-outlined icon-fill ${compact ? "text-[24px]" : "text-[28px]"}`}>inventory_2</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className={`line-clamp-2 font-headline font-black leading-tight text-on-surface ${compact ? "text-base" : "text-lg"}`}>{item.name}</h4>
                          <p className={`mt-1 font-medium text-on-surface-variant ${compact ? "text-[13px]" : "text-sm"}`}>{formatCurrency(item.price)} / unit</p>
                        </div>
                        <button
                          className={`flex shrink-0 items-center justify-center bg-[#fff1f2] text-[#be123c] hover:bg-[#ffe4e6] ${compact ? "h-8 w-8 rounded-xl" : "h-9 w-9 rounded-2xl"}`}
                          onClick={() => removeItem(item.id)}
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      </div>

                      <div className={`flex items-center justify-between gap-3 ${compact ? "mt-3" : "mt-4"}`}>
                        <div className={`flex items-center border border-[#ecdfff] bg-white p-1 shadow-[0_12px_28px_-22px_rgba(39, 23, 68,0.36)] ${compact ? "rounded-[18px]" : "rounded-[20px]"}`}>
                          <button
                            onClick={() => (item.quantity === 1 ? removeItem(item.id) : updateQuantity(item.id, item.quantity - 1))}
                            className={`flex items-center justify-center text-on-surface-variant hover:bg-[#f5edff] hover:text-[#a277ff] ${compact ? "h-9 w-9 rounded-[14px]" : "h-10 w-10 rounded-2xl"}`}
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[18px]">{item.quantity === 1 ? "delete" : "remove"}</span>
                          </button>
                          <span className={`text-center font-headline font-black text-on-surface ${compact ? "w-9 text-lg" : "w-10 text-xl"}`}>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className={`flex items-center justify-center text-on-surface-variant hover:bg-[#f5edff] hover:text-[#a277ff] disabled:opacity-35 ${compact ? "h-9 w-9 rounded-[14px]" : "h-10 w-10 rounded-2xl"}`}
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                          </button>
                        </div>

                        <div className="text-right">
                          <p className={`font-headline font-black tracking-[-0.04em] text-on-surface ${compact ? "text-base" : "text-lg"}`}>
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                          <p className={`font-bold text-[#047857] ${compact ? "text-[11px]" : "text-xs"}`}>Stok {item.stock}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className={`shrink-0 border border-white/14 bg-[linear-gradient(135deg,#271744_0%,#a277ff_100%)] text-white shadow-[0_32px_80px_-46px_rgba(162, 119, 255,0.92)] ${compact ? "rounded-[24px] p-4" : "rounded-[32px] p-5"}`}>
          <div className={`space-y-3 border-b border-white/12 ${compact ? "pb-3.5" : "pb-4"}`}>
            <div className="flex justify-between text-sm font-semibold text-white/72">
              <span>Subtotal ({itemCount} item)</span>
              <span className="text-white">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm font-semibold text-white/72">
              <span>Discount</span>
              <div className="flex items-center gap-2">
                <span>-Rp</span>
                <input
                  type="number"
                  value={discount || ""}
                  onChange={(event) => setDiscount(parseFloat(event.target.value) || 0)}
                  className={`border border-white/12 bg-white/12 text-right font-black text-white placeholder:text-white/45 outline-none focus:bg-white/18 ${compact ? "w-20 rounded-[18px] px-2.5 py-1.5 text-sm" : "w-24 rounded-2xl px-3 py-2"}`}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
            <div className="flex justify-between text-sm font-semibold text-white/72">
              <span>Tax (PPN 11%)</span>
              <span className="text-white">{formatCurrency(tax)}</span>
            </div>
          </div>

          <div className={`flex items-end justify-between gap-4 ${compact ? "mt-3.5" : "mt-4"}`}>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/52">Total Payment</p>
              <p className={`mt-2 font-headline font-black tracking-[-0.06em] text-white ${compact ? "text-[2.5rem] leading-none" : "text-4xl"}`}>{formatCurrency(total)}</p>
            </div>
            <div className={`rounded-full bg-white/12 font-black text-white/72 ${compact ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"}`}>{selectedPaymentLabel}</div>
          </div>

          <div className={`grid grid-cols-2 gap-3 ${compact ? "mt-4" : "mt-5"}`}>
            {paymentMethods.map((paymentMethod) => (
              <button
                key={paymentMethod.type}
                onClick={() => setSelectedPayment(paymentMethod.type)}
                className={`${compact ? "rounded-[20px] px-3 py-2.5 text-[13px]" : "rounded-[24px] px-3 py-3 text-sm"} font-black transition ${
                  selectedPayment === paymentMethod.type
                    ? "bg-white text-[#a277ff] shadow-[0_18px_40px_-26px_rgba(255,255,255,0.72)]"
                    : "border border-white/12 bg-white/10 text-white/82 hover:bg-white/16"
                }`}
                type="button"
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">{paymentMethod.icon}</span>
                  {paymentMethod.label}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handleCharge}
            disabled={items.length === 0 || isProcessing}
            className={`flex w-full items-center justify-between bg-white text-left text-[#a277ff] shadow-[0_24px_52px_-32px_rgba(255,255,255,0.78)] hover:-translate-y-0.5 disabled:opacity-55 ${compact ? "mt-4 rounded-[22px] px-4 py-3" : "mt-5 rounded-[26px] px-5 py-4"}`}
            type="button"
          >
            <span className={`font-headline font-black ${compact ? "text-[1.7rem]" : "text-2xl"}`}>
              {isProcessing ? "Processing..." : "Charge"}
            </span>
            <span className={`flex items-center gap-2 font-headline font-black ${compact ? "text-[1.7rem]" : "text-2xl"}`}>
              {formatCurrency(total)}
              <span className={`material-symbols-outlined ${compact ? "text-[22px]" : "text-[24px]"}`}>arrow_forward</span>
            </span>
          </button>

          <div className={`grid grid-cols-2 gap-3 ${compact ? "mt-3.5" : "mt-4"}`}>
            <button
              className={`${compact ? "rounded-[18px] px-3 py-2.5 text-[13px]" : "rounded-[22px] px-4 py-3 text-sm"} border border-white/12 bg-white/10 font-black text-white/80 hover:bg-white/14`}
              onClick={() =>
                showToast({
                  title: "Hold order belum aktif",
                  description: "Kita bisa sambungkan fitur draft/hold setelah polish UI utama selesai.",
                  variant: "info",
                })
              }
              type="button"
            >
              <span className="flex items-center justify-center gap-2">
                <span className={`material-symbols-outlined ${compact ? "text-[17px]" : "text-[18px]"}`}>pause_circle</span>
                Hold
              </span>
            </button>
            <button
              onClick={clearCart}
              className={`${compact ? "rounded-[18px] px-3 py-2.5 text-[13px]" : "rounded-[22px] px-4 py-3 text-sm"} bg-white/12 font-black text-white/82 hover:bg-white/16`}
              type="button"
            >
              <span className="flex items-center justify-center gap-2">
                <span className={`material-symbols-outlined ${compact ? "text-[17px]" : "text-[18px]"}`}>delete_sweep</span>
                Clear
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
