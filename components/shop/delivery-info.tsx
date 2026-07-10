"use client";

import { cn } from "@/lib/utils";

interface DeliveryInfoProps {
  // Kept so existing component usage does not break
  price?: string;
  freeShippingThreshold?: number;
  className?: string;
}

export function DeliveryInfo({ className }: DeliveryInfoProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-sm font-medium text-slate-700">
        Estimated Delivery in{" "}
        <span className="font-bold text-green-600">24–48 Hours</span>
      </p>

      <p className="text-[11px] text-muted-foreground">
        Subject to pincode serviceability.
      </p>
    </div>
  );
}