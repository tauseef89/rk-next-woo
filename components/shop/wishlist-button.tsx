"use client";

import { useWishlistStore } from "@/store/useWishlistStore";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function WishlistToggle({ productId }: { productId: number }) {
  const { items, addItem, removeItem } = useWishlistStore();
  const [isSyncing, setIsSyncing] = useState(false); // Prevent double-clicks
  
  // Check if product is in the store
  const isFavorite = items.some((item) => item.productId === productId);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSyncing) return;
    setIsSyncing(true);

    try {
      if (isFavorite) {
        // 1. Remove from WordPress
        const res = await fetch("/api/wishlist", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, wishlistId: 0 }), // 0 targets default list
        });

        if (res.ok) {
          removeItem(productId);
        }
      } else {
        // 2. Add to WordPress
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, wishlistId: 0 }),
        });

        if (res.ok) {
          
          const data = await res.json();
          addItem({ 
            itemId: data.item_id || productId, 
            productId: productId 
          });
        }
      }
    } catch (error) {
      console.error("Wishlist sync error:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <button 
      onClick={handleToggle} 
      disabled={isSyncing}
      className={cn(
        "p-2 transition-all hover:scale-110 active:scale-95",
        isSyncing && "opacity-50 cursor-not-allowed"
      )}
    >
      <Heart 
        size={24} 
        className={cn(
          "transition-colors duration-300",
          isFavorite ? "fill-red-500 text-red-500" : "text-zinc-400 hover:text-zinc-600"
        )} 
      />
    </button>
  );
}
