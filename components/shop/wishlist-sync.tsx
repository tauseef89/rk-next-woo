"use client";

import { useWishlistStore } from "@/store/useWishlistStore";
import { useEffect } from "react";

export function WishlistSync({ user }: { user: any }) {
  const { items, setItems } = useWishlistStore();

  useEffect(() => {
    // Only sync if user is logged in and we have local items
    if (user?.id && items.length > 0) {
      const syncData = async () => {
        try {
          await fetch("/api/wishlist/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.id,
              productIds: items.map((i) => i.productId),
            }),
          });
          console.log("Wishlist synced to account");
        } catch (err) {
          console.error("Sync failed", err);
        }
      };

      syncData();
    }
    
    // Optional: If user logs in but local wishlist is empty, 
    // fetch their saved wishlist FROM WordPress and update Zustand
    if (user?.id && items.length === 0) {
       const savedMeta = user.meta_data?.find((m: any) => m.key === "saved_wishlist");
       if (savedMeta?.value) {
         const remoteIds = JSON.parse(savedMeta.value);
         // Map to the structure your store expects
         setItems(remoteIds.map((id: number) => ({ product_id: id })));
       }
    }
  }, [user?.id]); // Runs when the user ID becomes available (login)

  return null; // This is a logic-only component
}
