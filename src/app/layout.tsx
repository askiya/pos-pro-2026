import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { APP_OWNER_PROFILE } from "@/lib/app-owner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: '--font-plus-jakarta' });

export const metadata: Metadata = {
  title: "POS PRO V2",
  description: "Platform POS modern untuk kasir, inventory, CRM, shift, dan laporan bisnis.",
  applicationName: APP_OWNER_PROFILE.appName,
  icons: {
    icon: [{ url: "/brand-favicon.svg?v=20260424-2", type: "image/svg+xml" }],
    shortcut: ["/brand-favicon.svg?v=20260424-2"],
    apple: [{ url: "/brand-favicon.svg?v=20260424-2" }],
  },
  openGraph: {
    title: "POS PRO V2",
    description: "Platform POS modern untuk kasir, inventory, CRM, shift, dan laporan bisnis.",
    siteName: APP_OWNER_PROFILE.studioName,
    images: [
      {
        url: APP_OWNER_PROFILE.displayLogoUrl,
        width: 512,
        height: 512,
        alt: APP_OWNER_PROFILE.displayLogoAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "POS PRO V2",
    description: "Platform POS modern untuk kasir, inventory, CRM, shift, dan laporan bisnis.",
    images: [APP_OWNER_PROFILE.displayLogoUrl],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${plusJakarta.variable} font-body antialiased bg-surface text-on-surface`}>
        <ToastProvider>
          <AppShell>{children}</AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}
