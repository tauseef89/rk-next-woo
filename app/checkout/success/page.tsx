"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ShoppingBag,
  Package,
  User,
  Coins,
  Home,
  LogIn,
  UserPlus,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import { useCart } from "@/components/shop/cart-provider";
import { Button } from "@/components/ui/button";

export default function SuccessPage() {
  const { clearCart } = useCart();

  const [orderId, setOrderId] = useState<string | null>(null);
  const [pineOrderId, setPineOrderId] = useState<string | null>(null);

  useEffect(() => {
    clearCart();

    if (typeof window !== "undefined") {
      const savedOrderId = sessionStorage.getItem("pending_order_id");
      const savedPineOrderId = sessionStorage.getItem("pine_order_id");

      if (savedOrderId) setOrderId(savedOrderId);
      if (savedPineOrderId) setPineOrderId(savedPineOrderId);
    }
  }, [clearCart]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white px-4 py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Success Hero */}
        <section className="overflow-hidden rounded-[2.5rem] border border-emerald-100 bg-white shadow-2xl shadow-emerald-100/60">
          <div className="relative bg-black px-6 py-12 text-center text-white md:px-12 md:py-16">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_#22c55e,_transparent_35%)]" />

            <div className="relative mx-auto max-w-2xl space-y-6">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500 shadow-2xl shadow-emerald-500/30">
                <CheckCircle2 className="h-14 w-14 text-white" />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-300">
                  Payment Confirmed
                </p>

                <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">
                  Thank You!
                </h1>

                <p className="mt-4 text-sm font-medium leading-relaxed text-white/60 md:text-base">
                  Your payment was successful and your order has been placed.
                  We will start processing it shortly.
                </p>
              </div>

              {orderId && (
                <div className="mx-auto w-fit rounded-2xl border border-white/10 bg-white/10 px-6 py-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
                    Order ID
                  </p>
                  <p className="mt-1 text-2xl font-black">#{orderId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Info */}
          <div className="grid gap-4 p-6 md:grid-cols-3 md:p-8">
            <InfoCard
              title="Order Status"
              value="Processing"
              icon={<Package className="h-5 w-5" />}
            />

            <InfoCard
              title="Payment Status"
              value="Successful"
              icon={<CheckCircle2 className="h-5 w-5" />}
              green
            />

            <InfoCard
              title="Gateway Ref"
              value={pineOrderId || "Saved"}
              icon={<Sparkles className="h-5 w-5" />}
            />
          </div>
        </section>

        {/* Main Actions */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {orderId && (
            <SuccessLinkCard
              title="View Order"
              subtitle="Check invoice & status"
              href={`/account/orders/${orderId}`}
              icon={<Package className="h-5 w-5" />}
              dark
            />
          )}

          <SuccessLinkCard
            title="My Account"
            subtitle="Dashboard"
            href="/account"
            icon={<User className="h-5 w-5" />}
          />

          <SuccessLinkCard
            title="My Orders"
            subtitle="Order history"
            href="/account/orders"
            icon={<ShoppingBag className="h-5 w-5" />}
          />

          <SuccessLinkCard
            title="Rewards"
            subtitle="View RR points"
            href="/loyalty"
            icon={<Coins className="h-5 w-5" />}
            blue
          />

          <SuccessLinkCard
            title="Continue Shopping"
            subtitle="Explore products"
            href="/shop"
            icon={<Home className="h-5 w-5" />}
          />
        </section>

        {/* Guest / Account Links */}
        <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-100">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">
                Customer Access
              </p>

              <h2 className="mt-1 text-2xl font-black tracking-tight">
                Manage Your Purchase
              </h2>

              <p className="mt-2 max-w-xl text-sm font-medium text-zinc-500">
                Login or register to track your order, manage rewards, and save
                your details for faster checkout next time.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="rounded-2xl bg-black px-6">
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>

              <Button asChild variant="outline" className="rounded-2xl px-6">
                <Link href="/register">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Bottom Note */}
        <section className="rounded-[2rem] border border-blue-100 bg-blue-50 p-6 text-center">
          <p className="text-sm font-bold text-blue-900">
            You earn reward points on eligible successful orders.
          </p>

          <p className="mt-1 text-xs font-medium text-blue-700">
            Points are calculated as per RR Rewards policy: 1 point for every
            ₹100 spent.
          </p>
        </section>
      </div>
    </main>
  );
}

function InfoCard({
  title,
  value,
  icon,
  green = false,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  green?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-zinc-100 bg-zinc-50 p-5">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
            green ? "bg-emerald-100 text-emerald-700" : "bg-white text-zinc-700"
          }`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            {title}
          </p>

          <p className="mt-1 truncate text-sm font-black text-zinc-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function SuccessLinkCard({
  title,
  subtitle,
  href,
  icon,
  dark = false,
  blue = false,
}: {
  title: string;
  subtitle: string;
  href: string;
  icon: React.ReactNode;
  dark?: boolean;
  blue?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group rounded-[2rem] border p-6 transition-all hover:-translate-y-1 hover:shadow-xl ${
        dark
          ? "border-black bg-black text-white shadow-xl shadow-zinc-200"
          : blue
          ? "border-blue-100 bg-blue-50 text-blue-900"
          : "border-zinc-200 bg-white text-zinc-900 shadow-lg shadow-zinc-100"
      }`}
    >
      <div className="mb-8 flex items-center justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
            dark
              ? "bg-white/10 text-white"
              : blue
              ? "bg-blue-600 text-white"
              : "bg-zinc-100 text-zinc-700 group-hover:bg-black group-hover:text-white"
          }`}
        >
          {icon}
        </div>

        <ArrowRight
          className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${
            dark ? "text-white/50" : "text-zinc-300"
          }`}
        />
      </div>

      <h3 className="text-sm font-black uppercase tracking-tight">{title}</h3>

      <p
        className={`mt-1 text-xs font-medium ${
          dark ? "text-white/50" : blue ? "text-blue-700" : "text-zinc-500"
        }`}
      >
        {subtitle}
      </p>
    </Link>
  );
}