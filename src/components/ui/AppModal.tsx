"use client";

import { AnimatePresence, motion } from "framer-motion";

type AppModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: string;
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
};

const sizeClasses: Record<NonNullable<AppModalProps["size"]>, string> = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
};

export function AppModal({
  open,
  onClose,
  title,
  description,
  icon = "dashboard_customize",
  size = "md",
  children,
}: AppModalProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            aria-label="Close modal"
            className="absolute inset-0 bg-[#0f1330]/35 backdrop-blur-md"
            onClick={onClose}
            type="button"
          />

          <motion.div
            className={`relative z-[91] flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-[30px] border border-white bg-white shadow-[0_36px_120px_-40px_rgba(39, 23, 68,0.55)] ${sizeClasses[size]}`}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="pointer-events-none absolute inset-x-10 top-0 h-24 rounded-full bg-gradient-to-r from-secondary/20 via-white/70 to-tertiary-fixed/20 blur-3xl" />
            <div className="relative flex items-start justify-between gap-4 border-b border-outline-variant/15 px-6 py-5 md:px-7">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-secondary-container text-white shadow-[0_18px_40px_-24px_rgba(162, 119, 255,0.9)]">
                  <span className="material-symbols-outlined text-[22px]">{icon}</span>
                </div>
                <div className="min-w-0">
                  <h2 className="font-headline text-xl font-bold text-on-surface md:text-2xl">{title}</h2>
                  {description ? (
                    <p className="mt-1 max-w-2xl text-sm text-on-surface-variant">{description}</p>
                  ) : null}
                </div>
              </div>
              <button
                className="app-icon-btn shrink-0"
                onClick={onClose}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="relative overflow-y-auto px-6 py-6 md:px-7 md:py-7">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
