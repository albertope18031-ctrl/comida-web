"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Flame, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";
import { formatCurrency } from "@/lib/utils";
import { getProductSocialProof } from "@/lib/product-defaults";
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
  const socialProof = getProductSocialProof(product);

  return (
    <>
      <div className="group relative flex flex-col h-full w-full overflow-hidden rounded-3xl border-2 border-[#1C1917]/10 bg-white shadow-sm transition-all duration-300 hover:shadow-2xl hover:border-[#FF3823]/50 select-none">
        {/* Product Image - Fixed aspect ratio & clean cropping across all cards */}
        <Link
          href={`/product/${product.slug}`}
          className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-neutral-100 block"
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

        {/* Card Content - Vertical flexbox with distributed slots */}
        <div className="flex flex-1 flex-col p-4 sm:p-5 justify-between">
          <div className="flex flex-col">
            {/* Category & Flavors Row - Consistent reserved height */}
            <div className="h-5 flex items-center gap-1.5 text-xs font-heading font-black text-[#FF3823] uppercase tracking-wider mb-1">
              <span className="truncate">{product.category}</span>
              {product.maxFlavorsAllowed > 0 && (
                <>
                  <span className="text-[#1C1917]/40 shrink-0">•</span>
                  <span className="flex items-center gap-0.5 text-[#588157] shrink-0 text-[11px]">
                    <Flame className="h-3 w-3" />
                    Hasta {product.maxFlavorsAllowed} salsas
                  </span>
                </>
              )}
            </div>

            {/* Product Title - Uniform reserved height for up to 2 lines */}
            <Link href={`/product/${product.slug}`} className="block">
              <h3 className="font-heading font-black text-lg sm:text-xl text-[#1C1917] leading-snug group-hover:text-[#FF3823] transition-colors line-clamp-2 h-12 sm:h-14 flex items-start">
                {product.name}
              </h3>
            </Link>

            {/* Social Proof Micro-text - Fixed reserved height slot (prevents layout shift when absent) */}
            <div className="h-5 mt-1 flex items-center">
              {socialProof.text ? (
                <p className="flex items-center gap-1 text-[11px] font-bold text-[#1C1917]/70 leading-tight truncate">
                  <Star className="h-3 w-3 fill-[#FFB703] text-[#FFB703] shrink-0" />
                  <span className="truncate">{socialProof.text}</span>
                </p>
              ) : (
                <span className="invisible text-[11px] select-none" aria-hidden="true">&nbsp;</span>
              )}
            </div>

            {/* Description - Fixed reserved height clamped to 2 lines */}
            <p className="mt-1.5 text-xs font-sans text-[#1C1917]/70 line-clamp-2 leading-relaxed h-9 sm:h-10 overflow-hidden">
              {product.description}
            </p>
          </div>

          {/* Price & Action Row - Anchored to bottom with mt-auto */}
          <div className="mt-auto pt-3 sm:pt-4 border-t border-neutral-100 flex items-center justify-between gap-3">
            <div className="shrink-0">
              <span className="text-[10px] uppercase font-bold text-[#1C1917]/50 block leading-none">
                Precio
              </span>
              <span className="text-xl sm:text-2xl font-display text-[#1C1917] whitespace-nowrap">
                {formatCurrency(product.basePrice)}
              </span>
            </div>

            {/* Single Full Action Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => setModalOpen(true)}
              className="bg-[#FF3823] hover:bg-[#E02D1A] text-white font-heading font-black flex items-center justify-center gap-1.5 shadow-md rounded-xl h-10 px-3.5 sm:px-4 cursor-pointer active:scale-95 transition-all text-xs tracking-tight shrink-0 whitespace-nowrap"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span>AÑADIR AL CARRITO</span>
            </Button>
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
