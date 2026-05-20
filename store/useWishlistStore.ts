import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1. Define what an item looks like
interface WishlistItem {
  itemId: number;
  productId: number;
}

interface WishlistState {
  items: WishlistItem[];
  // 2. Update these types
  addItem: (item: WishlistItem) => void; 
  removeItem: (productId: number) => void;
  setItems: (apiData: any) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      items: [],

      // 3. Update addItem logic
      addItem: (item) => set((state) => ({ 
        items: [...state.items, item] 
      })),

      removeItem: (productId) => set((state) => ({
        items: state.items.filter((i) => i.productId !== productId),
      })),

      setItems: (apiData) => {
        // Handle YITH's nested data structure
        const wishlist = Array.isArray(apiData) ? apiData[0] : apiData;
        const mapped = wishlist?.items?.map((item: any) => ({
          itemId: item.item_id,
          productId: item.product_id
        })) || [];
        set({ items: mapped });
      },
    }),
    { name: 'wishlist-storage' }
  )
);
