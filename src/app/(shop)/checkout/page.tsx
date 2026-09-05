"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Banknote,
  MapPin,
  Truck,
  Store,
  ArrowLeft,
  ShieldCheck,
  Clock,
  Flame,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart-store";
import { useOrderContextStore } from "@/store/order-context-store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { createOrderAction } from "@/actions/orders";

export default function CheckoutPage() {
  const router = useRouter();

  const { items, getSubtotal, clearCart } = useCartStore();
  const { orderType, selectedBranch, deliveryAddress } = useOrderContextStore();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [street, setStreet] = useState(deliveryAddress?.street || "");
  const [number, setNumber] = useState(deliveryAddress?.number || "");
  const [colonia, setColonia] = useState(deliveryAddress?.colonia || "");
  const [zipCode, setZipCode] = useState(deliveryAddress?.zipCode || "");
  const [references, setReferences] = useState(deliveryAddress?.references || "");
  const [driverInstructions, setDriverInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const subtotal = getSubtotal();
  const deliveryFee = orderType === "delivery" && subtotal > 0 ? 45 : 0;
  const grandTotal = subtotal + deliveryFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      toast.error("Por favor completa tu nombre, teléfono y correo electrónico.");
      return;
    }

    if (orderType === "delivery" && (!street.trim() || !colonia.trim())) {
      toast.error("Por favor completa los datos de tu dirección de entrega.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        branchId: selectedBranch.id,
        customerName: fullName.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        orderType,
        deliveryAddress:
          orderType === "delivery"
            ? {
                street: street.trim(),
                number: number.trim(),
                colonia: colonia.trim(),
                zipCode: zipCode.trim(),
                fullAddress: `${street} ${number}, ${colonia}, CP ${zipCode}`.trim(),
                references: `${references} ${driverInstructions}`.trim() || undefined,
              }
            : null,
        paymentMethod,
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          quantity: i.quantity,
          piecesCount: i.piecesCount,
          selectedFlavors: i.selectedFlavors.map((f) => ({
            flavorId: f.flavorId,
            flavorName: f.flavorName,
            heatLevel: f.heatLevel,
          })),
          selectedDips: i.selectedDips.map((d) => ({
            id: d.id,
            name: d.name,
            price: d.price,
            quantity: d.quantity,
          })),
          selectedSides: i.selectedSides.map((s) => ({
            id: s.id,
            name: s.name,
            price: s.price,
          })),
          selectedDrink: i.selectedDrink,
          specialInstructions: i.specialInstructions,
        })),
      };

      const result = await createOrderAction(payload);

      if (!result.success || !result.orderId) {
        throw new Error(result.error || "No se pudo registrar la orden.");
      }

      // Order created successfully
      clearCart();

      toast.success("¡Orden colocada con éxito!", {
        description: `Número de orden: ${result.orderNumber}`,
      });

      // Redirect to real-time order tracking
      router.push(`/order/${result.orderId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al procesar el pedido.";
      setErrorMessage(msg);
      toast.error("Error al colocar la orden", { description: msg });
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !isSubmitting) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center space-y-4">
        <h1 className="text-2xl font-black text-neutral-900 uppercase">
          Tu bolsa está vacía
        </h1>
        <p className="text-sm text-neutral-500">
          Agrega deliciosas alitas o boneless para poder continuar al checkout.
        </p>
        <Button variant="gold" size="lg" asChild className="font-black">
          <Link href="/menu">Ir al Menú</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al carrito</span>
        </Link>
        <h1 className="text-3xl font-black text-neutral-950 uppercase tracking-tight mt-2">
          Finalizar Pedido
        </h1>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Details (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Non-editable Fulfilling Branch Summary */}
          <div className="p-6 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#005A36] flex items-center gap-1.5">
                {orderType === "delivery" ? (
                  <>
                    <Truck className="h-4 w-4" />
                    <span>Entrega a Domicilio desde:</span>
                  </>
                ) : (
                  <>
                    <Store className="h-4 w-4" />
                    <span>Sucursal para Recoger:</span>
                  </>
                )}
              </span>

              <Badge className="bg-[#005A36] text-white">
                {orderType === "delivery" ? "Delivery" : "Pick Up"}
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-emerald-200/60">
              <div>
                <h3 className="font-black text-base text-neutral-900">
                  {selectedBranch.name}
                </h3>
                <p className="text-xs text-neutral-600 flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                  <span>{selectedBranch.address}</span>
                </p>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="text-xs font-black text-[#005A36] block">
                  {orderType === "delivery"
                    ? `Entrega est: ${selectedBranch.estimatedDeliveryMin} min`
                    : `Listo en: ${selectedBranch.estimatedPickupMin} min`}
                </span>
                <span className="text-[11px] text-neutral-500">
                  Tel: {selectedBranch.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Contact Details */}
          <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-2xs space-y-4">
            <h2 className="text-base font-black text-neutral-900 uppercase flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-[#005A36] text-white flex items-center justify-center text-xs">
                1
              </span>
              <span>Datos del Cliente</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Nombre Completo *
                </label>
                <Input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej. Roberto García"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Teléfono Móvil (para avisos de entrega) *
                </label>
                <Input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej. 55 1234 5678"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Correo Electrónico (para tu folio y ticket digital) *
                </label>
                <Input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Address or Pickup Confirmation */}
          <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-2xs space-y-4">
            <h2 className="text-base font-black text-neutral-900 uppercase flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-[#005A36] text-white flex items-center justify-center text-xs">
                2
              </span>
              <span>
                {orderType === "delivery"
                  ? "Dirección y Notas de Entrega"
                  : "Confirmación de Recogida"}
              </span>
            </h2>

            {orderType === "delivery" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Calle *
                    </label>
                    <Input
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Nombre de la calle"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Número Ext / Int *
                    </label>
                    <Input
                      required
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      placeholder="Ej. 142 Int 3B"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Colonia / Fraccionamiento *
                    </label>
                    <Input
                      required
                      value={colonia}
                      onChange={(e) => setColonia(e.target.value)}
                      placeholder="Colonia"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Código Postal *
                    </label>
                    <Input
                      required
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="Ej. 06700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Instrucciones de entrega para el repartidor (opcional)
                  </label>
                  <Input
                    value={driverInstructions}
                    onChange={(e) => setDriverInstructions(e.target.value)}
                    placeholder="Ej. Tocar timbre 3B, dejar en caseta de vigilancia..."
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-1">
                <p className="font-bold text-neutral-900">
                  Tu orden estará lista para recoger en el mostrador de:
                </p>
                <p className="text-neutral-700">{selectedBranch.name}</p>
                <p className="text-neutral-500">{selectedBranch.address}</p>
              </div>
            )}
          </div>

          {/* Card 4: Payment Method */}
          <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-2xs space-y-4">
            <h2 className="text-base font-black text-neutral-900 uppercase flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-[#005A36] text-white flex items-center justify-center text-xs">
                3
              </span>
              <span>Método de Pago</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`p-4 rounded-xl border text-left flex items-center gap-3 transition-colors cursor-pointer ${
                  paymentMethod === "card"
                    ? "border-[#005A36] bg-emerald-50/60 ring-2 ring-[#005A36]/30 font-bold"
                    : "border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                <CreditCard className="h-5 w-5 text-[#005A36]" />
                <div>
                  <p className="text-xs text-neutral-900">Tarjeta Débito / Crédito</p>
                  <p className="text-[11px] text-neutral-500 font-normal">
                    Terminal física al recibir o en línea
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={`p-4 rounded-xl border text-left flex items-center gap-3 transition-colors cursor-pointer ${
                  paymentMethod === "cash"
                    ? "border-[#005A36] bg-emerald-50/60 ring-2 ring-[#005A36]/30 font-bold"
                    : "border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                <Banknote className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-xs text-neutral-900">Efectivo al Recibir</p>
                  <p className="text-[11px] text-neutral-500 font-normal">
                    Pago directo al repartidor
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Placement Action (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-md sticky top-24 space-y-5">
            <h2 className="text-base font-black text-neutral-900 uppercase">
              Resumen de la Orden ({items.length})
            </h2>

            {/* Items scroll */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-xs space-y-1"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-neutral-900">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-bold text-neutral-900">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </span>
                  </div>

                  {item.selectedFlavors.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.selectedFlavors.map((f) => (
                        <span
                          key={f.flavorId}
                          className="text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded"
                        >
                          {f.flavorName}
                        </span>
                      ))}
                    </div>
                  )}

                  {item.selectedDips.length > 0 && (
                    <p className="text-[10px] text-neutral-500">
                      Aderezo: {item.selectedDips.map((d) => d.name).join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Financial breakdown */}
            <div className="pt-3 border-t border-neutral-200 space-y-2 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-neutral-900">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span>Costo de envío:</span>
                <span className="font-bold text-neutral-900">
                  {deliveryFee > 0 ? formatCurrency(deliveryFee) : "$0.00"}
                </span>
              </div>

              <div className="flex justify-between items-center text-base font-black text-neutral-950 pt-2 border-t border-neutral-200">
                <span>Total a Pagar</span>
                <span className="text-xl text-[#005A36]">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              type="submit"
              variant="gold"
              size="lg"
              disabled={isSubmitting}
              className="w-full h-12 font-black text-base shadow-lg cursor-pointer"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Procesando Orden...</span>
                </div>
              ) : (
                "Confirmar y Colocar Pedido"
              )}
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              <span>Transacción segura y encriptada con Supabase</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
