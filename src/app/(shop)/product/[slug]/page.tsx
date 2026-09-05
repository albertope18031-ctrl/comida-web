import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Flame,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Clock,
} from "lucide-react";
import { PRODUCTS, FLAVORS } from "@/lib/mock-data";
import { formatCurrency, getSpiceLevelBadge } from "@/lib/utils";
import { ProductPageClient } from "./ProductPageClient";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    return {
      title: "Producto no encontrado | Wingstop México",
    };
  }

  return {
    title: `${product.name} | Wingstop México`,
    description: product.description,
    openGraph: {
      title: `${product.name} | Wingstop México`,
      description: product.description,
      images: [{ url: product.imageUrl }],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-bold text-neutral-500">
        <Link href="/" className="hover:text-[#005A36] transition-colors">
          Inicio
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/menu" className="hover:text-[#005A36] transition-colors">
          Menú
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-neutral-900 truncate">{product.name}</span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Visual Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-4/3 w-full rounded-3xl overflow-hidden bg-neutral-900 shadow-xl border border-neutral-200">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {product.piecesCount && (
              <div className="absolute top-4 left-4 bg-[#005A36] text-white px-3 py-1 rounded-full text-xs font-black tracking-wider shadow-lg">
                {product.piecesCount} Piezas
              </div>
            )}
            {product.popular && (
              <div className="absolute top-4 right-4 bg-[#FFC72C] text-neutral-950 px-3 py-1 rounded-full text-xs font-black tracking-wider shadow-lg flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Popular
              </div>
            )}
          </div>

          {/* Value Props Box */}
          <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-2xs grid grid-cols-2 gap-4 text-xs">
            <div className="flex items-center gap-2 text-neutral-700">
              <ShieldCheck className="h-4 w-4 text-[#005A36] shrink-0" />
              <span>Pollo 100% fresco, nunca congelado</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-700">
              <Clock className="h-4 w-4 text-[#005A36] shrink-0" />
              <span>Cocinadas al momento de tu orden</span>
            </div>
          </div>
        </div>

        {/* Right: Product Info & Configuration Client */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <span className="text-xs uppercase font-black tracking-widest text-[#005A36]">
              {product.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-neutral-950 mt-1">
              {product.name}
            </h1>
            <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
              {product.description}
            </p>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-black text-neutral-950">
                {formatCurrency(product.basePrice)}
              </span>
              <span className="text-xs text-neutral-400 font-semibold">
                Precio base con aderezo incluido
              </span>
            </div>
          </div>

          {/* Interactive Client Configurator */}
          <ProductPageClient product={product} />
        </div>
      </div>
    </div>
  );
}
