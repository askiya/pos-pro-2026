"use client";

import type { FormEvent, ReactNode } from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { BrandLockup } from "@/components/branding/BrandLogo";
import { useToast } from "@/components/ui/ToastProvider";
import { getApiErrorMessage, readApiPayload, toApiObject } from "@/lib/client-api";
import { APP_OWNER_LINKS, APP_OWNER_PROFILE, SUBSCRIPTION_FEATURES, SUBSCRIPTION_MODEL } from "@/lib/app-owner";

function Navbar({ onLoginClick }: { onLoginClick: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#0A0F1F]/80 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]' : 'bg-transparent py-2'}`}>
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
        <BrandLockup
          showSubtitle={false}
          titleClassName="text-xl font-black tracking-tighter text-white"
          markSizeClassName="h-8 w-8"
          markClassName="rounded-lg bg-gradient-to-br from-[#2C21A0] to-[#8B5CF6] p-1 shadow-[0_0_15px_rgba(139,92,246,0.5)]"
        />
        <div className="hidden lg:flex space-x-6 items-center">
          {["Fitur", "Modul", "Cara Kerja", "Harga", "Testimoni", "FAQ"].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`} className="text-sm font-medium text-slate-300 hover:text-[#22D3EE] transition-colors">
              {item}
            </a>
          ))}
        </div>
        <div className="flex space-x-4 items-center">
          <button onClick={onLoginClick} className="hidden md:block text-sm font-medium text-slate-300 hover:text-white transition-colors">Mulai Trial 7 Hari</button>
        </div>
      </div>
    </nav>
  );
}

function MaybeGoogleProvider({
  clientId,
  children,
}: {
  clientId: string;
  children: ReactNode;
}) {
  if (!clientId) {
    return <>{children}</>;
  }

  return <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>;
}

function HeroSection({
  googleEnabled,
  onTrialClick,
}: {
  googleEnabled: boolean;
  onTrialClick: () => void;
}) {
  return (
    <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto relative z-10">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#2C21A0]/50 bg-[#2C21A0]/20 text-[#8B5CF6] text-xs font-bold tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-[#22D3EE] animate-pulse"></span>
            Laravel Based â€¢ Siap Scale
          </div>
          <h1 className="text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
            Dashboard yang lebih <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE]">cepat</span>, jelas, dan siap dipakai tim cabang.
          </h1>
          <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
            Pantau sales, transaksi, stok kritis, performa kasir, dan aksi operasional dari satu layar dengan tampilan modern yang terasa premium.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4 items-center">
            <button
              onClick={onTrialClick}
              className="rounded-full bg-gradient-to-r from-[#2C21A0] to-[#534dc6] px-6 py-3 text-sm font-black text-white shadow-[0_18px_40px_-24px_rgba(83,77,198,0.65)] hover:scale-[1.02] transition-transform"
              type="button"
            >
              Buka Akses Trial
            </button>
            <span className="max-w-sm text-center text-sm text-slate-400 sm:text-left">
              {googleEnabled
                ? "Pilih daftar manual dengan username/password atau lanjut cepat memakai Google."
                : "Daftar manual sudah siap. Google login bisa diaktifkan kapan saja setelah client ID diisi."}
            </span>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
          className="relative lg:h-[600px] flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-[#2C21A0]/30 to-[#22D3EE]/20 rounded-full blur-[100px] opacity-60 animate-pulse-soft"></div>
          
          <div className="cyber-glass-panel rounded-2xl p-2 relative z-10 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform lg:rotate-2 hover:rotate-0 transition-transform duration-700 w-full">
            <div className="bg-[#0A0F1F] rounded-xl overflow-hidden border border-white/5 relative">
              {/* Fake window controls */}
              <div className="h-8 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
              </div>
              {/* Mockup content */}
              <div className="p-6 grid grid-cols-3 gap-4">
                <div className="col-span-1 space-y-4">
                  <div className="h-8 bg-white/5 rounded-lg w-3/4"></div>
                  <div className="space-y-2">
                    {[1,2,3,4,5].map(i => <div key={i} className="h-6 bg-white/5 rounded-md w-full"></div>)}
                  </div>
                </div>
                <div className="col-span-2 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 cyber-glass-panel rounded-xl p-4 flex flex-col justify-between">
                      <div className="w-8 h-8 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center material-symbols-outlined text-sm">trending_up</div>
                      <div className="h-4 bg-white/10 rounded w-1/2"></div>
                    </div>
                    <div className="h-24 cyber-glass-panel rounded-xl p-4 flex flex-col justify-between">
                      <div className="w-8 h-8 rounded-full bg-[#FF8A4C]/20 text-[#FF8A4C] flex items-center justify-center material-symbols-outlined text-sm">inventory_2</div>
                      <div className="h-4 bg-white/10 rounded w-2/3"></div>
                    </div>
                  </div>
                  <div className="h-40 cyber-glass-panel rounded-xl p-4 flex items-end gap-2">
                    {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                      <div key={i} className="w-full bg-gradient-to-t from-[#2C21A0] to-[#22D3EE] rounded-t-sm opacity-80" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -left-10 top-1/4 cyber-glass-panel rounded-xl p-4 flex items-center gap-3 shadow-2xl border border-[#22D3EE]/30">
              <div className="w-10 h-10 rounded-full bg-[#22D3EE]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#22D3EE]">payments</span>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 tracking-wider">OMZET HARI INI</div>
                <div className="text-white font-black">Rp 45.2M</div>
              </div>
            </motion.div>

            <motion.div animate={{ y: [10, -10, 10] }} transition={{ duration: 5, repeat: Infinity }} className="absolute -right-6 bottom-1/4 cyber-glass-panel rounded-xl p-4 flex items-center gap-3 shadow-2xl border border-[#10B981]/30">
              <div className="w-10 h-10 rounded-full bg-[#10B981]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#10B981]">check_circle</span>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 tracking-wider">UPTIME</div>
                <div className="text-white font-black">99.9%</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

type TrialAuthStep = "choice" | "login" | "register" | "success";

type LoginCredentials = {
  identifier: string;
  password: string;
};

type RegisterCredentials = {
  name: string;
  username: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

type AuthFieldErrors = Partial<
  Record<
    "identifier" | "password" | "name" | "username" | "email" | "passwordConfirmation" | "google",
    string
  >
>;

type AuthSuccessState = {
  title: string;
  description: string;
  redirectTo?: string;
  accent: "login" | "register" | "google";
  checklist: string[];
};

type AuthActionResult =
  | {
      ok: true;
      success: AuthSuccessState;
    }
  | {
      ok: false;
      message: string;
      fieldErrors?: AuthFieldErrors;
    };

function extractFieldErrors(payload: unknown): AuthFieldErrors {
  const record = toApiObject<Record<string, unknown>>(payload);
  const rawErrors = record ? toApiObject<Record<string, unknown>>(record.errors) : null;

  if (!rawErrors) {
    return {};
  }

  const normalized: AuthFieldErrors = {};

  for (const [key, value] of Object.entries(rawErrors)) {
    const message = Array.isArray(value)
      ? value.find((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
      : typeof value === "string" && value.trim().length > 0
        ? value
        : undefined;

    if (!message) {
      continue;
    }

    const mappedKey = key === "password_confirmation" ? "passwordConfirmation" : key;
    if (
      mappedKey === "identifier" ||
      mappedKey === "password" ||
      mappedKey === "name" ||
      mappedKey === "username" ||
      mappedKey === "email" ||
      mappedKey === "passwordConfirmation" ||
      mappedKey === "google"
    ) {
      normalized[mappedKey] = message;
    }
  }

  return normalized;
}

function validateLoginForm(credentials: LoginCredentials): AuthFieldErrors {
  const errors: AuthFieldErrors = {};

  if (!credentials.identifier.trim()) {
    errors.identifier = "Username atau email wajib diisi.";
  }

  if (!credentials.password.trim()) {
    errors.password = "Password wajib diisi.";
  }

  return errors;
}

function validateRegisterForm(credentials: RegisterCredentials): AuthFieldErrors {
  const errors: AuthFieldErrors = {};
  const username = credentials.username.trim().toLowerCase();
  const email = credentials.email.trim().toLowerCase();

  if (!credentials.name.trim()) {
    errors.name = "Nama lengkap wajib diisi.";
  }

  if (!username) {
    errors.username = "Username wajib diisi.";
  } else if (username.length < 3) {
    errors.username = "Username minimal 3 karakter.";
  } else if (!/^[a-z0-9._-]+$/.test(username)) {
    errors.username = "Gunakan huruf kecil, angka, titik, garis bawah, atau strip.";
  }

  if (!email) {
    errors.email = "Email wajib diisi.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Format email belum valid.";
  }

  if (!credentials.password) {
    errors.password = "Password wajib diisi.";
  } else if (credentials.password.length < 6) {
    errors.password = "Password minimal 6 karakter.";
  }

  if (!credentials.passwordConfirmation) {
    errors.passwordConfirmation = "Konfirmasi password wajib diisi.";
  } else if (credentials.passwordConfirmation !== credentials.password) {
    errors.passwordConfirmation = "Konfirmasi password harus sama.";
  }

  return errors;
}

function TrustBar() {
  return (
    <section className="py-10 border-y border-white/5 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="text-sm font-medium text-slate-500 tracking-widest uppercase mb-6">Dipercaya oleh 100+ cabang di Indonesia</p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale">
          {["Kopi Kenangan", "Minimarket Maju", "Apotek Sehat", "Toko Bangunan Jaya", "Super Indo"].map(brand => (
            <div key={brand} className="text-xl font-bold text-white font-headline">{brand}</div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureGrid() {
  const features = [
    { icon: "storefront", title: "Multi-Cabang", desc: "Pantau ribuan cabang dalam satu dashboard real-time tanpa delay sinkronisasi.", color: "#22D3EE" },
    { icon: "inventory_2", title: "Inventaris FIFO", desc: "Lacak pergerakan stok dengan akurasi tinggi menggunakan metode First In First Out.", color: "#8B5CF6" },
    { icon: "point_of_sale", title: "POS Kasir Cepat", desc: "Antarmuka kasir yang dioptimalkan untuk kecepatan transaksi saat jam sibuk.", color: "#10B981" },
    { icon: "payments", title: "PPOB Terintegrasi", desc: "Jual pulsa, token listrik, dan tagihan langsung dari mesin kasir Anda.", color: "#FF8A4C" },
    { icon: "groups", title: "CRM & Loyalitas", desc: "Kelola data pelanggan dan berikan poin reward otomatis tiap transaksi.", color: "#F43F5E" },
    { icon: "admin_panel_settings", title: "RBAC & Keamanan", desc: "Akses sesuai peran (Owner, Admin, Kasir) dengan riwayat aktivitas terekam.", color: "#3B82F6" },
    { icon: "analytics", title: "Laporan Real-Time", desc: "Analisa penjualan komprehensif dengan grafik interaktif dan export instan.", color: "#EAB308" },
    { icon: "local_shipping", title: "Manajemen Supplier", desc: "Buat Purchase Order dan pantau barang masuk dari supplier dengan rapi.", color: "#A855F7" },
  ];

  return (
    <section id="fitur" className="py-24 px-6 max-w-7xl mx-auto relative z-10">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Semua yang Kamu Butuhkan, dalam Satu Platform</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">Dirancang untuk mengatasi masalah data tersebar, stok tidak sinkron, dan kontrol cabang yang lemah.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <div key={i} className="cyber-glass-panel rounded-2xl p-6 cyber-glass-card-hover transition-all duration-300 group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: f.color, opacity: 0.7 }}></div>
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform" style={{ color: f.color }}>
              <span className="material-symbols-outlined text-[28px]">{f.icon}</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PricingSection({ onSubscribe }: { onSubscribe: () => void }) {
  return (
    <section id="harga" className="py-24 px-6 max-w-7xl mx-auto relative z-10">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Billing Full Access</h2>
        <p className="text-slate-400 max-w-3xl mx-auto">
          Tidak ada paket bertingkat. Setelah billing aktif, pengguna langsung mendapatkan seluruh fitur aplikasi dan durasi langganan mengikuti masa sewa yang disepakati bersama developer.
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="cyber-glass-panel rounded-[32px] border border-[#8B5CF6]/35 p-8 shadow-[0_0_30px_rgba(139,92,246,0.12)]">
          <div className="inline-flex items-center rounded-full border border-[#22D3EE]/30 bg-[#22D3EE]/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[#67e8f9]">
            Seluruh Fitur Aktif
          </div>
          <h3 className="mt-5 text-3xl font-black text-white">{SUBSCRIPTION_MODEL.title}</h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">{SUBSCRIPTION_MODEL.summary}</p>

          <div className="mt-7 rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Model Aktivasi</div>
            <div className="mt-3 text-4xl font-black tracking-[-0.05em] text-white">Hubungi Developer</div>
            <p className="mt-3 text-sm leading-7 text-slate-300">{SUBSCRIPTION_MODEL.paymentGatewayNote}</p>
          </div>

          <ul className="mt-7 space-y-3">
            {SUBSCRIPTION_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm text-slate-200">
                <span className="material-symbols-outlined mt-0.5 text-[#10B981] text-[18px]">check_circle</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={APP_OWNER_LINKS.primaryWhatsapp}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#10B981] to-[#22C55E] px-5 py-3 font-bold text-white transition-all hover:shadow-[0_0_18px_rgba(16,185,129,0.35)]"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              {SUBSCRIPTION_MODEL.whatsAppCta}
            </a>
            <a
              href={APP_OWNER_LINKS.billingEmail}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-3 font-bold text-white transition-all hover:bg-white/15"
            >
              <span className="material-symbols-outlined text-[18px]">mail</span>
              {SUBSCRIPTION_MODEL.emailCta}
            </a>
            <button
              onClick={onSubscribe}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#8B5CF6]/35 bg-[#8B5CF6]/15 px-5 py-3 font-bold text-white transition-all hover:bg-[#8B5CF6]/20"
            >
              <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
              Mulai Trial Dulu
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="cyber-glass-panel rounded-[28px] border border-white/10 p-6">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-[#22D3EE]">Kontak Resmi</div>
            <div className="mt-4 space-y-4">
              <InfoPill label="Brand" value={APP_OWNER_PROFILE.studioName} icon="apartment" />
              <InfoPill label="Developer" value={APP_OWNER_PROFILE.developerName} icon="code" />
              <InfoPill label="WhatsApp" value={APP_OWNER_PROFILE.primaryWhatsapp} icon="forum" />
              <InfoPill label="Email Billing" value={APP_OWNER_PROFILE.billingEmail} icon="alternate_email" />
            </div>
          </div>

          <div className="cyber-glass-panel rounded-[28px] border border-white/10 p-6">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-[#A78BFA]">Support</div>
            <h3 className="mt-3 text-xl font-black text-white">Bantuan langsung dari pemilik aplikasi</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Lokasi developer di {APP_OWNER_PROFILE.address}. Estimasi respon awal support saat ini {APP_OWNER_PROFILE.supportResponseTime.toLowerCase()}.
            </p>
            <a
              href={APP_OWNER_LINKS.website}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#67e8f9] hover:text-white"
            >
              Kunjungi {APP_OWNER_PROFILE.websiteLabel}
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoPill({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-[#67e8f9]">
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      </div>
      <div>
        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</div>
        <div className="text-sm font-semibold text-white">{value}</div>
      </div>
    </div>
  );
}

function ModuleEcosystemSection() {
  const modules = [
    { icon: "dashboard", name: "Dashboard Eksekutif" },
    { icon: "point_of_sale", name: "POS Cashier" },
    { icon: "inventory_2", name: "Inventory" },
    { icon: "receipt_long", name: "Purchase Orders" },
    { icon: "schedule", name: "Shift Management" },
    { icon: "groups", name: "CRM Pelanggan" },
    { icon: "analytics", name: "Laporan & Analitik" },
    { icon: "admin_panel_settings", name: "Hak Akses & Keamanan" },
  ];
  return (
    <section id="modul" className="py-24 px-6 max-w-7xl mx-auto relative z-10">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Dirancang seperti cockpit bisnis retail</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">Satu ekosistem yang terhubung dengan mulus untuk operasional tanpa hambatan.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        {modules.map((m, i) => (
          <div key={i} className="cyber-glass-panel rounded-full px-6 py-3 flex items-center gap-3 hover:bg-[#8B5CF6]/10 hover:border-[#8B5CF6]/50 transition-all cursor-default">
            <span className="material-symbols-outlined text-[#22D3EE]">{m.icon}</span>
            <span className="font-bold text-white text-sm md:text-base">{m.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    { num: "01", title: "Daftarkan Cabang", desc: "Buat profil toko dan atur konfigurasi pajak atau struk dengan cepat." },
    { num: "02", title: "Atur Produk & Tim", desc: "Masukkan data stok awal dan undang tim Anda dengan role masing-masing." },
    { num: "03", title: "Mulai Berjualan", desc: "Gunakan kasir super cepat untuk memproses transaksi tanpa lemot." },
    { num: "04", title: "Pantau Real-Time", desc: "Lihat pergerakan omzet dan stok dari mana saja lewat Dashboard Eksekutif." },
  ];
  return (
    <section id="cara-kerja" className="py-24 px-6 max-w-7xl mx-auto relative z-10 border-t border-white/5">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Cara Kerja yang Simpel</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">Mulai digitalisasi retail Anda hanya dalam 4 langkah mudah.</p>
      </div>
      <div className="grid md:grid-cols-4 gap-6">
        {steps.map((s, i) => (
          <div key={i} className="relative">
            <div className="text-6xl font-black text-white/5 absolute -top-8 -left-2 z-0">{s.num}</div>
            <div className="cyber-glass-panel rounded-2xl p-6 relative z-10 h-full">
              <h3 className="text-xl font-bold mb-3 text-[#22D3EE]">{s.title}</h3>
              <p className="text-sm text-slate-400">{s.desc}</p>
            </div>
            {i !== steps.length - 1 && <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-[1px] bg-white/20"></div>}
          </div>
        ))}
      </div>
    </section>
  );
}

function TestimonialSection() {
  const testimonials = [
    { text: "Sejak pakai POS PRO V2, saya bisa pantau omzet 3 cabang kopi saya sambil ngopi di rumah. Stok bahan baku juga nggak pernah kecolongan lagi.", name: "Budi Santoso", role: "Owner", company: "Kopi Kenangan Senja" },
    { text: "Kasirnya super enteng! Dulu sering dikomplain pelanggan karena antrian lama pas jam pulang kerja, sekarang transaksi sat-set beres.", name: "Siti Aminah", role: "Manager", company: "Minimarket Maju Terus" },
    { text: "Laporan akhir bulannya ngebantu banget. Pusing ngitung manual hilang, data PO dan supplier semua rapi tersusun.", name: "Arif Pratama", role: "Direktur", company: "Toko Bangunan Jaya" },
  ];
  return (
    <section id="testimoni" className="py-24 px-6 max-w-7xl mx-auto relative z-10 border-t border-white/5">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Dipercaya oleh Pebisnis Hebat</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">Dengarkan apa kata mereka yang sudah merasakan mudahnya mengelola cabang.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <div key={i} className="cyber-glass-panel rounded-2xl p-8 flex flex-col justify-between hover:bg-white/[0.04] transition-colors">
            <div>
              <div className="flex gap-1 mb-4 text-[#EAB308]">
                {[1,2,3,4,5].map(s => <span key={s} className="material-symbols-outlined text-sm icon-fill">star</span>)}
              </div>
              <p className="text-slate-300 italic mb-6">&quot;{t.text}&quot;</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#22D3EE] flex items-center justify-center font-bold text-white">{t.name[0]}</div>
              <div>
                <p className="text-white font-bold text-sm">{t.name}</p>
                <p className="text-slate-400 text-xs">{t.role}, {t.company}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FaqSection() {
  const faqs = [
    { q: "Apakah bisa untuk ratusan cabang?", a: "Ya, arsitektur kami dirancang untuk multi-cabang tanpa batasan. Anda bisa memantau semuanya dari satu dashboard terpusat." },
    { q: "Apakah kasirnya bisa dipakai offline?", a: "Saat ini sistem membutuhkan koneksi internet ringan karena data langsung tersinkronisasi real-time ke pusat agar laporan selalu akurat." },
    { q: "Bagaimana cara migrasi dari POS lama?", a: "Kami menyediakan fitur Import Excel untuk produk dan stok, serta tim Onboarding khusus untuk paket Professional & Enterprise." },
    { q: "Apakah bisa cetak struk dari HP?", a: "Sangat bisa! Anda bisa menyambungkan printer thermal bluetooth langsung ke perangkat mobile atau tablet lewat kasir responsif." },
  ];
  return (
    <section id="faq" className="py-24 px-6 max-w-3xl mx-auto relative z-10 border-t border-white/5">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Pertanyaan yang Sering Ditanyakan</h2>
      </div>
      <div className="space-y-4">
        {faqs.map((f, i) => (
          <details key={i} className="cyber-glass-panel rounded-xl group cursor-pointer transition-all duration-300">
            <summary className="p-6 font-bold text-white flex justify-between items-center outline-none list-none [&::-webkit-details-marker]:hidden">
              {f.q}
              <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform">expand_more</span>
            </summary>
            <div className="px-6 pb-6 text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-4">
              {f.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function TrialAccessModal({
  isOpen,
  onClose,
  googleEnabled,
  onGoogleSuccess,
  onManualLogin,
  onManualRegister,
  onFinishAuth,
}: {
  isOpen: boolean;
  onClose: () => void;
  googleEnabled: boolean;
  onGoogleSuccess: (credential: string, intent: "login" | "register") => Promise<AuthActionResult>;
  onManualLogin: (credentials: LoginCredentials) => Promise<AuthActionResult>;
  onManualRegister: (credentials: RegisterCredentials) => Promise<AuthActionResult>;
  onFinishAuth: (redirectTo?: string) => void;
}) {
  const [step, setStep] = useState<TrialAuthStep>("choice");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [generalError, setGeneralError] = useState("");
  const [successState, setSuccessState] = useState<AuthSuccessState | null>(null);
  const [loginForm, setLoginForm] = useState<LoginCredentials>({
    identifier: "",
    password: "",
  });
  const [registerForm, setRegisterForm] = useState<RegisterCredentials>({
    name: "",
    username: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });

  useEffect(() => {
    setStep("choice");
    setSubmitting(false);
    setFieldErrors({});
    setGeneralError("");
    setSuccessState(null);
    setLoginForm({ identifier: "", password: "" });
    setRegisterForm({
      name: "",
      username: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    });
  }, [isOpen]);

  useEffect(() => {
    if (step !== "success" || !successState) {
      return;
    }

    const timer = window.setTimeout(() => {
      onFinishAuth(successState.redirectTo);
    }, 1600);

    return () => window.clearTimeout(timer);
  }, [onFinishAuth, step, successState]);

  const stepIndex = step === "choice" ? 0 : step === "success" ? 2 : 1;
  const progressSteps = [
    { title: "Akses", desc: "Pilih alur" },
    { title: step === "register" ? "Daftar" : "Verifikasi", desc: "Isi data" },
    { title: "Dashboard", desc: "Masuk cepat" },
  ];

  const accentClass =
    successState?.accent === "register"
      ? "from-[#8B5CF6] to-[#22D3EE]"
      : successState?.accent === "google"
        ? "from-[#2563EB] to-[#22D3EE]"
        : "from-[#2C21A0] to-[#534dc6]";

  const resetFeedback = () => {
    setFieldErrors({});
    setGeneralError("");
  };

  const switchStep = (nextStep: TrialAuthStep) => {
    setStep(nextStep);
    setSubmitting(false);
    setSuccessState(null);
    resetFeedback();
  };

  const handleActionResult = (result: AuthActionResult) => {
    if (result.ok) {
      resetFeedback();
      setSuccessState(result.success);
      setStep("success");
      return;
    }

    setSuccessState(null);
    setFieldErrors(result.fieldErrors ?? {});
    setGeneralError(result.message);
  };

  const handleManualLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateLoginForm(loginForm);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setGeneralError("Lengkapi data login dulu ya.");
      return;
    }

    resetFeedback();
    setSubmitting(true);
    const result = await onManualLogin(loginForm);
    setSubmitting(false);
    handleActionResult(result);
  };

  const handleManualRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateRegisterForm(registerForm);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setGeneralError("Cek lagi beberapa field yang masih belum valid.");
      return;
    }

    resetFeedback();
    setSubmitting(true);
    const result = await onManualRegister(registerForm);
    setSubmitting(false);
    handleActionResult(result);
  };

  const handleGoogleCredential = async (credential: string, intent: "login" | "register") => {
    resetFeedback();
    setSubmitting(true);
    const result = await onGoogleSuccess(credential, intent);
    setSubmitting(false);
    handleActionResult(result);
  };

  return (
    <>
      <AnimatePresence>
      {isOpen && (
        <div className="auth-modal-scroll fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto px-4 py-3 sm:items-center sm:py-6">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0A0F1F]/80 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="auth-modal-scroll relative w-full max-w-[30rem] max-h-[calc(100vh-1rem)] overflow-y-auto cyber-glass-panel rounded-[24px] border border-white/15 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.16),_transparent_42%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(8,12,24,0.96))] p-5 shadow-[0_30px_100px_-35px_rgba(34,211,238,0.35)] sm:max-h-[calc(100vh-3rem)] sm:p-5"
          >
            <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 transition-colors hover:text-white" type="button">
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#67e8f9]">Trial Access</p>
                <p className="mt-1 text-[11px] leading-5 text-slate-300">Manual login, daftar akun, atau sambungkan Google.</p>
              </div>
              <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-200">
                7 Hari Trial Aktif
              </div>
            </div>

            <div className="mb-5 grid grid-cols-3 gap-1.5">
              {progressSteps.map((progressStep, index) => {
                const isCompleted = index < stepIndex;
                const isActive = index === stepIndex;

                return (
                  <div
                    key={progressStep.title}
                    className={`rounded-[18px] border px-2 py-2 transition-all ${
                      isCompleted || isActive
                        ? "border-[#22D3EE]/35 bg-[#22D3EE]/10"
                        : "border-white/8 bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black ${
                          isCompleted
                            ? "bg-[#22D3EE] text-[#031019]"
                            : isActive
                              ? "bg-white text-[#0F172A]"
                              : "bg-white/10 text-slate-400"
                        }`}
                      >
                        {isCompleted ? "OK" : `0${index + 1}`}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-300">{progressStep.title}</p>
                        <p className="hidden text-[9px] leading-4 text-slate-400 md:block">{progressStep.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mb-5 text-center">
              <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2C21A0] to-[#8B5CF6] shadow-[0_0_20px_rgba(139,92,246,0.45)]">
                <span className="material-symbols-outlined text-white text-[20px]">vpn_key</span>
              </div>
              <h2 className="text-[1.75rem] font-black leading-tight text-white sm:text-[2.15rem]">
                {step === "choice"
                  ? "Akses Trial POS PRO V2"
                  : step === "login"
                    ? "Masuk ke Akun Trial"
                    : step === "register"
                      ? "Daftar Akun Trial"
                      : successState?.title ?? "Dashboard Siap Dibuka"}
              </h2>
              <p className="mt-1.5 text-[13px] leading-6 text-slate-400">
                {step === "choice"
                  ? "Pilih alur yang pas untuk mulai trial."
                  : step === "login"
                    ? "Masuk manual pakai username/email dan password, atau lanjut dengan Google."
                    : step === "register"
                      ? "Buat akun trial manual dulu, atau biarkan Google membuat akun trial otomatis."
                      : successState?.description ?? "Menyiapkan dashboard dan sesi kerja kamu."}
              </p>
            </div>

            {generalError ? (
              <div className="mb-3 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-2.5 text-sm leading-6 text-rose-100">
                {generalError}
              </div>
            ) : null}

            {step === "choice" ? (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => switchStep("login")}
                  className="w-full rounded-[26px] border border-white/10 bg-white/5 px-4 py-3.5 text-left transition-all hover:border-[#22D3EE]/35 hover:bg-white/10"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#22D3EE]">Sudah Punya Akun?</p>
                      <p className="mt-1.5 text-base font-black text-white">Masuk ke akun yang sudah ada</p>
                      <p className="mt-1 text-[13px] leading-6 text-slate-400">Pakai username/email + password atau akun Google.</p>
                    </div>
                    <span className="material-symbols-outlined text-[#22D3EE]">arrow_forward</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => switchStep("register")}
                  className="w-full rounded-[26px] border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-4 py-3.5 text-left transition-all hover:border-[#A78BFA]/40 hover:bg-[#8B5CF6]/15"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#A78BFA]">Belum Punya Akun?</p>
                      <p className="mt-1.5 text-base font-black text-white">Daftar akun trial baru</p>
                      <p className="mt-1 text-[13px] leading-6 text-slate-300">Buat akun manual dulu atau daftar instan lewat Google.</p>
                    </div>
                    <span className="material-symbols-outlined text-[#A78BFA]">person_add</span>
                  </div>
                </button>

                <p className="px-1 text-center text-[13px] leading-6 text-slate-400">
                  Begitu akun aktif, kamu langsung diarahkan ke dashboard.
                </p>
              </div>
            ) : step === "login" ? (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => switchStep("choice")}
                  className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Kembali ke pilihan
                </button>

                <form className="space-y-4" onSubmit={handleManualLoginSubmit}>
                  <AuthField
                    label="Username atau Email"
                    icon="person"
                    value={loginForm.identifier}
                    placeholder="misal: admin atau nama@email.com"
                    autoComplete="username"
                    error={fieldErrors.identifier}
                    hint="Bisa pakai username singkat atau email lengkap."
                    onChange={(value) => {
                      setLoginForm((current) => ({ ...current, identifier: value }));
                      setFieldErrors((current) => ({ ...current, identifier: undefined }));
                      setGeneralError("");
                    }}
                  />
                  <AuthField
                    label="Password"
                    icon="lock"
                    type="password"
                    value={loginForm.password}
                    placeholder="Masukkan password"
                    autoComplete="current-password"
                    error={fieldErrors.password}
                    hint="Password akun manual yang kamu buat sebelumnya."
                    onChange={(value) => {
                      setLoginForm((current) => ({ ...current, password: value }));
                      setFieldErrors((current) => ({ ...current, password: undefined }));
                      setGeneralError("");
                    }}
                  />

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-2xl bg-gradient-to-r from-[#2C21A0] to-[#534dc6] py-3 font-black text-white shadow-[0_18px_40px_-24px_rgba(83,77,198,0.65)] disabled:opacity-60"
                  >
                    {submitting ? "Memproses login..." : "Masuk Manual"}
                  </button>
                </form>

                <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  <span className="h-px flex-1 bg-white/10" />
                  atau lanjut dengan Google
                  <span className="h-px flex-1 bg-white/10" />
                </div>

                {googleEnabled ? (
                  <div className="rounded-2xl border border-[#22D3EE]/20 bg-[#22D3EE]/5 px-4 py-4">
                    <div className="mb-2 flex items-center justify-between gap-3 text-xs text-slate-300">
                      <span>Masuk cepat dengan akun Google yang terdaftar.</span>
                      <span className="rounded-full border border-white/10 px-2 py-1 uppercase tracking-[0.18em] text-[10px] font-black text-[#67e8f9]">
                        Google
                      </span>
                    </div>
                    <div className="flex justify-center">
                      <GoogleLogin
                        onSuccess={(credentialResponse) => {
                          if (credentialResponse.credential) {
                            void handleGoogleCredential(credentialResponse.credential, "login");
                          }
                        }}
                        onError={() => {
                          setSubmitting(false);
                          setFieldErrors((current) => ({
                            ...current,
                            google: "Popup Google ditutup atau otorisasi gagal diproses.",
                          }));
                          setGeneralError("Google Sign-In belum selesai. Coba lagi sebentar.");
                        }}
                        text="continue_with"
                        theme="filled_black"
                        shape="pill"
                      />
                    </div>
                    {fieldErrors.google ? (
                      <p className="mt-3 text-sm text-rose-200">{fieldErrors.google}</p>
                    ) : null}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                    Login Google belum aktif karena client ID belum diisi.
                  </div>
                )}

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm leading-6 text-slate-300">
                  Setelah login berhasil, dashboard akan langsung terbuka dengan cabang aktif dan role akunmu.
                </div>

                <p className="text-center text-sm text-slate-400">
                  Belum punya akun?{" "}
                  <button type="button" onClick={() => switchStep("register")} className="font-bold text-[#22D3EE] hover:text-white">
                    Daftar dulu
                  </button>
                </p>
              </div>
            ) : step === "register" ? (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => switchStep("choice")}
                  className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Kembali ke pilihan
                </button>

                <div className="rounded-2xl border border-[#22D3EE]/20 bg-[#22D3EE]/5 px-4 py-2.5 text-xs leading-6 text-[#67e8f9]">
                  Username dipakai untuk login manual. Email aktif tetap diminta saat daftar agar sesi trial dan identitas akun tetap rapi.
                </div>

                <form className="space-y-4" onSubmit={handleManualRegisterSubmit}>
                  <AuthField
                    label="Nama Lengkap"
                    icon="badge"
                    value={registerForm.name}
                    placeholder="Nama pemilik atau operator"
                    autoComplete="name"
                    error={fieldErrors.name}
                    hint="Nama ini akan tampil di dashboard dan laporan."
                    onChange={(value) => {
                      setRegisterForm((current) => ({ ...current, name: value }));
                      setFieldErrors((current) => ({ ...current, name: undefined }));
                      setGeneralError("");
                    }}
                  />
                  <AuthField
                    label="Username"
                    icon="alternate_email"
                    value={registerForm.username}
                    placeholder="misal: tokojaya"
                    autoComplete="username"
                    error={fieldErrors.username}
                    hint="Huruf kecil, angka, titik, garis bawah, atau strip."
                    onChange={(value) => {
                      const normalizedValue = value.toLowerCase().replace(/[^a-z0-9._-]/g, "");
                      setRegisterForm((current) => ({ ...current, username: normalizedValue }));
                      setFieldErrors((current) => ({ ...current, username: undefined }));
                      setGeneralError("");
                    }}
                  />
                  <AuthField
                    label="Email"
                    icon="mail"
                    type="email"
                    value={registerForm.email}
                    placeholder="nama@email.com"
                    autoComplete="email"
                    error={fieldErrors.email}
                    hint="Dipakai untuk identitas akun dan login Google."
                    onChange={(value) => {
                      setRegisterForm((current) => ({ ...current, email: value.toLowerCase() }));
                      setFieldErrors((current) => ({ ...current, email: undefined }));
                      setGeneralError("");
                    }}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <AuthField
                      label="Password"
                      icon="lock"
                      type="password"
                      value={registerForm.password}
                      placeholder="Minimal 6 karakter"
                      autoComplete="new-password"
                      error={fieldErrors.password}
                      hint="Pakai password yang mudah kamu ingat."
                      onChange={(value) => {
                        setRegisterForm((current) => ({ ...current, password: value }));
                        setFieldErrors((current) => ({ ...current, password: undefined, passwordConfirmation: undefined }));
                        setGeneralError("");
                      }}
                    />
                    <AuthField
                      label="Konfirmasi Password"
                      icon="verified_user"
                      type="password"
                      value={registerForm.passwordConfirmation}
                      placeholder="Ulangi password"
                      autoComplete="new-password"
                      error={fieldErrors.passwordConfirmation}
                      hint="Harus sama persis dengan password di kiri."
                      onChange={(value) => {
                        setRegisterForm((current) => ({ ...current, passwordConfirmation: value }));
                        setFieldErrors((current) => ({ ...current, passwordConfirmation: undefined }));
                        setGeneralError("");
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] py-3 font-black text-white shadow-[0_18px_40px_-24px_rgba(34,211,238,0.45)] disabled:opacity-60"
                  >
                    {submitting ? "Membuat akun..." : "Daftar Trial Manual"}
                  </button>
                </form>

                <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  <span className="h-px flex-1 bg-white/10" />
                  atau daftar dengan Google
                  <span className="h-px flex-1 bg-white/10" />
                </div>

                {googleEnabled ? (
                  <div className="rounded-2xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/5 px-4 py-4">
                    <div className="mb-2 flex items-center justify-between gap-3 text-xs text-slate-300">
                      <span>Biar Google yang buat akun trial dan langsung mengaktifkan sesi.</span>
                      <span className="rounded-full border border-white/10 px-2 py-1 uppercase tracking-[0.18em] text-[10px] font-black text-[#c4b5fd]">
                        Instant
                      </span>
                    </div>
                    <div className="flex justify-center">
                      <GoogleLogin
                        onSuccess={(credentialResponse) => {
                          if (credentialResponse.credential) {
                            void handleGoogleCredential(credentialResponse.credential, "register");
                          }
                        }}
                        onError={() => {
                          setSubmitting(false);
                          setFieldErrors((current) => ({
                            ...current,
                            google: "Google belum berhasil membuat akun trial kamu.",
                          }));
                          setGeneralError("Google Sign-In belum selesai. Kamu bisa coba lagi atau daftar manual.");
                        }}
                        text="signup_with"
                        theme="filled_black"
                        shape="pill"
                      />
                    </div>
                    {fieldErrors.google ? (
                      <p className="mt-3 text-sm text-rose-200">{fieldErrors.google}</p>
                    ) : null}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                    Google Sign-In belum aktif karena NEXT_PUBLIC_GOOGLE_CLIENT_ID belum diisi.
                  </div>
                )}

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm leading-6 text-slate-300">
                  Begitu akun trial dibuat, kamu langsung diarahkan ke dashboard untuk setup toko, produk, dan stok awal.
                </div>
                <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-100 text-center leading-relaxed">
                  Trial manual dan trial Google sama-sama aktif selama 7 hari.
                </div>
                <p className="text-center text-sm text-slate-400">
                  Sudah punya akun?{" "}
                  <button type="button" onClick={() => switchStep("login")} className="font-bold text-[#22D3EE] hover:text-white">
                    Masuk sekarang
                  </button>
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className={`rounded-[28px] border border-white/10 bg-gradient-to-br ${accentClass} p-[1px]`}>
                  <div className="rounded-[26px] bg-[#09111f] px-5 py-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                        <span className="material-symbols-outlined text-[24px]">verified</span>
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Akses Berhasil</p>
                        <p className="mt-2 text-2xl font-black text-white">{successState?.title}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-200">{successState?.description}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#67e8f9]">Onboarding Berikutnya</p>
                  <div className="mt-4 grid gap-3">
                    {successState?.checklist.map((item) => (
                      <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                        <span className="material-symbols-outlined mt-0.5 text-[18px] text-[#22D3EE]">task_alt</span>
                        <span className="text-sm leading-6 text-slate-200">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onFinishAuth(successState?.redirectTo)}
                  className="w-full rounded-2xl bg-gradient-to-r from-[#2C21A0] to-[#22D3EE] py-3.5 font-black text-white shadow-[0_18px_40px_-24px_rgba(34,211,238,0.45)]"
                >
                  Masuk ke Dashboard
                </button>
                <p className="text-center text-sm text-slate-400">
                  Dashboard akan terbuka otomatis dalam beberapa detik.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
      </AnimatePresence>
      <style jsx global>{`
        .auth-modal-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .auth-modal-scroll::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
      `}</style>
    </>
  );
}

function AuthField({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  hint,
  autoComplete,
}: {
  label: string;
  icon: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  error?: string;
  hint?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-slate-500">
          {icon}
        </span>
        <input
          type={type}
          value={value}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full rounded-2xl border py-3 pl-12 pr-4 text-sm font-semibold text-white outline-none transition-colors placeholder:text-slate-500 ${
            error
              ? "border-rose-400/60 bg-rose-500/10 focus:border-rose-300"
              : "border-white/10 bg-white/5 focus:border-[#22D3EE]/50"
          }`}
          placeholder={placeholder}
        />
      </div>
      <p className={`mt-1.5 text-[11px] leading-5 ${error ? "text-rose-200" : "text-slate-500"}`}>
        {error || hint || " "}
      </p>
    </label>
  );
}

// --- Main Page Component ---

export default function LandingPage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? '';
  const googleEnabled = googleClientId.length > 0;

  const handleAuthFinish = (redirectTo = "/dashboard") => {
    setIsLoginModalOpen(false);
    showToast({
      title: "Akses Berhasil",
      description: "Dashboard POS PRO sedang dibuka.",
      variant: "success",
    });
    router.push(redirectTo);
  };

  const handleGoogleLogin = async (
    credential: string,
    intent: "login" | "register",
  ): Promise<AuthActionResult> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isGoogle: true,
          googleIdToken: credential,
        }),
      });

      const data = await readApiPayload(res);
      if (res.ok) {
        return {
          ok: true,
          success: {
            title: intent === "register" ? "Akun Google Siap Dipakai" : "Login Google Berhasil",
            description:
              intent === "register"
                ? "Google sudah membuat akun trial dan dashboard siap dipakai."
                : "Identitas Google cocok, sesi trial kamu langsung dipulihkan.",
            redirectTo: (data as { redirectTo?: string })?.redirectTo || '/dashboard',
            accent: "google",
            checklist:
              intent === "register"
                ? [
                    "Lengkapi profil toko dan preferensi invoice.",
                    "Tambah produk pertama lalu isi stok awal cabang utama.",
                    "Coba satu transaksi demo dari halaman kasir.",
                  ]
                : [
                    "Ringkasan dashboard dan cabang aktif akan dimuat ulang.",
                    "Hak akses akun Google langsung dipakai di sesi ini.",
                    "Kamu bisa lanjut ke kasir, inventaris, atau laporan.",
                  ],
          },
        };
      }

      return {
        ok: false,
        message: getApiErrorMessage(data, 'Gagal masuk menggunakan Google.'),
        fieldErrors: extractFieldErrors(data),
      };
    } catch (error) {
      console.error(error);
      return {
        ok: false,
        message: 'Tidak dapat menghubungi backend POS PRO untuk login Google.',
      };
    }
  };

  const handleManualLogin = async ({
    identifier,
    password,
  }: LoginCredentials): Promise<AuthActionResult> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
          password,
        }),
      });

      const data = await readApiPayload(res);
      if (res.ok) {
        return {
          ok: true,
          success: {
            title: "Login Berhasil",
            description: "Sesi akun trial kamu aktif dan dashboard siap dibuka.",
            redirectTo: (data as { redirectTo?: string })?.redirectTo || '/dashboard',
            accent: "login",
            checklist: [
              "Dashboard akan memuat ringkasan penjualan terbaru.",
              "Cabang aktif dan role akun langsung ikut tersinkron.",
              "Kamu bisa lanjut ke kasir, stok, atau laporan tanpa login ulang.",
            ],
          },
        };
      }

      return {
        ok: false,
        message: getApiErrorMessage(data, 'Username/email atau password salah.'),
        fieldErrors: extractFieldErrors(data),
      };
    } catch (error) {
      console.error(error);
      return {
        ok: false,
        message: 'Tidak dapat menghubungi backend POS PRO untuk login manual.',
      };
    }
  };

  const handleManualRegister = async ({
    name,
    username,
    email,
    password,
    passwordConfirmation,
  }: RegisterCredentials): Promise<AuthActionResult> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          username,
          email,
          password,
          passwordConfirmation,
        }),
      });

      const data = await readApiPayload(res);
      if (res.ok) {
        return {
          ok: true,
          success: {
            title: "Akun Trial Berhasil Dibuat",
            description: "Trial 7 hari aktif. Kita lanjut ke dashboard untuk setup awal.",
            redirectTo: (data as { redirectTo?: string })?.redirectTo || '/dashboard',
            accent: "register",
            checklist: [
              "Lengkapi profil toko, pajak, dan format invoice.",
              "Tambah kategori, produk, dan stok awal cabang utama.",
              "Undang tim atau buka kasir pertama untuk simulasi transaksi.",
            ],
          },
        };
      }

      return {
        ok: false,
        message: getApiErrorMessage(data, 'Akun trial belum berhasil dibuat.'),
        fieldErrors: extractFieldErrors(data),
      };
    } catch (error) {
      console.error(error);
      return {
        ok: false,
        message: 'Tidak dapat menghubungi backend POS PRO untuk pendaftaran trial.',
      };
    }
  };

  return (
    <MaybeGoogleProvider clientId={googleClientId}>
      <div className="bg-[#0A0F1F] text-white min-h-screen font-body overflow-x-hidden relative cyber-grid">
        <Navbar onLoginClick={() => setIsLoginModalOpen(true)} />

        <main>
          <HeroSection
            googleEnabled={googleEnabled}
            onTrialClick={() => setIsLoginModalOpen(true)}
          />
          <TrustBar />

          <section className="py-20 px-6 max-w-5xl mx-auto text-center relative z-10">
            <h2 className="text-2xl md:text-3xl font-black mb-8 text-white">Bukan Sekadar Aplikasi Kasir Biasa</h2>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="cyber-glass-panel p-8 rounded-2xl border-t-4 border-t-red-500/50">
                <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2"><span className="material-symbols-outlined">cancel</span> POS Lama Anda</h3>
                <ul className="space-y-3 text-slate-400 text-sm">
                  <li>Data cabang tercecer dan sulit dipantau</li>
                  <li>Stok barang sering tidak sinkron</li>
                  <li>Laporan akhir bulan sangat lambat</li>
                  <li>Tidak ada kontrol akses per kasir</li>
                </ul>
              </div>
              <div className="cyber-glass-panel p-8 rounded-2xl border-t-4 border-t-[#22D3EE]/50 bg-white/[0.02]">
                <h3 className="text-xl font-bold text-[#22D3EE] mb-4 flex items-center gap-2"><span className="material-symbols-outlined">check_circle</span> POS PRO V2</h3>
                <ul className="space-y-3 text-slate-300 text-sm">
                  <li>Dashboard eksekutif real-time semua cabang</li>
                  <li>Inventaris FIFO terintegrasi otomatis</li>
                  <li>Analitik penjualan instan dengan 1 klik</li>
                  <li>Role-based access control yang ketat</li>
                </ul>
              </div>
            </div>
          </section>

          <FeatureGrid />
          <ModuleEcosystemSection />
          <HowItWorksSection />
          <PricingSection onSubscribe={() => setIsLoginModalOpen(true)} />
          <TestimonialSection />
          <FaqSection />

          <section className="py-24 px-6 relative z-10">
            <div className="max-w-5xl mx-auto cyber-glass-panel rounded-3xl p-12 text-center relative overflow-hidden border border-[#8B5CF6]/30">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#2C21A0]/40 to-transparent"></div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Siap tingkatkan operasional toko kamu?</h2>
                <p className="text-slate-300 max-w-2xl mx-auto mb-10 text-lg">Gunakan sistem kasir modern yang dibuat untuk bisnis retail yang ingin tumbuh lebih rapi, cepat, dan terukur.</p>
                <button onClick={() => setIsLoginModalOpen(true)} className="bg-white text-[#0A0F1F] font-black px-10 py-4 rounded-xl hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]" type="button">
                  Mulai Trial 7 Hari
                </button>
              </div>
            </div>
          </section>
        </main>

        <footer className="bg-[#0F172A] border-t border-white/10 pt-16 pb-8 px-6 relative z-10">
          <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2">
              <div className="mb-4">
                <BrandLockup
                  subtitle="Retail cockpit for modern branches. Solusi lengkap manajemen retail multi-cabang masa depan."
                  titleClassName="text-lg font-black text-white"
                  subtitleClassName="mt-2 max-w-xs text-sm leading-6 text-slate-400"
                  markSizeClassName="h-7 w-7"
                  markClassName="rounded bg-gradient-to-br from-[#2C21A0] to-[#8B5CF6] p-1"
                />
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Produk</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-[#22D3EE] transition-colors">POS Cashier</a></li>
                <li><a href="#" className="hover:text-[#22D3EE] transition-colors">Inventory System</a></li>
                <li><a href="#" className="hover:text-[#22D3EE] transition-colors">Executive Dashboard</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Hubungi Kami</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">call</span> WA: {APP_OWNER_PROFILE.primaryWhatsapp}</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">mail</span> {APP_OWNER_PROFILE.billingEmail}</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">language</span> {APP_OWNER_PROFILE.websiteLabel}</li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto border-t border-white/10 pt-8 text-center text-slate-500 text-sm">
            © 2026 {APP_OWNER_PROFILE.studioName}. All rights reserved.
          </div>
        </footer>

        <TrialAccessModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          googleEnabled={googleEnabled}
          onGoogleSuccess={handleGoogleLogin}
          onManualLogin={handleManualLogin}
          onManualRegister={handleManualRegister}
          onFinishAuth={handleAuthFinish}
        />
      </div>
    </MaybeGoogleProvider>
  );
}
