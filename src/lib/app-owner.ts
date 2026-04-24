function sanitizePhoneNumber(value: string) {
  return value.replace(/\D/g, "");
}

function createWhatsAppUrl(phone: string, message: string) {
  return `https://wa.me/${sanitizePhoneNumber(phone)}?text=${encodeURIComponent(message)}`;
}

function createMailtoUrl(email: string, subject: string, body: string) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export const APP_OWNER_PROFILE = {
  appName: "POS PRO V2",
  studioName: "Santriman Studios",
  developerName: "nasimulaskiyaa",
  displayLogoUrl:
    "https://i.ibb.co.com/gLv6m2gr/Chat-GPT-Image-24-Apr-2026-20-03-36.png",
  faviconLogoUrl:
    "https://i.ibb.co.com/vC99K56S/Chat-GPT-Image-24-Apr-2026-19-33-50-removebg-preview.png",
  displayLogoAlt: "Logo putih POS PRO V2 by Santriman Studios",
  faviconLogoAlt: "Favicon berwarna POS PRO V2 by Santriman Studios",
  primaryWhatsapp: "+62 822-3264-0762",
  backupWhatsapp: "+62 812-4683-4988",
  primaryEmail: "nasimulaskiya26@gmail.com",
  billingEmail: "santrimanofficial26@gmail.com",
  address: "Sale, Rembang, Jawa Tengah",
  supportResponseTime: "Estimasi respon awal hingga 2 jam",
  website: "https://santriman.com",
  websiteLabel: "santriman.com",
  instagramHandle: "santriman.id",
  facebookHandle: "santriman.id",
  tiktokHandle: "santriman.id",
} as const;

export const APP_OWNER_LINKS = {
  primaryWhatsapp: createWhatsAppUrl(
    APP_OWNER_PROFILE.primaryWhatsapp,
    `Halo ${APP_OWNER_PROFILE.studioName}, saya ingin aktivasi atau perpanjangan langganan ${APP_OWNER_PROFILE.appName}. Berikut data usaha saya:\n\nNama usaha:\nNama PIC:\nNomor WhatsApp:\nJumlah cabang:\nDurasi sewa yang diinginkan:\nCatatan tambahan:`,
  ),
  backupWhatsapp: createWhatsAppUrl(
    APP_OWNER_PROFILE.backupWhatsapp,
    `Halo ${APP_OWNER_PROFILE.studioName}, saya ingin bantuan terkait billing atau langganan ${APP_OWNER_PROFILE.appName}.`,
  ),
  primaryEmail: createMailtoUrl(
    APP_OWNER_PROFILE.primaryEmail,
    `Konsultasi ${APP_OWNER_PROFILE.appName}`,
    `Halo ${APP_OWNER_PROFILE.studioName},\n\nSaya ingin berkonsultasi terkait penggunaan ${APP_OWNER_PROFILE.appName}.\n\nNama usaha:\nNama PIC:\nKebutuhan:\n`,
  ),
  billingEmail: createMailtoUrl(
    APP_OWNER_PROFILE.billingEmail,
    `Aktivasi Langganan ${APP_OWNER_PROFILE.appName}`,
    `Halo ${APP_OWNER_PROFILE.studioName},\n\nSaya ingin aktivasi atau perpanjangan langganan ${APP_OWNER_PROFILE.appName}.\n\nNama usaha:\nNama PIC:\nNomor WhatsApp:\nJumlah cabang:\nDurasi sewa:\nCatatan:\n`,
  ),
  instagram: `https://instagram.com/${APP_OWNER_PROFILE.instagramHandle}`,
  facebook: `https://facebook.com/${APP_OWNER_PROFILE.facebookHandle}`,
  tiktok: `https://tiktok.com/@${APP_OWNER_PROFILE.tiktokHandle}`,
  website: APP_OWNER_PROFILE.website,
} as const;

export const SUBSCRIPTION_MODEL = {
  title: "Langganan Full Access",
  summary:
    "Tidak ada pembagian paket bertingkat. Setelah billing aktif, pengguna langsung menikmati seluruh fitur aplikasi sesuai durasi sewa yang disepakati.",
  activation:
    "Aktivasi langganan, perpanjangan masa aktif, dan konfirmasi akses saat ini masih diproses langsung oleh developer.",
  paymentGatewayNote:
    "Integrasi payment gateway Midtrans sedang disiapkan. Untuk saat ini, instruksi pembayaran akan diberikan langsung oleh developer saat proses aktivasi.",
  whatsAppCta: "Aktifkan Langganan via WhatsApp",
  emailCta: "Kirim Email Billing",
  automaticWhatsappMessage:
    "Halo Santriman Studios, saya ingin aktivasi atau perpanjangan langganan POS PRO V2. Mohon bantu info langkah berikutnya ya.",
} as const;

export const SUBSCRIPTION_FEATURES = [
  "Akses seluruh modul inti tanpa pembatasan paket fitur",
  "Cocok untuk operasional cabang, kasir, inventaris, CRM, dan laporan",
  "Durasi langganan mengikuti masa sewa atau billing yang disepakati",
  "Aktivasi dan perpanjangan dibantu langsung oleh developer",
] as const;

export const ACTIVATION_REQUIREMENTS = [
  "Nama usaha atau nama toko",
  "Nama PIC atau pemilik usaha",
  "Nomor WhatsApp aktif untuk koordinasi",
  "Jumlah cabang yang akan dioperasikan",
  "Durasi sewa atau periode billing yang diinginkan",
  "Catatan kebutuhan khusus bila ada",
] as const;

export const TRIAL_POLICY = [
  "Setiap akun owner baru mendapatkan trial 7 hari secara otomatis sejak akun dibuat.",
  "Selama masa trial, seluruh fitur utama aplikasi dapat dicoba tanpa pembatasan paket.",
  "Trial berlaku untuk evaluasi produk dan tidak otomatis diperpanjang setelah masa aktif habis.",
  "Setelah trial berakhir, aktivasi langganan diperlukan agar penggunaan operasional tetap lancar.",
  "Developer berhak meninjau ulang atau menolak penyalahgunaan trial yang tidak sesuai tujuan evaluasi.",
] as const;

export const REFUND_POLICY = [
  "Pembayaran langganan diperlakukan sebagai sewa akses software sesuai durasi yang disepakati.",
  "Refund dapat dipertimbangkan apabila aktivasi gagal dilakukan dari sisi developer atau layanan tidak dapat diserahkan sama sekali.",
  "Permintaan refund diajukan maksimal 3 x 24 jam sejak pembayaran dikonfirmasi, disertai bukti pembayaran dan identitas akun.",
  "Refund tidak berlaku untuk masa langganan yang sudah aktif dan telah digunakan, kecuali terdapat gangguan fatal yang tidak dapat diselesaikan dari sisi sistem.",
  "Keputusan akhir refund akan diinformasikan melalui WhatsApp atau email billing setelah proses verifikasi selesai.",
] as const;

export const SUPPORT_FAQS = [
  {
    q: "Bagaimana cara aktivasi atau perpanjangan langganan?",
    a: "Cukup hubungi Santriman Studios melalui WhatsApp atau email billing. Kirim nama usaha, PIC, jumlah cabang, dan durasi sewa yang diinginkan agar proses aktivasi bisa dipandu dengan cepat.",
  },
  {
    q: "Apakah ada pembagian paket fitur?",
    a: "Tidak ada paket bertingkat. Model langganan saat ini langsung membuka seluruh fitur aplikasi, dan perbedaannya hanya pada durasi billing atau masa sewa yang disepakati.",
  },
  {
    q: "Metode pembayaran apa yang tersedia?",
    a: "Payment gateway Midtrans sedang dipersiapkan. Untuk saat ini, detail pembayaran akan diinformasikan langsung oleh developer saat proses aktivasi langganan.",
  },
  {
    q: "Berapa lama respon support?",
    a: "Estimasi respon awal support hingga 2 jam sejak pesan masuk pada channel resmi yang tersedia.",
  },
  {
    q: "Apa yang terjadi setelah masa trial habis?",
    a: "Akun owner perlu menghubungi developer untuk aktivasi langganan agar operasional aplikasi bisa terus digunakan tanpa hambatan.",
  },
] as const;

export const SOCIAL_LINKS = [
  { label: "Website", value: APP_OWNER_PROFILE.websiteLabel, href: APP_OWNER_LINKS.website, icon: "language" },
  { label: "Instagram", value: `@${APP_OWNER_PROFILE.instagramHandle}`, href: APP_OWNER_LINKS.instagram, icon: "photo_camera" },
  { label: "Facebook", value: APP_OWNER_PROFILE.facebookHandle, href: APP_OWNER_LINKS.facebook, icon: "public" },
  { label: "TikTok", value: `@${APP_OWNER_PROFILE.tiktokHandle}`, href: APP_OWNER_LINKS.tiktok, icon: "music_note" },
] as const;
