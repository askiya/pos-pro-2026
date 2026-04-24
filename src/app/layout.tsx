import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { ToastProvider } from "@/components/ui/ToastProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: '--font-plus-jakarta' });

export const metadata: Metadata = {
  title: "POS PRO V2",
  description: "Platform POS modern untuk kasir, inventory, CRM, shift, dan laporan bisnis.",
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
