"use client";

import { useState, useEffect } from "react";
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
  CheckCircle2,
  AlertCircle,
  Phone,
  User,
  Mail,
  Receipt,
  FileText,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart-store";
import { useOrderContextStore } from "@/store/order-context-store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { createOrderAction } from "@/actions/orders";
import { AddressAutocomplete } from "@/components/checkout/AddressAutocomplete";
import { OrderSummaryCard } from "@/components/checkout/OrderSummaryCard";
import { checkoutSchema, type CheckoutFormData } from "@/lib/validations/checkout";
import { SAT_REGIMENES_FISCALES, SAT_USOS_CFDI } from "@/lib/sat-catalogs";

export default function CheckoutPage() {
  const router = useRouter();

  const { items, getSubtotal, clearCart } = useCartStore();
  const {
    orderType,
    selectedBranch,
    deliveryAddress,
    setOrderType,
    setDeliveryAddress,
  } = useOrderContextStore();

  // Mobile accordion state
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  // Form Fields State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  // Delivery Address Fields
  const [street, setStreet] = useState(deliveryAddress?.street || "");
  const [number, setNumber] = useState(deliveryAddress?.number || "");
  const [colonia, setColonia] = useState(deliveryAddress?.colonia || "");
  const [zipCode, setZipCode] = useState(deliveryAddress?.zipCode || "");
  const [driverNotes, setDriverNotes] = useState(deliveryAddress?.references || "");
  const [lat, setLat] = useState<number | undefined>(deliveryAddress?.latitude);
  const [lng, setLng] = useState<number | undefined>(deliveryAddress?.longitude);
  const [isCoverageBlocked, setIsCoverageBlocked] = useState(false);

  // Payment & Invoicing
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash" | "whatsapp">("card");
  const [requiresInvoice, setRequiresInvoice] = useState(false);
  const [taxId, setTaxId] = useState("");
  const [taxName, setTaxName] = useState("");
  const [taxZip, setTaxZip] = useState("");
  const [taxRegime, setTaxRegime] = useState("605");
  const [taxUsage, setTaxUsage] = useState("G03");

  // Form Status
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Financial Calculations
  const subtotal = getSubtotal();
  const deliveryFee = orderType === "delivery" && subtotal > 0 ? 45 : 0;
  const grandTotal = subtotal + deliveryFee;
  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // Phone input auto-formatter (10 digits Mexico)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 10);
    setCustomerPhone(raw);
    if (errors.customer_phone) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.customer_phone;
        return copy;
      });
    }
  };

  // Handle address autocomplete update
  const handleAddressUpdate = (data: {
    street: string;
    number: string;
    colonia: string;
    zipCode: string;
    notes?: string;
    lat?: number;
    lng?: number;
    isCovered: boolean;
  }) => {
    setStreet(data.street);
    setNumber(data.number);
    setColonia(data.colonia);
    setZipCode(data.zipCode);
    if (data.notes !== undefined) setDriverNotes(data.notes);
    setLat(data.lat);
    setLng(data.lng);
    setIsCoverageBlocked(!data.isCovered);

    // Save to context store
    if (data.street && data.number) {
      setDeliveryAddress({
        street: data.street,
        number: data.number,
        colonia: data.colonia,
        zipCode: data.zipCode,
        fullAddress: `${data.street} ${data.number}, ${data.colonia}, CP ${data.zipCode}`,
        references: data.notes,
        latitude: data.lat,
        longitude: data.lng,
      });
    }
  };

  // Submit Order
  const handleFormSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrors({});

    if (items.length === 0) {
      toast.error("Tu bolsa de compra está vacía.");
      return;
    }

    // Geofence coverage check
    if (orderType === "delivery" && isCoverageBlocked) {
      toast.error(
        "Tu dirección excede la zona de cobertura. Elige 'Para Llevar' o ajusta tu ubicación."
      );
      return;
    }

    // Validate using Zod
    const validation = checkoutSchema.safeParse({
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      customer_email: customerEmail.trim(),
      order_type: orderType,
      address_street: street ? `${street} ${number}`.trim() : undefined,
      address_number: number.trim(),
      address_neighborhood: colonia.trim(),
      address_zip: zipCode.trim(),
      address_notes: driverNotes.trim(),
      address_lat: lat,
      address_lng: lng,
      payment_method: paymentMethod,
      requires_invoice: requiresInvoice,
      tax_id: requiresInvoice ? taxId.trim().toUpperCase() : undefined,
      tax_name: requiresInvoice ? taxName.trim().toUpperCase() : undefined,
      tax_zip: requiresInvoice ? taxZip.trim() : undefined,
      tax_regime: requiresInvoice ? taxRegime : undefined,
      tax_usage: requiresInvoice ? taxUsage : undefined,
    });

    if (!validation.success) {
      const fieldErrors: { [key: string]: string } = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        if (path && !fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      });
      setErrors(fieldErrors);
      toast.error(validation.error.issues[0]?.message || "Verifica los datos del formulario.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        branchId: selectedBranch.id,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        orderType,
        deliveryAddress:
          orderType === "delivery"
            ? {
                street: street.trim(),
                number: number.trim(),
                colonia: colonia.trim(),
                zipCode: zipCode.trim(),
                fullAddress: `${street} ${number}, ${colonia}, CP ${zipCode}`,
                references: driverNotes.trim() || undefined,
              }
            : null,
        paymentMethod,
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          piecesCount: item.piecesCount,
          selectedFlavors: item.selectedFlavors.map((f) => ({
            flavorId: f.flavorId,
            flavorName: f.flavorName,
            heatLevel: f.heatLevel,
          })),
          selectedDips: item.selectedDips,
          selectedSides: item.selectedSides,
          selectedDrink: item.selectedDrink,
          specialInstructions: item.specialInstructions,
        })),
      };

      const result = await createOrderAction(payload);

      if (!result.success || !result.orderId) {
        throw new Error(result.error || "No se pudo registrar la orden en el sistema.");
      }

      clearCart();

      toast.success("¡Orden colocada con éxito!", {
        description: `Número de orden: ${result.orderNumber}`,
      });

      router.push(`/order/${result.orderId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al procesar el pedido.";
      toast.error("Error al colocar la orden", { description: msg });
      setIsSubmitting(false);
    }
  };

  // Empty cart fallback
  if (items.length === 0 && !isSubmitting) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#005A36] flex items-center justify-center mx-auto mb-2">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-black text-neutral-900 uppercase">
          Tu bolsa está vacía
        </h1>
        <p className="text-sm text-neutral-500 max-w-md mx-auto">
          Agrega deliciosas alitas o boneless a tu pedido para continuar al checkout.
        </p>
        <Button variant="gold" size="lg" asChild className="font-black mt-2">
          <Link href="/menu">Ir al Menú</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Breadcrumb & Title */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Volver al carrito</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 uppercase tracking-tight mt-1 flex items-center gap-2">
            <span>One-Page Express Checkout</span>
            <span className="text-[10px] bg-[#005A36] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              1-Vista
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
          <Store className="h-4 w-4 text-[#005A36]" />
          <span>{selectedBranch.name}</span>
        </div>
      </div>

      {/* MOBILE COLLAPSIBLE TOP ORDER SUMMARY ACCORDION */}
      <div className="block lg:hidden mb-6 bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm">
        <button
          type="button"
          onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
          className="w-full flex items-center justify-between font-black text-sm text-neutral-900 cursor-pointer"
        >
          <div className="flex items-center gap-2 text-left">
            <ShoppingBag className="h-4 w-4 text-[#005A36]" />
            <span>
              Ver detalle de compra ({totalCount} {totalCount === 1 ? "artículo" : "artículos"})
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[#005A36]">
            <span className="text-base font-black">{formatCurrency(grandTotal)}</span>
            {mobileSummaryOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </button>

        {mobileSummaryOpen && (
          <div className="mt-4 pt-3 border-t border-neutral-100 space-y-2.5 text-xs animate-in fade-in">
            {items.map((item) => (
              <div key={item.cartItemId} className="flex justify-between items-center py-1">
                <span className="text-neutral-700">
                  {item.quantity}x {item.name}
                </span>
                <span className="font-bold text-neutral-900">
                  {formatCurrency(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}
            <div className="pt-2 border-t border-neutral-100 flex justify-between text-neutral-500 text-[11px]">
              <span>Costo de envío:</span>
              <span>{deliveryFee > 0 ? formatCurrency(deliveryFee) : "Gratis"}</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: 3 UNIFIED FORM BLOCKS (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* BLOQUE 1: DATOS DE CONTACTO */}
          <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
              <div className="h-7 w-7 rounded-lg bg-emerald-50 text-[#005A36] flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h2 className="text-base font-black uppercase text-neutral-900">
                Datos de Contacto
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Full Name */}
              <div className="sm:col-span-12">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Nombre Completo *
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Ej. Juan Pérez González"
                    autoComplete="name"
                    autoCapitalize="words"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className={`bg-white border-neutral-300 rounded-xl text-sm h-11 pl-10 ${
                      errors.customer_name ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                    required
                  />
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400 pointer-events-none" />
                </div>
                {errors.customer_name && (
                  <p className="text-[11px] text-red-600 font-bold mt-1">
                    {errors.customer_name}
                  </p>
                )}
              </div>

              {/* Mobile Phone (10 digits Mexico standard) */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Teléfono Celular (10 dígitos) *
                </label>
                <div className="relative">
                  <Input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="55 1234 5678"
                    maxLength={10}
                    value={customerPhone}
                    onChange={handlePhoneChange}
                    className={`bg-white border-neutral-300 rounded-xl text-sm h-11 pl-10 font-mono tracking-wider ${
                      errors.customer_phone ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                    required
                  />
                  <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400 pointer-events-none" />
                </div>
                {errors.customer_phone && (
                  <p className="text-[11px] text-red-600 font-bold mt-1">
                    {errors.customer_phone}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Correo Electrónico *
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    placeholder="tu@correo.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className={`bg-white border-neutral-300 rounded-xl text-sm h-11 pl-10 ${
                      errors.customer_email ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                    required
                  />
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400 pointer-events-none" />
                </div>
                {errors.customer_email && (
                  <p className="text-[11px] text-red-600 font-bold mt-1">
                    {errors.customer_email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* BLOQUE 2: MODALIDAD Y DIRECCIÓN DE ENTREGA */}
          <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-50 text-[#005A36] flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h2 className="text-base font-black uppercase text-neutral-900">
                  Modalidad y Entrega
                </h2>
              </div>
              <Badge className="bg-[#005A36] text-white text-[11px] py-0.5 px-2">
                {selectedBranch.name}
              </Badge>
            </div>

            {/* Mode Switcher: Delivery vs Pickup */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOrderType("delivery")}
                className={`p-3.5 rounded-xl border flex items-center justify-center gap-2.5 font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${
                  orderType === "delivery"
                    ? "border-[#005A36] bg-emerald-50 text-[#005A36] ring-2 ring-[#005A36]/30 shadow-xs"
                    : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                <Truck className="h-4 w-4" />
                <span>A Domicilio (+$45)</span>
              </button>

              <button
                type="button"
                onClick={() => setOrderType("pickup")}
                className={`p-3.5 rounded-xl border flex items-center justify-center gap-2.5 font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${
                  orderType === "pickup"
                    ? "border-[#005A36] bg-emerald-50 text-[#005A36] ring-2 ring-[#005A36]/30 shadow-xs"
                    : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                <Store className="h-4 w-4" />
                <span>Para Llevar (Gratis)</span>
              </button>
            </div>

            {/* Delivery Mode: Address Autocomplete & Geofencing */}
            {orderType === "delivery" ? (
              <div className="space-y-4 pt-1">
                <AddressAutocomplete
                  selectedBranch={selectedBranch}
                  initialData={{
                    street,
                    number,
                    colonia,
                    zipCode,
                    notes: driverNotes,
                    lat,
                    lng,
                  }}
                  onAddressChange={handleAddressUpdate}
                  errors={{
                    street: errors.address_street,
                    zipCode: errors.address_zip,
                  }}
                />
              </div>
            ) : (
              /* Pickup Mode: Pickup Instructions Card */
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-900 font-black">
                  <Clock className="h-4 w-4 text-[#005A36]" />
                  <span>Tiempo estimado de preparación: ~20 minutos</span>
                </div>
                <p className="text-neutral-700">
                  Pasa a recoger tu pedido directamente en el mostrador de <b>{selectedBranch.name}</b> ubicado en:
                </p>
                <p className="font-bold text-neutral-900 pl-6 border-l-2 border-[#005A36]">
                  {selectedBranch.address} (Tel. {selectedBranch.phone})
                </p>
              </div>
            )}
          </div>

          {/* BLOQUE 3: MÉTODO DE PAGO Y FACTURACIÓN CFDI 4.0 */}
          <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
              <div className="h-7 w-7 rounded-lg bg-emerald-50 text-[#005A36] flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h2 className="text-base font-black uppercase text-neutral-900">
                Método de Pago & Facturación
              </h2>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                  paymentMethod === "card"
                    ? "border-[#005A36] bg-emerald-50 text-[#005A36] ring-2 ring-[#005A36]/30 shadow-xs"
                    : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                <CreditCard className="h-5 w-5" />
                <div>
                  <p className="text-xs font-black text-neutral-900">Tarjeta</p>
                  <p className="text-[10px] text-neutral-500">Al recibir o terminal</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                  paymentMethod === "cash"
                    ? "border-[#005A36] bg-emerald-50 text-[#005A36] ring-2 ring-[#005A36]/30 shadow-xs"
                    : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                <Banknote className="h-5 w-5" />
                <div>
                  <p className="text-xs font-black text-neutral-900">Efectivo</p>
                  <p className="text-[10px] text-neutral-500">Contra entrega</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("whatsapp")}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                  paymentMethod === "whatsapp"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/30 shadow-xs"
                    : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                <Sparkles className="h-5 w-5 text-emerald-700" />
                <div>
                  <p className="text-xs font-black text-neutral-900">WhatsApp</p>
                  <p className="text-[10px] text-neutral-500">Cierre asistido</p>
                </div>
              </button>
            </div>

            {/* Optional SAT Invoicing CFDI 4.0 Checkbox */}
            <div className="pt-3 border-t border-neutral-100">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={requiresInvoice}
                  onChange={(e) => setRequiresInvoice(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-[#005A36] focus:ring-[#005A36]"
                />
                <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                  <Receipt className="h-4 w-4 text-[#005A36]" />
                  <span>¿Requieres factura electrónica CFDI 4.0?</span>
                </span>
              </label>

              {/* Conditional Invoicing Fields */}
              {requiresInvoice && (
                <div className="mt-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3 animate-in fade-in">
                  <p className="text-[11px] text-neutral-500">
                    Ingresa tus datos fiscales conforme a tu Constancia de Situación Fiscal (SAT).
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                        RFC *
                      </label>
                      <Input
                        type="text"
                        placeholder="XAXX010101000"
                        maxLength={13}
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value.toUpperCase())}
                        className="bg-white border-neutral-300 text-xs h-9 uppercase font-mono"
                      />
                      {errors.tax_id && (
                        <p className="text-[10px] text-red-600 font-bold mt-0.5">{errors.tax_id}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                        Razón Social (sin régimen societario) *
                      </label>
                      <Input
                        type="text"
                        placeholder="JUAN PEREZ O EMPRESA"
                        value={taxName}
                        onChange={(e) => setTaxName(e.target.value.toUpperCase())}
                        className="bg-white border-neutral-300 text-xs h-9 uppercase"
                      />
                      {errors.tax_name && (
                        <p className="text-[10px] text-red-600 font-bold mt-0.5">{errors.tax_name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                        Código Postal Fiscal *
                      </label>
                      <Input
                        type="text"
                        placeholder="06000"
                        maxLength={5}
                        value={taxZip}
                        onChange={(e) => setTaxZip(e.target.value.replace(/\D/g, ""))}
                        className="bg-white border-neutral-300 text-xs h-9 font-mono"
                      />
                      {errors.tax_zip && (
                        <p className="text-[10px] text-red-600 font-bold mt-0.5">{errors.tax_zip}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                        Régimen Fiscal *
                      </label>
                      <select
                        value={taxRegime}
                        onChange={(e) => setTaxRegime(e.target.value)}
                        className="w-full h-9 px-2 bg-white border border-neutral-300 rounded-md text-xs"
                      >
                        {SAT_REGIMENES_FISCALES.map((r) => (
                          <option key={r.code} value={r.code}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: STICKY ORDER SUMMARY (5 cols) */}
        <div className="lg:col-span-5">
          <OrderSummaryCard
            items={items}
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            grandTotal={grandTotal}
            orderType={orderType}
            isSubmitting={isSubmitting}
            isCoverageBlocked={isCoverageBlocked}
            onPrimarySubmit={() => handleFormSubmit()}
            customerDetails={{
              name: customerName,
              phone: customerPhone,
              deliveryAddress:
                orderType === "delivery" && street
                  ? `${street} ${number}, ${colonia}, CP ${zipCode}`
                  : undefined,
              notes: driverNotes,
            }}
          />
        </div>
      </form>
    </div>
  );
}
