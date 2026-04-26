"use client";

import Link from "next/link";

import ResponsiveLayout from "@/components/layout/ResponsiveLayout";
import {
  ACTIVATION_REQUIREMENTS,
  APP_OWNER_LINKS,
  APP_OWNER_PROFILE,
  REFUND_POLICY,
  SOCIAL_LINKS,
  SUBSCRIPTION_MODEL,
  SUPPORT_FAQS,
  TRIAL_POLICY,
} from "@/lib/app-owner";

export default function SupportPage() {
  return (
    <ResponsiveLayout>
      <div className="h-full min-h-0 overflow-y-auto bg-[#fcfbff] px-4 py-6 md:px-8 md:py-8 lg:px-12">
        <div className="mx-auto max-w-[1260px] space-y-6">
          <section className="relative overflow-hidden rounded-2xl border border-white/70 bg-[linear-gradient(135deg,#271744_0%,#5d43a5_48%,#9f7cff_100%)] px-6 py-7 text-white shadow-[0_24px_80px_-44px_rgba(39,23,68,0.68)] md:px-8">
            <div className="absolute inset-y-0 right-0 w-[38%] bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_62%)]" />
            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-white/80">
                  <span className="material-symbols-outlined text-[16px]">support_agent</span>
                  Support & Billing Desk
                </div>
                <h1 className="mt-4 font-headline text-3xl font-black tracking-[-0.06em] text-white sm:text-5xl">
                  Semua jalur resmi untuk menghubungi pemilik aplikasi.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
                  Halaman ini merangkum kontak resmi developer, model langganan, kebijakan trial, dan alur aktivasi billing agar pemilik usaha bisa langsung menghubungi channel yang tepat.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <HeroMetric label="Developer" value={APP_OWNER_PROFILE.studioName} icon="code" />
                <HeroMetric label="Respon Support" value={APP_OWNER_PROFILE.supportResponseTime} icon="bolt" />
                <HeroMetric label="Billing" value="Manual Activation" icon="workspace_premium" />
                <HeroMetric label="Alamat" value={APP_OWNER_PROFILE.address} icon="location_on" />
              </div>
            </div>
          </section>

          <div className="grid gap-4 xl:grid-cols-[0.95fr_1.3fr]">
            <div className="space-y-6">
              <section className="app-surface rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#f5edff_0%,#e0e5ff_100%)] text-[#a277ff] shadow-inner">
                    <span className="material-symbols-outlined text-[28px]">deployed_code</span>
                  </div>
                  <div>
                    <h2 className="font-headline text-xl font-black text-on-surface">{APP_OWNER_PROFILE.studioName}</h2>
                    <p className="mt-1 text-sm font-semibold text-primary">Developer: {APP_OWNER_PROFILE.developerName}</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  <InfoRow label="Produk" value={APP_OWNER_PROFILE.appName} icon="point_of_sale" />
                  <InfoRow label="Alamat" value={APP_OWNER_PROFILE.address} icon="location_on" />
                  <InfoRow label="Website" value={APP_OWNER_PROFILE.websiteLabel} icon="language" href={APP_OWNER_LINKS.website} />
                </div>
              </section>

              <section className="app-surface rounded-xl p-6 shadow-sm">
                <h2 className="font-headline text-lg font-black text-on-surface">Kontak Resmi</h2>
                <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                  Gunakan channel di bawah ini untuk aktivasi, perpanjangan, pertanyaan teknis, atau permintaan bantuan terkait penggunaan aplikasi.
                </p>

                <div className="mt-5 space-y-3">
                  <ContactCard
                    title="WhatsApp Utama"
                    value={APP_OWNER_PROFILE.primaryWhatsapp}
                    href={APP_OWNER_LINKS.primaryWhatsapp}
                    icon="forum"
                    accent="green"
                  />
                  <ContactCard
                    title="WhatsApp Cadangan"
                    value={APP_OWNER_PROFILE.backupWhatsapp}
                    href={APP_OWNER_LINKS.backupWhatsapp}
                    icon="support_agent"
                    accent="indigo"
                  />
                  <ContactCard
                    title="Email Utama"
                    value={APP_OWNER_PROFILE.primaryEmail}
                    href={APP_OWNER_LINKS.primaryEmail}
                    icon="mail"
                    accent="slate"
                  />
                  <ContactCard
                    title="Email Billing"
                    value={APP_OWNER_PROFILE.billingEmail}
                    href={APP_OWNER_LINKS.billingEmail}
                    icon="alternate_email"
                    accent="amber"
                  />
                </div>
              </section>

              <section className="app-surface rounded-xl p-6 shadow-sm">
                <h2 className="font-headline text-lg font-black text-on-surface">Sosial & Profil Online</h2>
                <div className="mt-5 grid gap-3">
                  {SOCIAL_LINKS.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-[20px] border border-outline-variant/12 bg-surface-container-low px-4 py-3 transition hover:bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#7c3aed] shadow-sm">
                          <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant/70">{item.label}</p>
                          <p className="text-sm font-semibold text-on-surface">{item.value}</p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-on-surface-variant">open_in_new</span>
                    </a>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="app-surface rounded-xl p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8657ea]">Billing Model</p>
                    <h2 className="mt-2 font-headline text-2xl font-black text-on-surface">{SUBSCRIPTION_MODEL.title}</h2>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-on-surface-variant">
                      {SUBSCRIPTION_MODEL.summary}
                    </p>
                  </div>
                  <div className="rounded-full bg-[#f5edff] px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[#7c3aed]">
                    Full Feature Access
                  </div>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <PanelCard title="Cara Aktivasi" icon="flash_on">
                    <p className="text-sm leading-7 text-on-surface-variant">{SUBSCRIPTION_MODEL.activation}</p>
                    <p className="mt-3 text-sm leading-7 text-on-surface-variant">{SUBSCRIPTION_MODEL.paymentGatewayNote}</p>
                  </PanelCard>
                  <PanelCard title="Data yang Perlu Disiapkan" icon="assignment">
                    <ul className="space-y-2 text-sm leading-6 text-on-surface-variant">
                      {ACTIVATION_REQUIREMENTS.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="material-symbols-outlined mt-0.5 text-[18px] text-[#7c3aed]">task_alt</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </PanelCard>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={APP_OWNER_LINKS.primaryWhatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#059669_0%,#10b981_100%)] px-5 py-4 text-sm font-black text-white shadow-[0_18px_42px_-24px_rgba(16,185,129,0.84)] transition hover:scale-[1.01]"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                    {SUBSCRIPTION_MODEL.whatsAppCta}
                  </a>
                  <a
                    href={APP_OWNER_LINKS.billingEmail}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant/15 bg-white px-5 py-4 text-sm font-black text-on-surface transition hover:bg-slate-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">mail</span>
                    {SUBSCRIPTION_MODEL.emailCta}
                  </a>
                </div>
              </section>

              <div className="grid gap-4 lg:grid-cols-2">
                <section className="app-surface rounded-xl p-6 shadow-sm">
                  <h2 className="font-headline text-lg font-black text-on-surface">Kebijakan Trial</h2>
                  <ul className="mt-5 space-y-3 text-sm leading-7 text-on-surface-variant">
                    {TRIAL_POLICY.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="material-symbols-outlined mt-1 text-[18px] text-amber-600">verified</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="app-surface rounded-xl p-6 shadow-sm">
                  <h2 className="font-headline text-lg font-black text-on-surface">Kebijakan Refund</h2>
                  <ul className="mt-5 space-y-3 text-sm leading-7 text-on-surface-variant">
                    {REFUND_POLICY.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="material-symbols-outlined mt-1 text-[18px] text-rose-500">policy</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <section className="app-surface rounded-xl p-6 shadow-sm">
                <h2 className="font-headline text-lg font-black text-on-surface">FAQ Billing & Support</h2>
                <div className="mt-5 space-y-3">
                  {SUPPORT_FAQS.map((faq) => (
                    <details
                      key={faq.q}
                      className="group overflow-hidden rounded-xl border border-outline-variant/12 bg-surface-container-low [&_summary::-webkit-details-marker]:hidden"
                    >
                      <summary className="flex cursor-pointer items-center justify-between gap-4 p-4 text-sm font-black text-on-surface outline-none transition hover:bg-white">
                        {faq.q}
                        <span className="material-symbols-outlined text-on-surface-variant transition-transform group-open:rotate-180">
                          expand_more
                        </span>
                      </summary>
                      <div className="px-4 pb-4 text-sm leading-7 text-on-surface-variant">{faq.a}</div>
                    </details>
                  ))}
                </div>
              </section>

              <section className="overflow-hidden rounded-xl border border-[#d2d9f4] bg-[linear-gradient(135deg,#fcfbff_0%,#f4f6ff_100%)] p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="max-w-2xl">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8657ea]">Panduan Penggunaan</p>
                    <h2 className="mt-2 font-headline text-2xl font-black text-on-surface">Butuh panduan sebelum menghubungi support?</h2>
                    <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                      Dokumentasi digital membantu kamu memahami setup toko, kasir, inventaris, dan laporan lebih cepat sebelum aktivasi atau onboarding lanjutan.
                    </p>
                  </div>
                  <Link
                    href="/docs"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-black text-on-surface shadow-sm transition hover:bg-[#f8f6ff]"
                  >
                    Baca Dokumentasi
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}

function HeroMetric({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="min-w-[180px] rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/65">
        <span className="material-symbols-outlined text-[16px]">{icon}</span>
        {label}
      </div>
      <div className="mt-2 text-sm font-bold leading-6 text-white">{value}</div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  icon,
  href,
}: {
  label: string;
  value: string;
  icon: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-3 rounded-[20px] border border-outline-variant/12 bg-surface-container-low px-4 py-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#7c3aed] shadow-sm">
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-on-surface-variant/70">{label}</p>
        <p className="truncate text-sm font-semibold text-on-surface">{value}</p>
      </div>
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <a href={href} target="_blank" rel="noreferrer">
      {content}
    </a>
  );
}

function ContactCard({
  title,
  value,
  href,
  icon,
  accent,
}: {
  title: string;
  value: string;
  href: string;
  icon: string;
  accent: "green" | "indigo" | "slate" | "amber";
}) {
  const accentClass =
    accent === "green"
      ? "bg-[#e1f7ee] text-[#047857]"
      : accent === "amber"
        ? "bg-[#fff3dd] text-[#b45309]"
        : accent === "indigo"
          ? "bg-[#f5edff] text-[#7c3aed]"
          : "bg-surface-container text-on-surface";

  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className="flex items-center gap-4 rounded-xl border border-outline-variant/12 bg-surface-container-low px-4 py-3 transition hover:bg-white"
    >
      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${accentClass}`}>
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant/70">{title}</p>
        <p className="mt-1 text-sm font-semibold text-on-surface">{value}</p>
      </div>
    </a>
  );
}

function PanelCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-outline-variant/12 bg-surface-container-low p-5">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant/70">
        <span className="material-symbols-outlined text-[16px]">{icon}</span>
        {title}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

