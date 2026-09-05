"use client";

import { useState } from "react";
import { Plus, Flame, Sparkles, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCustomizerModal } from "@/components/shop/ProductCustomizerModal";
import type { Product } from "@/types/shop";

export function ProductPageClient({ product }: { product: Product }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-4 pt-4 border-t border-neutral-200">
      <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
        <div className="flex items-center gap-2 text-xs font-black uppercase text-[#005A36]">
          <Flame className="h-4 w-4 text-[#FFC72C]" />
          <span>Configura tus salsas y complementos</span>
        </div>
        <p className="text-xs text-emerald-950">
          Personaliza hasta {product.maxFlavorsAllowed} sabores, elige tu aderezo artesanal incluido y agrega complementos para completar tu experiencia.
        </p>

        <Button
          variant="gold"
          size="lg"
          onClick={() => setIsModalOpen(true)}
          className="w-full h-12 font-black text-base shadow-md flex items-center justify-center gap-2"
        >
          <ChefHat className="h-5 w-5 text-neutral-950" />
          <span>Personalizar y Agregar a la Bolsa</span>
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
