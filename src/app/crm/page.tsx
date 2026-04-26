"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";

import ResponsiveLayout from "@/components/layout/ResponsiveLayout";
import { AppModal } from "@/components/ui/AppModal";
import { useToast } from "@/components/ui/ToastProvider";
import { getApiErrorMessage, readApiPayload, toApiArray, toApiObject } from "@/lib/client-api";

interface CustomerPointHistory {
  id: string;
  type: "EARN" | "REDEEM" | "ADJUSTMENT" | string;
  points: number;
  note?: string;
  orderId?: string | null;
  createdAt: string;
}

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  segment?: string;
  loyaltyPoints?: number;
  lifetimePoints?: number;
  pointHistories?: CustomerPointHistory[];
  createdAt: string;
  _count?: { orders?: number };
}

type ContactFilter = "ALL" | "EMAIL" | "PHONE" | "LOYAL";
type CustomerTone = "indigo" | "emerald" | "amber" | "coral";
type PointAction = "REDEEM" | "ADJUSTMENT";

const customerPalette = [
  { name: "Midnight CRM", value: "#271744", label: "Data pelanggan" },
  { name: "Electric Indigo", value: "#a277ff", label: "Aksi cepat" },
  { name: "Mint Loyalty", value: "#12b981", label: "Relasi sehat" },
];

const toneClass: Record<CustomerTone, { icon: string; chip: string; line: string; glow: string }> = {
  indigo: {
    icon: "bg-[#f5edff] text-[#a277ff]",
    chip: "bg-[#f5edff] text-[#8657ea]",
    line: "from-[#a277ff] to-[#8b5cf6]",
    glow: "from-[#a277ff]/20 to-transparent",
  },
  emerald: {
    icon: "bg-[#e6f7ef] text-[#047857]",
    chip: "bg-[#e6f7ef] text-[#047857]",
    line: "from-[#047857] to-[#12b981]",
    glow: "from-[#12b981]/20 to-transparent",
  },
  amber: {
    icon: "bg-[#fff7df] text-[#b45309]",
    chip: "bg-[#fff7df] text-[#b45309]",
    line: "from-[#f59e0b] to-[#fb7185]",
    glow: "from-[#f59e0b]/20 to-transparent",
  },
  coral: {
    icon: "bg-[#fff1f2] text-[#be123c]",
    chip: "bg-[#fff1f2] text-[#be123c]",
    line: "from-[#fb7185] to-[#f59e0b]",
    glow: "from-[#fb7185]/20 to-transparent",
  },
};

function getOrderCount(customer: Customer) {
  return customer._count?.orders ?? 0;
}

function getLoyaltyPoints(customer: Customer) {
  return customer.loyaltyPoints ?? 0;
}

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "C";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getCustomerProfile(customer: Customer) {
  const orders = getOrderCount(customer);
  const hasEmail = Boolean(customer.email);
  const hasPhone = Boolean(customer.phone);

  if (orders >= 5) {
    return {
      label: "VIP",
      icon: "workspace_premium",
      tone: "emerald" as CustomerTone,
      description: "Pelanggan bernilai tinggi. Cocok untuk program loyalitas khusus.",
    };
  }

  if (orders >= 2) {
    return {
      label: "Loyal",
      icon: "verified",
      tone: "emerald" as CustomerTone,
      description: "Sudah pernah repeat order. Jaga relasi dengan follow-up rutin.",
    };
  }

  if (hasEmail && hasPhone) {
    return {
      label: "Complete",
      icon: "contact_mail",
      tone: "indigo" as CustomerTone,
      description: "Data kontak lengkap. Tim kasir bisa menghubungi lebih cepat.",
    };
  }

  if (hasEmail || hasPhone) {
    return {
      label: "Reachable",
      icon: "call",
      tone: "amber" as CustomerTone,
      description: "Kontak dasar tersedia. Lengkapi data untuk CRM yang lebih kuat.",
    };
  }

  return {
    label: "New",
    icon: "person_add",
    tone: "coral" as CustomerTone,
    description: "Data masih tipis. Tambahkan email atau nomor telepon saat transaksi.",
  };
}

export default function CRMPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isPointActionOpen, setIsPointActionOpen] = useState(false);
  const [contactFilter, setContactFilter] = useState<ContactFilter>("ALL");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", segment: "RETAIL" });
  const [pointForm, setPointForm] = useState<{ action: PointAction; points: string; note: string }>({
    action: "REDEEM",
    points: "",
    note: "",
  });
  const [saving, setSaving] = useState(false);
  const [pointSubmitting, setPointSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchCustomers = useCallback(async () => {
    const keyword = deferredSearch.trim();
    const q = keyword ? `?search=${encodeURIComponent(keyword)}` : "";

    setLoading(true);
    try {
      const res = await fetch(`/api/customers${q}`);
      const payload = await readApiPayload(res);

      if (!res.ok) {
        const message = getApiErrorMessage(payload, "Data customer belum bisa dimuat.");
        setCustomers([]);
        setSelectedCustomer(null);
        setLoadError(message);
        return;
      }

      const data = toApiArray<Customer>(payload);
      setCustomers(data);
      setLoadError(null);
      setSelectedCustomer((current) => {
        if (!current) {
          return data[0] ?? null;
        }

        return data.find((item) => item.id === current.id) ?? data[0] ?? null;
      });
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setCustomers([]);
      setSelectedCustomer(null);
      setLoadError("Data customer belum bisa dimuat. Coba refresh halaman.");
    } finally {
      setLoading(false);
    }
  }, [deferredSearch]);

  useEffect(() => {
    void fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesSearch =
        keyword === "" ||
        customer.name.toLowerCase().includes(keyword) ||
        customer.email?.toLowerCase().includes(keyword) ||
        customer.phone?.toLowerCase().includes(keyword);

      const matchesFilter =
        contactFilter === "ALL" ||
        (contactFilter === "EMAIL" && Boolean(customer.email)) ||
        (contactFilter === "PHONE" && Boolean(customer.phone)) ||
        (contactFilter === "LOYAL" && getOrderCount(customer) >= 2);

      return matchesSearch && matchesFilter;
    });
  }, [customers, search, contactFilter]);

  const customerStats = useMemo(() => {
    const total = customers.length;
    const withEmail = customers.filter((customer) => customer.email).length;
    const withPhone = customers.filter((customer) => customer.phone).length;
    const loyalCustomers = customers.filter((customer) => getOrderCount(customer) >= 2).length;
    const completeProfiles = customers.filter((customer) => customer.email && customer.phone).length;
    const totalOrders = customers.reduce((sum, customer) => sum + getOrderCount(customer), 0);
    const totalPoints = customers.reduce((sum, customer) => sum + getLoyaltyPoints(customer), 0);
    const coverage = total > 0 ? Math.round(((withEmail + withPhone) / (total * 2)) * 100) : 0;

    return {
      total,
      withEmail,
      withPhone,
      loyalCustomers,
      completeProfiles,
      totalOrders,
      totalPoints,
      coverage,
    };
  }, [customers]);

  const upsertCustomer = (nextCustomer: Customer) => {
    setCustomers((current) => {
      const exists = current.some((item) => item.id === nextCustomer.id);
      if (!exists) {
        return [nextCustomer, ...current];
      }

      return current.map((item) => (item.id === nextCustomer.id ? nextCustomer : item));
    });
    setSelectedCustomer(nextCustomer);
  };

  const openPointAction = (action: PointAction) => {
    if (!selectedCustomer) {
      return;
    }

    setPointForm({
      action,
      points: "",
      note: action === "REDEEM" ? "Redeem poin manual" : "Adjustment poin manual",
    });
    setIsPointActionOpen(true);
  };

  const handleAddCustomer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          segment: formData.segment,
        }),
      });
      const payload = await readApiPayload(res);

      if (res.ok) {
        setIsAddOpen(false);
        const customer = toApiObject<Customer>(payload);
        setFormData({ name: "", email: "", phone: "", segment: "RETAIL" });
        if (customer?.id) {
          upsertCustomer(customer);
        } else {
          await fetchCustomers();
        }
        showToast({
          title: "Pelanggan berhasil ditambahkan",
          description: `${formData.name} sekarang tersimpan di CRM.`,
          variant: "success",
        });
      } else {
        showToast({
          title: "Pelanggan gagal ditambahkan",
          description: getApiErrorMessage(payload, "Pelanggan belum berhasil ditambahkan."),
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Failed to add customer:", error);
      showToast({
        title: "Pelanggan gagal ditambahkan",
        description: "Cek koneksi backend atau coba ulang beberapa saat lagi.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitPointAction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedCustomer) {
      return;
    }

    const points = Number(pointForm.points);
    if (!Number.isInteger(points) || points <= 0) {
      showToast({
        title: "Jumlah poin belum valid",
        description: "Masukkan jumlah poin lebih dari 0 untuk redeem atau adjustment.",
        variant: "error",
      });
      return;
    }

    setPointSubmitting(true);
    try {
      const response = await fetch(`/api/customers/${selectedCustomer.id}/points`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: pointForm.action,
          points,
          note: pointForm.note.trim() || undefined,
        }),
      });
      const payload = await readApiPayload(response);

      if (!response.ok) {
        showToast({
          title: "Update poin gagal",
          description: getApiErrorMessage(payload, "Perubahan poin customer belum berhasil disimpan."),
          variant: "error",
        });
        return;
      }

      const nextCustomer = toApiObject<Customer>(payload);
      if (nextCustomer?.id) {
        upsertCustomer(nextCustomer);
      } else {
        await fetchCustomers();
      }

      setIsPointActionOpen(false);
      setPointForm({ action: "REDEEM", points: "", note: "" });
      showToast({
        title: pointForm.action === "REDEEM" ? "Redeem poin berhasil" : "Adjustment poin berhasil",
        description:
          pointForm.action === "REDEEM"
            ? `${points} poin berhasil dipakai untuk customer ini.`
            : `${points} poin berhasil disesuaikan untuk customer ini.`,
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to submit point action:", error);
      showToast({
        title: "Update poin gagal",
        description: "Cek koneksi backend atau coba ulang beberapa saat lagi.",
        variant: "error",
      });
    } finally {
      setPointSubmitting(false);
    }
  };

  return (
    <ResponsiveLayout>
      <AppModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Tambah Customer Baru"
        description="Simpan kontak pelanggan agar follow-up, loyalty, dan histori transaksi lebih rapi."
        icon="person_add"
        size="md"
      >
        <form onSubmit={handleAddCustomer} className="flex flex-col gap-5">
          <div className="crm-sheen relative overflow-hidden rounded-xl bg-[linear-gradient(135deg,#271744_0%,#a277ff_100%)] p-5 text-white">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#12b981]/22" />
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/55">Customer Profile</p>
            <h3 className="mt-2 font-headline text-xl font-black tracking-[-0.04em]">Data kecil, impact besar.</h3>
            <p className="mt-2 max-w-lg text-sm font-medium leading-6 text-white/70">
              Nama wajib diisi. Email dan telepon bisa kamu lengkapi bertahap saat transaksi berikutnya.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <ModalField
              label="Nama Lengkap"
              icon="badge"
              required
              value={formData.name}
              placeholder="Nama customer"
              onChange={(value) => setFormData((current) => ({ ...current, name: value }))}
            />
            <ModalField
              label="Phone"
              icon="call"
              value={formData.phone}
              placeholder="+62 8xx xxxx xxxx"
              onChange={(value) => setFormData((current) => ({ ...current, phone: value }))}
            />
            <ModalSelectField
              label="Segment"
              icon="loyalty"
              value={formData.segment}
              options={["RETAIL", "MEMBER", "VIP", "WHOLESALE"]}
              onChange={(value) => setFormData((current) => ({ ...current, segment: value }))}
            />
            <div className="md:col-span-2">
              <ModalField
                label="Email"
                icon="mail"
                type="email"
                value={formData.email}
                placeholder="nama@contoh.com"
                onChange={(value) => setFormData((current) => ({ ...current, email: value }))}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setIsAddOpen(false)} className="app-secondary-btn rounded-2xl px-5 py-3 text-sm font-black">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="app-primary-btn rounded-2xl px-6 py-3 text-sm font-black disabled:opacity-60">
              {saving ? "Saving..." : "Save Customer"}
            </button>
          </div>
        </form>
      </AppModal>

      <AppModal
        open={isPointActionOpen}
        onClose={() => {
          setIsPointActionOpen(false);
          setPointForm({ action: "REDEEM", points: "", note: "" });
        }}
        title={pointForm.action === "REDEEM" ? "Redeem Loyalty Point" : "Adjustment Loyalty Point"}
        description={
          selectedCustomer
            ? `Kelola poin untuk ${selectedCustomer.name} dengan jejak histori yang tetap rapi.`
            : "Kelola poin pelanggan."
        }
        icon={pointForm.action === "REDEEM" ? "redeem" : "rewarded_ads"}
        size="md"
      >
        <form onSubmit={handleSubmitPointAction} className="flex flex-col gap-5">
          <div className="rounded-xl bg-[linear-gradient(135deg,#271744_0%,#a277ff_100%)] p-5 text-white">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/55">Customer Loyalty</p>
            <h3 className="mt-2 font-headline text-xl font-black tracking-[-0.04em]">
              {selectedCustomer?.name ?? "Pelanggan aktif"}
            </h3>
            <p className="mt-2 text-sm font-medium leading-6 text-white/72">
              Poin aktif sekarang: {selectedCustomer ? getLoyaltyPoints(selectedCustomer) : 0} poin.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <ModalSelectField
              label="Action"
              icon="conversion_path"
              value={pointForm.action}
              options={["REDEEM", "ADJUSTMENT"]}
              onChange={(value) =>
                setPointForm((current) => ({ ...current, action: value as PointAction }))
              }
            />
            <ModalField
              label="Points"
              icon="pin"
              type="number"
              value={pointForm.points}
              placeholder="contoh: 10"
              onChange={(value) => setPointForm((current) => ({ ...current, points: value }))}
            />
          </div>

          <ModalField
            label="Catatan"
            icon="edit_note"
            value={pointForm.note}
            placeholder="Jelaskan alasan redeem atau adjustment poin"
            onChange={(value) => setPointForm((current) => ({ ...current, note: value }))}
          />

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setIsPointActionOpen(false);
                setPointForm({ action: "REDEEM", points: "", note: "" });
              }}
              className="app-secondary-btn rounded-2xl px-5 py-3 text-sm font-black"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={pointSubmitting}
              className="app-primary-btn rounded-2xl px-6 py-3 text-sm font-black disabled:opacity-60"
            >
              {pointSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </AppModal>

      <div className="h-full overflow-y-auto px-4 py-5 pb-28 md:px-6 md:pb-8">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4">
          <section className="crm-entrance crm-sheen relative overflow-hidden rounded-2xl border border-white/70 bg-[linear-gradient(135deg,#271744_0%,#26256d_48%,#a277ff_100%)] p-5 text-white shadow-[0_28px_90px_-58px_rgba(17,24,39,0.82)] sm:p-7">
            <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#12b981]/22" />
            <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-[#f59e0b]/14" />

            <div className="relative grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(420px,0.8fr)] xl:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-white/75">
                  <span className="h-2 w-2 rounded-full bg-[#12b981] crm-live-dot" />
                  Customer Intelligence Desk
                </div>
                <h1 className="mt-5 max-w-3xl font-headline text-3xl font-black tracking-[-0.06em] text-white sm:text-5xl xl:text-6xl">
                  Kenali customer lebih cepat, follow-up jadi lebih personal.
                </h1>
                <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-white/72 sm:text-base">
                  Kelola profil, kontak, dan sinyal loyalitas pelanggan dari satu layar yang lebih jelas untuk tim kasir dan admin.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {customerPalette.map((color) => (
                    <div key={color.name} className="flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-3 py-2 text-xs font-bold text-white/82">
                      <span className="h-3 w-3 rounded-full" style={{ background: color.value }} />
                      <span>{color.name}</span>
                      <span className="hidden text-white/45 sm:inline">/ {color.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <HeroMiniStat label="Customers" value={String(customerStats.total)} icon="groups" />
                <HeroMiniStat label="Loyal" value={String(customerStats.loyalCustomers)} icon="workspace_premium" />
                <HeroMiniStat label="Points" value={String(customerStats.totalPoints)} icon="rewarded_ads" />
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <CustomerKpi
              label="Total Customer"
              value={String(customerStats.total)}
              icon="groups"
              tone="indigo"
              meta={`${customerStats.totalOrders} total order`}
              delay={40}
            />
            <CustomerKpi
              label="Total Poin"
              value={String(customerStats.totalPoints)}
              icon="rewarded_ads"
              tone="emerald"
              meta="Akumulasi poin aktif customer"
              delay={90}
            />
            <CustomerKpi
              label="Punya Email"
              value={String(customerStats.withEmail)}
              icon="mail"
              tone="amber"
              meta={`${customerStats.coverage}% data coverage`}
              delay={140}
            />
            <button
              onClick={() => setIsAddOpen(true)}
              className="crm-entrance group overflow-hidden rounded-xl bg-[linear-gradient(135deg,#271744_0%,#a277ff_100%)] p-5 text-left text-white shadow-[0_24px_64px_-44px_rgba(162, 119, 255,0.92)] hover:-translate-y-1"
              style={{ "--delay": "190ms" } as CSSProperties}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white/55">Quick Action</p>
                  <p className="mt-4 font-headline text-xl font-black tracking-[-0.05em]">Add Customer</p>
                  <p className="mt-2 text-sm font-medium text-white/68">Simpan kontak baru</p>
                </div>
                <span className="material-symbols-outlined rounded-2xl bg-white/12 p-3 text-[24px] transition group-hover:rotate-90">person_add</span>
              </div>
            </button>
          </section>

          <section className="crm-entrance rounded-2xl border border-white/70 bg-white/76 p-4 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)] sm:p-5" style={{ "--delay": "240ms" } as CSSProperties}>
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
              <div>
                <div className="group relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant transition group-focus-within:text-[#a277ff]">
                    search
                  </span>
                  <input
                    className="app-field w-full py-4 pl-12 pr-4 text-sm font-semibold"
                    placeholder="Cari nama, email, atau nomor telepon..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                  {search.trim() ? (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#f5edff] text-[#a277ff] hover:bg-[#e6d9ff]"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar xl:flex-wrap xl:justify-end xl:pb-0">
                {([
                  { key: "ALL", label: "Semua" },
                  { key: "EMAIL", label: `Email (${customerStats.withEmail})` },
                  { key: "PHONE", label: `Telepon (${customerStats.withPhone})` },
                  { key: "LOYAL", label: `Loyal (${customerStats.loyalCustomers})` },
                ] as const).map((filter) => (
                  <FilterChip key={filter.key} active={contactFilter === filter.key} onClick={() => setContactFilter(filter.key)}>
                    {filter.label}
                  </FilterChip>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-col justify-between gap-3 rounded-xl border border-[#ecdfff] bg-[#f8f9ff] px-4 py-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant/65">Customer Result</p>
                <p className="mt-1 font-headline text-xl font-black text-on-surface">
                  {loading ? "Memuat customer" : `${filteredCustomers.length} dari ${customers.length} customer`}
                </p>
              </div>
              <div className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-[#a277ff]">
                {deferredSearch.trim() ? "Search aktif" : "CRM ready"}
              </div>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.75fr)]">
            <div className="crm-entrance overflow-hidden rounded-2xl border border-white/70 bg-white/76 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)]" style={{ "--delay": "300ms" } as CSSProperties}>
              <div className="border-b border-[#ecdfff] px-5 py-4">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#a277ff]/75">Customer Ledger</p>
                    <h2 className="mt-2 font-headline text-xl font-black tracking-[-0.05em] text-on-surface">Daftar Customer</h2>
                  </div>
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f5edff] px-4 py-2 text-sm font-black text-[#8657ea] hover:bg-[#e6d9ff]"
                    onClick={() => void fetchCustomers()}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">refresh</span>
                    Refresh Data
                  </button>
                </div>
              </div>

              <div className="grid gap-3 p-4">
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="h-24 animate-pulse rounded-xl bg-white/80" />
                  ))
                ) : loadError ? (
                  <ErrorCustomerState message={loadError} onRetry={() => void fetchCustomers()} />
                ) : filteredCustomers.length === 0 ? (
                  <EmptyCustomerState onCreate={() => setIsAddOpen(true)} hasSearch={Boolean(search.trim()) || contactFilter !== "ALL"} />
                ) : (
                  filteredCustomers.map((customer, index) => (
                    <CustomerCard
                      key={customer.id}
                      customer={customer}
                      selected={selectedCustomer?.id === customer.id}
                      delay={index * 32}
                      onSelect={() => setSelectedCustomer(customer)}
                    />
                  ))
                )}
              </div>
            </div>

            <CustomerDetail
              customer={selectedCustomer}
              onOpenRedeem={() => openPointAction("REDEEM")}
              onOpenAdjustment={() => openPointAction("ADJUSTMENT")}
            />
          </section>
        </div>
      </div>
    </ResponsiveLayout>
  );
}

function CustomerKpi({
  label,
  value,
  icon,
  tone,
  meta,
  delay,
}: {
  label: string;
  value: string;
  icon: string;
  tone: CustomerTone;
  meta: string;
  delay: number;
}) {
  const style = toneClass[tone];

  return (
    <div
      className="crm-entrance group relative overflow-hidden rounded-xl border border-white/70 bg-white/78 p-5 shadow-[0_24px_70px_-48px_rgba(39, 23, 68,0.38)] hover:-translate-y-1 hover:bg-white"
      style={{ "--delay": `${delay}ms` } as CSSProperties}
    >
      <div className={`pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-gradient-to-br ${style.glow}`} />
      <div className={`absolute inset-x-5 bottom-0 h-1 rounded-full bg-gradient-to-r ${style.line}`} />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant/70">{label}</p>
          <p className="mt-4 font-headline text-3xl font-black tracking-[-0.05em] text-on-surface">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${style.icon}`}>
          <span className="material-symbols-outlined icon-fill text-[23px]">{icon}</span>
        </div>
      </div>
      <div className={`relative mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${style.chip}`}>
        <span className="material-symbols-outlined text-[15px]">analytics</span>
        {meta}
      </div>
    </div>
  );
}

function CustomerCard({
  customer,
  selected,
  delay,
  onSelect,
}: {
  customer: Customer;
  selected: boolean;
  delay: number;
  onSelect: () => void;
}) {
  const profile = getCustomerProfile(customer);
  const style = toneClass[profile.tone];
  const orders = getOrderCount(customer);
  const loyaltyPoints = getLoyaltyPoints(customer);
  const reachable = customer.email || customer.phone ? "Ready" : "-";

  return (
    <button
      onClick={onSelect}
      className={`crm-row w-full rounded-xl border p-4 text-left shadow-[0_20px_54px_-42px_rgba(39, 23, 68,0.38)] ${
        selected ? "border-[#a277ff]/45 bg-[#f6f7ff]" : "border-white/70 bg-white/78 hover:bg-white"
      }`}
      style={{ "--delay": `${delay}ms` } as CSSProperties}
      type="button"
    >
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex min-w-0 gap-4">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[linear-gradient(135deg,#271744_0%,#a277ff_100%)] font-headline text-xl font-black text-white">
            <span className="absolute inset-x-3 bottom-0 h-1 rounded-full bg-[#12b981]" />
            {getInitials(customer.name)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate font-headline text-xl font-black tracking-[-0.04em] text-on-surface">{customer.name}</h3>
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black ${style.chip}`}>
                <span className="material-symbols-outlined text-[14px]">{profile.icon}</span>
                {profile.label}
              </span>
            </div>
            <p className="mt-1 truncate text-sm font-semibold text-on-surface-variant">
              {customer.email || customer.phone || "Kontak belum lengkap"}
            </p>
            <p className="mt-1 text-xs font-semibold text-on-surface-variant">
              Bergabung {formatDate(customer.createdAt)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 lg:min-w-[300px]">
          <MiniData label="Orders" value={String(orders)} />
          <MiniData label="Points" value={String(loyaltyPoints)} />
          <MiniData label="Reach" value={reachable} />
        </div>
      </div>
    </button>
  );
}

function CustomerDetail({
  customer,
  onOpenRedeem,
  onOpenAdjustment,
}: {
  customer: Customer | null;
  onOpenRedeem: () => void;
  onOpenAdjustment: () => void;
}) {
  if (!customer) {
    return (
      <aside className="crm-entrance rounded-2xl border border-white/70 bg-white/76 p-5 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)] xl:sticky xl:top-4" style={{ "--delay": "340ms" } as CSSProperties}>
        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-dashed border-[#d4c8e3] bg-white/60 p-5 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-[#f5edff] text-[#a277ff]">
            <span className="material-symbols-outlined icon-fill text-4xl">person_search</span>
          </div>
          <p className="mt-5 font-headline text-2xl font-black text-on-surface">Pilih customer dulu</p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-on-surface-variant">
            Panel detail akan menampilkan ringkasan profil, kontak, dan status loyalitas pelanggan.
          </p>
        </div>
      </aside>
    );
  }

  const profile = getCustomerProfile(customer);
  const orders = getOrderCount(customer);
  const loyaltyPoints = getLoyaltyPoints(customer);
  const style = toneClass[profile.tone];

  return (
    <aside className="crm-entrance rounded-2xl border border-white/70 bg-white/76 p-4 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)] xl:sticky xl:top-4" style={{ "--delay": "340ms" } as CSSProperties}>
      <div className="crm-sheen relative overflow-hidden rounded-xl bg-[linear-gradient(135deg,#271744_0%,#a277ff_100%)] p-5 text-white shadow-[0_28px_70px_-44px_rgba(162, 119, 255,0.92)]">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#12b981]/20" />
        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-white/14 font-headline text-2xl font-black">
              {getInitials(customer.name)}
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/16 bg-white/12 px-3 py-1.5 text-xs font-black text-white">
              <span className="material-symbols-outlined text-[14px]">{profile.icon}</span>
              {profile.label}
            </span>
          </div>

          <h2 className="mt-5 font-headline text-xl font-black tracking-[-0.05em]">{customer.name}</h2>
          <p className="mt-2 text-sm font-medium leading-6 text-white/68">{profile.description}</p>

          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
            <SummaryBox label="Orders" value={String(orders)} />
            <SummaryBox label="Points" value={String(loyaltyPoints)} />
            <SummaryBox label="Since" value={formatDate(customer.createdAt)} />
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          onClick={onOpenRedeem}
          className="rounded-xl bg-[#e6f7ef] px-4 py-4 text-left text-[#047857] shadow-[0_18px_42px_-36px_rgba(4,120,87,0.32)]"
          type="button"
        >
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#047857]/70">Quick Action</p>
          <p className="mt-2 font-headline text-xl font-black">Redeem Point</p>
          <p className="mt-1 text-sm font-medium text-[#047857]/75">Gunakan poin untuk reward atau benefit customer.</p>
        </button>
        <button
          onClick={onOpenAdjustment}
          className="rounded-xl bg-[#f5edff] px-4 py-4 text-left text-[#8657ea] shadow-[0_18px_42px_-36px_rgba(162,119,255,0.34)]"
          type="button"
        >
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8657ea]/70">Quick Action</p>
          <p className="mt-2 font-headline text-xl font-black">Adjust Point</p>
          <p className="mt-1 text-sm font-medium text-[#8657ea]/75">Tambah atau koreksi poin loyalty secara manual.</p>
        </button>
      </div>

      <div className="mt-4 grid gap-3">
        <ContactLine icon="mail" label="Email" value={customer.email || "Belum ada email"} active={Boolean(customer.email)} />
        <ContactLine icon="call" label="Telepon" value={customer.phone || "Belum ada nomor"} active={Boolean(customer.phone)} />
      </div>

      <div className="mt-4 rounded-xl border border-[#ecdfff] bg-white/70 p-4">
        <div className={`mb-4 h-1.5 rounded-full bg-gradient-to-r ${style.line}`} />
        <p className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant/70">Engagement Notes</p>
        <div className="mt-4 grid gap-3">
          <DetailStat label="Customer Segment" value={customer.segment || "RETAIL"} icon="loyalty" />
          <DetailStat label="Loyalty Signal" value={loyaltyPoints >= 10 ? "Kuat" : "Awal"} icon="monitoring" />
          <DetailStat label="Active Points" value={`${loyaltyPoints} poin`} icon="rewarded_ads" />
          <DetailStat label="Contact Health" value={customer.email && customer.phone ? "Lengkap" : "Perlu dilengkapi"} icon="health_and_safety" />
          <DetailStat label="Next Action" value={loyaltyPoints >= 10 ? "Offer reward" : "Lengkapi profil"} icon="quickreply" />
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-[#ecdfff] bg-white/70 p-4">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant/70">Point History</p>
        <div className="mt-4 grid gap-3">
          {customer.pointHistories?.length ? (
            customer.pointHistories.map((history) => (
              <div key={history.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/78 px-4 py-3 shadow-[0_16px_36px_-32px_rgba(39, 23, 68,0.28)]">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-on-surface-variant/60">{history.type}</p>
                  <p className="mt-1 truncate font-semibold text-on-surface">{history.note || "Aktivitas poin pelanggan"}</p>
                  <p className="mt-1 text-xs font-semibold text-on-surface-variant">{formatDate(history.createdAt)}</p>
                </div>
                <div className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-black ${history.points >= 0 ? "bg-[#e6f7ef] text-[#047857]" : "bg-[#fff1f2] text-[#be123c]"}`}>
                  {history.points >= 0 ? "+" : ""}
                  {history.points}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-[#d4c8e3] bg-white/70 px-4 py-5 text-sm font-semibold text-on-surface-variant">
              Belum ada riwayat poin untuk customer ini.
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function HeroMiniStat({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-xl border border-white/16 bg-white/10 p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/55">{label}</span>
        <span className="material-symbols-outlined text-[18px] text-[#a7f3d0]">{icon}</span>
      </div>
      <div className="mt-3 truncate font-headline text-xl font-black tracking-[-0.04em]">{value}</div>
    </div>
  );
}

function FilterChip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-black ${
        active ? "app-chip-active" : "app-chip"
      }`}
      type="button"
    >
      {children}
    </button>
  );
}

function ModalField({
  label,
  icon,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
}: {
  label: string;
  icon: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant">
        {label}
        {required ? " *" : ""}
      </span>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant">
          {icon}
        </span>
        <input
          required={required}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="app-field py-3.5 pl-12 pr-4 text-sm font-semibold"
          placeholder={placeholder}
        />
      </div>
    </label>
  );
}

function ModalSelectField({
  label,
  icon,
  value,
  onChange,
  options,
}: {
  label: string;
  icon: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant">
        {label}
      </span>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant">
          {icon}
        </span>
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="app-field w-full py-3.5 pl-12 pr-4 text-sm font-semibold"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
}

function MiniData({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-[#ecdfff] bg-white/70 px-3 py-2 text-center">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-on-surface-variant/60">{label}</p>
      <p className="mt-1 truncate font-headline text-sm font-black text-on-surface">{value}</p>
    </div>
  );
}

function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/14 bg-white/10 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/52">{label}</p>
      <p className="mt-2 truncate font-headline text-lg font-black tracking-[-0.04em] text-white">{value}</p>
    </div>
  );
}

function ContactLine({
  icon,
  label,
  value,
  active,
}: {
  icon: string;
  label: string;
  value: string;
  active: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#ecdfff] bg-white/72 p-4 shadow-[0_18px_42px_-36px_rgba(39, 23, 68,0.34)]">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${active ? "bg-[#e6f7ef] text-[#047857]" : "bg-[#fff1f2] text-[#be123c]"}`}>
        <span className="material-symbols-outlined text-[22px]">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-on-surface-variant/65">{label}</p>
        <p className="mt-1 truncate font-semibold text-on-surface">{value}</p>
      </div>
    </div>
  );
}

function DetailStat({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white/78 px-4 py-3 shadow-[0_16px_36px_-32px_rgba(39, 23, 68,0.28)]">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-on-surface-variant/60">{label}</p>
        <p className="mt-1 font-headline text-base font-black text-on-surface">{value}</p>
      </div>
      <span className="material-symbols-outlined text-[20px] text-[#a277ff]">{icon}</span>
    </div>
  );
}

function EmptyCustomerState({ onCreate, hasSearch }: { onCreate: () => void; hasSearch: boolean }) {
  return (
    <div className="rounded-xl border border-dashed border-[#d4c8e3] bg-white/70 p-5 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-xl bg-[#f5edff] text-[#a277ff]">
        <span className="material-symbols-outlined icon-fill text-4xl">person_search</span>
      </div>
      <p className="mt-5 font-headline text-xl font-black tracking-[-0.05em] text-on-surface">
        {hasSearch ? "Customer tidak ditemukan" : "Belum ada customer"}
      </p>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-on-surface-variant">
        {hasSearch
          ? "Coba ubah keyword atau filter supaya daftar pelanggan muncul kembali."
          : "Tambahkan customer pertama supaya CRM mulai punya data relasi pelanggan."}
      </p>
      <button onClick={onCreate} className="app-primary-btn mt-6 rounded-2xl px-5 py-3 text-sm font-black" type="button">
        Add Customer
      </button>
    </div>
  );
}

function ErrorCustomerState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-[#fecdd3] bg-[#fff7f7] p-5 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-xl bg-[#fff1f2] text-[#be123c]">
        <span className="material-symbols-outlined icon-fill text-4xl">cloud_off</span>
      </div>
      <p className="mt-5 font-headline text-2xl font-black text-on-surface">Data customer belum termuat</p>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-on-surface-variant">{message}</p>
      <button onClick={onRetry} className="mt-6 rounded-2xl bg-[#be123c] px-5 py-3 text-sm font-black text-white" type="button">
        Muat Ulang
      </button>
    </div>
  );
}

