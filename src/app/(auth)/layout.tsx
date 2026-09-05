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
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#005A36] text-[#FFC72C] font-black text-2xl shadow-md group-hover:scale-105 transition-transform">
            W
          </div>
          <div className="text-left">
            <span className="text-2xl font-black tracking-wider uppercase text-neutral-900 font-mono block leading-none">
              WINGSTOP
            </span>
            <span className="text-xs font-bold tracking-widest text-[#005A36] uppercase">
              MÉXICO
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
