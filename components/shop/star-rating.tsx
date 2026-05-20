// @/components/shop/star-rating.tsx
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: string | number;
  count?: number;
  size?: number;
  className?: string;
}

export function StarRating({ rating, count, size = 16, className }: StarRatingProps) {
  const numericRating = Math.round(parseFloat(rating.toString() || "0"));

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={size}
            className={cn(
              i < numericRating ? "fill-yellow-400 text-yellow-400" : "text-zinc-300"
            )}
          />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs text-zinc-400 ml-1">({count} reviews)</span>
      )}
    </div>
  );
}
