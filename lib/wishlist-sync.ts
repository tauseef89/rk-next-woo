import { useWishlistStore } from "@/store/useWishlistStore";


export const syncYithWishlist = async (token: string) => {
  try {
    // Fetch the wishlist from YITH API using the user's JWT token
    const res = await fetch('/api/wishlist', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      // Update Zustand with the items returned from YITH
      useWishlistStore.getState().setItems(data);
      console.log("YITH Wishlist synced successfully");
    }
  } catch (err) {
    console.error("Failed to sync YITH wishlist:", err);
  }
};
