"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, ShoppingCart } from "lucide-react";
import { useCart } from "@/components/shop/cart-provider";
import { cn } from "@/lib/utils";

interface FeaturedAddToCartButtonProps {
  productId: number;
  name: string;
  price: string;
  image?: string;
  type?: string;
  stockStatus?: string;
  productLink?: string;
  className?: string;
  iconOnly?: boolean;
  iconSize?: number;
  label?: string;
}

export function FeaturedAddToCartButton({
  productId,
  name,
  price,
  image = "",
  type = "simple",
  stockStatus = "instock",
  productLink = "",
  className,
  iconOnly = false,
  iconSize = 16,
  label = "ADD TO CART",
}: FeaturedAddToCartButtonProps) {
  const router = useRouter();
  const { addItem } = useCart();

  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const isVariable = type === "variable";

  const inStock =
    stockStatus === "instock" ||
    stockStatus === "onbackorder" ||
    !stockStatus;

  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAdding) return;

    if (isVariable) {
      if (productLink) router.push(productLink);
      return;
    }

    if (!inStock) {
      console.warn("Product is out of stock");
      return;
    }

    if (!Number.isInteger(Number(productId)) || Number(productId) <= 0) {
      console.error("Invalid product ID:", productId);
      return;
    }

    try {
      setIsAdding(true);

      await Promise.resolve(
        addItem({
          productId: Number(productId),
          quantity: 1,
          name: name || "Product",
          price: String(price || "0"),
          image,
        })
      );

      setIsAdded(true);

      setTimeout(() => {
        setIsAdded(false);
      }, 1200);
    } catch (error) {
      console.error("Featured add to cart failed:", error);
    } finally {
      setIsAdding(false);
    }
  };

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isAdding || !inStock}
        className={cn(
          "h-9 w-9 flex items-center justify-center rounded-full bg-white shadow-md hover:bg-red-700 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        aria-label={
          isVariable ? "Select options" : isAdded ? "Added to cart" : "Add to cart"
        }
        title={isVariable ? "Select options" : "Add to cart"}
      >
        {isAdding ? (
          <Loader2 size={iconSize} className="animate-spin" />
        ) : isAdded ? (
          <Check size={iconSize} />
        ) : (
          <ShoppingCart size={iconSize} />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={isAdding || !inStock}
      className={cn(
        "flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      title={isVariable ? "Select options" : "Add to cart"}
    >
      {isAdding ? (
        <>
          <Loader2 size={iconSize} className="animate-spin" />
          ADDING...
        </>
      ) : isAdded ? (
        <>
          <Check size={iconSize} />
          ADDED
        </>
      ) : isVariable ? (
        "SELECT OPTIONS"
      ) : (
        <>
          <ShoppingCart size={iconSize} />
          {label}
        </>
      )}
    </button>
  );
}