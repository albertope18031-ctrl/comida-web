import Link from "next/link";
import Image from "next/image";
import { Flame, ArrowRight, Sparkles, Award, ShieldCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/ProductCard";
import { PRODUCTS } from "@/lib/mock-data";

export default function HomePage() {
  const popularProducts = PRODUCTS.filter((p) => p.popular);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#004227] text-white py-20 lg:py-28">
        <div className="absolute inset-0 z-0 opacity-20">
          <Image
            src="https://images.unsplash.com/photo-1527477396000-e27163b481c2?q=80&w=1600&auto=format&fit=crop"
            alt="Alitas de fondo"
            fill
            priority
            sizes="100vw"
            quality={85}
            className="object-cover"
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-900/90 px-3.5 py-1 text-xs font-bold text-[#FFC72C] border border-emerald-600/50">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Sabor Insólito • Preparado al Momento</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight uppercase leading-[0.95] text-white">
              EL SABOR <br />
              <span className="text-[#FFC72C]">QUE MANDA.</span>
            </h1>

            <p className="text-base sm:text-lg text-emerald-100 font-medium leading-relaxed">
              Alitas con hueso, boneless 100% de pechuga y tenders gigantes bañados a mano en nuestras 11 salsas legendarias.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button
                variant="gold"
                size="lg"
                className="font-black text-base shadow-lg hover:scale-105 transition-transform"
                asChild
              >
                <Link href="/menu" className="flex items-center gap-2">
                  <span>Ordenar Ahora</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="border-emerald-500 bg-emerald-950/40 text-white hover:bg-emerald-900 hover:text-white font-bold"
                asChild
              >
                <Link href="/menu">Ver Menú Completo</Link>
              </Button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-emerald-800/80">
              <div>
                <span className="text-2xl font-black text-[#FFC72C]">11</span>
                <p className="text-xs text-emerald-200">Salsas y Ralladuras</p>
              </div>
              <div>
                <span className="text-2xl font-black text-[#FFC72C]">100%</span>
                <p className="text-xs text-emerald-200">Pollo Fresco</p>
              </div>
              <div>
                <span className="text-2xl font-black text-[#FFC72C]">30 min</span>
                <p className="text-xs text-emerald-200">Entrega Promedio</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Value Pillars */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-4 p-5 rounded-xl bg-white border border-neutral-200 shadow-2xs">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 text-[#005A36] flex items-center justify-center shrink-0">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-neutral-900">11 Sabores Legendarios</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Desde el cítrico Lemon Pepper hasta el fuego del Atomic.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-xl bg-white border border-neutral-200 shadow-2xs">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 text-[#005A36] flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-neutral-900">Cocinado al Instante</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Nunca congelado ni recalentado, bañado frente a ti.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-xl bg-white border border-neutral-200 shadow-2xs">
            <div className="h-10 w-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-neutral-900">Ranch Hecho en Casa</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Receta secreta cremosa elaborada todos los días.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-xl bg-white border border-neutral-200 shadow-2xs">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 text-[#005A36] flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-neutral-900">Entrega Rápida</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Llega caliente y crujiente directo a tu puerta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#005A36] mb-1">
              <Flame className="h-4 w-4 text-[#FFC72C]" />
              Los Favoritos de México
            </div>
            <h2 className="text-3xl font-black text-neutral-900 uppercase">
              Alitas, Boneless & Combos
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              Elige tu presentación favorita y personaliza con hasta 3 salsas.
            </p>
          </div>

          <Button variant="primary" asChild>
            <Link href="/menu" className="flex items-center gap-2 font-bold">
              <span>Ver Menú Completo</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
