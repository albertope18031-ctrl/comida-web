"use client";

import { useState } from "react";
import {
  Clock,
  Flame,
  ChefHat,
  CheckCircle2,
  Bike,
  Package,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import type { OrderStatus } from "@/types/database";

interface KdsOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  fulfillmentType: "delivery" | "pickup";
  elapsedMinutes: number;
  status: OrderStatus;
  items: {
    name: string;
    quantity: number;
    flavors: string[];
    dips: string[];
    notes?: string;
  }[];
  total: number;
}

const INITIAL_ORDERS: KdsOrder[] = [
  {
    id: "ord-1",
    orderNumber: "LR-9104",
    customerName: "Rodrigo Navarro",
    fulfillmentType: "delivery",
    elapsedMinutes: 4,
    status: "pending",
    items: [
      {
        name: "Alitas Tradicionales (10 Pzas)",
        quantity: 1,
        flavors: ["Lemon Pepper", "Mango Habanero"],
        dips: ["Ranch Hecho en Casa (2 oz)"],
        notes: "Bien doradas por favor",
      },
      {
        name: "Papas Fritas Sazonadas",
        quantity: 1,
        flavors: [],
        dips: [],
      },
    ],
    total: 264,
  },
  {
    id: "ord-2",
    orderNumber: "LR-9103",
    customerName: "Camila Torres",
    fulfillmentType: "pickup",
    elapsedMinutes: 11,
    status: "preparing",
    items: [
      {
        name: "Boneless de Pechuga (15 Pzas)",
        quantity: 2,
        flavors: ["Atomic", "Garlic Parmesan"],
        dips: ["Blue Cheese Artesanal", "Ranch"],
      },
    ],
    total: 596,
  },
  {
    id: "ord-3",
    orderNumber: "LR-9102",
    customerName: "David Valencia",
    fulfillmentType: "delivery",
    elapsedMinutes: 19,
    status: "ready",
    items: [
      {
        name: "Mega Combo Rooster (30 Piezas + 2 Papas)",
        quantity: 1,
        flavors: ["Original Hot", "Lemon Pepper", "Hickory BBQ", "Louisiana Rub"],
        dips: ["3x Ranch", "1x Blue Cheese"],
      },
    ],
    total: 674,
  },
  {
    id: "ord-4",
    orderNumber: "LR-9101",
    customerName: "Sofia Méndez",
    fulfillmentType: "delivery",
    elapsedMinutes: 28,
    status: "on_the_way",
    items: [
      {
        name: "Loco Rooster All-in-One Combo",
        quantity: 1,
        flavors: ["Spicy Korean Q"],
        dips: ["Ranch"],
      },
    ],
    total: 304,
  },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<KdsOrder[]>(INITIAL_ORDERS);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    toast.info(`Orden actualizada a: ${newStatus.toUpperCase()}`);
  };

  const getStatusColumn = (statusList: OrderStatus[]) =>
    orders.filter((o) => statusList.includes(o.status));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <ChefHat className="h-7 w-7 text-emerald-400" />
            <span>Monitor KDS de Cocina en Vivo</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Visualización y avance de comandas por estación de preparación y empaque.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setOrders(INITIAL_ORDERS);
            toast.success("Órdenes refrescadas desde Supabase");
          }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white transition-colors cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Sincronizar</span>
        </button>
      </div>

      {/* KDS Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Column 1: Nuevas / Pendientes */}
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 flex items-center justify-between">
            <span className="font-black text-xs uppercase tracking-wider text-red-300">
              Nuevas ({getStatusColumn(["pending"]).length})
            </span>
            <AlertCircle className="h-4 w-4 text-red-400" />
          </div>

          <div className="space-y-3">
            {getStatusColumn(["pending"]).map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onNextStatus={() => handleStatusChange(order.id, "preparing")}
                nextActionLabel="Pasar a Freidora"
              />
            ))}
          </div>
        </div>

        {/* Column 2: En Preparación */}
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 flex items-center justify-between">
            <span className="font-black text-xs uppercase tracking-wider text-amber-300">
              En Cocina ({getStatusColumn(["preparing"]).length})
            </span>
            <Flame className="h-4 w-4 text-amber-400" />
          </div>

          <div className="space-y-3">
            {getStatusColumn(["preparing"]).map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onNextStatus={() => handleStatusChange(order.id, "ready")}
                nextActionLabel="Marcar Listo"
              />
            ))}
          </div>
        </div>

        {/* Column 3: Listo / Empaque */}
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/50 flex items-center justify-between">
            <span className="font-black text-xs uppercase tracking-wider text-blue-300">
              Listo ({getStatusColumn(["ready"]).length})
            </span>
            <Package className="h-4 w-4 text-blue-400" />
          </div>

          <div className="space-y-3">
            {getStatusColumn(["ready"]).map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onNextStatus={() =>
                  handleStatusChange(
                    order.id,
                    order.fulfillmentType === "delivery"
                      ? "on_the_way"
                      : "delivered"
                  )
                }
                nextActionLabel={
                  order.fulfillmentType === "delivery"
                    ? "Enviar con Repartidor"
                    : "Entregar a Cliente"
                }
              />
            ))}
          </div>
        </div>

        {/* Column 4: En Reparto */}
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-between">
            <span className="font-black text-xs uppercase tracking-wider text-emerald-300">
              En Tránsito ({getStatusColumn(["on_the_way"]).length})
            </span>
            <Bike className="h-4 w-4 text-emerald-400" />
          </div>

          <div className="space-y-3">
            {getStatusColumn(["on_the_way"]).map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onNextStatus={() => handleStatusChange(order.id, "delivered")}
                nextActionLabel="Confirmar Entrega"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderCard({
  order,
  onNextStatus,
  nextActionLabel,
}: {
  order: KdsOrder;
  onNextStatus: () => void;
  nextActionLabel: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3 shadow-md">
      {/* Top Meta */}
      <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
        <div>
          <span className="font-mono font-black text-white text-base">
            {order.orderNumber}
          </span>
          <p className="text-[11px] text-neutral-400 font-medium">
            {order.customerName}
          </p>
        </div>

        <div className="text-right">
          <span
            className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
              order.fulfillmentType === "delivery"
                ? "bg-emerald-900/60 text-emerald-300"
                : "bg-blue-900/60 text-blue-300"
            }`}
          >
            {order.fulfillmentType}
          </span>
          <div className="flex items-center gap-1 text-[11px] text-amber-400 font-bold mt-1 justify-end">
            <Clock className="h-3 w-3" />
            <span>{order.elapsedMinutes}m</span>
          </div>
        </div>
      </div>

      {/* Items Breakdown */}
      <div className="space-y-2 text-xs text-neutral-300">
        {order.items.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <p className="font-bold text-white">
              {item.quantity}x {item.name}
            </p>
            {item.flavors.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.flavors.map((f, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-bold bg-[#FFB703] text-neutral-950 px-1.5 py-0.2 rounded"
                  >
                    {f}
                  </span>
                ))}
              </div>
            )}
            {item.dips.length > 0 && (
              <p className="text-[11px] text-neutral-400">
                Aderezos: {item.dips.join(", ")}
              </p>
            )}
            {item.notes && (
              <p className="text-[10px] text-amber-300 italic">Nota: {item.notes}</p>
            )}
          </div>
        ))}
      </div>

      {/* Total & Action */}
      <div className="pt-2 border-t border-neutral-800 flex items-center justify-between gap-2">
        <span className="font-black text-sm text-white">
          {formatCurrency(order.total)}
        </span>

        <button
          type="button"
          onClick={onNextStatus}
          className="px-3 py-1.5 rounded-lg bg-[#FF3823] hover:bg-[#E02814] text-white text-xs font-bold transition-colors cursor-pointer"
        >
          {nextActionLabel}
        </button>
      </div>
    </div>
  );
}
