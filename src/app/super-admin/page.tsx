"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";
import { 
  ShieldCheckIcon, 
  UsersIcon, 
  KeyIcon, 
  ArrowLeftIcon,
  CheckBadgeIcon,
  XCircleIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

export default function SuperAdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState("");

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
    } catch (err: any) {
      setError(err.message);
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
      
      // Refresh data
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId("");
    }
  }

  if (loading) {
    return <div className="p-10 flex justify-center text-pos-white/50">Memuat Panel Super Admin...</div>;
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-pos-dark-1">
        <div className="text-center">
          <XCircleIcon className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-pos-white mb-2">Akses Ditolak</h1>
          <p className="text-pos-white/60 mb-6">{error}</p>
          <Link href="/dashboard" className="px-6 py-2 bg-pos-accent text-white rounded-xl">Kembali ke Dashboard</Link>
        </div>
      </div>
    );
  }

  const activeLicenses = users.filter(u => u.license_active).length;
  const onTrial = users.filter(u => !u.license_active && new Date(u.trial_ends_at) > new Date()).length;
  const expired = users.filter(u => !u.license_active && (!u.trial_ends_at || new Date(u.trial_ends_at) < new Date())).length;

  return (
    <div className="min-h-screen bg-pos-dark-1 text-pos-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-pos-dark-2/50 backdrop-blur-xl p-6 rounded-2xl border border-pos-white/5">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 bg-pos-white/5 hover:bg-pos-white/10 rounded-xl transition-colors">
              <ArrowLeftIcon className="w-5 h-5 text-pos-white/70" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="w-6 h-6 text-emerald-400" />
                <h1 className="text-2xl font-bold tracking-tight">Super Admin Backoffice</h1>
              </div>
              <p className="text-sm text-pos-white/50 mt-1">SaaS License & Tenant Management</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-pos-dark-2 p-5 rounded-2xl border border-pos-white/5">
            <div className="flex items-center gap-3 mb-2">
              <UsersIcon className="w-5 h-5 text-blue-400" />
              <h3 className="text-pos-white/60 text-sm">Total Tenants</h3>
            </div>
            <p className="text-3xl font-black">{users.length}</p>
          </div>
          <div className="bg-pos-dark-2 p-5 rounded-2xl border border-pos-white/5">
            <div className="flex items-center gap-3 mb-2">
              <CheckBadgeIcon className="w-5 h-5 text-emerald-400" />
              <h3 className="text-pos-white/60 text-sm">Active Licenses</h3>
            </div>
            <p className="text-3xl font-black">{activeLicenses}</p>
          </div>
          <div className="bg-pos-dark-2 p-5 rounded-2xl border border-pos-white/5">
            <div className="flex items-center gap-3 mb-2">
              <ClockIcon className="w-5 h-5 text-yellow-400" />
              <h3 className="text-pos-white/60 text-sm">On Trial (7 Days)</h3>
            </div>
            <p className="text-3xl font-black">{onTrial}</p>
          </div>
          <div className="bg-pos-dark-2 p-5 rounded-2xl border border-pos-white/5">
            <div className="flex items-center gap-3 mb-2">
              <XCircleIcon className="w-5 h-5 text-red-400" />
              <h3 className="text-pos-white/60 text-sm">Expired</h3>
            </div>
            <p className="text-3xl font-black">{expired}</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-pos-dark-2 rounded-2xl border border-pos-white/5 overflow-hidden">
          <div className="p-5 border-b border-pos-white/5 flex items-center justify-between">
            <h2 className="text-lg font-bold">Registered Tenants</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-pos-white/5 text-pos-white/60">
                <tr>
                  <th className="p-4 font-medium">Tenant</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Valid Until</th>
                  <th className="p-4 font-medium text-right">License Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pos-white/5">
                {users.map((user) => {
                  const isTrial = !user.license_active && new Date(user.trial_ends_at) > new Date();
                  const isExpired = !user.license_active && (!user.trial_ends_at || new Date(user.trial_ends_at) < new Date());
                  
                  return (
                    <tr key={user.id} className="hover:bg-pos-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-pos-white">{user.name}</div>
                        <div className="text-pos-white/50 text-xs mt-1">{user.email}</div>
                        <div className="text-pos-white/30 text-[10px] mt-1">Joined: {format(new Date(user.created_at), 'dd MMM yyyy')}</div>
                      </td>
                      <td className="p-4">
                        {user.license_active ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                            Licensed
                          </span>
                        ) : isTrial ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-yellow-500/10 text-yellow-400 text-xs font-medium border border-yellow-500/20">
                            Trial
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-red-500/10 text-red-400 text-xs font-medium border border-red-500/20">
                            Expired
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {user.license_active ? (
                          <span className="text-pos-white/50 text-xs">Lifetime / Custom</span>
                        ) : user.trial_ends_at ? (
                          <span className={`text-xs ${isExpired ? 'text-red-400' : 'text-pos-white/70'}`}>
                            {format(new Date(user.trial_ends_at), 'dd MMM yyyy, HH:mm', { locale: id })}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!user.license_active && (
                            <button
                              onClick={() => updateLicense(user.id, 'activate_license')}
                              disabled={processingId === user.id}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs rounded-lg transition-colors font-medium disabled:opacity-50"
                            >
                              Activate License
                            </button>
                          )}
                          {!user.license_active && (
                            <button
                              onClick={() => updateLicense(user.id, 'extend_trial', 30)}
                              disabled={processingId === user.id}
                              className="px-3 py-1.5 bg-pos-white/10 hover:bg-pos-white/20 text-pos-white text-xs rounded-lg transition-colors font-medium disabled:opacity-50"
                            >
                              +30 Days
                            </button>
                          )}
                          {user.license_active && (
                            <button
                              onClick={() => updateLicense(user.id, 'revoke')}
                              disabled={processingId === user.id}
                              className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20 text-xs rounded-lg transition-colors font-medium disabled:opacity-50"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-pos-white/50">
                      Belum ada tenant yang terdaftar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
