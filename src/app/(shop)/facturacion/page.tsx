"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Receipt,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  DollarSign,
  Mail,
  Copy,
  Check,
  ArrowLeft,
  ArrowRight,
  Search,
  Loader2,
  FileCheck,
  ShieldCheck,
  HelpCircle,
  Printer,
  Sparkles,
  ChevronDown,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  SAT_REGIMENES_FISCALES,
  SAT_USOS_CFDI,
  validateRFC,
} from "@/lib/sat-catalogs";
import { RESTAURANT_BRANCHES } from "@/store/order-context-store";
import { formatCurrency } from "@/lib/utils";

interface ValidatedOrder {
  id: string;
  orderNumber: string;
  branchName: string;
  branchAddress: string;
  total: number;
  subtotal: number;
  purchaseDate: string;
}

interface StampedInvoice {
  uuid: string;
  folio: string;
  rfc: string;
  legalName: string;
  subtotal: number;
  iva: number;
  total: number;
  fiscalZipCode: string;
  fiscalRegime: string;
  cfdiUsage: string;
  emailSentTo: string;
  invoicedAt: string;
  xmlUrl: string;
  pdfUrl: string;
  xmlDataUri?: string;
}

export default function FacturacionPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isPending, startTransition] = useTransition();
  const [copiedUuid, setCopiedUuid] = useState(false);

  // Step 1: Ticket Search State
  const [ticketFolio, setTicketFolio] = useState("");
  const [branchId, setBranchId] = useState(RESTAURANT_BRANCHES[0].id);
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [ticketTotal, setTicketTotal] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);

  // Validated Ticket Data
  const [validatedOrder, setValidatedOrder] = useState<ValidatedOrder | null>(
    null
  );

  // Step 2: Fiscal Data State (CFDI 4.0)
  const [rfc, setRfc] = useState("");
  const [legalName, setLegalName] = useState("");
  const [fiscalZipCode, setFiscalZipCode] = useState("");
  const [fiscalRegime, setFiscalRegime] = useState("605");
  const [cfdiUsage, setCfdiUsage] = useState("G03");
  const [email, setEmail] = useState("");
  const [fiscalError, setFiscalError] = useState<string | null>(null);

  // Step 3: Generated Invoice Result
  const [stampedInvoice, setStampedInvoice] = useState<StampedInvoice | null>(
    null
  );

  // RFC Validation on the fly
  const rfcCheck = validateRFC(rfc);

  // Quick autofill demo ticket
  const handleLoadDemoTicket = () => {
    setTicketFolio("WS-260905-8842");
    setBranchId(RESTAURANT_BRANCHES[0].id);
    setPurchaseDate(new Date().toISOString().slice(0, 10));
    setTicketTotal("349.00");
    setSearchError(null);
    toast.info("Ticket de demostración cargado", {
      description: "Folio WS-260905-8842 por $349.00 en Roma Norte.",
    });
  };

  // Step 1: Lookup and validate ticket
  const handleLookupTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);

    const totalNum = parseFloat(ticketTotal);
    if (!ticketFolio.trim()) {
      setSearchError("Ingresa el número de folio o ticket impreso en tu ticket.");
      return;
    }
    if (isNaN(totalNum) || totalNum <= 0) {
      setSearchError("Ingresa un monto total válido mayor a $0.00.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/invoicing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "lookup",
            orderNumber: ticketFolio.trim(),
            branchId,
            purchaseDate,
            totalAmount: totalNum,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          if (data.alreadyInvoiced && data.invoice) {
            toast.warning("Ticket ya facturado", {
              description: "Este ticket ya tiene una factura emitida previamente.",
            });
            // Show previously stamped invoice directly
            setStampedInvoice({
              uuid: data.invoice.uuid || "CFDI-UUID-ANTERIOR",
              folio: ticketFolio.toUpperCase(),
              rfc: data.invoice.rfc || "XAXX010101000",
              legalName: "CLIENTE REGISTRADO",
              subtotal: Math.round((totalNum / 1.16) * 100) / 100,
              iva: Math.round((totalNum - totalNum / 1.16) * 100) / 100,
              total: totalNum,
              fiscalZipCode: "06000",
              fiscalRegime: "601",
              cfdiUsage: "G03",
              emailSentTo: "registrado@correo.com",
              invoicedAt: data.invoice.invoicedAt || new Date().toISOString(),
              xmlUrl: data.invoice.xmlUrl,
              pdfUrl: data.invoice.pdfUrl,
            });
            setStep(3);
            return;
          }

          setSearchError(
            data.error ||
              "No se pudo validar el ticket. Verifica el número de folio y la sucursal."
          );
          return;
        }

        setValidatedOrder(data.order);
        setStep(2);
        toast.success("Ticket localizado correctamente", {
          description: "Continúa capturando tus datos fiscales SAT.",
        });
      } catch (err) {
        setSearchError(
          "Error de conexión con el servidor. Intenta de nuevo en unos momentos."
        );
      }
    });
  };

  // Step 2: Stamp CFDI 4.0
  const handleStampInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    setFiscalError(null);

    if (!rfcCheck.isValid) {
      setFiscalError(
        rfcCheck.error || "El formato del RFC no es válido según el SAT."
      );
      return;
    }

    if (!legalName.trim()) {
      setFiscalError("Ingresa tu nombre fiscal o razón social completa.");
      return;
    }

    if (!/^\d{5}$/.test(fiscalZipCode.trim())) {
      setFiscalError("El código postal fiscal debe constar de 5 dígitos.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setFiscalError("Ingresa un correo electrónico válido para enviar tu factura.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/invoicing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "stamp",
            orderNumber: validatedOrder?.orderNumber || ticketFolio,
            branchId,
            purchaseDate,
            totalAmount: validatedOrder?.total || parseFloat(ticketTotal),
            rfc: rfc.trim().toUpperCase(),
            legalName: legalName.trim().toUpperCase(),
            fiscalZipCode: fiscalZipCode.trim(),
            fiscalRegime,
            cfdiUsage,
            email: email.trim(),
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setFiscalError(
            data.error || "Error al timbrar la factura. Por favor verifica tus datos."
          );
          return;
        }

        setStampedInvoice(data.invoice);
        setStep(3);
        toast.success("¡Factura CFDI 4.0 timbrada con éxito!", {
          description: "Folio Fiscal SAT generado y registrado correctamente.",
        });
      } catch (err) {
        setFiscalError(
          "Error de conexión al procesar el timbrado fiscal. Por favor reintenta."
        );
      }
    });
  };

  const copyUuidToClipboard = () => {
    if (!stampedInvoice?.uuid) return;
    navigator.clipboard.writeText(stampedInvoice.uuid);
    setCopiedUuid(true);
    toast.success("UUID copiado al portapapeles");
    setTimeout(() => setCopiedUuid(false), 2500);
  };

  const resetAll = () => {
    setStep(1);
    setTicketFolio("");
    setTicketTotal("");
    setValidatedOrder(null);
    setStampedInvoice(null);
    setSearchError(null);
    setFiscalError(null);
  };

  return (
    <div className="min-h-screen bg-[#07130c] text-stone-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-stone-400 mb-6">
          <Link href="/" className="hover:text-emerald-400 transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <span className="text-emerald-400 font-medium">Facturación Electrónica</span>
        </div>

        {/* Page Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-3">
            <ShieldCheck className="h-4 w-4" />
            Portal de Facturación Electrónica CFDI 4.0
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">
            Factura tus <span className="text-[#00c853]">Consumos</span>
          </h1>
          <p className="mt-2 text-stone-300 text-sm sm:text-base max-w-2xl mx-auto">
            Genera tus comprobantes fiscales digitales por internet de manera
            rápida, oficial y sin filas conforme a las regulaciones del SAT México.
          </p>
        </div>

        {/* 3-Step Wizard Timeline */}
        <div className="mb-10 bg-stone-900/80 border border-stone-800 rounded-2xl p-4 sm:p-6">
          <div className="grid grid-cols-3 gap-2 text-center relative">
            {/* Step 1 Indicator */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step === 1
                    ? "bg-[#005A36] text-white ring-4 ring-emerald-500/30 shadow-lg"
                    : step > 1
                    ? "bg-emerald-600 text-white"
                    : "bg-stone-800 text-stone-400"
                }`}
              >
                {step > 1 ? <Check className="h-5 w-5" /> : "1"}
              </div>
              <span
                className={`mt-2 text-xs font-semibold sm:text-sm ${
                  step === 1 ? "text-white" : "text-stone-400"
                }`}
              >
                1. Buscar Ticket
              </span>
            </div>

            {/* Step 2 Indicator */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step === 2
                    ? "bg-[#005A36] text-white ring-4 ring-emerald-500/30 shadow-lg"
                    : step > 2
                    ? "bg-emerald-600 text-white"
                    : "bg-stone-800 text-stone-400"
                }`}
              >
                {step > 2 ? <Check className="h-5 w-5" /> : "2"}
              </div>
              <span
                className={`mt-2 text-xs font-semibold sm:text-sm ${
                  step === 2 ? "text-white" : "text-stone-400"
                }`}
              >
                2. Datos Fiscales
              </span>
            </div>

            {/* Step 3 Indicator */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step === 3
                    ? "bg-[#005A36] text-white ring-4 ring-emerald-500/30 shadow-lg"
                    : "bg-stone-800 text-stone-400"
                }`}
              >
                {step === 3 ? <Sparkles className="h-5 w-5 text-amber-300" /> : "3"}
              </div>
              <span
                className={`mt-2 text-xs font-semibold sm:text-sm ${
                  step === 3 ? "text-[#00c853] font-bold" : "text-stone-400"
                }`}
              >
                3. Factura Emitida
              </span>
            </div>
          </div>
        </div>

        {/* STEP 1: SEARCH & VALIDATE TICKET */}
        {step === 1 && (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-5 mb-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-[#00c853]" />
                  Localiza tu Ticket de Compra
                </h2>
                <p className="text-xs sm:text-sm text-stone-400 mt-1">
                  Ingresa los 4 datos impresos en tu comprobante de venta.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLoadDemoTicket}
                className="border-emerald-800/80 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 hover:text-white text-xs self-start sm:self-auto"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-300" />
                Cargar Ticket Demo
              </Button>
            </div>

            {searchError && (
              <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-800 text-red-200 text-sm flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-300">No fue posible validar el ticket</p>
                  <p className="text-xs sm:text-sm mt-0.5">{searchError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleLookupTicket} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Folio / Ticket */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                    Número de Folio o Ticket *
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Ej. WS-260905-1234"
                      value={ticketFolio}
                      onChange={(e) => setTicketFolio(e.target.value.toUpperCase())}
                      className="bg-stone-950 border-stone-700 text-white font-mono tracking-wider focus:border-emerald-500 focus:ring-emerald-500"
                      required
                    />
                    <Receipt className="absolute right-3 top-2.5 h-5 w-5 text-stone-500 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Ubicado en la parte superior o pie de tu ticket.
                  </p>
                </div>

                {/* Sucursal */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                    Sucursal de Consumo *
                  </label>
                  <div className="relative">
                    <select
                      value={branchId}
                      onChange={(e) => setBranchId(e.target.value)}
                      className="w-full h-10 px-3 py-2 rounded-md bg-stone-950 border border-stone-700 text-white text-sm focus:border-emerald-500 focus:ring-emerald-500 appearance-none pr-10"
                      required
                    >
                      {RESTAURANT_BRANCHES.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.city})
                        </option>
                      ))}
                    </select>
                    <Building2 className="absolute right-3 top-2.5 h-5 w-5 text-stone-500 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Sucursal donde realizaste tu pedido o consumo.
                  </p>
                </div>

                {/* Purchase Date */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                    Fecha de Compra *
                  </label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      className="bg-stone-950 border-stone-700 text-white focus:border-emerald-500 focus:ring-emerald-500"
                      required
                    />
                    <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-stone-500 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Fecha exacta registrada en el ticket.
                  </p>
                </div>

                {/* Total Amount */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                    Monto Total con Centavos ($ MXN) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-stone-500 font-bold text-sm">
                      $
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="349.00"
                      value={ticketTotal}
                      onChange={(e) => setTicketTotal(e.target.value)}
                      className="bg-stone-950 border-stone-700 text-white pl-8 font-mono focus:border-emerald-500 focus:ring-emerald-500"
                      required
                    />
                    <DollarSign className="absolute right-3 top-2.5 h-5 w-5 text-stone-500 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Total neto pagado, incluyendo impuestos.
                  </p>
                </div>
              </div>

              {/* Security info notice */}
              <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 flex items-start gap-3 mt-4">
                <Info className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-stone-400 space-y-1">
                  <p className="font-semibold text-stone-300">
                    Políticas de Facturación Electrónica SAT
                  </p>
                  <p>
                    • Cuentas con hasta el último día del mes en curso en que realizaste tu
                    consumo para emitir tu factura.
                  </p>
                  <p>
                    • Verifica que tu RFC y Régimen Fiscal se encuentren activos ante el
                    SAT conforme a tu Cédula de Identificación Fiscal (CIF).
                  </p>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full sm:w-auto bg-[#005A36] hover:bg-[#004227] text-white px-8 py-6 text-base font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-950/50"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Validando Ticket...
                    </>
                  ) : (
                    <>
                      Validar Ticket y Continuar
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: CFDI 4.0 FISCAL DATA */}
        {step === 2 && validatedOrder && (
          <div className="space-y-6">
            {/* Ticket Summary Badge Banner */}
            <div className="bg-emerald-950/60 border border-emerald-800/80 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <span className="font-bold text-white text-base">
                    Ticket Validado: {validatedOrder.orderNumber}
                  </span>
                  <Badge className="bg-[#005A36] text-white text-xs">
                    {validatedOrder.branchName}
                  </Badge>
                </div>
                <p className="text-xs text-stone-300 mt-1">
                  Fecha: {validatedOrder.purchaseDate} | Subtotal:{" "}
                  {formatCurrency(validatedOrder.subtotal)} + IVA (16%):{" "}
                  {formatCurrency(validatedOrder.total - validatedOrder.subtotal)}
                </p>
              </div>
              <div className="text-right sm:text-right border-t sm:border-t-0 border-emerald-900 pt-3 sm:pt-0">
                <span className="text-xs uppercase tracking-wider text-stone-400 block">
                  Total a Facturar
                </span>
                <span className="text-2xl font-black text-[#00c853]">
                  {formatCurrency(validatedOrder.total)}
                </span>
              </div>
            </div>

            {/* Fiscal Form */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 shadow-xl">
              <div className="border-b border-stone-800 pb-5 mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#00c853]" />
                  Datos Fiscales del Receptor (CFDI 4.0 SAT)
                </h2>
                <p className="text-xs sm:text-sm text-stone-400 mt-1">
                  Ingresa los datos tal como aparecen en tu Constancia de Situación Fiscal.
                </p>
              </div>

              {fiscalError && (
                <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-800 text-red-200 text-sm flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-300">Error en datos fiscales</p>
                    <p className="text-xs sm:text-sm mt-0.5">{fiscalError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleStampInvoice} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* RFC */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                      RFC Receptor *
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Ej. WNG120315XX1 o GOME850101XYZ"
                        maxLength={13}
                        value={rfc}
                        onChange={(e) => setRfc(e.target.value.toUpperCase())}
                        className="bg-stone-950 border-stone-700 text-white font-mono uppercase tracking-wider focus:border-emerald-500 focus:ring-emerald-500"
                        required
                      />
                      {rfc.length >= 12 && (
                        <span
                          className={`absolute right-3 top-2 text-xs font-bold px-2 py-0.5 rounded ${
                            rfcCheck.isValid
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                              : "bg-red-950 text-red-400 border border-red-800"
                          }`}
                        >
                          {rfcCheck.isValid
                            ? rfcCheck.type === "moral"
                              ? "Moral (12)"
                              : "Física (13)"
                            : "Inválido"}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-400 mt-1">
                      12 caracteres para empresas (Moral) o 13 para personas físicas.
                    </p>
                  </div>

                  {/* Legal Name / Razón Social */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                      Nombre o Razón Social *
                    </label>
                    <Input
                      type="text"
                      placeholder="Ej. JUAN PEREZ LOPEZ o ALIMENTOS DEL NORTE"
                      value={legalName}
                      onChange={(e) => setLegalName(e.target.value.toUpperCase())}
                      className="bg-stone-950 border-stone-700 text-white uppercase focus:border-emerald-500 focus:ring-emerald-500"
                      required
                    />
                    <p className="text-[11px] text-amber-300/90 mt-1">
                      ⚠️ CFDI 4.0: Escribe en MAYÚSCULAS y <b>sin</b> el régimen societario
                      (omite &quot;S.A. de C.V.&quot;, &quot;S. de R.L.&quot;, etc.).
                    </p>
                  </div>

                  {/* Postal Code */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                      Código Postal Fiscal *
                    </label>
                    <Input
                      type="text"
                      maxLength={5}
                      placeholder="Ej. 06000"
                      value={fiscalZipCode}
                      onChange={(e) =>
                        setFiscalZipCode(e.target.value.replace(/[^0-9]/g, ""))
                      }
                      className="bg-stone-950 border-stone-700 text-white font-mono focus:border-emerald-500 focus:ring-emerald-500"
                      required
                    />
                    <p className="text-[11px] text-stone-400 mt-1">
                      Código postal registrado ante el SAT en tu CIF.
                    </p>
                  </div>

                  {/* Régimen Fiscal */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                      Régimen Fiscal (SAT) *
                    </label>
                    <select
                      value={fiscalRegime}
                      onChange={(e) => setFiscalRegime(e.target.value)}
                      className="w-full h-10 px-3 py-2 rounded-md bg-stone-950 border border-stone-700 text-white text-xs sm:text-sm focus:border-emerald-500 focus:ring-emerald-500"
                      required
                    >
                      {SAT_REGIMENES_FISCALES.map((r) => (
                        <option key={r.code} value={r.code}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-stone-400 mt-1">
                      Debe coincidir con tu régimen fiscal activo.
                    </p>
                  </div>

                  {/* Uso de CFDI */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                      Uso de CFDI *
                    </label>
                    <select
                      value={cfdiUsage}
                      onChange={(e) => setCfdiUsage(e.target.value)}
                      className="w-full h-10 px-3 py-2 rounded-md bg-stone-950 border border-stone-700 text-white text-xs sm:text-sm focus:border-emerald-500 focus:ring-emerald-500"
                      required
                    >
                      {SAT_USOS_CFDI.map((u) => (
                        <option key={u.code} value={u.code}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-stone-400 mt-1">
                      Recomendado para consumos: G03 - Gastos en general.
                    </p>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                      Correo Electrónico para Envío *
                    </label>
                    <div className="relative">
                      <Input
                        type="email"
                        placeholder="facturas@tuempresa.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-stone-950 border-stone-700 text-white focus:border-emerald-500 focus:ring-emerald-500"
                        required
                      />
                      <Mail className="absolute right-3 top-2.5 h-5 w-5 text-stone-500 pointer-events-none" />
                    </div>
                    <p className="text-[11px] text-stone-400 mt-1">
                      Te enviaremos los archivos XML y PDF inmediatamente.
                    </p>
                  </div>
                </div>

                <div className="pt-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 border-t border-stone-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="w-full sm:w-auto border-stone-700 text-stone-300 hover:bg-stone-800"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Regresar al Paso 1
                  </Button>

                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full sm:w-auto bg-[#005A36] hover:bg-[#004227] text-white px-8 py-6 text-base font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-950/50"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Timbrando con SAT / PAC...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-5 w-5 mr-2" />
                        Generar y Timbrar Factura CFDI 4.0
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS & DOWNLOAD CFDI */}
        {step === 3 && stampedInvoice && (
          <div className="space-y-6">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-10 shadow-2xl text-center">
              <div className="w-16 h-16 bg-emerald-500/20 text-[#00c853] rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-500/10">
                <CheckCircle2 className="h-10 w-10" />
              </div>

              <Badge className="bg-[#005A36] text-white uppercase tracking-wider text-xs px-3 py-1 mb-2">
                Timbrado Fiscal SAT Exitoso
              </Badge>

              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                ¡Tu Factura ha sido Emitida!
              </h2>

              <p className="text-stone-300 text-sm mt-2 max-w-lg mx-auto">
                El comprobante fiscal digital por internet (CFDI 4.0) correspondiente a
                tu ticket <b>{stampedInvoice.folio}</b> fue timbrado ante el SAT.
              </p>

              {/* UUID Banner */}
              <div className="mt-6 p-4 rounded-xl bg-stone-950 border border-emerald-800/80 max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                <div className="overflow-hidden w-full">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                    Folio Fiscal SAT (UUID)
                  </span>
                  <span className="font-mono text-xs sm:text-sm font-bold text-white block truncate">
                    {stampedInvoice.uuid}
                  </span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={copyUuidToClipboard}
                  className="shrink-0 border-stone-700 bg-stone-900 hover:bg-stone-800 text-stone-200 text-xs w-full sm:w-auto"
                >
                  {copiedUuid ? (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>

              {/* Invoice Breakdown Details */}
              <div className="mt-8 bg-stone-950/80 border border-stone-800 rounded-xl p-5 text-left max-w-2xl mx-auto text-xs sm:text-sm">
                <div className="grid grid-cols-2 gap-4 border-b border-stone-800 pb-4 mb-4">
                  <div>
                    <span className="text-stone-500 block">Receptor:</span>
                    <span className="font-bold text-white block">
                      {stampedInvoice.legalName}
                    </span>
                    <span className="font-mono text-emerald-400">
                      RFC: {stampedInvoice.rfc}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-stone-500 block">Emisor:</span>
                    <span className="font-bold text-white block">
                      WINGSTOP MÉXICO
                    </span>
                    <span className="font-mono text-stone-400">
                      RFC: WNG120315XX1
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-1 text-stone-300">
                  <span>Subtotal:</span>
                  <span className="font-mono">{formatCurrency(stampedInvoice.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center py-1 text-stone-300">
                  <span>IVA Trasladado (16%):</span>
                  <span className="font-mono">{formatCurrency(stampedInvoice.iva)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-stone-800 font-bold text-white text-base">
                  <span>Total Facturado:</span>
                  <span className="font-mono text-[#00c853]">
                    {formatCurrency(stampedInvoice.total)}
                  </span>
                </div>
              </div>

              {/* Email notification notice */}
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-stone-400">
                <Mail className="h-4 w-4 text-emerald-400" />
                <span>
                  Archivos enviados a:{" "}
                  <b className="text-stone-200">{stampedInvoice.emailSentTo}</b>
                </span>
              </div>

              {/* Download CTA Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={stampedInvoice.xmlUrl}
                  download={`Factura_${stampedInvoice.folio}_CFDI.xml`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-700 text-white font-bold py-3.5 px-6 rounded-xl border border-stone-700 shadow-md text-sm transition-all"
                >
                  <Download className="h-4 w-4 text-emerald-400" />
                  Descargar XML (.xml)
                </a>

                <a
                  href={stampedInvoice.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#005A36] hover:bg-[#004227] text-white font-bold py-3.5 px-6 rounded-xl shadow-lg text-sm transition-all"
                >
                  <Printer className="h-4 w-4 text-amber-300" />
                  Descargar / Imprimir PDF
                </a>
              </div>

              {/* Reset to bill another ticket */}
              <div className="mt-8 pt-6 border-t border-stone-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={resetAll}
                  className="text-stone-400 hover:text-white hover:bg-stone-800"
                >
                  Facturar otro ticket
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* FAQs Section */}
        <div className="mt-12 bg-stone-900/60 border border-stone-800 rounded-2xl p-6 sm:p-8">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <HelpCircle className="h-5 w-5 text-emerald-400" />
            Preguntas Frecuentes sobre Facturación
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs sm:text-sm text-stone-400">
            <div className="bg-stone-950/60 p-4 rounded-xl border border-stone-800/80">
              <h4 className="font-bold text-stone-200 mb-1">
                ¿Cuánto tiempo tengo para facturar?
              </h4>
              <p>
                Por disposiciones fiscales, puedes facturar tus tickets de compra durante
                el mes en que realizaste tu consumo y hasta 72 horas posteriores al fin de
                mes.
              </p>
            </div>

            <div className="bg-stone-950/60 p-4 rounded-xl border border-stone-800/80">
              <h4 className="font-bold text-stone-200 mb-1">
                ¿Por qué no incluir &quot;S.A. de C.V.&quot;?
              </h4>
              <p>
                A partir de la versión 4.0 del CFDI establecida por el SAT, el nombre o
                razón social debe registrarse en mayúsculas sin el régimen de capital.
              </p>
            </div>

            <div className="bg-stone-950/60 p-4 rounded-xl border border-stone-800/80">
              <h4 className="font-bold text-stone-200 mb-1">
                ¿Dónde localizo mi número de folio?
              </h4>
              <p>
                En tu ticket físico impreso por la sucursal, localiza el campo rotulado como
                &quot;Ticket&quot; o &quot;Folio&quot; ubicado habitualmente debajo de la fecha o del
                logotipo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
