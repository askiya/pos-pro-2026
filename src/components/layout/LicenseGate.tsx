"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { LICENSE_WHATSAPP_URL } from "@/lib/license";

interface LicenseGateProps {
  children: ReactNode;
}

interface LicenseSessionUser {
  role?: string;
  trialEndsAt?: string | null;
  licenseActive?: boolean;
}

type GateState = "checking" | "allowed" | "blocked";

export function LicenseGate({ children }: LicenseGateProps) {
  const [gateState, setGateState] = useState<GateState>("checking");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const checkLicense = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          if (!cancelled) {
            setGateState("allowed");
          }

          return;
        }

        const payload = (await response.json()) as LicenseSessionUser;
        const trialEndsAt = payload.trialEndsAt ? new Date(payload.trialEndsAt).getTime() : Number.NaN;
        const isExpired = Number.isFinite(trialEndsAt) && Date.now() > trialEndsAt;
        const shouldBlock =
          payload.role === "OWNER" &&
          isExpired &&
          payload.licenseActive !== true;

        if (!cancelled) {
          setGateState(shouldBlock ? "blocked" : "allowed");
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }

        if (!cancelled) {
          setGateState("allowed");
        }
      }
    };

    void checkLicense();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      // Create a 30 Days Premium Plan (Or 30 days trial extension via iPaymu)
      // Actually we will just pass plan_days=30 and amount=99000
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_days: 30, amount: 99000 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat sesi pembayaran");
      
      // Redirect to iPaymu Payment URL
      if (data.payment_url) {
        window.location.href = data.payment_url;
      }
    } catch (err: any) {
      alert(err.message);
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      {children}

      {gateState !== "allowed" ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020617]/92 p-6 text-center backdrop-blur-2xl">
          <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,#1e1b4b_0%,#0f172a_45%,#020617_100%)] p-8 shadow-[0_40px_140px_-50px_rgba(0,0,0,0.95)]">
            {gateState === "checking" ? (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-cyan-400/20 bg-cyan-400/10">
                  <span className="material-symbols-outlined animate-pulse text-3xl text-cyan-300">verified_user</span>
                </div>
                <h1 className="mt-6 text-2xl font-black text-white">Memeriksa Status Lisensi</h1>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  Tunggu sebentar, kami sedang memastikan masa trial dan lisensi akun Anda.
                </p>
              </>
            ) : (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-red-500/40 bg-red-500/10">
                  <span className="material-symbols-outlined text-3xl text-red-400">lock</span>
                </div>
                <h1 className="mt-6 text-2xl font-black text-white">Masa Trial Anda Telah Habis</h1>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  Masa percobaan gratis 7 hari sudah berakhir. Untuk membuka kembali dashboard POS PRO V2, silakan perpanjang lisensi Anda secara instan.
                </p>
                
                <div className="mt-8 space-y-3">
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-4 text-sm font-bold text-white transition-all hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {isCheckingOut ? 'hourglass_empty' : 'payments'}
                    </span>
                    {isCheckingOut ? 'Memproses...' : 'Perpanjang 30 Hari (Rp 99.000)'}
                  </button>
                  
                  <a
                    href={LICENSE_WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/5 px-4 py-4 text-sm font-bold text-white transition-all hover:bg-white/10"
                  >
                    <span className="material-symbols-outlined text-[20px]">chat</span>
                    Hubungi Admin via WhatsApp
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
