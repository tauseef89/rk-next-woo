"use client";

// Add ProductVariation to your import
import type { Product, ProductVariation } from "@/lib/woocommerce.d";
import { isProductInStock, getProductStockMessage } from "@/lib/woocommerce";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StockBadgeProps {
  // Allow both Product and Variation types
  product: Product | ProductVariation; 
  showQuantity?: boolean;
  className?: string;
}

export function StockBadge({
  product,
  showQuantity = false,
  className,
}: StockBadgeProps) {
  // These helper functions from your lib should handle both types 
  // as long as they only look at stock properties.
  const inStock = isProductInStock(product as Product);
  const message = getProductStockMessage(product as Product);

  const isLowStock =
    product.manage_stock &&
    product.stock_quantity !== null &&
    product.stock_quantity <= (product.low_stock_amount || 3) &&
    product.stock_quantity > 0;

  const isBackorder = product.stock_status === "onbackorder";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {inStock ? (
        <Badge
          variant={isLowStock ? "outline" : "secondary"}
          className={cn(
            isLowStock && "border-yellow-500 text-yellow-600 bg-yellow-50"
          )}
        >
          <span
            className={cn(
              "w-2 h-2 rounded-full mr-2 shadow-sm",
              isLowStock ? "bg-yellow-500 animate-pulse" : "bg-green-500"
            )}
          />
          {message}
          {showQuantity && product.stock_quantity && ` (${product.stock_quantity} left)`}
        </Badge>
      ) : isBackorder ? (
        <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50">
          <span className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
          {message}
        </Badge>
      ) : (
        <Badge variant="destructive">
          <span className="w-2 h-2 rounded-full bg-red-100 mr-2" />
          {message}
        </Badge>
      )}
    </div>
  );
}
