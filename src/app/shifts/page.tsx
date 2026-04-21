"use client";
import { useState, useEffect, useCallback } from "react";
import ResponsiveLayout from "@/components/layout/ResponsiveLayout";

interface Shift {
  id: string;
  startingCash: number;
  actualCash?: number;
  status: "ACTIVE" | "CLOSED";
  startTime: string;
  endTime?: string;
  user?: { name: string };
  branch?: { name: string };
}

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [elapsed, setElapsed] = useState("00:00:00");

  // Close shift form
  const [actualCash, setActualCash] = useState("");
  const [isClosing, setIsClosing] = useState(false);

  // Open shift form
  const [isOpenShiftOpen, setIsOpenShiftOpen] = useState(false);
  const [startingCash, setStartingCash] = useState("500000");
  const [isOpening, setIsOpening] = useState(false);

  const fetchShifts = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/shifts");
    if (res.ok) {
      const data: Shift[] = await res.json();
      setShifts(data);
      const open = data.find((s) => s.status === "ACTIVE");
      setActiveShift(open ?? null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  // Live elapsed timer
  useEffect(() => {
    if (!activeShift) return;
    const tick = () => {
      const diff = Date.now() - new Date(activeShift.startTime).getTime();
      const h = Math.floor(diff / 3600000).toString().padStart(2, "0");
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, "0");
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, "0");
      setElapsed(`${h}h ${m}m ${s}s`);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [activeShift]);

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpening(true);
    const res = await fetch("/api/shifts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "open", startingCash: parseFloat(startingCash) }),
    });
    setIsOpening(false);
    if (res.ok) {
      setIsOpenShiftOpen(false);
      fetchShifts();
    } else {
      const err = await res.json();
      alert(err.error);
    }
  };

  const handleCloseShift = async () => {
    if (!activeShift || !actualCash) return;
    setIsClosing(true);
    const res = await fetch("/api/shifts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "close",
        shiftId: activeShift.id,
        actualCash: parseFloat(actualCash),
      }),
    });
    setIsClosing(false);
    if (res.ok) {
      setActualCash("");
      fetchShifts();
    } else {
      const err = await res.json();
      alert(err.error);
    }
  };

  const variance =
    activeShift && actualCash
      ? parseFloat(actualCash) - activeShift.startingCash
      : null;

  return (
    <ResponsiveLayout>
      {/* Open Shift Modal */}
      {isOpenShiftOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-container-lowest w-full max-w-sm rounded-2xl shadow-xl">
            <div className="px-6 py-4 border-b border-surface-container flex justify-between items-center">
              <h2 className="font-headline font-bold text-lg text-on-surface">Open New Shift</h2>
              <button onClick={() => setIsOpenShiftOpen(false)}><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleOpenShift} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-label text-xs font-semibold text-on-surface-variant uppercase">Opening Cash Balance (Rp)</label>
                <input
                  type="number"
                  required
                  value={startingCash}
                  onChange={(e) => setStartingCash(e.target.value)}
                  className="px-3 py-3 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm font-mono text-on-surface outline-none focus:ring-1 focus:ring-secondary"
                  placeholder="500000"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsOpenShiftOpen(false)} className="px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container rounded-lg">Cancel</button>
                <button type="submit" disabled={isOpening} className="px-6 py-2 text-sm font-medium bg-secondary text-on-secondary rounded-lg disabled:opacity-50">
                  {isOpening ? "Opening..." : "Open Shift"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 w-full relative">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-headline font-bold text-on-surface tracking-tight">Shift Management</h1>
              <p className="text-on-surface-variant text-sm font-body mt-1">Manage active cashier sessions and perform closing audits.</p>
            </div>
            <div className="flex gap-3">
              <button className="bg-surface-container-highest text-on-surface px-4 py-2 rounded-lg font-label font-medium hover:bg-surface-variant transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">print</span>
                Print Z-Report
              </button>
              {activeShift ? (
                <button
                  onClick={handleCloseShift}
                  disabled={isClosing || !actualCash}
                  className="bg-gradient-to-br from-secondary to-secondary-container text-white px-5 py-2 rounded-lg font-label font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[20px]">lock_clock</span>
                  {isClosing ? "Closing..." : "Close Shift"}
                </button>
              ) : (
                <button
                  onClick={() => setIsOpenShiftOpen(true)}
                  className="bg-gradient-to-br from-secondary to-secondary-container text-white px-5 py-2 rounded-lg font-label font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">play_circle</span>
                  Open Shift
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column */}
            <div className="md:col-span-8 flex flex-col gap-6">
              {loading ? (
                <div className="bg-surface-container-lowest p-8 rounded-xl text-center text-on-surface-variant">Loading shifts...</div>
              ) : activeShift ? (
                /* Active Shift Banner */
                <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden shadow-sm border border-outline-variant/15">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#6ffbbe]/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined text-[28px]">account_circle</span>
                      </div>
                      <div>
                        <h2 className="text-xl font-headline font-bold text-on-surface">{activeShift.user?.name ?? "Current Session"}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="bg-[#6ffbbe]/20 text-[#005236] px-2 py-0.5 rounded-full text-xs font-label font-bold flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-[#6ffbbe] rounded-full animate-pulse"></div> Active Now
                          </span>
                          {activeShift.branch && <span className="text-sm text-on-surface-variant font-body">{activeShift.branch.name}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-on-surface-variant font-label">Elapsed Time</p>
                      <p className="text-2xl font-headline font-bold text-on-surface tracking-tight mt-1 tabular-nums">{elapsed}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-t border-outline-variant/10 pt-6">
                    <div>
                      <p className="text-sm text-on-surface-variant font-label mb-1">Opening Balance</p>
                      <p className="text-lg font-headline font-bold text-on-surface">
                        Rp {Number(activeShift.startingCash).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-on-surface-variant font-label mb-1">Opened At</p>
                      <p className="text-lg font-headline font-bold text-secondary">
                        {new Date(activeShift.startTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-on-surface-variant font-label mb-1">Status</p>
                      <p className="text-lg font-headline font-bold text-on-surface">{activeShift.status}</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* No Active Shift */
                <div className="bg-surface-container-lowest p-8 rounded-xl text-center shadow-sm border border-outline-variant/15">
                  <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-3 block">lock_clock</span>
                  <h3 className="font-headline font-bold text-on-surface text-lg mb-2">No Active Shift</h3>
                  <p className="font-body text-sm text-on-surface-variant mb-4">Start a shift to begin processing transactions.</p>
                  <button
                    onClick={() => setIsOpenShiftOpen(true)}
                    className="px-6 py-2.5 bg-secondary text-on-secondary rounded-lg font-body text-sm font-medium hover:opacity-90 transition-all"
                  >
                    Open New Shift
                  </button>
                </div>
              )}

              {/* Shift History */}
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/15">
                <h3 className="text-lg font-headline font-bold text-on-surface mb-4">Shift History</h3>
                {shifts.length === 0 ? (
                  <p className="text-sm text-on-surface-variant text-center py-4">No shifts recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {shifts.slice(0, 10).map((shift) => (
                      <div key={shift.id} className="flex items-center justify-between p-3 hover:bg-surface-container-highest rounded-xl transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full ${shift.status === "ACTIVE" ? "bg-[#6ffbbe] animate-pulse" : "bg-outline-variant"}`}></div>
                          <div>
                            <p className="font-label font-semibold text-on-surface text-sm">{shift.user?.name ?? "Unknown"}</p>
                            <p className="text-xs text-on-surface-variant mt-0.5">
                              {new Date(shift.startTime).toLocaleDateString("id-ID")} •{" "}
                              {new Date(shift.startTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                              {shift.endTime && ` — ${new Date(shift.endTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${shift.status === "ACTIVE" ? "bg-[#6ffbbe]/20 text-[#005236]" : "bg-surface-container text-on-surface-variant"}`}>
                            {shift.status}
                          </span>
                          {shift.actualCash != null && (
                            <p className="text-xs text-on-surface-variant mt-0.5 font-mono">
                              Rp {Number(shift.actualCash).toLocaleString("id-ID")}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Reconciliation */}
            {activeShift && (
              <div className="md:col-span-4 bg-surface-container-low rounded-xl p-1 shadow-inner border border-outline-variant/10">
                <div className="bg-surface-container-lowest h-full rounded-lg p-6 flex flex-col border border-outline-variant/15 shadow-sm">
                  <h3 className="text-lg font-headline font-bold text-on-surface mb-2">Shift Reconciliation</h3>
                  <p className="text-sm text-on-surface-variant font-body mb-6">Enter actual drawer cash to close this shift.</p>

                  <div className="space-y-5 flex-1">
                    <div>
                      <label className="block text-xs font-label font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">Opening Balance</label>
                      <div className="w-full bg-surface-container p-3 rounded-lg border border-outline-variant/20 flex justify-between items-center">
                        <span className="text-on-surface-variant font-body text-sm">Starting Cash</span>
                        <span className="font-headline font-bold text-on-surface text-lg font-mono">
                          Rp {Number(activeShift.startingCash).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-label font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">Actual Cash Counted (Rp)</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={actualCash}
                          onChange={(e) => setActualCash(e.target.value)}
                          className="w-full pl-4 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-lg focus:bg-surface-bright focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all font-headline font-bold text-lg text-on-surface outline-none"
                          placeholder="500000"
                        />
                      </div>
                    </div>

                    {variance !== null && (
                      <div className={`p-4 rounded-xl border ${variance >= 0 ? "bg-[#e6f5f0] border-[#4edea3]/40" : "bg-error-container/40 border-error-container/60"}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-sm font-label font-bold ${variance >= 0 ? "text-[#005236]" : "text-on-error-container"}`}>
                            {variance >= 0 ? "Surplus" : "Variance (Short)"}
                          </span>
                          <span className={`font-headline font-bold text-lg ${variance >= 0 ? "text-[#005236]" : "text-on-error-container"}`}>
                            {variance >= 0 ? "+" : ""}Rp {Math.abs(variance).toLocaleString("id-ID")}
                          </span>
                        </div>
                        {variance < 0 && (
                          <p className="text-xs text-on-error-container/80 font-body">Variance may require manager approval.</p>
                        )}
                      </div>
                    )}


                  </div>

                  <button
                    onClick={handleCloseShift}
                    disabled={isClosing || !actualCash}
                    className="w-full mt-6 bg-gradient-to-br from-secondary to-secondary-container text-white py-4 rounded-xl font-headline font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 flex justify-center items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isClosing ? "Closing..." : "Confirm & Close Shift"}
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}
