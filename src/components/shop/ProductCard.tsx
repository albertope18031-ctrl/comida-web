"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Flame, Sparkles, Zap, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import {
  getProductDefaultConfig,
  getProductSocialProof,
  createFastTrackCartItem,
} from "@/lib/product-defaults";
import type { Product } from "@/types/shop";

const ProductCustomizerModal = dynamic(
  () => import("./ProductCustomizerModal").then((mod) => mod.ProductCustomizerModal),
  { ssr: false }
);

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { addItem, openCart } = useCartStore();

  const defaultConfig = getProductDefaultConfig(product);
  const socialProof = getProductSocialProof(product);

  const handleFastTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // Haptic vibration feedback on mobile devices
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate?.(50);
      } catch {
        // Silently ignore if vibration permission is denied
      }
    }

    const fastTrackItem = createFastTrackCartItem(product, defaultConfig || undefined);
    addItem(fastTrackItem);

    toast.success("¡Agregado con combinación clásica!", {
      description: `${product.name} (${defaultConfig?.label || "Clásico de la casa"}) en tu bolsa.`,
      action: {
        label: "Ver Bolsa",
        onClick: () => openCart(),
      },
    });
  };

  return (
    <>
      <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:border-emerald-700/40">
        {/* Product Image */}
        <Link
          href={`/product/${product.slug}`}
          className="relative aspect-4/3 w-full overflow-hidden bg-neutral-100 block"
        >
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Social Proof & Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            {socialProof.badge === "mas_pedido" && (
              <Badge className="bg-[#FFC72C] hover:bg-[#e5b224] text-neutral-950 font-black border border-amber-400 shadow-md flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full">
                <Star className="h-3 w-3 fill-neutral-950 text-neutral-950" />
                <span>El más pedido</span>
              </Badge>
            )}

            {socialProof.badge === "favorito" && (
              <Badge className="bg-gradient-to-r from-red-600 to-amber-600 text-white font-black shadow-md flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full border-none">
                <Flame className="h-3 w-3 fill-white text-white" />
                <span>Favorito</span>
              </Badge>
            )}

            {socialProof.badge === "recomendacion_chef" && (
              <Badge className="bg-[#005A36] hover:bg-[#004227] text-white font-black shadow-md flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full border-none">
                <Sparkles className="h-3 w-3 text-amber-300" />
                <span>Rec. del Chef</span>
              </Badge>
            )}

            {!socialProof.badge && product.popular && (
              <Badge variant="gold" className="shadow-md flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full">
                <Sparkles className="h-3 w-3" />
                <span>Popular</span>
              </Badge>
            )}

            {product.isCombo && (
              <Badge className="bg-[#005A36] text-white shadow-md text-[11px] px-2 py-0.5 rounded-full border-none">
                Combo Completo
              </Badge>
            )}
          </div>

          {product.piecesCount && (
            <div className="absolute bottom-2 right-2 bg-neutral-900/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-xs font-black tracking-wide">
              {product.piecesCount} Piezas
            </div>
          )}
        </Link>

        {/* Card Content */}
        <div className="flex flex-1 flex-col p-5">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
              <span>{product.category}</span>
              {product.maxFlavorsAllowed > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 text-amber-700">
                    <Flame className="h-3 w-3" />
                    Hasta {product.maxFlavorsAllowed} sabores
                  </span>
                </>
              )}
            </div>

            <Link href={`/product/${product.slug}`}>
              <h3 className="font-black text-lg text-neutral-900 leading-snug group-hover:text-[#005A36] transition-colors">
                {product.name}
              </h3>
            </Link>

            {/* Social Proof Micro-text */}
            {socialProof.text && (
              <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-amber-800/90 leading-tight">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500 shrink-0" />
                <span>{socialProof.text}</span>
              </p>
            )}

            <p className="mt-2 text-xs text-neutral-500 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Price & Action Row */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-neutral-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-400 block leading-none">
                Desde
              </span>
              <span className="text-xl font-black text-neutral-950">
                {formatCurrency(product.basePrice)}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Fast-Track 1-Click Quick Add Button */}
              {defaultConfig && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleFastTrack}
                  className="border-amber-400/90 bg-amber-50 text-amber-950 hover:bg-amber-100 hover:text-amber-950 font-black text-xs flex items-center gap-1 shadow-2xs rounded-lg px-2.5 h-9 cursor-pointer active:scale-95 transition-all"
                  title={`Pedir directo: ${defaultConfig.label}`}
                >
                  <Zap className="h-3.5 w-3.5 fill-amber-500 text-amber-600" />
                  <span className="hidden sm:inline">1-Clic</span>
                  <span className="sm:hidden">Rápido</span>
                </Button>
              )}

              {/* Standard Customize Button */}
              <Button
                variant="primary"
                size="sm"
                onClick={() => setModalOpen(true)}
                className="font-bold flex items-center gap-1.5 shadow-sm rounded-lg h-9 cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Personalizar</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Product Customizer Modal - Code split & lazily loaded */}
      {modalOpen && (
        <ProductCustomizerModal
          product={product}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
