"use client";

import { Truck, Calendar, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeliveryInfoProps {
  price: string;
  freeShippingThreshold?: number; // e.g., 500
  className?: string;
}

export function DeliveryInfo({ 
  price, 
  freeShippingThreshold = 500, 
  className 
}: DeliveryInfoProps) {
  const numericPrice = parseFloat(price.replace(/[^0-9.-]+/g, ""));
  const isFreeShipping = numericPrice >= freeShippingThreshold;

  // Calculate Delivery Date (Standard 3-5 days)
  const getDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 4); // Estimated 4 days
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Free Delivery Status */}
      {/* <div className="flex items-center gap-3">
        <div className="bg-blue-100 p-2 rounded-full">
          <Truck className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-bold">
            {isFreeShipping ? (
              <span className="text-green-600 uppercase tracking-tight">Free Delivery</span>
            ) : (
              <span className="text-slate-700">Standard Delivery Charges Apply</span>
            )}
          </p>
          <p className="text-[12px] text-muted-foreground">
            {isFreeShipping 
              ? "No shipping cost for this order" 
              : `Free shipping on orders above ₹${freeShippingThreshold}`}
          </p>
        </div>
      </div> */}

      {/* Estimated Date */}
        <p className="text-sm font-medium text-slate-700">
            Estimated Delivery by <span className="font-bold">{getDeliveryDate()}</span>
          </p>
      {/* <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
        <div className="bg-purple-100 p-2 rounded-full">
          <Calendar className="w-4 h-4 text-purple-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700">
            Estimated Delivery by <span className="font-bold">{getDeliveryDate()}</span>
          </p>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Info className="w-3 h-3" /> 
            Subject to pincode serviceability
          </p>
        </div>
      </div> */}
    </div>
  );
}
