"use client";

import { useEffect } from "react";
import { useCart } from "@/components/shop/cart-provider";

export default function SuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-600">
          Payment Successful
        </h1>

        <p className="mt-4">
          Thank you for your order.
        </p>
      </div>
    </div>
  );
}