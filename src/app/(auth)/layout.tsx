import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-3 group justify-center">
          <div className="relative h-12 w-12 rounded-xl bg-[#1C1917] p-1 shadow-md group-hover:scale-105 transition-transform shrink-0 flex items-center justify-center border border-neutral-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/loco-rooster.png"
              alt="Loco Rooster Logo"
              className="h-10 w-10 object-contain"
            />
          </div>
          <div className="text-left">
            <span className="text-2xl font-black tracking-wider uppercase text-neutral-900 font-display block leading-none">
              LOCO ROOSTER
            </span>
            <span className="text-[10px] font-black tracking-widest text-[#FF3823] uppercase">
              MONCHOS DE VERDAD
            </span>
          </div>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-neutral-200">
          {children}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-neutral-500">
          <ShieldCheck className="h-4 w-4 text-emerald-700" />
          <span>Autenticación segura con Supabase Auth</span>
        </div>
      </div>
    </div>
  );
}
