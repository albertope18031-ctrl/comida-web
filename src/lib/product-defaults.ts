import type { Product, ProductDefaultConfig, CartItem, SelectedFlavor } from "@/types/shop";
import { FLAVORS, DIPS } from "./mock-data";

/**
 * Pre-configured classic house recipes ("Fast-Track 1-Click")
 * for high-velocity customer ordering without customizer friction.
 */
export const PRODUCT_DEFAULT_CONFIGS: Record<string, ProductDefaultConfig> = {
  "prod-alitas-10": {
    label: "Clásico de la casa: Lemon Pepper + Ranch",
    badge: "Más pedido",
    flavorIds: ["lemon-pepper"],
    includedDipId: "ranch",
    extraPrice: 0,
  },
  "prod-alitas-15": {
    label: "Dúo Favorito: Lemon Pepper + Original Hot + Ranch",
    badge: "Favorito",
    flavorIds: ["lemon-pepper", "original-hot"],
    includedDipId: "ranch",
    extraPrice: 0,
  },
  "prod-alitas-20": {
    label: "Trío de Fiesta: Lemon Pepper + Hickory BBQ + Mango Habanero",
    badge: "Recomendación del Chef",
    flavorIds: ["lemon-pepper", "hickory-bbq", "mango-habanero"],
    includedDipId: "ranch",
    extraPrice: 0,
  },
  "prod-boneless-10": {
    label: "El Favorito: Mango Habanero + Ranch Casero",
    badge: "Más pedido",
    flavorIds: ["mango-habanero"],
    includedDipId: "ranch",
    extraPrice: 0,
  },
  "prod-boneless-15": {
    label: "Dúo Boneless: Lemon Pepper + Garlic Parmesan",
    badge: "Favorito",
    flavorIds: ["lemon-pepper", "garlic-parmesan"],
    includedDipId: "ranch",
    extraPrice: 0,
  },
  "prod-boneless-20": {
    label: "Trío Boneless: Lemon Pepper + Mango Habanero + Spicy Korean Q",
    badge: "Recomendación del Chef",
    flavorIds: ["lemon-pepper", "mango-habanero", "spicy-korean"],
    includedDipId: "ranch",
    extraPrice: 0,
  },
  "prod-combo-1": {
    label: "Combo Clásico: Lemon Pepper + Ranch",
    badge: "Más pedido",
    flavorIds: ["lemon-pepper"],
    includedDipId: "ranch",
    extraPrice: 0,
  },
  "prod-combo-2": {
    label: "Combo Dúo: Lemon Pepper + Mango Habanero",
    badge: "Favorito",
    flavorIds: ["lemon-pepper", "mango-habanero"],
    includedDipId: "ranch",
    extraPrice: 0,
  },
  "prod-tenders-4": {
    label: "Crispy Tenders: BBQ + Ranch Casero",
    badge: "Más pedido",
    flavorIds: ["hickory-bbq"],
    includedDipId: "ranch",
    extraPrice: 0,
  },
};

/**
 * Social proof metadata for products to highlight popularity and trust.
 */
export const PRODUCT_SOCIAL_PROOF: Record<
  string,
  {
    badge?: "mas_pedido" | "favorito" | "recomendacion_chef";
    text?: string;
  }
> = {
  "prod-alitas-10": {
    badge: "mas_pedido",
    text: "+850 pedidos este mes • ★ 4.9 (1.2k+ reseñas)",
  },
  "prod-boneless-10": {
    badge: "mas_pedido",
    text: "+720 pedidos este mes • ★ 4.9 (950+ reseñas)",
  },
  "prod-alitas-15": {
    badge: "favorito",
    text: "+510 pedidos este mes • ★ 4.8 (640+ reseñas)",
  },
  "prod-boneless-15": {
    badge: "favorito",
    text: "+430 pedidos este mes • ★ 4.8 (490+ reseñas)",
  },
  "prod-alitas-20": {
    badge: "recomendacion_chef",
    text: "★ 4.9 • Ideal para compartir con amigos",
  },
  "prod-boneless-20": {
    badge: "recomendacion_chef",
    text: "★ 4.9 • Máxima variedad para grupos",
  },
  "prod-combo-1": {
    badge: "mas_pedido",
    text: "★ 4.8 • Top ventas almuerzo",
  },
  "prod-combo-2": {
    badge: "favorito",
    text: "★ 4.9 • El combo para dos más pedido",
  },
};

/**
 * Retrieves the default configuration for a product, checking its own properties
 * or falling back to the curated house defaults.
 */
export function getProductDefaultConfig(
  product: Product
): ProductDefaultConfig | null {
  if (product.default_configuration) {
    return product.default_configuration;
  }

  if (PRODUCT_DEFAULT_CONFIGS[product.id]) {
    return PRODUCT_DEFAULT_CONFIGS[product.id];
  }

  // Fallback for any other chicken product with flavors
  if (
    (product.category === "alitas" ||
      product.category === "boneless" ||
      product.category === "tenders" ||
      product.category === "combos") &&
    product.maxFlavorsAllowed > 0
  ) {
    return {
      label: "Clásico de la casa: Lemon Pepper + Ranch",
      badge: "Más pedido",
      flavorIds: ["lemon-pepper"],
      includedDipId: "ranch",
      extraPrice: 0,
    };
  }

  return null;
}

/**
 * Retrieves social proof badges and micro-text for a product.
 */
export function getProductSocialProof(product: Product): {
  badge?: "mas_pedido" | "favorito" | "recomendacion_chef";
  text?: string;
} {
  if (product.socialBadge || product.socialProofText) {
    return {
      badge: product.socialBadge,
      text: product.socialProofText,
    };
  }

  if (PRODUCT_SOCIAL_PROOF[product.id]) {
    return PRODUCT_SOCIAL_PROOF[product.id];
  }

  if (product.popular) {
    return {
      badge: "favorito",
      text: "★ 4.8 • Favorito de la comunidad",
    };
  }

  return {};
}

/**
 * Generates a standard CartItem for Fast-Track 1-Click addition.
 * Deterministic structure guarantees proper quantity increment in useCartStore.
 */
export function createFastTrackCartItem(
  product: Product,
  customConfig?: ProductDefaultConfig
): CartItem {
  const config = customConfig || getProductDefaultConfig(product);

  const flavorIds = config?.flavorIds || ["lemon-pepper"];
  const dipId = config?.includedDipId || "ranch";
  const extraPrice = config?.extraPrice || 0;

  // Resolve flavors
  const selectedFlavors: SelectedFlavor[] = flavorIds.map((id) => {
    const flavorDef = FLAVORS.find((f) => f.id === id) || FLAVORS[0];
    return {
      flavorId: flavorDef.id,
      flavorName: flavorDef.name,
      heatLevel: flavorDef.heatLevel,
    };
  });

  // Resolve dip
  const dipDef = DIPS.find((d) => d.id === dipId) || DIPS[0];
  const selectedDips = [
    {
      id: dipDef.id,
      name: `${dipDef.name} (Incluido)`,
      price: 0,
      quantity: 1,
    },
  ];

  // Deterministic cartItemId
  const cartItemId = `ft-${product.id}-${flavorIds.sort().join("-")}-${dipId}`;

  return {
    cartItemId,
    productId: product.id,
    name: product.name,
    slug: product.slug,
    basePrice: product.basePrice,
    unitPrice: product.basePrice + extraPrice,
    quantity: 1,
    piecesCount: product.piecesCount,
    imageUrl: product.imageUrl,
    selectedFlavors,
    selectedDips,
    selectedSides: [],
    selectedDrink: undefined,
    specialInstructions: "Combinación clásica Fast-Track",
  };
}
