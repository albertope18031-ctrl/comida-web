"use client";

import { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Search,
  CheckCircle2,
  AlertTriangle,
  Building,
  Navigation,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  validateDeliveryCoverage,
  type Coordinates,
  type GeofenceResult,
} from "@/lib/delivery-zones";
import type { BranchInfo } from "@/store/order-context-store";

interface AddressData {
  street: string;
  number: string;
  colonia: string;
  zipCode: string;
  notes?: string;
  lat?: number;
  lng?: number;
  isCovered: boolean;
}

interface AddressAutocompleteProps {
  selectedBranch: BranchInfo;
  initialData?: Partial<AddressData>;
  onAddressChange: (data: AddressData) => void;
  errors?: {
    street?: string;
    zipCode?: string;
  };
}

// Curated Mexican sample addresses for instant testing and predictive fallback
const POPULAR_MEXICO_LOCATIONS = [
  {
    display: "Álvaro Obregón 151, Roma Norte, Cuauhtémoc, CDMX",
    street: "Álvaro Obregón",
    number: "151",
    colonia: "Roma Norte",
    zipCode: "06700",
    lat: 19.41824,
    lng: -99.16132,
  },
  {
    display: "Av. Homero 1425, Polanco, Miguel Hidalgo, CDMX",
    street: "Av. Homero",
    number: "1425",
    colonia: "Polanco",
    zipCode: "11560",
    lat: 19.43615,
    lng: -99.1983,
  },
  {
    display: "Av. Michoacán 72, Condesa, Cuauhtémoc, CDMX",
    street: "Av. Michoacán",
    number: "72",
    colonia: "Condesa",
    zipCode: "06140",
    lat: 19.41168,
    lng: -99.17385,
  },
  {
    display: "Insurgentes Sur 1602, Crédito Constructor, Benito Juárez, CDMX",
    street: "Insurgentes Sur",
    number: "1602",
    colonia: "Crédito Constructor",
    zipCode: "03940",
    lat: 19.3638,
    lng: -99.1825,
  },
  {
    display: "Carretera México-Toluca 3800, Cuajimalpa (Fuera de radio Roma)",
    street: "Carretera México-Toluca",
    number: "3800",
    colonia: "Lomas de Santa Fe",
    zipCode: "05348",
    lat: 19.3582,
    lng: -99.2789,
  },
];

export function AddressAutocomplete({
  selectedBranch,
  initialData,
  onAddressChange,
  errors,
}: AddressAutocompleteProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Form fields state
  const [street, setStreet] = useState(initialData?.street || "");
  const [number, setNumber] = useState(initialData?.number || "");
  const [colonia, setColonia] = useState(initialData?.colonia || "");
  const [zipCode, setZipCode] = useState(initialData?.zipCode || "");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [coords, setCoords] = useState<Coordinates | null>(
    initialData?.lat && initialData?.lng
      ? { lat: initialData.lat, lng: initialData.lng }
      : { lat: selectedBranch.latitude + 0.005, lng: selectedBranch.longitude + 0.005 }
  );

  const [geofence, setGeofence] = useState<GeofenceResult | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check geofence coverage whenever coords or selected branch changes
  useEffect(() => {
    if (coords) {
      const result = validateDeliveryCoverage(selectedBranch, coords);
      setGeofence(result);

      onAddressChange({
        street,
        number,
        colonia,
        zipCode,
        notes,
        lat: coords.lat,
        lng: coords.lng,
        isCovered: result.isCovered,
      });
    } else {
      setGeofence(null);
      onAddressChange({
        street,
        number,
        colonia,
        zipCode,
        notes,
        isCovered: true, // fallback if coords unknown
      });
    }
  }, [coords, street, number, colonia, zipCode, notes, selectedBranch]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter suggestion list
  const filteredSuggestions = searchQuery.trim()
    ? POPULAR_MEXICO_LOCATIONS.filter((item) =>
        item.display.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : POPULAR_MEXICO_LOCATIONS.slice(0, 3);

  const handleSelectSuggestion = (item: (typeof POPULAR_MEXICO_LOCATIONS)[0]) => {
    setStreet(item.street);
    setNumber(item.number);
    setColonia(item.colonia);
    setZipCode(item.zipCode);
    setCoords({ lat: item.lat, lng: item.lng });
    setSearchQuery(item.display);
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-4" ref={containerRef}>
      {/* Predictive Autocomplete Search Bar */}
      <div className="relative">
        <label className="block text-xs font-black uppercase tracking-wider text-neutral-700 mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5 text-emerald-700" />
            <span>Buscar Dirección o Colonia (México)</span>
          </span>
          <span className="text-[10px] text-neutral-400 font-medium lowercase">
            autocompletado predictivo
          </span>
        </label>

        <div className="relative">
          <Input
            type="text"
            placeholder="Escribe tu calle, número o colonia..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className="pl-9 pr-4 h-11 bg-white border-neutral-300 rounded-xl text-sm focus:border-[#005A36] focus:ring-[#005A36]"
          />
          <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-emerald-700 pointer-events-none" />
        </div>

        {/* Suggestion Dropdown */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 z-30 mt-1.5 bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
            <div className="p-2 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between text-[11px] font-bold text-neutral-500">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" />
                Sugerencias de entrega en México
              </span>
              <span>Selecciona para autollenar</span>
            </div>

            <div className="max-h-56 overflow-y-auto divide-y divide-neutral-100">
              {filteredSuggestions.length > 0 ? (
                filteredSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full text-left p-3 hover:bg-emerald-50/70 transition-colors flex items-start gap-2.5 cursor-pointer text-xs"
                  >
                    <Navigation className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-neutral-900">{item.display}</p>
                      <p className="text-[10px] text-neutral-500">
                        CP {item.zipCode} • {item.colonia}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-neutral-500">
                  Ingresa los detalles en los campos inferiores para continuar.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Geofencing Coverage Feedback Alert */}
      {geofence && (
        <div
          className={`p-3.5 rounded-xl border flex items-start gap-2.5 transition-all text-xs ${
            geofence.isCovered
              ? "bg-emerald-50/80 border-emerald-300 text-emerald-950"
              : "bg-red-50/90 border-red-300 text-red-950"
          }`}
        >
          {geofence.isCovered ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-black">
                {geofence.isCovered
                  ? "✓ En zona de cobertura oficial"
                  : "⚠️ Fuera de zona de entrega a domicilio"}
              </span>
              <Badge
                className={`text-[10px] py-0 px-1.5 ${
                  geofence.isCovered
                    ? "bg-emerald-200/60 text-emerald-900 border-emerald-300"
                    : "bg-red-200/60 text-red-900 border-red-300"
                }`}
              >
                a {geofence.distanceKm.toFixed(1)} km
              </Badge>
            </div>
            <p className="text-[11px] leading-relaxed opacity-90">
              {geofence.isCovered
                ? `Despachado desde ${selectedBranch.name} (radio máximo: ${selectedBranch.deliveryRadiusKm} km).`
                : geofence.message}
            </p>
          </div>
        </div>
      )}

      {/* Structured Address Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
        {/* Street */}
        <div className="sm:col-span-8">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
            Calle *
          </label>
          <Input
            type="text"
            placeholder="Ej. Álvaro Obregón"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            className={`bg-white border-neutral-300 rounded-xl text-sm h-10 ${
              errors?.street ? "border-red-500 focus:ring-red-500" : ""
            }`}
            required
          />
          {errors?.street && (
            <p className="text-[10px] text-red-600 font-bold mt-1">{errors.street}</p>
          )}
        </div>

        {/* Number */}
        <div className="sm:col-span-4">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
            No. Ext / Int *
          </label>
          <Input
            type="text"
            placeholder="Ej. 151, Depto 4B"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="bg-white border-neutral-300 rounded-xl text-sm h-10"
            required
          />
        </div>

        {/* Neighborhood (Colonia) */}
        <div className="sm:col-span-7">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
            Colonia / Fraccionamiento *
          </label>
          <Input
            type="text"
            placeholder="Ej. Roma Norte"
            value={colonia}
            onChange={(e) => setColonia(e.target.value)}
            className="bg-white border-neutral-300 rounded-xl text-sm h-10"
            required
          />
        </div>

        {/* Zip Code (CP) */}
        <div className="sm:col-span-5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
            Código Postal (5 Dígitos) *
          </label>
          <Input
            type="text"
            inputMode="numeric"
            maxLength={5}
            pattern="[0-9]{5}"
            placeholder="06700"
            autoComplete="postal-code"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value.replace(/[^0-9]/g, ""))}
            className={`bg-white border-neutral-300 rounded-xl text-sm h-10 font-mono ${
              errors?.zipCode ? "border-red-500 focus:ring-red-500" : ""
            }`}
            required
          />
          {errors?.zipCode && (
            <p className="text-[10px] text-red-600 font-bold mt-1">{errors.zipCode}</p>
          )}
        </div>

        {/* Delivery References */}
        <div className="sm:col-span-12">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
            Referencias para el Repartidor (Opcional)
          </label>
          <Input
            type="text"
            placeholder="Ej. Portón blanco, entrecalle Orizaba, no sirve el timbre..."
            maxLength={200}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-white border-neutral-300 rounded-xl text-xs h-10"
          />
        </div>
      </div>
    </div>
  );
}
