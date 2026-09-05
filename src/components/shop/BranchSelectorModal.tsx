"use client";

import { useState } from "react";
import {
  MapPin,
  Truck,
  Store,
  Clock,
  Navigation,
  Check,
  Search,
  AlertCircle,
  Phone,
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  useOrderContextStore,
  type BranchInfo,
  type DeliveryAddressData,
} from "@/store/order-context-store";

const POPULAR_ZONES = [
  { name: "Roma Norte / Condesa", branchSlug: "roma-norte", zip: "06700" },
  { name: "Polanco / Anzures", branchSlug: "polanco", zip: "11560" },
  { name: "Del Valle / Narvarte", branchSlug: "insurgentes-sur", zip: "03100" },
  { name: "Ciudad Satélite / Naucalpan", branchSlug: "satelite", zip: "53100" },
];

export function BranchSelectorModal() {
  const {
    orderType,
    selectedBranch,
    deliveryAddress,
    isSelectorModalOpen,
    branches,
    setOrderType,
    setSelectedBranch,
    setDeliveryAddress,
    closeSelectorModal,
  } = useOrderContextStore();

  const [activeTab, setActiveTab] = useState<"delivery" | "pickup">(orderType);
  const [addressInput, setAddressInput] = useState(
    deliveryAddress?.fullAddress || ""
  );
  const [searchBranchQuery, setSearchBranchQuery] = useState("");
  const [tempSelectedBranch, setTempSelectedBranch] =
    useState<BranchInfo>(selectedBranch);
  const [isLocating, setIsLocating] = useState(false);

  // Filter branches by query
  const filteredBranches = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(searchBranchQuery.toLowerCase()) ||
      b.address.toLowerCase().includes(searchBranchQuery.toLowerCase()) ||
      b.city.toLowerCase().includes(searchBranchQuery.toLowerCase())
  );

  // Handle Geolocation
  const handleUseMyLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setIsLocating(false);
          const detectedAddress: DeliveryAddressData = {
            street: "Av. Álvaro Obregón",
            number: "151",
            colonia: "Roma Norte",
            zipCode: "06700",
            fullAddress: "Av. Álvaro Obregón 151, Roma Norte, Cuauhtémoc, CDMX",
          };
          setAddressInput(detectedAddress.fullAddress);
          const assigned = branches.find((b) => b.slug === "roma-norte") || branches[0];
          setTempSelectedBranch(assigned);
          toast.success("Ubicación detectada con éxito", {
            description: `Sucursal más cercana: ${assigned.name}`,
          });
        },
        () => {
          setIsLocating(false);
          toast.info("No se pudo obtener la geolocalización exacta. Puedes escribir tu colonia.");
        },
        { timeout: 5000 }
      );
    } else {
      setIsLocating(false);
      toast.error("Tu navegador no soporta geolocalización.");
    }
  };

  // Quick Zone selection
  const handleSelectZone = (zone: (typeof POPULAR_ZONES)[0]) => {
    const assigned = branches.find((b) => b.slug === zone.branchSlug) || branches[0];
    setTempSelectedBranch(assigned);
    const newAddress: DeliveryAddressData = {
      street: "Calle Principal",
      number: "S/N",
      colonia: zone.name,
      zipCode: zone.zip,
      fullAddress: `${zone.name}, CP ${zone.zip}, CDMX`,
    };
    setAddressInput(newAddress.fullAddress);
  };

  // Confirm Delivery
  const handleConfirmDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressInput.trim()) {
      toast.error("Por favor ingresa tu dirección o selecciona una zona de cobertura.");
      return;
    }

    const newAddress: DeliveryAddressData = {
      street: addressInput,
      number: "",
      colonia: "",
      zipCode: "",
      fullAddress: addressInput,
    };

    setOrderType("delivery");
    setSelectedBranch(tempSelectedBranch);
    setDeliveryAddress(newAddress);
    closeSelectorModal();

    toast.success("¡Modalidad de entrega guardada!", {
      description: `A Domicilio desde ${tempSelectedBranch.name} • Tiempo est: ${tempSelectedBranch.estimatedDeliveryMin} min`,
    });
  };

  // Confirm Pickup
  const handleConfirmPickup = (branch: BranchInfo) => {
    setOrderType("pickup");
    setSelectedBranch(branch);
    closeSelectorModal();

    toast.success("¡Sucursal para llevar seleccionada!", {
      description: `${branch.name} • Listo en aprox. ${branch.estimatedPickupMin} min`,
    });
  };

  return (
    <Dialog open={isSelectorModalOpen} onOpenChange={(open) => !open && closeSelectorModal()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden sm:rounded-2xl border-none shadow-2xl">
        {/* Modal Header */}
        <div className="bg-[#005A36] text-white p-6 pb-4">
          <DialogHeader className="text-left space-y-1">
            <span className="text-xs uppercase font-black tracking-widest text-[#FFC72C]">
              EXPERIENCIA WINGSTOP
            </span>
            <DialogTitle className="text-2xl font-black text-white">
              ¿Cómo deseas recibir tu orden?
            </DialogTitle>
            <DialogDescription className="text-xs text-emerald-100">
              Selecciona tu modalidad para mostrarte la disponibilidad de producto, salsas y tiempos en tiempo real.
            </DialogDescription>
          </DialogHeader>

          {/* Mode Switcher Tabs */}
          <div className="mt-4 grid grid-cols-2 gap-2 p-1 bg-emerald-950/70 rounded-xl border border-emerald-800">
            <button
              type="button"
              onClick={() => setActiveTab("delivery")}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-black transition-all cursor-pointer ${
                activeTab === "delivery"
                  ? "bg-[#FFC72C] text-neutral-950 shadow-md scale-[1.01]"
                  : "text-neutral-200 hover:text-white"
              }`}
            >
              <Truck className="h-4 w-4" />
              <span>A Domicilio (Delivery)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("pickup")}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-black transition-all cursor-pointer ${
                activeTab === "pickup"
                  ? "bg-[#FFC72C] text-neutral-950 shadow-md scale-[1.01]"
                  : "text-neutral-200 hover:text-white"
              }`}
            >
              <Store className="h-4 w-4" />
              <span>Para Llevar (Pick Up)</span>
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 bg-neutral-50 max-h-[68vh] overflow-y-auto">
          {activeTab === "delivery" ? (
            /* Tab: A Domicilio */
            <form onSubmit={handleConfirmDelivery} className="space-y-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-neutral-700 mb-1.5">
                  Ingresa tu Calle, Número y Colonia
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-700" />
                  <Input
                    required
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    placeholder="Ej. Álvaro Obregón 151, Roma Norte, CDMX"
                    className="pl-10 h-12 text-sm bg-white border-neutral-300 shadow-2xs font-medium"
                  />
                </div>
              </div>

              {/* Geolocation Button */}
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={isLocating}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#005A36] hover:underline cursor-pointer"
              >
                <Navigation className="h-3.5 w-3.5 text-emerald-700" />
                <span>{isLocating ? "Localizando dirección..." : "Usar mi ubicación actual"}</span>
              </button>

              {/* Quick Select Zones */}
              <div className="space-y-2 pt-2 border-t border-neutral-200">
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                  Zonas Frecuentes con Cobertura Exprés
                </span>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_ZONES.map((zone) => (
                    <button
                      key={zone.zip}
                      type="button"
                      onClick={() => handleSelectZone(zone)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-neutral-200 hover:border-[#005A36] text-xs font-bold text-neutral-800 transition-colors cursor-pointer shadow-2xs"
                    >
                      {zone.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assigned Branch Banner */}
              <div className="p-4 rounded-xl bg-white border border-emerald-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 uppercase flex items-center gap-1.5">
                    <Store className="h-3.5 w-3.5 text-[#005A36]" />
                    Sucursal asignada para envío:
                  </span>
                  <Badge className="bg-emerald-100 text-[#005A36] border border-emerald-300">
                    Abierta
                  </Badge>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-black text-sm text-neutral-900">
                      {tempSelectedBranch.name}
                    </h4>
                    <p className="text-xs text-neutral-500">{tempSelectedBranch.address}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-neutral-900 block">
                      {tempSelectedBranch.estimatedDeliveryMin} -{" "}
                      {tempSelectedBranch.estimatedDeliveryMin + 15} min
                    </span>
                    <span className="text-[11px] text-neutral-500">Envío $45.00 MXN</span>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="w-full font-black text-base shadow-md h-12"
              >
                Confirmar Dirección de Entrega
              </Button>
            </form>
          ) : (
            /* Tab: Para Llevar */
            <div className="space-y-4">
              {/* Branch Search Input */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  value={searchBranchQuery}
                  onChange={(e) => setSearchBranchQuery(e.target.value)}
                  placeholder="Buscar sucursal por colonia, calle o ciudad..."
                  className="pl-10 h-11 text-xs bg-white border-neutral-300"
                />
              </div>

              {/* Branch Cards List */}
              <div className="space-y-3">
                {filteredBranches.map((branch) => {
                  const isCurrent =
                    selectedBranch.id === branch.id && orderType === "pickup";

                  return (
                    <div
                      key={branch.id}
                      className={`p-4 rounded-xl border bg-white transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isCurrent
                          ? "border-[#005A36] ring-2 ring-[#005A36]/30 bg-emerald-50/40"
                          : "border-neutral-200 hover:border-neutral-300"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-sm text-neutral-900">
                            {branch.name}
                          </h4>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-[#005A36]">
                            Abierta
                          </span>
                        </div>

                        <p className="text-xs text-neutral-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-neutral-400 shrink-0" />
                          <span>{branch.address}</span>
                        </p>

                        <div className="flex items-center gap-4 text-[11px] text-neutral-600 pt-1 font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-[#005A36]" />
                            {branch.openingTime} - {branch.closingTime} hrs
                          </span>
                          {branch.distanceKm && (
                            <span className="text-emerald-800 font-bold">
                              • A {branch.distanceKm} km
                            </span>
                          )}
                          <span className="text-neutral-500">
                            • Listo en ~{branch.estimatedPickupMin} min
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isCurrent ? (
                          <div className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#005A36] text-white text-xs font-black">
                            <Check className="h-4 w-4 text-[#FFC72C]" />
                            <span>Seleccionada</span>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConfirmPickup(branch)}
                            className="font-bold text-xs hover:bg-[#005A36] hover:text-white"
                          >
                            Recoger Aquí
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
