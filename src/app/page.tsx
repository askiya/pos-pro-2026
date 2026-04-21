"use client";

import ResponsiveLayout from "@/components/layout/ResponsiveLayout";
import PosCatalog from "@/components/pos/PosCatalog";
import PosCart from "@/components/pos/PosCart";

export default function Home() {
  return (
    <ResponsiveLayout>
      {/* On mobile we will handle the visibility via CSS or state later. 
          For now, just render them as flex-col which is what the reference does. */}
      <PosCatalog />
      <PosCart />
    </ResponsiveLayout>
  );
}
