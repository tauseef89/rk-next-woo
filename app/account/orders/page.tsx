"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useHasHydrated } from "@/hooks/useHasHydrated";
import { Eye, PackageOpen } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const hasHydrated = useHasHydrated();

  useEffect(() => {
    const token = localStorage.getItem("woo-token");
    if (!token) return;

    const fetchOrders = async () => {
      try {
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = await userRes.json();

        if (user.id) {
          const ordersRes = await fetch(`/api/orders?userId=${user.id}`);
          const data = await ordersRes.json();
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Order fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (!hasHydrated || loading) return (
    <div className="py-20 text-center animate-pulse">
      <PackageOpen className="mx-auto w-10 h-10 text-zinc-300 mb-2" />
      <p className="text-zinc-500 font-bold uppercase text-xs tracking-widest">Fetching Orders...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black italic uppercase tracking-tight">Orders</h2>
          <p className="text-zinc-500 text-xs font-medium">Manage and track your previous purchases.</p>
        </div>
      </div>
      
      {orders.length === 0 ? (
        <div className="border-2 border-dashed rounded-[2rem] p-16 text-center bg-zinc-50/50">
          <p className="text-zinc-400 font-medium mb-6 uppercase text-xs tracking-widest">No order has been made yet.</p>
          <Link href="/shop" className="inline-block bg-black text-white px-8 py-3 rounded-2xl text-xs font-black uppercase hover:bg-zinc-800 transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="bg-white border rounded-[2rem] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 border-b border-zinc-100">
                <tr>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-widest text-zinc-400">Order ID</th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-widest text-zinc-400 text-center">Date</th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-widest text-zinc-400 text-center">Status</th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-widest text-zinc-400 text-right">Total</th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-widest text-zinc-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="px-6 py-5 font-black text-zinc-900">#{order.number}</td>
                    <td className="px-6 py-5 text-center font-medium text-zinc-600">
                      {new Date(order.date_created).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border",
                        statusStyles[order.status] || "bg-zinc-100 text-zinc-600 border-zinc-200"
                      )}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right font-black text-blue-600">
                      ₹{order.total}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const statusStyles: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
  processing: "bg-blue-50 text-blue-700 border-blue-100",
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  cancelled: "bg-red-50 text-red-700 border-red-100",
  onhold: "bg-zinc-100 text-zinc-600 border-zinc-200",
};
