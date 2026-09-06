"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/shop/ProductCard";
import type { Product } from "@/types/shop";

interface ProductCarouselProps {
  products?: Product[];
  children?: React.ReactNode;
  className?: string;
}

export function ProductCarousel({
  products,
  children,
  className = "",
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    // Tolerancia de 4px para cálculos de subpíxeles en pantallas de alta densidad
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    // Medir ancho de tarjeta más el espaciado (gap) o 80% del ancho visible
    const firstItem = el.querySelector<HTMLElement>("[data-carousel-item]");
    const scrollAmount = firstItem ? firstItem.offsetWidth + 24 : el.clientWidth * 0.8;

    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollButtons();

    const onScroll = () => updateScrollButtons();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateScrollButtons);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        updateScrollButtons();
      });
      resizeObserver.observe(el);
    }

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateScrollButtons);
      resizeObserver?.disconnect();
    };
  }, [updateScrollButtons, products, children]);

  return (
    <div className={`relative group/carousel ${className}`}>
      {/* Flecha Flotante Izquierda (Desktop / Tablet) */}
      <button
        type="button"
        onClick={() => handleScroll("left")}
        disabled={!canScrollLeft}
        aria-label="Desplazar a la izquierda"
        className={`hidden md:flex items-center justify-center absolute -left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-[#1C1917] text-white hover:bg-[#FF3823] border border-[#1C1917]/20 shadow-xl transition-all duration-300 active:scale-90 focus:outline-none focus:ring-2 focus:ring-[#FF3823] cursor-pointer ${
          canScrollLeft
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-75 pointer-events-none"
        }`}
      >
        <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
      </button>

      {/* Contenedor de Desplazamiento Táctil Nativo con CSS Scroll Snap */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 pt-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none] -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products
          ? products.map((product) => (
              <div
                key={product.id}
                data-carousel-item
                className="w-[82vw] sm:w-[320px] md:w-[340px] lg:w-[360px] flex-shrink-0 snap-start flex flex-col"
              >
                <ProductCard product={product} />
              </div>
            ))
          : React.Children.map(children, (child, index) => (
              <div
                key={index}
                data-carousel-item
                className="w-[82vw] sm:w-[320px] md:w-[340px] lg:w-[360px] flex-shrink-0 snap-start flex flex-col"
              >
                {child}
              </div>
            ))}

        {/* Espaciador final para permitir un snap completo y holgado en la última tarjeta */}
        <div className="w-2 sm:w-4 flex-shrink-0" aria-hidden="true" />
      </div>

      {/* Flecha Flotante Derecha (Desktop / Tablet) */}
      <button
        type="button"
        onClick={() => handleScroll("right")}
        disabled={!canScrollRight}
        aria-label="Desplazar a la derecha"
        className={`hidden md:flex items-center justify-center absolute -right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-[#1C1917] text-white hover:bg-[#FF3823] border border-[#1C1917]/20 shadow-xl transition-all duration-300 active:scale-90 focus:outline-none focus:ring-2 focus:ring-[#FF3823] cursor-pointer ${
          canScrollRight
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-75 pointer-events-none"
        }`}
      >
        <ChevronRight className="h-6 w-6" strokeWidth={2.5} />
      </button>
    </div>
  );
}
