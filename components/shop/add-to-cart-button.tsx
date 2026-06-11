"use client";

import { useState } from "react";
import { ShoppingCart, Plus, Minus, Loader2 } from "lucide-react";

import type { Product, ProductVariation } from "@/lib/woocommerce.d";
import type { AppliedApplianceExchange } from "@/components/shop/appliance-exchange-product";
import type { AppliedExtendedWarranty } from "@/components/shop/extended-warranty";

import { useCart } from "@/components/shop/cart-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  product: Product;
  variation?: ProductVariation | null;
  exchange?: AppliedApplianceExchange | null;
  extendedWarranty?: AppliedExtendedWarranty | null;
  className?: string;
  showQuantity?: boolean;
}

function parsePrice(price: string | number | undefined | null) {
  if (!price) return 0;
  if (typeof price === "number") return price;

  return Number(price.replace(/[^0-9.]/g, "")) || 0;
}

export function AddToCartButton({
  product,
  variation,
  exchange,
  extendedWarranty,
  className,
  showQuantity = true,
}: AddToCartButtonProps) {
  const { addItem } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // For variable products, require a variation
  const isVariable = product.type === "variable";
  const needsVariation = isVariable && !variation;

  // Check stock
  const checkableItem = variation || product;
  const inStock =
    checkableItem.stock_status === "instock" ||
    checkableItem.stock_status === "onbackorder";

  const maxQuantity = checkableItem.stock_quantity || 99;

  const originalPrice = variation?.price || product.price;
  const originalPriceNumber = parsePrice(originalPrice);

  // If exchange is selected, use exchange final price.
  // Otherwise, use normal product/variation price.
  const priceAfterExchange = exchange
    ? exchange.finalPrice
    : originalPriceNumber;

  // Extended warranty is 5% calculated on product page and passed here.
  const warrantyPrice = extendedWarranty?.price || 0;

  // Final cart price = normal/exchange price + warranty price
  const cartPrice = String(priceAfterExchange + warrantyPrice);

  const variationName = variation
    ? ` - ${variation.attributes.map((a) => a.option).join(", ")}`
    : "";

  const exchangeName = exchange ? " - With Exchange" : "";
  const warrantyName = extendedWarranty ? " - Extended Warranty" : "";

  const handleAddToCart = async () => {
    if (needsVariation || !inStock) return;

    setIsAdding(true);

    try {
      await addItem({
        productId: product.id,
        variationId: variation?.id,
        quantity,
        name: product.name + variationName + exchangeName + warrantyName,
        price: cartPrice,
        originalPrice,
        image: (variation?.image || product.images[0])?.src,
        attributes: variation?.attributes,

        // Exchange details
        exchangeApplied: Boolean(exchange),
        exchange: exchange
          ? {
              category: exchange.category,
              brand: exchange.brand,
              type: exchange.type,
              capacity: exchange.capacity,
              age: exchange.age,
              pincode: exchange.pincode,
              workingCondition: exchange.workingCondition,
              bodyCondition: exchange.bodyCondition,
              accessoriesAvailable: exchange.accessoriesAvailable,
              exchangeValue: exchange.exchangeValue,
              totalExchangeDiscount: exchange.totalExchangeDiscount,
              finalPrice: exchange.finalPrice,
            }
          : null,

        // Extended warranty details
        extendedWarrantyApplied: Boolean(extendedWarranty),
        extendedWarranty: extendedWarranty
          ? {
              title: extendedWarranty.title,
              percentage: extendedWarranty.percentage,
              price: extendedWarranty.price,
            }
          : null,
      });

      setQuantity(1);
    } finally {
      setIsAdding(false);
    }
  };

  const incrementQuantity = () => {
    if (quantity < maxQuantity) {
      setQuantity((q) => q + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  if (!inStock) {
    return (
      <Button disabled className={cn("w-full", className)}>
        Out of Stock
      </Button>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {showQuantity && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Quantity:</span>

          <div className="flex items-center border rounded-md">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={decrementQuantity}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>

            <span className="w-12 text-center font-medium">{quantity}</span>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={incrementQuantity}
              disabled={quantity >= maxQuantity}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Button
        onClick={handleAddToCart}
        disabled={needsVariation || isAdding}
        className="w-full"
        size="lg"
      >
        {isAdding ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : needsVariation ? (
          "Select options"
        ) : (
          <>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </>
        )}
      </Button>
    </div>
  );
}