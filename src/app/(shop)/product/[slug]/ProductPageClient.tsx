"use client";

import { useState } from "react";
import { Flame, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCustomizerModal } from "@/components/shop/ProductCustomizerModal";
import type { Product } from "@/types/shop";

export function ProductPageClient({ product }: { product: Product }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-4 pt-4 border-t-2 border-[#1C1917]/10">
      <div className="p-5 rounded-2xl bg-[#FFB703]/15 border-2 border-[#FFB703]/50 space-y-3">
        <div className="flex items-center gap-2 text-xs font-heading font-black uppercase text-[#FF3823]">
          <Flame className="h-4 w-4 fill-[#FF3823] text-[#FF3823]" />
          <span>Configura tus salsas bravas y complementos</span>
        </div>
        <p className="text-xs font-sans font-medium text-[#1C1917]/80">
          Personaliza hasta {product.maxFlavorsAllowed} salsas, elige tu aderezo o dip caliente incluido y agrega papas para el moncho perfecto.
        </p>

        <Button
          size="lg"
          onClick={() => setIsModalOpen(true)}
          className="w-full h-12 bg-[#FF3823] hover:bg-[#E02D1A] text-white font-heading font-black text-base shadow-lg rounded-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
        >
          <ChefHat className="h-5 w-5 text-white" />
          <span>AÑADIR AL CARRITO / PERSONALIZAR</span>
        </Button>
      </div>

      <ProductCustomizerModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
