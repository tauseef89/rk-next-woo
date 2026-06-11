"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface WishlistItem {
  itemId: number;
  productId: number;
}

interface WishlistState {
  items: WishlistItem[];

  addItem: (item: WishlistItem) => void;
  removeItem: (productId: number) => void;
  setItems: (apiData: any) => void;
  clearWishlist: () => void;
  getProductIds: () => number[];

  syncFromServer: () => Promise<void>;
  syncToServer: (wishlistIds?: number[]) => Promise<{
    success: boolean;
    status: number;
    wishlist: number[];
    message: string;
  }>;

  mergeGuestWishlistWithServer: () => Promise<void>;
}

function normalizeWishlist(apiData: any): WishlistItem[] {
  let wishlistIds: any[] = [];

  // Format: [101, 205] or ["101", "205"]
  if (Array.isArray(apiData)) {
    wishlistIds = apiData;
  }

  // Format: { wishlist: [101, 205] }
  else if (apiData?.wishlist && Array.isArray(apiData.wishlist)) {
    wishlistIds = apiData.wishlist;
  }

  // Old YITH-style response
  else {
    const wishlist = Array.isArray(apiData) ? apiData[0] : apiData;

    wishlistIds =
      wishlist?.items?.map((item: any) => item.product_id || item.item_id) || [];
  }

  const uniqueMap = new Map<number, WishlistItem>();

  wishlistIds.forEach((id: any) => {
    const productId = Number(id);

    if (Number.isInteger(productId) && productId > 0) {
      uniqueMap.set(productId, {
        itemId: productId,
        productId,
      });
    }
  });

  return Array.from(uniqueMap.values());
}

function readGuestWishlist(): number[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem("guest_wishlist");
    const parsed = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((id: unknown) => Number(id))
      .filter((id: number) => Number.isInteger(id) && id > 0);
  } catch {
    return [];
  }
}

function saveGuestWishlist(wishlistIds: number[]) {
  if (typeof window === "undefined") return;

  const cleanIds = Array.from(
    new Set(
      wishlistIds
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0)
    )
  );

  localStorage.setItem("guest_wishlist", JSON.stringify(cleanIds));
}

function clearGuestWishlist() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("guest_wishlist");
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const productId = Number(item.productId);

          if (!Number.isInteger(productId) || productId <= 0) {
            return state;
          }

          const exists = state.items.some(
            (i) => Number(i.productId) === productId
          );

          if (exists) {
            return state;
          }

          return {
            items: [
              ...state.items,
              {
                itemId: Number(item.itemId || productId),
                productId,
              },
            ],
          };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter(
            (i) => Number(i.productId) !== Number(productId)
          ),
        })),

      setItems: (apiData) => {
        set({
          items: normalizeWishlist(apiData),
        });
      },

      clearWishlist: () => {
        set({ items: [] });

        if (typeof window !== "undefined") {
          localStorage.removeItem("guest_wishlist");
        }
      },

      getProductIds: () => {
        return get()
          .items.map((item) => Number(item.productId))
          .filter((id) => Number.isInteger(id) && id > 0);
      },

      syncFromServer: async () => {
        try {
          const res = await fetch("/api/customer/wishlist", {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          });

          const data = await res.json().catch(() => null);

          if (res.ok && data?.success) {
            get().setItems(data.wishlist);
          } else if (res.status === 401) {
            const guestIds = readGuestWishlist();
            if (guestIds.length > 0) {
              get().setItems(guestIds);
            }
          }
        } catch (error) {
          console.error("Wishlist sync from server failed:", error);
        }
      },

      syncToServer: async (wishlistIds?: number[]) => {
        const ids = wishlistIds || get().getProductIds();

        const cleanIds = Array.from(
          new Set(
            ids
              .map((id) => Number(id))
              .filter((id) => Number.isInteger(id) && id > 0)
          )
        );

        try {
          const res = await fetch("/api/customer/wishlist", {
            method: "PUT",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              wishlist: cleanIds,
            }),
          });

          const data = await res.json().catch(() => null);

          if (res.ok && data?.success) {
            get().setItems(data.wishlist);
          }

          if (res.status === 401) {
            saveGuestWishlist(cleanIds);
          }

          return {
            success: Boolean(res.ok && data?.success),
            status: res.status,
            wishlist: Array.isArray(data?.wishlist) ? data.wishlist : cleanIds,
            message: data?.message || "",
          };
        } catch (error) {
          console.error("Wishlist sync to server failed:", error);
          saveGuestWishlist(cleanIds);

          return {
            success: false,
            status: 500,
            wishlist: cleanIds,
            message: "Wishlist sync failed.",
          };
        }
      },

      mergeGuestWishlistWithServer: async () => {
        const guestIds = readGuestWishlist();
        const localIds = get().getProductIds();

        let serverIds: number[] = [];

        try {
          const res = await fetch("/api/customer/wishlist", {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          });

          const data = await res.json().catch(() => null);

          if (res.ok && data?.success && Array.isArray(data.wishlist)) {
            serverIds = data.wishlist
              .map((id: unknown) => Number(id))
              .filter((id: number) => Number.isInteger(id) && id > 0);
          }
        } catch (error) {
          console.error("Could not read server wishlist before merge:", error);
        }

        const mergedIds = Array.from(
          new Set([...serverIds, ...guestIds, ...localIds])
        );

        if (mergedIds.length === 0) return;

        const result = await get().syncToServer(mergedIds);

        if (result.success) {
          clearGuestWishlist();
          get().setItems(result.wishlist);
        }
      },
    }),
    {
      name: "wishlist-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);