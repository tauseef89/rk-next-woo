import Link from "next/link";
import {
  AlertCircle,
  RefreshCcw,
  ShoppingBag,
  Home,
  Headphones,
  ArrowRight,
  CreditCard,
  ShieldAlert,
} from "lucide-react";

export default function FailedPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-red-50 via-white to-white px-4 py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Failed Hero */}
        <section className="overflow-hidden rounded-[2.5rem] border border-red-100 bg-white shadow-2xl shadow-red-100/60">
          <div className="relative bg-black px-6 py-12 text-center text-white md:px-12 md:py-16">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_#ef4444,_transparent_35%)]" />

            <div className="relative mx-auto max-w-2xl space-y-6">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-500 shadow-2xl shadow-red-500/30">
                <AlertCircle className="h-14 w-14 text-white" />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-red-300">
                  Payment Not Completed
                </p>

                <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">
                  Payment Failed
                </h1>

                <p className="mt-4 text-sm font-medium leading-relaxed text-white/60 md:text-base">
                  Your payment could not be completed. No amount has been
                  confirmed for this transaction. You can retry payment or go
                  back to your cart.
                </p>
              </div>

              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/checkout"
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-7 py-4 text-sm font-black uppercase tracking-widest text-black transition-all hover:bg-red-50"
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Retry Payment
                </Link>

                <Link
                  href="/cart"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-7 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-white/15"
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Back to Cart
                </Link>
              </div>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid gap-4 p-6 md:grid-cols-3 md:p-8">
            <InfoCard
              title="Payment Status"
              value="Failed"
              icon={<ShieldAlert className="h-5 w-5" />}
              red
            />

            <InfoCard
              title="Next Step"
              value="Retry Payment"
              icon={<RefreshCcw className="h-5 w-5" />}
            />

            <InfoCard
              title="Support"
              value="Available"
              icon={<Headphones className="h-5 w-5" />}
            />
          </div>
        </section>

        {/* Helpful Actions */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <FailedLinkCard
            title="Retry Payment"
            subtitle="Continue checkout"
            href="/checkout"
            icon={<CreditCard className="h-5 w-5" />}
            dark
          />

          <FailedLinkCard
            title="View Cart"
            subtitle="Review items"
            href="/cart"
            icon={<ShoppingBag className="h-5 w-5" />}
          />

          <FailedLinkCard
            title="Continue Shopping"
            subtitle="Explore products"
            href="/shop"
            icon={<Home className="h-5 w-5" />}
          />

          <FailedLinkCard
            title="My Orders"
            subtitle="Order history"
            href="/account/orders"
            icon={<RefreshCcw className="h-5 w-5" />}
            red
          />
        </section>

        {/* Help Note */}
        <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-100">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">
                Need Help?
              </p>

              <h2 className="mt-1 text-2xl font-black tracking-tight">
                Payment Issue Assistance
              </h2>

              <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-zinc-500">
                If your amount was deducted but the order was not confirmed,
                please check your bank/payment app first. In most cases, failed
                transaction amounts are automatically reversed by the payment
                provider.
              </p>
            </div>

            <div className="inline-flex shrink-0 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 px-6 py-3 text-xs font-black uppercase tracking-widest text-zinc-700">
  <Headphones className="mr-2 h-4 w-4" />
  24X7 Support :{" "}
  <a href="tel:8130047218" className="ml-1 text-black hover:underline">
    8130047218
  </a>
</div>
          </div>
        </section>

        {/* Payment Tips */}
        <section className="rounded-[2rem] border border-red-100 bg-red-50 p-6">
          <p className="text-sm font-black text-red-900">
            Before retrying, please check:
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Tip text="Your internet connection is stable." />
            <Tip text="Bank/UPI/card payment limit is available." />
            <Tip text="Do not refresh while payment is processing." />
          </div>
        </section>
      </div>
    </main>
  );
}

function InfoCard({
  title,
  value,
  icon,
  red = false,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  red?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-zinc-100 bg-zinc-50 p-5">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
            red ? "bg-red-100 text-red-700" : "bg-white text-zinc-700"
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

function FailedLinkCard({
  title,
  subtitle,
  href,
  icon,
  dark = false,
  red = false,
}: {
  title: string;
  subtitle: string;
  href: string;
  icon: React.ReactNode;
  dark?: boolean;
  red?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group rounded-[2rem] border p-6 transition-all hover:-translate-y-1 hover:shadow-xl ${
        dark
          ? "border-black bg-black text-white shadow-xl shadow-zinc-200"
          : red
          ? "border-red-100 bg-red-50 text-red-900"
          : "border-zinc-200 bg-white text-zinc-900 shadow-lg shadow-zinc-100"
      }`}
    >
      <div className="mb-8 flex items-center justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
            dark
              ? "bg-white/10 text-white"
              : red
              ? "bg-red-600 text-white"
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
          dark ? "text-white/50" : red ? "text-red-700" : "text-zinc-500"
        }`}
      >
        {subtitle}
      </p>
    </Link>
  );
}

function Tip({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-red-100 bg-white px-4 py-3 text-xs font-bold text-red-800">
      {text}
    </div>
  );
}