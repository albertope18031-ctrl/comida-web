"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ShoppingBag,
  MapPin,
  Flame,
  User,
  Menu as MenuIcon,
  X,
  ChevronDown,
  Clock,
} from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useBranchStore, DEFAULT_BRANCHES } from "@/store/branch-store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [branchSelectorOpen, setBranchSelectorOpen] = useState(false);

  const { items, openCart, getSubtotal } = useCartStore();
  const { selectedBranch, fulfillmentType, setFulfillmentType, setSelectedBranch } =
    useBranchStore();

  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = getSubtotal();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#005A36] text-white shadow-md">
      {/* Top Banner / Fulfillment bar */}
      <div className="bg-[#004227] px-4 py-1.5 text-xs text-neutral-200 border-b border-emerald-800">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-2">
          {/* Fulfillment Toggle */}
          <div className="flex items-center gap-3">
            <span className="font-semibold text-neutral-300">Modo de pedido:</span>
            <div className="inline-flex rounded-full bg-emerald-950/80 p-0.5 border border-emerald-700">
              <button
                type="button"
                onClick={() => setFulfillmentType("delivery")}
                className={`rounded-full px-3 py-0.5 text-xs font-bold transition-colors cursor-pointer ${
                  fulfillmentType === "delivery"
                    ? "bg-[#FFC72C] text-neutral-950"
                    : "text-neutral-300 hover:text-white"
                }`}
              >
                Entrega a domicilio
              </button>
              <button
                type="button"
                onClick={() => setFulfillmentType("pickup")}
                className={`rounded-full px-3 py-0.5 text-xs font-bold transition-colors cursor-pointer ${
                  fulfillmentType === "pickup"
                    ? "bg-[#FFC72C] text-neutral-950"
                    : "text-neutral-300 hover:text-white"
                }`}
              >
                Para llevar
              </button>
            </div>
          </div>

          {/* Active Branch Selector Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setBranchSelectorOpen(!branchSelectorOpen)}
              className="flex items-center gap-1.5 font-medium hover:text-[#FFC72C] transition-colors cursor-pointer"
            >
              <MapPin className="h-3.5 w-3.5 text-[#FFC72C]" />
              <span className="underline decoration-dotted underline-offset-2">
                {selectedBranch.name}
              </span>
              <span className="hidden sm:inline text-emerald-300 text-[11px]">
                ({selectedBranch.estimatedDeliveryMin} min)
              </span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {/* Branch dropdown */}
            {branchSelectorOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-lg bg-white p-2 shadow-xl border border-neutral-200 text-neutral-900 z-50">
                <div className="px-3 py-2 border-b border-neutral-100 font-bold text-xs uppercase tracking-wider text-neutral-500">
                  Selecciona tu sucursal
                </div>
                <div className="py-1 max-h-60 overflow-y-auto">
                  {DEFAULT_BRANCHES.map((branch) => (
                    <button
                      key={branch.id}
                      type="button"
                      onClick={() => {
                        setSelectedBranch(branch);
                        setBranchSelectorOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-xs transition-colors cursor-pointer flex flex-col ${
                        selectedBranch.id === branch.id
                          ? "bg-emerald-50 text-[#005A36] font-bold"
                          : "hover:bg-neutral-100 text-neutral-800"
                      }`}
                    >
                      <span className="font-semibold">{branch.name}</span>
                      <span className="text-[11px] text-neutral-500 truncate">
                        {branch.address}
                      </span>
                      <span className="text-[10px] text-emerald-700 flex items-center gap-1 mt-0.5">
                        <Clock className="h-2.5 w-2.5" /> Entrega estimada: {branch.estimatedDeliveryMin} min
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFC72C] text-[#005A36] font-black text-xl shadow-md group-hover:scale-105 transition-transform">
                W
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-wider uppercase text-white font-mono leading-none">
                  WINGSTOP
                </span>
                <span className="text-[10px] font-bold tracking-widest text-[#FFC72C] uppercase leading-tight">
                  MÉXICO
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 text-sm font-bold">
              <Link
                href="/menu"
                className="text-white hover:text-[#FFC72C] transition-colors"
              >
                Menú Completo
              </Link>
              <Link
                href="/#sabores"
                className="text-neutral-200 hover:text-[#FFC72C] transition-colors flex items-center gap-1"
              >
                <Flame className="h-4 w-4 text-[#FFC72C]" />
                Los 11 Sabores
              </Link>
              <Link
                href="/#combos"
                className="text-neutral-200 hover:text-[#FFC72C] transition-colors"
              >
                Combos & Packs
              </Link>
              <Link
                href="/admin"
                className="text-emerald-300 hover:text-white transition-colors text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-900/60 border border-emerald-700/50"
              >
                Panel Admin
              </Link>
            </nav>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-3">
            {/* User / Auth */}
            <Link
              href="/login"
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-neutral-200 hover:text-white px-3 py-2 rounded-lg hover:bg-emerald-900/50 transition-colors"
            >
              <User className="h-4 w-4" />
              <span>Mi Cuenta</span>
            </Link>

            {/* Cart Button */}
            <Button
              variant="gold"
              onClick={openCart}
              className="relative h-11 px-4 flex items-center gap-2 rounded-lg font-black shadow-lg"
            >
              <ShoppingBag className="h-5 w-5 text-neutral-950" />
              <div className="flex flex-col items-start text-left leading-none">
                <span className="text-[10px] uppercase font-bold text-neutral-700">Mi Bolsa</span>
                <span className="text-xs font-extrabold text-neutral-950">
                  {subtotal > 0 ? formatCurrency(subtotal) : "0 artículos"}
                </span>
              </div>
              {totalCount > 0 && (
                <Badge
                  variant="hot"
                  className="absolute -top-2 -right-2 h-5 min-w-[20px] px-1 text-[11px] font-black border-2 border-[#005A36] text-white bg-red-600 rounded-full flex items-center justify-center"
                >
                  {totalCount}
                </Badge>
              )}
            </Button>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-white hover:bg-emerald-900/50"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#004227] border-t border-emerald-800 px-4 py-4 space-y-3">
          <Link
            href="/menu"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-bold text-white hover:text-[#FFC72C]"
          >
            Menú Completo
          </Link>
          <Link
            href="/#sabores"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-bold text-white hover:text-[#FFC72C]"
          >
            Los 11 Sabores
          </Link>
          <Link
            href="/#combos"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-bold text-white hover:text-[#FFC72C]"
          >
            Combos & Packs
          </Link>
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-bold text-emerald-300 hover:text-white"
          >
            Panel Administrativo
          </Link>
          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-bold text-neutral-200 hover:text-white pt-2 border-t border-emerald-800"
          >
            Iniciar Sesión / Registro
          </Link>
        </div>
      )}
    </header>
  );
}
