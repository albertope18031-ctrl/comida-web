"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  ChefHat,
  Bike,
  PackageCheck,
  Store,
  MapPin,
  Phone,
  Flame,
  ArrowRight,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/types/database";

interface OrderTrackerProps {
  orderId: string;
  initialOrder: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    orderType: "delivery" | "pickup";
    branch: {
      name: string;
      address: string;
      phone: string;
      estimatedDeliveryMin: number;
    };
    subtotal: number;
    deliveryFee: number;
    total: number;
    createdAt: string;
    customer: {
      name: string;
      phone: string;
      address: string;
    };
    items: {
      name: string;
      quantity: number;
      flavors: string[];
      dips: string[];
      price: number;
    }[];
  };
}

const STEPS = [
  {
    status: "pending",
    label: "Orden Recibida",
    desc: "Tu pedido fue enviado al restaurante",
    icon: Clock,
  },
  {
    status: "confirmed",
    label: "Confirmada",
    desc: "Aceptada por el equipo de cocina",
    icon: Store,
  },
  {
    status: "preparing",
    label: "En Cocina",
    desc: "Alitas dorándose y bañándose en salsa",
    icon: ChefHat,
  },
  {
    status: "ready",
    label: "Lista y Empacada",
    desc: "Papas calientes y aderezos sellados",
    icon: PackageCheck,
  },
  {
    status: "on_the_way",
    label: "En Camino",
    desc: "El repartidor va hacia tu domicilio",
    icon: Bike,
  },
  {
    status: "delivered",
    label: "¡Entregado!",
    desc: "Buen provecho, disfruta tu sabor Loco Rooster",
    icon: CheckCircle2,
  },
];

export function OrderTrackerClient({
  orderId,
  initialOrder,
}: OrderTrackerProps) {
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(
    initialOrder.status
  );
  const [countdownMinutes, setCountdownMinutes] = useState(
    initialOrder.branch.estimatedDeliveryMin
  );

  // Subscribe to Supabase Realtime channel
  useEffect(() => {
    try {
      const supabase = createClient();
      const channel = supabase
        .channel(`order-tracking-${orderId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "orders",
            filter: `id=eq.${orderId}`,
          },
          (payload) => {
            const updated = payload.new as { status?: OrderStatus };
            if (updated.status) {
              setOrderStatus(updated.status);
              toast.info(`Estado de orden actualizado: ${updated.status}`);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      // Offline fallback
    }
  }, [orderId]);

  // Determine current step index
  const currentStepIndex = STEPS.findIndex((s) => s.status === orderStatus);
  const activeIndex = currentStepIndex === -1 ? 2 : currentStepIndex;

  // Simulator for demo purposes
  const handleSimulateNextStep = () => {
    const nextIndex = (activeIndex + 1) % STEPS.length;
    const nextStatus = STEPS[nextIndex].status as OrderStatus;
    setOrderStatus(nextStatus);
    toast.success(`Simulación: Orden avanzada a ${STEPS[nextIndex].label}`);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="rounded-3xl bg-[#1C1917] text-white p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#FFB703]">
              SEGUIMIENTO EN TIEMPO REAL
            </span>
            <span className="inline-block h-2 w-2 rounded-full bg-[#FF3823] animate-ping" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-display text-[#FAF7F2]">
            Orden #{initialOrder.orderNumber}
          </h1>

          <p className="text-xs text-neutral-300 flex items-center gap-1.5">
            <Store className="h-3.5 w-3.5 text-[#FFB703]" />
            <span>Preparada en: {initialOrder.branch.name}</span>
          </p>
        </div>

        <div className="bg-neutral-800 p-4 rounded-2xl border border-neutral-700 text-right shrink-0">
          <span className="text-[11px] font-bold text-neutral-400 block uppercase">
            Tiempo estimado restante
          </span>
          <span className="text-2xl sm:text-3xl font-black text-[#FFB703] font-display">
            ~{countdownMinutes} minutos
          </span>
          <span className="text-[10px] text-neutral-400 block mt-0.5">
            Llegada estimada a tu ubicación
          </span>
        </div>
      </div>

      {/* Realtime Progress Stepper */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-neutral-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-neutral-900 uppercase">
            Estado de Preparación
          </h2>

          {/* Simulator helper button for demo testing */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSimulateNextStep}
            className="text-xs font-bold border-neutral-300 text-neutral-700 hover:bg-neutral-100"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            <span>Simular Siguiente Etapa</span>
          </Button>
        </div>

        {/* Stepper Timeline */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {STEPS.map((step, idx) => {
            const isCompleted = idx <= activeIndex;
            const isCurrent = idx === activeIndex;
            const Icon = step.icon;

            return (
              <div
                key={step.status}
                className={`p-4 rounded-2xl border transition-all flex flex-col items-center text-center space-y-2 relative ${
                  isCurrent
                    ? "border-[#FF3823] bg-red-50/80 shadow-md ring-2 ring-[#FF3823]/30 scale-[1.02]"
                    : isCompleted
                    ? "border-[#588157]/40 bg-[#588157]/10"
                    : "border-neutral-200 bg-neutral-50/60 opacity-60"
                }`}
              >
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center font-black ${
                    isCurrent
                      ? "bg-[#FF3823] text-white shadow-sm animate-pulse"
                      : isCompleted
                      ? "bg-[#1C1917] text-[#FFB703]"
                      : "bg-neutral-200 text-neutral-500"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div>
                  <h4 className="font-extrabold text-xs text-neutral-900 leading-tight">
                    {step.label}
                  </h4>
                  <p className="text-[10px] text-neutral-500 mt-0.5 leading-snug">
                    {step.desc}
                  </p>
                </div>

                {isCurrent && (
                  <span className="inline-block px-2 py-0.5 rounded-full bg-[#FFB703] text-neutral-950 font-black text-[9px] uppercase tracking-wider mt-1">
                    En Proceso
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Details & Branch Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Products Breakdown (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-neutral-200 shadow-sm space-y-4">
          <h3 className="text-base font-black text-neutral-900 uppercase">
            Detalle de tu Pedido
          </h3>

          <div className="divide-y divide-neutral-100">
            {initialOrder.items.map((item, idx) => (
              <div key={idx} className="py-3.5 space-y-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-black text-sm text-neutral-900">
                    {item.quantity}x {item.name}
                  </h4>
                  <span className="font-bold text-sm text-neutral-950">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>

                {item.flavors.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {item.flavors.map((f, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.2 rounded flex items-center gap-1"
                      >
                        <Flame className="h-2.5 w-2.5 text-amber-600" />
                        {f}
                      </span>
                    ))}
                  </div>
                )}

                {item.dips.length > 0 && (
                  <p className="text-[11px] text-neutral-500">
                    Aderezos: {item.dips.join(", ")}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Financial Totals */}
          <div className="pt-4 border-t border-neutral-200 space-y-2 text-xs text-neutral-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-bold text-neutral-900">
                {formatCurrency(initialOrder.subtotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Costo de entrega:</span>
              <span className="font-bold text-neutral-900">
                {formatCurrency(initialOrder.deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm font-black text-neutral-950 pt-2 border-t border-neutral-200">
              <span>Total Pagado:</span>
              <span className="text-xl text-[#FF3823] font-black">
                {formatCurrency(initialOrder.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Contact & Branch Card (1 col) */}
        <div className="space-y-6">
          {/* Branch Card */}
          <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-sm space-y-4">
            <h3 className="text-base font-black text-neutral-900 uppercase flex items-center gap-2">
              <Store className="h-4 w-4 text-[#FF3823]" />
              <span>Sucursal Preparadora</span>
            </h3>

            <div className="text-xs space-y-2">
              <p className="font-extrabold text-neutral-900 text-sm">
                {initialOrder.branch.name}
              </p>
              <p className="text-neutral-500 flex items-start gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#FF3823] shrink-0 mt-0.5" />
                <span>{initialOrder.branch.address}</span>
              </p>
              <p className="text-neutral-600 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-[#FF3823]" />
                <span>{initialOrder.branch.phone}</span>
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              asChild
              className="w-full text-xs font-bold border-neutral-300 hover:bg-red-50 hover:text-[#FF3823]"
            >
              <a href={`tel:${initialOrder.branch.phone.replace(/\s+/g, "")}`}>
                Llamar a la Sucursal
              </a>
            </Button>
          </div>

          {/* Delivery Address Card */}
          <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-sm space-y-3 text-xs">
            <h3 className="font-black text-neutral-900 uppercase">
              Dirección de Entrega
            </h3>
            <p className="text-neutral-700 font-medium leading-relaxed">
              {initialOrder.customer.address}
            </p>
            <p className="text-neutral-500">
              Receptor: <strong className="text-neutral-900">{initialOrder.customer.name}</strong>
            </p>
          </div>

          <Button variant="primary" asChild className="w-full font-bold">
            <Link href="/menu">Realizar Otra Orden</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
