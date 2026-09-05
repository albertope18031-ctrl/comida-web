import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes safely with clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats numeric price into Mexican Pesos (MXN) currency string
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Returns descriptive label and color indicator for flavor spice levels
 */
export function getSpiceLevelBadge(level: 0 | 1 | 2 | 3 | 4 | 5): {
  label: string;
  color: string;
  bg: string;
} {
  switch (level) {
    case 0:
      return { label: "Sin picante", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" };
    case 1:
      return { label: "Suave", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" };
    case 2:
      return { label: "Medio", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" };
    case 3:
      return { label: "Picoso", color: "text-orange-700", bg: "bg-orange-50 border-orange-200" };
    case 4:
      return { label: "Muy Picoso", color: "text-red-700", bg: "bg-red-50 border-red-200" };
    case 5:
      return { label: "Atómico 🔥", color: "text-red-950 font-bold", bg: "bg-red-200 border-red-400" };
    default:
      return { label: "Medio", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" };
  }
}
