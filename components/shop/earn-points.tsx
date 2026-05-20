"use client";

import { Star, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Standard shadcn/ui components

interface EarnPointsProps {
  price: string;
  earnRate?: number; // e.g., 0.0075 (0.75%)
  redemptionValue?: number; // e.g., 0.75 (1 Point = ₹0.75)
  className?: string;
}

export function EarnPoints({ 
  price, 
  earnRate = 0.01, 
  redemptionValue = 1, 
  className 
}: EarnPointsProps) {
  const numericPrice = parseFloat(price.replace(/[^0-9.-]+/g, ""));
  const points = Math.floor(numericPrice * earnRate);
  const totalValue = (points * redemptionValue).toFixed(2);

  if (isNaN(points) || points <= 0) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn(
        "flex items-center justify-between max-w-fit px-3 py-2 rounded-lg border bg-green-50/50 border-green-100 text-green-700",
        className
      )}>
        <div className="flex items-center gap-2">
          <div className="bg-green-500 rounded-full p-1 shadow-sm">
            <Star className="w-3 h-3 text-white fill-current" />
          </div>
          <p className="text-sm font-semibold tracking-tight">
            Earn <span className="text-green-600">{points}</span> Points 
          </p>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <button className="text-orange-400 hover:text-orange-600 transition-colors">
              <HelpCircle className="w-4 h-4 ml-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-white border-green-100 text-slate-700 p-3 max-w-50 shadow-xl">
            <div className="space-y-1">
              <p className="font-bold text-xs uppercase text-green-600">Loyalty Rewards</p>
              <p className="text-xs leading-relaxed">
                You earn 1 points for every ₹100 spent. 
                <span className="block mt-1 font-medium text-slate-900">
                  Estimated value: ₹{totalValue}
                </span>
              </p>
              <p className="text-[10px] text-muted-foreground pt-1 border-t italic">
                *Redeemable on your next purchase
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
