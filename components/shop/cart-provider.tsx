"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";

import type { CartItem, CartTotals } from "@/lib/woocommerce.d";

const CART_STORAGE_KEY = "woo-cart";

type CartExchange = {
  category: "ac" | "washing_machine" | "cooler" | "refrigerator";
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
};

type CartExtendedWarranty = {
  title: string;
  percentage: number;
  price: number;
};

type AppCartItem = CartItem & {
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
  if (typeof price === "number") return price;

  return Number(price.replace(/[^0-9.]/g, "")) || 0;
}

function calculateTotals(items: AppCartItem[]): CartTotals {
  const subtotal = items.reduce((sum, item) => {
    const price = parseCartPrice(item.price);
    return sum + price * item.quantity;
  }, 0);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    subtotal: subtotal.toFixed(2),
    shipping: "0.00",
    tax: "0.00",
    total: subtotal.toFixed(2),
    itemCount,
  };
}

function getCartLineKey(item: AppCartItem): string {
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
          item.extendedWarranty.title,
          item.extendedWarranty.percentage,
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

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);

      if (stored) {
        const items: AppCartItem[] = JSON.parse(stored);

        setCart({
          items,
          totals: calculateTotals(items),
        });
      }
    } catch (error) {
      console.error("Failed to load cart from storage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart.items));
      } catch (error) {
        console.error("Failed to save cart to storage:", error);
      }
    }
  }, [cart.items, isLoading]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  const addItem = useCallback(async (newItem: AppCartItem) => {
    setCart((prev) => {
      const newItemKey = getCartLineKey(newItem);

      const existingIndex = prev.items.findIndex((item) => {
        return getCartLineKey(item) === newItemKey;
      });

      let newItems: AppCartItem[];

      if (existingIndex >= 0) {
        newItems = prev.items.map((item, index) => {
          if (index === existingIndex) {
            return {
              ...item,
              quantity: item.quantity + newItem.quantity,
            };
          }

          return item;
        });
      } else {
        newItems = [...prev.items, newItem];
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
      setCart((prev) => {
        const newItems = prev.items.filter((item) => {
          if (cartLineKey) {
            return getCartLineKey(item) !== cartLineKey;
          }

          return !(
            item.productId === productId && item.variationId === variationId
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

      setCart((prev) => {
        const newItems = prev.items.map((item) => {
          const isSameItem = cartLineKey
            ? getCartLineKey(item) === cartLineKey
            : item.productId === productId && item.variationId === variationId;

          if (isSameItem) {
            return {
              ...item,
              quantity,
            };
          }

          return item;
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

  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}