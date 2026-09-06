import { create } from "zustand";
import type { Product } from "@/types/shop";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

export const MENU_CATEGORIES: CategoryItem[] = [
  { id: "all", name: "TODO EL MENÚ", slug: "all" },
  { id: "alitas", name: "ALITAS", slug: "alitas" },
  { id: "hamburguesas", name: "HAMBURGUESAS", slug: "hamburguesas" },
  { id: "boneless", name: "BONELESS", slug: "boneless" },
  { id: "papas", name: "PAPAS & ACOMPAÑAMIENTOS", slug: "papas" },
  { id: "tenders", name: "CRISPY TENDERS", slug: "tenders" },
  { id: "combos", name: "COMBOS & PACKS", slug: "combos" },
];

interface CategoryStore {
  selectedCategory: string; // "all", "alitas", "hamburguesas", "boneless", "papas", "tenders", "combos"
  setSelectedCategory: (category: string) => void;
  resetCategory: () => void;
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  selectedCategory: "all",
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  resetCategory: () => set({ selectedCategory: "all" }),
}));

/**
 * Filtra la lista de productos por el slug de categoría seleccionado.
 */
export function filterProductsByCategory(
  products: Product[],
  categoryId: string
): Product[] {
  if (!categoryId || categoryId === "all") return products;

  const normalized = categoryId.toLowerCase();

  return products.filter((product) => {
    switch (normalized) {
      case "alitas":
        return product.category === "alitas";
      case "hamburguesas":
      case "sandwiches":
        return (
          product.category === "hamburguesas" ||
          product.category === "sandwiches"
        );
      case "boneless":
        return product.category === "boneless";
      case "papas":
      case "sides":
        return product.category === "papas" || product.category === "sides";
      case "tenders":
        return product.category === "tenders";
      case "combos":
        return product.category === "combos" || Boolean(product.isCombo);
      default:
        return product.category === normalized;
    }
  });
}

/**
 * Desplaza la ventana de forma suave y precisa hacia la primera tarjeta de producto,
 * calculando el centrado vertical exacto en el espacio visible útil de la pantalla
 * (compensando la altura del Header fijo y cualquier barra flotante inferior).
 */
export function scrollToCenteredProductCard(onlyIfOutOfView: boolean = false) {
  if (typeof window === "undefined") return;

  // 1. Obtener altura real del Header fijo (cerrado)
  const header = document.querySelector("header");
  const headerHeight = header ? header.offsetHeight : 80;

  // 2. Obtener altura de barra flotante inferior si existe (StickyCartCTA)
  const bottomBar = document.querySelector("aside[role='region']");
  const bottomBarHeight = bottomBar
    ? (bottomBar as HTMLElement).offsetHeight
    : 0;

  // 3. Localizar la primera tarjeta del producto en el catálogo
  const card = (document.querySelector("#menu [data-carousel-item]") ||
    document.querySelector("[data-carousel-item]") ||
    document.getElementById("menu")) as HTMLElement | null;

  if (!card) return;

  // 4. Reiniciar siempre el carrusel horizontal a la primera tarjeta
  const carouselContainer =
    card.closest("[data-carousel-container]") || card.parentElement;
  if (carouselContainer) {
    carouselContainer.scrollTo({ left: 0, behavior: "smooth" });
  }

  // 5. Medir posición superior absoluta y altura de la tarjeta
  const rect = card.getBoundingClientRect();
  const cardAbsoluteTop = rect.top + window.scrollY;
  const cardHeight = rect.height;

  // 6. Espacio visible útil (pantalla menos Header y barra inferior)
  const windowHeight = window.innerHeight;
  const availableHeight = windowHeight - headerHeight - bottomBarHeight;

  // 7. Si onlyIfOutOfView es true y la tarjeta ya se encuentra cómodamente visible,
  // evitamos saltos verticales o rebotes innecesarios
  if (onlyIfOutOfView) {
    const isComfortablyVisible =
      rect.top >= headerHeight - 15 &&
      rect.bottom <= windowHeight - bottomBarHeight + 15;
    if (isComfortablyVisible) {
      return;
    }
  }

  // 8. Centrado vertical: dividir la diferencia en dos partes iguales
  let verticalMargin = 16;
  if (cardHeight < availableHeight) {
    verticalMargin = (availableHeight - cardHeight) / 2;
  }

  // 9. Punto de scroll exacto compensando Header y margen
  const targetScrollY = Math.max(
    0,
    cardAbsoluteTop - headerHeight - verticalMargin
  );

  window.scrollTo({
    top: targetScrollY,
    behavior: "smooth",
  });
}
