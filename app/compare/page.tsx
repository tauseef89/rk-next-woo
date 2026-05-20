'use client';

import { useEffect, useState } from 'react';
import { useCompareStore } from "@/store/useCompareStore";
import { useHasHydrated } from "@/hooks/useHasHydrated";
import { formatPrice } from "@/lib/woocommerce";
import Image from "next/image";
import Link from "next/link";
import { X, ArrowLeft, Scale } from "lucide-react";
import { cn } from '@/lib/utils';

export default function ComparePage() {
  const { compareIds, removeFromCompare } = useCompareStore();
  const hydrated = useHasHydrated();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompareData() {
      if (compareIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/compare?ids=${compareIds.join(',')}`);
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Comparison fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    if (hydrated) fetchCompareData();
  }, [compareIds, hydrated]);

  if (!hydrated || loading) {
    return (
      <div className="container mx-auto py-20 px-4 space-y-4 animate-pulse">
        <div className="h-10 w-48 bg-gray-200 rounded" />
        <div className="h-125 w-full bg-gray-100 rounded-xl" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container mx-auto py-32 px-4 text-center">
        <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Scale className="w-10 h-10 text-blue-500" />
        </div>
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Your comparison list is empty</h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">Add at least two products to compare their technical specifications side-by-side.</p>
        <Link href="/shop" className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-all">
          <ArrowLeft className="w-4 h-4" /> Start Shopping
        </Link>
      </div>
    );
  }

  const allAttributeNames = Array.from(
    new Set(products.flatMap(p => p.attributes?.map((a: any) => a.name) || []))
  );

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Compare</h1>
          <p className="text-gray-500 font-medium">Finding the best one for you</p>
        </div>
        <div className="text-sm font-bold px-4 py-2 bg-gray-100 rounded-full text-gray-600">
          {products.length} / 4 Products
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse table-fixed">
            <thead>
              <tr className="bg-white">
                {/* Sticky Corner Cell */}
                <th className="sticky left-0 z-30 p-6 bg-gray-50 border-b w-64 text-left font-bold text-gray-800 uppercase text-xs tracking-widest">
                  Specifications
                </th>
                {products.map((product) => (
                  <th key={product.id} className="p-6 border-b border-l min-w-70 relative align-top bg-white">
                    <button
                      onClick={() => removeFromCompare(product.id)}
                      className="absolute top-2 right-2 p-1.5 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 cursor-pointer" />
                    </button>
                    
                    <div className="flex flex-col items-center">
                      <div className="relative w-36 h-36 mb-4">
                        <Image
                          src={product.images[0]?.src || '/placeholder.png'}
                          alt={product.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <Link 
                        href={`/shop/${product.slug}`} 
                        className="font-bold text-gray-900 hover:text-blue-600 line-clamp-2 text-sm leading-snug mb-2"
                      >
                        {product.name}
                      </Link>
                      <div className="text-xl font-black text-red-800">
                        {formatPrice(product.price)}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-100">
              {allAttributeNames.map((attrName) => {
                // Check if values are different across products to highlight the row
                const values = products.map(p => p.attributes?.find((a: any) => a.name === attrName)?.options.join(', '));
                const isDifferent = new Set(values).size > 1;

                return (
                  <tr key={attrName as string} className="group transition-colors">
                    <td className={cn(
                      "sticky left-0 z-20 p-4 font-bold text-sm transition-colors border-r",
                      isDifferent ? "bg-blue-50/50 text-blue-950" : "bg-gray-50 text-gray-600"
                    )}>
                      {attrName as string}
                    </td>
                    {products.map((product) => {
                      const attr = product.attributes?.find((a: any) => a.name === attrName);
                      return (
                        <td key={product.id} className="p-4 border-l text-center text-sm font-medium text-gray-700">
                          {attr ? attr.options.join(", ") : <span className="text-gray-300">—</span>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              <tr className="group hover:bg-gray-50">
                <td className="sticky left-0 z-20 p-4 bg-gray-50 font-bold text-sm text-gray-600 border-r">Availability</td>
                {products.map((product) => (
                  <td key={product.id} className="p-4 border-l text-center text-sm">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold uppercase",
                      product.stock_status === 'instock' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    )}>
                      {product.stock_status === 'instock' ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="sticky left-0 z-20 p-4 bg-gray-50 border-r"></td>
                {products.map((product) => (
                  <td key={product.id} className="p-8 border-l text-center">
                    <Link
                      href={`/shop/${product.slug}`}
                      className="inline-flex items-center justify-center w-full bg-blue-950 hover:bg-red-800 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-blue-200"
                    >
                      Buy Now
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <p className="mt-6 text-center text-gray-400 text-xs italic">
        * Prices and specifications are subject to change without notice.
      </p>
    </div>
  );
}
