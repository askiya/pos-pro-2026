"use client";

import { createContext, useContext, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type ToastVariant = "success" | "error" | "info";

type Toast = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastContextValue = {
  showToast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const variantStyles: Record<ToastVariant, string> = {
  success: "border-[#4edea3]/30 bg-[#e6f5f0] text-[#005236]",
  error: "border-error-container bg-error-container/60 text-on-error-container",
  info: "border-secondary/20 bg-surface-container-highest text-on-surface",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const lastToastRef = useRef<{ signature: string; at: number } | null>(null);

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast: ({ title, description, variant = "info" }) => {
        const signature = `${variant}:${title}:${description ?? ""}`;
        const now = Date.now();

        if (
          lastToastRef.current?.signature === signature &&
          now - lastToastRef.current.at < 1600
        ) {
          return;
        }

        lastToastRef.current = { signature, at: now };

        const id = crypto.randomUUID();
        setToasts((current) => [
          ...current.slice(-2),
          { id, title, description, variant },
        ]);

        window.setTimeout(() => {
          setToasts((current) => current.filter((toast) => toast.id !== id));
        }, 3600);
      },
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              className={`relative pointer-events-auto overflow-hidden rounded-[22px] border px-4 py-3 shadow-[0_24px_60px_-28px_rgba(19,27,46,0.4)] backdrop-blur-xl ${variantStyles[toast.variant]}`}
              initial={{ opacity: 0, y: -18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="absolute inset-x-6 top-0 h-px bg-white/65" />
              <p className="font-headline text-sm font-bold">{toast.title}</p>
              {toast.description ? (
                <p className="mt-1 text-xs font-body opacity-90">{toast.description}</p>
              ) : null}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }

  return context;
}
