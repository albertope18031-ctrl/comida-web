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
