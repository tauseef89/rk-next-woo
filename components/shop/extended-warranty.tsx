"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/lib/woocommerce.d";

// Kept for backward compatibility if this constant is used elsewhere.
// Warranty is now price-slab based, not percentage based.
export const EXTENDED_WARRANTY_PERCENTAGE = 0;

export type WarrantyCategory =
  | "ac"
  | "tv"
  | "refrigerator"
  | "washing-machine"
  | "home-entertainment"
  | "microwave"
  | "air-cooler";

export type WarrantyPlanYears = 1 | 2 | 3 | 4;

export type AppliedExtendedWarranty = {
  title: string;
  price: number;
  planYears: WarrantyPlanYears;
  category: WarrantyCategory;

  // Retained so existing cart/order logic does not break.
  percentage: number;
};

type WarrantyTier = {
  upTo: number;
  plans: Partial<Record<WarrantyPlanYears, number>>;
};

type WarrantyTable = {
  label: string;
  tiers: WarrantyTier[];
};

type ExtendedWarrantyProps = {
  productPrice: string | number;
  warrantyCategory: WarrantyCategory | null;
  selected: boolean;
  onChange: (warranty: AppliedExtendedWarranty | null) => void;
};

export const EXTENDED_WARRANTY_TABLE: Record<
  WarrantyCategory,
  WarrantyTable
> = {
  ac: {
    label: "Air Conditioner",
    tiers: [
      { upTo: 10000, plans: { 1: 450, 2: 600, 3: 850 } },
      { upTo: 15000, plans: { 1: 1199, 2: 1999, 3: 2499 } },
      { upTo: 20000, plans: { 1: 1596, 2: 2315, 3: 2991 } },
      { upTo: 30000, plans: { 1: 2253, 2: 3180, 3: 4274 } },
      { upTo: 35000, plans: { 1: 2799, 2: 3999, 3: 5499 } },
      { upTo: 40000, plans: { 1: 3103, 2: 4380, 3: 5984 } },
      { upTo: 45000, plans: { 1: 3599, 2: 5299, 3: 7199 } },
      { upTo: 50000, plans: { 1: 3853, 2: 5580, 3: 7692 } },
      { upTo: 60000, plans: { 1: 4803, 2: 6780, 3: 9403 } },
      { upTo: 70000, plans: { 1: 5653, 2: 7980, 3: 11112 } },
      { upTo: 80000, plans: { 1: 6503, 2: 9180, 3: 12822 } },
    ],
  },

  tv: {
    label: "TV",
    tiers: [
      { upTo: 10000, plans: { 1: 1049, 2: 1599, 3: 2629 } },
      { upTo: 15000, plans: { 1: 1219, 2: 1599, 3: 2629 } },
      { upTo: 20000, plans: { 1: 1599, 2: 2299, 3: 3149 } },
      { upTo: 25000, plans: { 1: 2049, 2: 2899, 3: 4049 } },
      { upTo: 30000, plans: { 1: 2519, 2: 3519, 3: 4949 } },
      { upTo: 35000, plans: { 1: 2939, 2: 4149, 3: 5829 } },
      { upTo: 40000, plans: { 1: 3399, 2: 4799, 3: 6749 } },
      { upTo: 45000, plans: { 1: 3839, 2: 5399, 3: 7599 } },
      { upTo: 50000, plans: { 1: 4399, 2: 6039, 3: 8499 } },
      { upTo: 60000, plans: { 1: 4999, 2: 6999, 3: 9899 } },
      { upTo: 70000, plans: { 1: 5939, 2: 8249, 3: 11599 } },
      { upTo: 80000, plans: { 1: 6899, 2: 9499, 3: 13399 } },
      { upTo: 90000, plans: { 1: 7799, 2: 10799, 3: 15199 } },
      { upTo: 100000, plans: { 1: 8799, 2: 12099, 3: 16999 } },
    ],
  },

  refrigerator: {
    label: "Refrigerator",
    tiers: [
      { upTo: 10000, plans: { 1: 599, 2: 799, 3: 1099, 4: 1865 } },
      { upTo: 15000, plans: { 1: 874, 2: 1312, 3: 1874, 4: 2283 } },
      { upTo: 20000, plans: { 1: 1224, 2: 1837, 3: 2624, 4: 3195 } },
      { upTo: 30000, plans: { 1: 1749, 2: 2624, 3: 3749, 4: 4565 } },
      { upTo: 40000, plans: { 1: 2449, 2: 3674, 3: 5249, 4: 6391 } },
      { upTo: 50000, plans: { 1: 3149, 2: 4724, 3: 6749, 4: 8217 } },
      { upTo: 60000, plans: { 1: 3849, 2: 5774, 3: 8249, 4: 10043 } },
      { upTo: 70000, plans: { 1: 4549, 2: 6824, 3: 9749, 4: 11868 } },
      { upTo: 80000, plans: { 1: 5249, 2: 7874, 3: 11249, 4: 13695 } },
      { upTo: 90000, plans: { 1: 5949, 2: 8924, 3: 12749, 4: 15521 } },
      { upTo: 100000, plans: { 1: 6649, 2: 9500, 3: 14249, 4: 17346 } },
      { upTo: 125000, plans: { 1: 7874, 2: 11812, 3: 16874, 4: 20541 } },
    ],
  },

  "washing-machine": {
    label: "Washing Machine / Dishwasher / Dryer",
    tiers: [
      { upTo: 10000, plans: { 1: 599, 2: 799, 3: 1099, 4: 1516 } },
      { upTo: 15000, plans: { 1: 999, 2: 1499, 3: 1999, 4: 2526 } },
      { upTo: 20000, plans: { 1: 1399, 2: 2099, 3: 2799, 4: 3536 } },
      { upTo: 30000, plans: { 1: 1999, 2: 2999, 3: 3999, 4: 5051 } },
      { upTo: 40000, plans: { 1: 2799, 2: 4199, 3: 5599, 4: 7071 } },
      { upTo: 50000, plans: { 1: 3599, 2: 5399, 3: 7199, 4: 9091 } },
      { upTo: 60000, plans: { 1: 4399, 2: 6599, 3: 8799, 4: 11112 } },
      { upTo: 70000, plans: { 1: 5199, 2: 7799, 3: 10399, 4: 13132 } },
    ],
  },

  "home-entertainment": {
    label: "Home Entertainment",
    tiers: [
      { upTo: 5000, plans: { 1: 600, 2: 699, 3: 833, 4: 1166 } },
      { upTo: 10000, plans: { 1: 600, 2: 900, 3: 1199, 4: 1499 } },
      { upTo: 15000, plans: { 1: 1000, 2: 1499, 3: 1999, 4: 2499 } },
      { upTo: 20000, plans: { 1: 1399, 2: 2098, 3: 2799, 4: 3499 } },
      { upTo: 30000, plans: { 1: 1998, 2: 2997, 3: 3999, 4: 4999 } },
      { upTo: 40000, plans: { 1: 2798, 2: 4196, 3: 5599, 4: 6999 } },
      { upTo: 50000, plans: { 1: 3597, 2: 5395, 3: 7199, 4: 8999 } },
      { upTo: 60000, plans: { 1: 4396, 2: 6594, 3: 8799, 4: 10999 } },
    ],
  },

  microwave: {
    label: "Microwave",
    tiers: [
      { upTo: 5000, plans: { 1: 499, 2: 599, 3: 799, 4: 2999 } },
      { upTo: 10000, plans: { 1: 599, 2: 899, 3: 1199, 4: 2999 } },
      { upTo: 15000, plans: { 1: 999, 2: 1499, 3: 1999, 4: 2999 } },
      { upTo: 20000, plans: { 1: 1399, 2: 2099, 3: 2799, 4: 3599 } },
      { upTo: 30000, plans: { 1: 1999, 2: 2999, 3: 3999, 4: 4649 } },
      { upTo: 40000, plans: { 1: 2799, 2: 4199, 3: 5599, 4: 6699 } },
      { upTo: 50000, plans: { 1: 3599, 2: 5399, 3: 7199, 4: 8699 } },
    ],
  },

  "air-cooler": {
    label: "Air Cooler",
    tiers: [
      { upTo: 5000, plans: { 1: 0, 2: 750 } },
      { upTo: 10000, plans: { 1: 649, 2: 899 } },
      { upTo: 15000, plans: { 1: 999, 2: 1499 } },
      { upTo: 20000, plans: { 1: 1399, 2: 2099 } },
    ],
  },
};

function parsePrice(price: string | number) {
  if (typeof price === "number") return price;

  return Number(price.replace(/[^0-9.]/g, "")) || 0;
}

function formatWarrantyPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPlanYears(years: WarrantyPlanYears) {
  return `${years} ${years === 1 ? "Year" : "Years"}`;
}

export function getWarrantyCategoryFromProduct(
  product: Pick<Product, "name" | "categories">
): WarrantyCategory | null {
  const productName = (product.name || "").toLowerCase();

  const categoryText = (product.categories || [])
    .map((category) => `${category.name} ${category.slug}`)
    .join(" ")
    .toLowerCase();

  const searchableText = `${productName} ${categoryText}`
    .replace(/[-_/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (
    /\b(?:air conditioner|split ac|window ac|ac)\b/i.test(searchableText)
  ) {
    return "ac";
  }

  if (
    /\b(?:washing machine|dishwasher|dryer)\b/i.test(searchableText)
  ) {
    return "washing-machine";
  }

  if (
    /\b(?:refrigerator|fridge|deep freezer|freezer)\b/i.test(searchableText)
  ) {
    return "refrigerator";
  }

  if (/\bmicrowave\b/i.test(searchableText)) {
    return "microwave";
  }

  if (/\b(?:air cooler|cooler)\b/i.test(searchableText)) {
    return "air-cooler";
  }

  if (
    /\b(?:soundbar|sound bar|speaker|speakers|home theatre|home theater|audio system|music system|home entertainment)\b/i.test(
      searchableText
    )
  ) {
    return "home-entertainment";
  }

  if (
    /\b(?:tv|television|smart tv|led tv|qled|oled)\b/i.test(searchableText)
  ) {
    return "tv";
  }

  return null;
}

export function ExtendedWarranty({
  productPrice,
  warrantyCategory,
  selected,
  onChange,
}: ExtendedWarrantyProps) {
  const [selectedPlanYears, setSelectedPlanYears] =
    useState<WarrantyPlanYears>(1);

  const lastSentWarrantyKey = useRef<string | null>(null);

  const productAmount = parsePrice(productPrice);

  const warrantyTable = warrantyCategory
    ? EXTENDED_WARRANTY_TABLE[warrantyCategory]
    : null;

  const warrantyTier = useMemo(() => {
    if (!warrantyTable) return null;

    return (
      warrantyTable.tiers.find((tier) => productAmount <= tier.upTo) ?? null
    );
  }, [productAmount, warrantyTable]);

  const availablePlanYears = useMemo(() => {
    if (!warrantyTier) return [];

    return Object.keys(warrantyTier.plans)
      .map(Number)
      .sort((a, b) => a - b) as WarrantyPlanYears[];
  }, [warrantyTier]);

  const activePlanYears = availablePlanYears.includes(selectedPlanYears)
    ? selectedPlanYears
    : availablePlanYears[0];

  const warranty = useMemo<AppliedExtendedWarranty | null>(() => {
    if (
      !warrantyCategory ||
      !warrantyTable ||
      !warrantyTier ||
      !activePlanYears
    ) {
      return null;
    }

    const warrantyPrice = warrantyTier.plans[activePlanYears];

    if (typeof warrantyPrice !== "number") {
      return null;
    }

    return {
      title: `${formatPlanYears(activePlanYears)} Extended Warranty`,
      price: warrantyPrice,
      planYears: activePlanYears,
      category: warrantyCategory,
      percentage: 0,
    };
  }, [warrantyCategory, warrantyTable, warrantyTier, activePlanYears]);

  useEffect(() => {
    if (!selected) {
      lastSentWarrantyKey.current = null;
      return;
    }

    if (!warranty) {
      onChange(null);
      return;
    }

    const warrantyKey = `${warranty.category}-${warranty.planYears}-${warranty.price}`;

    if (lastSentWarrantyKey.current === warrantyKey) {
      return;
    }

    lastSentWarrantyKey.current = warrantyKey;
    onChange(warranty);
  }, [selected, warranty, onChange]);

  if (!warrantyCategory) {
    return null;
  }

  if (!warrantyTable || !warrantyTier || !warranty) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <h3 className="text-base font-bold text-amber-900">
          Extended Warranty
        </h3>

        <p className="mt-1 text-sm text-amber-700">
          Extended warranty is not available for this product price.
        </p>
      </div>
    );
  }

  const handleToggleWarranty = () => {
    if (selected) {
      lastSentWarrantyKey.current = null;
      onChange(null);
      return;
    }

    const warrantyKey = `${warranty.category}-${warranty.planYears}-${warranty.price}`;

    lastSentWarrantyKey.current = warrantyKey;
    onChange(warranty);
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-zinc-900">
            Extended Warranty
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            Choose an extended warranty plan for your{" "}
            {warrantyTable.label.toLowerCase()}.
          </p>

          <p className="mt-2 text-lg font-bold text-green-700">
            + {formatWarrantyPrice(warranty.price)}
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            Fixed warranty price based on product value slab.
          </p>
        </div>

        <button
          type="button"
          onClick={handleToggleWarranty}
          className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
            selected
              ? "bg-red-700 text-white hover:bg-red-800"
              : "border border-zinc-300 text-zinc-900 hover:bg-zinc-50"
          }`}
        >
          {selected ? "Remove" : "Add"}
        </button>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Choose plan duration
        </p>

        <div className="flex flex-wrap gap-2">
          {availablePlanYears.map((years) => {
            const planPrice = warrantyTier.plans[years] ?? 0;
            const isActive = years === activePlanYears;

            return (
              <button
                key={years}
                type="button"
                onClick={() => setSelectedPlanYears(years)}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "border-blue-700 bg-blue-700 text-white"
                    : "border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50"
                }`}
              >
                {formatPlanYears(years)} — {formatWarrantyPrice(planPrice)}
              </button>
            );
          })}
        </div>
      </div>

      {selected && (
        <p className="mt-4 text-xs font-medium text-green-700">
          {formatPlanYears(warranty.planYears)} extended warranty added for{" "}
          {formatWarrantyPrice(warranty.price)}.
        </p>
      )}
    </div>
  );
}