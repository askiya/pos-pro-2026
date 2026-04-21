"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    setLoading(false);
    if (res.ok) {
      router.push('/dashboard');
    } else {
      const err = await res.json();
      setError(err.error || 'Login failed');
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body antialiased min-h-screen flex flex-col justify-between">
      {/* Top Navigation for Context */}
      <header className="flex justify-between items-center px-6 h-16 w-full sticky top-0 z-40 bg-surface-bright/80 backdrop-blur-xl">
        <div className="text-lg font-headline font-bold text-on-surface">POS Pro 2026</div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 lg:gap-16 items-start mt-8">
          {/* Left Side: Login Form */}
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_12px_40px_-12px_rgba(19,27,46,0.08)] flex flex-col justify-center border border-outline-variant/15">
            <div className="mb-8 text-center md:text-left">
              <h1 className="font-headline text-3xl font-bold text-on-surface mb-2">POS Pro 2026</h1>
              <p className="font-body text-sm text-on-surface-variant">Kelola bisnis multi-cabang, satu platform.</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="p-3 bg-error-container text-on-error-container rounded-lg text-sm font-medium">
                  {error}
                </div>
              )}
              <div>
                <label className="block font-label text-sm text-on-surface-variant mb-1" htmlFor="email">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-surface-container-lowest border-outline-variant/15 rounded-lg px-4 py-3 text-on-surface focus:bg-surface-bright focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all shadow-sm" id="email" placeholder="admin@pospro.com" type="email"/>
              </div>
              <div>
                <label className="block font-label text-sm text-on-surface-variant mb-1" htmlFor="password">Password</label>
                <input value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-surface-container-lowest border-outline-variant/15 rounded-lg px-4 py-3 text-on-surface focus:bg-surface-bright focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all shadow-sm" id="password" placeholder="••••••••" type="password"/>
              </div>
              <button disabled={loading} className="w-full bg-gradient-to-br from-secondary to-secondary-container text-on-secondary font-label font-semibold py-3 rounded-lg shadow-[0_4px_14px_0_rgba(70,72,212,0.39)] hover:shadow-[0_6px_20px_rgba(70,72,212,0.23)] hover:scale-[0.98] transition-all disabled:opacity-50" type="submit">
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>
          </div>

          {/* Right Side: Branch Selection Grid */}
          <div className="flex flex-col space-y-6">
            <div>
              <h2 className="font-headline text-2xl font-bold text-on-surface mb-1">Pilih Cabang</h2>
              <p className="font-body text-sm text-on-surface-variant">Akses terminal kasir atau kelola inventaris cabang.</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {/* Branch Card 1 */}
              <Link href="/" className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/15 hover:bg-surface-container-highest transition-colors cursor-pointer group shadow-[0_4px_20px_-10px_rgba(19,27,46,0.05)] block">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-headline font-bold text-lg text-on-surface group-hover:text-secondary transition-colors">Downtown Branch</h3>
                    <div className="flex items-center mt-1 space-x-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#e1eedd] text-[#005236]">Buka</span>
                      <span className="font-body text-xs text-on-surface-variant flex items-center"><span className="material-symbols-outlined text-[14px] mr-1">person</span> 3 Kasir Aktif</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline group-hover:text-secondary transition-colors">chevron_right</span>
                </div>
                <div className="pt-3 border-t border-surface-container">
                  <p className="font-body text-xs text-on-surface-variant mb-1">Pendapatan Hari Ini</p>
                  <p className="font-headline font-bold text-on-surface">Rp 12.450.000</p>
                </div>
              </Link>

              {/* Branch Card 2 */}
              <Link href="/" className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/15 hover:bg-surface-container-highest transition-colors cursor-pointer group shadow-[0_4px_20px_-10px_rgba(19,27,46,0.05)] block">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-headline font-bold text-lg text-on-surface group-hover:text-secondary transition-colors">Mall West End</h3>
                    <div className="flex items-center mt-1 space-x-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#e1eedd] text-[#005236]">Buka</span>
                      <span className="font-body text-xs text-on-surface-variant flex items-center"><span className="material-symbols-outlined text-[14px] mr-1">person</span> 5 Kasir Aktif</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline group-hover:text-secondary transition-colors">chevron_right</span>
                </div>
                <div className="pt-3 border-t border-surface-container">
                  <p className="font-body text-xs text-on-surface-variant mb-1">Pendapatan Hari Ini</p>
                  <p className="font-headline font-bold text-on-surface">Rp 28.100.000</p>
                </div>
              </Link>

              {/* Branch Card 3 (Closed) */}
              <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/15 opacity-80 cursor-not-allowed">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-headline font-bold text-lg text-on-surface-variant">Northside Gudang</h3>
                    <div className="flex items-center mt-1 space-x-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-error-container text-on-error-container">Tutup</span>
                      <span className="font-body text-xs text-on-surface-variant flex items-center"><span className="material-symbols-outlined text-[14px] mr-1">person</span> 0 Kasir Aktif</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline-variant">lock</span>
                </div>
                <div className="pt-3 border-t border-surface-container">
                  <p className="font-body text-xs text-on-surface-variant mb-1">Pendapatan Hari Ini</p>
                  <p className="font-headline font-bold text-on-surface-variant">Rp 0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center">
        <p className="font-body text-xs text-on-surface-variant flex items-center justify-center gap-1">
          <span className="material-symbols-outlined text-[14px]">support_agent</span>
          Bantuan & Dukungan: WA/PM 085643052000
        </p>
      </footer>
    </div>
  );
}
