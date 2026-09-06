import Link from "next/link";
import { Flame, ArrowRight, Sparkles, Award, ShieldCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCarousel } from "@/components/shop/ProductCarousel";
import { HeroSection } from "@/components/shop/HeroSection";
import { PRODUCTS } from "@/lib/mock-data";

export default function HomePage() {
  const popularProducts = PRODUCTS.filter((p) => p.popular);

  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      {/* Hero Section Oficial de LOCO ROOSTER */}
      <HeroSection />

      {/* Featured Products Section - Directly below Hero for maximum CRO */}
      <section id="menu" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-heading font-black uppercase tracking-wider text-[#FF3823] mb-1">
              <Flame className="h-4 w-4 fill-[#FF3823] text-[#FF3823]" />
              Los Monchos Favoritos
            </div>
            <h2 className="font-display text-3xl sm:text-4xl text-[#1C1917] uppercase tracking-tight">
              Alitas, Hamburguesas &amp; Combos
            </h2>
            <p className="text-sm font-sans text-[#1C1917]/70 mt-1 font-medium">
              Elige tu presentación favorita, salsas bravas y complementos crujientes.
            </p>
          </div>

          <Button
            asChild
            className="bg-[#1C1917] hover:bg-[#FF3823] text-white font-heading font-black rounded-xl px-5 h-11 transition-colors shadow-md"
          >
            <Link href="/menu" className="flex items-center gap-2">
              <span>Ver Menú Completo</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <ProductCarousel products={popularProducts} />
      </section>

      {/* Brand Value Pillars / Trust Badges - Closing Section before Footer */}
      <section className="border-t-2 border-[#1C1917]/10 pt-12 pb-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border-2 border-[#1C1917]/10 shadow-xs">
              <div className="h-11 w-11 rounded-xl bg-[#FFB703] text-[#1C1917] flex items-center justify-center shrink-0 border border-[#1C1917]">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading font-black text-sm text-[#1C1917]">Salsas Bravas Únicas</h3>
                <p className="text-xs font-sans text-[#1C1917]/70 mt-1">
                  Desde la barbacoa ahumada hasta el fuego puro de Loco Atomic.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-xl bg-white border-2 border-[#1C1917]/10 shadow-xs">
              <div className="h-11 w-11 rounded-xl bg-[#FF3823] text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading font-black text-sm text-[#1C1917]">Pollo 100% Fresco</h3>
                <p className="text-xs font-sans text-[#1C1917]/70 mt-1">
                  Crujiente, jugoso y preparado al momento. Cero congelados.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-xl bg-white border-2 border-[#1C1917]/10 shadow-xs">
              <div className="h-11 w-11 rounded-xl bg-[#FFB703] text-[#1C1917] flex items-center justify-center shrink-0 border border-[#1C1917]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading font-black text-sm text-[#1C1917]">Queso Cheddar Caliente</h3>
                <p className="text-xs font-sans text-[#1C1917]/70 mt-1">
                  Dips cremosos y papas bañadas para el moncho perfecto.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-xl bg-white border-2 border-[#1C1917]/10 shadow-xs">
              <div className="h-11 w-11 rounded-xl bg-[#588157] text-white flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading font-black text-sm text-[#1C1917]">Entrega en 30 Minutos</h3>
                <p className="text-xs font-sans text-[#1C1917]/70 mt-1">
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
