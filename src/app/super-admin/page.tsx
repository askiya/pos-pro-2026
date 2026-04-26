"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Users, 
  ArrowLeft,
  BadgeCheck,
  XCircle,
  Clock,
  Search,
  Key,
  Trash2
} from "lucide-react";

type UserData = {
  id: string;
  name: string;
  email: string;
  created_at: string;
  license_active: boolean;
  trial_ends_at: string | null;
};

export default function SuperAdminPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal State
  const [trialModalUser, setTrialModalUser] = useState<UserData | null>(null);
  const [customDays, setCustomDays] = useState(7);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/super-admin/users");
      if (!res.ok) {
        throw new Error("Gagal mengambil data user (Unauthorized)");
      }
      const data = await res.json();
      setUsers(data);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function updateLicense(userId: string, action: string, days = 0) {
    if (!confirm(`Apakah Anda yakin ingin melakukan aksi ini?`)) return;
    
    setProcessingId(userId);
    try {
      const res = await fetch(`/api/super-admin/users/${userId}/license`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, days }),
      });
      if (!res.ok) throw new Error("Gagal update lisensi");
      
      setTrialModalUser(null);
      fetchUsers();
    } catch (err: unknown) {
      alert((err as Error).message);
    } finally {
      setProcessingId("");
    }
  }

  async function deleteUser(userId: string, userName: string) {
    if (!confirm(`PERINGATAN KRITIS!\n\nApakah Anda YAKIN ingin MENGHAPUS PERMANEN tenant "${userName}"?\nSemua data toko, transaksi, dan inventori mereka akan musnah selamanya. Aksi ini tidak dapat dibatalkan.`)) return;
    
    setProcessingId(userId);
    try {
      const res = await fetch(`/api/super-admin/users/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus tenant");
      
      fetchUsers();
    } catch (err: unknown) {
      alert((err as Error).message);
    } finally {
      setProcessingId("");
    }
  }

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const lowerQuery = searchQuery.toLowerCase();
    return users.filter(
      u => u.name.toLowerCase().includes(lowerQuery) || u.email.toLowerCase().includes(lowerQuery)
    );
  }, [users, searchQuery]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#fcfbff]">
        <div className="animate-pulse flex flex-col items-center">
          <ShieldCheck className="h-12 w-12 text-[#a277ff] mb-4" />
          <p className="text-on-surface-variant font-medium">Memuat Command Center...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#fcfbff]">
        <div className="text-center app-surface p-8 max-w-sm w-full mx-4 rounded-3xl">
          <XCircle className="mx-auto h-16 w-16 text-rose-500 mb-4" />
          <h1 className="text-2xl font-black text-on-surface mb-2">Akses Ditolak</h1>
          <p className="text-on-surface-variant mb-6 text-sm">{error}</p>
          <Link href="/dashboard" className="block w-full text-center py-3 bg-[#271744] text-white font-bold rounded-xl hover:bg-[#3d2b5c] transition-colors">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const activeLicenses = users.filter(u => u.license_active).length;
  const onTrial = users.filter(u => !u.license_active && u.trial_ends_at && new Date(u.trial_ends_at) > new Date()).length;
  const expired = users.filter(u => !u.license_active && (!u.trial_ends_at || new Date(u.trial_ends_at) < new Date())).length;

  return (
    <div className="min-h-screen bg-[#fcfbff] text-on-surface p-4 sm:p-6 lg:p-10 font-sans selection:bg-[#a277ff]/30">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between app-surface p-5 sm:p-6 rounded-3xl gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2.5 bg-white shadow-sm border border-black/5 hover:bg-gray-50 rounded-2xl transition-transform hover:-translate-y-0.5">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-[#a277ff]" />
                <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#271744] to-[#8657ea]">Command Center</h1>
              </div>
              <p className="text-xs sm:text-sm font-medium text-on-surface-variant mt-0.5">SaaS License & Tenant Management</p>
            </div>
          </div>
          
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari nama / email tenant..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-72 pl-11 pr-4 py-3 bg-white border border-gray-200 focus:border-[#a277ff] focus:ring-4 focus:ring-[#a277ff]/10 rounded-2xl text-sm font-medium outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        {/* KPI Stats - Matching Dashboard Tone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="app-surface p-5 rounded-3xl relative overflow-hidden group hover:-translate-y-1 transition-transform">
            <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-[#f5edff] transition-transform group-hover:scale-110" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[#f5edff] rounded-xl text-[#a277ff]"><Users className="w-5 h-5" /></div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500">Total Tenants</h3>
              </div>
              <p className="text-3xl font-black text-[#271744]">{users.length}</p>
            </div>
          </div>

          <div className="app-surface p-5 rounded-3xl relative overflow-hidden group hover:-translate-y-1 transition-transform">
            <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-[#e6f7ef] transition-transform group-hover:scale-110" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[#e6f7ef] rounded-xl text-[#047857]"><BadgeCheck className="w-5 h-5" /></div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500">Active Licenses</h3>
              </div>
              <p className="text-3xl font-black text-[#047857]">{activeLicenses}</p>
            </div>
          </div>

          <div className="app-surface p-5 rounded-3xl relative overflow-hidden group hover:-translate-y-1 transition-transform">
            <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-[#fff7df] transition-transform group-hover:scale-110" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[#fff7df] rounded-xl text-[#b45309]"><Clock className="w-5 h-5" /></div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500">On Trial</h3>
              </div>
              <p className="text-3xl font-black text-[#b45309]">{onTrial}</p>
            </div>
          </div>

          <div className="app-surface p-5 rounded-3xl relative overflow-hidden group hover:-translate-y-1 transition-transform">
            <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-[#fff1f2] transition-transform group-hover:scale-110" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[#fff1f2] rounded-xl text-[#be123c]"><XCircle className="w-5 h-5" /></div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500">Expired</h3>
              </div>
              <p className="text-3xl font-black text-[#be123c]">{expired}</p>
            </div>
          </div>
        </div>

        {/* Data Grid */}
        <div className="app-surface rounded-3xl overflow-hidden shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100/60 bg-white/50 flex items-center justify-between">
            <h2 className="text-lg font-black text-[#271744]">Tenant Directory</h2>
            <span className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{filteredUsers.length} Found</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">Tenant Info</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Access Details</th>
                  <th className="px-6 py-4 text-right">Control Panel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white/40">
                {filteredUsers.map((user) => {
                  const isTrial = !user.license_active && user.trial_ends_at && new Date(user.trial_ends_at) > new Date();
                  const isExpired = !user.license_active && (!user.trial_ends_at || new Date(user.trial_ends_at) < new Date());
                  const isProcessing = processingId === user.id;
                  
                  return (
                    <tr key={user.id} className={`hover:bg-white transition-colors ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a277ff] to-[#8657ea] text-white flex items-center justify-center font-bold shadow-md">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-[#271744] text-base">{user.name}</div>
                            <div className="text-gray-500 text-xs font-medium">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.license_active ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e6f7ef] text-[#047857] text-xs font-bold border border-[#047857]/10">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#12b981] animate-pulse"></span>
                            Premium
                          </span>
                        ) : isTrial ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fff7df] text-[#b45309] text-xs font-bold border border-[#b45309]/10">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></span>
                            Trial
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fff1f2] text-[#be123c] text-xs font-bold border border-[#be123c]/10">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#e11d48]"></span>
                            Expired
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-900 font-medium text-xs">
                            {user.license_active ? (
                              <span className="text-[#047857] flex items-center gap-1"><Key className="w-3 h-3"/> Lifetime Access</span>
                            ) : user.trial_ends_at ? (
                              <span className={`${isExpired ? 'text-rose-500' : 'text-amber-600'}`}>
                                Ends: {new Date(user.trial_ends_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            ) : (
                              "-"
                            )}
                          </span>
                          <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                            Joined {new Date(user.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* Quick Actions based on state */}
                          {!user.license_active && (
                            <button
                              onClick={() => updateLicense(user.id, 'activate_license')}
                              className="px-4 py-2 bg-gradient-to-r from-[#12b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white text-xs font-bold rounded-xl shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] transition-all hover:-translate-y-0.5"
                            >
                              Activate Premium
                            </button>
                          )}
                          
                          {!user.license_active && (
                            <button
                              onClick={() => setTrialModalUser(user)}
                              className="px-4 py-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 text-xs font-bold rounded-xl shadow-sm transition-all"
                            >
                              Edit Trial
                            </button>
                          )}

                          {user.license_active && (
                            <button
                              onClick={() => updateLicense(user.id, 'revoke')}
                              className="px-4 py-2 bg-[#fff1f2] hover:bg-rose-100 text-[#be123c] text-xs font-bold rounded-xl transition-all"
                            >
                              Revoke Access
                            </button>
                          )}

                          {/* Delete Button - Always visible but styled subtly to avoid misclicks */}
                          <button
                            onClick={() => deleteUser(user.id, user.name)}
                            className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all ml-2"
                            title="Hapus Permanen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                          <Search className="w-6 h-6 text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-bold">Tidak ada tenant ditemukan</p>
                        <p className="text-sm text-gray-400 mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Trial Extension Modal */}
      {trialModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-black text-[#271744]">Perpanjang Masa Trial</h2>
              <p className="text-sm text-gray-500 font-medium mt-1">Tenant: <span className="text-[#a277ff]">{trialModalUser.name}</span></p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tambah Durasi (Hari)</label>
                <div className="flex gap-2 mb-4">
                  {[7, 14, 30].map(days => (
                    <button
                      key={days}
                      onClick={() => setCustomDays(days)}
                      className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                        customDays === days 
                          ? 'bg-[#f5edff] text-[#a277ff] border-2 border-[#a277ff]' 
                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      +{days} Hari
                    </button>
                  ))}
                </div>
                
                <div className="relative">
                  <input 
                    type="number" 
                    min="1"
                    value={customDays}
                    onChange={(e) => setCustomDays(Number(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-[#a277ff] focus:bg-white focus:ring-4 focus:ring-[#a277ff]/10 rounded-xl text-lg font-black outline-none transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Hari</div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button 
                onClick={() => setTrialModalUser(null)}
                className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={() => updateLicense(trialModalUser.id, 'extend_trial', customDays)}
                disabled={!!processingId}
                className="flex-1 py-3 bg-gradient-to-r from-[#271744] to-[#3d2b5c] text-white font-bold rounded-xl hover:shadow-[0_8px_20px_-8px_rgba(39,23,68,0.5)] transition-all disabled:opacity-50"
              >
                {processingId ? 'Memproses...' : 'Simpan Trial'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
