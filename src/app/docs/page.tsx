"use client";

import { useState } from "react";
import ResponsiveLayout from "@/components/layout/ResponsiveLayout";

type DocChapter = "setup" | "cashier" | "inventory" | "reports";

export default function DocsPage() {
  const [activeChapter, setActiveChapter] = useState<DocChapter>("setup");

  const chapters: { id: DocChapter; title: string; icon: string }[] = [
    { id: "setup", title: "1. Persiapan Awal", icon: "rocket_launch" },
    { id: "cashier", title: "2. POS Cashier", icon: "point_of_sale" },
    { id: "inventory", title: "3. Manajemen Inventaris", icon: "inventory_2" },
    { id: "reports", title: "4. Laporan & Analitik", icon: "analytics" },
  ];

  return (
    <ResponsiveLayout>
      <div className="h-full min-h-0 overflow-y-auto bg-[#fcfbff] flex">
        {/* Docs Sidebar */}
        <div className="w-[280px] shrink-0 border-r border-outline-variant/10 bg-white hidden md:block">
          <div className="p-6 sticky top-0">
            <h2 className="font-headline font-black text-lg text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#a277ff]">menu_book</span>
              Buku Panduan
            </h2>
            <nav className="space-y-1">
              {chapters.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChapter(ch.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm font-semibold transition-all text-left ${
                    activeChapter === ch.id
                      ? "bg-[#e0e5ff] text-[#a277ff]"
                      : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{ch.icon}</span>
                  {ch.title}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <div className="md:hidden w-full border-b border-outline-variant/10 p-4 bg-white absolute z-10">
          <select 
            value={activeChapter} 
            onChange={(e) => setActiveChapter(e.target.value as DocChapter)}
            className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-sm font-semibold text-on-surface focus:outline-none focus:border-[#a277ff]"
          >
            {chapters.map(ch => (
              <option key={ch.id} value={ch.id}>{ch.title}</option>
            ))}
          </select>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 px-6 py-20 md:py-10 max-w-[800px] mx-auto">
          {activeChapter === "setup" && <SetupDocs />}
          {activeChapter === "cashier" && <CashierDocs />}
          {activeChapter === "inventory" && <InventoryDocs />}
          {activeChapter === "reports" && <ReportsDocs />}
        </div>
      </div>
    </ResponsiveLayout>
  );
}

function SetupDocs() {
  return (
    <div className="space-y-8 animate-enter-up">
      <div className="border-b border-outline-variant/10 pb-6">
        <h1 className="font-headline text-3xl font-black text-on-surface">Persiapan Awal (Setup)</h1>
        <p className="mt-2 text-on-surface-variant font-body">Langkah pertama untuk menggunakan POS PRO V2.</p>
      </div>

      <div className="prose prose-sm md:prose-base prose-slate max-w-none text-on-surface-variant">
        <h3 className="font-bold text-lg text-on-surface mt-6 mb-3">1. Menambahkan Cabang</h3>
        <p className="mb-4">
          Aplikasi kami mendukung multi-cabang. Anda bisa mendaftarkan cabang baru melalui menu <b>Settings &gt; Branches</b>.
          Pastikan untuk mengisi nama cabang, alamat lengkap, dan nomor kontak. Setiap produk dan pengguna nantinya akan terikat ke cabang tertentu.
        </p>

        <h3 className="font-bold text-lg text-on-surface mt-6 mb-3">2. Mengelola Pengguna (Role-Based Access)</h3>
        <p className="mb-4">
          Anda tidak disarankan menggunakan akun Owner untuk operasional kasir. Tambahkan akun kasir melalui menu <b>Settings &gt; Users & Roles</b>.
        </p>
        <ul className="list-disc pl-5 space-y-2 mb-6">
          <li><b>Owner:</b> Memiliki akses ke semua fitur, laporan, pengaturan pajak, dan daftar cabang.</li>
          <li><b>Admin:</b> Dapat mengelola inventaris, menambah stok, membuat PO, namun tidak bisa mengubah pengaturan pajak/lisensi.</li>
          <li><b>Manager:</b> Bisa mengakses laporan penjualan, namun hanya untuk cabangnya saja.</li>
          <li><b>Kasir:</b> Hanya memiliki akses ke menu POS Cashier dan Shift Management.</li>
        </ul>

        <div className="p-4 bg-[#fff8e1] border border-[#ffecb3] rounded-xl flex gap-3 text-[#795548] my-6">
          <span className="material-symbols-outlined text-[#ffb300]">lightbulb</span>
          <p className="text-sm font-medium">Tip: Jangan lupa memberikan password yang unik untuk masing-masing kasir agar laporan &quot;Performa Kasir&quot; tercatat dengan akurat.</p>
        </div>
      </div>
    </div>
  );
}

function CashierDocs() {
  return (
    <div className="space-y-8 animate-enter-up">
      <div className="border-b border-outline-variant/10 pb-6">
        <h1 className="font-headline text-3xl font-black text-on-surface">POS Cashier</h1>
        <p className="mt-2 text-on-surface-variant font-body">Panduan memproses transaksi dengan cepat dan efisien.</p>
      </div>

      <div className="prose prose-sm md:prose-base prose-slate max-w-none text-on-surface-variant">
        <h3 className="font-bold text-lg text-on-surface mt-6 mb-3">Memulai Shift</h3>
        <p className="mb-4">
          Sebelum menggunakan mesin kasir, Anda harus memulai Shift. Buka menu <b>Shift Management</b>, masukkan saldo awal uang di laci (petty cash), dan klik &quot;Mulai Shift&quot;.
        </p>

        <h3 className="font-bold text-lg text-on-surface mt-6 mb-3">Cara Transaksi</h3>
        <p className="mb-4">
          Halaman kasir didesain untuk transaksi cepat:
        </p>
        <ol className="list-decimal pl-5 space-y-2 mb-6">
          <li>Pilih barang dari katalog atau gunakan kotak pencarian.</li>
          <li>Atur kuantitas (+ / -) di panel keranjang di sebelah kanan.</li>
          <li>Pilih jenis pembayaran (Cash, Debit, atau QRIS).</li>
          <li>Masukkan uang diterima (jika cash).</li>
          <li>Klik <b>Charge</b>.</li>
        </ol>

        <h3 className="font-bold text-lg text-on-surface mt-6 mb-3">PPOB (Jual Pulsa & Tagihan)</h3>
        <p className="mb-4">
          Anda bisa melayani pembelian pulsa, kuota, atau token listrik pelanggan. Cukup klik menu <b>PPOB Module</b> dari menu kiri kasir. Saldo PPOB akan otomatis terpotong dan uang dari pelanggan masuk ke laci kasir.
        </p>
      </div>
    </div>
  );
}

function InventoryDocs() {
  return (
    <div className="space-y-8 animate-enter-up">
      <div className="border-b border-outline-variant/10 pb-6">
        <h1 className="font-headline text-3xl font-black text-on-surface">Manajemen Inventaris</h1>
        <p className="mt-2 text-on-surface-variant font-body">Sistem FIFO, Purchase Orders, dan Transfer antar cabang.</p>
      </div>

      <div className="prose prose-sm md:prose-base prose-slate max-w-none text-on-surface-variant">
        <h3 className="font-bold text-lg text-on-surface mt-6 mb-3">Sistem FIFO (First In, First Out)</h3>
        <p className="mb-4">
          Sistem kami otomatis menggunakan metode FIFO. Artinya, saat barang terjual, sistem akan mengurangi stok barang dari tanggal pembelian/PO yang paling lama. Ini sangat berguna agar Anda bisa melihat margin keuntungan yang akurat bila harga beli dari supplier sering berubah.
        </p>

        <h3 className="font-bold text-lg text-on-surface mt-6 mb-3">Purchase Orders (PO)</h3>
        <p className="mb-4">
          Gunakan menu <b>Purchase Orders</b> untuk menambah stok barang. Prosesnya adalah:
        </p>
        <ul className="list-disc pl-5 space-y-2 mb-6">
          <li>Buat PO dengan memilih Supplier dan barang yang dipesan. Status awal adalah <span className="font-semibold text-orange-500">PENDING</span>.</li>
          <li>Saat barang tiba di toko, klik &quot;Terima Barang&quot;. Status berubah menjadi <span className="font-semibold text-green-500">COMPLETED</span>.</li>
          <li>Stok akan otomatis bertambah ke cabang yang bersangkutan.</li>
        </ul>

        <h3 className="font-bold text-lg text-on-surface mt-6 mb-3">Transfer Stok</h3>
        <p className="mb-4">
          Bila ada cabang yang kehabisan stok, Anda bisa memindahkan barang dari cabang lain melalui menu <b>Transfers</b>.
        </p>
      </div>
    </div>
  );
}

function ReportsDocs() {
  return (
    <div className="space-y-8 animate-enter-up">
      <div className="border-b border-outline-variant/10 pb-6">
        <h1 className="font-headline text-3xl font-black text-on-surface">Laporan & Analitik</h1>
        <p className="mt-2 text-on-surface-variant font-body">Membaca data untuk pengambilan keputusan bisnis.</p>
      </div>

      <div className="prose prose-sm md:prose-base prose-slate max-w-none text-on-surface-variant">
        <h3 className="font-bold text-lg text-on-surface mt-6 mb-3">Dashboard Eksekutif</h3>
        <p className="mb-4">
          Saat pertama login sebagai Owner, Anda akan diarahkan ke Dashboard. Di sini Anda bisa melihat grafik omzet gabungan dari seluruh cabang secara real-time.
        </p>

        <h3 className="font-bold text-lg text-on-surface mt-6 mb-3">Laporan Shift (End-of-Day)</h3>
        <p className="mb-4">
          Setiap kali kasir mengakhiri shift, sistem akan mencetak Laporan Shift otomatis. Laporan ini berisi total uang masuk (Cash vs Non-Cash), selisih uang fisik vs sistem, dan jumlah barang terjual.
        </p>
        
        <h3 className="font-bold text-lg text-on-surface mt-6 mb-3">Export Laporan</h3>
        <p className="mb-4">
          Di menu <b>Reports</b>, Anda bisa mengatur filter tanggal (contoh: &quot;Bulan Lalu&quot; atau &quot;Minggu Ini&quot;) dan mengekspor data transaksi atau stok ke format Excel (.xlsx) untuk laporan kebersihan internal atau pajak.
        </p>
      </div>
    </div>
  );
}
