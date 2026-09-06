import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Flame, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF7F2] to-[#f3ede2] text-[#1C1917] py-6 md:py-8 lg:py-10 border-b-2 border-[#1C1917]/10">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Columna Izquierda: Copywriting Persuasivo */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FFB703] px-3.5 py-1 text-xs font-heading font-black text-[#1C1917] border-2 border-[#1C1917] shadow-xs">
              <Flame className="h-3.5 w-3.5 fill-[#FF3823] text-[#FF3823]" />
              <span>SABOR BRAVO • MONCHOS AL MOMENTO</span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl text-[#1C1917] tracking-tight uppercase leading-[0.95] drop-shadow-xs">
              ¡MONCHOS DE VERDAD <br />
              <span className="text-[#FF3823] underline decoration-[#FFB703] decoration-wavy decoration-from-font">
                PARA GENTE LOCA!
              </span>
            </h1>

            <p className="text-sm md:text-base text-[#1C1917]/80 font-sans max-w-xl leading-normal font-medium">
              Disfruta de las alitas más atrevidas, hamburguesas bestiales, boneless jugosos y mucho más. ¡Sin excusas!
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <Button
                asChild
                className="bg-[#FF3823] hover:bg-[#E02D1A] text-white font-heading font-black text-sm px-6 h-11 rounded-xl shadow-lg hover:scale-105 transition-transform active:scale-95"
              >
                <Link href="#menu" className="flex items-center gap-2">
                  <span>VER MENÚ COMPLETO</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="border-2 border-[#1C1917] bg-white text-[#1C1917] hover:bg-[#FFB703] hover:text-[#1C1917] font-heading font-black text-sm px-5 h-11 rounded-xl shadow-xs transition-colors"
              >
                <Link href="/?category=combos#menu">Combos &amp; Packs</Link>
              </Button>
            </div>

            {/* Quick Metrics Compactas */}
            <div className="grid grid-cols-3 gap-3 pt-3 mt-1 border-t-2 border-[#1C1917]/10 max-w-md">
              <div>
                <span className="font-display text-xl sm:text-2xl text-[#FF3823] block leading-none">
                  100%
                </span>
                <p className="text-[11px] font-bold text-[#1C1917]/70 mt-0.5">Pechuga Fresca</p>
              </div>
              <div>
                <span className="font-display text-xl sm:text-2xl text-[#FFB703] block leading-none">
                  SALSAS
                </span>
                <p className="text-[11px] font-bold text-[#1C1917]/70 mt-0.5">Bravas Caseras</p>
              </div>
              <div>
                <span className="font-display text-xl sm:text-2xl text-[#588157] block leading-none">
                  30 MIN
                </span>
                <p className="text-[11px] font-bold text-[#1C1917]/70 mt-0.5">Entrega Caliente</p>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Tarjeta Destacada MEGA COMBO ROOSTER */}
          <div className="lg:col-span-5">
            <div className="relative bg-[#FFB703] text-[#1C1917] rounded-3xl p-5 sm:p-6 shadow-xl border-3 border-[#1C1917] overflow-hidden group hover:rotate-1 transition-transform">
              {/* Badge Superior */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="bg-[#FF3823] text-white font-heading font-black text-xs uppercase px-3 py-0.5 rounded-full shadow-md flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-white" />
                  <span>COMBO BESTIAL</span>
                </span>
                <span className="text-xs font-heading font-black uppercase text-[#1C1917] bg-white/80 px-2 py-0.5 rounded-md border border-[#1C1917]/20">
                  Para 3-4 Personas
                </span>
              </div>

              {/* Imagen del Mega Combo */}
              <div className="relative h-36 sm:h-44 w-full rounded-2xl overflow-hidden border-2 border-[#1C1917] shadow-inner mb-3 bg-white">
                <Image
                  src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop"
                  alt="Mega Combo Rooster"
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Título y Descripción */}
              <div className="space-y-1">
                <h3 className="font-display text-xl sm:text-2xl uppercase tracking-tight text-[#1C1917] leading-tight">
                  MEGA COMBO ROOSTER
                </h3>
                <p className="text-xs sm:text-sm font-sans font-semibold text-[#1C1917]/90 leading-snug">
                  Alitas, Hamburguesa, Tenders y Papas. La combinación definitiva para compartir.
                </p>
              </div>

              {/* CTA del Banner */}
              <div className="mt-4 pt-3 border-t-2 border-[#1C1917]/20 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#1C1917]/70 block leading-none">
                    Precio Especial
                  </span>
                  <span className="text-xl sm:text-2xl font-black font-display text-[#FF3823]">
                    $389.00
                  </span>
                </div>

                <Button
                  asChild
                  className="bg-[#FF3823] hover:bg-[#E02D1A] text-white font-heading font-black rounded-xl px-4 h-10 shadow-md transition-transform active:scale-95 text-xs"
                >
                  <Link href="/?category=combos#menu">
                    <span>¡Pedir Combo!</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
