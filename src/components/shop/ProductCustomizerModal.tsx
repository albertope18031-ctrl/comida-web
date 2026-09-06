"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Flame,
  Check,
  CheckCircle2,
  Plus,
  Minus,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  Divide,
  Info,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FLAVORS, DIPS, SIDES, DRINKS } from "@/lib/mock-data";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency, getSpiceLevelBadge } from "@/lib/utils";
import {
  getProductDefaultConfig,
  createFastTrackCartItem,
} from "@/lib/product-defaults";
import {
  productCustomizationSchema,
  generateCartItemHash,
  type FlavorSplit,
  type DipSelection,
  type SideSelection,
} from "@/lib/validations/product-customizer";
import type { Product, Flavor } from "@/types/shop";

interface ProductCustomizerModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductCustomizerModal({
  product,
  isOpen,
  onClose,
}: ProductCustomizerModalProps) {
  const { addItem, openCart } = useCartStore();

  const [selectedFlavors, setSelectedFlavors] = useState<FlavorSplit[]>([]);
  const [includedDip, setIncludedDip] = useState<string>("ranch");
  const [extraDips, setExtraDips] = useState<{ [dipId: string]: number }>({});
  const [selectedSides, setSelectedSides] = useState<SideSelection[]>([]);
  const [selectedDrink, setSelectedDrink] = useState<
    { id: string; name: string; price: number } | null
  >(null);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Initialize or reset state when product changes
  useEffect(() => {
    if (product) {
      if (product.piecesCount && product.piecesCount > 0) {
        // Default to Lemon Pepper with full pieces
        const defaultFlavor = FLAVORS[0];
        setSelectedFlavors([
          {
            flavorId: defaultFlavor.id,
            flavorName: defaultFlavor.name,
            heatLevel: defaultFlavor.heatLevel,
            pieces: product.piecesCount,
          },
        ]);
      } else {
        setSelectedFlavors([]);
      }
      setIncludedDip("ranch");
      setExtraDips({});
      setSelectedSides([]);
      setSelectedDrink(null);
      setSpecialInstructions("");
      setQuantity(1);
    }
  }, [product]);

  if (!product) return null;

  const piecesCount = product.piecesCount || 0;
  const maxFlavors = product.maxFlavorsAllowed || 1;

  // Calculate allocated pieces
  const assignedPieces = selectedFlavors.reduce((sum, f) => sum + f.pieces, 0);
  const remainingPieces = piecesCount - assignedPieces;
  const isPiecesBalanced = piecesCount === 0 || assignedPieces === piecesCount;

  // Split pieces evenly among selected flavors
  const handleSplitEvenly = () => {
    if (selectedFlavors.length === 0 || piecesCount === 0) return;

    const count = selectedFlavors.length;
    const basePerFlavor = Math.floor(piecesCount / count);
    const remainder = piecesCount % count;

    const updated = selectedFlavors.map((flavor, index) => ({
      ...flavor,
      pieces: basePerFlavor + (index < remainder ? 1 : 0),
    }));

    setSelectedFlavors(updated);
  };

  // Toggle flavor selection
  const handleFlavorToggle = (flavor: Flavor) => {
    const exists = selectedFlavors.find((f) => f.flavorId === flavor.id);

    if (exists) {
      // Remove flavor and give its pieces to the remaining first flavor (if any)
      const remainingFlavors = selectedFlavors.filter(
        (f) => f.flavorId !== flavor.id
      );
      if (remainingFlavors.length > 0 && piecesCount > 0) {
        remainingFlavors[0].pieces += exists.pieces;
      }
      setSelectedFlavors(remainingFlavors);
    } else {
      // Check max flavors constraint
      if (selectedFlavors.length >= maxFlavors) {
        toast.warning(
          `Este paquete permite hasta ${maxFlavors} salsa${
            maxFlavors > 1 ? "es" : ""
          }.`
        );
        return;
      }

      // Add new flavor: distribute pieces reasonably
      if (selectedFlavors.length === 0) {
        setSelectedFlavors([
          {
            flavorId: flavor.id,
            flavorName: flavor.name,
            heatLevel: flavor.heatLevel,
            pieces: piecesCount,
          },
        ]);
      } else {
        // Redistribute pieces evenly
        const nextList = [
          ...selectedFlavors,
          {
            flavorId: flavor.id,
            flavorName: flavor.name,
            heatLevel: flavor.heatLevel,
            pieces: 0,
          },
        ];
        const base = Math.floor(piecesCount / nextList.length);
        const rem = piecesCount % nextList.length;
        const redistributed = nextList.map((item, idx) => ({
          ...item,
          pieces: base + (idx < rem ? 1 : 0),
        }));
        setSelectedFlavors(redistributed);
      }

      // Auto-advance if product only allows 1 flavor
      if (maxFlavors === 1) {
        setTimeout(() => {
          const dipsSection = document.getElementById("customizer-section-dips");
          dipsSection?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 250);
      }
    }
  };

  // Adjust pieces manually per flavor
  const handlePieceStep = (flavorId: string, delta: number) => {
    const index = selectedFlavors.findIndex((f) => f.flavorId === flavorId);
    if (index === -1) return;

    const currentPieces = selectedFlavors[index].pieces;
    const newPieces = currentPieces + delta;

    if (newPieces < 1) return; // Each chosen flavor must have at least 1 piece
    if (delta > 0 && assignedPieces >= piecesCount) return; // Cannot exceed max total

    const updated = [...selectedFlavors];
    updated[index] = { ...updated[index], pieces: newPieces };
    setSelectedFlavors(updated);
  };

  // Toggle side
  const handleSideToggle = (side: (typeof SIDES)[0]) => {
    const exists = selectedSides.find((s) => s.sideId === side.id);
    if (exists) {
      setSelectedSides(selectedSides.filter((s) => s.sideId !== side.id));
    } else {
      setSelectedSides([
        ...selectedSides,
        { sideId: side.id, name: side.name, price: side.price },
      ]);
    }
  };

  // Update extra dips count
  const handleExtraDipChange = (dipId: string, delta: number) => {
    const current = extraDips[dipId] || 0;
    const next = Math.max(0, current + delta);
    setExtraDips({ ...extraDips, [dipId]: next });
  };

  // Build complete Dips array for validation and cart
  const allDipsPayload: DipSelection[] = useMemo(() => {
    const list: DipSelection[] = [];
    if (includedDip && includedDip !== "none") {
      const def = DIPS.find((d) => d.id === includedDip);
      if (def) {
        list.push({
          dipId: def.id,
          name: `${def.name} (Incluido)`,
          isIncluded: true,
          price: 0,
          quantity: 1,
        });
      }
    } else if (includedDip === "none") {
      list.push({
        dipId: "none",
        name: "Sin Aderezo",
        isIncluded: true,
        price: 0,
        quantity: 1,
      });
    }

    // Add extra purchased dips
    Object.entries(extraDips).forEach(([dipId, qty]) => {
      if (qty > 0) {
        const def = DIPS.find((d) => d.id === dipId);
        if (def) {
          list.push({
            dipId: def.id,
            name: def.name,
            isIncluded: false,
            price: def.price,
            quantity: qty,
          });
        }
      }
    });

    return list;
  }, [includedDip, extraDips]);

  // Pricing calculation
  const extraDipsTotal = Object.entries(extraDips).reduce((sum, [dipId, qty]) => {
    const def = DIPS.find((d) => d.id === dipId);
    return sum + (def ? def.price * qty : 0);
  }, 0);

  const sidesTotal = selectedSides.reduce((sum, s) => sum + s.price, 0);
  const drinkTotal = selectedDrink ? selectedDrink.price : 0;
  const unitPrice = product.basePrice + extraDipsTotal + sidesTotal + drinkTotal;
  const grandTotal = unitPrice * quantity;

  // Reactive validation using Zod
  const validationResult = useMemo(() => {
    return productCustomizationSchema.safeParse({
      productId: product.id,
      productName: product.name,
      basePrice: product.basePrice,
      piecesCount: product.piecesCount,
      maxFlavorsAllowed: product.maxFlavorsAllowed,
      quantity,
      flavors: selectedFlavors,
      dips: allDipsPayload,
      sides: selectedSides,
      specialInstructions,
    });
  }, [
    product,
    quantity,
    selectedFlavors,
    allDipsPayload,
    selectedSides,
    specialInstructions,
  ]);

  const isValid = validationResult.success;
  const firstError = !isValid
    ? validationResult.error.issues[0]?.message
    : null;

  const defaultConfig = getProductDefaultConfig(product);

  const handleFastTrackModalAdd = () => {
    if (!defaultConfig) return;

    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate?.(50);
      } catch {
        // Silently ignore
      }
    }

    const fastTrackItem = createFastTrackCartItem(product, defaultConfig);
    addItem(fastTrackItem);

    toast.success("¡Agregado con combinación clásica!", {
      description: `${product.name} (${defaultConfig.label}) en tu bolsa.`,
      action: {
        label: "Ver Bolsa",
        onClick: () => openCart(),
      },
    });

    onClose();
  };

  const handleSelectIncludedDip = (dipId: string) => {
    setIncludedDip(dipId);
    // Auto-advance after 250ms of visual feedback
    setTimeout(() => {
      const sidesSection = document.getElementById("customizer-section-sides");
      sidesSection?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 250);
  };

  const getButtonGuidance = () => {
    if (isValid) {
      return `Agregar a Mi Bolsa • ${formatCurrency(grandTotal)}`;
    }
    if (piecesCount > 0 && selectedFlavors.length === 0) {
      return "Falta elegir: Salsas";
    }
    if (piecesCount > 0 && assignedPieces !== piecesCount) {
      return remainingPieces > 0
        ? `Falta repartir: ${remainingPieces} pzas`
        : `Exceso de piezas (+${Math.abs(remainingPieces)})`;
    }
    return `Falta: ${firstError || "Completar selecciones"}`;
  };

  // Add to cart with deterministic hash
  const handleAddToCart = () => {
    if (!isValid) {
      toast.error(firstError || "Por favor revisa la configuración de tu producto.");
      return;
    }

    const deterministicHash = generateCartItemHash({
      productId: product.id,
      productName: product.name,
      basePrice: product.basePrice,
      piecesCount: product.piecesCount,
      maxFlavorsAllowed: product.maxFlavorsAllowed,
      flavors: selectedFlavors,
      dips: allDipsPayload,
      sides: selectedSides,
      specialInstructions,
    });

    // Map into CartItem for useCartStore
    addItem({
      cartItemId: deterministicHash,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      basePrice: product.basePrice,
      unitPrice,
      quantity,
      piecesCount: product.piecesCount || undefined,
      imageUrl: product.imageUrl,
      selectedFlavors: selectedFlavors.map((f) => ({
        flavorId: f.flavorId,
        flavorName: `${f.pieces}x ${f.flavorName}`,
        heatLevel: f.heatLevel as 0 | 1 | 2 | 3 | 4 | 5,
      })),
      selectedDips: allDipsPayload.map((d) => ({
        id: d.dipId,
        name: d.name,
        price: d.price,
        quantity: d.quantity,
      })),
      selectedSides: selectedSides.map((s) => ({
        id: s.sideId,
        name: s.name,
        price: s.price,
      })),
      selectedDrink: selectedDrink || undefined,
      specialInstructions: specialInstructions.trim() || undefined,
    });

    // High fidelity Loco Rooster Mexico Toast Notification
    toast.custom(
      (t) => (
        <div className="w-full sm:w-96 rounded-2xl bg-[#1C1917] text-white p-4 shadow-2xl border-2 border-[#FFB703] flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#FFB703] text-neutral-950 flex items-center justify-center font-black shrink-0">
              <ShoppingBag className="h-5 w-5 text-neutral-950" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-[#FFB703]">
                ¡AGREGADO A TU BOLSA!
              </p>
              <h5 className="font-extrabold text-sm leading-tight text-white">
                {quantity}x {product.name}
              </h5>
              <p className="text-[11px] text-neutral-300">
                {selectedFlavors.map((f) => `${f.pieces} ${f.flavorName}`).join(" • ")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              toast.dismiss(t);
              openCart();
            }}
            className="px-3 py-1.5 rounded-lg bg-[#FF3823] text-white font-black text-xs hover:bg-[#E02814] transition-colors cursor-pointer shrink-0 shadow-md"
          >
            Ver Bolsa
          </button>
        </div>
      ),
      { duration: 4500 }
    );

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl sm:max-h-[88vh] p-0 overflow-hidden flex flex-col sm:rounded-2xl border-none shadow-2xl">
        {/* Visual Banner */}
        <div className="relative h-44 sm:h-48 w-full bg-neutral-900 shrink-0">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover opacity-85"
            sizes="(max-width: 768px) 100vw, 672px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5 text-white">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-black text-[#FFB703] tracking-widest">
                {product.category}
              </span>
              {piecesCount > 0 && (
                <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[11px] font-extrabold text-white">
                  {piecesCount} Piezas
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black">{product.name}</h2>
            <p className="text-xs text-neutral-300 line-clamp-1">
              {product.description}
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-neutral-800 bg-white">
          {/* Fast-Track 1-Click Express Banner */}
          {defaultConfig && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-[#FFB703] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-amber-900 bg-[#FFB703]/30 px-2 py-0.5 rounded-md">
                  <Zap className="h-3 w-3 fill-[#FF3823] text-[#FF3823]" />
                  🚀 ¿Tienes prisa? Combinación favorita
                </span>
                <p className="text-xs font-bold text-neutral-900">
                  {defaultConfig.label}
                </p>
                <p className="text-[11px] text-neutral-500">
                  Salsas icónicas y aderezo artesanal seleccionados por los expertos.
                </p>
              </div>

              <Button
                type="button"
                variant="gold"
                size="sm"
                onClick={handleFastTrackModalAdd}
                className="font-black text-xs shrink-0 shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-102 transition-transform"
              >
                <Zap className="h-3.5 w-3.5 fill-current" />
                <span>Agregar clásica • {formatCurrency(product.basePrice)}</span>
              </Button>
            </div>
          )}

          {/* SECTION 1: PIECE SPLITTING & FLAVORS */}
          {piecesCount > 0 && (
            <div id="customizer-section-flavors" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-100">
                <div>
                  <h3 className="text-base font-black uppercase text-neutral-900 flex items-center gap-1.5">
                    <Flame className="h-4 w-4 text-[#FF3823]" />
                    <span>1. Elige y divide tus Salsas</span>
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Selecciona hasta {maxFlavors} sabores y reparte tus {piecesCount} piezas.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  {/* Dynamic remaining selection indicator */}
                  {selectedFlavors.length < maxFlavors ? (
                    <Badge className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold">
                      Selecciona {maxFlavors - selectedFlavors.length} más ({selectedFlavors.length}/{maxFlavors})
                    </Badge>
                  ) : (
                    <Badge className="bg-neutral-900 text-white border border-neutral-800 text-xs font-bold flex items-center gap-1">
                      <Check className="h-3 w-3 text-[#FFB703]" />
                      ¡Listo! ({selectedFlavors.length}/{maxFlavors})
                    </Badge>
                  )}

                  {selectedFlavors.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSplitEvenly}
                      className="text-xs font-bold border-neutral-400 text-neutral-800 hover:bg-neutral-100 cursor-pointer"
                    >
                      <Divide className="h-3.5 w-3.5 mr-1" />
                      Repartir parejo
                    </Button>
                  )}
                </div>
              </div>

              {/* Pieces Tracker Banner */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                  isPiecesBalanced
                    ? "bg-[#588157]/10 border-[#588157]/30 text-[#1C1917]"
                    : "bg-amber-50 border-amber-300 text-amber-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center font-black text-xs ${
                      isPiecesBalanced
                        ? "bg-[#588157] text-white"
                        : "bg-amber-500 text-white"
                    }`}
                  >
                    {isPiecesBalanced ? <Check className="h-4 w-4" /> : "!"}
                  </div>
                  <div>
                    <p className="text-xs font-extrabold">
                      {isPiecesBalanced
                        ? `¡Excelente! Las ${piecesCount} piezas están asignadas.`
                        : remainingPieces > 0
                        ? `Faltan ${remainingPieces} piezas por asignar a tus salsas.`
                        : `Te has pasado por ${Math.abs(remainingPieces)} piezas.`}
                    </p>
                    <p className="text-[11px] opacity-80">
                      Asignadas: {assignedPieces} de {piecesCount} piezas
                    </p>
                  </div>
                </div>

                {/* Mini Visual Progress */}
                <div className="w-24 h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      isPiecesBalanced ? "bg-[#588157]" : "bg-amber-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        (assignedPieces / piecesCount) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Selected Flavors with Piece Steppers */}
              {selectedFlavors.length > 0 && (
                <div className="space-y-2 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
                  <span className="text-[11px] font-black uppercase text-neutral-500 tracking-wider">
                    Salsas Elegidas ({selectedFlavors.length}/{maxFlavors}):
                  </span>
                  <div className="space-y-2">
                    {selectedFlavors.map((flavor) => {
                      const badge = getSpiceLevelBadge(flavor.heatLevel as 0 | 1 | 2 | 3 | 4 | 5);
                      return (
                        <div
                          key={flavor.flavorId}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-neutral-200 shadow-2xs"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-black px-1.5 py-0.5 rounded ${badge.bg} ${badge.color}`}
                            >
                              Nivel {flavor.heatLevel}
                            </span>
                            <span className="font-extrabold text-xs text-neutral-900">
                              {flavor.flavorName}
                            </span>
                          </div>

                          {/* Piece Allocation Stepper */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handlePieceStep(flavor.flavorId, -1)}
                              disabled={flavor.pieces <= 1}
                              className="h-7 w-7 rounded border border-neutral-300 flex items-center justify-center hover:bg-neutral-100 disabled:opacity-30 cursor-pointer"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="text-xs font-black min-w-[50px] text-center">
                              {flavor.pieces} pzas
                            </span>
                            <button
                              type="button"
                              onClick={() => handlePieceStep(flavor.flavorId, 1)}
                              disabled={assignedPieces >= piecesCount}
                              className="h-7 w-7 rounded bg-[#FF3823] text-white flex items-center justify-center hover:bg-[#E02814] disabled:opacity-40 cursor-pointer"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Grid of all Flavors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {FLAVORS.map((flavor) => {
                  const isSelected = selectedFlavors.some(
                     (f) => f.flavorId === flavor.id
                  );
                  const spiceBadge = getSpiceLevelBadge(flavor.heatLevel);

                  return (
                    <button
                      key={flavor.id}
                      type="button"
                      onClick={() => handleFlavorToggle(flavor)}
                      className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                        isSelected
                          ? "border-[#FF3823] bg-red-50/70 ring-2 ring-[#FF3823]/30"
                          : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-xs text-neutral-900">
                            {flavor.name}
                          </span>
                          {flavor.badge && (
                            <span className="text-[10px] bg-[#FFB703] text-neutral-950 font-black px-1.5 py-0.2 rounded">
                              {flavor.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500 line-clamp-1">
                          {flavor.description}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${spiceBadge.bg} ${spiceBadge.color}`}
                          >
                            Picor: {flavor.heatLevel}/5 • {spiceBadge.label}
                          </span>
                          {flavor.isDryRub && (
                            <span className="text-[10px] text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded font-medium">
                              Dry Rub
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
                          isSelected
                            ? "bg-[#FF3823] border-[#FF3823] text-white"
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

          {/* SECTION 2: DIPS (ADEREZOS) */}
          <div id="customizer-section-dips" className="pt-4 border-t border-neutral-200 space-y-3">
            <div>
              <h3 className="text-base font-black uppercase text-neutral-900 flex items-center justify-between">
                <span>2. Aderezo Incluido (Obligatorio)</span>
                <span className="text-[11px] text-[#588157] font-bold bg-[#588157]/10 px-2 py-0.5 rounded">
                  1 Incluido
                </span>
              </h3>
              <p className="text-xs text-neutral-500">
                Elige tu aderezo artesanal preparado diariamente en casa.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectIncludedDip("ranch")}
                className={`p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer ${
                  includedDip === "ranch"
                    ? "border-[#FF3823] bg-red-50/70 ring-2 ring-[#FF3823]/30 font-bold"
                    : "border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                <div>
                  <p className="text-xs font-black text-neutral-900">Ranch Casero</p>
                  <p className="text-[10px] text-[#588157] font-extrabold">Incluido</p>
                </div>
                {includedDip === "ranch" && <Check className="h-4 w-4 text-[#FF3823]" />}
              </button>

              <button
                type="button"
                onClick={() => handleSelectIncludedDip("blue-cheese")}
                className={`p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer ${
                  includedDip === "blue-cheese"
                    ? "border-[#FF3823] bg-red-50/70 ring-2 ring-[#FF3823]/30 font-bold"
                    : "border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                <div>
                  <p className="text-xs font-black text-neutral-900">Blue Cheese</p>
                  <p className="text-[10px] text-[#588157] font-extrabold">Incluido</p>
                </div>
                {includedDip === "blue-cheese" && <Check className="h-4 w-4 text-[#FF3823]" />}
              </button>

              <button
                type="button"
                onClick={() => handleSelectIncludedDip("none")}
                className={`p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer ${
                  includedDip === "none"
                    ? "border-neutral-700 bg-neutral-100 ring-2 ring-neutral-400 font-bold"
                    : "border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                <div>
                  <p className="text-xs font-black text-neutral-700">Sin Aderezo</p>
                  <p className="text-[10px] text-neutral-400">0 aderezos</p>
                </div>
                {includedDip === "none" && <Check className="h-4 w-4 text-neutral-700" />}
              </button>
            </div>

            {/* Extra Dips Adder */}
            <div className="pt-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-neutral-500 block mb-2">
                ¿Deseas agregar aderezos extra?
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DIPS.map((dip) => {
                  const qty = extraDips[dip.id] || 0;
                  return (
                    <div
                      key={dip.id}
                      className="p-2.5 rounded-lg border border-neutral-200 bg-white flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-neutral-900">{dip.name}</p>
                        <p className="text-xs font-bold text-emerald-800">
                          +{formatCurrency(dip.price)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleExtraDipChange(dip.id, -1)}
                          disabled={qty === 0}
                          className="h-6 w-6 rounded border border-neutral-300 flex items-center justify-center hover:bg-neutral-100 disabled:opacity-30 cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-black w-4 text-center">{qty}</span>
                        <button
                          type="button"
                          onClick={() => handleExtraDipChange(dip.id, 1)}
                          className="h-6 w-6 rounded bg-[#FF3823] text-white flex items-center justify-center hover:bg-[#E02814] cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 3: SIDES & COMPLEMENTS */}
          <div id="customizer-section-sides" className="pt-4 border-t border-neutral-200 space-y-3">
            <div>
              <h3 className="text-base font-black uppercase text-neutral-900">
                3. Acompañamientos & Extras
              </h3>
              <p className="text-xs text-neutral-500">
                Papas sazonadas icónicas o bastones frescos de apio y zanahoria.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SIDES.map((side) => {
                const isSelected = selectedSides.some((s) => s.sideId === side.id);
                return (
                  <button
                    key={side.id}
                    type="button"
                    onClick={() => handleSideToggle(side)}
                    className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "border-[#FF3823] bg-red-50/70 font-bold ring-2 ring-[#FF3823]/30"
                        : "border-neutral-200 hover:bg-neutral-50"
                    }`}
                  >
                    <div>
                      <p className="text-xs text-neutral-900">{side.name}</p>
                      <p className="text-xs font-bold text-[#FF3823]">
                        +{formatCurrency(side.price)}
                      </p>
                    </div>
                    <div
                      className={`h-4 w-4 rounded border flex items-center justify-center ${
                        isSelected
                          ? "bg-[#FF3823] border-[#FF3823] text-white"
                          : "border-neutral-300"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 4: INSTRUCTIONS */}
          <div id="customizer-section-instructions" className="pt-4 border-t border-neutral-200">
            <label className="block text-xs font-black uppercase tracking-wider text-neutral-700 mb-1">
              Instrucciones Especiales para Cocina (Opcional)
            </label>
            <input
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Ej. Alitas extra crujientes, salsa bien bañada..."
              maxLength={200}
              className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#FF3823] bg-neutral-50"
            />
          </div>
        </div>

        {/* Sticky Modal Footer with iOS Safe Area support */}
        <div className="p-4 sm:p-5 border-t border-neutral-200 bg-neutral-50 shrink-0 space-y-3 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
          {/* Validation Warning Alert if not valid */}
          {!isValid && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold animate-pulse">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
              <span>{firstError}</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 sm:gap-4">
            {/* Quantity Stepper */}
            <div className="flex items-center border border-neutral-300 rounded-xl bg-white overflow-hidden shadow-2xs shrink-0">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-11 w-10 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                aria-label="Disminuir cantidad"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-black">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="h-11 w-10 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                aria-label="Aumentar cantidad"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Total & Submit Button with Proactive Guidance */}
            <div className="flex-1 flex items-center justify-end gap-3">
              <Button
                variant={isValid ? "primary" : "outline"}
                size="lg"
                disabled={!isValid}
                onClick={handleAddToCart}
                className={`h-12 px-4 sm:px-6 font-black text-sm sm:text-base shadow-lg transition-all cursor-pointer ${
                  isValid
                    ? "bg-[#FF3823] hover:bg-[#E02814] text-white hover:scale-101"
                    : "border-amber-300 bg-amber-50 text-amber-900 opacity-90 cursor-not-allowed"
                }`}
              >
                <span>{getButtonGuidance()}</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
