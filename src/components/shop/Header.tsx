"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  MapPin,
  Truck,
  Store,
  Clock,
  Menu as MenuIcon,
  X,
  ChevronDown,
  User,
  Flame,
} from "lucide-react";
import { useOrderContextStore } from "@/store/order-context-store";
import dynamic from "next/dynamic";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const BranchSelectorModal = dynamic(
  () => import("./BranchSelectorModal").then((mod) => mod.BranchSelectorModal),
  { ssr: false }
);

// Categorías oficiales de LOCO ROOSTER
const NAVIGATION_LINKS = [
  { name: "INICIO", href: "/" },
  { name: "ALITAS", href: "/menu?cat=alitas" },
  { name: "HAMBURGUESAS", href: "/menu?cat=sandwiches" },
  { name: "BONELESS", href: "/menu?cat=boneless" },
  { name: "PAPAS & ACOMPAÑAMIENTOS", href: "/menu?cat=sides" },
  { name: "CRISPY TENDERS", href: "/menu?cat=tenders" },
  { name: "COMBOS & PACKS", href: "/menu?cat=combos" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const {
    orderType,
    selectedBranch,
    deliveryAddress,
    openSelectorModal,
    isSelectorModalOpen,
  } = useOrderContextStore();

  const { items, openCart, getSubtotal } = useCartStore();

  const subtotal = getSubtotal();
  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const totalPieces = items.reduce(
    (acc, item) => acc + (item.piecesCount || 0) * item.quantity,
    0
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 ${
          isScrolled ? "shadow-2xl" : "shadow-md"
        }`}
      >
        {/* Top Operational Bar: Context & Fulfillment Selector */}
        <div className="bg-[#141210] text-neutral-300 border-b border-neutral-800 px-4 py-1.5 text-xs">
          <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
            {/* Prominent Fulfillment & Branch Toggle Button */}
            <button
              type="button"
              onClick={openSelectorModal}
              className="flex items-center gap-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 px-3 py-1 border border-neutral-700 transition-all cursor-pointer group shadow-xs"
              aria-label="Seleccionar modalidad de entrega y sucursal"
            >
              {/* Order Mode Pill */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-heading font-black uppercase tracking-wider ${
                  orderType === "delivery"
                    ? "bg-[#FF3823] text-white"
                    : "bg-[#FFB703] text-[#1C1917]"
                }`}
              >
                {orderType === "delivery" ? (
                  <>
                    <Truck className="h-3 w-3" />
                    <span>A Domicilio</span>
                  </>
                ) : (
                  <>
                    <Store className="h-3 w-3" />
                    <span>Para Llevar</span>
                  </>
                )}
              </span>

              {/* Branch / Address Label */}
              <div className="flex items-center gap-1.5 text-xs text-neutral-200 font-bold group-hover:text-[#FFB703] transition-colors">
                <MapPin className="h-3.5 w-3.5 text-[#FFB703] shrink-0" />
                <span className="truncate max-w-[180px] sm:max-w-[300px]">
                  {orderType === "delivery" && deliveryAddress
                    ? deliveryAddress.fullAddress
                    : selectedBranch.name}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-neutral-400 group-hover:translate-y-0.5 transition-transform" />
              </div>

              {/* Estimated Time Badge */}
              <div className="hidden sm:flex items-center gap-1 text-[11px] text-[#FFB703] bg-neutral-950 px-2 py-0.5 rounded-md border border-neutral-800">
                <Clock className="h-3 w-3 text-[#FFB703]" />
                <span>
                  {orderType === "delivery"
                    ? `${selectedBranch.estimatedDeliveryMin} min`
                    : `${selectedBranch.estimatedPickupMin} min`}
                </span>
              </div>
            </button>

            {/* Quick Secondary Actions */}
            <div className="flex items-center gap-4 text-xs font-semibold text-neutral-400">
              <Link
                href="/admin"
                className="hidden lg:flex items-center gap-1 text-[#FFB703] hover:text-white transition-colors text-[11px] font-bold px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800"
              >
                Panel Admin
              </Link>
              <span className="hidden sm:inline text-neutral-600">|</span>
              <span className="hidden sm:inline text-[11px] text-neutral-300">
                Horario: {selectedBranch.openingTime} a {selectedBranch.closingTime} hrs
              </span>
            </div>
          </div>
        </div>

        {/* Main Header Bar */}
        <div className="bg-[#1C1917] text-white border-b border-[#FFB703]/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between gap-4">
              {/* Brand Logo LOCO ROOSTER */}
              <div className="flex items-center gap-6 xl:gap-8">
                <Link
                  href="/"
                  className="flex items-center group focus:outline-none focus:ring-2 focus:ring-[#FF3823] rounded-xl p-1 shrink-0"
                  aria-label="Loco Rooster - Inicio"
                >
                  <Image
                    src="/images/loco%20rooster_sin_fondo.png"
                    alt="Loco Rooster"
                    width={641}
                    height={707}
                    priority={true}
                    className="h-12 md:h-14 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
                  />
                </Link>

                {/* Desktop Category Navigation */}
                <nav
                  className="hidden xl:flex items-center space-x-5 text-xs font-heading font-bold"
                  aria-label="Navegación principal de categorías"
                >
                  {NAVIGATION_LINKS.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="text-neutral-200 hover:text-[#FFB703] transition-colors py-1 whitespace-nowrap tracking-wide"
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-3">
                {/* Botón CTA ¡PEDIR AHORA! */}
                <Button
                  asChild
                  className="bg-[#FF3823] hover:bg-[#E02D1A] text-white font-heading font-black text-xs sm:text-sm rounded-xl shadow-lg transition-transform active:scale-95 px-3.5 sm:px-5 h-11 flex items-center gap-1.5 cursor-pointer"
                >
                  <Link href="/menu">
                    <Flame className="h-4 w-4 fill-white text-white" />
                    <span>¡PEDIR AHORA!</span>
                  </Link>
                </Button>

                {/* Shopping Cart Bag Button */}
                <Button
                  variant="secondary"
                  onClick={openCart}
                  className="relative h-11 px-3 sm:px-4 flex items-center gap-2.5 rounded-xl font-heading font-black shadow-md bg-[#FFB703] hover:bg-[#E5A400] text-[#1C1917] active:scale-95 cursor-pointer border border-[#1C1917]/20"
                  aria-label={`Abrir carrito de compras. ${totalCount} artículos por ${formatCurrency(subtotal)}`}
                >
                  <div className="relative">
                    <ShoppingBag className="h-5 w-5 text-[#1C1917]" />
                    {totalCount > 0 && (
                      <span className="absolute -top-2.5 -right-2.5 h-5 min-w-[20px] px-1 bg-[#FF3823] text-white rounded-full text-[10px] font-black border-2 border-white flex items-center justify-center animate-bounce">
                        {totalCount}
                      </span>
                    )}
                  </div>

                  <div className="hidden sm:flex flex-col items-start text-left leading-tight">
                    <span className="text-[10px] uppercase font-bold text-[#1C1917]/80 tracking-wider">
                      {totalPieces > 0 ? `${totalPieces} pzas` : "Mi Bolsa"}
                    </span>
                    <span className="text-xs font-black text-[#1C1917]">
                      {subtotal > 0 ? formatCurrency(subtotal) : "$0.00"}
                    </span>
                  </div>
                </Button>

                {/* Mobile Menu Hamburger */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="xl:hidden p-2.5 rounded-xl text-white hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#FFB703] cursor-pointer"
                  aria-expanded={mobileMenuOpen}
                  aria-controls="mobile-navigation-drawer"
                  aria-label={mobileMenuOpen ? "Cerrar menú móvil" : "Abrir menú móvil"}
                >
                  {mobileMenuOpen ? (
                    <X className="h-6 w-6 text-[#FFB703]" />
                  ) : (
                    <MenuIcon className="h-6 w-6 text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Mobile Drawer */}
        {mobileMenuOpen && (
          <div
            id="mobile-navigation-drawer"
            className="xl:hidden bg-[#1C1917] border-t border-neutral-800 text-white px-4 py-6 space-y-5 shadow-2xl animate-in slide-in-from-top-2 duration-200"
          >
            {/* Mobile Modal Trigger */}
            <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-300">Modalidad Actual:</span>
                <Badge variant={orderType === "delivery" ? "primary" : "secondary"}>
                  {orderType === "delivery" ? "A Domicilio" : "Para Llevar"}
                </Badge>
              </div>
              <p className="text-xs font-bold text-white truncate">
                {orderType === "delivery" && deliveryAddress
                  ? deliveryAddress.fullAddress
                  : selectedBranch.name}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openSelectorModal();
                }}
                className="w-full text-xs font-bold border-neutral-700 bg-transparent text-white hover:bg-neutral-800"
              >
                Cambiar Sucursal o Dirección
              </Button>
            </div>

            {/* Mobile Category Links */}
            <nav className="space-y-2 pt-2 border-t border-neutral-800" aria-label="Menú móvil">
              {NAVIGATION_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-base font-heading font-bold text-neutral-100 hover:text-[#FFB703] transition-colors"
                >
                  {link.name}
                </Link>
              ))}

              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-heading font-bold text-[#FFB703] hover:text-white"
              >
                Panel de Administración (KDS)
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-bold text-neutral-300 hover:text-white pt-3 border-t border-neutral-800"
              >
                Mi Cuenta / Iniciar Sesión
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Global Interactive Branch & Delivery Selector Modal - Lazily loaded on demand */}
      {isSelectorModalOpen && <BranchSelectorModal />}
    </>
  );
}
