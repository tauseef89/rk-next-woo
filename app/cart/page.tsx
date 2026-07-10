"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
} from "lucide-react";

import { useCart } from "@/components/shop/cart-provider";
import { formatPrice } from "@/lib/woocommerce";
import { Section, Container } from "@/components/craft";
import { Button } from "@/components/ui/button";
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

export default function CartPage() {
  const {
    cart,
    isLoading,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCart();

  if (isLoading) {
    return (
      <Section>
        <Container>
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse text-muted-foreground">
              Loading cart...
            </div>
          </div>
        </Container>
      </Section>
    );
  }

  if (cart.items.length === 0) {
    return (
      <Section>
        <Container>
          <div className="flex flex-col items-center justify-center space-y-6 py-12">
            <ShoppingCart className="h-24 w-24 text-muted-foreground/30" />

            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold">Your cart is empty</h1>

              <p className="text-muted-foreground">
                Looks like you haven&apos;t added anything to your cart yet.
              </p>
            </div>

            <Button asChild size="lg">
              <Link href="/shop">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Shopping Cart</h1>

            <Button variant="ghost" onClick={clearCart}>
              Clear Cart
            </Button>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="space-y-4 lg:col-span-2">
              {cart.items.map((item: any) => {
                const cartLineKey = getCartLineKey(item);
                const itemPrice = parseCartPrice(item.price);
                const lineTotal = itemPrice * item.quantity;

                return (
                  <div
                    key={cartLineKey}
                    className="flex gap-4 rounded-lg border p-4"
                  >
                    {/* Image */}
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium">{item.name}</h3>

                      {item.attributes && item.attributes.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          {item.attributes
                            .map((attribute: any) => attribute.option)
                            .join(", ")}
                        </p>
                      )}

                      {/* Exchange */}
                      {item.exchangeApplied && item.exchange && (
                        <div className="mt-2 rounded-md bg-green-50 px-2 py-1 text-xs text-green-700">
                          <p className="font-semibold">With Exchange</p>

                          <p>
                            {item.exchange.brand} {item.exchange.type},{" "}
                            {item.exchange.capacity}
                          </p>

                          <p>
                            Exchange Value:{" "}
                            {formatPrice(String(item.exchange.exchangeValue))}
                          </p>
                        </div>
                      )}

                      {/* Warranty */}
                      {item.extendedWarrantyApplied &&
                        item.extendedWarranty && (
                          <div className="mt-2 rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-700">
                            <p className="font-semibold">
                              {getWarrantyPlanLabel(item.extendedWarranty)}
                            </p>

                            <p>
                              Warranty Charge:{" "}
                              {formatPrice(
                                String(item.extendedWarranty.price)
                              )}
                            </p>
                          </div>
                        )}

                      <p className="mt-2 font-medium">
                        {formatPrice(String(itemPrice))}
                      </p>

                      {item.exchangeApplied && item.originalPrice && (
                        <p className="text-xs text-muted-foreground">
                          Original Price:{" "}
                          <span className="line-through">
                            {formatPrice(String(item.originalPrice))}
                          </span>
                        </p>
                      )}

                      {/* Quantity Controls */}
                      <div className="mt-3 flex items-center gap-4">
                        <div className="flex items-center rounded-md border">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.quantity - 1,
                                item.variationId,
                                cartLineKey
                              )
                            }
                          >
                            <Minus className="h-4 w-4" />
                          </Button>

                          <span className="w-10 text-center">
                            {item.quantity}
                          </span>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.quantity + 1,
                                item.variationId,
                                cartLineKey
                              )
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() =>
                            removeItem(
                              item.productId,
                              item.variationId,
                              cartLineKey
                            )
                          }
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>

                    {/* Line Total */}
                    <div className="text-right">
                      <p className="font-bold">
                        {formatPrice(String(lineTotal))}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-4 rounded-lg border p-6">
                <h2 className="text-xl font-bold">Order Summary</h2>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Subtotal ({cart.totals.itemCount} items)
                    </span>

                    <span>{formatPrice(cart.totals.subtotal)}</span>
                  </div>

                  {parseFloat(cart.totals.shipping) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{formatPrice(cart.totals.shipping)}</span>
                    </div>
                  )}

                  {parseFloat(cart.totals.tax) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span>{formatPrice(cart.totals.tax)}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(cart.totals.total)}</span>
                </div>

                <Button asChild className="w-full" size="lg">
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>

                <Button variant="outline" asChild className="w-full">
                  <Link href="/shop">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Continue Shopping
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}