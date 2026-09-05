"use client";

import { useState } from "react";
import { Store, MapPin, Phone, Clock, Power, Plus } from "lucide-react";
import { toast } from "sonner";
import { DEFAULT_BRANCHES } from "@/store/branch-store";
import { Button } from "@/components/ui/button";
import type { Branch } from "@/types/shop";

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState<Branch[]>(DEFAULT_BRANCHES);

  const toggleBranchStatus = (branchId: string) => {
    setBranches((prev) =>
      prev.map((b) => (b.id === branchId ? { ...b, isOpen: !b.isOpen } : b))
    );
    toast.success("Estado de sucursal actualizado");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Store className="h-7 w-7 text-amber-400" />
            <span>Gestión de Sucursales</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Administra los puntos de venta, disponibilidad de entrega y tiempos de preparación.
          </p>
        </div>

        <Button
          variant="gold"
          onClick={() => toast.info("Funcionalidad para añadir sucursales conectada con Supabase")}
          className="font-bold flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>Nueva Sucursal</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {branches.map((branch) => (
          <div
            key={branch.id}
            className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4 shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-black text-white">{branch.name}</h3>
                <p className="text-xs text-neutral-400 flex items-center gap-1.5 mt-1">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>{branch.address}</span>
                </p>
              </div>

              <span
                className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase border ${
                  branch.isOpen
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : "bg-red-500/20 text-red-300 border-red-500/30"
                }`}
              >
                {branch.isOpen ? "Operando" : "Cerrada"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-neutral-800">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-neutral-500">
                  Teléfono de Atención
                </span>
                <p className="font-semibold text-neutral-200 flex items-center gap-1">
                  <Phone className="h-3 w-3 text-neutral-400" />
                  {branch.phone}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-neutral-500">
                  Tiempo Estimado
                </span>
                <p className="font-semibold text-neutral-200 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-neutral-400" />
                  {branch.estimatedDeliveryMin} minutos
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-neutral-800">
              <button
                type="button"
                onClick={() => toggleBranchStatus(branch.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  branch.isOpen
                    ? "bg-red-950/60 text-red-300 hover:bg-red-900 border border-red-800/50"
                    : "bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900 border border-emerald-800/50"
                }`}
              >
                <Power className="h-3.5 w-3.5" />
                <span>{branch.isOpen ? "Pausar Pedidos" : "Reactivar Sucursal"}</span>
              </button>

              <span className="text-[11px] text-neutral-400">
                Ciudad: <strong className="text-white">{branch.city}</strong>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
