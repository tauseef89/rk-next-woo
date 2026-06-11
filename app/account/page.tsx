"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  User,
  Clock,
  CheckCircle2,
  Coins,
  Sparkles,
  Heart,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { useHasHydrated } from "@/hooks/useHasHydrated";

export default function AccountDashboard() {
  const { user: authUser } = useAuthStore();
  const hasHydrated = useHasHydrated();
  const router = useRouter();

  const [customer, setCustomer] = useState<any>(null);
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [rewards, setRewards] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasHydrated) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [customerRes, ordersRes, pointsRes] = await Promise.all([
          fetch("/api/customer/me", {
            method: "GET",
            cache: "no-store",
          }),
          fetch("/api/customer/orders?per_page=1", {
            method: "GET",
            cache: "no-store",
          }),
          fetch("/api/customer/points", {
            method: "GET",
            cache: "no-store",
          }),
        ]);

        if (customerRes.status === 401) {
          router.push("/login");
          return;
        }

        const customerData = await customerRes.json();
        const ordersData = await ordersRes.json();
        const pointsData = await pointsRes.json();

        if (!customerData.success) {
          router.push("/login");
          return;
        }

        setCustomer(customerData.user || null);
        setRewards(pointsData.points || null);

        const orders = ordersData.orders || [];

        if (Array.isArray(orders) && orders.length > 0) {
          setLastOrder(orders[0]);
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router, hasHydrated]);

  if (!hasHydrated || loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-500 font-medium animate-pulse uppercase text-xs tracking-widest">
          Syncing Dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-white p-2 rounded-3xl">
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight text-zinc-900 uppercase italic">
            Hello, {customer?.name || authUser?.name || "Customer"}!
          </h2>

          <p className="text-muted-foreground text-sm leading-relaxed max-w-md font-medium">
            Welcome to your Rakesh Retails dashboard. Track your orders, manage rewards, and update your profile.
          </p>
        </div>

        <div className="w-full lg:w-auto min-w-[280px] bg-zinc-950 rounded-[2rem] p-6 text-white border border-zinc-800 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-[50px] -mr-16 -mt-16 group-hover:bg-blue-600/40 transition-colors"></div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Coins size={24} />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  RR Rewards
                </p>

                <h3 className="text-3xl font-black italic">
                  {rewards?.available || 0}
                  <span className="text-[10px] not-italic text-blue-500 ml-1">
                    PTS
                  </span>
                </h3>
              </div>
            </div>

            <Link
              href="/loyalty"
              className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-blue-600 transition-all border border-zinc-700"
            >
              <Sparkles size={16} className="text-white" />
            </Link>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">
                Redeem Value: ₹{((rewards?.available || 0) * (rewards?.point_value || 1)).toFixed(0)}
              </p>

              <Link
                href="/shop"
                className="text-[10px] font-black text-blue-500 uppercase hover:underline"
              >
                Shop Now
              </Link>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-zinc-500">
                {rewards?.earning_rule || "You earn 1 point for every ₹100 spent."}
              </p>

              <p className="text-[10px] font-semibold text-zinc-500">
                {rewards?.expiry_rule || "Points expire after 3 months."}
              </p>

              {(rewards?.expiring_soon || 0) > 0 && (
                <p className="text-[10px] font-bold text-orange-400">
                  {rewards.expiring_soon} points are expiring soon.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {lastOrder && (
        <section className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[2rem] p-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-2xl border shadow-sm">
                <Package className="w-6 h-6 text-blue-600" />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Current Status
                </p>

                <h3 className="text-xl font-bold text-zinc-900">
                  Order #{lastOrder.number || lastOrder.id}
                </h3>
              </div>
            </div>

            <div
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border-2",
                lastOrder.status === "completed"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-blue-50 text-blue-700 border-blue-100"
              )}
            >
              {lastOrder.status === "completed" ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : (
                <Clock className="w-3 h-3" />
              )}
              {lastOrder.status}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-zinc-200 pt-6">
            <div>
              <p className="text-zinc-400 text-[10px] uppercase font-black tracking-widest mb-1">
                Date
              </p>
              <p className="text-sm font-bold">
                {lastOrder.date
                  ? new Date(lastOrder.date).toLocaleDateString("en-IN")
                  : "-"}
              </p>
            </div>

            <div>
              <p className="text-zinc-400 text-[10px] uppercase font-black tracking-widest mb-1">
                Items
              </p>
              <p className="text-sm font-bold">
                {lastOrder.items?.length || 0} Products
              </p>
            </div>

            <div>
              <p className="text-zinc-400 text-[10px] uppercase font-black tracking-widest mb-1">
                Total Bill
              </p>
              <p className="text-sm font-black text-blue-600">
                ₹{lastOrder.total}
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                asChild
                variant="outline"
                className="rounded-xl border-zinc-200 font-bold text-xs uppercase h-10 px-6 hover:bg-black hover:text-white transition-colors"
              >
                <Link href={`/account/orders/${lastOrder.id}`}>Details</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Orders"
          subtitle="History & Tracking"
          icon={<Package className="w-5 h-5" />}
          href="/account/orders"
        />

        <DashboardCard
          title="My Rewards"
          subtitle="Redeem RR Points"
          icon={<Coins className="w-5 h-5" />}
          href="/loyalty"
          highlight
        />

        <DashboardCard
          title="Wishlist"
          subtitle="Your Saved Items"
          icon={<Heart className="w-5 h-5" />}
          href="/account/wishlist"
        />

        <DashboardCard
          title="Details"
          subtitle="Profile Settings"
          icon={<User className="w-5 h-5" />}
          href="/account/details"
        />
      </div>
    </div>
  );
}

function DashboardCard({ title, subtitle, icon, href, highlight = false }: any) {
  return (
    <Link
      href={href}
      className={cn(
        "p-6 rounded-3xl border-2 transition-all group flex flex-col justify-between h-40",
        highlight
          ? "bg-blue-50 border-blue-100 hover:border-blue-300"
          : "bg-white border-zinc-100 hover:border-zinc-300 shadow-sm hover:shadow-md"
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-2xl flex items-center justify-center transition-colors",
          highlight
            ? "bg-blue-600 text-white"
            : "bg-zinc-100 text-zinc-900 group-hover:bg-black group-hover:text-white"
        )}
      >
        {icon}
      </div>

      <div className="flex justify-between items-end">
        <div>
          <h4 className="font-black uppercase italic text-sm tracking-tight">
            {title}
          </h4>
          <p className="text-[10px] text-zinc-500 font-medium">{subtitle}</p>
        </div>

        <ArrowRight
          size={16}
          className="text-zinc-300 group-hover:text-black group-hover:translate-x-1 transition-all"
        />
      </div>
    </Link>
  );
}