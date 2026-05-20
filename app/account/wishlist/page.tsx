"use client";

import { Button } from "@/components/ui/button";
import { useWishlistStore } from "@/store/useWishlistStore";
import { Heart, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function WishlistPage() {
  const { items, setItems, removeItem } = useWishlistStore() as any;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/wishlist")
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      });
  }, []);

  const handleRemove = async (productId: number) => {
    const wishlistId = items.find((i: any) => i.productId === productId)?.wishlistId || 0;
    const res = await fetch("/api/wishlist", {
      method: "DELETE",
      body: JSON.stringify({ productId, wishlistId }),
    });
    if (res.ok) removeItem(productId);
  };

  if (loading) return <p>Loading Wishlist...</p>;

  return (
  <div className="max-w-7xl mx-auto px-4 py-12">
    {/* PAGE HEADER */}
    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
      <div>
        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-zinc-900">
          My <span className="text-blue-600">Wishlist</span>
        </h1>
        <p className="text-zinc-500 text-sm mt-1 font-medium">
          Manage your favorite items and move them to cart.
        </p>
      </div>
      <div className="px-4 py-2 bg-zinc-100 rounded-2xl text-xs font-black uppercase text-zinc-600">
        {items.length} Saved Items
      </div>
    </div>

    {/* CONTENT GRID */}
    {items.length === 0 ? (
      <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[3rem] py-24 text-center">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-zinc-100">
          <Heart className="w-10 h-10 text-zinc-200" />
        </div>
        <h3 className="text-xl font-bold text-zinc-900 mb-2">Your wishlist is empty</h3>
        <p className="text-zinc-500 text-sm mb-8 max-w-xs mx-auto">
          Add items you love to your wishlist to keep track of them.
        </p>
        <Button asChild className="rounded-2xl bg-zinc-900 px-8 h-12 font-bold uppercase text-xs tracking-widest hover:bg-blue-600">
          <Link href="/shop">Start Shopping</Link>
        </Button>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item: any) => {
          // YITH API usually nests product data inside a 'product' key
          const product = item.product || item;
          
          return (
            <div 
              key={product.id} 
              className="group relative bg-white border border-zinc-100 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500"
            >
              {/* REMOVE BUTTON */}
              <button 
                onClick={() => handleRemove(product.id)}
                className="absolute top-4 right-4 z-10 p-3 bg-white/80 backdrop-blur-md rounded-2xl text-zinc-400 hover:text-red-500 shadow-sm transition-colors"
                title="Remove Item"
              >
                <Trash2 size={18} />
              </button>

              {/* PRODUCT IMAGE */}
              <div className="aspect-square bg-zinc-100 overflow-hidden">
                <img 
                  src={product.images?.[0]?.src || "/placeholder.png"} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>

              {/* PRODUCT DETAILS */}
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest">
                    {product.categories?.[0]?.name || "Collection"}
                  </p>
                  <h3 className="text-lg font-bold text-zinc-900 leading-tight group-hover:text-blue-600 transition-colors truncate">
                    {product.name}
                  </h3>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xl font-black text-zinc-950">₹{product.price}</span>
                    {product.regular_price && product.regular_price !== product.price && (
                      <span className="text-xs text-zinc-400 line-through font-medium">₹{product.regular_price}</span>
                    )}
                  </div>
                  
                  <Button asChild size="sm" className="rounded-xl bg-zinc-950 hover:bg-blue-600 px-4 h-10 font-bold text-[10px] uppercase">
                    <Link href={`/product/${product.slug}`}>
                      View
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

}
