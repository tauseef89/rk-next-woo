"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

import type { CartItem, CartTotals } from "@/lib/woocommerce.d";

const CART_STORAGE_KEY = "woo-cart";

export type CartExchangeCategory =
  | "ac"
  | "washing_machine"
  | "refrigerator"
  | "deep_freezer"
  | "microwave"
  | "geyser"
  | "stabilizer"
  | "water_dispenser"
  | "water_ro"
  | "chimney";

export type CartWarrantyCategory =
  | "ac"
  | "tv"
  | "refrigerator"
  | "washing-machine"
  | "home-entertainment"
  | "microwave"
  | "air-cooler";

export type CartExchange = {
  category: CartExchangeCategory;
  brand: string;
  type: string;
  capacity: string;
  age: string;
  pincode: string;
  workingCondition: string;
  bodyCondition: string;
  accessoriesAvailable: string;
  exchangeValue: number;
  totalExchangeDiscount: number;
  finalPrice: number;
  quoteNote?: string;
};

export type CartExtendedWarranty = {
  title: string;
  price: number;

  // New slab-based warranty fields
  category?: CartWarrantyCategory;
  planYears?: 1 | 2 | 3 | 4;

  // Supports old items already stored in localStorage
  percentage?: number;
};

export type AppCartItem = CartItem & {
  originalPrice?: string | number;

  exchangeApplied?: boolean;
  exchange?: CartExchange | null;

  extendedWarrantyApplied?: boolean;
  extendedWarranty?: CartExtendedWarranty | null;
};

type AppCart = {
  items: AppCartItem[];
  totals: CartTotals;
};

interface CartContextType {
  cart: AppCart;
  isOpen: boolean;
  isLoading: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: AppCartItem) => Promise<void>;
  removeItem: (
    productId: number,
    variationId?: number,
    cartLineKey?: string
  ) => void;
  updateQuantity: (
    productId: number,
    quantity: number,
    variationId?: number,
    cartLineKey?: string
  ) => void;
  clearCart: () => void;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function parseCartPrice(price: string | number | undefined | null) {
  if (!price) return 0;

  if (typeof price === "number") {
    return price;
  }

  return Number(price.replace(/[^0-9.]/g, "")) || 0;
}

function calculateTotals(items: AppCartItem[]): CartTotals {
  const subtotal = items.reduce((total, item) => {
    const unitPrice = parseCartPrice(item.price);

    return total + unitPrice * item.quantity;
  }, 0);

  const itemCount = items.reduce((total, item) => {
    return total + item.quantity;
  }, 0);

  return {
    subtotal: subtotal.toFixed(2),
    shipping: "0.00",
    tax: "0.00",
    total: subtotal.toFixed(2),
    itemCount,
  };
}

/*
  Use this same exported function in:
  - cart page
  - cart drawer
  - checkout page
  - add-to-cart button

  Do not create separate versions of this function in other files.
*/
export function getCartLineKey(item: AppCartItem): string {
  const exchangeKey =
    item.exchangeApplied && item.exchange
      ? [
          "with-exchange",
          item.exchange.category,
          item.exchange.brand,
          item.exchange.type,
          item.exchange.capacity,
          item.exchange.age,
          item.exchange.pincode,
          item.exchange.exchangeValue,
          item.exchange.finalPrice,
        ].join("-")
      : "without-exchange";

  const warrantyKey =
    item.extendedWarrantyApplied && item.extendedWarranty
      ? [
          "with-warranty",
          item.extendedWarranty.category || "unknown-category",
          item.extendedWarranty.planYears ||
            item.extendedWarranty.title ||
            "unknown-plan",
          item.extendedWarranty.price,
        ].join("-")
      : "without-warranty";

  return `${item.productId}-${
    item.variationId || "base"
  }-${exchangeKey}-${warrantyKey}`;
}

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [cart, setCart] = useState<AppCart>({
    items: [],
    totals: calculateTotals([]),
  });

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);

      if (storedCart) {
        const savedItems = JSON.parse(storedCart) as AppCartItem[];

        setCart({
          items: savedItems,
          totals: calculateTotals(savedItems),
        });
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error);

      localStorage.removeItem(CART_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;

    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart.items));
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error);
    }
  }, [cart.items, isLoading]);

  const openCart = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleCart = useCallback(() => {
    setIsOpen((previous) => !previous);
  }, []);

  const addItem = useCallback(async (newItem: AppCartItem) => {
    setCart((previousCart) => {
      const newItemKey = getCartLineKey(newItem);

      const existingItemIndex = previousCart.items.findIndex(
        (item) => getCartLineKey(item) === newItemKey
      );

      let newItems: AppCartItem[];

      if (existingItemIndex >= 0) {
        newItems = previousCart.items.map((item, index) => {
          if (index !== existingItemIndex) {
            return item;
          }

          return {
            ...item,
            quantity: item.quantity + newItem.quantity,
          };
        });
      } else {
        newItems = [...previousCart.items, newItem];
      }

      return {
        items: newItems,
        totals: calculateTotals(newItems),
      };
    });

    setIsOpen(true);
  }, []);

  const removeItem = useCallback(
    (productId: number, variationId?: number, cartLineKey?: string) => {
      setCart((previousCart) => {
        const newItems = previousCart.items.filter((item) => {
          if (cartLineKey) {
            return getCartLineKey(item) !== cartLineKey;
          }

          return !(
            item.productId === productId &&
            item.variationId === variationId
          );
        });

        return {
          items: newItems,
          totals: calculateTotals(newItems),
        };
      });
    },
    []
  );

  const updateQuantity = useCallback(
    (
      productId: number,
      quantity: number,
      variationId?: number,
      cartLineKey?: string
    ) => {
      if (quantity <= 0) {
        removeItem(productId, variationId, cartLineKey);
        return;
      }

      setCart((previousCart) => {
        const newItems = previousCart.items.map((item) => {
          const isTargetItem = cartLineKey
            ? getCartLineKey(item) === cartLineKey
            : item.productId === productId &&
              item.variationId === variationId;

          if (!isTargetItem) {
            return item;
          }

          return {
            ...item,
            quantity,
          };
        });

        return {
          items: newItems,
          totals: calculateTotals(newItems),
        };
      });
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setCart({
      items: [],
      totals: calculateTotals([]),
    });

    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const getItemCount = useCallback(() => {
    return cart.totals.itemCount;
  }, [cart.totals.itemCount]);

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        isLoading,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}