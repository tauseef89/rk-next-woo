"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useHasHydrated } from "@/hooks/useHasHydrated";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Truck,
  CreditCard,
  AlertCircle,
  Printer,
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  ShieldCheck,
  RefreshCcw,
  ReceiptText,
  ShoppingBag,
} from "lucide-react";

const statusStyles: Record<string, { color: string; icon: any; step: number }> =
  {
    pending: {
      color: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Clock,
      step: 1,
    },
    processing: {
      color: "bg-blue-50 text-blue-700 border-blue-200",
      icon: Package,
      step: 2,
    },
    "on-hold": {
      color: "bg-zinc-100 text-zinc-700 border-zinc-200",
      icon: AlertCircle,
      step: 2,
    },
    completed: {
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
      step: 4,
    },
    cancelled: {
      color: "bg-red-50 text-red-700 border-red-200",
      icon: AlertCircle,
      step: 0,
    },
    failed: {
      color: "bg-red-50 text-red-700 border-red-200",
      icon: AlertCircle,
      step: 0,
    },
  };

const orderSteps = [
  {
    label: "Order Placed",
    icon: ReceiptText,
  },
  {
    label: "Processing",
    icon: Package,
  },
  {
    label: "Ready to Ship",
    icon: Truck,
  },
  {
    label: "Completed",
    icon: CheckCircle2,
  },
];

function getAddressValue(order: any, type: "shipping" | "billing", key: string) {
  return order?.[type]?.[key] || "";
}

function parseAmount(value: string | number | undefined | null) {
  if (!value) return 0;
  if (typeof value === "number") return value;

  return Number(value.replace(/[^0-9.-]/g, "")) || 0;
}

function formatAmount(value: string | number | undefined | null) {
  const amount = parseAmount(value);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function isNegativeAmount(value: string | number | undefined | null) {
  return parseAmount(value) < 0;
}

function getFeeTone(fee: any) {
  const name = String(fee?.name || "").toLowerCase();

  if (isNegativeAmount(fee?.total) || name.includes("exchange")) {
    return "text-emerald-700 bg-emerald-50 border-emerald-100";
  }

  if (name.includes("warranty")) {
    return "text-blue-700 bg-blue-50 border-blue-100";
  }

  return "text-zinc-700 bg-zinc-50 border-zinc-100";
}

export default function OrderDetailPage() {
  const { id } = useParams();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasHydrated = useHasHydrated();

  useEffect(() => {
    if (!id) return;

    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/customer/orders/${id}`, {
          method: "GET",
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load order");
        }

        setOrder(data.order);
      } catch (err: any) {
        setError(err.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [id]);

  const currentStatus =
    statusStyles[order?.status] || {
      color: "bg-zinc-100 text-zinc-600 border-zinc-200",
      icon: Package,
      step: 1,
    };

  const StatusIcon = currentStatus.icon;

  const feeLines = order?.fee_lines || [];

  const itemsSubtotal = useMemo(() => {
    return (order?.line_items || []).reduce((sum: number, item: any) => {
      return sum + parseAmount(item.total);
    }, 0);
  }, [order]);

  if (!hasHydrated || loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <div className="mx-auto h-14 w-14 rounded-full border-4 border-zinc-100 border-t-black animate-spin" />

          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-400">
              Loading Order
            </p>
            <p className="mt-1 text-sm text-zinc-500">Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center rounded-[2rem] border border-zinc-100 bg-white p-10 shadow-xl shadow-zinc-100 space-y-6">
          <div className="mx-auto h-16 w-16 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>

          <div>
            <h1 className="text-xl font-black uppercase">Order Not Found</h1>
            <p className="mt-2 text-sm text-zinc-500">
              {error || "We could not find this order."}
            </p>
          </div>

          <Link
            href="/account/orders"
            className="inline-flex items-center justify-center rounded-2xl bg-black px-8 py-3 text-xs font-black uppercase tracking-widest text-white"
          >
            Return to History
          </Link>
        </div>
      </div>
    );
  }

  const shippingFirstName =
    getAddressValue(order, "shipping", "first_name") ||
    getAddressValue(order, "billing", "first_name");

  const shippingLastName =
    getAddressValue(order, "shipping", "last_name") ||
    getAddressValue(order, "billing", "last_name");

  const shippingAddress1 =
    getAddressValue(order, "shipping", "address_1") ||
    getAddressValue(order, "billing", "address_1");

  const shippingAddress2 =
    getAddressValue(order, "shipping", "address_2") ||
    getAddressValue(order, "billing", "address_2");

  const shippingCity =
    getAddressValue(order, "shipping", "city") ||
    getAddressValue(order, "billing", "city");

  const shippingState =
    getAddressValue(order, "shipping", "state") ||
    getAddressValue(order, "billing", "state");

  const shippingPostcode =
    getAddressValue(order, "shipping", "postcode") ||
    getAddressValue(order, "billing", "postcode");

  const shippingCountry =
    getAddressValue(order, "shipping", "country") ||
    getAddressValue(order, "billing", "country");

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-8">
        {/* Top Actions */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 shadow-sm hover:text-black hover:border-black transition-all"
          >
            <ArrowLeft size={14} />
            Orders
          </Link>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 shadow-sm hover:text-black hover:border-black transition-all"
          >
            <Printer size={14} />
            Print
          </button>
        </div>

        {/* Hero Header */}
        <div className="overflow-hidden rounded-[2rem] md:rounded-[3rem] border border-zinc-200 bg-white shadow-xl shadow-zinc-100">
          <div className="relative p-6 md:p-10 bg-black text-white">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_#ffffff,_transparent_30%)]" />

            <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
              <div className="space-y-5">
                <div
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-widest",
                    currentStatus.color
                  )}
                >
                  <StatusIcon size={14} />
                  {order.status}
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">
                    Order Number
                  </p>

                  <h1 className="mt-2 text-5xl md:text-7xl font-black italic tracking-tighter">
                    #{order.number || order.id}
                  </h1>
                </div>

                <p className="text-xs font-bold uppercase tracking-widest text-white/60">
                  Placed on{" "}
                  {order.date_created
                    ? new Date(order.date_created).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "-"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 min-w-full lg:min-w-[420px]">
                <div className="rounded-3xl bg-white/10 border border-white/10 p-5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
                    Total Paid
                  </p>
                  <p className="mt-2 text-2xl font-black">
                    {formatAmount(order.total)}
                  </p>
                </div>

                <div className="rounded-3xl bg-white/10 border border-white/10 p-5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
                    Payment
                  </p>
                  <p className="mt-2 text-sm font-black uppercase line-clamp-2">
                    {order.payment_method_title || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="p-6 md:p-8 bg-white print:hidden">
            <div className="grid grid-cols-4 gap-3">
              {orderSteps.map((step, index) => {
                const StepIcon = step.icon;
                const active = currentStatus.step >= index + 1;

                return (
                  <div key={step.label} className="space-y-3">
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all",
                        active ? "bg-black" : "bg-zinc-100"
                      )}
                    />

                    <div
                      className={cn(
                        "flex flex-col md:flex-row md:items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest",
                        active ? "text-black" : "text-zinc-300"
                      )}
                    >
                      <span
                        className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center border",
                          active
                            ? "bg-black text-white border-black"
                            : "bg-white text-zinc-300 border-zinc-100"
                        )}
                      >
                        <StepIcon size={14} />
                      </span>
                      {step.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Items */}
            <section className="rounded-[2rem] border border-zinc-200 bg-white shadow-xl shadow-zinc-100 overflow-hidden">
              <div className="p-6 md:p-8 border-b border-zinc-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">
                    Items Ordered
                  </p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight">
                    Product Details
                  </h2>
                </div>

                <div className="h-12 w-12 rounded-2xl bg-zinc-50 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-zinc-500" />
                </div>
              </div>

              <div className="divide-y divide-zinc-100">
                {(order.line_items || []).map((item: any) => (
                  <div
                    key={item.id}
                    className="p-5 md:p-8 flex flex-col md:flex-row gap-5 md:items-start md:justify-between"
                  >
                    <div className="flex gap-4 md:gap-5">
                      <div className="relative h-24 w-24 shrink-0 rounded-3xl overflow-hidden border border-zinc-100 bg-zinc-50">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name || "Product"}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-zinc-300" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 space-y-3">
                        <Link
                          href={
                            item.slug
                              ? `/shop/${item.slug}`
                              : `/product/${item.product_id}`
                          }
                          className="block text-base md:text-lg font-black leading-tight hover:text-blue-600 transition-colors"
                        >
                          {item.name}
                        </Link>

                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-black uppercase text-zinc-500">
                            Qty: {item.quantity}
                          </span>

                          <span className="rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-black uppercase text-zinc-500">
                            Unit: {formatAmount(item.price || item.total)}
                          </span>
                        </div>

                        {item.exchange && (
                          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-xs text-emerald-800 space-y-1">
                            <div className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px]">
                              <RefreshCcw size={13} />
                              Exchange Applied
                            </div>

                            <p className="font-bold">{item.exchange.product}</p>
                            <p>Age: {item.exchange.age || "-"}</p>
                            <p>Pincode: {item.exchange.pincode || "-"}</p>
                            <p>
                              Exchange Value:{" "}
                              <span className="font-black">
                                {formatAmount(item.exchange.value)}
                              </span>
                            </p>
                          </div>
                        )}

                        {item.extendedWarranty && (
                          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs text-blue-800 space-y-1">
                            <div className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px]">
                              <ShieldCheck size={13} />
                              Extended Warranty
                            </div>

                            <p className="font-bold">
                              {item.extendedWarranty.title || "Extended Warranty"}
                            </p>
                            <p>
                              Warranty Charge:{" "}
                              {item.extendedWarranty.percentage || 5}%
                            </p>
                            <p>
                              Amount:{" "}
                              <span className="font-black">
                                {formatAmount(item.extendedWarranty.price)}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="md:text-right shrink-0 md:min-w-[120px]">
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Line Total
                      </p>
                      <p className="mt-1 text-xl font-black">
                        {formatAmount(item.total)}
                      </p>

                      {order.status === "completed" && (
                        <Link
                          href={
                            item.slug
                              ? `/shop/${item.slug}`
                              : `/product/${item.product_id}`
                          }
                          className="mt-3 inline-block text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline"
                        >
                          Buy Again
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Payment Summary */}
            <section className="rounded-[2rem] border border-zinc-200 bg-white shadow-xl shadow-zinc-100 overflow-hidden">
              <div className="p-6 md:p-8 border-b border-zinc-100">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">
                  Invoice
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-tight">
                  Payment Summary
                </h2>
              </div>

              <div className="p-6 md:p-8 space-y-4">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-zinc-500">Items Subtotal</span>
                  <span>{formatAmount(itemsSubtotal)}</span>
                </div>

                {feeLines.length > 0 && (
                  <div className="space-y-3">
                    {feeLines.map((fee: any) => (
                      <div
                        key={fee.id || fee.name}
                        className={cn(
                          "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-black",
                          getFeeTone(fee)
                        )}
                      >
                        <span>{fee.name}</span>
                        <span>{formatAmount(fee.total)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between text-sm font-bold">
                  <span className="text-zinc-500">Shipping</span>
                  <span>{formatAmount(order.shipping_total || "0")}</span>
                </div>

                {Number(order.discount_total || 0) > 0 && (
                  <div className="flex justify-between text-sm font-bold text-emerald-700">
                    <span>Coupon Discount</span>
                    <span>-{formatAmount(order.discount_total)}</span>
                  </div>
                )}

                {Number(order.total_tax || 0) > 0 && (
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-zinc-500">Tax</span>
                    <span>{formatAmount(order.total_tax)}</span>
                  </div>
                )}

                <div className="border-t border-zinc-100 pt-5 flex items-center justify-between">
                  <span className="text-lg font-black uppercase">Total Paid</span>
                  <span className="text-3xl font-black text-blue-600">
                    {formatAmount(order.total)}
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <aside className="space-y-6 lg:sticky lg:top-24">
            {/* Shipping */}
            <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-100 space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-zinc-50 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-zinc-600" />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Delivery Address
                  </p>
                  <h3 className="font-black">Shipping Details</h3>
                </div>
              </div>

              {shippingAddress1 ? (
                <div className="rounded-2xl bg-zinc-50 p-5 text-sm font-bold text-zinc-600 leading-relaxed">
                  {shippingFirstName} {shippingLastName}
                  <br />
                  {shippingAddress1}
                  <br />
                  {shippingAddress2 && (
                    <>
                      {shippingAddress2}
                      <br />
                    </>
                  )}
                  {[shippingCity, shippingState, shippingPostcode]
                    .filter(Boolean)
                    .join(", ")}
                  <br />
                  {shippingCountry}
                </div>
              ) : (
                <p className="rounded-2xl bg-zinc-50 p-5 text-sm font-bold text-zinc-400">
                  Shipping address not available.
                </p>
              )}
            </section>

            {/* Payment */}
            <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-100 space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-zinc-50 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-zinc-600" />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Payment Mode
                  </p>
                  <h3 className="font-black">Transaction</h3>
                </div>
              </div>

              <div className="rounded-2xl bg-zinc-50 p-5 space-y-2">
                <p className="text-sm font-black uppercase">
                  {order.payment_method_title || "N/A"}
                </p>

                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 break-all">
                  Transaction ID: {order.transaction_id || "N/A"}
                </p>
              </div>
            </section>

            {/* Customer Note */}
            {order.customer_note && (
              <section className="rounded-[2rem] border border-amber-100 bg-amber-50 p-6 shadow-xl shadow-amber-50 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                  Note for Seller
                </p>

                <p className="text-sm font-semibold text-amber-900 leading-relaxed italic">
                  "{order.customer_note}"
                </p>
              </section>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}