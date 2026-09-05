import dynamic from "next/dynamic";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";

// Carga diferida del StickyCartCTA móvil
const StickyCartCTA = dynamic(
  () => import("@/components/shop/StickyCartCTA").then((mod) => mod.StickyCartCTA)
);

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 text-neutral-900">
      <Header />
      {/* Compensate with pb-20 on mobile to prevent sticky cart bar overlap */}
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <Footer />
      <StickyCartCTA />
    </div>
  );
}
