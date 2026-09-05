import {
  useOrderContextStore,
  RESTAURANT_BRANCHES,
  type BranchInfo,
} from "./order-context-store";
import type { FulfillmentType } from "@/types/database";

export const DEFAULT_BRANCHES = RESTAURANT_BRANCHES;

export interface Branch extends BranchInfo {}

/**
 * Re-export useOrderContextStore as useBranchStore for backwards compatibility.
 * Ensures a single source of truth across Header, CartDrawer, and Checkout.
 */
export const useBranchStore = useOrderContextStore;
