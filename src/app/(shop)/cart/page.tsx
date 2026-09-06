"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Flame } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useBranchStore } from "@/store/branch-store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getSubtotal } = useCartStore();
  const { fulfillmentType, selectedBranch } = useBranchStore();

  const subtotal = getSubtotal();
  const deliveryFee = fulfillmentType === "delivery" && subtotal > 0 ? 45 : 0;
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center space-y-4">
        <div className="h-20 w-20 mx-auto rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-black text-neutral-900 uppercase">
          Tu carrito de compra está vacío
        </h1>
        <p className="text-sm text-neutral-500 max-w-md mx-auto">
          Aún no has agregado alitas o boneless. Explora nuestro menú y elige tus salsas favoritas.
        </p>
        <Button variant="primary" size="lg" asChild>
          <Link href="/menu">Ir al Menú</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black text-neutral-950 uppercase tracking-tight mb-8">
        Tu Carrito de Compra
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const itemDipsTotal = item.selectedDips.reduce(
              (s, d) => s + d.price * d.quantity,
              0
            );
            const itemSidesTotal = item.selectedSides.reduce(
              (s, side) => s + side.price,
              0
            );
            const itemDrinkTotal = item.selectedDrink ? item.selectedDrink.price : 0;
            const unitPrice = item.unitPrice + itemDipsTotal + itemSidesTotal + itemDrinkTotal;
            const lineTotal = unitPrice * item.quantity;

            return (
              <div
                key={item.cartItemId}
                className="flex flex-col sm:flex-row gap-4 p-5 rounded-xl border border-neutral-200 bg-white shadow-2xs"
              >
                <div className="relative h-24 w-24 rounded-lg overflow-hidden shrink-0 bg-neutral-100">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-black text-base text-neutral-900">
                      {item.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeItem(item.cartItemId)}
                      className="text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {item.selectedFlavors.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {item.selectedFlavors.map((f) => (
                        <span
                          key={f.flavorId}
                          className="text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1"
                        >
                          <Flame className="h-3 w-3 text-amber-600" />
                          {f.flavorName}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Add-ons list */}
                  <div className="text-xs text-neutral-500 space-y-0.5">
                    {item.selectedDips.map((d) => (
                      <div key={d.id}>
                        + {d.quantity}x {d.name} ({formatCurrency(d.price * d.quantity)})
                      </div>
                    ))}
                    {item.selectedSides.map((s) => (
                      <div key={s.id}>
                        + {s.name} ({formatCurrency(s.price)})
                      </div>
                    ))}
                    {item.selectedDrink && (
                      <div>
                        + {item.selectedDrink.name} ({formatCurrency(item.selectedDrink.price)})
                      </div>
                    )}
                  </div>

                  {/* Quantity & Line Total */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center border border-neutral-300 rounded-lg bg-neutral-50">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        className="h-8 w-8 flex items-center justify-center text-neutral-600 hover:bg-neutral-200 cursor-pointer"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        className="h-8 w-8 flex items-center justify-center text-neutral-600 hover:bg-neutral-200 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <span className="text-lg font-black text-neutral-950">
                      {formatCurrency(lineTotal)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Card */}
        <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-sm h-fit space-y-6">
          <h2 className="text-lg font-black text-neutral-900 uppercase">
            Resumen de la Orden
          </h2>

          <div className="text-xs text-neutral-600 space-y-2 pb-4 border-b border-neutral-200">
            <div className="flex justify-between">
              <span>Modalidad:</span>
              <span className="font-bold text-neutral-900">
                {fulfillmentType === "delivery" ? "Envío a Domicilio" : "Para Llevar"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Sucursal:</span>
              <span className="font-bold text-neutral-900 text-right truncate max-w-[170px]">
                {selectedBranch.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-bold text-neutral-900">{formatCurrency(subtotal)}</span>
            </div>
            {fulfillmentType === "delivery" && (
              <div className="flex justify-between">
                <span>Costo de envío:</span>
                <span className="font-bold text-neutral-900">{formatCurrency(deliveryFee)}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-black text-neutral-900">Total a pagar:</span>
            <span className="text-2xl font-black text-[#FF3823]">{formatCurrency(total)}</span>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full font-black text-base shadow-md flex items-center justify-center gap-2"
            asChild
          >
            <Link href="/checkout">
              <span>Continuar al Pago</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
