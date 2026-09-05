import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem } from "@/types/shop";

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotalItemsCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      addItem: (newItem: CartItem) => {
        set((state) => {
          // Check if identical item (same product, identical flavors, dips) already exists
          const existingIndex = state.items.findIndex((item) => {
            if (item.productId !== newItem.productId) return false;
            const itemFlavors = item.selectedFlavors.map((f) => f.flavorId).sort().join(",");
            const newFlavors = newItem.selectedFlavors.map((f) => f.flavorId).sort().join(",");
            return itemFlavors === newFlavors;
          });

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + newItem.quantity,
            };
            return { items: updatedItems, isCartOpen: true };
          }

          return { items: [...state.items, newItem], isCartOpen: true };
        });
      },

      removeItem: (cartItemId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.cartItemId !== cartItemId),
        }));
      },

      updateQuantity: (cartItemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.cartItemId === cartItemId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getSubtotal: () => {
        const { items } = get();
        return items.reduce((acc, item) => {
          const dipsTotal = item.selectedDips.reduce(
            (dipSum, dip) => dipSum + dip.price * dip.quantity,
            0
          );
          const sidesTotal = item.selectedSides.reduce(
            (sideSum, side) => sideSum + side.price,
            0
          );
          const drinkTotal = item.selectedDrink ? item.selectedDrink.price : 0;
          const itemUnitTotal = item.unitPrice + dipsTotal + sidesTotal + drinkTotal;
          return acc + itemUnitTotal * item.quantity;
        }, 0);
      },

      getTotalItemsCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "wingstop-cart-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
