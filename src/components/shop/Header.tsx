"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  FileText,
  Tag,
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

const NAVIGATION_LINKS = [
  { name: "Alitas & Boneless", href: "/menu?cat=alitas" },
  { name: "Hamburguesas", href: "/menu?cat=sandwiches" },
  { name: "Combos", href: "/menu?cat=combos" },
  { name: "Bebidas", href: "/menu?cat=bebidas" },
  { name: "Promociones", href: "/#promociones", icon: Tag },
  { name: "Facturación", href: "/facturacion", icon: FileText },
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

  // Calculate total chicken pieces in cart for extra fidelity
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
          isScrolled ? "shadow-xl" : "shadow-md"
        }`}
      >
        {/* Top Operational Bar: Context & Fulfillment Selector */}
        <div className="bg-[#004227] text-white border-b border-emerald-800/80 px-4 py-2">
          <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
            {/* Prominent Fulfillment & Branch Toggle Button */}
            <button
              type="button"
              onClick={openSelectorModal}
              className="flex items-center gap-2.5 rounded-full bg-emerald-950/90 hover:bg-emerald-900 px-3.5 py-1.5 border border-emerald-600/60 transition-all cursor-pointer group shadow-sm"
              aria-label="Seleccionar modalidad de entrega y sucursal"
            >
              {/* Order Mode Pill */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                  orderType === "delivery"
                    ? "bg-[#FFC72C] text-neutral-950"
                    : "bg-white text-[#005A36]"
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
              <div className="flex items-center gap-1.5 text-xs text-neutral-100 font-bold group-hover:text-[#FFC72C] transition-colors">
                <MapPin className="h-3.5 w-3.5 text-[#FFC72C] shrink-0" />
                <span className="truncate max-w-[200px] sm:max-w-[320px]">
                  {orderType === "delivery" && deliveryAddress
                    ? deliveryAddress.fullAddress
                    : selectedBranch.name}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-neutral-300 group-hover:translate-y-0.5 transition-transform" />
              </div>

              {/* Estimated Time Badge */}
              <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-300 bg-emerald-900/80 px-2 py-0.5 rounded-md">
                <Clock className="h-3 w-3 text-[#FFC72C]" />
                <span>
                  {orderType === "delivery"
                    ? `${selectedBranch.estimatedDeliveryMin} min`
                    : `${selectedBranch.estimatedPickupMin} min`}
                </span>
              </div>
            </button>

            {/* Quick Secondary Actions */}
            <div className="flex items-center gap-4 text-xs font-semibold text-neutral-300">
              <Link
                href="/admin"
                className="hidden lg:flex items-center gap-1 text-emerald-300 hover:text-white transition-colors text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-900/60 border border-emerald-700/50"
              >
                Panel Admin
              </Link>
              <span className="hidden sm:inline text-neutral-400">|</span>
              <span className="hidden sm:inline text-[11px] text-neutral-300">
                Horario: {selectedBranch.openingTime} a {selectedBranch.closingTime} hrs
              </span>
            </div>
          </div>
        </div>

        {/* Main Header Bar */}
        <div className="bg-[#005A36] text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-18 items-center justify-between gap-4">
              {/* Brand Logo */}
              <div className="flex items-center gap-8">
                <Link
                  href="/"
                  className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-[#FFC72C] rounded-lg p-1"
                  aria-label="Wingstop México - Inicio"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFC72C] text-[#005A36] font-black text-2xl shadow-md group-hover:scale-105 transition-transform">
                    W
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-black tracking-wider uppercase text-white font-mono leading-none">
                      WINGSTOP
                    </span>
                    <span className="text-[10px] font-extrabold tracking-widest text-[#FFC72C] uppercase leading-tight">
                      MÉXICO
                    </span>
                  </div>
                </Link>

                {/* Desktop Category Navigation */}
                <nav
                  className="hidden xl:flex items-center space-x-6 text-sm font-bold"
                  aria-label="Navegación principal de categorías"
                >
                  {NAVIGATION_LINKS.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="text-neutral-100 hover:text-[#FFC72C] transition-colors flex items-center gap-1.5 whitespace-nowrap"
                    >
                      {link.icon && <link.icon className="h-3.5 w-3.5 text-[#FFC72C]" />}
                      <span>{link.name}</span>
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Right Action Icons: Cart & Auth */}
              <div className="flex items-center gap-3">
                {/* User / Login Button */}
                <Link
                  href="/login"
                  className="hidden sm:flex items-center gap-1.5 text-xs font-black text-white hover:text-[#FFC72C] px-3 py-2 rounded-lg hover:bg-emerald-900/60 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>Mi Cuenta</span>
                </Link>

                {/* Shopping Cart Button */}
                <Button
                  variant="gold"
                  onClick={openCart}
                  className="relative h-12 px-4.5 flex items-center gap-3 rounded-xl font-black shadow-lg hover:scale-102 active:scale-98 transition-all cursor-pointer"
                  aria-label={`Abrir carrito de compras. ${totalCount} artículos por ${formatCurrency(subtotal)}`}
                >
                  <div className="relative">
                    <ShoppingBag className="h-5 w-5 text-neutral-950" />
                    {totalCount > 0 && (
                      <span className="absolute -top-2.5 -right-2.5 h-5 min-w-[20px] px-1 bg-red-600 text-white rounded-full text-[10px] font-black border-2 border-[#FFC72C] flex items-center justify-center animate-bounce">
                        {totalCount}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col items-start text-left leading-tight">
                    <span className="text-[10px] uppercase font-black text-neutral-800 tracking-wider">
                      {totalPieces > 0 ? `${totalPieces} pzas` : "Mi Bolsa"}
                    </span>
                    <span className="text-xs font-black text-neutral-950">
                      {subtotal > 0 ? formatCurrency(subtotal) : "$0.00"}
                    </span>
                  </div>
                </Button>

                {/* Mobile Menu Hamburger */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="xl:hidden p-2.5 rounded-xl text-white hover:bg-emerald-900/60 focus:outline-none focus:ring-2 focus:ring-[#FFC72C] cursor-pointer"
                  aria-expanded={mobileMenuOpen}
                  aria-controls="mobile-navigation-drawer"
                  aria-label={mobileMenuOpen ? "Cerrar menú móvil" : "Abrir menú móvil"}
                >
                  {mobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <MenuIcon className="h-6 w-6" />
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
            className="xl:hidden bg-[#004227] border-t border-emerald-800 text-white px-4 py-6 space-y-5 shadow-2xl animate-in slide-in-from-top-2 duration-200"
          >
            {/* Mobile Modal Trigger */}
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-700 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-300">Modalidad Actual:</span>
                <Badge variant="gold">
                  {orderType === "delivery" ? "A Domicilio" : "Para Llevar"}
                </Badge>
              </div>
              <p className="text-xs font-black text-white truncate">
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
                className="w-full text-xs font-bold border-emerald-500 bg-transparent text-white hover:bg-emerald-800"
              >
                Cambiar Sucursal o Dirección
              </Button>
            </div>

            {/* Mobile Category Links */}
            <nav className="space-y-2 pt-2 border-t border-emerald-800/80" aria-label="Menú móvil">
              {NAVIGATION_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-base font-black text-neutral-100 hover:text-[#FFC72C] transition-colors"
                >
                  {link.name}
                </Link>
              ))}

              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-bold text-emerald-300 hover:text-white"
              >
                Panel de Administración (KDS)
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-bold text-neutral-200 hover:text-white pt-3 border-t border-emerald-800"
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
