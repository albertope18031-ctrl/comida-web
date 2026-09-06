import { Suspense } from "react";
import { Sparkles, Award, ShieldCheck, Clock } from "lucide-react";
import { HeroSection } from "@/components/shop/HeroSection";
import { FeaturedCatalog } from "@/components/shop/FeaturedCatalog";

export default function HomePage() {
  return (
    <div className="pt-2 md:pt-3 space-y-6 md:space-y-8 pb-6 md:pb-8">
      {/* Hero Section Oficial de LOCO ROOSTER */}
      <HeroSection />

      {/* Featured Products & Category Filter Section */}
      <Suspense
        fallback={
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-pulse text-center">
            <div className="h-8 bg-neutral-200 rounded-xl w-64 mx-auto mb-4" />
            <div className="h-64 bg-neutral-200 rounded-3xl w-full" />
          </div>
        }
      >
        <FeaturedCatalog />
      </Suspense>

      {/* Brand Value Pillars / Trust Badges - Closing Section before Footer */}
      <section className="border-t-2 border-[#1C1917]/10 pt-6 md:pt-8 pb-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl bg-white border-2 border-[#1C1917]/10 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-[#FFB703] text-[#1C1917] flex items-center justify-center shrink-0 border border-[#1C1917]">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading font-black text-sm text-[#1C1917]">Salsas Bravas Únicas</h3>
                <p className="text-xs font-sans text-[#1C1917]/70 mt-0.5 leading-snug">
                  Desde la barbacoa ahumada hasta el fuego puro de Loco Atomic.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 sm:p-5 rounded-xl bg-white border-2 border-[#1C1917]/10 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-[#FF3823] text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading font-black text-sm text-[#1C1917]">Pollo 100% Fresco</h3>
                <p className="text-xs font-sans text-[#1C1917]/70 mt-0.5 leading-snug">
                  Crujiente, jugoso y preparado al momento. Cero congelados.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 sm:p-5 rounded-xl bg-white border-2 border-[#1C1917]/10 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-[#FFB703] text-[#1C1917] flex items-center justify-center shrink-0 border border-[#1C1917]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading font-black text-sm text-[#1C1917]">Queso Cheddar Caliente</h3>
                <p className="text-xs font-sans text-[#1C1917]/70 mt-0.5 leading-snug">
                  Dips cremosos y papas bañadas para el moncho perfecto.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 sm:p-5 rounded-xl bg-white border-2 border-[#1C1917]/10 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-[#588157] text-white flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading font-black text-sm text-[#1C1917]">Entrega en 30 Minutos</h3>
                <p className="text-xs font-sans text-[#1C1917]/70 mt-0.5 leading-snug">
                  Llega hirviendo, crujiente y directo a tu puerta.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
