import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  Clock,
  Flame,
  ArrowUpRight,
  ChefHat,
  TrendingUp,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function AdminOverviewPage() {
  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Panel de Control General
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Métricas de ventas, tiempos de preparación y órdenes activas en tiempo real.
          </p>
        </div>

        <Button variant="gold" asChild>
          <Link href="/admin/orders" className="flex items-center gap-2 font-black">
            <ChefHat className="h-4 w-4" />
            <span>Abrir Monitor de Cocina (KDS)</span>
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase">
            <span>Ventas del Día</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {formatCurrency(24850)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
            <TrendingUp className="h-3 w-3" />
            <span>+14.2% vs. ayer</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase">
            <span>Órdenes Activas</span>
            <ShoppingBag className="h-4 w-4 text-[#FFB703]" />
          </div>
          <div className="text-2xl font-black text-white">18</div>
          <p className="text-[11px] text-neutral-400">7 en freidora, 11 en empaque</p>
        </div>

        <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase">
            <span>Tiempo Promedio KDS</span>
            <Clock className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">14.2 min</div>
          <p className="text-[11px] text-emerald-400 font-semibold">Dentro del objetivo (&lt;16m)</p>
        </div>

        <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase">
            <span>Sabor Más Vendido</span>
            <Flame className="h-4 w-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-white">Lemon Pepper</div>
          <p className="text-[11px] text-amber-400 font-semibold">34% del total de alitas</p>
        </div>
      </div>

      {/* Realtime Snapshot Table */}
      <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black uppercase text-white">
            Últimas Órdenes Registradas
          </h2>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>Ver todas</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 font-bold uppercase">
                <th className="py-3 px-2">Orden</th>
                <th className="py-3 px-2">Cliente</th>
                <th className="py-3 px-2">Detalle</th>
                <th className="py-3 px-2">Tipo</th>
                <th className="py-3 px-2">Total</th>
                <th className="py-3 px-2">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-neutral-300">
              <tr>
                <td className="py-3 px-2 font-mono font-bold text-white">#WS-81923</td>
                <td className="py-3 px-2">Fernanda Ruiz</td>
                <td className="py-3 px-2">15 Alitas (Mango Habanero, Lemon Pepper) + Ranch</td>
                <td className="py-3 px-2 font-bold text-emerald-400">Delivery</td>
                <td className="py-3 px-2 font-bold text-white">{formatCurrency(363)}</td>
                <td className="py-3 px-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    En Preparación
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-2 font-mono font-bold text-white">#WS-81922</td>
                <td className="py-3 px-2">Mateo Morales</td>
                <td className="py-3 px-2">Crew Pack 30 Pzas (Atomic, BBQ, Garlic Parm)</td>
                <td className="py-3 px-2 font-bold text-blue-400">Para Llevar</td>
                <td className="py-3 px-2 font-bold text-white">{formatCurrency(629)}</td>
                <td className="py-3 px-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Listo en Mostrador
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-2 font-mono font-bold text-white">#WS-81921</td>
                <td className="py-3 px-2">Andrea Saldaña</td>
                <td className="py-3 px-2">Boneless 10 Pzas (Original Hot) + Papas Sazonadas</td>
                <td className="py-3 px-2 font-bold text-emerald-400">Delivery</td>
                <td className="py-3 px-2 font-bold text-white">{formatCurrency(299)}</td>
                <td className="py-3 px-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    En Reparto
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
