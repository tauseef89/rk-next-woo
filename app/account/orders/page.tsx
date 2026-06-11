"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, PackageOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHasHydrated } from "@/hooks/useHasHydrated";

// Safe styling matrix hoisted above execution flow to prevent ReferenceErrors
const statusStyles: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
  processing: "bg-blue-50 text-blue-700 border-blue-100",
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  cancelled: "bg-red-50 text-red-700 border-red-100",
  failed: "bg-red-50 text-red-700 border-red-100",
  refunded: "bg-purple-50 text-purple-700 border-purple-100",
  "on-hold": "bg-zinc-100 text-zinc-600 border-zinc-200",
  onhold: "bg-zinc-100 text-zinc-600 border-zinc-200",
};

interface OrderItem {
  id: number;
  number?: string;
  status: string;
  date?: string;
  date_created?: string;
  total?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const hasHydrated = useHasHydrated();
  const router = useRouter();

  useEffect(() => {
    if (!hasHydrated) return;

    let isMounted = true;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const ordersRes = await fetch("/api/customer/orders?per_page=10", {
          method: "GET",
          cache: "no-store",
        });

        // ✅ Check status before extracting response text stream
        if (ordersRes.status === 401 || ordersRes.status === 403) {
          if (isMounted) router.replace("/login");
          return;
        }

        const text = await ordersRes.text();
        let data: any;

        try {
          data = JSON.parse(text);
        } catch {
          console.error("Orders API returned non-JSON text stream:", text);
          throw new Error("Orders API returned invalid response format.");
        }

        if (!ordersRes.ok || data.success === false) {
          throw new Error(data.message || "Failed to fetch customer orders");
        }

        if (isMounted) {
          setOrders(Array.isArray(data.orders) ? data.orders : []);
        }
      } catch (err: any) {
        console.error("Order payload syncing failed:", err);
        if (isMounted) {
          setError(err.message || "Unable to fetch orders from server");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, [hasHydrated, router]);

  if (!hasHydrated || loading) {
    return (
      <div className="py-20 text-center animate-pulse flex flex-col items-center justify-center space-y-3">
        <PackageOpen className="w-10 h-10 text-zinc-300 animate-bounce" />
        <p className="text-zinc-500 font-bold uppercase text-xs tracking-widest">
          Fetching Orders...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-2 border-dashed rounded-[2rem] p-16 text-center bg-red-50/50 max-w-xl mx-auto my-10">
        <p className="text-red-600 font-bold mb-6 uppercase text-xs tracking-widest">
          {error}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-block bg-black text-white px-8 py-3 rounded-2xl text-xs font-black uppercase hover:bg-zinc-800 transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black italic uppercase tracking-tight">
            Orders
          </h2>
          <p className="text-zinc-500 text-xs font-medium">
            Manage and track your previous purchases.
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="border-2 border-dashed rounded-[2rem] p-16 text-center bg-zinc-50/50">
          <p className="text-zinc-400 font-medium mb-6 uppercase text-xs tracking-widest">
            No order has been made yet.
          </p>
          <Link
            href="/shop"
            className="inline-block bg-black text-white px-8 py-3 rounded-2xl text-xs font-black uppercase hover:bg-zinc-800 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="bg-white border rounded-[2rem] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 border-b border-zinc-100">
                <tr>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-widest text-zinc-400">
                    Order ID
                  </th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-widest text-zinc-400 text-center">
                    Date
                  </th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-widest text-zinc-400 text-center">
                    Status
                  </th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-widest text-zinc-400 text-right">
                    Total
                  </th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-widest text-zinc-400 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-50">
                {orders.map((order) => {
                  // ✅ Support fallback mapping across both standard and custom format parameters
                  const targetDate = order.date || order.date_created;
                  
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-zinc-50/50 transition-colors group"
                    >
                      <td className="px-6 py-5 font-black text-zinc-900">
                        #{order.number || order.id}
                      </td>

                      <td className="px-6 py-5 text-center font-medium text-zinc-600">
                        {targetDate
                          ? new Date(targetDate).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "-"}
                      </td>

                      <td className="px-6 py-5 text-center">
                        <span
                          className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border",
                            statusStyles[order.status] ||
                              "bg-zinc-100 text-zinc-600 border-zinc-200"
                          )}
                        >
                          {order.status || "unknown"}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-right font-black text-blue-600">
                        ₹{order.total || "0"}
                      </td>

                      <td className="px-6 py-5 text-right">
                        <Link
                          href={`/account/orders/${order.id}`}
                          className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-zinc-400 hover:text-black transition-colors"
                        >
                          <Eye size={14} />
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
