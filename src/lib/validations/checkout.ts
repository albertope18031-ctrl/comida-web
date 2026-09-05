import { z } from "zod";

export const checkoutSchema = z
  .object({
    customer_name: z
      .string()
      .min(3, "Ingresa tu nombre completo (mínimo 3 letras)"),
    customer_phone: z
      .string()
      .regex(/^[0-9]{10}$/, "Ingresa un número de celular de 10 dígitos válido"),
    customer_email: z
      .string()
      .email("Ingresa un correo electrónico válido para tu comprobante"),
    order_type: z.enum(["delivery", "pickup"]),
    // Conditional delivery address fields
    address_street: z.string().optional(),
    address_number: z.string().optional(),
    address_neighborhood: z.string().optional(),
    address_zip: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^[0-9]{5}$/.test(val),
        "El código postal debe contener 5 dígitos"
      ),
    address_notes: z
      .string()
      .max(200, "Las referencias no pueden exceder 200 caracteres")
      .optional(),
    address_lat: z.number().optional(),
    address_lng: z.number().optional(),
    payment_method: z.enum(["card", "cash", "whatsapp"]),
    requires_invoice: z.boolean().default(false),
    // Optional SAT invoicing fields
    tax_id: z.string().optional(),
    tax_name: z.string().optional(),
    tax_zip: z.string().optional(),
    tax_regime: z.string().optional(),
    tax_usage: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.order_type === "delivery") {
      if (!data.address_street || data.address_street.trim().length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La calle y número exterior son obligatorios para entrega a domicilio",
          path: ["address_street"],
        });
      }
      if (!data.address_zip || !/^[0-9]{5}$/.test(data.address_zip)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El código postal de 5 dígitos es obligatorio para entrega",
          path: ["address_zip"],
        });
      }
    }

    if (data.requires_invoice) {
      if (!data.tax_id || data.tax_id.trim().length < 12) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El RFC debe tener entre 12 y 13 caracteres",
          path: ["tax_id"],
        });
      }
      if (!data.tax_name || data.tax_name.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La razón social o nombre fiscal es obligatorio",
          path: ["tax_name"],
        });
      }
      if (!data.tax_zip || !/^[0-9]{5}$/.test(data.tax_zip.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El código postal fiscal debe contener 5 dígitos",
          path: ["tax_zip"],
        });
      }
    }
  });

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
