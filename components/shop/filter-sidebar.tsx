"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition, useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface FilterSidebarProps {
  attributes?: {
    id: string;
    label: string;
    options: { label: string; value: string }[];
  }[];
  brands?: { label: string; value: string }[];
  maxPriceLimit?: number;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function normalizePriceRange(value: number[], maxPriceLimit: number) {
  let min = Number(value[0]) || 0;
  let max = Number(value[1]) || maxPriceLimit;

  min = Math.max(0, Math.min(min, maxPriceLimit));
  max = Math.max(0, Math.min(max, maxPriceLimit));

  if (min > max) {
    [min, max] = [max, min];
  }

  return [min, max];
}

export function FilterSidebar({
  attributes = [],
  brands = [],
  maxPriceLimit = 200000,
}: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [priceRange, setPriceRange] = useState<number[]>([
    Number(searchParams.get("min_price")) || 0,
    Number(searchParams.get("max_price")) || maxPriceLimit,
  ]);

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
        if (value && value.trim() !== "") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      params.delete("page");

      const query = params.toString();

      startTransition(() => {
        router.push(query ? `${pathname}?${query}` : pathname, {
          scroll: false,
        });
      });
    },
    [pathname, searchParams, router]
  );

  const applyPriceFilter = useCallback(
    (range: number[]) => {
      const [min, max] = normalizePriceRange(range, maxPriceLimit);

      setPriceRange([min, max]);

      updateFilters({
        min_price: min > 0 ? String(min) : undefined,
        max_price: max < maxPriceLimit ? String(max) : undefined,
      });
    },
    [maxPriceLimit, updateFilters]
  );

  const resetPriceFilter = () => {
    setPriceRange([0, maxPriceLimit]);

    updateFilters({
      min_price: undefined,
      max_price: undefined,
    });
  };

  const quickPriceRanges = [
    {
      label: "Under ₹25k",
      range: [0, 25000],
    },
    {
      label: "₹25k - ₹50k",
      range: [25000, 50000],
    },
    {
      label: "₹50k - ₹1L",
      range: [50000, 100000],
    },
    {
      label: "₹1L+",
      range: [100000, maxPriceLimit],
    },
  ];
  const shouldHideBrandFilter = pathname === "/shop" && Boolean(searchParams.get("product_brand"));
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h3 className="text-lg font-bold tracking-tight">Filters</h3>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(pathname)}
          className="h-8 text-xs hover:bg-destructive/10 hover:text-destructive"
        >
          Clear All
        </Button>
      </div>

      <Accordion
        type="multiple"
        defaultValue={["sort", "price", "product_brand"]}
      >
        {/* Brand */}
        {brands.length > 0 && !shouldHideBrandFilter && (
          <AccordionItem value="product_brand" className="border-b">
            <AccordionTrigger className="text-sm font-bold uppercase tracking-wider text-primary">
              Filter By Brand
            </AccordionTrigger>

            <AccordionContent className="space-y-2 pt-2 max-h-52 overflow-y-auto pr-2 scrollbar-thin">
              {brands.map((brand) => {
                const currentBrands =
                  searchParams.get("product_brand")?.split(",") || [];
                const isChecked = currentBrands.includes(brand.value);

                return (
                  <div
                    key={brand.value}
                    className="flex items-center space-x-2 py-0.5"
                  >
                    <Checkbox
                      id={`brand-${brand.value}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        const newValues = checked
                          ? [...currentBrands, brand.value]
                          : currentBrands.filter((v) => v !== brand.value);

                        updateFilters({
                          product_brand:
                            newValues.length > 0
                              ? newValues.join(",")
                              : undefined,
                        });
                      }}
                    />

                    <Label
                      htmlFor={`brand-${brand.value}`}
                      className="text-sm font-normal cursor-pointer select-none"
                    >
                      {brand.label}
                    </Label>
                  </div>
                );
              })}
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Sort */}
        <AccordionItem value="sort">
          <AccordionTrigger className="text-sm font-semibold uppercase tracking-wider">
            Sort By
          </AccordionTrigger>

          <AccordionContent className="space-y-3 pt-2">
            {[
              { label: "Latest", orderby: "date", order: "desc" },
              { label: "Price: Low to High", orderby: "price", order: "asc" },
              { label: "Price: High to Low", orderby: "price", order: "desc" },
            ].map((sort) => (
              <div key={sort.label} className="flex items-center space-x-2">
                <Checkbox
                  id={sort.label}
                  checked={
                    searchParams.get("orderby") === sort.orderby &&
                    searchParams.get("order") === sort.order
                  }
                  onCheckedChange={() =>
                    updateFilters({
                      orderby: sort.orderby,
                      order: sort.order,
                    })
                  }
                />

                <Label
                  htmlFor={sort.label}
                  className="text-sm font-normal cursor-pointer"
                >
                  {sort.label}
                </Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* Improved Price Filter */}
        <AccordionItem value="price">
          <AccordionTrigger className="text-sm font-semibold uppercase tracking-wider">
            Price Range
          </AccordionTrigger>

          <AccordionContent className="pt-5 pb-4 space-y-5">
            {/* Price Display */}
            <div className="rounded-2xl border bg-muted/30 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Min
                  </p>
                  <p className="text-sm font-bold">
                    {formatPrice(priceRange[0])}
                  </p>
                </div>

                <div className="h-px flex-1 bg-border" />

                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Max
                  </p>
                  <p className="text-sm font-bold">
                    {formatPrice(priceRange[1])}
                  </p>
                </div>
              </div>
            </div>

            {/* Slider */}
            <div className="px-2">
              <Slider
                value={priceRange}
                min={0}
                max={maxPriceLimit}
                step={1000}
                minStepsBetweenThumbs={1}
                onValueChange={(value) => {
                  const normalized = normalizePriceRange(
                    value,
                    maxPriceLimit
                  );

                  setPriceRange(normalized);
                }}
              />
            </div>

            {/* Manual Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Min Price
                </Label>

                <div className="flex items-center rounded-xl border bg-white px-3">
                  <span className="text-xs text-muted-foreground">₹</span>

                  <input
                    type="number"
                    min={0}
                    max={maxPriceLimit}
                    step={1000}
                    value={priceRange[0]}
                    onChange={(e) => {
                      const value = Number(e.target.value) || 0;
                      setPriceRange(
                        normalizePriceRange(
                          [value, priceRange[1]],
                          maxPriceLimit
                        )
                      );
                    }}
                    className="w-full bg-transparent p-2 text-sm font-semibold outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Max Price
                </Label>

                <div className="flex items-center rounded-xl border bg-white px-3">
                  <span className="text-xs text-muted-foreground">₹</span>

                  <input
                    type="number"
                    min={0}
                    max={maxPriceLimit}
                    step={1000}
                    value={priceRange[1]}
                    onChange={(e) => {
                      const value = Number(e.target.value) || maxPriceLimit;
                      setPriceRange(
                        normalizePriceRange(
                          [priceRange[0], value],
                          maxPriceLimit
                        )
                      );
                    }}
                    className="w-full bg-transparent p-2 text-sm font-semibold outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Quick Ranges */}
            <div className="flex flex-wrap gap-2">
              {quickPriceRanges.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => applyPriceFilter(item.range)}
                  className="rounded-full border bg-white px-3 py-1.5 text-[11px] font-semibold text-muted-foreground transition hover:border-black hover:text-black"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetPriceFilter}
                className="rounded-xl"
              >
                Reset
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={() => applyPriceFilter(priceRange)}
                className="rounded-xl"
              >
                Apply Price
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Attributes */}
        {attributes.map((attr) => (
          <AccordionItem key={attr.id} value={attr.id}>
            <AccordionTrigger className="text-sm font-semibold uppercase tracking-wider">
              {attr.label}
            </AccordionTrigger>

            <AccordionContent className="space-y-2 pt-2">
              {attr.options.map((option) => {
                const currentValues =
                  searchParams.get(attr.id)?.split(",") || [];
                const isChecked = currentValues.includes(option.value);

                return (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2 py-0.5"
                  >
                    <Checkbox
                      id={`${attr.id}-${option.value}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        const newValues = checked
                          ? [...currentValues, option.value]
                          : currentValues.filter((v) => v !== option.value);

                        updateFilters({
                          [attr.id]:
                            newValues.length > 0
                              ? newValues.join(",")
                              : undefined,
                        });
                      }}
                    />

                    <Label
                      htmlFor={`${attr.id}-${option.value}`}
                      className="text-sm font-normal cursor-pointer select-none"
                    >
                      {option.label}
                    </Label>
                  </div>
                );
              })}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {isPending && (
        <div className="flex items-center justify-center pt-4">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="ml-2 text-[10px] text-muted-foreground tracking-widest">
            FILTERING...
          </span>
        </div>
      )}
    </div>
  );
}