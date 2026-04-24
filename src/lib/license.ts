import { APP_OWNER_LINKS } from "@/lib/app-owner";

export type LicenseStage =
  | "licensed"
  | "trial_active"
  | "trial_expired"
  | "owner_pending"
  | "staff";

export interface LicenseInput {
  role?: string | null;
  trialEndsAt?: string | null;
  licenseActive?: boolean | null;
  createdAt?: string | null;
}

export const LICENSE_WHATSAPP_URL = APP_OWNER_LINKS.primaryWhatsapp;

function parseDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getLicenseSummary(input?: LicenseInput | null) {
  const role = input?.role ?? null;
  const isOwner = role === "OWNER";
  const isLicensed = input?.licenseActive === true;
  const trialEndsAtDate = parseDate(input?.trialEndsAt);
  const createdAtDate = parseDate(input?.createdAt);
  const now = new Date();
  const msLeft = trialEndsAtDate ? trialEndsAtDate.getTime() - now.getTime() : null;
  const isTrialExpired = msLeft !== null && msLeft <= 0;
  const isTrialActive = msLeft !== null && msLeft > 0;
  const trialDaysLeft = isTrialActive && msLeft !== null ? Math.max(1, Math.ceil(msLeft / 86_400_000)) : 0;
  const trialHoursLeft = isTrialActive && msLeft !== null ? Math.max(1, Math.ceil(msLeft / 3_600_000)) : 0;

  let trialProgressPercent: number | null = null;
  if (createdAtDate && trialEndsAtDate) {
    const total = Math.max(trialEndsAtDate.getTime() - createdAtDate.getTime(), 1);
    const elapsed = Math.min(Math.max(now.getTime() - createdAtDate.getTime(), 0), total);
    trialProgressPercent = Math.round((elapsed / total) * 100);
  }

  if (!isOwner) {
    return {
      stage: "staff" as const,
      tone: "slate" as const,
      statusLabel: "Billing dikelola Owner",
      badgeLabel: "Dikelola owner",
      currentPlan: "Akses staf",
      description:
        "Status langganan dan pembelian lisensi dikelola oleh akun owner utama perusahaan.",
      isOwner,
      isLicensed,
      isTrialActive: false,
      isTrialExpired: false,
      trialDaysLeft: 0,
      trialHoursLeft: 0,
      trialEndsAtDate,
      createdAtDate,
      trialProgressPercent,
      canContactAdmin: false,
    };
  }

  if (isLicensed) {
    return {
      stage: "licensed" as const,
      tone: "emerald" as const,
      statusLabel: "Lisensi aktif",
      badgeLabel: "Aktif",
      currentPlan: "Langganan Full Access",
      description: "Akun owner ini sudah aktif penuh dan tidak lagi dibatasi masa trial 7 hari.",
      isOwner,
      isLicensed,
      isTrialActive: false,
      isTrialExpired: false,
      trialDaysLeft: 0,
      trialHoursLeft: 0,
      trialEndsAtDate,
      createdAtDate,
      trialProgressPercent,
      canContactAdmin: false,
    };
  }

  if (isTrialActive) {
    return {
      stage: "trial_active" as const,
      tone: "amber" as const,
      statusLabel: "Trial 7 hari aktif",
      badgeLabel: `${trialDaysLeft} hari lagi`,
      currentPlan: "Free Trial 7 Hari",
      description:
        "Anda masih berada di masa trial. Pantau sisa hari trial agar aktivasi lisensi bisa disiapkan sebelum akses terkunci.",
      isOwner,
      isLicensed,
      isTrialActive,
      isTrialExpired: false,
      trialDaysLeft,
      trialHoursLeft,
      trialEndsAtDate,
      createdAtDate,
      trialProgressPercent,
      canContactAdmin: true,
    };
  }

  if (isTrialExpired) {
    return {
      stage: "trial_expired" as const,
      tone: "rose" as const,
      statusLabel: "Trial berakhir",
      badgeLabel: "Lisensi dibutuhkan",
      currentPlan: "Free Trial 7 Hari",
      description:
        "Masa trial telah habis. Hubungi admin untuk aktivasi lisensi agar dashboard tetap bisa digunakan penuh.",
      isOwner,
      isLicensed,
      isTrialActive: false,
      isTrialExpired: true,
      trialDaysLeft: 0,
      trialHoursLeft: 0,
      trialEndsAtDate,
      createdAtDate,
      trialProgressPercent,
      canContactAdmin: true,
    };
  }

  return {
    stage: "owner_pending" as const,
      tone: "indigo" as const,
      statusLabel: "Lisensi belum aktif",
      badgeLabel: "Perlu aktivasi",
      currentPlan: "Menunggu Aktivasi Langganan",
      description:
        "Akun owner sudah dibuat, tetapi masa trial atau lisensi belum terbaca penuh. Periksa aktivasi atau hubungi admin.",
    isOwner,
    isLicensed,
    isTrialActive: false,
    isTrialExpired: false,
    trialDaysLeft: 0,
    trialHoursLeft: 0,
    trialEndsAtDate,
    createdAtDate,
    trialProgressPercent,
    canContactAdmin: true,
  };
}
