import Link from "next/link";
import {
  LayoutDashboard,
  ClipboardList,
  Store,
  ArrowLeft,
  Flame,
  ChefHat,
  Bell,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-neutral-950 border-r border-neutral-800 flex flex-col shrink-0">
        {/* Brand */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FF3823] text-white font-black text-sm">
              LR
            </div>
            <div>
              <span className="font-display font-black text-white text-base tracking-wider block leading-none">
                LOCO ROOSTER
              </span>
              <span className="text-[10px] font-bold text-[#FFB703] tracking-wider uppercase font-heading">
                Panel Administrativo
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 text-sm font-semibold">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <LayoutDashboard className="h-4 w-4 text-[#FFB703]" />
            <span>Resumen General</span>
          </Link>

          <Link
            href="/admin/orders"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <ChefHat className="h-4 w-4 text-[#FF3823]" />
            <span>Monitor KDS / Órdenes</span>
          </Link>

          <Link
            href="/admin/branches"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <Store className="h-4 w-4 text-[#FFB703]" />
            <span>Gestión de Sucursales</span>
          </Link>
        </nav>

        {/* Footer / Back to Shop */}
        <div className="p-4 border-t border-neutral-800">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver a la Tienda</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-neutral-800 bg-neutral-950/50 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-neutral-400">
              Sistema Operativo en Vivo • Supabase Realtime Conectado
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              className="p-2 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white relative"
              aria-label="Notificaciones"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            </button>
            <div className="text-right">
              <p className="text-xs font-bold text-white">Gerente de Turno</p>
              <p className="text-[10px] text-neutral-400">Sucursal Roma Norte</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
