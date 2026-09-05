"use client";

import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Loader2, ArrowLeft, Flame, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WhatsAppOrderButton } from "@/components/shop/WhatsAppOrderButton";
import { formatCurrency } from "@/lib/utils";
import type { CartItem } from "@/types/shop";

interface OrderSummaryCardProps {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  orderType: "delivery" | "pickup";
  isSubmitting: boolean;
  isCoverageBlocked?: boolean;
  onPrimarySubmit?: () => void;
  customerDetails?: {
    name?: string;
    phone?: string;
    deliveryAddress?: string;
    notes?: string;
  };
}

export function OrderSummaryCard({
  items,
  subtotal,
  deliveryFee,
  grandTotal,
  orderType,
  isSubmitting,
  isCoverageBlocked = false,
  onPrimarySubmit,
  customerDetails,
}: OrderSummaryCardProps) {
  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPieces = items.reduce(
    (acc, item) => acc + (item.piecesCount || 0) * item.quantity,
    0
  );

  return (
    <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-xl space-y-6 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
        <div>
          <h2 className="text-base font-black uppercase text-neutral-900">
            Resumen de tu Orden
          </h2>
          <p className="text-xs text-neutral-500">
            {totalCount} {totalCount === 1 ? "artículo" : "artículos"}
            {totalPieces > 0 && ` • ${totalPieces} piezas de pollo`}
          </p>
        </div>
        <Link
          href="/cart"
          className="text-xs font-bold text-[#005A36] hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Editar</span>
        </Link>
      </div>

      {/* Items Scrollable List */}
      <div className="max-h-72 overflow-y-auto space-y-3.5 pr-1 divide-y divide-neutral-100">
        {items.map((item) => {
          const itemDipsTotal = item.selectedDips.reduce(
            (sum, d) => sum + d.price * d.quantity,
            0
          );
          const itemSidesTotal = item.selectedSides.reduce(
            (sum, s) => sum + s.price,
            0
          );
          const itemDrinkTotal = item.selectedDrink ? item.selectedDrink.price : 0;
          const lineTotal =
            (item.unitPrice + itemDipsTotal + itemSidesTotal + itemDrinkTotal) *
            item.quantity;

          return (
            <div key={item.cartItemId} className="pt-3 first:pt-0 space-y-1.5 text-xs">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="relative h-11 w-11 rounded-lg overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-neutral-900 leading-tight">
                      {item.quantity}x {item.name}
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      {formatCurrency(lineTotal / item.quantity)} c/u
                    </p>
                  </div>
                </div>
                <span className="font-black text-neutral-900 shrink-0">
                  {formatCurrency(lineTotal)}
                </span>
              </div>

              {/* Flavors */}
              {item.selectedFlavors.length > 0 && (
                <div className="flex flex-wrap gap-1 pl-13">
                  {item.selectedFlavors.map((f) => (
                    <span
                      key={f.flavorId}
                      className="text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.2 rounded flex items-center gap-0.5"
                    >
                      <Flame className="h-2.5 w-2.5 text-amber-600" />
                      <span>{f.flavorName}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Dips & Extras */}
              {item.selectedDips.length > 0 && (
                <p className="text-[10px] text-neutral-500 pl-13">
                  Aderezo: {item.selectedDips.map((d) => `${d.quantity}x ${d.name}`).join(", ")}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Financial Breakdown */}
      <div className="pt-4 border-t border-neutral-200 space-y-2.5 text-xs text-neutral-600">
        <div className="flex justify-between">
          <span>Subtotal de alimentos:</span>
          <span className="font-extrabold text-neutral-900">
            {formatCurrency(subtotal)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1.5">
            <span>Costo de envío:</span>
            {orderType === "pickup" && (
              <Badge className="bg-emerald-100 text-[#005A36] text-[10px] py-0 px-1.5 border-none font-bold">
                Gratis
              </Badge>
            )}
          </span>
          <span className="font-extrabold text-neutral-900">
            {deliveryFee > 0 ? formatCurrency(deliveryFee) : "$0.00 MXN"}
          </span>
        </div>

        <div className="flex justify-between items-center text-base font-black text-neutral-950 pt-2 border-t border-neutral-200">
          <span>Total Neto a Pagar:</span>
          <span className="text-2xl text-[#005A36] font-black">
            {formatCurrency(grandTotal)}
          </span>
        </div>
      </div>

      {/* Coverage Warning Banner */}
      {isCoverageBlocked && orderType === "delivery" && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs font-bold flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          <p className="text-[11px] leading-tight">
            Dirección fuera de radio. Cambia a &quot;Para Llevar&quot; o pide vía WhatsApp para habilitar tu orden.
          </p>
        </div>
      )}

      {/* Action Submit Button */}
      <Button
        type="submit"
        variant="gold"
        size="lg"
        disabled={isSubmitting || (isCoverageBlocked && orderType === "delivery")}
        onClick={onPrimarySubmit}
        className="w-full h-13 font-black text-base uppercase tracking-wider shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Confirmando Orden...</span>
          </div>
        ) : isCoverageBlocked && orderType === "delivery" ? (
          <span>Fuera de Cobertura</span>
        ) : (
          <span>Confirmar y Colocar Pedido</span>
        )}
      </Button>

      {/* Trust & Security Badge */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500">
        <ShieldCheck className="h-4 w-4 text-emerald-700" />
        <span>Pago seguro y encriptado con Supabase</span>
      </div>

      {/* Alternative Fast-Track Closing via WhatsApp */}
      <div className="pt-3 border-t border-neutral-200 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-neutral-800">
            ¿Prefieres ordenar por WhatsApp?
          </span>
          <span className="text-[10px] bg-emerald-100 text-[#005A36] font-extrabold px-2 py-0.5 rounded-full">
            Atención directa
          </span>
        </div>
        <p className="text-[11px] text-neutral-500 leading-tight">
          Envía los productos estructurados al chat oficial de la sucursal.
        </p>
        <WhatsAppOrderButton
          label="Completar vía WhatsApp"
          customerDetails={customerDetails}
        />
      </div>
    </div>
  );
}
