"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import { useRouter } from "next/navigation";

import ResponsiveLayout from "@/components/layout/ResponsiveLayout";
import { AppModal } from "@/components/ui/AppModal";
import { useToast } from "@/components/ui/ToastProvider";
import { getApiErrorMessage, readApiPayload, toApiArray } from "@/lib/client-api";
import { formatCurrency } from "@/lib/format";

interface Shift {
  id: string;
  startingCash: number;
  actualCash?: number;
  expectedCash?: number;
  status: "ACTIVE" | "CLOSED";
  startTime: string;
  endTime?: string;
  user?: { name: string };
  branch?: { name: string };
}

type ShiftTone = "indigo" | "emerald" | "amber" | "coral";

const shiftPalette = [
  { name: "Midnight Shift", value: "#271744", label: "Kontrol sesi" },
  { name: "Electric Indigo", value: "#a277ff", label: "Aksi shift" },
  { name: "Mint Balance", value: "#12b981", label: "Kas aman" },
];

const quickCash = [100000, 300000, 500000, 1000000];

const toneClass: Record<ShiftTone, { icon: string; chip: string; line: string; glow: string }> = {
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDurationLabel(startTime: string, endTime?: string) {
  const diff = (endTime ? new Date(endTime).getTime() : Date.now()) - new Date(startTime).getTime();
  const hours = Math.max(0, Math.floor(diff / 3600000));
  const minutes = Math.max(0, Math.floor((diff % 3600000) / 60000));
  return `${hours}j ${String(minutes).padStart(2, "0")}m`;
}

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [elapsed, setElapsed] = useState("00:00:00");
  const [actualCash, setActualCash] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const [isOpenShiftOpen, setIsOpenShiftOpen] = useState(false);
  const [startingCash, setStartingCash] = useState("500000");
  const [isOpening, setIsOpening] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const fetchShifts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/shifts");
      const payload = await readApiPayload(res);
      if (res.ok) {
        const data = toApiArray<Shift>(payload);
        setShifts(data);
        setActiveShift(data.find((shift) => shift.status === "ACTIVE") ?? null);
      } else {
        setShifts([]);
        setActiveShift(null);
        showToast({
          title: "Shift belum bisa dimuat",
          description: getApiErrorMessage(payload, "Coba refresh halaman atau cek backend."),
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Failed to fetch shifts:", error);
      setShifts([]);
      setActiveShift(null);
      showToast({
        title: "Shift belum bisa dimuat",
        description: "Koneksi ke data shift sedang bermasalah.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void fetchShifts();
  }, [fetchShifts]);

  useEffect(() => {
    if (!activeShift) {
      setElapsed("00:00:00");
      return;
    }

    const tick = () => {
      const diff = Date.now() - new Date(activeShift.startTime).getTime();
      const hours = Math.floor(diff / 3600000).toString().padStart(2, "0");
      const minutes = Math.floor((diff % 3600000) / 60000).toString().padStart(2, "0");
      const seconds = Math.floor((diff % 60000) / 1000).toString().padStart(2, "0");
      setElapsed(`${hours}:${minutes}:${seconds}`);
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [activeShift]);

  const shiftStats = useMemo(() => {
    const closed = shifts.filter((shift) => shift.status === "CLOSED");
    const expectedCashTotal = shifts.reduce(
      (sum, shift) => sum + Number(shift.expectedCash ?? shift.startingCash ?? 0),
      0,
    );
    const actualCashTotal = closed.reduce((sum, shift) => sum + Number(shift.actualCash ?? 0), 0);
    const varianceTotal = closed.reduce(
      (sum, shift) => sum + (Number(shift.actualCash ?? 0) - Number(shift.expectedCash ?? shift.startingCash ?? 0)),
      0,
    );

    return {
      activeCount: activeShift ? 1 : 0,
      closedCount: closed.length,
      expectedCashTotal,
      actualCashTotal,
      varianceTotal,
    };
  }, [activeShift, shifts]);

  const variance =
    activeShift && actualCash
      ? parseFloat(actualCash) - Number(activeShift.expectedCash ?? activeShift.startingCash)
      : null;

  const handleOpenShift = async (event: FormEvent) => {
    event.preventDefault();
    setIsOpening(true);
    try {
      const res = await fetch("/api/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "open", startingCash: parseFloat(startingCash) }),
      });
      const payload = await readApiPayload(res);

      if (res.ok) {
        setIsOpenShiftOpen(false);
        void fetchShifts();
        showToast({
          title: "Shift berhasil dibuka",
          description: "Kasir siap menerima transaksi baru.",
          variant: "success",
        });
      } else {
        showToast({
          title: "Shift gagal dibuka",
          description: getApiErrorMessage(payload, "Shift belum berhasil dibuka."),
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Failed to open shift:", error);
      showToast({
        title: "Shift gagal dibuka",
        description: "Cek koneksi backend atau coba ulang beberapa saat lagi.",
        variant: "error",
      });
    } finally {
      setIsOpening(false);
    }
  };

  const handleCloseShift = async () => {
    if (!activeShift || !actualCash) return;

    setIsClosing(true);
    try {
      const res = await fetch("/api/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "close",
          shiftId: activeShift.id,
          actualCash: parseFloat(actualCash),
        }),
      });
      const payload = await readApiPayload(res);

      if (res.ok) {
        setActualCash("");
        void fetchShifts();
        showToast({
          title: "Shift berhasil ditutup",
          description: "Rekonsiliasi kas sudah tersimpan.",
          variant: "success",
        });
      } else {
        showToast({
          title: "Shift gagal ditutup",
          description: getApiErrorMessage(payload, "Shift belum berhasil ditutup."),
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Failed to close shift:", error);
      showToast({
        title: "Shift gagal ditutup",
        description: "Cek koneksi backend atau coba ulang beberapa saat lagi.",
        variant: "error",
      });
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <ResponsiveLayout>
      <AppModal
        open={isOpenShiftOpen}
        onClose={() => setIsOpenShiftOpen(false)}
        title="Buka Shift Baru"
        description="Tentukan kas awal agar rekonsiliasi shift lebih akurat."
        icon="play_circle"
        size="sm"
      >
        <form onSubmit={handleOpenShift} className="space-y-5">
          <div className="rounded-[28px] bg-[linear-gradient(135deg,#271744_0%,#a277ff_100%)] p-5 text-white">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-white/55">Opening Session</p>
            <h3 className="mt-3 font-headline text-3xl font-black tracking-[-0.05em]">Kas awal shift</h3>
            <p className="mt-2 text-sm font-medium text-white/68">Nominal ini jadi baseline saat shift ditutup.</p>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant">
              Opening Cash Balance (Rp)
            </span>
            <input
              type="number"
              required
              value={startingCash}
              onChange={(event) => setStartingCash(event.target.value)}
              className="app-field px-4 py-3.5 text-sm font-semibold"
              placeholder="500000"
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            {quickCash.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setStartingCash(String(amount))}
                className="rounded-2xl border border-[#ecdfff] bg-white/78 px-3 py-2 text-sm font-black text-on-surface-variant hover:bg-[#f5edff] hover:text-[#a277ff]"
              >
                {formatCurrency(amount)}
              </button>
            ))}
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setIsOpenShiftOpen(false)} className="app-secondary-btn rounded-2xl px-5 py-3 text-sm font-black">
              Cancel
            </button>
            <button type="submit" disabled={isOpening} className="app-primary-btn rounded-2xl px-6 py-3 text-sm font-black disabled:opacity-60">
              {isOpening ? "Opening..." : "Open Shift"}
            </button>
          </div>
        </form>
      </AppModal>

      <div className="h-full overflow-y-auto px-4 py-5 pb-28 md:px-6 md:pb-8">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-6">
          <section className="shift-entrance shift-sheen relative overflow-hidden rounded-[36px] border border-white/70 bg-[linear-gradient(135deg,#271744_0%,#5c3d99_50%,#a277ff_100%)] p-5 text-white shadow-[0_28px_90px_-58px_rgba(17,24,39,0.82)] sm:p-7">
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#12b981]/22" />
            <div className="pointer-events-none absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-[#f59e0b]/14" />

            <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(420px,0.8fr)] xl:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-white/75">
                  <span className={`h-2 w-2 rounded-full ${activeShift ? "bg-[#12b981]" : "bg-[#f59e0b]"} shift-live-dot`} />
                  Shift Control Center
                </div>
                <h1 className="mt-5 max-w-3xl font-headline text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl xl:text-6xl">
                  Shift kasir lebih jelas, disiplin, dan mudah direkonsiliasi.
                </h1>
                <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-white/72 sm:text-base">
                  Buka sesi, pantau timer, cek kas ekspektasi, lalu tutup shift dengan variance yang langsung terbaca.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {shiftPalette.map((color) => (
                    <div key={color.name} className="flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-3 py-2 text-xs font-bold text-white/82">
                      <span className="h-3 w-3 rounded-full" style={{ background: color.value }} />
                      <span>{color.name}</span>
                      <span className="hidden text-white/45 sm:inline">/ {color.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <HeroMiniStat label="Status" value={activeShift ? "Active" : "Closed"} icon={activeShift ? "play_circle" : "lock_clock"} />
                <HeroMiniStat label="Timer" value={activeShift ? elapsed : "00:00:00"} icon="timer" />
                <HeroMiniStat label="Sessions" value={String(shifts.length)} icon="history" />
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ShiftKpi
              label="Active Shift"
              value={activeShift ? "ON" : "OFF"}
              icon={activeShift ? "play_circle" : "lock_clock"}
              tone={activeShift ? "emerald" : "amber"}
              meta={activeShift ? activeShift.user?.name ?? "Kasir aktif" : "Belum ada shift aktif"}
              delay={40}
            />
            <ShiftKpi
              label="Closed Sessions"
              value={String(shiftStats.closedCount)}
              icon="task_alt"
              tone="indigo"
              meta={`${shifts.length} total session`}
              delay={90}
            />
            <ShiftKpi
              label="Expected Cash"
              value={formatCurrency(shiftStats.expectedCashTotal)}
              icon="payments"
              tone="emerald"
              meta="Akumulasi sesi"
              delay={140}
            />
            <ShiftKpi
              label="Variance"
              value={formatCurrency(shiftStats.varianceTotal)}
              icon="balance"
              tone={shiftStats.varianceTotal < 0 ? "coral" : "amber"}
              meta={shiftStats.actualCashTotal > 0 ? "Closed session variance" : "Belum ada kas aktual"}
              delay={190}
            />
          </section>

          <section className="shift-entrance grid gap-3 lg:grid-cols-3" style={{ "--delay": "240ms" } as CSSProperties}>
            <ActionButton
              icon="point_of_sale"
              label="Buka Kasir"
              description="Masuk ke layar transaksi"
              tone="indigo"
              onClick={() => router.push("/")}
            />
            <ActionButton
              icon="print"
              label="Print Z-Report"
              description="Export penutupan shift"
              tone="amber"
              onClick={() =>
                showToast({
                  title: "Z-Report belum diaktifkan",
                  description: "Begitu modul export siap, tombol ini akan menghasilkan laporan penutupan shift.",
                  variant: "info",
                })
              }
            />
            <ActionButton
              icon="refresh"
              label="Refresh Shift"
              description="Sinkron ulang sesi"
              tone="emerald"
              onClick={() => void fetchShifts()}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.42fr)_minmax(360px,0.78fr)]">
            <div className="flex flex-col gap-6">
              {loading ? (
                <div className="shift-entrance rounded-[34px] border border-white/70 bg-white/76 p-8 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)]">
                  <div className="h-72 animate-pulse rounded-[30px] bg-white/80" />
                </div>
              ) : activeShift ? (
                <ActiveShiftPanel activeShift={activeShift} elapsed={elapsed} actualCash={actualCash} setActualCash={setActualCash} variance={variance} isClosing={isClosing} onCloseShift={handleCloseShift} />
              ) : (
                <NoActiveShiftPanel onOpen={() => setIsOpenShiftOpen(true)} />
              )}

              <ShiftHistory shifts={shifts} loading={loading} />
            </div>

            <aside className="flex flex-col gap-6">
              {activeShift ? (
                <ReconciliationPanel
                  activeShift={activeShift}
                  actualCash={actualCash}
                  setActualCash={setActualCash}
                  variance={variance}
                  isClosing={isClosing}
                  onCloseShift={handleCloseShift}
                />
              ) : null}

              <section className="shift-entrance rounded-[34px] border border-white/70 bg-white/76 p-4 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)]" style={{ "--delay": "340ms" } as CSSProperties}>
                <div className="overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#ffffff_0%,#f5edff_100%)] p-5">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#a277ff]/70">Tip Operasional</p>
                  <h3 className="mt-3 font-headline text-3xl font-black tracking-[-0.05em] text-on-surface">
                    Shift rapi bikin laporan kas makin akurat.
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                    Pastikan kas awal benar, lalu tutup shift setiap pergantian operator agar selisih kas mudah dilacak.
                  </p>
                </div>
              </section>
            </aside>
          </section>
        </div>
      </div>
    </ResponsiveLayout>
  );
}

function ActiveShiftPanel({
  activeShift,
  elapsed,
}: {
  activeShift: Shift;
  elapsed: string;
  actualCash: string;
  setActualCash: (value: string) => void;
  variance: number | null;
  isClosing: boolean;
  onCloseShift: () => void;
}) {
  return (
    <section className="shift-entrance overflow-hidden rounded-[34px] border border-white/70 bg-white/76 p-4 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)]" style={{ "--delay": "280ms" } as CSSProperties}>
      <div className="rounded-[30px] bg-[linear-gradient(135deg,#271744_0%,#a277ff_100%)] p-5 text-white shadow-[0_28px_70px_-44px_rgba(162, 119, 255,0.92)] sm:p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div className="flex gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[24px] bg-white/12 text-white">
              <span className="material-symbols-outlined icon-fill text-[32px]">account_circle</span>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-white/55">Active Session</p>
              <h2 className="mt-2 font-headline text-3xl font-black tracking-[-0.05em]">{activeShift.user?.name ?? "Current Session"}</h2>
              <p className="mt-1 text-sm font-medium text-white/68">{activeShift.branch?.name ?? "Cabang aktif"}</p>
            </div>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/16 bg-white/12 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white">
            <span className="h-2 w-2 rounded-full bg-[#12b981] shift-live-dot" />
            Active
          </span>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <SessionBox label="Elapsed Time" value={elapsed} icon="timer" />
          <SessionBox label="Started" value={`${formatDate(activeShift.startTime)} ${formatTime(activeShift.startTime)}`} icon="schedule" />
          <SessionBox label="Duration" value={getDurationLabel(activeShift.startTime)} icon="hourglass_top" />
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <MetricBox label="Opening Balance" value={formatCurrency(Number(activeShift.startingCash))} tone="indigo" />
        <MetricBox label="Expected Cash" value={formatCurrency(Number(activeShift.expectedCash ?? activeShift.startingCash))} tone="emerald" />
        <MetricBox label="Branch" value={activeShift.branch?.name ?? "Main Branch"} tone="amber" />
      </div>
    </section>
  );
}

function ReconciliationPanel({
  activeShift,
  actualCash,
  setActualCash,
  variance,
  isClosing,
  onCloseShift,
}: {
  activeShift: Shift;
  actualCash: string;
  setActualCash: (value: string) => void;
  variance: number | null;
  isClosing: boolean;
  onCloseShift: () => void;
}) {
  return (
    <section className="shift-entrance rounded-[34px] border border-white/70 bg-white/76 p-4 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)] xl:sticky xl:top-4" style={{ "--delay": "320ms" } as CSSProperties}>
      <div className="overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#271744_0%,#a277ff_100%)] p-5 text-white">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-white/55">Close Shift</p>
        <h3 className="mt-3 font-headline text-3xl font-black tracking-[-0.05em]">Rekonsiliasi kas</h3>
        <p className="mt-2 text-sm font-medium text-white/68">Masukkan kas aktual untuk melihat variance sebelum closing.</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <SummaryBox label="Opening" value={formatCurrency(Number(activeShift.startingCash))} />
          <SummaryBox label="Expected" value={formatCurrency(Number(activeShift.expectedCash ?? activeShift.startingCash))} />
        </div>
      </div>

      <div className="mt-4 rounded-[30px] border border-[#ecdfff] bg-white/70 p-4">
        <label className="block">
          <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant">
            Actual Cash Counted (Rp)
          </span>
          <input
            type="number"
            value={actualCash}
            onChange={(event) => setActualCash(event.target.value)}
            className="app-field px-4 py-3.5 text-sm font-semibold"
            placeholder="500000"
          />
        </label>

        {variance !== null ? <VarianceCard variance={variance} /> : null}

        <button
          onClick={onCloseShift}
          disabled={isClosing || !actualCash}
          className="app-primary-btn mt-5 w-full rounded-[24px] px-6 py-4 text-sm font-black disabled:opacity-60"
          type="button"
        >
          {isClosing ? "Closing..." : "Confirm & Close Shift"}
        </button>
      </div>
    </section>
  );
}

function NoActiveShiftPanel({ onOpen }: { onOpen: () => void }) {
  return (
    <section className="shift-entrance rounded-[34px] border border-white/70 bg-white/76 p-4 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)]" style={{ "--delay": "280ms" } as CSSProperties}>
      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[30px] border border-dashed border-[#d4c8e3] bg-white/62 p-8 text-center">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-[34px] bg-[#f5edff] text-[#a277ff]">
          <span className="material-symbols-outlined icon-fill text-5xl">lock_clock</span>
          <span className="shift-scan absolute inset-x-5 bottom-6 h-1 rounded-full bg-[#12b981]" />
        </div>
        <p className="mt-5 font-headline text-3xl font-black tracking-[-0.05em] text-on-surface">Belum ada shift aktif</p>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-on-surface-variant">
          Buka shift baru supaya kasir bisa menerima transaksi dan sistem mulai menghitung performa kas.
        </p>
        <button onClick={onOpen} className="app-primary-btn mt-6 rounded-[24px] px-6 py-3 text-sm font-black" type="button">
          Open New Shift
        </button>
      </div>
    </section>
  );
}

function ShiftHistory({ shifts, loading }: { shifts: Shift[]; loading: boolean }) {
  return (
    <section className="shift-entrance overflow-hidden rounded-[34px] border border-white/70 bg-white/76 shadow-[0_24px_70px_-54px_rgba(39, 23, 68,0.38)]" style={{ "--delay": "360ms" } as CSSProperties}>
      <div className="flex flex-col justify-between gap-3 border-b border-[#ecdfff] px-5 py-4 md:flex-row md:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#a277ff]/75">Session Ledger</p>
          <h3 className="mt-2 font-headline text-2xl font-black tracking-[-0.05em] text-on-surface">Shift History</h3>
        </div>
        <div className="rounded-full bg-[#f5edff] px-4 py-2 text-sm font-black text-[#8657ea]">{shifts.length} session</div>
      </div>

      {loading ? (
        <div className="grid gap-3 p-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-[28px] bg-white/80" />
          ))}
        </div>
      ) : shifts.length === 0 ? (
        <div className="p-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[30px] bg-[#f5edff] text-[#a277ff]">
            <span className="material-symbols-outlined icon-fill text-4xl">history</span>
          </div>
          <p className="mt-5 font-headline text-2xl font-black text-on-surface">Belum ada riwayat shift</p>
          <p className="mt-2 text-sm text-on-surface-variant">Riwayat shift akan muncul setelah sesi pertama dibuka.</p>
        </div>
      ) : (
        <div className="grid gap-3 p-4">
          {shifts.slice(0, 10).map((shift, index) => (
            <ShiftHistoryRow key={shift.id} shift={shift} delay={index * 30} />
          ))}
        </div>
      )}
    </section>
  );
}

function ShiftHistoryRow({ shift, delay }: { shift: Shift; delay: number }) {
  const variance =
    shift.actualCash != null
      ? Number(shift.actualCash) - Number(shift.expectedCash ?? shift.startingCash)
      : null;

  return (
    <div
      className="shift-row rounded-[28px] border border-white/70 bg-white/78 p-4 shadow-[0_20px_54px_-42px_rgba(39, 23, 68,0.38)]"
      style={{ "--delay": `${delay}ms` } as CSSProperties}
    >
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex min-w-0 items-center gap-4">
          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] ${shift.status === "ACTIVE" ? "bg-[#e6f7ef] text-[#047857]" : "bg-[#f5edff] text-[#a277ff]"}`}>
            <span className="material-symbols-outlined icon-fill text-[24px]">{shift.status === "ACTIVE" ? "play_circle" : "task_alt"}</span>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-headline text-xl font-black tracking-[-0.04em] text-on-surface">{shift.user?.name ?? "Unknown Operator"}</p>
              <StatusBadge status={shift.status} />
            </div>
            <p className="mt-1 text-sm font-semibold text-on-surface-variant">
              {formatDate(shift.startTime)} - {formatTime(shift.startTime)}
              {shift.endTime ? ` - ${formatTime(shift.endTime)}` : ""}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:min-w-[360px]">
          <MiniData label="Duration" value={getDurationLabel(shift.startTime, shift.endTime)} />
          <MiniData label="Actual" value={shift.actualCash != null ? formatCurrency(Number(shift.actualCash)) : "-"} />
          <MiniData label="Variance" value={variance == null ? "-" : formatCurrency(variance)} />
        </div>
      </div>
    </div>
  );
}

function ShiftKpi({
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
  tone: ShiftTone;
  meta: string;
  delay: number;
}) {
  const style = toneClass[tone];

  return (
    <div
      className="shift-entrance group relative overflow-hidden rounded-[30px] border border-white/70 bg-white/78 p-5 shadow-[0_24px_70px_-48px_rgba(39, 23, 68,0.38)] hover:-translate-y-1 hover:bg-white"
      style={{ "--delay": `${delay}ms` } as CSSProperties}
    >
      <div className={`pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-gradient-to-br ${style.glow}`} />
      <div className={`absolute inset-x-5 bottom-0 h-1 rounded-full bg-gradient-to-r ${style.line}`} />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant/70">{label}</p>
          <p className="mt-4 font-headline text-3xl font-black tracking-[-0.05em] text-on-surface sm:text-4xl">{value}</p>
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

function ActionButton({
  icon,
  label,
  description,
  tone,
  onClick,
}: {
  icon: string;
  label: string;
  description: string;
  tone: ShiftTone;
  onClick: () => void;
}) {
  const style = toneClass[tone];

  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-[28px] border border-white/70 bg-white/76 p-5 text-left shadow-[0_20px_54px_-42px_rgba(39, 23, 68,0.38)] hover:-translate-y-1 hover:bg-white"
      type="button"
    >
      <div className={`absolute inset-x-5 top-0 h-1 rounded-full bg-gradient-to-r ${style.line}`} />
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-headline text-lg font-black text-on-surface">{label}</p>
          <p className="mt-1 text-sm font-medium text-on-surface-variant">{description}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${style.icon}`}>
          <span className="material-symbols-outlined text-[23px]">{icon}</span>
        </div>
      </div>
    </button>
  );
}

function HeroMiniStat({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-[24px] border border-white/16 bg-white/10 p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/55">{label}</span>
        <span className="material-symbols-outlined text-[18px] text-[#a7f3d0]">{icon}</span>
      </div>
      <div className="mt-3 truncate font-headline text-xl font-black tracking-[-0.04em]">{value}</div>
    </div>
  );
}

function SessionBox({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-[24px] border border-white/14 bg-white/10 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/52">{label}</p>
        <span className="material-symbols-outlined text-[18px] text-[#a7f3d0]">{icon}</span>
      </div>
      <p className="mt-2 truncate font-headline text-xl font-black text-white">{value}</p>
    </div>
  );
}

function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/14 bg-white/10 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/52">{label}</p>
      <p className="mt-2 truncate font-headline text-lg font-black text-white">{value}</p>
    </div>
  );
}

function MetricBox({ label, value, tone }: { label: string; value: string; tone: ShiftTone }) {
  const style = toneClass[tone];

  return (
    <div className="relative overflow-hidden rounded-[26px] border border-white/70 bg-white/78 p-4 shadow-[0_18px_42px_-34px_rgba(39, 23, 68,0.34)]">
      <div className={`absolute inset-x-4 bottom-0 h-1 rounded-full bg-gradient-to-r ${style.line}`} />
      <p className="text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant/70">{label}</p>
      <p className="mt-2 truncate font-headline text-2xl font-black text-on-surface">{value}</p>
    </div>
  );
}

function MiniData({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] bg-[#f8f9ff] px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-on-surface-variant/60">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-on-surface">{value}</p>
    </div>
  );
}

function VarianceCard({ variance }: { variance: number }) {
  const positive = variance >= 0;

  return (
    <div className={`mt-4 rounded-[26px] border px-4 py-4 ${
      positive ? "border-[#bbf7d0] bg-[#ecfdf5] text-[#047857]" : "border-[#fecdd3] bg-[#fff1f2] text-[#be123c]"
    }`}>
      <p className="text-xs font-black uppercase tracking-[0.18em]">Variance</p>
      <p className="mt-2 font-headline text-3xl font-black tracking-[-0.05em]">
        {positive ? "+" : "-"}{formatCurrency(Math.abs(variance))}
      </p>
      <p className="mt-1 text-sm font-semibold opacity-80">
        {positive ? "Kas aktual lebih besar dari ekspektasi." : "Kas aktual lebih kecil dari ekspektasi."}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: "ACTIVE" | "CLOSED" }) {
  const active = status === "ACTIVE";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black ${
      active ? "bg-[#e6f7ef] text-[#047857]" : "bg-[#f5edff] text-[#8657ea]"
    }`}>
      <span className="material-symbols-outlined text-[14px]">{active ? "play_circle" : "task_alt"}</span>
      {status}
    </span>
  );
}
