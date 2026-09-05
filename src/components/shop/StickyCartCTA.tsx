"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency } from "@/lib/utils";

interface StickyCartCTAProps {
  actionType?: "open_drawer" | "go_to_checkout";
}

export function StickyCartCTA({
  actionType = "open_drawer",
}: StickyCartCTAProps) {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const { items, getSubtotal, getTotalItemsCount, openCart } = useCartStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Avoid hydration mismatch by waiting for client mount
  if (!isMounted) return null;

  // Smart hiding: do not display on checkout, order tracker or invoicing pages
  if (
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/order") ||
    pathname.startsWith("/facturacion")
  ) {
    return null;
  }

  const totalItems = getTotalItemsCount();
  if (totalItems < 1 || items.length === 0) {
    return null;
  }

  const subtotal = getSubtotal();

  const handleAction = () => {
    if (actionType === "go_to_checkout") {
      router.push("/checkout");
    } else {
      openCart();
    }
  };

  return (
    <aside
      role="region"
      aria-label="Resumen rápido del carrito de compras"
      className="block md:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800 shadow-[0_-8px_30px_rgba(0,0,0,0.4)] pb-[env(safe-area-inset-bottom)] transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
    >
      <div className="px-4 py-3">
        <button
          type="button"
          onClick={handleAction}
          className="w-full flex items-center justify-between gap-3 bg-[#005A36] hover:bg-[#004227] text-white p-3 rounded-2xl shadow-lg shadow-emerald-950/40 transition-all duration-200 active:scale-[0.98] cursor-pointer"
        >
          {/* Left side: Shopping bag icon, item count & total */}
          <div className="flex items-center gap-3 min-w-0 text-left">
            <div className="relative flex items-center justify-center h-10 w-10 rounded-xl bg-white/10 text-white shrink-0">
              <ShoppingBag className="h-5 w-5 text-emerald-300" />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FFC72C] text-[11px] font-black text-neutral-950 shadow">
                {totalItems}
              </span>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold text-emerald-200 truncate">
                Ver pedido ({totalItems} {totalItems === 1 ? "producto" : "productos"})
              </p>
              <p className="text-sm font-black text-white tracking-wide">
                {formatCurrency(subtotal)} MXN
              </p>
            </div>
          </div>

          {/* Right side: Action CTA with microinteraction */}
          <div className="flex items-center gap-1.5 bg-[#FFC72C] text-neutral-950 px-3.5 py-2 rounded-xl font-black text-xs uppercase tracking-wider shrink-0 shadow-md group-hover:bg-amber-400 transition-colors">
            <span>Continuar</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </button>
      </div>
    </aside>
  );
}
