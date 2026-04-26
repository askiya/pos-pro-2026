"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import ResponsiveLayout from "@/components/layout/ResponsiveLayout";
import { getApiErrorMessage, readApiPayload, toApiObject } from "@/lib/client-api";
import { formatDate, formatDateTime } from "@/lib/format";
import { getLicenseSummary, LICENSE_WHATSAPP_URL } from "@/lib/license";
import {
  ACTIVATION_REQUIREMENTS,
  APP_OWNER_LINKS,
  APP_OWNER_PROFILE,
  REFUND_POLICY,
  SUBSCRIPTION_FEATURES,
  SUBSCRIPTION_MODEL,
  TRIAL_POLICY,
} from "@/lib/app-owner";

interface BillingSession {
  id: string;
  name: string;
  email: string;
  role: string;
  trialEndsAt?: string | null;
  licenseActive?: boolean;
  createdAt?: string;
}

const trialFeatures = [
  "Akses dashboard owner dan seluruh modul inti",
  "Trial aktif otomatis selama 7 hari sejak akun dibuat",
  "Cocok untuk uji alur kasir, stok, dan laporan",
];

export default function BillingPage() {
  const [session, setSession] = useState<BillingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_days: 30, amount: 99000 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat sesi pembayaran");
      
      if (data.payment_url) {
        window.location.href = data.payment_url;
      }
    } catch (err: unknown) {
      alert((err as Error).message);
      setIsCheckingOut(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadBilling = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/auth/session", { cache: "no-store" });
        const payload = await readApiPayload(response);

        if (!response.ok) {
          throw new Error(getApiErrorMessage(payload, "Status billing belum bisa dimuat."));
        }

        const nextSession = toApiObject<BillingSession>(payload);
        if (!nextSession) {
          throw new Error("Payload session billing tidak valid.");
        }

        if (!cancelled) {
          setSession(nextSession);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Status billing belum bisa dimuat.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadBilling();

    return () => {
      cancelled = true;
    };
  }, []);

  const licenseSummary = useMemo(() => getLicenseSummary(session), [session]);
  const trialEndText = session?.trialEndsAt ? formatDateTime(session.trialEndsAt) : "Belum ada tanggal trial";
  const onboardingDateText = session?.createdAt ? formatDate(session.createdAt) : "Belum tercatat";
  const trialCounterText = licenseSummary.isTrialActive
    ? `${licenseSummary.trialDaysLeft} hari`
    : licenseSummary.isLicensed
      ? "Aktif penuh"
      : "0 hari";
  const progressValue = licenseSummary.trialProgressPercent ?? (licenseSummary.isLicensed ? 100 : 0);

  return (
    <ResponsiveLayout>
      <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto pr-1">
        <section className="relative overflow-hidden rounded-2xl border border-white/70 bg-[linear-gradient(135deg,#1f1638_0%,#6f51c6_58%,#9c7bff_100%)] px-6 py-6 text-white shadow-[0_24px_80px_-42px_rgba(39,23,68,0.58)]">
          <div className="absolute inset-y-0 right-0 w-[38%] bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_62%)]" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-white/80">
                <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
                Billing & License Center
              </div>
              <h1 className="mt-4 font-headline text-3xl font-black tracking-[-0.06em] text-white sm:text-5xl">
                Pantau trial dan aktivasi langganan full access.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
                {SUBSCRIPTION_MODEL.summary} {SUBSCRIPTION_MODEL.paymentGatewayNote}
              </p>
            </div>

            <div className="relative min-w-[290px] rounded-xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/65">Status Saat Ini</div>
                  <div className="mt-2 font-headline text-2xl font-black text-white">
                    {licenseSummary.statusLabel}
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${toneBadgeClass(licenseSummary.tone)}`}>
                  {licenseSummary.badgeLabel}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <MiniMetric label="Akun Owner" value={session?.email ?? "Memuat..."} />
                <MiniMetric label="Billing" value={APP_OWNER_PROFILE.billingEmail} />
              </div>
            </div>
          </div>
        </section>

        {error ? (
          <section className="rounded-xl border border-rose-200 bg-rose-50/80 px-5 py-4 text-sm text-rose-700">
            {error}
          </section>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-4">
          <BillingMetricCard
            label="Status Langganan"
            value={loading ? "Memuat..." : licenseSummary.statusLabel}
            helper="Kondisi akun owner saat ini"
            tone={licenseSummary.tone}
            icon="verified"
          />
          <BillingMetricCard
            label="Paket Saat Ini"
            value={loading ? "Memuat..." : licenseSummary.currentPlan}
            helper="Paket yang sedang berlaku"
            tone="indigo"
            icon="workspace_premium"
          />
          <BillingMetricCard
            label="Sisa Trial"
            value={loading ? "Memuat..." : trialCounterText}
            helper={licenseSummary.isTrialActive ? `${licenseSummary.trialHoursLeft} jam estimasi tersisa` : "Tidak ada sisa trial"}
            tone={licenseSummary.isLicensed ? "emerald" : licenseSummary.tone}
            icon="timelapse"
          />
          <BillingMetricCard
            label="Berakhir Pada"
            value={loading ? "Memuat..." : (licenseSummary.isLicensed ? "Lisensi aktif" : trialEndText)}
            helper={`Onboarding dimulai ${onboardingDateText}`}
            tone="slate"
            icon="event"
          />
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="rounded-2xl border border-white/70 bg-white/82 p-6 shadow-[0_20px_60px_-48px_rgba(39,23,68,0.4)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant/70">
                  Progress Trial
                </div>
                <h2 className="mt-2 font-headline text-xl font-black tracking-[-0.04em] text-on-surface">
                  {licenseSummary.isLicensed ? "Akun sudah di-upgrade penuh" : "Pantau sisa masa aktif sebelum lisensi dibeli"}
                </h2>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-black ${softToneClass(licenseSummary.tone)}`}>
                {licenseSummary.badgeLabel}
              </span>
            </div>

            <div className="mt-6 rounded-xl border border-outline-variant/12 bg-[#f8f6ff] p-5">
              <div className="flex items-center justify-between gap-3 text-sm font-semibold text-on-surface">
                <span>Penggunaan masa trial / status lisensi</span>
                <span>{progressValue}%</span>
              </div>
              <div className="mt-3 h-3 rounded-full bg-white">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${toneBarClass(licenseSummary.tone)} transition-all duration-500`}
                  style={{ width: `${Math.max(progressValue, 6)}%` }}
                />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <TimelineItem
                  label="Mulai Trial"
                  value={onboardingDateText}
                  icon="rocket_launch"
                />
                <TimelineItem
                  label="Akhir Trial"
                  value={licenseSummary.trialEndsAtDate ? formatDateTime(licenseSummary.trialEndsAtDate.toISOString()) : "Belum ada data"}
                  icon="event_busy"
                />
                <TimelineItem
                  label="Aksi Berikutnya"
                  value={licenseSummary.isLicensed ? "Pantau operasional" : "Aktivasi lisensi"}
                  icon="bolt"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/70 bg-white/82 p-6 shadow-[0_20px_60px_-48px_rgba(39,23,68,0.4)]">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant/70">
              Tindakan Cepat
            </div>
            <h2 className="mt-2 font-headline text-xl font-black tracking-[-0.04em] text-on-surface">
              Aktivasi dan kontrol langganan
            </h2>
            <p className="mt-2 text-sm leading-7 text-on-surface-variant">
              Gunakan panel ini untuk menghubungi developer, menindaklanjuti aktivasi billing, atau meminta perpanjangan akses aplikasi.
            </p>

            <div className="mt-5 flex flex-col gap-3">
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#7c3aed_0%,#4f46e5_100%)] px-4 py-4 text-sm font-black text-white shadow-[0_18px_46px_-26px_rgba(124,58,237,0.82)] transition hover:scale-[1.01] disabled:opacity-50"
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
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#059669_0%,#10b981_100%)] px-4 py-4 text-sm font-black text-white shadow-[0_18px_46px_-26px_rgba(16,185,129,0.82)] transition hover:scale-[1.01]"
              >
                <span className="material-symbols-outlined text-[20px]">chat</span>
                {SUBSCRIPTION_MODEL.whatsAppCta}
              </a>
              <a
                href={APP_OWNER_LINKS.billingEmail}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant/15 bg-white px-4 py-4 text-sm font-black text-on-surface transition hover:bg-slate-50"
              >
                <span className="material-symbols-outlined text-[20px]">mail</span>
                {SUBSCRIPTION_MODEL.emailCta}
              </a>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant/15 bg-[#f8f6ff] px-4 py-4 text-sm font-black text-on-surface transition hover:bg-white"
              >
                <span className="material-symbols-outlined text-[20px]">dashboard</span>
                Kembali ke Dashboard
              </Link>
              <Link
                href="/support"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant/15 bg-white px-4 py-4 text-sm font-black text-on-surface transition hover:bg-slate-50"
              >
                <span className="material-symbols-outlined text-[20px]">support_agent</span>
                Buka Support Center
              </Link>
            </div>

            <div className="mt-5 rounded-xl border border-outline-variant/12 bg-[#fcfbff] p-4">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant/70">
                Ringkasan Billing
              </div>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-on-surface-variant">
                <li>{SUBSCRIPTION_MODEL.activation}</li>
                <li>{TRIAL_POLICY[0]}</li>
                <li>{SUBSCRIPTION_MODEL.paymentGatewayNote}</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr_1fr_1.1fr]">
          <PlanCard
            eyebrow="Paket Trial"
            title="Free Trial 7 Hari"
            price="Gratis"
            tone="amber"
            active={licenseSummary.stage === "trial_active"}
            features={trialFeatures}
          />
          <PlanCard
            eyebrow="Paket Berbayar"
            title={SUBSCRIPTION_MODEL.title}
            price="Hubungi Developer"
            tone="emerald"
            active={licenseSummary.stage === "licensed"}
            features={[...SUBSCRIPTION_FEATURES]}
          />
          <div className="rounded-2xl border border-white/70 bg-white/82 p-6 shadow-[0_20px_60px_-48px_rgba(39,23,68,0.4)]">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant/70">
              Kontak Resmi
            </div>
            <h2 className="mt-2 font-headline text-xl font-black tracking-[-0.04em] text-on-surface">
              Hubungi pemilik aplikasi
            </h2>

            <div className="mt-5 space-y-3">
              <ContactRow icon="forum" label="WhatsApp Utama" value={APP_OWNER_PROFILE.primaryWhatsapp} href={APP_OWNER_LINKS.primaryWhatsapp} />
              <ContactRow icon="call" label="WhatsApp Cadangan" value={APP_OWNER_PROFILE.backupWhatsapp} href={APP_OWNER_LINKS.backupWhatsapp} />
              <ContactRow icon="mail" label="Email Billing" value={APP_OWNER_PROFILE.billingEmail} href={APP_OWNER_LINKS.billingEmail} />
              <ContactRow icon="alternate_email" label="Email Utama" value={APP_OWNER_PROFILE.primaryEmail} href={APP_OWNER_LINKS.primaryEmail} />
            </div>

            <div className="mt-5 rounded-xl border border-outline-variant/12 bg-[#fcfbff] p-4">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant/70">
                Data yang Perlu Disiapkan
              </div>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-on-surface-variant">
                {ACTIVATION_REQUIREMENTS.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="material-symbols-outlined mt-0.5 text-[18px] text-[#7c3aed]">check_circle</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 rounded-xl border border-outline-variant/12 bg-[#fff9f0] p-4">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant/70">
                Refund Singkat
              </div>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-on-surface-variant">
                {REFUND_POLICY.slice(0, 2).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </ResponsiveLayout>
  );
}

function BillingMetricCard({
  label,
  value,
  helper,
  icon,
  tone,
}: {
  label: string;
  value: string;
  helper: string;
  icon: string;
  tone: "indigo" | "emerald" | "amber" | "rose" | "slate";
}) {
  return (
    <section className="rounded-xl border border-white/70 bg-white/82 p-5 shadow-[0_20px_60px_-48px_rgba(39,23,68,0.4)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant/70">{label}</div>
          <div className="mt-3 font-headline text-xl font-black tracking-[-0.05em] text-on-surface">{value}</div>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${softToneClass(tone)}`}>
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-on-surface-variant">{helper}</p>
    </section>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2">
      <div className="text-[11px] uppercase tracking-[0.18em] text-white/65">{label}</div>
      <div className="mt-1 text-sm font-bold text-white">{value}</div>
    </div>
  );
}

function TimelineItem({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-xl border border-outline-variant/12 bg-white px-4 py-4">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant/70">
        <span className="material-symbols-outlined text-[16px]">{icon}</span>
        {label}
      </div>
      <div className="mt-2 text-sm font-bold text-on-surface">{value}</div>
    </div>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: string;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="flex items-center gap-3 rounded-xl border border-outline-variant/12 bg-[#fcfbff] px-4 py-3 transition hover:bg-white"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f5edff] text-[#7c3aed]">
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-on-surface-variant/70">{label}</div>
        <div className="truncate text-sm font-bold text-on-surface">{value}</div>
      </div>
    </a>
  );
}

function PlanCard({
  eyebrow,
  title,
  price,
  tone,
  active,
  features,
}: {
  eyebrow: string;
  title: string;
  price: string;
  tone: "emerald" | "amber";
  active?: boolean;
  features: string[];
}) {
  return (
    <section className="rounded-2xl border border-white/70 bg-white/82 p-6 shadow-[0_20px_60px_-48px_rgba(39,23,68,0.4)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant/70">{eyebrow}</div>
          <h2 className="mt-2 font-headline text-xl font-black tracking-[-0.04em] text-on-surface">{title}</h2>
        </div>
        {active ? (
          <span className={`rounded-full px-3 py-1 text-xs font-black ${softToneClass(tone)}`}>
            Aktif sekarang
          </span>
        ) : null}
      </div>

      <div className="mt-5 font-headline text-3xl font-black tracking-[-0.05em] text-on-surface">{price}</div>

      <ul className="mt-5 space-y-3 text-sm leading-6 text-on-surface-variant">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <span className={`material-symbols-outlined mt-0.5 text-[18px] ${tone === "emerald" ? "text-emerald-600" : "text-amber-600"}`}>
              check_circle
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function softToneClass(tone: "indigo" | "emerald" | "amber" | "rose" | "slate") {
  if (tone === "emerald") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (tone === "amber") {
    return "bg-amber-50 text-amber-700";
  }

  if (tone === "rose") {
    return "bg-rose-50 text-rose-700";
  }

  if (tone === "indigo") {
    return "bg-[#f5edff] text-[#7c3aed]";
  }

  return "bg-slate-100 text-slate-700";
}

function toneBadgeClass(tone: "indigo" | "emerald" | "amber" | "rose" | "slate") {
  if (tone === "emerald") {
    return "bg-emerald-500/20 text-emerald-50";
  }

  if (tone === "amber") {
    return "bg-amber-400/20 text-amber-50";
  }

  if (tone === "rose") {
    return "bg-rose-400/20 text-rose-50";
  }

  if (tone === "indigo") {
    return "bg-white/15 text-white";
  }

  return "bg-slate-200/80 text-slate-800";
}

function toneBarClass(tone: "indigo" | "emerald" | "amber" | "rose" | "slate") {
  if (tone === "emerald") {
    return "from-emerald-500 to-lime-400";
  }

  if (tone === "amber") {
    return "from-amber-500 to-orange-400";
  }

  if (tone === "rose") {
    return "from-rose-500 to-pink-400";
  }

  if (tone === "indigo") {
    return "from-[#7c3aed] to-[#a277ff]";
  }

  return "from-slate-500 to-slate-400";
}

