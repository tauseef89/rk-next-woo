"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Loader2, Ticket, X } from "lucide-react";
import Cookies from "js-cookie";

import { useCart } from "@/components/shop/cart-provider";
import { formatPrice } from "@/lib/woocommerce";
import { Section, Container } from "@/components/craft";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

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

export default function CheckoutPage() {
  const { cart, isLoading } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number>(0);

  // --- Coupon Functionality States ---
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupons, setAppliedCoupons] = useState<{code: string, amount: number}[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [discountValue, setDiscountValue] = useState(0);

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Coupon Handler ---
  const handleApplyCoupon = async () => {
    if (!couponInput) return;
    setIsValidating(true);
    setError(null);

    try {
      const res = await fetch(`/api/coupon?code=${couponInput.toLowerCase()}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Invalid coupon");

      if (appliedCoupons.some(c => c.code === data.code.toUpperCase())) {
        throw new Error("Coupon already applied");
      }

      const newCoupon = { code: data.code.toUpperCase(), amount: parseFloat(data.amount) };
      setDiscountValue((prev) => prev + newCoupon.amount);
      setAppliedCoupons((prev) => [...prev, newCoupon]);
      setCouponInput("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsValidating(false);
    }
  };

  const removeCoupon = (code: string) => {
    const coupon = appliedCoupons.find(c => c.code === code);
    if (coupon) {
      setDiscountValue((prev) => prev - coupon.amount);
      setAppliedCoupons(appliedCoupons.filter((c) => c.code !== code));
    }
  };

  useEffect(() => {
    const token = Cookies.get("woo-token");
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.id) setUserId(data.id);
      })
      .catch(err => console.error("Error fetching user ID:", err));
    }
  }, []);

  // Calculate order total based on live cart items and deductions
  const subtotal = cart?.items?.reduce((acc, item) => acc + (parseFloat(item.price || "0") * item.quantity), 0) || 0;
  const totalAmount = Math.max(0, subtotal - discountValue);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Pine Labs specific client validation rules (Prevents broken remote requests)
    const sanitizedPhone = formData.phone.replace(/\D/g, "");
    if (sanitizedPhone.length < 10 || sanitizedPhone.length > 12) {
      setError("Please provide a valid phone number (10-12 digits) required by payment processor.");
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
          total_amount: totalAmount, // Added to accurately map monetary calculations downstream
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
          line_items: cart.items.map((item) => ({
            product_id: item.productId,
            variation_id: item.variationId,
            quantity: item.quantity,
          })),
          coupon_lines: appliedCoupons.map((c) => ({
            code: c.code,
          })),
          customer_note: formData.notes,
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const rawHtml = await response.text();
        console.error("NON JSON RESPONSE:", rawHtml);
        throw new Error(`Server returned non JSON response (${response.status})`);
      }

      const data = await response.json();
      console.log("CHECKOUT RESPONSE:", data);

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Checkout failed");
      }

      // Store parameters safely within storage scopes
      if (typeof window !== "undefined") {
        sessionStorage.setItem("pending_order_id", data.order.id.toString());
        if (data.pine_labs?.order_id) {
          sessionStorage.setItem("pine_order_id", data.pine_labs.order_id);
        }
      }

      // Safe deep extraction check for the Pine Labs/Plural session redirect URL
      if (data?.pine_labs?.payment_url) {
        window.location.href = data.pine_labs.payment_url;
        return;
      }

      throw new Error("Pine Labs checkout session configuration URL missing");

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong during processing");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Section>
        <Container>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </Container>
      </Section>
    );
  }

  if (cart.items.length === 0) {
    return (
      <Section>
        <Container>
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold">Your cart is empty</h1>
              <p className="text-muted-foreground">Add some items to your cart before checking out.</p>
            </div>
            <Button asChild>
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
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/cart">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Checkout</h1>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Contact Information</h2>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" name="email" type="email" required value={formData.email} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number * (10 digits for payment confirmation)</Label>
                    <Input id="phone" name="phone" type="tel" required value={formData.phone} onChange={handleInputChange} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Billing Address</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" name="firstName" required value={formData.firstName} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" name="lastName" required value={formData.lastName} onChange={handleInputChange} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="company">Company Name (Optional)</Label>
                  <Input id="company" name="company" value={formData.company} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="address1">Street Address *</Label>
                  <Input id="address1" name="address1" required placeholder="House number and street name" value={formData.address1} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="address2">Apartment, suite, unit, etc. (Optional)</Label>
                  <Input id="address2" name="address2" placeholder="Apartment, suite, unit, etc." value={formData.address2} onChange={handleInputChange} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Town / City *</Label>
                    <Input id="city" name="city" required value={formData.city} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input id="state" name="state" required value={formData.state} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postcode">Postcode / ZIP *</Label>
                    <Input id="postcode" name="postcode" required value={formData.postcode} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Input id="country" name="country" required disabled value={formData.country} onChange={handleInputChange} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Additional Information</h2>
                <div>
                  <Label htmlFor="notes">Order Notes (Optional)</Label>
                  <textarea id="notes" name="notes" className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={formData.notes} onChange={handleInputChange} />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirecting to Secure Payment Portal...
                  </>
                ) : (
                  `Proceed to Secure Payment (${formatPrice(totalAmount)})`
                )}
              </Button>
            </form>

            {/* Order Review Section */}
            <div className="bg-muted/40 p-6 rounded-lg h-fit space-y-6 border">
              <h2 className="text-xl font-semibold">Your Order</h2>
              <div className="divide-y">
                {cart.items.map((item) => (
                  <div key={item.productId} className="flex justify-between py-3 items-center gap-4">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <div className="relative h-12 w-12 rounded border overflow-hidden bg-background">
                          <Image src={item.image} alt={item.name || "Product"} fill className="object-cover" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-medium text-sm">{formatPrice(parseFloat(item.price || "0") * item.quantity)}</p>
                  </div>
                ))}
              </div>

              {/* Coupon Form Input UI wrapper */}
              <div className="space-y-2">
                <Label htmlFor="coupon">Have a Coupon?</Label>
                <div className="flex gap-2">
                  <Input id="coupon" placeholder="Coupon Code" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} disabled={isValidating} />
                  <Button type="button" variant="outline" onClick={handleApplyCoupon} disabled={isValidating || !couponInput}>
                    {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ticket className="h-4 w-4" />}
                  </Button>
                </div>
                {appliedCoupons.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {appliedCoupons.map((coupon) => (
                      <span key={coupon.code} className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
                        {coupon.code} (-{formatPrice(coupon.amount)})
                        <button type="button" onClick={() => removeCoupon(coupon.code)} className="hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discountValue > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>-{formatPrice(discountValue)}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
