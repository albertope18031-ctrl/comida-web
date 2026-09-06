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
  const rafId = useRef<number | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const itemCount = products ? products.length : React.Children.count(children);

  // Calcula qué tarjeta está visualmente en el centro del carrusel
  const calculateActiveIndex = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const containerCenter = el.scrollLeft + el.clientWidth / 2;
    const items = el.querySelectorAll<HTMLElement>("[data-carousel-item]");
    if (items.length === 0) return;

    let closestIndex = 0;
    let minDistance = Infinity;

    items.forEach((item, index) => {
      const itemCenter = item.offsetLeft + item.offsetWidth / 2;
      const distance = Math.abs(containerCenter - itemCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    setActiveIndex((prev) => (prev !== closestIndex ? closestIndex : prev));
  }, []);

  // Actualiza visibilidad de flechas flotantes en los límites de scroll
  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  // Listener de scroll de alto rendimiento sincronizado con requestAnimationFrame
  const handleScrollThrottled = useCallback(() => {
    if (rafId.current !== null) return;
    rafId.current = requestAnimationFrame(() => {
      calculateActiveIndex();
      updateScrollButtons();
      rafId.current = null;
    });
  }, [calculateActiveIndex, updateScrollButtons]);

  // Centra una tarjeta específica por índice
  const scrollToIndex = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;

    const items = el.querySelectorAll<HTMLElement>("[data-carousel-item]");
    const targetItem = items[index];
    if (!targetItem) return;

    const targetScrollLeft =
      targetItem.offsetLeft - (el.clientWidth - targetItem.offsetWidth) / 2;

    el.scrollTo({
      left: Math.max(0, targetScrollLeft),
      behavior: "smooth",
    });
  };

  const handleArrowClick = (direction: "left" | "right") => {
    const itemsLength = itemCount;
    if (itemsLength === 0) return;

    const nextIndex =
      direction === "left"
        ? Math.max(0, activeIndex - 1)
        : Math.min(itemsLength - 1, activeIndex + 1);

    scrollToIndex(nextIndex);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    calculateActiveIndex();
    updateScrollButtons();

    el.addEventListener("scroll", handleScrollThrottled, { passive: true });
    window.addEventListener("resize", handleScrollThrottled);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        handleScrollThrottled();
      });
      resizeObserver.observe(el);
    }

    return () => {
      el.removeEventListener("scroll", handleScrollThrottled);
      window.removeEventListener("resize", handleScrollThrottled);
      resizeObserver?.disconnect();
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [calculateActiveIndex, updateScrollButtons, handleScrollThrottled, products, children]);

  // Sincroniza estado de flechas y zoom al cambiar productos o categorías
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    container.scrollTo({ left: 0, behavior: "instant" });

    const syncState = () => {
      const { clientWidth, scrollWidth } = container;
      setCanScrollLeft(false);
      setCanScrollRight(scrollWidth > clientWidth + 5);
      setActiveIndex(0);
    };

    const timer = setTimeout(syncState, 60);
    return () => clearTimeout(timer);
  }, [children, products]);

  return (
    <div className={`relative group/carousel min-h-[530px] sm:min-h-[555px] md:min-h-[580px] ${className}`}>
      {/* Flecha Flotante Izquierda (Desktop / Tablet) */}
      <button
        type="button"
        onClick={() => handleArrowClick("left")}
        disabled={!canScrollLeft}
        aria-label="Desplazar al producto anterior"
        className={`hidden md:flex items-center justify-center absolute -left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-[#1C1917] text-white hover:bg-[#FF3823] border border-[#1C1917]/20 shadow-xl transition-all duration-300 active:scale-90 focus:outline-none focus:ring-2 focus:ring-[#FF3823] cursor-pointer ${
          canScrollLeft
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-75 pointer-events-none"
        }`}
      >
        <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
      </button>

      {/* Contenedor Cover Flow con Scroll Snap Centrado, Altura Estable & Padding Móvil */}
      <div
        ref={scrollRef}
        data-carousel-container
        className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth py-3 md:py-4 px-[8.5vw] scroll-px-[8.5vw] md:px-0 md:scroll-px-0 [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none] -mx-4 sm:-mx-6 md:mx-0 min-h-[505px] sm:min-h-[530px] md:min-h-[555px]"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products
          ? products.map((product, index) => {
              const isActive = index === activeIndex;
              return (
                <div
                  key={product.id}
                  data-carousel-item
                  className={`w-[78vw] sm:w-[320px] md:w-[350px] h-[480px] sm:h-[505px] md:h-[530px] flex-shrink-0 snap-center flex flex-col transition-all duration-300 ease-out transform-gpu origin-center rounded-3xl ${
                    isActive
                      ? "scale-100 opacity-100 z-10 shadow-2xl ring-2 ring-transparent"
                      : "scale-[0.92] opacity-75 shadow-sm md:scale-100 md:opacity-100 md:shadow-none md:z-0"
                  }`}
                >
                  <ProductCard product={product} />
                </div>
              );
            })
          : React.Children.map(children, (child, index) => {
              const isActive = index === activeIndex;
              return (
                <div
                  key={index}
                  data-carousel-item
                  className={`w-[78vw] sm:w-[320px] md:w-[350px] h-[480px] sm:h-[505px] md:h-[530px] flex-shrink-0 snap-center flex flex-col transition-all duration-300 ease-out transform-gpu origin-center rounded-3xl ${
                    isActive
                      ? "scale-100 opacity-100 z-10 shadow-2xl ring-2 ring-transparent"
                      : "scale-[0.92] opacity-75 shadow-sm md:scale-100 md:opacity-100 md:shadow-none md:z-0"
                  }`}
                >
                  {child}
                </div>
              );
            })}
      </div>

      {/* Flecha Flotante Derecha (Desktop / Tablet) */}
      <button
        type="button"
        onClick={() => handleArrowClick("right")}
        disabled={!canScrollRight}
        aria-label="Desplazar al siguiente producto"
        className={`hidden md:flex items-center justify-center absolute -right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-[#1C1917] text-white hover:bg-[#FF3823] border border-[#1C1917]/20 shadow-xl transition-all duration-300 active:scale-90 focus:outline-none focus:ring-2 focus:ring-[#FF3823] cursor-pointer ${
          canScrollRight
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-75 pointer-events-none"
        }`}
      >
        <ChevronRight className="h-6 w-6" strokeWidth={2.5} />
      </button>

      {/* Indicadores de Paginación Táctil Móvil (Pills) con altura reservada constante */}
      <div
        className="flex md:hidden justify-center items-center gap-1.5 mt-2 h-3"
        aria-label="Indicadores de carrusel"
      >
        {itemCount > 1 &&
          Array.from({ length: itemCount }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollToIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeIndex
                  ? "w-6 bg-[#FF3823]"
                  : "w-1.5 bg-[#1C1917]/20 hover:bg-[#1C1917]/40"
              }`}
              aria-label={`Ir al producto ${idx + 1}`}
            />
          ))}
      </div>
    </div>
  );
}
