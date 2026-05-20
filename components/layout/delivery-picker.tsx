"use client";

import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PincodeChecker } from "@/components/shop/pincode-checker"; // Reuse your existing component!

export function DeliveryPicker() {
  const [displayPincode, setDisplayPincode] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("user_pincode");
    
    // 1. Initial Load for display
    if (saved) {
      setDisplayPincode(saved);
    } else {
      // 2. AUTO-OPEN: If no pincode is saved, open the modal after 1.5 seconds
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }

    const updatePincode = () => setDisplayPincode(localStorage.getItem("user_pincode"));
    window.addEventListener("pincode-changed", updatePincode);
    return () => window.removeEventListener("pincode-changed", updatePincode);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center gap-2 text-[12px] group py-1 cursor-pointer hover:bg-slate-50 rounded-md px-2 transition-colors">
          <MapPin className="h-6 w-6 text-foreground group-hover:text-primary transition-colors" />
          <div className="text-left text-foreground leading-tight">
            <p className="text-muted-foreground">Deliver to: {displayPincode ? <span className="text-primary">{displayPincode}</span> : ""}</p>
            <p className="font-bold">
              {displayPincode ? <u>Change Location</u> : <u>Select Location</u>}
            </p>
          </div>
        </div>
      </DialogTrigger>
      
      <DialogContent 
      className="sm:max-w-106.25"
      onPointerDownOutside={(e) => !displayPincode && e.preventDefault()} // Block clicking outside to close
  onEscapeKeyDown={(e) => !displayPincode && e.preventDefault()}    // Block Escape key to close
      >
        {/* Hide the standard X close button if no pincode exists */}
  {!displayPincode && (
    <style>{`.fixed.right-4.top-4 { display: none; }`}</style>
  )}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Select Delivery Location
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Enter your pincode to check serviceability for <strong>Delhi, Punjab, Haryana, and UP</strong>.
          </p>
          {/* We pass a callback to close the modal after a successful check */}
          <PincodeChecker onShowSuccess={() => setTimeout(() => setIsOpen(false), 1500)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
