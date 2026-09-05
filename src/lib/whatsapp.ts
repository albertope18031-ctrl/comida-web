import type { CartItem } from "@/types/shop";
import type { OrderType } from "@/types/database";

export interface WhatsAppOrderDetails {
  items: CartItem[];
  subtotal: number;
  deliveryFee?: number;
  grandTotal: number;
  orderType: OrderType;
  branchName?: string;
  customerDetails?: {
    name?: string;
    phone?: string;
    deliveryAddress?: string;
    notes?: string;
  };
}

/**
 * Builds a structured, high-conversion WhatsApp order message and returns
 * the encoded https://wa.me link with full item breakdowns and Mexican currency.
 */
export function generateWhatsAppOrderUrl(details: WhatsAppOrderDetails): string {
  const rawPhone =
    process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "5215555849201";
  const cleanPhone = rawPhone.replace(/[^0-9]/g, "");

  if (!details.items || details.items.length === 0) {
    const fallbackMessage = "🍗 *¡Hola! Quiero consultar el menú y ordenar en Wingstop.*";
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(fallbackMessage)}`;
  }

  // Build items lines
  const itemLines = details.items.map((item) => {
    const itemDipsTotal = item.selectedDips.reduce(
      (sum, d) => sum + d.price * d.quantity,
      0
    );
    const itemSidesTotal = item.selectedSides.reduce(
      (sum, s) => sum + s.price,
      0
    );
    const itemDrinkTotal = item.selectedDrink ? item.selectedDrink.price : 0;
    const itemLineTotal =
      (item.unitPrice + itemDipsTotal + itemSidesTotal + itemDrinkTotal) *
      item.quantity;

    let text = `• *${item.quantity}x ${item.name}* ($${itemLineTotal.toFixed(2)} MXN)`;

    if (item.selectedFlavors && item.selectedFlavors.length > 0) {
      const flavorsList = item.selectedFlavors.map((f) => f.flavorName).join(", ");
      text += `\n  - Salsas: ${flavorsList}`;
    }

    if (item.selectedDips && item.selectedDips.length > 0) {
      const dipsList = item.selectedDips
        .map((d) => `${d.quantity}x ${d.name}`)
        .join(", ");
      text += `\n  - Aderezo: ${dipsList}`;
    }

    if (item.selectedSides && item.selectedSides.length > 0) {
      const sidesList = item.selectedSides.map((s) => s.name).join(", ");
      text += `\n  - Complementos: ${sidesList}`;
    }

    if (item.selectedDrink) {
      text += `\n  - Bebida: ${item.selectedDrink.name}`;
    }

    if (item.specialInstructions) {
      text += `\n  - Nota: "${item.specialInstructions}"`;
    }

    return text;
  });

  const deliveryTypeLabel =
    details.orderType === "delivery"
      ? "A Domicilio 🛵"
      : "Para Llevar (Recoger en Sucursal) 🏪";

  let message = `🍗 *¡Hola! Quiero confirmar mi pedido desde la web:*\n\n`;
  message += `*Detalle del pedido:*\n`;
  message += itemLines.join("\n\n");
  message += `\n\n-----------------------------\n`;
  message += `*Subtotal:* $${details.subtotal.toFixed(2)} MXN\n`;

  if (details.deliveryFee !== undefined && details.deliveryFee > 0) {
    message += `*Envío:* $${details.deliveryFee.toFixed(2)} MXN\n`;
  }

  message += `*Tipo de entrega:* ${deliveryTypeLabel}\n`;

  if (details.branchName) {
    message += `*Sucursal:* ${details.branchName}\n`;
  }

  if (details.customerDetails?.deliveryAddress) {
    message += `*Dirección:* ${details.customerDetails.deliveryAddress}\n`;
  }

  if (details.customerDetails?.name) {
    message += `*Nombre del cliente:* ${details.customerDetails.name}\n`;
  }

  if (details.customerDetails?.phone) {
    message += `*Teléfono:* ${details.customerDetails.phone}\n`;
  }

  if (details.customerDetails?.notes) {
    message += `*Instrucciones:* ${details.customerDetails.notes}\n`;
  }

  message += `-----------------------------\n`;
  message += `*Total a pagar:* $${details.grandTotal.toFixed(2)} MXN\n\n`;
  message += `¿Me confirman tiempo estimado de entrega y método de pago, por favor?`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
