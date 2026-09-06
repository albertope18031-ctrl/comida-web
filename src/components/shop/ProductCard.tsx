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

    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate?.(50);
      } catch {
        // Silently ignore if vibration is not supported
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
      <div className="group relative flex flex-col overflow-hidden rounded-3xl border-2 border-[#1C1917]/10 bg-white shadow-sm transition-all duration-300 hover:shadow-2xl hover:border-[#FF3823]/50">
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
              <Badge className="bg-[#FFB703] hover:bg-[#E5A400] text-[#1C1917] font-heading font-black border-2 border-[#1C1917] shadow-md flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full">
                <Star className="h-3 w-3 fill-[#1C1917] text-[#1C1917]" />
                <span>El más pedido</span>
              </Badge>
            )}

            {socialProof.badge === "favorito" && (
              <Badge className="bg-[#FF3823] text-white font-heading font-black shadow-md flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full border-none">
                <Flame className="h-3 w-3 fill-white text-white" />
                <span>Favorito</span>
              </Badge>
            )}

            {socialProof.badge === "recomendacion_chef" && (
              <Badge className="bg-[#588157] text-white font-heading font-black shadow-md flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full border-none">
                <Sparkles className="h-3 w-3 text-[#FFB703]" />
                <span>Rec. del Chef</span>
              </Badge>
            )}

            {!socialProof.badge && product.popular && (
              <Badge className="bg-[#FFB703] text-[#1C1917] font-heading font-black shadow-md flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full border border-[#1C1917]/20">
                <Sparkles className="h-3 w-3" />
                <span>Popular</span>
              </Badge>
            )}

            {product.isCombo && (
              <Badge className="bg-[#1C1917] text-[#FFB703] font-heading font-black shadow-md text-[11px] px-2.5 py-0.5 rounded-full border border-[#FFB703]/30">
                Combo Completo
              </Badge>
            )}
          </div>

          {product.piecesCount && (
            <div className="absolute bottom-2.5 right-2.5 bg-[#1C1917]/90 backdrop-blur-sm text-[#FFB703] border border-[#FFB703]/30 px-3 py-1 rounded-lg text-xs font-heading font-black tracking-wide shadow-md">
              {product.piecesCount} Piezas
            </div>
          )}
        </Link>

        {/* Card Content */}
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 text-xs font-heading font-black text-[#FF3823] uppercase tracking-wider mb-1.5">
              <span>{product.category}</span>
              {product.maxFlavorsAllowed > 0 && (
                <>
                  <span className="text-[#1C1917]/40">•</span>
                  <span className="flex items-center gap-0.5 text-[#588157]">
                    <Flame className="h-3 w-3" />
                    Hasta {product.maxFlavorsAllowed} salsas
                  </span>
                </>
              )}
            </div>

            <Link href={`/product/${product.slug}`}>
              <h3 className="font-heading font-black text-xl text-[#1C1917] leading-tight group-hover:text-[#FF3823] transition-colors">
                {product.name}
              </h3>
            </Link>

            {/* Social Proof Micro-text */}
            {socialProof.text && (
              <p className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-[#1C1917]/70 leading-tight">
                <Star className="h-3 w-3 fill-[#FFB703] text-[#FFB703] shrink-0" />
                <span>{socialProof.text}</span>
              </p>
            )}

            <p className="mt-2 text-xs font-sans text-[#1C1917]/70 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Price & Action Row */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-neutral-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#1C1917]/50 block leading-none">
                Precio
              </span>
              <span className="text-2xl font-display text-[#1C1917]">
                {formatCurrency(product.basePrice)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Fast-Track 1-Click Quick Add Button */}
              {defaultConfig && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleFastTrack}
                  className="border-2 border-[#FFB703] bg-[#FFB703]/20 text-[#1C1917] hover:bg-[#FFB703] font-heading font-black text-xs flex items-center gap-1 shadow-2xs rounded-xl px-2.5 h-10 cursor-pointer active:scale-95 transition-all"
                  title={`Pedir directo: ${defaultConfig.label}`}
                >
                  <Zap className="h-3.5 w-3.5 fill-[#FFB703] text-[#1C1917]" />
                  <span className="hidden sm:inline">1-Clic</span>
                  <span className="sm:hidden">Rápido</span>
                </Button>
              )}

              {/* Standard CTA Button */}
              <Button
                variant="primary"
                size="sm"
                onClick={() => setModalOpen(true)}
                className="bg-[#FF3823] hover:bg-[#E02D1A] text-white font-heading font-black flex items-center gap-1.5 shadow-md rounded-xl h-10 px-4 cursor-pointer active:scale-95 transition-all text-xs"
              >
                <Plus className="h-4 w-4" />
                <span>AÑADIR AL CARRITO</span>
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
