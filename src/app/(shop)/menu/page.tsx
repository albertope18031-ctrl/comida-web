"use client";

import { useState } from "react";
import { Search, Flame, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/shop/ProductCard";
import { PRODUCTS } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";

const CATEGORIES = [
  { id: "all", label: "TODO EL MENÚ" },
  { id: "alitas", label: "ALITAS" },
  { id: "sandwiches", label: "HAMBURGUESAS" },
  { id: "boneless", label: "BONELESS" },
  { id: "sides", label: "PAPAS & ACOMPAÑAMIENTOS" },
  { id: "tenders", label: "CRISPY TENDERS" },
  { id: "combos", label: "COMBOS & PACKS" },
];

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" ||
      product.category === selectedCategory ||
      (selectedCategory === "sides" && product.category === "papas");
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-heading font-black uppercase tracking-wider text-[#FF3823]">
          <Flame className="h-4 w-4 fill-[#FF3823] text-[#FF3823]" />
          <span>Menú Oficial LOCO ROOSTER</span>
        </div>
        <h1 className="font-display text-3xl sm:text-5xl text-[#1C1917] uppercase tracking-tight">
          Nuestros Monchos y Especialidades
        </h1>
        <p className="text-sm font-sans font-medium text-[#1C1917]/70 max-w-2xl">
          Selecciona tu presentación preferida, elige tus salsas bravas y acompáñalo con papas sazonadas y aderezo ranch o queso cheddar caliente.
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
              className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs font-heading font-black transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-[#FF3823] text-white shadow-md scale-102"
                  : "bg-white text-[#1C1917] hover:bg-[#FFB703]/20 border-2 border-[#1C1917]/10"
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
            className="pl-10 h-11 text-xs bg-white border-2 border-[#1C1917]/15 rounded-xl font-sans"
          />
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-[#1C1917]/10 p-8 shadow-xs">
          <p className="text-base font-heading font-bold text-[#1C1917]">
            No encontramos monchos con esa búsqueda.
          </p>
          <p className="text-xs font-sans text-neutral-400 mt-1">
            Intenta buscando por &quot;alitas&quot;, &quot;hamburguesas&quot; o &quot;tenders&quot;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
