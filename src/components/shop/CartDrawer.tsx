"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Flame,
  Truck,
  Store,
  Sparkles,
} from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useOrderContextStore } from "@/store/order-context-store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WhatsAppOrderButton } from "@/components/shop/WhatsAppOrderButton";

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    getSubtotal,
  } = useCartStore();

  const { orderType, selectedBranch } = useOrderContextStore();

  const subtotal = getSubtotal();
  const deliveryFee = orderType === "delivery" && subtotal > 0 ? 45 : 0;
  const grandTotal = subtotal + deliveryFee;

  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalChickenPieces = items.reduce(
    (acc, item) => acc + (item.piecesCount || 0) * item.quantity,
    0
  );

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <aside className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#1C1917] text-white">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-[#FFB703] flex items-center justify-center text-neutral-950 font-black">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-black tracking-wide uppercase leading-none font-display text-[#FAF7F2]">
                  Mi Bolsa
                </h2>
                <span className="text-[11px] text-neutral-400 font-semibold">
                  {totalItemsCount} {totalItemsCount === 1 ? "artículo" : "artículos"}{" "}
                  {totalChickenPieces > 0 && `• ${totalChickenPieces} piezas de pollo`}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={closeCart}
              className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Cerrar bolsa"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Fulfillment Banner */}
          <div className="bg-[#292524] px-6 py-2.5 border-b border-neutral-700 text-xs flex items-center justify-between text-neutral-200">
            <div className="flex items-center gap-1.5 font-bold">
              {orderType === "delivery" ? (
                <>
                  <Truck className="h-3.5 w-3.5 text-[#FFB703]" />
                  <span>Entrega a Domicilio</span>
                </>
              ) : (
                <>
                  <Store className="h-3.5 w-3.5 text-[#FFB703]" />
                  <span>Para Llevar en Sucursal</span>
                </>
              )}
            </div>

            <span className="text-[11px] text-[#FFB703] truncate max-w-[180px] font-semibold">
              {selectedBranch.name}
            </span>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="h-20 w-20 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                  <ShoppingBag className="h-10 w-10" />
                </div>
                <div>
                  <h3 className="text-base font-black text-neutral-900">
                    Tu bolsa está vacía
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 max-w-xs leading-relaxed">
                    Añade alitas tradicionales, jugosos boneless bañados en salsa o combos para iniciar tu pedido.
                  </p>
                </div>
                <Button
                  variant="gold"
                  onClick={closeCart}
                  asChild
                  className="font-black"
                >
                  <Link href="/menu">Explorar Menú</Link>
                </Button>
              </div>
            ) : (
              items.map((item) => {
                const itemDipsTotal = item.selectedDips.reduce(
                  (s, d) => s + (d.name.toLowerCase().includes("incluido") ? 0 : d.price * d.quantity),
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
                    className="flex gap-3.5 p-4 rounded-xl border border-neutral-200 bg-white shadow-2xs relative group"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-20 w-20 rounded-lg overflow-hidden shrink-0 bg-neutral-100 border border-neutral-200">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-black text-sm text-neutral-900 leading-snug">
                          {item.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeItem(item.cartItemId)}
                          className="text-neutral-400 hover:text-red-600 transition-colors p-0.5 cursor-pointer"
                          aria-label="Eliminar producto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Flavors Breakdown with Pieces */}
                      {item.selectedFlavors.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {item.selectedFlavors.map((f) => (
                            <span
                              key={f.flavorId}
                              className="text-[10px] font-black bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded flex items-center gap-1"
                            >
                              <Flame className="h-2.5 w-2.5 text-amber-600" />
                              <span>{f.flavorName}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Dips, Extras & Drink Breakdown */}
                      <div className="text-[11px] text-neutral-600 space-y-0.5 pt-0.5">
                        {item.selectedDips.map((d) => (
                          <div key={d.id} className="truncate">
                            + {d.quantity}x {d.name}{" "}
                            {d.price > 0 && !d.name.toLowerCase().includes("incluido")
                              ? `(${formatCurrency(d.price * d.quantity)})`
                              : ""}
                          </div>
                        ))}
                        {item.selectedSides.map((s) => (
                          <div key={s.id} className="truncate">
                            + {s.name} ({formatCurrency(s.price)})
                          </div>
                        ))}
                        {item.selectedDrink && (
                          <div className="truncate">
                            + {item.selectedDrink.name} ({formatCurrency(item.selectedDrink.price)})
                          </div>
                        )}
                        {item.specialInstructions && (
                          <p className="text-[10px] italic text-neutral-400 truncate">
                            Nota: &quot;{item.specialInstructions}&quot;
                          </p>
                        )}
                      </div>

                      {/* Stepper and Subtotal */}
                      <div className="mt-2.5 flex items-center justify-between pt-1 border-t border-neutral-100">
                        <div className="flex items-center border border-neutral-300 rounded-md bg-neutral-50">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.cartItemId, item.quantity - 1)
                            }
                            className="h-6 w-6 flex items-center justify-center text-neutral-600 hover:bg-neutral-200 cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-black">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.cartItemId, item.quantity + 1)
                            }
                            className="h-6 w-6 flex items-center justify-center text-neutral-600 hover:bg-neutral-200 cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <span className="font-black text-sm text-neutral-950">
                          {formatCurrency(lineTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Financial Summary & Checkout CTA */}
          {items.length > 0 && (
            <div className="p-6 border-t border-neutral-200 bg-neutral-50 space-y-4">
              <div className="space-y-2 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal de productos:</span>
                  <span className="font-black text-neutral-900">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <span>Costo de entrega:</span>
                    {orderType === "pickup" && (
                      <Badge className="bg-[#588157]/15 text-[#588157] border-[#588157]/30 text-[10px] py-0 px-1 font-bold">
                        Gratis
                      </Badge>
                    )}
                  </span>
                  <span className="font-black text-neutral-900">
                    {deliveryFee > 0 ? formatCurrency(deliveryFee) : "$0.00"}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm font-black text-neutral-950 pt-2 border-t border-neutral-200">
                  <span>Total estimado:</span>
                  <span className="text-2xl font-black text-[#FF3823]">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full h-12 font-black text-base shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-101 transition-transform"
                onClick={closeCart}
                asChild
              >
                <Link href="/checkout">
                  <span>Continuar al Checkout</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>

              {/* Canal de cierre alternativo de alta conversión vía WhatsApp */}
              <div className="space-y-1.5 pt-1">
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-neutral-200" />
                  <span className="flex-shrink mx-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    O pide directo
                  </span>
                  <div className="flex-grow border-t border-neutral-200" />
                </div>

                <WhatsAppOrderButton
                  label="Completar orden vía WhatsApp"
                  onClick={closeCart}
                />
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
