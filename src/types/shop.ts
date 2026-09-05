import type { FulfillmentType, PaymentMethod } from "./database";

export type HeatLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface Flavor {
  id: string;
  name: string;
  slug: string;
  heatLevel: HeatLevel;
  description: string;
  isDryRub: boolean;
  badge?: string;
}

export interface DipOption {
  id: string;
  name: string;
  price: number;
}

export interface SideOption {
  id: string;
  name: string;
  price: number;
}

export interface DrinkOption {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  category: "alitas" | "boneless" | "tenders" | "combos" | "papas" | "bebidas" | "aderezos";
  piecesCount?: number;
  maxFlavorsAllowed: number;
  imageUrl: string;
  isCombo?: boolean;
  popular?: boolean;
}

export interface SelectedFlavor {
  flavorId: string;
  flavorName: string;
  heatLevel: HeatLevel;
}

export interface CartItem {
  cartItemId: string;
  productId: string;
  name: string;
  slug: string;
  basePrice: number;
  unitPrice: number;
  quantity: number;
  piecesCount?: number;
  imageUrl: string;
  selectedFlavors: SelectedFlavor[];
  selectedDips: { id: string; name: string; price: number; quantity: number }[];
  selectedSides: { id: string; name: string; price: number }[];
  selectedDrink?: { id: string; name: string; price: number };
  specialInstructions?: string;
}

export interface Branch {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  phone: string;
  estimatedDeliveryMin: number;
  isOpen: boolean;
}

export interface CheckoutCustomerData {
  fullName: string;
  phone: string;
  email: string;
  fulfillmentType: FulfillmentType;
  branchId: string;
  deliveryStreet?: string;
  deliveryNumber?: string;
  deliveryColonia?: string;
  deliveryZipCode?: string;
  deliveryReferences?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}
