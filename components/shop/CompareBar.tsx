'use client';

import { useEffect, useState } from 'react';
import { useCompareStore } from '@/store/useCompareStore';
import { useHasHydrated } from '@/hooks/useHasHydrated';
import Link from 'next/link';
import Image from 'next/image';
import { X, ArrowLeftRight, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CompareBar() {
  const { compareIds, clearCompare, removeFromCompare } = useCompareStore();
  const hydrated = useHasHydrated();
  const [products, setProducts] = useState<any[]>([]);
  const [isExpanded, setIsExpanded] = useState(false); // Mobile toggle state

  useEffect(() => {
    async function fetchThumbnails() {
      if (compareIds.length === 0) {
        setProducts([]);
        setIsExpanded(false);
        return;
      }
      const res = await fetch(`/api/compare?ids=${compareIds.join(',')}`);
      const data = await res.json();
      setProducts(data);
    }
    if (hydrated) fetchThumbnails();
  }, [compareIds, hydrated]);

  if (!hydrated || compareIds.length === 0) return null;

  return (
    <>
      {/* MOBILE FLOATING BUTTON (Visible only on mobile when bar is collapsed) */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="fixed bottom-6 right-6 z-[100] md:hidden bg-blue-600 text-white p-4 rounded-full shadow-xl flex items-center gap-2 animate-bounce"
        >
          <ArrowLeftRight className="w-5 h-5" />
          <span className="font-bold text-sm">{compareIds.length}</span>
        </button>
      )}

      {/* THE MAIN BAR */}
      <div 
        className={cn(
          "fixed bottom-0 left-0 right-0 bg-white border-t border-blue-100 shadow-[0_-10px_25px_rgba(0,0,0,0.1)] z-[999] transition-transform duration-300 ease-in-out",
          // On mobile: translate off-screen if not expanded. On desktop: always visible.
          !isExpanded ? "translate-y-full md:translate-y-0" : "translate-y-0"
        )}
      >
        {/* Mobile Header: Allows closing the bar on small screens */}
        <div className="flex md:hidden items-center justify-between p-2 bg-gray-50 border-b">
          <span className="text-xs font-bold text-gray-500 px-2 uppercase">Compare List</span>
          <button onClick={() => setIsExpanded(false)} className="p-1">
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="max-w-7xl mx-auto p-3 md:p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto overflow-x-auto no-scrollbar">
            <div className="hidden lg:block">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <ArrowLeftRight className="w-4 h-4" />
                <p className="font-bold leading-none">Compare</p>
              </div>
              <p className="text-xs text-gray-500 font-medium">{compareIds.length}/4 added</p>
            </div>
            
            {/* Product Thumbnails */}
            <div className="flex gap-2 md:gap-3">
              {products.map((product) => (
                <div key={product.id} className="group relative w-14 h-14 md:w-16 md:h-16 border border-gray-100 rounded-lg bg-gray-50 p-1 shrink-0">
                  <Image 
                    src={product.images[0]?.src || '/placeholder.png'} 
                    alt={product.name} 
                    fill 
                    className="object-contain p-1"
                  />
                  <button 
                    onClick={() => removeFromCompare(product.id)}
                    className="absolute top-0 right-0 bg-white border shadow-sm rounded-full p-0.5 text-gray-400 hover:text-white hover:bg-red-700 hover:border-red-700"
                  >
                    <X className="w-3 h-3 cursor-pointer" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 w-full md:w-auto border-t md:border-0 pt-3 md:pt-0">
            <button 
              onClick={clearCompare}
              className="text-xs font-bold text-gray-400 hover:text-red-500 uppercase flex-1 md:flex-none"
            >
              Clear All
            </button>
            <Link 
              href="/compare"
              className="bg-red-800 hover:bg-blue-950 text-white px-8 py-3 rounded-md font-black text-sm transition-all shadow-md uppercase text-center flex-1 md:flex-none"
            >
              Compare Now
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
