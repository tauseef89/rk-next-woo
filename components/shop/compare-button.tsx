'use client';

import { useCompareStore } from "@/store/useCompareStore";
import { useHasHydrated } from "@/hooks/useHasHydrated";
import { ArrowLeftRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

export default function CompareButton({ productId }: { productId: number }) {
  const { compareIds, addToCompare, removeFromCompare } = useCompareStore();
  const hydrated = useHasHydrated();

  if (!hydrated) return <div className="h-9 w-9" />;

  const isAdded = compareIds.includes(productId);

  const toggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdded) {
      removeFromCompare(productId);
    } else {
      if (compareIds.length >= 4) {
        alert("You can only compare up to 4 products.");
        return;
      }
      addToCompare(productId);
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={toggleCompare}
            className={cn(
              "flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-300 shadow-sm",
              isAdded 
                ? "bg-blue-600 border-blue-600 text-white cursor-pointer" 
                : "bg-white/90 border-gray-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 cursor-pointer"
            )}
            aria-label="Add to compare"
          >
            {isAdded ? (
              <Check className="w-4 h-4 stroke-[3px]" />
            ) : (
              <ArrowLeftRight className="w-4 h-4" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>{isAdded ? "Remove from compare" : "Add to compare"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
