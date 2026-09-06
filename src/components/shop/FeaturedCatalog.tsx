"use client";

import { useEffect, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Flame, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCarousel } from "@/components/shop/ProductCarousel";
import { PRODUCTS } from "@/lib/mock-data";
import {
  useCategoryStore,
  MENU_CATEGORIES,
  filterProductsByCategory,
  scrollToCenteredProductCard,
} from "@/store/category-store";

export function FeaturedCatalog() {
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const { selectedCategory, setSelectedCategory } = useCategoryStore();

  // Sincroniza query param ?category=... o ?cat=... de la URL hacia el store
  useEffect(() => {
    const catParam = searchParams.get("category") || searchParams.get("cat");
    if (catParam) {
      const match = MENU_CATEGORIES.find(
        (c) => c.slug.toLowerCase() === catParam.toLowerCase()
      );
      if (match) {
        setSelectedCategory(match.slug);
        setTimeout(() => {
          scrollToCenteredProductCard();
        }, 150);
      }
    }
  }, [searchParams, setSelectedCategory]);

  const filteredProducts = filterProductsByCategory(PRODUCTS, selectedCategory);

  const handleCategorySelect = (slug: string) => {
    startTransition(() => {
      setSelectedCategory(slug);

      // Actualizar URL sin anclas hash para evitar saltos descontrolados
      if (typeof window !== "undefined") {
        const newUrl = slug === "all" ? "/" : `/?category=${slug}`;
        window.history.replaceState({}, "", newUrl);

        // Si la tarjeta ya se encuentra en pantalla, solo resetea el carrusel horizontal a la 1ra tarjeta;
        // si está fuera de vista, ejecuta el centrado suave
        setTimeout(() => {
          scrollToCenteredProductCard(true);
        }, 50);
      }
    });
  };

  return (
    <section id="menu" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 scroll-mt-32">
      {/* Cabecera compacta de sección */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 md:mb-5 gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-heading font-black uppercase tracking-wider text-[#FF3823] mb-1">
            <Flame className="h-4 w-4 fill-[#FF3823] text-[#FF3823]" />
            Los Monchos Favoritos
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl text-[#1C1917] uppercase tracking-tight leading-tight">
            Alitas, Hamburguesas &amp; Combos
          </h2>
          <p className="text-xs sm:text-sm font-sans text-[#1C1917]/70 mt-1 font-medium">
            Elige tu presentación favorita, salsas bravas y complementos crujientes.
          </p>
        </div>

        <Button
          asChild
          className="bg-[#1C1917] hover:bg-[#FF3823] text-white font-heading font-black rounded-xl px-4 h-10 transition-colors shadow-md text-xs self-start sm:self-auto shrink-0"
        >
          <Link href="/menu" className="flex items-center gap-1.5">
            <span>Ver Menú Completo</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      {/* Barra Horizontal de Filtro de Categorías */}
      <div
        className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 scrollbar-none [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none] -mx-4 px-4 sm:mx-0 sm:px-0"
        role="tablist"
        aria-label="Filtro de categorías de productos"
      >
        {MENU_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.slug;
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => handleCategorySelect(cat.slug)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-heading transition-all cursor-pointer select-none [-webkit-tap-highlight-color:transparent] ${
                isActive
                  ? "bg-[#FF3823] text-white font-black shadow-md scale-102"
                  : "bg-white text-[#1C1917] hover:bg-[#FFB703]/20 border-2 border-[#1C1917]/10 font-bold"
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Carrusel Cover Flow Filtrado de Productos con ciclo de vida aislado por categoría */}
      <ProductCarousel
        key={`carousel-${selectedCategory}`}
        products={filteredProducts}
      />
    </section>
  );
}
