import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { OrderType } from "@/types/database";

export interface BranchInfo {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  phone: string;
  latitude: number;
  longitude: number;
  deliveryRadiusKm: number;
  openingTime: string;
  closingTime: string;
  estimatedDeliveryMin: number;
  estimatedPickupMin: number;
  distanceKm?: number;
  isOpen: boolean;
}

export interface DeliveryAddressData {
  street: string;
  number: string;
  colonia: string;
  zipCode: string;
  fullAddress: string;
  references?: string;
  latitude?: number;
  longitude?: number;
}

export const RESTAURANT_BRANCHES: BranchInfo[] = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    name: "Loco Rooster Roma Norte",
    slug: "roma-norte",
    address: "Álvaro Obregón 151, Roma Norte, Cuauhtémoc, CDMX",
    city: "Ciudad de México",
    phone: "55 5584 9201",
    latitude: 19.41824,
    longitude: -99.16132,
    deliveryRadiusKm: 6.0,
    openingTime: "12:00",
    closingTime: "23:00",
    estimatedDeliveryMin: 35,
    estimatedPickupMin: 20,
    distanceKm: 1.4,
    isOpen: true,
  },
  {
    id: "a0000000-0000-0000-0000-000000000002",
    name: "Loco Rooster Polanco",
    slug: "polanco",
    address: "Av. Homero 1425, Polanco, Miguel Hidalgo, CDMX",
    city: "Ciudad de México",
    phone: "55 5280 4310",
    latitude: 19.43615,
    longitude: -99.1983,
    deliveryRadiusKm: 5.5,
    openingTime: "12:00",
    closingTime: "23:30",
    estimatedDeliveryMin: 40,
    estimatedPickupMin: 25,
    distanceKm: 4.8,
    isOpen: true,
  },
  {
    id: "a0000000-0000-0000-0000-000000000003",
    name: "Loco Rooster Insurgentes Sur",
    slug: "insurgentes-sur",
    address: "Av. Insurgentes Sur 1235, Del Valle, Benito Juárez, CDMX",
    city: "Ciudad de México",
    phone: "55 5598 7720",
    latitude: 19.38012,
    longitude: -99.17643,
    deliveryRadiusKm: 7.0,
    openingTime: "12:00",
    closingTime: "23:00",
    estimatedDeliveryMin: 30,
    estimatedPickupMin: 18,
    distanceKm: 3.2,
    isOpen: true,
  },
  {
    id: "a0000000-0000-0000-0000-000000000004",
    name: "Loco Rooster Ciudad Satélite",
    slug: "satelite",
    address: "Circuito Centro Comercial 2251, Naucalpan, Edo. Méx.",
    city: "Estado de México",
    phone: "55 5562 1084",
    latitude: 19.51341,
    longitude: -99.23412,
    deliveryRadiusKm: 8.0,
    openingTime: "11:30",
    closingTime: "22:30",
    estimatedDeliveryMin: 45,
    estimatedPickupMin: 25,
    distanceKm: 12.5,
    isOpen: true,
  },
];

interface OrderContextState {
  orderType: OrderType;
  fulfillmentType: OrderType;
  selectedBranch: BranchInfo;
  deliveryAddress: DeliveryAddressData | null;
  isSelectorModalOpen: boolean;
  branches: BranchInfo[];

  setOrderType: (type: OrderType) => void;
  setFulfillmentType: (type: OrderType) => void;
  setSelectedBranch: (branch: BranchInfo) => void;
  setDeliveryAddress: (address: DeliveryAddressData | null) => void;
  openSelectorModal: () => void;
  closeSelectorModal: () => void;
  toggleSelectorModal: () => void;
}

export const useOrderContextStore = create<OrderContextState>()(
  persist(
    (set) => ({
      orderType: "delivery",
      fulfillmentType: "delivery",
      selectedBranch: RESTAURANT_BRANCHES[0],
      deliveryAddress: {
        street: "Álvaro Obregón",
        number: "120",
        colonia: "Roma Norte",
        zipCode: "06700",
        fullAddress: "Álvaro Obregón 120, Roma Norte, Cuauhtémoc, CDMX",
      },
      isSelectorModalOpen: false,
      branches: RESTAURANT_BRANCHES,

      setOrderType: (type) => set({ orderType: type, fulfillmentType: type }),
      setFulfillmentType: (type) => set({ orderType: type, fulfillmentType: type }),
      setSelectedBranch: (branch) => set({ selectedBranch: branch }),
      setDeliveryAddress: (address) => set({ deliveryAddress: address }),
      openSelectorModal: () => set({ isSelectorModalOpen: true }),
      closeSelectorModal: () => set({ isSelectorModalOpen: false }),
      toggleSelectorModal: () =>
        set((state) => ({ isSelectorModalOpen: !state.isSelectorModalOpen })),
    }),
    {
      name: "loco-rooster-order-context",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        orderType: state.orderType,
        selectedBranch: state.selectedBranch,
        deliveryAddress: state.deliveryAddress,
      }),
    }
  )
);
