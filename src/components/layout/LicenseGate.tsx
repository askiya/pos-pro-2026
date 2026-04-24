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
                  Masa percobaan gratis 7 hari sudah berakhir. Untuk membuka kembali dashboard POS PRO V2, silakan hubungi admin untuk aktivasi lisensi.
                </p>
                <a
                  href={LICENSE_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-4 text-sm font-bold text-white transition-all hover:from-green-400 hover:to-emerald-500"
                >
                  <span className="material-symbols-outlined text-[20px]">chat</span>
                  Hubungi Admin via WhatsApp
                </a>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
