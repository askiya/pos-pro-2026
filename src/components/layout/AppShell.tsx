"use client";

import { usePathname } from "next/navigation";

import { LicenseGate } from "@/components/layout/LicenseGate";
import ResponsiveLayout from "@/components/layout/ResponsiveLayout";

const PUBLIC_PATHS = ["/login"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPath = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (isPublicPath) {
    return <>{children}</>;
  }

  return (
    <LicenseGate>
      <ResponsiveLayout>{children}</ResponsiveLayout>
    </LicenseGate>
  );
}
