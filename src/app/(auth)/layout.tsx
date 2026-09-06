import Link from "next/link";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <Link href="/" className="inline-flex items-center group justify-center" aria-label="Loco Rooster - Inicio">
          <Image
            src="/images/loco%20rooster_sin_fondo.png"
            alt="Loco Rooster"
            width={641}
            height={707}
            priority={true}
            className="h-20 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
          />
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
