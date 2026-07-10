"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Loader2,
  Ticket,
  X,
  Coins,
  ShieldCheck,
  RefreshCcw,
  ShoppingBag,
  CreditCard,
  MapPin,
  User,
  ReceiptText,
  Sparkles,
  Trash2,
} from "lucide-react";
import Cookies from "js-cookie";

import { useCart } from "@/components/shop/cart-provider";
import { formatPrice } from "@/lib/woocommerce";
import { Section, Container } from "@/components/craft";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone: string;
  notes: string;
}

function parsePrice(value: string | number | undefined | null) {
  if (!value) return 0;

  if (typeof value === "number") {
    return value;
  }

  return Number(value.replace(/[^0-9.-]/g, "")) || 0;
}

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

export default function CheckoutPage() {
  const { cart, isLoading, removeItem } = useCart();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number>(0);

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupons, setAppliedCoupons] = useState<
    { code: string; amount: number }[]
  >([]);
  const [isValidating, setIsValidating] = useState(false);
  const [discountValue, setDiscountValue] = useState(0);

  const [rewards, setRewards] = useState<any>(null);
  const [rewardPointsInput, setRewardPointsInput] = useState("");
  const [appliedRewardPoints, setAppliedRewardPoints] = useState(0);
  const [isRewardLoading, setIsRewardLoading] = useState(false);

  const [formData, setFormData] = useState<CheckoutFormData>({
    email: "",
    firstName: "",
    lastName: "",
    company: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postcode: "",
    country: "IN",
    phone: "",
    notes: "",
  });

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleRemoveCartItem = (item: any) => {
    removeItem(item.productId, item.variationId, getCartLineKey(item));
    setError(null);
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;

    setIsValidating(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/coupon?code=${couponInput.trim().toLowerCase()}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid coupon");
      }

      const couponCode = data.code.toUpperCase();

      if (appliedCoupons.some((coupon) => coupon.code === couponCode)) {
        throw new Error("Coupon already applied");
      }

      const newCoupon = {
        code: couponCode,
        amount: parseFloat(data.amount),
      };

      setDiscountValue((previous) => previous + newCoupon.amount);
      setAppliedCoupons((previous) => [...previous, newCoupon]);
      setCouponInput("");
    } catch (err: any) {
      setError(err.message || "Unable to apply coupon");
    } finally {
      setIsValidating(false);
    }
  };

  const removeCoupon = (code: string) => {
    const coupon = appliedCoupons.find((item) => item.code === code);

    if (!coupon) return;

    setDiscountValue((previous) => previous - coupon.amount);
    setAppliedCoupons((previous) =>
      previous.filter((item) => item.code !== code)
    );
  };

  useEffect(() => {
    const token = Cookies.get("woo-token");

    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.id) {
          setUserId(data.id);
        }
      })
      .catch((err) => {
        console.error("Error fetching user ID:", err);
      });
  }, []);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        setIsRewardLoading(true);

        const response = await fetch("/api/customer/points", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setRewards(data.points || null);
        }
      } catch (err) {
        console.error("Reward points fetch error:", err);
      } finally {
        setIsRewardLoading(false);
      }
    };

    fetchRewards();
  }, []);

  const subtotal =
    cart.items.reduce((total: number, item: any) => {
      return total + parsePrice(item.price) * item.quantity;
    }, 0) || 0;

  const pointValue = Number(rewards?.point_value || 1);
  const availablePoints = Number(rewards?.available || 0);

  const maxRedeemableByAmount = Math.floor(
    Math.max(0, subtotal - discountValue) / pointValue
  );

  const maxRedeemablePoints = Math.min(
    availablePoints,
    maxRedeemableByAmount
  );

  const safeAppliedRewardPoints = Math.min(
    appliedRewardPoints,
    maxRedeemablePoints
  );

  const rewardDiscountValue = safeAppliedRewardPoints * pointValue;

  const totalAmount = Math.max(
    0,
    subtotal - discountValue - rewardDiscountValue
  );

  const handleApplyRewardPoints = () => {
    const requestedPoints = Math.floor(Number(rewardPointsInput) || 0);

    if (requestedPoints <= 0) {
      setError("Please enter reward points to redeem.");
      return;
    }

    if (availablePoints <= 0) {
      setError("You do not have reward points available.");
      return;
    }

    const safePoints = Math.min(requestedPoints, maxRedeemablePoints);

    if (safePoints <= 0) {
      setError("Reward points cannot be applied on this order amount.");
      return;
    }

    setAppliedRewardPoints(safePoints);
    setRewardPointsInput("");
    setError(null);
  };

  const handleApplyMaxRewardPoints = () => {
    if (maxRedeemablePoints <= 0) {
      setError("No reward points available for this order.");
      return;
    }

    setAppliedRewardPoints(maxRedeemablePoints);
    setRewardPointsInput("");
    setError(null);
  };

  const removeRewardPoints = () => {
    setAppliedRewardPoints(0);
    setRewardPointsInput("");
  };

  const checkoutItems = cart.items.map((item: any) => {
    const adjustedUnitPrice = parsePrice(item.price);
    const originalUnitPrice = parsePrice(item.originalPrice || item.price);

    return {
      cart_line_key: getCartLineKey(item),
      product_id: item.productId,
      variation_id: item.variationId || undefined,
      quantity: item.quantity,
      name: item.name,
      image: item.image,
      attributes: item.attributes || [],
      original_price: originalUnitPrice,
      adjusted_price: adjustedUnitPrice,
      line_total: adjustedUnitPrice * item.quantity,
      exchange_applied: Boolean(item.exchangeApplied),
      exchange: item.exchangeApplied && item.exchange ? item.exchange : null,
      extended_warranty_applied: Boolean(item.extendedWarrantyApplied),
      extended_warranty:
        item.extendedWarrantyApplied && item.extendedWarranty
          ? item.extendedWarranty
          : null,
    };
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setIsSubmitting(true);
    setError(null);

    const sanitizedPhone = formData.phone.replace(/\D/g, "");

    if (sanitizedPhone.length < 10 || sanitizedPhone.length > 12) {
      setError(
        "Please provide a valid phone number with 10 to 12 digits."
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_id: userId,
          total_amount: totalAmount,
          cart_items: checkoutItems,

          line_items: cart.items.map((item: any) => ({
            product_id: item.productId,
            variation_id: item.variationId,
            quantity: item.quantity,
          })),

          reward_points:
            safeAppliedRewardPoints > 0
              ? {
                  points: safeAppliedRewardPoints,
                  point_value: pointValue,
                  amount: rewardDiscountValue,
                }
              : null,

          billing: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            company: formData.company,
            address_1: formData.address1,
            address_2: formData.address2,
            city: formData.city,
            state: formData.state,
            postcode: formData.postcode,
            country: formData.country,
            email: formData.email,
            phone: sanitizedPhone,
          },

          shipping: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            company: formData.company,
            address_1: formData.address1,
            address_2: formData.address2,
            city: formData.city,
            state: formData.state,
            postcode: formData.postcode,
            country: formData.country,
          },

          coupon_lines: appliedCoupons.map((coupon) => ({
            code: coupon.code,
          })),

          customer_note: formData.notes,
        }),
      });

      const contentType = response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const rawResponse = await response.text();

        console.error("NON JSON RESPONSE:", rawResponse);

        throw new Error(
          `Server returned a non-JSON response (${response.status})`
        );
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Checkout failed");
      }

      sessionStorage.setItem("pending_order_id", data.order.id.toString());

      if (data.pine_labs?.order_id) {
        sessionStorage.setItem("pine_order_id", data.pine_labs.order_id);
      }

      if (data?.pine_labs?.payment_url) {
        window.location.href = data.pine_labs.payment_url;
        return;
      }

      throw new Error("Pine Labs payment URL is missing.");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong during checkout."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Section>
        <Container>
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="space-y-4 text-center">
              <Loader2 className="mx-auto h-10 w-10 animate-spin" />
              <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-400">
                Preparing Checkout
              </p>
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
          <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100">
              <ShoppingBag className="h-9 w-9 text-zinc-400" />
            </div>

            <div>
              <h1 className="text-2xl font-black">Your cart is empty</h1>
              <p className="mt-2 text-muted-foreground">
                Add products to your cart before checking out.
              </p>
            </div>

            <Button asChild className="rounded-2xl">
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
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-white">
      <Section>
        <Container className="max-w-7xl">
          <div className="space-y-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="w-fit rounded-full px-0 text-zinc-500 hover:text-black"
                >
                  <Link href="/cart">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Cart
                  </Link>
                </Button>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                    Secure Checkout
                  </p>

                  <h1 className="mt-2 text-4xl font-black tracking-tight md:text-6xl">
                    Complete Your Order
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm text-zinc-500">
                    Review your products, apply rewards, and proceed to secure
                    Pine Labs payment.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl bg-black px-6 py-5 text-white shadow-xl shadow-zinc-200">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
                  Amount Payable
                </p>

                <p className="mt-1 text-3xl font-black">
                  {formatPrice(String(totalAmount))}
                </p>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_440px]">
              <form
                id="checkout-form"
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* Contact */}
                <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-100 md:p-8">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-50">
                      <User className="h-5 w-5 text-zinc-600" />
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Step 01
                      </p>
                      <h2 className="text-xl font-black">
                        Contact Information
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FieldWrapper label="Email Address *">
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="h-12 rounded-xl"
                      />
                    </FieldWrapper>

                    <FieldWrapper label="Phone Number *">
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="h-12 rounded-xl"
                      />
                    </FieldWrapper>
                  </div>
                </section>

                {/* Billing */}
                <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-100 md:p-8">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-50">
                      <MapPin className="h-5 w-5 text-zinc-600" />
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Step 02
                      </p>
                      <h2 className="text-xl font-black">Billing Address</h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FieldWrapper label="First Name *">
                      <Input
                        id="firstName"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="h-12 rounded-xl"
                      />
                    </FieldWrapper>

                    <FieldWrapper label="Last Name *">
                      <Input
                        id="lastName"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="h-12 rounded-xl"
                      />
                    </FieldWrapper>

                    <FieldWrapper label="Company Name">
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="h-12 rounded-xl"
                      />
                    </FieldWrapper>

                    <FieldWrapper label="Country *">
                      <Input
                        id="country"
                        name="country"
                        required
                        disabled
                        value={formData.country}
                        className="h-12 rounded-xl"
                      />
                    </FieldWrapper>

                    <div className="md:col-span-2">
                      <FieldWrapper label="Street Address *">
                        <Input
                          id="address1"
                          name="address1"
                          required
                          placeholder="House number and street name"
                          value={formData.address1}
                          onChange={handleInputChange}
                          className="h-12 rounded-xl"
                        />
                      </FieldWrapper>
                    </div>

                    <div className="md:col-span-2">
                      <FieldWrapper label="Apartment, suite, unit, etc.">
                        <Input
                          id="address2"
                          name="address2"
                          placeholder="Apartment, suite, unit, etc."
                          value={formData.address2}
                          onChange={handleInputChange}
                          className="h-12 rounded-xl"
                        />
                      </FieldWrapper>
                    </div>

                    <FieldWrapper label="Town / City *">
                      <Input
                        id="city"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        className="h-12 rounded-xl"
                      />
                    </FieldWrapper>

                    <FieldWrapper label="State *">
                      <Input
                        id="state"
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleInputChange}
                        className="h-12 rounded-xl"
                      />
                    </FieldWrapper>

                    <FieldWrapper label="Postcode / ZIP *">
                      <Input
                        id="postcode"
                        name="postcode"
                        required
                        value={formData.postcode}
                        onChange={handleInputChange}
                        className="h-12 rounded-xl"
                      />
                    </FieldWrapper>
                  </div>
                </section>

                {/* Notes */}
                <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-100 md:p-8">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-50">
                      <ReceiptText className="h-5 w-5 text-zinc-600" />
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Optional
                      </p>
                      <h2 className="text-xl font-black">
                        Additional Information
                      </h2>
                    </div>
                  </div>

                  <FieldWrapper label="Order Notes">
                    <textarea
                      id="notes"
                      name="notes"
                      placeholder="Any special instruction for this order?"
                      className="flex min-h-[110px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={formData.notes}
                      onChange={handleInputChange}
                    />
                  </FieldWrapper>
                </section>
              </form>

              {/* Order Summary */}
              <aside className="space-y-5 lg:sticky lg:top-24">
                <section className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-xl shadow-zinc-100">
                  <div className="bg-black p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/50">
                          Your Order
                        </p>
                        <h2 className="mt-1 text-2xl font-black">
                          Order Summary
                        </h2>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  <div className="max-h-[360px] divide-y divide-zinc-100 overflow-y-auto">
                    {cart.items.map((item: any) => {
                      const cartLineKey = getCartLineKey(item);
                      const lineTotal =
                        parsePrice(item.price) * item.quantity;

                      return (
                        <div key={cartLineKey} className="p-5">
                          <div className="flex gap-4">
                            {item.image && (
                              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border bg-zinc-50">
                                <Image
                                  src={item.image}
                                  alt={item.name || "Product"}
                                  fill
                                  className="object-cover"
                                  sizes="64px"
                                />
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <p className="line-clamp-2 text-sm font-black">
                                  {item.name}
                                </p>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveCartItem(item)}
                                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700"
                                  aria-label={`Remove ${item.name} from cart`}
                                  title="Remove item"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="mt-2 flex items-center justify-between gap-3">
                                <span className="rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-black uppercase text-zinc-500">
                                  Qty: {item.quantity}
                                </span>

                                <span className="text-sm font-black">
                                  {formatPrice(String(lineTotal))}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 space-y-2">
                            {item.exchangeApplied && item.exchange && (
                              <MiniBadge
                                tone="green"
                                icon={<RefreshCcw className="h-3 w-3" />}
                                title="Exchange Applied"
                                text={`${item.exchange.brand} ${
                                  item.exchange.type
                                } • ${formatPrice(
                                  String(item.exchange.exchangeValue)
                                )}`}
                              />
                            )}

                            {item.extendedWarrantyApplied &&
                              item.extendedWarranty && (
                                <MiniBadge
                                  tone="blue"
                                  icon={<ShieldCheck className="h-3 w-3" />}
                                  title="Extended Warranty"
                                  text={`${getWarrantyPlanLabel(
                                    item.extendedWarranty
                                  )} • ${formatPrice(
                                    String(item.extendedWarranty.price)
                                  )}`}
                                />
                              )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-4 border-t border-zinc-100 p-5">
                    {/* Coupon */}
                    <div className="space-y-3 rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
                      <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4 text-zinc-600" />

                        <Label
                          htmlFor="coupon"
                          className="text-xs font-black uppercase tracking-widest"
                        >
                          Coupon
                        </Label>
                      </div>

                      <div className="flex gap-2">
                        <Input
                          id="coupon"
                          placeholder="Coupon Code"
                          value={couponInput}
                          onChange={(event) =>
                            setCouponInput(event.target.value)
                          }
                          disabled={isValidating}
                          className="h-11 rounded-xl bg-white"
                        />

                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleApplyCoupon}
                          disabled={isValidating || !couponInput.trim()}
                          className="h-11 rounded-xl"
                        >
                          {isValidating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Apply"
                          )}
                        </Button>
                      </div>

                      {appliedCoupons.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {appliedCoupons.map((coupon) => (
                            <span
                              key={coupon.code}
                              className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"
                            >
                              {coupon.code} (-
                              {formatPrice(String(coupon.amount))})

                              <button
                                type="button"
                                onClick={() => removeCoupon(coupon.code)}
                                aria-label={`Remove ${coupon.code} coupon`}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Rewards */}
                    <div className="space-y-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4 text-blue-700" />

                          <Label className="text-xs font-black uppercase tracking-widest text-blue-900">
                            Reward Points
                          </Label>
                        </div>

                        <span className="text-xs font-black text-blue-700">
                          {availablePoints} pts
                        </span>
                      </div>

                      <p className="text-xs font-medium text-blue-700">
                        1 point = ₹{pointValue}. Redeem up to{" "}
                        {maxRedeemablePoints} points.
                      </p>

                      {safeAppliedRewardPoints > 0 ? (
                        <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-xs font-black text-blue-700">
                          <span>
                            {safeAppliedRewardPoints} pts applied (-
                            {formatPrice(String(rewardDiscountValue))})
                          </span>

                          <button
                            type="button"
                            onClick={removeRewardPoints}
                            aria-label="Remove applied reward points"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Points"
                            type="number"
                            min={1}
                            max={maxRedeemablePoints}
                            value={rewardPointsInput}
                            onChange={(event) =>
                              setRewardPointsInput(event.target.value)
                            }
                            disabled={isRewardLoading || availablePoints <= 0}
                            className="h-11 rounded-xl bg-white"
                          />

                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleApplyRewardPoints}
                            disabled={isRewardLoading || availablePoints <= 0}
                            className="h-11 rounded-xl bg-white"
                          >
                            Apply
                          </Button>

                          <Button
                            type="button"
                            onClick={handleApplyMaxRewardPoints}
                            disabled={
                              isRewardLoading || maxRedeemablePoints <= 0
                            }
                            className="h-11 rounded-xl"
                          >
                            Max
                          </Button>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <SummaryRow label="Subtotal" value={subtotal} />

                      {discountValue > 0 && (
                        <SummaryRow
                          label="Coupon Discount"
                          value={-discountValue}
                          tone="green"
                        />
                      )}

                      {safeAppliedRewardPoints > 0 && (
                        <SummaryRow
                          label="Reward Points"
                          value={-rewardDiscountValue}
                          tone="blue"
                        />
                      )}

                      <div className="flex items-center justify-between rounded-2xl bg-black p-5 text-white">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
                            Total Payable
                          </p>

                          <p className="mt-1 text-xs text-white/50">
                            Inclusive of applied benefits
                          </p>
                        </div>

                        <p className="text-2xl font-black">
                          {formatPrice(String(totalAmount))}
                        </p>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      form="checkout-form"
                      className="h-14 w-full rounded-2xl text-sm font-black uppercase tracking-widest"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Redirecting...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Pay Securely
                        </>
                      )}
                    </Button>

                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                      <Sparkles className="h-3 w-3" />
                      Secured by Pine Labs
                    </div>
                  </div>
                </section>
              </aside>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}

function FieldWrapper({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-bold text-zinc-600">{label}</Label>
      {children}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "green" | "blue";
}) {
  return (
    <div
      className={cn(
        "flex justify-between text-sm font-bold",
        tone === "green" && "text-emerald-700",
        tone === "blue" && "text-blue-700",
        tone === "default" && "text-zinc-700"
      )}
    >
      <span>{label}</span>

      <span>
        {value < 0 ? "-" : ""}
        {formatPrice(String(Math.abs(value)))}
      </span>
    </div>
  );
}

function MiniBadge({
  tone,
  icon,
  title,
  text,
}: {
  tone: "green" | "blue";
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-xl border px-3 py-2 text-xs",
        tone === "green" &&
          "border-emerald-100 bg-emerald-50 text-emerald-700",
        tone === "blue" && "border-blue-100 bg-blue-50 text-blue-700"
      )}
    >
      <span className="mt-0.5">{icon}</span>

      <div>
        <p className="text-[9px] font-black uppercase tracking-widest">
          {title}
        </p>

        <p className="font-semibold">{text}</p>
      </div>
    </div>
  );
}