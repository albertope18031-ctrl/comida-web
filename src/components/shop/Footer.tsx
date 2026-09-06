import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Instagram, Facebook, ShieldCheck } from "lucide-react";

// TikTok SVG Icon
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.5 6.3 6.3 0 0 0 1.95-4.5V8.5a8.28 8.28 0 0 0 4.82 1.63v-3.44a4.85 4.85 0 0 1-1-.01Z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#1C1917] text-white py-12 border-t-4 border-[#FF3823]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-neutral-800">
          {/* Columna 1: Logotipo Simplificado y Declaración */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group" aria-label="Loco Rooster - Inicio">
              <div className="relative h-12 w-12 rounded-2xl overflow-hidden bg-[#FFB703] p-1 border-2 border-[#FAF7F2] shadow-lg shrink-0 group-hover:scale-105 transition-transform">
                <Image
                  src="/images/loco-rooster.png"
                  alt="Loco Rooster Logo"
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </div>
              <div>
                <span className="font-display text-2xl tracking-tight text-white block leading-none">
                  LOCO ROOSTER
                </span>
                <span className="text-[10px] font-heading font-black tracking-widest text-[#FFB703] uppercase">
                  MONCHOS DE VERDAD
                </span>
              </div>
            </Link>

            <p className="text-xs font-sans text-stone-400 leading-relaxed">
              Las alitas más atrevidas, hamburguesas bestiales de 300g y tenders crujientes hechos con auténtica pasión callejera.
            </p>

            <div className="flex items-center gap-2 text-xs text-[#588157] font-bold">
              <ShieldCheck className="h-4 w-4" />
              <span>Garantía de sabor, pollo fresco y entrega caliente</span>
            </div>
          </div>

          {/* Columna 2: Enlaces de Navegación Requeridos */}
          <div className="space-y-3">
            <h4 className="text-sm font-heading font-black uppercase tracking-wider text-[#FFB703]">
              Navegación
            </h4>
            <ul className="space-y-2.5 text-xs font-sans font-semibold text-stone-300">
              <li>
                <Link href="/menu" className="hover:text-[#FFB703] transition-colors">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link href="/facturacion" className="hover:text-[#FFB703] transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-[#FFB703] transition-colors">
                  Localízanos
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#FFB703] transition-colors">
                  Preguntas Frecuentes
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Sucursales y Atención */}
          <div className="space-y-3">
            <h4 className="text-sm font-heading font-black uppercase tracking-wider text-[#FFB703] flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-[#FF3823]" />
              Sucursales Principales
            </h4>
            <ul className="space-y-2 text-xs font-sans text-stone-400">
              <li>Roma Norte - CDMX (Tel: 55 5584 9201)</li>
              <li>Polanco - CDMX (Tel: 55 5280 4310)</li>
              <li>Del Valle Insurgentes - CDMX</li>
              <li>Ciudad Satélite - Edo. Méx.</li>
              <li>Horario: 12:00 PM a 11:00 PM</li>
            </ul>
          </div>

          {/* Columna 4: Redes Sociales Interactivas */}
          <div className="space-y-4">
            <h4 className="text-sm font-heading font-black uppercase tracking-wider text-[#FFB703]">
              Síguenos en Redes
            </h4>
            <p className="text-xs font-sans text-stone-400">
              Enterate de promociones locas, nuevos lanzamientos y dinámicas semanales:
            </p>

            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white hover:bg-[#FF3823] hover:border-[#FF3823] transition-all hover:scale-110 shadow-md cursor-pointer"
                aria-label="Instagram de Loco Rooster"
              >
                <Instagram className="h-5 w-5" />
              </a>

              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white hover:bg-[#FFB703] hover:text-[#1C1917] hover:border-[#FFB703] transition-all hover:scale-110 shadow-md cursor-pointer"
                aria-label="TikTok de Loco Rooster"
              >
                <TikTokIcon className="h-5 w-5" />
              </a>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white hover:bg-[#FF3823] hover:border-[#FF3823] transition-all hover:scale-110 shadow-md cursor-pointer"
                aria-label="Facebook de Loco Rooster"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>

            <div className="pt-2 text-xs font-sans text-stone-400">
              <span>WhatsApp de Pedidos: </span>
              <strong className="text-white block mt-0.5 font-bold">+52 55 8000-ROOSTER</strong>
            </div>
          </div>
        </div>

        {/* Copyright Oficial */}
        <p className="font-sans text-xs text-stone-400 text-center mt-8">
          © 2026 LOCO ROOSTER. Derechos Reservados. ¡Hecho con pasión y salsas bravas!
        </p>
      </div>
    </footer>
  );
}
