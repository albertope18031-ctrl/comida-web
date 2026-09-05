"use client";

import { useState } from "react";
import { Search, Flame, Sparkles, Filter } from "lucide-react";
import { ProductCard } from "@/components/shop/ProductCard";
import { PRODUCTS } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";

const CATEGORIES = [
  { id: "all", label: "Todo el Menú" },
  { id: "alitas", label: "Alitas Tradicionales" },
  { id: "boneless", label: "Boneless" },
  { id: "tenders", label: "Crispy Tenders" },
  { id: "combos", label: "Combos & Packs" },
  { id: "papas", label: "Papas & Acompañamientos" },
];

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#005A36]">
          <Flame className="h-4 w-4 text-[#FFC72C]" />
          <span>Menú Oficial Wingstop México</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-neutral-950 uppercase tracking-tight">
          Nuestras Alitas y Especialidades
        </h1>
        <p className="text-sm text-neutral-500 max-w-2xl">
          Selecciona tu presentación preferida, elige tus salsas artesanales y acompáñalo con papas sazonadas y aderezo ranch hecho en casa.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-[#005A36] text-white shadow-sm"
                  : "bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o ingrediente..."
            className="pl-10 h-10 text-xs bg-white"
          />
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200 p-8">
          <p className="text-base font-bold text-neutral-700">
            No encontramos productos con esa búsqueda.
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            Intenta buscando por &quot;alitas&quot;, &quot;boneless&quot; o &quot;combo&quot;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
