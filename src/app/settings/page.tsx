"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, Variants } from "framer-motion";

import ResponsiveLayout from "@/components/layout/ResponsiveLayout";
import { AppModal } from "@/components/ui/AppModal";
import { useToast } from "@/components/ui/ToastProvider";
import { getApiErrorMessage, readApiPayload, toApiArray, toApiObject } from "@/lib/client-api";

type Tab = "store" | "branches" | "users" | "tax";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  branchId?: string | null;
  branch?: { name: string } | null;
  createdAt: string;
}

interface Branch {
  id: string;
  name: string;
  businessName?: string;
  location?: string;
  address?: string;
  phone?: string;
  openingHours?: string;
  _count: { users: number };
}

interface SettingsPayload {
  storeName: string;
  address: string;
  phone: string;
  email: string;
  npwp: string;
  logoUrl?: string;
  invoicePrefix: string;
  receiptFooter: string;
  vat: number;
  serviceCharge: number;
  roundingMode: string;
}

const DEFAULT_SETTINGS: SettingsPayload = {
  storeName: "POS PRO V2",
  address: "Jl. Raya Commerce No. 1, Jakarta",
  phone: "+62 856-4305-2000",
  email: "admin@pospro.com",
  npwp: "00.000.000.0-000.000",
  logoUrl: "",
  invoicePrefix: "TRX",
  receiptFooter: "Terima kasih sudah berbelanja di POS PRO V2.",
  vat: 11,
  serviceCharge: 0,
  roundingMode: "ROUND_100",
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-secondary/10 text-secondary",
  OWNER: "bg-error/10 text-error",
  MANAGER: "bg-[#eaf8ff] text-[#0b6385]",
  KASIR: "bg-[#eff6ee] text-[#20613a]",
};

const VALID_TABS: Tab[] = ["store", "branches", "users", "tax"];
const ROUNDING_MODE_OPTIONS = [
  { value: "ROUND_100", label: "Round to nearest 100" },
  { value: "ROUND_500", label: "Round to nearest 500" },
  { value: "NO_ROUNDING", label: "No rounding" },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsPageFallback />}>
      <SettingsPageContent />
    </Suspense>
  );
}

function SettingsPageContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<Tab>(VALID_TABS.includes(initialTab as Tab) ? (initialTab as Tab) : "users");
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "KASIR", branchId: "" });
  const [savingUser, setSavingUser] = useState(false);

  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [branchForm, setBranchForm] = useState({
    name: "",
    businessName: "",
    location: "",
    address: "",
    phone: "",
    openingHours: "",
  });
  const [savingBranch, setSavingBranch] = useState(false);

  const [storeProfile, setStoreProfile] = useState({
    storeName: DEFAULT_SETTINGS.storeName,
    address: DEFAULT_SETTINGS.address,
    phone: DEFAULT_SETTINGS.phone,
    email: DEFAULT_SETTINGS.email,
    npwp: DEFAULT_SETTINGS.npwp,
    invoicePrefix: DEFAULT_SETTINGS.invoicePrefix,
    receiptFooter: DEFAULT_SETTINGS.receiptFooter,
  });

  const [taxSettings, setTaxSettings] = useState({
    vat: String(DEFAULT_SETTINGS.vat),
    serviceCharge: String(DEFAULT_SETTINGS.serviceCharge),
    roundingMode: DEFAULT_SETTINGS.roundingMode,
  });
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (VALID_TABS.includes(tab as Tab)) {
      setActiveTab(tab as Tab);
    }
  }, [searchParams]);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/users");
      const payload = await readApiPayload(res);
      if (res.ok) {
        setUsers(toApiArray<User>(payload));
      } else {
        setUsers([]);
        showToast({
          title: "User belum bisa dimuat",
          description: getApiErrorMessage(payload, "Daftar user belum tersedia saat ini."),
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
      showToast({
        title: "User belum bisa dimuat",
        description: "Koneksi ke data user sedang bermasalah.",
        variant: "error",
      });
    }
    setLoadingUsers(false);
  }, [showToast]);

  const fetchBranches = useCallback(async () => {
    setLoadingBranches(true);
    try {
      const res = await fetch("/api/branches");
      const payload = await readApiPayload(res);
      if (res.ok) {
        setBranches(toApiArray<Branch>(payload));
      } else {
        setBranches([]);
        showToast({
          title: "Cabang belum bisa dimuat",
          description: getApiErrorMessage(payload, "Daftar cabang belum tersedia saat ini."),
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Failed to fetch branches:", error);
      setBranches([]);
      showToast({
        title: "Cabang belum bisa dimuat",
        description: "Koneksi ke data cabang sedang bermasalah.",
        variant: "error",
      });
    }
    setLoadingBranches(false);
  }, [showToast]);

  const fetchSettings = useCallback(async () => {
    setLoadingSettings(true);
    try {
      const res = await fetch("/api/settings");
      const payload = await readApiPayload(res);

      if (!res.ok) {
        showToast({
          title: "Settings belum bisa dimuat",
          description: getApiErrorMessage(payload, "Konfigurasi aplikasi belum tersedia saat ini."),
          variant: "error",
        });
        return;
      }

      const data = toApiObject<SettingsPayload>(payload);
      if (!data) {
        throw new Error("Payload settings tidak valid.");
      }

      setStoreProfile({
        storeName: data.storeName ?? DEFAULT_SETTINGS.storeName,
        address: data.address ?? DEFAULT_SETTINGS.address,
        phone: data.phone ?? DEFAULT_SETTINGS.phone,
        email: data.email ?? DEFAULT_SETTINGS.email,
        npwp: data.npwp ?? DEFAULT_SETTINGS.npwp,
        invoicePrefix: data.invoicePrefix ?? DEFAULT_SETTINGS.invoicePrefix,
        receiptFooter: data.receiptFooter ?? DEFAULT_SETTINGS.receiptFooter,
      });
      setTaxSettings({
        vat: String(data.vat ?? DEFAULT_SETTINGS.vat),
        serviceCharge: String(data.serviceCharge ?? DEFAULT_SETTINGS.serviceCharge),
        roundingMode: data.roundingMode ?? DEFAULT_SETTINGS.roundingMode,
      });
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      showToast({
        title: "Settings belum bisa dimuat",
        description: "Koneksi ke konfigurasi aplikasi sedang bermasalah.",
        variant: "error",
      });
    } finally {
      setLoadingSettings(false);
    }
  }, [showToast]);

  useEffect(() => {
    void Promise.all([fetchUsers(), fetchBranches(), fetchSettings()]);
  }, [fetchBranches, fetchSettings, fetchUsers]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingUser(true);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userForm),
    });
    setSavingUser(false);
    if (res.ok) {
      setIsAddUserOpen(false);
      setUserForm({ name: "", email: "", password: "", role: "KASIR", branchId: "" });
      void fetchUsers();
      showToast({
        title: "User berhasil ditambahkan",
        description: `${userForm.name} sekarang punya akses ke sistem.`,
        variant: "success",
      });
    } else {
      const payload = await readApiPayload(res);
      showToast({
        title: "User gagal ditambahkan",
        description: getApiErrorMessage(payload, "User belum berhasil ditambahkan."),
        variant: "error",
      });
    }
  };

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBranch(true);
    const res = await fetch("/api/branches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(branchForm),
    });
    setSavingBranch(false);
    if (res.ok) {
      setIsAddBranchOpen(false);
      setBranchForm({ name: "", businessName: "", location: "", address: "", phone: "", openingHours: "" });
      void fetchBranches();
      showToast({
        title: "Cabang berhasil ditambahkan",
        description: `${branchForm.name} siap dipakai di operasional.`,
        variant: "success",
      });
    } else {
      const payload = await readApiPayload(res);
      showToast({
        title: "Cabang gagal ditambahkan",
        description: getApiErrorMessage(payload, "Cabang belum berhasil ditambahkan."),
        variant: "error",
      });
    }
  };

  const handleSaveSettings = async (section: "store" | "tax") => {
    setSavingSettings(true);

    try {
      const payload = {
        storeName: storeProfile.storeName,
        address: storeProfile.address,
        phone: storeProfile.phone,
        email: storeProfile.email,
        npwp: storeProfile.npwp,
        invoicePrefix: storeProfile.invoicePrefix,
        receiptFooter: storeProfile.receiptFooter,
        vat: Number(taxSettings.vat || 0),
        serviceCharge: Number(taxSettings.serviceCharge || 0),
        roundingMode: taxSettings.roundingMode,
      };

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const responsePayload = await readApiPayload(res);

      if (!res.ok) {
        showToast({
          title: "Settings gagal disimpan",
          description: getApiErrorMessage(responsePayload, "Konfigurasi belum berhasil diperbarui."),
          variant: "error",
        });
        return;
      }

      const data = toApiObject<SettingsPayload>(responsePayload);
      if (data) {
        setStoreProfile({
          storeName: data.storeName ?? DEFAULT_SETTINGS.storeName,
          address: data.address ?? DEFAULT_SETTINGS.address,
          phone: data.phone ?? DEFAULT_SETTINGS.phone,
          email: data.email ?? DEFAULT_SETTINGS.email,
          npwp: data.npwp ?? DEFAULT_SETTINGS.npwp,
          invoicePrefix: data.invoicePrefix ?? DEFAULT_SETTINGS.invoicePrefix,
          receiptFooter: data.receiptFooter ?? DEFAULT_SETTINGS.receiptFooter,
        });
        setTaxSettings({
          vat: String(data.vat ?? DEFAULT_SETTINGS.vat),
          serviceCharge: String(data.serviceCharge ?? DEFAULT_SETTINGS.serviceCharge),
          roundingMode: data.roundingMode ?? DEFAULT_SETTINGS.roundingMode,
        });
      }

      showToast({
        title: section === "store" ? "Profil toko disimpan" : "Tax settings disimpan",
        description:
          section === "store"
            ? "Perubahan profil dan format invoice sudah tersimpan ke backend."
            : "PPN, service charge, dan mode pembulatan sudah tersimpan ke backend.",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
      showToast({
        title: "Settings gagal disimpan",
        description: "Koneksi ke backend sedang bermasalah.",
        variant: "error",
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: string; description: string }[] = useMemo(
    () => [
      { id: "store", label: "Store Profile", icon: "storefront", description: "Brand, alamat, dan identitas toko" },
      { id: "branches", label: "Branches", icon: "location_city", description: "Lokasi cabang dan distribusi tim" },
      { id: "users", label: "Users & Roles", icon: "manage_accounts", description: "Hak akses operator dan staf" },
      { id: "tax", label: "Tax & Fees", icon: "percent", description: "PPN, service charge, dan pembulatan" },
    ],
    [],
  );

  return (
    <ResponsiveLayout>
      <AppModal
        open={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        title="Tambah User Baru"
        description="Buat akses operator baru dan kaitkan langsung ke cabang yang sesuai."
        icon="manage_accounts"
        size="sm"
      >
        <form onSubmit={handleAddUser} className="grid gap-4">
          <Field label="Full Name *">
            <input
              required
              value={userForm.name}
              onChange={(event) => setUserForm({ ...userForm, name: event.target.value })}
              className="app-field px-4 py-3.5 text-sm"
            />
          </Field>
          <Field label="Email *">
            <input
              required
              type="email"
              value={userForm.email}
              onChange={(event) => setUserForm({ ...userForm, email: event.target.value })}
              className="app-field px-4 py-3.5 text-sm"
            />
          </Field>
          <Field label="Password *">
            <input
              required
              type="password"
              value={userForm.password}
              onChange={(event) => setUserForm({ ...userForm, password: event.target.value })}
              className="app-field px-4 py-3.5 text-sm"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Role *">
              <select
                value={userForm.role}
                onChange={(event) => setUserForm({ ...userForm, role: event.target.value })}
                className="app-field px-4 py-3.5 text-sm"
              >
                {["OWNER", "ADMIN", "MANAGER", "KASIR"].map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Branch">
              <select
                value={userForm.branchId}
                onChange={(event) => setUserForm({ ...userForm, branchId: event.target.value })}
                className="app-field px-4 py-3.5 text-sm"
              >
                <option value="">Use active branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setIsAddUserOpen(false)} className="app-secondary-btn rounded-2xl px-5 py-3 text-sm font-semibold">
              Cancel
            </button>
            <button type="submit" disabled={savingUser} className="app-primary-btn rounded-2xl px-6 py-3 text-sm font-semibold disabled:opacity-60">
              {savingUser ? "Saving..." : "Save User"}
            </button>
          </div>
        </form>
      </AppModal>

      <AppModal
        open={isAddBranchOpen}
        onClose={() => setIsAddBranchOpen(false)}
        title="Tambah Cabang Baru"
        description="Tambahkan lokasi baru agar user, stok, dan operasionalnya bisa mulai dipetakan."
        icon="location_city"
        size="sm"
      >
        <form onSubmit={handleAddBranch} className="grid gap-4">
          <Field label="Branch Name *">
            <input
              required
              value={branchForm.name}
              onChange={(event) => setBranchForm({ ...branchForm, name: event.target.value })}
              className="app-field px-4 py-3.5 text-sm"
              placeholder="e.g. Downtown Store"
            />
          </Field>
          <Field label="Business Identity">
            <input
              value={branchForm.businessName}
              onChange={(event) => setBranchForm({ ...branchForm, businessName: event.target.value })}
              className="app-field px-4 py-3.5 text-sm"
              placeholder="e.g. POS PRO Sudirman"
            />
          </Field>
          <Field label="Location / Address">
            <input
              value={branchForm.location}
              onChange={(event) => setBranchForm({ ...branchForm, location: event.target.value })}
              className="app-field px-4 py-3.5 text-sm"
              placeholder="e.g. Jl. Sudirman No. 1, Jakarta"
            />
          </Field>
          <Field label="Detailed Address">
            <input
              value={branchForm.address}
              onChange={(event) => setBranchForm({ ...branchForm, address: event.target.value })}
              className="app-field px-4 py-3.5 text-sm"
              placeholder="Alamat lengkap cabang"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Contact Phone">
              <input
                value={branchForm.phone}
                onChange={(event) => setBranchForm({ ...branchForm, phone: event.target.value })}
                className="app-field px-4 py-3.5 text-sm"
                placeholder="+62 812..."
              />
            </Field>
            <Field label="Operating Hours">
              <input
                value={branchForm.openingHours}
                onChange={(event) => setBranchForm({ ...branchForm, openingHours: event.target.value })}
                className="app-field px-4 py-3.5 text-sm"
                placeholder="08:00 - 21:00"
              />
            </Field>
          </div>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setIsAddBranchOpen(false)} className="app-secondary-btn rounded-2xl px-5 py-3 text-sm font-semibold">
              Cancel
            </button>
            <button type="submit" disabled={savingBranch} className="app-primary-btn rounded-2xl px-6 py-3 text-sm font-semibold disabled:opacity-60">
              {savingBranch ? "Saving..." : "Save Branch"}
            </button>
          </div>
        </form>
      </AppModal>

      <div className="flex-1 overflow-y-auto px-4 pb-24 pt-4 md:px-8 md:pb-8 md:pt-6 w-full">
        <div className="mx-auto flex max-w-7xl flex-col gap-4">
          <motion.section 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#271744_0%,#5c3d99_48%,#a277ff_100%)] p-6 text-white shadow-[0_28px_90px_-58px_rgba(17,24,39,0.82)] md:p-5"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
            <div className="relative max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.26em] text-white/60">Control Center</p>
              <h1 className="mt-3 font-headline text-3xl font-black tracking-[-0.03em] md:text-5xl">
                Configuration Hub
              </h1>
              <p className="mt-3 text-sm font-medium leading-relaxed text-white/70 md:text-base">
                Kelola cabang, user, profil bisnis, dan aturan operasional dari satu panel yang lebih nyaman dipakai.
              </p>
            </div>
          </motion.section>

          <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
            {/* Horizontal Scroll on Mobile, Vertical Stack on Desktop */}
            <nav className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4 xl:flex-col xl:overflow-visible xl:pb-0 scrollbar-hide">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="group relative flex min-w-[240px] shrink-0 snap-start items-center rounded-xl p-4 text-left outline-none transition-colors xl:min-w-0"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute inset-0 z-0 rounded-xl bg-[linear-gradient(135deg,#271744_0%,#a277ff_100%)] shadow-[0_22px_48px_-34px_rgba(162, 119, 255,0.85)]"
                        transition={{ type: "spring", stiffness: 300, damping: 24 }}
                      />
                    )}
                    <div className="relative z-10 flex items-start gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors duration-300 ${isActive ? 'bg-white/20 text-white' : 'bg-surface-container text-on-surface-variant group-hover:bg-primary-container group-hover:text-primary'}`}>
                        <span className={`material-symbols-outlined text-[24px] ${isActive ? "icon-fill" : ""}`}>{tab.icon}</span>
                      </div>
                      <div>
                        <div className={`font-headline text-base font-black tracking-tight transition-colors duration-300 ${isActive ? "text-white" : "text-on-surface group-hover:text-primary"}`}>{tab.label}</div>
                        <div className={`mt-1 text-[11px] font-semibold leading-relaxed transition-colors duration-300 ${isActive ? "text-white/70" : "text-on-surface-variant/70"}`}>{tab.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>

            <div className="relative min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  {activeTab === "users" && (
                    <section className="rounded-2xl border border-white/70 bg-white/78 p-6 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)] backdrop-blur-xl sm:p-5">
                      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#a277ff]/75">Team Management</p>
                          <h2 className="mt-1 font-headline text-2xl font-black text-on-surface tracking-[-0.04em]">System Access</h2>
                          <p className="mt-2 text-sm font-semibold text-on-surface-variant">{users.length} users registered in the system</p>
                        </div>
                        <button onClick={() => setIsAddUserOpen(true)} className="flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#271744_0%,#a277ff_100%)] px-6 py-3.5 text-sm font-black text-white shadow-[0_18px_36px_-28px_rgba(17,24,39,0.75)] hover:-translate-y-0.5 transition-all">
                          <span className="material-symbols-outlined text-[20px]">add</span>
                          Add User
                        </button>
                      </div>

                      {loadingUsers ? (
                        <div className="flex h-40 items-center justify-center text-sm font-semibold text-on-surface-variant animate-pulse">Loading users...</div>
                      ) : users.length === 0 ? (
                        <EmptyPanel icon="groups" title="Belum ada user" description="Tambahkan operator baru supaya tim bisa mulai mengakses sistem." />
                      ) : (
                        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-3">
                          {users.map((user) => (
                            <motion.div key={user.id} variants={itemVariants} className="group flex flex-col gap-4 rounded-xl border border-white/70 bg-white/78 p-5 shadow-[0_18px_42px_-34px_rgba(39, 23, 68,0.34)] transition-all hover:-translate-y-1 hover:bg-white hover:shadow-[0_24px_54px_-38px_rgba(39, 23, 68,0.42)] sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-center gap-4 min-w-0">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[#f5edff] font-headline text-xl font-black text-[#a277ff] shadow-inner">
                                  {user.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="truncate font-headline text-lg font-black text-on-surface">{user.name}</div>
                                  <div className="truncate text-sm font-semibold text-on-surface-variant">{user.email}</div>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                                <span className={`rounded-full px-3 py-1.5 text-xs font-black ${ROLE_COLORS[user.role] ?? "bg-surface-container text-on-surface-variant"}`}>
                                  {user.role}
                                </span>
                                <span className="rounded-full bg-surface-container-low px-3 py-1.5 text-xs font-bold text-on-surface-variant">
                                  {user.branch?.name ?? "Global Access"}
                                </span>
                                <span className="hidden text-xs font-semibold text-on-surface-variant/70 md:block">
                                  Joined {new Date(user.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
                                </span>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </section>
                  )}

                  {activeTab === "branches" && (
                    <section className="rounded-2xl border border-white/70 bg-white/78 p-6 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)] backdrop-blur-xl sm:p-5">
                      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#12b981]/80">Network</p>
                          <h2 className="mt-1 font-headline text-2xl font-black text-on-surface tracking-[-0.04em]">Branch Locations</h2>
                          <p className="mt-2 text-sm font-semibold text-on-surface-variant">{branches.length} branches actively operating</p>
                        </div>
                        <button onClick={() => setIsAddBranchOpen(true)} className="flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#047857_0%,#12b981_100%)] px-6 py-3.5 text-sm font-black text-white shadow-[0_18px_36px_-28px_rgba(4,120,87,0.65)] hover:-translate-y-0.5 transition-all">
                          <span className="material-symbols-outlined text-[20px]">add_location</span>
                          Add Branch
                        </button>
                      </div>

                      {loadingBranches ? (
                        <div className="flex h-40 items-center justify-center text-sm font-semibold text-on-surface-variant animate-pulse">Loading branches...</div>
                      ) : branches.length === 0 ? (
                        <EmptyPanel icon="location_city" title="Belum ada cabang" description="Tambahkan cabang baru agar distribusi user dan operasional lebih rapi." />
                      ) : (
                        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2">
                          {branches.map((branch) => (
                            <motion.div key={branch.id} variants={itemVariants} className="group rounded-xl border border-white/70 bg-white/78 p-6 shadow-[0_18px_42px_-34px_rgba(39, 23, 68,0.34)] transition-all hover:-translate-y-1 hover:bg-white hover:shadow-[0_24px_54px_-38px_rgba(39, 23, 68,0.42)]">
                              <div className="flex items-start gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#e6f7ef] text-[#047857] shadow-inner transition-transform group-hover:scale-105">
                                  <span className="material-symbols-outlined icon-fill text-[26px]">storefront</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3 className="truncate font-headline text-xl font-black text-on-surface">{branch.name}</h3>
                                  <p className="mt-1 truncate text-sm font-semibold text-on-surface-variant">{branch.businessName || branch.location || "Lokasi belum diisi"}</p>
                                  <p className="mt-1 text-xs font-medium text-on-surface-variant/80">{branch.address || branch.location || "Alamat belum diisi"}</p>
                                  <div className="mt-4 flex flex-wrap items-center gap-2">
                                    <div className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/30 bg-white px-3 py-1.5 text-xs font-bold text-on-surface-variant shadow-sm">
                                      <span className="material-symbols-outlined text-[14px]">group</span>
                                      {branch._count.users} user terhubung
                                    </div>
                                    {branch.openingHours ? (
                                      <div className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/20 bg-[#f5edff] px-3 py-1.5 text-xs font-bold text-[#8657ea]">
                                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                                        {branch.openingHours}
                                      </div>
                                    ) : null}
                                    {branch.phone ? (
                                      <div className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/20 bg-[#e6f7ef] px-3 py-1.5 text-xs font-bold text-[#047857]">
                                        <span className="material-symbols-outlined text-[14px]">call</span>
                                        {branch.phone}
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </section>
                  )}

                  {activeTab === "store" && (
                    <section className="rounded-2xl border border-white/70 bg-white/78 p-6 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)] backdrop-blur-xl sm:p-5">
                      <div className="mb-8">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#f59e0b]/90">Brand Identity</p>
                        <h2 className="mt-1 font-headline text-2xl font-black text-on-surface tracking-[-0.04em]">Store Profile</h2>
                        <p className="mt-2 text-sm font-semibold text-on-surface-variant">Atur informasi toko yang akan muncul pada identitas operasional dan struk.</p>
                      </div>
                      <div className="grid gap-5">
                        <Field label="Store Name">
                          <input
                            value={storeProfile.storeName}
                            onChange={(event) => setStoreProfile({ ...storeProfile, storeName: event.target.value })}
                            className="app-field px-5 py-4 text-sm font-bold"
                          />
                        </Field>
                        <Field label="Address">
                          <input
                            value={storeProfile.address}
                            onChange={(event) => setStoreProfile({ ...storeProfile, address: event.target.value })}
                            className="app-field px-5 py-4 text-sm font-bold"
                          />
                        </Field>
                        <div className="grid gap-5 sm:grid-cols-2">
                          <Field label="Phone">
                            <input
                              value={storeProfile.phone}
                              onChange={(event) => setStoreProfile({ ...storeProfile, phone: event.target.value })}
                              className="app-field px-5 py-4 text-sm font-bold"
                            />
                          </Field>
                          <Field label="Email">
                            <input
                              value={storeProfile.email}
                              onChange={(event) => setStoreProfile({ ...storeProfile, email: event.target.value })}
                              className="app-field px-5 py-4 text-sm font-bold"
                            />
                          </Field>
                        </div>
                        <Field label="Tax ID (NPWP)">
                          <input
                            value={storeProfile.npwp}
                            onChange={(event) => setStoreProfile({ ...storeProfile, npwp: event.target.value })}
                            className="app-field px-5 py-4 text-sm font-bold"
                          />
                        </Field>
                        <div className="grid gap-5 sm:grid-cols-2">
                          <Field label="Invoice Prefix">
                            <input
                              value={storeProfile.invoicePrefix}
                              onChange={(event) => setStoreProfile({ ...storeProfile, invoicePrefix: event.target.value.toUpperCase() })}
                              className="app-field px-5 py-4 text-sm font-bold uppercase"
                            />
                          </Field>
                          <Field label="Receipt Footer">
                            <input
                              value={storeProfile.receiptFooter}
                              onChange={(event) => setStoreProfile({ ...storeProfile, receiptFooter: event.target.value })}
                              className="app-field px-5 py-4 text-sm font-bold"
                            />
                          </Field>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <button
                            disabled={savingSettings || loadingSettings}
                            className="flex items-center gap-2 rounded-xl bg-[#271744] px-8 py-4 text-sm font-black text-white shadow-[0_18px_36px_-28px_rgba(17,24,39,0.75)] hover:-translate-y-0.5 transition-all"
                            onClick={() => void handleSaveSettings("store")}
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[18px]">save</span>
                            {savingSettings ? "Saving..." : "Save Changes"}
                          </button>
                        </div>
                      </div>
                    </section>
                  )}

                  {activeTab === "tax" && (
                    <section className="rounded-2xl border border-white/70 bg-white/78 p-6 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)] backdrop-blur-xl sm:p-5">
                      <div className="mb-8">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#be123c]/80">Compliance</p>
                        <h2 className="mt-1 font-headline text-2xl font-black text-on-surface tracking-[-0.04em]">Tax & Fees</h2>
                        <p className="mt-2 text-sm font-semibold text-on-surface-variant">Pastikan aturan pajak dan pembulatan sesuai kebijakan bisnis kamu.</p>
                      </div>
                      <div className="grid gap-5">
                        <div className="grid gap-5 sm:grid-cols-2">
                          <Field label="PPN (%)">
                            <input
                              value={taxSettings.vat}
                              onChange={(event) => setTaxSettings({ ...taxSettings, vat: event.target.value })}
                              className="app-field px-5 py-4 text-sm font-bold"
                            />
                          </Field>
                          <Field label="Service Charge (%)">
                            <input
                              value={taxSettings.serviceCharge}
                              onChange={(event) => setTaxSettings({ ...taxSettings, serviceCharge: event.target.value })}
                              className="app-field px-5 py-4 text-sm font-bold"
                            />
                          </Field>
                        </div>
                        <Field label="Rounding Mode">
                          <select
                            value={taxSettings.roundingMode}
                            onChange={(event) => setTaxSettings({ ...taxSettings, roundingMode: event.target.value })}
                            className="app-field px-5 py-4 text-sm font-bold"
                          >
                            {ROUNDING_MODE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <div className="mt-4 flex justify-end">
                          <button
                            disabled={savingSettings || loadingSettings}
                            className="flex items-center gap-2 rounded-xl bg-[#271744] px-8 py-4 text-sm font-black text-white shadow-[0_18px_36px_-28px_rgba(17,24,39,0.75)] hover:-translate-y-0.5 transition-all"
                            onClick={() => void handleSaveSettings("tax")}
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[18px]">save</span>
                            {savingSettings ? "Saving..." : "Save Tax Settings"}
                          </button>
                        </div>
                      </div>
                    </section>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <aside className="space-y-6">
              <div className="rounded-2xl border border-white/70 bg-white/78 p-6 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)] backdrop-blur-xl">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-headline text-lg font-black text-on-surface">Receipt Preview</h3>
                    <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/70 mt-1">Live Demo</p>
                  </div>
                  <button
                    className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#f4f6ff] text-[#a277ff] transition-colors hover:bg-[#f5edff]"
                    onClick={() =>
                      showToast({
                        title: "Receipt editor coming next",
                        description: "Editor struk visual akan kita sambungkan setelah polish UI utama selesai.",
                        variant: "info",
                      })
                    }
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                </div>
                
                <div className="relative mx-auto mt-2 w-full max-w-[240px]">
                  {/* Floating Receipt Effect */}
                  <div className="absolute -bottom-4 -left-4 -right-4 h-12 rounded-full bg-black/10 blur-xl filter" />
                  <div className="relative overflow-hidden rounded-[4px] border border-outline-variant/10 bg-white p-5 shadow-[0_22px_42px_-20px_rgba(39, 23, 68,0.25)]">
                    {/* Zigzag Top/Bottom borders via CSS could be added here, using simple border for now */}
                    <div className="text-center">
                      <span className="material-symbols-outlined text-[32px] text-on-surface">storefront</span>
                      <div className="mt-3 font-headline text-xl font-black tracking-[-0.03em] text-on-surface">{storeProfile.storeName}</div>
                      <div className="mt-2 text-[10px] font-semibold leading-relaxed text-on-surface-variant">
                        {storeProfile.address}
                      </div>
                      <div className="mt-1 text-[9px] font-black tracking-[0.18em] text-on-surface-variant/70">
                        PREFIX {storeProfile.invoicePrefix}
                      </div>
                    </div>
                    <div className="my-5 border-t-2 border-dashed border-outline-variant/30" />
                    <div className="space-y-3 font-mono text-[10px] font-bold text-on-surface">
                      <div className="flex justify-between"><span>Produk A x1</span><span>Rp 50.000</span></div>
                      <div className="flex justify-between"><span>Produk B x2</span><span>Rp 30.000</span></div>
                      <div className="flex justify-between text-on-surface-variant"><span>PPN {taxSettings.vat}%</span><span>Rp 8.800</span></div>
                    </div>
                    <div className="my-5 border-t-2 border-dashed border-outline-variant/30" />
                    <div className="flex items-center justify-between font-headline text-base font-black text-on-surface">
                      <span>TOTAL</span>
                      <span>Rp 88.800</span>
                    </div>
                    <div className="mt-6 flex flex-col items-center">
                      <div className="mb-2 text-center text-[9px] font-semibold text-on-surface-variant">{storeProfile.receiptFooter}</div>
                      <div className="text-center text-[10px] tracking-widest text-on-surface-variant opacity-60">
                        || ||| | || | ||| ||
                      </div>
                      <div className="mt-1 text-[8px] font-bold text-on-surface-variant">0012938475</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#271744_0%,#a277ff_100%)] p-7 text-white shadow-[0_36px_80px_-40px_rgba(162, 119, 255,0.92)]">
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl transition-all duration-500 group-hover:scale-150" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-amber-300">workspace_premium</span>
                    <p className="text-[10px] font-black uppercase tracking-[0.26em] text-white/80">Current Plan</p>
                  </div>
                  <h3 className="mt-4 font-headline text-3xl font-black tracking-tight">Pro Tier</h3>
                  <div className="mt-6 space-y-4 text-sm font-semibold text-white/80">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <span>Active Branches</span>
                      <span className="font-black text-white">{branches.length} <span className="text-white/50">/ 5</span></span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total Users</span>
                      <span className="font-black text-white">{users.length}</span>
                    </div>
                  </div>
                  <button
                    className="mt-8 w-full rounded-xl border border-white/20 bg-white/10 px-5 py-4 text-sm font-black text-white backdrop-blur-md transition-all hover:bg-white hover:text-[#a277ff]"
                    onClick={() =>
                      showToast({
                        title: "Upgrade plan siap disambungkan",
                        description: "Begitu billing aktif, tombol ini akan mengarah ke plan management.",
                        variant: "info",
                      })
                    }
                    type="button"
                  >
                    Manage Subscription
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}

function SettingsPageFallback() {
  return (
    <ResponsiveLayout>
      <div className="flex-1 overflow-y-auto px-4 pb-24 pt-4 md:px-8 md:pb-8 md:pt-6 w-full">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-outline-variant/30 bg-surface p-10 text-center font-semibold text-on-surface-variant shadow-sm">
            Menyiapkan konfigurasi...
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-on-surface-variant/80">{label}</span>
      {children}
    </label>
  );
}

function EmptyPanel({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-outline-variant/30 bg-white/40 p-5 text-center text-on-surface-variant backdrop-blur-sm">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-surface-container-low text-on-surface-variant shadow-inner">
        <span className="material-symbols-outlined text-[36px]">{icon}</span>
      </div>
      <div>
        <p className="font-headline text-2xl font-black text-on-surface">{title}</p>
        <p className="mt-2 max-w-sm text-sm font-medium">{description}</p>
      </div>
    </div>
  );
}

