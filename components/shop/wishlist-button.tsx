"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlistStore } from "@/store/useWishlistStore";

export function WishlistToggle({ productId }: { productId: number }) {
  const {
    items,
    addItem,
    removeItem,
    getProductIds,
    syncToServer,
  } = useWishlistStore();

  const [isSyncing, setIsSyncing] = useState(false);

  const numericProductId = Number(productId);

  const isFavorite = items.some(
    (item) => Number(item.productId) === numericProductId
  );

  const handleToggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSyncing) return;

    if (!Number.isInteger(numericProductId) || numericProductId <= 0) {
      console.error("Invalid productId:", productId);
      return;
    }

    setIsSyncing(true);

    const currentWishlistIds = getProductIds();

    const updatedWishlistIds = isFavorite
      ? currentWishlistIds.filter((id) => Number(id) !== numericProductId)
      : Array.from(new Set([...currentWishlistIds, numericProductId]));

    try {
      // Optimistic UI update
      if (isFavorite) {
        removeItem(numericProductId);
      } else {
        addItem({
          itemId: numericProductId,
          productId: numericProductId,
        });
      }

      const result = await syncToServer(updatedWishlistIds);

      if (result.status === 401) {
        console.warn(
          "User not logged in. Wishlist saved locally as guest wishlist."
        );
        return;
      }

      if (!result.success) {
        // Rollback UI on server failure
        if (isFavorite) {
          addItem({
            itemId: numericProductId,
            productId: numericProductId,
          });
        } else {
          removeItem(numericProductId);
        }

        console.error("Wishlist server error:", result.message);
        return;
      }

      console.log("Wishlist saved:", result.wishlist);
    } catch (error) {
      console.error("Wishlist toggle error:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isSyncing}
      className={cn(
        "p-2 transition-all hover:scale-110 active:scale-95",
        isSyncing && "opacity-50 cursor-not-allowed"
      )}
      aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        size={24}
        className={cn(
          "transition-colors duration-300",
          isFavorite
            ? "fill-red-500 text-red-500"
            : "text-zinc-400 hover:text-zinc-600"
        )}
      />
    </button>
  );
}