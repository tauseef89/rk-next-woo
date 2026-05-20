// components/home-comp/category-carousel.tsx
"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

export default function CategoryCarousel({ 
  categories 
}: { 
  categories: any[] 
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: "start", 
    loop: false, // Set to false so the "View All" card stays at the end
    dragFree: true,
    containScroll: "trimSnaps"
  });

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  if (!categories.length) return null;

  return (
    <div className="py-12 space-y-8">
      <div className="">
        <h3 className="text-3xl font-bold text-blue-950 text-center">Shop by <span className="bg-red-700 text-white rounded-lg px-4 py-1">Category</span></h3>        
        <div className="flex gap-3">
          <div className={`flex gap-3 ${categories.length <= 6 ? 'lg:hidden' : 'lg:flex'} ${categories.length <= 2 ? 'hidden' : 'flex'}`}>
            <button onClick={scrollPrev} className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm hover:bg-black hover:text-white transition-all active:scale-90">
              <ChevronLeft size={20} />
            </button>
            <button onClick={scrollNext} className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm hover:bg-black hover:text-white transition-all active:scale-90">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
        <div className="flex -ml-6">
          {/* 1. Map Existing Categories */}
          {categories.map((cat) => (
            <div key={cat.id} className="flex-[0_0_45%] sm:flex-[0_0_33.33%] md:flex-[0_0_25%] lg:flex-[0_0_14.28%] pl-6 pt-1">
              <Link href={`/shop/category/${cat.slug}`} className="group block text-center space-y-4 rounded-2xl border transition-all duration-500 hover:border-red-700">
                <div className="relative aspect-square overflow-hidden mb-0">
                  {cat.image?.src ? (
                    <Image src={cat.image.src} alt={cat.name} fill className="object-cover pointer-events-none transition-transform duration-700 group-hover:scale-110 p-6" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-zinc-100 text-zinc-400 font-bold text-xl uppercase">{cat.name.charAt(0)}</div>
                  )}
                </div>
                <div className="space-y-1 mb-4">
                  <h4 className="font-bold text-sm text-zinc-900 group-hover:text-primary transition-colors truncate">{cat.name.replace(/&amp;/g, '&')}</h4>
                  <p className="text-[10px] font-medium text-zinc-400 uppercase">{cat.count} Items</p>
                </div>
              </Link>
            </div>
          ))}

          {/* 2. The "View All" Final Slide */}
          <div className="flex-[0_0_45%] sm:flex-[0_0_33.33%] md:flex-[0_0_25%] lg:flex-[0_0_14.28%] pl-6">
            <Link href="/shop" className="group block text-center space-y-4 rounded-2xl border bg-zinc-100 p-6">
              <div className="relative aspect-square overflow-hidden rounded-full border-2 border-dashed border-zinc-200 bg-white flex items-center justify-center transition-all duration-500 group-hover:bg-red-700 group-hover:border-white">
                <ArrowRight size={32} className="text-zinc-400 transition-colors group-hover:text-white" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-zinc-900 group-hover:text-primary transition-colors">Explore All</h4>
                <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">Full Catalog</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
