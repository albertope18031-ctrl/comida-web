import Link from "next/link";
import { Flame, MapPin, Phone, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#121212] text-neutral-300 pt-16 pb-12 border-t-4 border-[#FFC72C]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-neutral-800">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFC72C] text-[#005A36] font-black text-xl">
                W
              </div>
              <span className="text-xl font-black tracking-wider uppercase text-white font-mono">
                WINGSTOP
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              No somos un restaurante de comida rápida, somos los expertos en sabor. Alitas y boneless bañados a mano en nuestras 11 salsas legendarias.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <ShieldCheck className="h-4 w-4" />
              <span>Garantía de frescura y pollo 100% mexicano</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-black uppercase tracking-wider text-white">
              Explora Nuestro Menú
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <Link href="/menu" className="hover:text-[#FFC72C] transition-colors">
                  Alitas Tradicionales
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-[#FFC72C] transition-colors">
                  Boneless de Pechuga
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-[#FFC72C] transition-colors">
                  Crispy Tenders
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-[#FFC72C] transition-colors">
                  Combos Individuales & Familiares
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-[#FFC72C] transition-colors">
                  Papas Sazonadas & Aros
                </Link>
              </li>
            </ul>
          </div>

          {/* Sucursales */}
          <div className="space-y-3">
            <h4 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-[#FFC72C]" />
              Sucursales Principales
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>Roma Norte - CDMX (Tel: 55 5584 9201)</li>
              <li>Polanco Homero - CDMX (Tel: 55 5280 4310)</li>
              <li>Insurgentes Del Valle - CDMX (Tel: 55 5598 7720)</li>
              <li>Plaza Satélite - Edo. Mex (Tel: 55 5562 1084)</li>
              <li>San Pedro Garza García - Monterrey</li>
              <li>Zapopan Andares - Guadalajara</li>
            </ul>
          </div>

          {/* Contact & Hours */}
          <div className="space-y-3">
            <h4 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-[#FFC72C]" />
              Atención al Cliente
            </h4>
            <p className="text-xs text-neutral-400">
              Lunes a Domingo: 12:00 PM a 11:00 PM
            </p>
            <p className="text-xs text-neutral-400">
              WhatsApp de pedidos y dudas: <br />
              <span className="font-bold text-white">+52 (55) 8000-WINGS</span>
            </p>
            <div className="pt-2">
              <span className="text-[11px] block text-neutral-500 uppercase font-bold mb-1">
                Índice de Picante Oficial
              </span>
              <div className="h-2 w-full rounded-full heat-gradient shadow-inner" />
              <div className="flex justify-between text-[10px] text-neutral-400 mt-1 font-semibold">
                <span>0 Dulce</span>
                <span>2 Medio</span>
                <span>5 Atómico 🔥</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} Wingstop México. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacidad" className="hover:text-neutral-300 transition-colors">
              Aviso de Privacidad
            </Link>
            <Link href="/terminos" className="hover:text-neutral-300 transition-colors">
              Términos del Servicio
            </Link>
            <Link href="/facturacion" className="hover:text-neutral-300 transition-colors">
              Facturación Electrónica SAT
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
