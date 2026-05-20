"use client";

import { useState, useEffect } from "react";
import { MapPin, CheckCircle2, XCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { checkPincodeServiceability } from "@/lib/woocommerce";

interface PincodeCheckerProps {
  onShowSuccess?: () => void; // Add this line to your interface
}

export function PincodeChecker({ onShowSuccess }: PincodeCheckerProps) {
  const [pincode, setPincode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "valid" | "invalid">("idle");
  const [savedPincode, setSavedPincode] = useState<string | null>(null);

  // Load saved pincode from localStorage on mount
  // Inside PincodeChecker component
useEffect(() => {
  const stored = localStorage.getItem("user_pincode");
  if (stored) {
    setSavedPincode(stored);
    setPincode(stored);
    // Optional: Re-validate on mount to ensure WordPress hasn't changed zones
    checkPincodeServiceability(stored).then((isAvailable) => {
      setStatus(isAvailable ? "valid" : "invalid");
      if (!isAvailable) {
        localStorage.removeItem("user_pincode");
        setSavedPincode(null);
      }
    });
  }
}, []);


  const handleCheck = async () => {
    const isAvailable = await checkPincodeServiceability(pincode);

    // Basic Indian Pincode Validation (6 digits, doesn't start with 0)
    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      setStatus("invalid");
      return;
    }

    setStatus("loading");
    
    try {
      // Calls your real WooCommerce Shipping API logic
      const isAvailable = await checkPincodeServiceability(pincode);
      
      if (isAvailable) {
        localStorage.setItem("user_pincode", pincode);
        // This "pokes" the header to update immediately
        window.dispatchEvent(new Event("pincode-changed"));
        // Call the closing function if it exists
        if (onShowSuccess) onShowSuccess();
        setSavedPincode(pincode);
        setStatus("valid");
      } else {
        setStatus("invalid");
      }
    } catch (error) {
      console.error("Pincode check failed:", error);
      setStatus("invalid");
    }
  };

  const handleClear = () => {
    localStorage.removeItem("user_pincode");
    setSavedPincode(null);
    setPincode("");
    setStatus("idle");
  };

  return (
    <div className="p-4 border rounded-xl bg-slate-50/50 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <MapPin className="w-4 h-4 text-primary" />
          {savedPincode ? (
            <span>Delivering to <span className="text-primary">{savedPincode}</span></span>
          ) : (
            "Check Delivery Availability"
          )}
        </div>
        {savedPincode && (
          <button 
            onClick={handleClear}
            className="text-[10px] uppercase font-bold text-primary hover:opacity-80 flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Change
          </button>
        )}
      </div>

      {!savedPincode && (
        <div className="flex gap-2">
          <Input 
            type="text"
            placeholder="Enter 6-digit Pincode" 
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="h-10 bg-white border-slate-200 focus:ring-primary"
            onKeyDown={(e) => e.key === "Enter" && handleCheck()}
          />
          <Button 
            onClick={handleCheck} 
            size="sm" 
            className="h-10 px-6"
            disabled={status === "loading" || pincode.length !== 6}
          >
            {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check"}
          </Button>
        </div>
      )}

      {status === "valid" && savedPincode && (
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <p className="text-[12px] text-green-700 font-medium">
            Great! We deliver to your location.
          </p>
        </div>
      )}

      {status === "invalid" && (
        <div className="flex items-center gap-2 animate-in shake">
          <XCircle className="w-4 h-4 text-red-500" />
          <p className="text-[12px] text-red-600 font-medium">
            Sorry, we don't service this pincode yet...
          </p>
        </div>
      )}
    </div>
  );
}
