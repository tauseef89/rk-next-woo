"use client";

import { useEffect } from "react";
import { useWishlistStore } from "@/store/useWishlistStore";

export function WishlistSyncLoader() {
  const syncFromServer = useWishlistStore((state) => state.syncFromServer);

  useEffect(() => {
    syncFromServer();
  }, [syncFromServer]);

  return null;
}