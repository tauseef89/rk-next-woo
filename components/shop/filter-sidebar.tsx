"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition, useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider"; // Ensure this is installed

interface FilterSidebarProps {
  attributes?: {
    id: string;
    label: string;
    options: { label: string; value: string }[];
  }[];
  maxPriceLimit?: number; // Optional: Pass from server to set slider max
}

export function FilterSidebar({ attributes = [], maxPriceLimit = 200000 }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state for slider to ensure smooth UI dragging
  const [priceRange, setPriceRange] = useState([
    Number(searchParams.get("min_price")) || 0,
    Number(searchParams.get("max_price")) || maxPriceLimit,
  ]);

  // Sync slider state if URL changes (e.g., on Clear All)
  useEffect(() => {
    setPriceRange([
      Number(searchParams.get("min_price")) || 0,
      Number(searchParams.get("max_price")) || maxPriceLimit,
    ]);
  }, [searchParams, maxPriceLimit]);

  const updateFilters = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value); else params.delete(key);
      });
      params.delete("page");

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, searchParams, router]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h3 className="text-lg font-bold tracking-tight">Filters</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push(pathname)} 
          className="h-8 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
        >
          Clear All
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["sort", "price"]}>
        
        {/* 1. Sort Order */}
        <AccordionItem value="sort">
          <AccordionTrigger className="text-sm font-semibold uppercase tracking-wider">Sort By</AccordionTrigger>
          <AccordionContent className="space-y-3 pt-2">
            {[
              { label: "Latest", orderby: "date", order: "desc" },
              { label: "Price: Low to High", orderby: "price", order: "asc" },
              { label: "Price: High to Low", orderby: "price", order: "desc" },
            ].map((sort) => (
              <div key={sort.label} className="flex items-center space-x-2">
                <Checkbox 
                  id={sort.label}
                  checked={searchParams.get("orderby") === sort.orderby && searchParams.get("order") === sort.order}
                  onCheckedChange={() => updateFilters({ orderby: sort.orderby, order: sort.order })}
                />
                <Label htmlFor={sort.label} className="text-sm font-normal cursor-pointer">{sort.label}</Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* 2. Price Slider Section */}
        <AccordionItem value="price">
          <AccordionTrigger className="text-sm font-semibold uppercase tracking-wider">Price Range</AccordionTrigger>
          <AccordionContent className="pt-6 px-2 pb-4 space-y-6">
            <Slider
              defaultValue={[0, maxPriceLimit]}
              value={priceRange}
              min={0}
              max={maxPriceLimit}
              step={1000}
              onValueChange={(value) => setPriceRange(value)}
              onValueCommit={(value) => {
                updateFilters({ 
                  min_price: value[0].toString(), 
                  max_price: value[1].toString() 
                });
              }}
            />
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-muted-foreground uppercase">Min Price</span>
                <span className="text-sm font-mono font-bold">₹{priceRange[0].toLocaleString()}</span>
              </div>
              <div className="flex flex-col gap-1 text-right">
                <span className="text-[10px] text-muted-foreground uppercase">Max Price</span>
                <span className="text-sm font-mono font-bold">₹{priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 3. Dynamic Attributes */}
        {attributes
          .filter((attr) => attr.options && attr.options.length > 0)
          .map((attr) => (
          <AccordionItem key={attr.id} value={attr.id}>
            <AccordionTrigger className="text-sm font-semibold uppercase tracking-wider">{attr.label}</AccordionTrigger>
            <AccordionContent className="space-y-2 pt-2">
              {attr.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${attr.id}-${option.value}`}
                    checked={searchParams.get("attribute_term") === option.value}
                    onCheckedChange={(checked) => {
                      updateFilters({
                        attribute: checked ? attr.id : undefined,
                        attribute_term: checked ? option.value : undefined,
                      });
                    }}
                  />
                  <Label htmlFor={`${attr.id}-${option.value}`} className="text-sm font-normal cursor-pointer">{option.label}</Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {isPending && (
        <div className="flex items-center justify-center pt-4">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="ml-2 text-[10px] text-muted-foreground tracking-widest">FILTERING...</span>
        </div>
      )}
    </div>
  );
}
