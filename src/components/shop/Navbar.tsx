"use client";

import Link from "next/link";
import Image from "next/image";
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
import { useBranchStore } from "@/store/branch-store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { items, openCart, getSubtotal } = useCartStore();
  const { selectedBranch, fulfillmentType, setFulfillmentType } = useBranchStore();

  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = getSubtotal();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#1C1917] text-white shadow-md border-b border-[#FFB703]/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative h-10 w-10 rounded-xl overflow-hidden bg-[#FFB703] p-0.5 border border-[#1C1917]">
            <Image src="/images/loco-rooster.png" alt="Loco Rooster" fill sizes="40px" className="object-contain" />
          </div>
          <span className="font-display text-xl text-white">LOCO ROOSTER</span>
        </Link>
        <Button onClick={openCart} className="bg-[#FF3823] hover:bg-[#E02D1A] text-white font-bold rounded-xl">
          <ShoppingBag className="h-4 w-4 mr-2" />
          <span>{formatCurrency(subtotal)}</span>
        </Button>
      </div>
    </header>
  );
}
