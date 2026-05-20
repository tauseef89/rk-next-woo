"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useHasHydrated } from "@/hooks/useHasHydrated";
import { ArrowLeft, Truck, CreditCard, AlertCircle, Printer, ShoppingBag, CheckCircle2, Clock, Package } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, { color: string; icon: any; step: number }> = {
  pending: { color: "bg-amber-50 text-amber-700 border-amber-100", icon: Clock, step: 1 },
  processing: { color: "bg-blue-50 text-blue-700 border-blue-100", icon: Package, step: 2 },
  onhold: { color: "bg-zinc-100 text-zinc-600 border-zinc-200", icon: AlertCircle, step: 2 },
  completed: { color: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: CheckCircle2, step: 4 },
  cancelled: { color: "bg-red-50 text-red-700 border-red-100", icon: AlertCircle, step: 0 },
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasHydrated = useHasHydrated();

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load order");
        setOrder(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrderDetail();
  }, [id]);

  if (!hasHydrated || loading) return (
    <div className="py-40 text-center animate-pulse uppercase text-[10px] font-black tracking-[0.2em] text-zinc-400">
      Synchronizing Order #{id}...
    </div>
  );

  if (error || !order) return (
    <div className="py-40 text-center space-y-6">
      <AlertCircle className="mx-auto w-12 h-12 text-zinc-200" />
      <p className="text-zinc-500 font-black uppercase text-xs tracking-widest">{error || "Order not found"}</p>
      <Link href="/account/orders" className="inline-block bg-black text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest">Return to History</Link>
    </div>
  );

  const currentStatus = statusStyles[order.status] || { color: "bg-zinc-100", icon: Package, step: 1 };
  const StatusIcon = currentStatus.icon;

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-10 px-6">
      {/* Top Bar - Hidden on Print */}
      <div className="flex items-center justify-between print:hidden">
        <Link href="/account/orders" className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-400 hover:text-black transition-all">
          <ArrowLeft size={14} /> Order History
        </Link>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-400 hover:text-black transition-all"
        >
          <Printer size={14} /> Print Invoice
        </button>
      </div>

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-zinc-100 pb-10">
        <div className="space-y-3">
          <div className={cn("inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight border", currentStatus.color)}>
            <StatusIcon size={12} /> {order.status}
          </div>
          <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.85]">
            #{order.number}
          </h1>
          <p className="text-zinc-400 font-black uppercase text-[10px] tracking-widest">
            Confirmed {new Date(order.date_created).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Progress Tracker */}
      <div className="grid grid-cols-4 gap-2 print:hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={cn(
            "h-1.5 rounded-full transition-all duration-1000",
            currentStatus.step >= i ? "bg-black" : "bg-zinc-100"
          )} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-10">
        
        {/* Left: Items (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Items Ordered</h3>
          <div className="border-2 border-black rounded-[2.5rem] bg-white overflow-hidden shadow-xl shadow-zinc-100">
            <div className="divide-y-2 divide-zinc-50">
              {order.line_items.map((item: any) => (
                <div key={item.id} className="p-8 flex items-center justify-between group">
                  <div className="space-y-1">
                    <Link href={`/shop/${item.slug || item.product_id}`} className="hover:text-blue-600 transition-colors">{item.name}</Link>

                    <div className="flex items-center gap-4">
                      <p className="text-[10px] font-black uppercase text-zinc-400">Qty: {item.quantity}</p>
                      <p className="text-[10px] font-black uppercase text-zinc-400">Price: ₹{item.price}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-lg">₹{item.total}</p>
                    {order.status === 'completed' && (
                      <Link href={`/product/${item.product_id}`} className="text-[9px] font-black uppercase text-blue-600 hover:underline">Buy it again</Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Totals Section */}
            <div className="bg-zinc-50 p-8 border-t-2 border-black space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase text-zinc-400">
                <span>Shipping</span>
                <span>₹{order.shipping_total}</span>
              </div>
              <div className="flex justify-between text-2xl font-black uppercase italic">
                <span>Total Paid</span>
                <span className="text-blue-600">₹{order.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Info Sidebar (1/3 width) */}
        <div className="space-y-6">
          <section className="p-8 border-2 border-zinc-100 rounded-[2rem] space-y-4">
            <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <Truck size={14} /> Shipping
            </h3>
            <div className="text-xs font-bold text-zinc-600 leading-relaxed uppercase">
              {order.shipping.first_name} {order.shipping.last_name}<br />
              {order.shipping.address_1}<br />
              {order.shipping.city}, {order.shipping.postcode}<br />
              {order.shipping.country}
            </div>
          </section>

          <section className="p-8 border-2 border-zinc-100 rounded-[2rem] space-y-4 bg-zinc-50/50">
            <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <CreditCard size={14} /> Payment
            </h3>
            <div className="space-y-1">
              <p className="text-xs font-black uppercase">{order.payment_method_title}</p>
              <p className="text-[9px] font-black uppercase text-zinc-400 tracking-tighter">ID: {order.transaction_id || 'N/A'}</p>
            </div>
          </section>

          {order.customer_note && (
            <section className="p-8 border-2 border-amber-100 bg-amber-50/30 rounded-[2rem] space-y-2">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-700">Note for Seller</h3>
              <p className="text-xs font-medium text-amber-800 italic">"{order.customer_note}"</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
