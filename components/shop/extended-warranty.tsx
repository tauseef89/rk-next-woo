"use client";

export const EXTENDED_WARRANTY_PERCENTAGE = 5;

export type AppliedExtendedWarranty = {
  title: string;
  percentage: number;
  price: number;
};

type ExtendedWarrantyProps = {
  productPrice: string | number;
  selected: boolean;
  onChange: (warranty: AppliedExtendedWarranty | null) => void;
};

function parsePrice(price: string | number) {
  if (typeof price === "number") return price;
  return Number(price.replace(/[^0-9.]/g, "")) || 0;
}

function calculateWarrantyPrice(productPrice: string | number) {
  const price = parsePrice(productPrice);
  return Math.round((price * EXTENDED_WARRANTY_PERCENTAGE) / 100);
}

function formatWarrantyPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ExtendedWarranty({
  productPrice,
  selected,
  onChange,
}: ExtendedWarrantyProps) {
  const warrantyPrice = calculateWarrantyPrice(productPrice);

  const warranty: AppliedExtendedWarranty = {
    title: "Extended Warranty",
    percentage: EXTENDED_WARRANTY_PERCENTAGE,
    price: warrantyPrice,
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-zinc-900">
            Extended Warranty
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            Add extra protection for your product.
          </p>

          <p className="mt-2 text-sm font-bold text-green-700">
            + {formatWarrantyPrice(warrantyPrice)}
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            Warranty charge is {EXTENDED_WARRANTY_PERCENTAGE}% of product price.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onChange(selected ? null : warranty)}
          className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
            selected
              ? "bg-red-700 text-white hover:bg-red-800"
              : "border border-zinc-300 text-zinc-900 hover:bg-zinc-50"
          }`}
        >
          {selected ? "Remove" : "Add"}
        </button>
      </div>

      {selected && (
        <p className="mt-3 text-xs font-medium text-green-700">
          Extended warranty added: {formatWarrantyPrice(warrantyPrice)}
        </p>
      )}
    </div>
  );
}