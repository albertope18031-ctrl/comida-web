"use client";

import { useState } from "react";
import Image from "next/image";
import { Flame, Check, Plus, Minus, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FLAVORS, DIPS, SIDES, DRINKS } from "@/lib/mock-data";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency, getSpiceLevelBadge } from "@/lib/utils";
import type { Product, Flavor, SelectedFlavor } from "@/types/shop";

interface CustomizerModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CustomizerModal({ product, isOpen, onClose }: CustomizerModalProps) {
  const { addItem } = useCartStore();

  const [selectedFlavors, setSelectedFlavors] = useState<SelectedFlavor[]>([]);
  const [selectedDips, setSelectedDips] = useState<
    { id: string; name: string; price: number; quantity: number }[]
  >([]);
  const [selectedSides, setSelectedSides] = useState<
    { id: string; name: string; price: number }[]
  >([]);
  const [selectedDrink, setSelectedDrink] = useState<
    { id: string; name: string; price: number } | undefined
  >(undefined);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const maxFlavors = product.maxFlavorsAllowed;

  // Toggle flavor selection
  const handleFlavorToggle = (flavor: Flavor) => {
    const isSelected = selectedFlavors.some((f) => f.flavorId === flavor.id);

    if (isSelected) {
      setSelectedFlavors(selectedFlavors.filter((f) => f.flavorId !== flavor.id));
    } else {
      if (selectedFlavors.length >= maxFlavors) {
        toast.warning(
          `Solo puedes elegir hasta ${maxFlavors} sabor${maxFlavors > 1 ? "es" : ""} para esta presentación.`
        );
        return;
      }
      setSelectedFlavors([
        ...selectedFlavors,
        {
          flavorId: flavor.id,
          flavorName: flavor.name,
          heatLevel: flavor.heatLevel,
        },
      ]);
    }
  };

  // Manage dip quantity
  const handleDipChange = (dipId: string, delta: number) => {
    const dipDef = DIPS.find((d) => d.id === dipId);
    if (!dipDef) return;

    const existingIndex = selectedDips.findIndex((d) => d.id === dipId);
    if (existingIndex > -1) {
      const newQty = selectedDips[existingIndex].quantity + delta;
      if (newQty <= 0) {
        setSelectedDips(selectedDips.filter((d) => d.id !== dipId));
      } else {
        const updated = [...selectedDips];
        updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
        setSelectedDips(updated);
      }
    } else if (delta > 0) {
      setSelectedDips([
        ...selectedDips,
        { id: dipDef.id, name: dipDef.name, price: dipDef.price, quantity: 1 },
      ]);
    }
  };

  // Toggle side
  const handleSideToggle = (sideId: string) => {
    const sideDef = SIDES.find((s) => s.id === sideId);
    if (!sideDef) return;

    const isSelected = selectedSides.some((s) => s.id === sideId);
    if (isSelected) {
      setSelectedSides(selectedSides.filter((s) => s.id !== sideId));
    } else {
      setSelectedSides([...selectedSides, { id: sideDef.id, name: sideDef.name, price: sideDef.price }]);
    }
  };

  // Calculate dynamic item total
  const dipsCost = selectedDips.reduce((sum, d) => sum + d.price * d.quantity, 0);
  const sidesCost = selectedSides.reduce((sum, s) => sum + s.price, 0);
  const drinkCost = selectedDrink ? selectedDrink.price : 0;
  const unitTotal = product.basePrice + dipsCost + sidesCost + drinkCost;
  const grandTotal = unitTotal * quantity;

  // Add to cart handler
  const handleAddToCart = () => {
    if (maxFlavors > 0 && selectedFlavors.length === 0) {
      toast.error(`Por favor selecciona al menos 1 sabor para tus ${product.name}`);
      return;
    }

    addItem({
      cartItemId: `${product.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      basePrice: product.basePrice,
      unitPrice: product.basePrice,
      quantity,
      piecesCount: product.piecesCount,
      imageUrl: product.imageUrl,
      selectedFlavors,
      selectedDips,
      selectedSides,
      selectedDrink,
      specialInstructions: specialInstructions.trim() || undefined,
    });

    toast.success(`¡${product.name} agregado a tu orden!`, {
      description: `${selectedFlavors.map((f) => f.flavorName).join(", ") || "Clásico"}`,
    });

    // Reset and close
    setSelectedFlavors([]);
    setSelectedDips([]);
    setSelectedSides([]);
    setSelectedDrink(undefined);
    setSpecialInstructions("");
    setQuantity(1);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl sm:max-h-[85vh] p-0 overflow-hidden flex flex-col">
        {/* Header with visual banner */}
        <div className="relative h-44 w-full bg-neutral-900 shrink-0">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <span className="text-xs uppercase font-bold text-[#FFC72C] tracking-wider">
              {product.category} {product.piecesCount ? `• ${product.piecesCount} Piezas` : ""}
            </span>
            <h2 className="text-2xl font-black">{product.name}</h2>
            <p className="text-xs text-neutral-300 line-clamp-1">{product.description}</p>
          </div>
        </div>

        {/* Scrollable Configuration Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-neutral-800">
          {/* Flavor Selection Section */}
          {maxFlavors > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-extrabold text-base flex items-center gap-1.5 text-neutral-900">
                    <Flame className="h-4 w-4 text-[#FFC72C]" />
                    Elige tus Sabores
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Selecciona hasta {maxFlavors} salsa{maxFlavors > 1 ? "s" : ""} ({selectedFlavors.length}/{maxFlavors} seleccionadas)
                  </p>
                </div>
                {selectedFlavors.length === 0 && (
                  <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Requerido
                  </span>
                )}
              </div>

              {/* Flavor Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {FLAVORS.map((flavor) => {
                  const isSelected = selectedFlavors.some((f) => f.flavorId === flavor.id);
                  const spiceBadge = getSpiceLevelBadge(flavor.heatLevel);

                  return (
                    <button
                      key={flavor.id}
                      type="button"
                      onClick={() => handleFlavorToggle(flavor)}
                      className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                        isSelected
                          ? "border-[#005A36] bg-emerald-50/60 ring-2 ring-[#005A36]/40 shadow-sm"
                          : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/70"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-sm text-neutral-900">
                            {flavor.name}
                          </span>
                          {flavor.badge && (
                            <span className="text-[10px] bg-[#FFC72C] text-neutral-950 font-extrabold px-1.5 py-0.2 rounded">
                              {flavor.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500 line-clamp-2">
                          {flavor.description}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${spiceBadge.bg} ${spiceBadge.color}`}
                          >
                            Picor: {flavor.heatLevel}/5 • {spiceBadge.label}
                          </span>
                          {flavor.isDryRub && (
                            <span className="text-[10px] text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded font-medium">
                              Sazonador seco
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Selection Checkbox Pill */}
                      <div
                        className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
                          isSelected
                            ? "bg-[#005A36] border-[#005A36] text-white"
                            : "border-neutral-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dips Add-on Section */}
          <div className="pt-2 border-t border-neutral-100">
            <h3 className="font-bold text-sm text-neutral-900 mb-1">
              Agrega Aderezos Artesanales (Opcional)
            </h3>
            <p className="text-xs text-neutral-500 mb-3">
              Nuestro famoso Ranch y Blue Cheese preparados frescos diariamente en cocina.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DIPS.map((dip) => {
                const selected = selectedDips.find((d) => d.id === dip.id);
                const count = selected?.quantity || 0;

                return (
                  <div
                    key={dip.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200 bg-white"
                  >
                    <div>
                      <p className="text-xs font-bold text-neutral-900">{dip.name}</p>
                      <p className="text-xs font-semibold text-emerald-800">
                        +{formatCurrency(dip.price)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDipChange(dip.id, -1)}
                        disabled={count === 0}
                        className="h-7 w-7 rounded border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 disabled:opacity-30 cursor-pointer"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{count}</span>
                      <button
                        type="button"
                        onClick={() => handleDipChange(dip.id, 1)}
                        className="h-7 w-7 rounded bg-[#005A36] text-white flex items-center justify-center hover:bg-[#004227] cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sides Section */}
          <div className="pt-2 border-t border-neutral-100">
            <h3 className="font-bold text-sm text-neutral-900 mb-1">
              Complementa tu Orden
            </h3>
            <p className="text-xs text-neutral-500 mb-3">
              Papas sazonadas icónicas de corte natural y veggie sticks frescos.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SIDES.map((side) => {
                const isSelected = selectedSides.some((s) => s.id === side.id);
                return (
                  <button
                    key={side.id}
                    type="button"
                    onClick={() => handleSideToggle(side.id)}
                    className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "border-[#005A36] bg-emerald-50/70 font-bold"
                        : "border-neutral-200 hover:bg-neutral-50"
                    }`}
                  >
                    <div>
                      <p className="text-xs text-neutral-900">{side.name}</p>
                      <p className="text-xs font-semibold text-emerald-800">
                        +{formatCurrency(side.price)}
                      </p>
                    </div>
                    <div
                      className={`h-4 w-4 rounded border flex items-center justify-center ${
                        isSelected ? "bg-[#005A36] border-[#005A36] text-white" : "border-neutral-300"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Beverage Section */}
          <div className="pt-2 border-t border-neutral-100">
            <h3 className="font-bold text-sm text-neutral-900 mb-1">
              Bebida Fría (Opcional)
            </h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {DRINKS.map((drink) => {
                const isSelected = selectedDrink?.id === drink.id;
                return (
                  <button
                    key={drink.id}
                    type="button"
                    onClick={() =>
                      setSelectedDrink(isSelected ? undefined : { id: drink.id, name: drink.name, price: drink.price })
                    }
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#005A36] text-white border-[#005A36] font-bold"
                        : "border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50"
                    }`}
                  >
                    {drink.name} (+{formatCurrency(drink.price)})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="pt-2 border-t border-neutral-100">
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Instrucciones especiales para cocina:
            </label>
            <input
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Ej. Alitas extra doradas, aderezo aparte..."
              className="w-full text-xs p-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#005A36]"
            />
          </div>
        </div>

        {/* Modal Footer with quantity & CTA */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 shrink-0 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-neutral-300 rounded-lg bg-white overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-10 w-9 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-extrabold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="h-10 w-9 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div>
              <p className="text-[10px] text-neutral-500 uppercase font-semibold">Total a pagar</p>
              <p className="text-lg font-black text-neutral-950">
                {formatCurrency(grandTotal)}
              </p>
            </div>
          </div>

          <Button
            variant="gold"
            size="lg"
            onClick={handleAddToCart}
            className="flex-1 max-w-xs shadow-md font-black"
          >
            Agregar al Carrito
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
