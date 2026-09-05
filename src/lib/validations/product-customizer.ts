import { z } from "zod";

/**
 * Flavor selection with allocated pieces
 */
export const flavorSplitSchema = z.object({
  flavorId: z.string().min(1, "El ID de la salsa es requerido"),
  flavorName: z.string().min(1),
  heatLevel: z.number().min(0).max(5),
  pieces: z.number().int().min(1, "Cada salsa debe tener al menos 1 pieza asignada"),
});

export type FlavorSplit = z.infer<typeof flavorSplitSchema>;

/**
 * Dip option selection
 */
export const dipSelectionSchema = z.object({
  dipId: z.string().min(1),
  name: z.string().min(1),
  isIncluded: z.boolean().default(false),
  price: z.number().min(0),
  quantity: z.number().int().min(0),
});

export type DipSelection = z.infer<typeof dipSelectionSchema>;

/**
 * Side option selection
 */
export const sideSelectionSchema = z.object({
  sideId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().min(0),
});

export type SideSelection = z.infer<typeof sideSelectionSchema>;

/**
 * Complete product customization schema with strict refinement
 */
export const productCustomizationSchema = z
  .object({
    productId: z.string().min(1),
    productName: z.string().min(1),
    basePrice: z.number().min(0),
    piecesCount: z.number().nullish(),
    maxFlavorsAllowed: z.number().int().min(0),
    quantity: z.number().int().min(1, "La cantidad mínima es 1"),
    flavors: z.array(flavorSplitSchema),
    dips: z.array(dipSelectionSchema),
    sides: z.array(sideSelectionSchema),
    specialInstructions: z.string().max(200).optional(),
  })
  .superRefine((data, ctx) => {
    // 1. Piece splitting validation for wings/boneless
    if (data.piecesCount && data.piecesCount > 0) {
      if (data.flavors.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Debes seleccionar al menos una salsa para tus piezas.",
          path: ["flavors"],
        });
        return;
      }

      if (data.flavors.length > data.maxFlavorsAllowed) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Solo puedes elegir hasta ${data.maxFlavorsAllowed} salsas para este paquete.`,
          path: ["flavors"],
        });
      }

      const totalAssignedPieces = data.flavors.reduce(
        (sum, f) => sum + f.pieces,
        0
      );

      if (totalAssignedPieces !== data.piecesCount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `La suma de piezas (${totalAssignedPieces}) debe ser exactamente igual a ${data.piecesCount}.`,
          path: ["flavors"],
        });
      }
    }

    // 2. Dip selection validation (at least 1 included dip or explicit 'sin-aderezo')
    const totalDipsSelected = data.dips.reduce(
      (sum, d) => sum + d.quantity,
      0
    );
    if (totalDipsSelected === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Por favor elige un aderezo incluido o marca 'Sin Aderezo'.",
        path: ["dips"],
      });
    }
  });

export type ProductCustomizationForm = z.infer<
  typeof productCustomizationSchema
>;

/**
 * Deterministic hash generator to deduplicate or group identical configurations in cart
 */
export function generateCartItemHash(
  data: Omit<ProductCustomizationForm, "quantity">
): string {
  const normalizedFlavors = [...data.flavors]
    .sort((a, b) => a.flavorId.localeCompare(b.flavorId))
    .map((f) => `${f.flavorId}:${f.pieces}`)
    .join(",");

  const normalizedDips = [...data.dips]
    .filter((d) => d.quantity > 0)
    .sort((a, b) => a.dipId.localeCompare(b.dipId))
    .map((d) => `${d.dipId}:${d.quantity}`)
    .join(",");

  const normalizedSides = [...data.sides]
    .sort((a, b) => a.sideId.localeCompare(b.sideId))
    .map((s) => s.sideId)
    .join(",");

  const rawKey = [
    data.productId,
    normalizedFlavors,
    normalizedDips,
    normalizedSides,
    (data.specialInstructions || "").trim().toLowerCase(),
  ].join("|");

  // Simple, deterministic URL-safe string hash
  let hash = 0;
  for (let i = 0; i < rawKey.length; i++) {
    const char = rawKey.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }

  return `${data.productId}-${Math.abs(hash).toString(36)}`;
}
