"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";

import { useCart } from "./cart-provider";
import { formatPrice } from "@/lib/woocommerce";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

function getCartLineKey(item: any) {
  const exchangeKey =
    item.exchangeApplied && item.exchange
      ? [
          "with-exchange",
          item.exchange.category,
          item.exchange.brand,
          item.exchange.type,
          item.exchange.capacity,
          item.exchange.age,
          item.exchange.pincode,
          item.exchange.exchangeValue,
          item.exchange.finalPrice,
        ].join("-")
      : "without-exchange";

  const warrantyKey =
    item.extendedWarrantyApplied && item.extendedWarranty
      ? [
          "with-warranty",
          item.extendedWarranty.category || "unknown-category",
          item.extendedWarranty.planYears ||
            item.extendedWarranty.title ||
            "unknown-plan",
          item.extendedWarranty.price,
        ].join("-")
      : "without-warranty";

  return `${item.productId}-${
    item.variationId || "base"
  }-${exchangeKey}-${warrantyKey}`;
}

function parseCartPrice(price: string | number | undefined | null) {
  if (!price) return 0;

  if (typeof price === "number") {
    return price;
  }

  return Number(price.replace(/[^0-9.]/g, "")) || 0;
}

function getWarrantyPlanLabel(warranty: any) {
  if (!warranty) {
    return "Extended Warranty";
  }

  if (warranty.planYears) {
    return `${warranty.planYears} ${
      warranty.planYears === 1 ? "Year" : "Years"
    } Extended Warranty`;
  }

  return warranty.title || "Extended Warranty";
}

export function CartDrawer() {
  const {
    cart,
    isOpen,
    isLoading,
    openCart,
    closeCart,
    removeItem,
    updateQuantity,
    getItemCount,
  } = useCart();

  const itemCount = getItemCount();

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => (open ? openCart() : closeCart())}
    >
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />

          {itemCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          )}

          <span className="sr-only">Open cart</span>
        </Button>
      </SheetTrigger>

      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Your Cart ({itemCount})
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="animate-pulse text-muted-foreground">
              Loading...
            </div>
          </div>
        ) : cart.items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <ShoppingCart className="h-16 w-16 text-muted-foreground/50" />

            <p className="text-muted-foreground">Your cart is empty</p>

            <SheetClose asChild>
              <Button asChild>
                <Link href="/shop">Continue Shopping</Link>
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <ScrollArea className="-mx-6 flex-1 px-6">
              <div className="space-y-4 py-4">
                {cart.items.map((item: any) => {
                  const cartLineKey = getCartLineKey(item);

                  const itemPrice = parseCartPrice(item.price);
                  const lineTotal = itemPrice * item.quantity;

                  const warrantyPrice =
                    item.extendedWarrantyApplied && item.extendedWarranty
                      ? parseCartPrice(item.extendedWarranty.price)
                      : 0;

                  return (
                    <div key={cartLineKey} className="flex gap-4">
                      {/* Product Image */}
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="min-w-0 flex-1">
                        <h4 className="line-clamp-2 text-sm font-medium">
                          {item.name}
                        </h4>

                        {item.attributes && item.attributes.length > 0 && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {item.attributes
                              .map((attribute: any) => attribute.option)
                              .join(", ")}
                          </p>
                        )}

                        {/* Exchange Details */}
                        {item.exchangeApplied && item.exchange && (
                          <div className="mt-2 rounded-md bg-green-50 px-2 py-1 text-xs text-green-700">
                            <p className="font-semibold">With Exchange</p>

                            <p>
                              {item.exchange.brand} {item.exchange.type},{" "}
                              {item.exchange.capacity}
                            </p>

                            <p>
                              Exchange Value:{" "}
                              {formatPrice(
                                item.exchange.exchangeValue.toString()
                              )}
                            </p>
                          </div>
                        )}

                        {/* Extended Warranty Details */}
                        {item.extendedWarrantyApplied &&
                          item.extendedWarranty && (
                            <div className="mt-2 rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-700">
                              <p className="font-semibold">
                                {getWarrantyPlanLabel(item.extendedWarranty)}
                              </p>

                              {item.extendedWarranty.category && (
                                <p className="capitalize">
                                  Product Type:{" "}
                                  {item.extendedWarranty.category.replace(
                                    /-/g,
                                    " "
                                  )}
                                </p>
                              )}

                              <p>
                                Warranty Charge:{" "}
                                {formatPrice(warrantyPrice.toString())}
                              </p>
                            </div>
                          )}

                        <p className="mt-2 font-medium">
                          {formatPrice(item.price.toString())}
                        </p>

                        {item.exchangeApplied && item.originalPrice && (
                          <p className="text-xs text-muted-foreground">
                            Original Price:{" "}
                            <span className="line-through">
                              {formatPrice(item.originalPrice.toString())}
                            </span>
                          </p>
                        )}

                        {/* Quantity Controls */}
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex items-center rounded-md border">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity - 1,
                                  item.variationId,
                                  cartLineKey
                                )
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>

                            <span className="w-8 text-center text-sm">
                              {item.quantity}
                            </span>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity + 1,
                                  item.variationId,
                                  cartLineKey
                                )
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() =>
                              removeItem(
                                item.productId,
                                item.variationId,
                                cartLineKey
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Product Line Total */}
                      <div className="text-right">
                        <p className="font-medium">
                          {formatPrice(lineTotal.toString())}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(cart.totals.subtotal)}</span>
                </div>

                {parseFloat(cart.totals.shipping) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{formatPrice(cart.totals.shipping)}</span>
                  </div>
                )}

                {parseFloat(cart.totals.tax) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatPrice(cart.totals.tax)}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatPrice(cart.totals.total)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <SheetClose asChild>
                  <Button asChild className="w-full" size="lg">
                    <Link href="/checkout">Proceed to Checkout</Link>
                  </Button>
                </SheetClose>

                <SheetClose asChild>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/cart">View Cart</Link>
                  </Button>
                </SheetClose>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}