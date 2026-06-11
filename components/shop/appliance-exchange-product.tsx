// components/shop/appliance-exchange-product.tsx

"use client";

import { useMemo, useState } from "react";

export type ExchangeCategory =
  | "ac"
  | "washing_machine"
  | "cooler"
  | "refrigerator";

export type AppliedApplianceExchange = {
  category: ExchangeCategory;
  brand: string;
  type: string;
  capacity: string;
  age: string;
  pincode: string;
  workingCondition: string;
  bodyCondition: string;
  accessoriesAvailable: string;
  exchangeValue: number;
  totalExchangeDiscount: number;
  finalPrice: number;
};

type ApplianceExchangeProductProps = {
  productPrice: string | number;
  exchangeCategory: ExchangeCategory;
  onExchangeChange?: (exchange: AppliedApplianceExchange | null) => void;
};

const applianceConfigs = {
  ac: {
    title: "Exchange your old AC",
    categoryLabel: "Air Conditioner",
    typeLabel: "AC Type",
    capacityLabel: "Capacity",
    brands: [
      "Daikin",
      "Voltas",
      "LG",
      "Samsung",
      "Blue Star",
      "Carrier",
      "Lloyd",
      "Hitachi",
      "Panasonic",
      "O General",
      "Whirlpool",
      "Haier",
      "Godrej",
      "Other",
    ],
    types: ["Split AC", "Window AC"],
    capacities: ["1 Ton", "1.5 Ton", "2 Ton", "Above 2 Ton"],
  },

  washing_machine: {
    title: "Exchange your old Washing Machine",
    categoryLabel: "Washing Machine",
    typeLabel: "Machine Type",
    capacityLabel: "Capacity",
    brands: [
      "LG",
      "Samsung",
      "Whirlpool",
      "IFB",
      "Bosch",
      "Haier",
      "Godrej",
      "Panasonic",
      "Lloyd",
      "Voltas Beko",
      "Other",
    ],
    types: [
      "Fully Automatic Front Load",
      "Fully Automatic Top Load",
      "Semi Automatic",
    ],
    capacities: ["6 kg", "6.5 kg", "7 kg", "8 kg", "9 kg", "10 kg & Above"],
  },

  cooler: {
    title: "Exchange your old Air Cooler",
    categoryLabel: "Air Cooler",
    typeLabel: "Cooler Type",
    capacityLabel: "Tank Capacity",
    brands: [
      "Symphony",
      "Bajaj",
      "Havells",
      "Crompton",
      "Voltas",
      "Orient",
      "Usha",
      "Kenstar",
      "Other",
    ],
    types: ["Personal Cooler", "Tower Cooler", "Desert Cooler", "Window Cooler"],
    capacities: ["Below 20L", "20L - 40L", "41L - 60L", "Above 60L"],
  },

  refrigerator: {
    title: "Exchange your old Refrigerator",
    categoryLabel: "Refrigerator",
    typeLabel: "Refrigerator Type",
    capacityLabel: "Capacity",
    brands: [
      "LG",
      "Samsung",
      "Whirlpool",
      "Haier",
      "Godrej",
      "Panasonic",
      "Bosch",
      "Hitachi",
      "Voltas Beko",
      "Liebherr",
      "Other",
    ],
    types: [
      "Single Door",
      "Double Door",
      "Triple Door",
      "Side by Side",
      "Bottom Freezer",
    ],
    capacities: [
      "Up to 190L",
      "191L - 250L",
      "251L - 350L",
      "351L - 500L",
      "Above 500L",
    ],
  },
} as const;

const ageOptions = [
  "Less than 1 year",
  "1 - 2 years",
  "2 - 4 years",
  "4 - 6 years",
  "More than 6 years",
];

// Update exchange values only from here.
const FIXED_EXCHANGE_PRICES: Record<ExchangeCategory, number> = {
  ac: 3000,
  washing_machine: 2000,
  cooler: 500,
  refrigerator: 2500,
};

function parsePrice(price: string | number) {
  if (typeof price === "number") return price;
  return Number(price.replace(/[^0-9.]/g, "")) || 0;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function calculateExchangeValue(category: ExchangeCategory) {
  return FIXED_EXCHANGE_PRICES[category];
}

export function ApplianceExchangeProduct({
  productPrice,
  exchangeCategory,
  onExchangeChange,
}: ApplianceExchangeProductProps) {
  const price = parsePrice(productPrice);
  const config = applianceConfigs[exchangeCategory];

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);

  const [purchaseMode, setPurchaseMode] = useState<"without" | "with">(
    "without"
  );

  const [appliedExchange, setAppliedExchange] =
    useState<AppliedApplianceExchange | null>(null);

  const [pincode, setPincode] = useState("");
  const [brand, setBrand] = useState("");
  const [type, setType] = useState("");
  const [capacity, setCapacity] = useState("");
  const [age, setAge] = useState("");

  const [workingCondition, setWorkingCondition] = useState("");
  const [bodyCondition, setBodyCondition] = useState("");
  const [accessoriesAvailable, setAccessoriesAvailable] = useState("");

  const isPincodeServiceable = useMemo(() => {
    // Replace this with your actual pincode serviceability API later.
    // Sample Delhi NCR prefixes.
    const allowedPrefixes = ["110", "121", "122", "201", "203", "301"];
    return allowedPrefixes.some((prefix) => pincode.startsWith(prefix));
  }, [pincode]);

  const exchangeValue = useMemo(() => {
    return calculateExchangeValue(exchangeCategory);
  }, [exchangeCategory]);

  const totalExchangeDiscount = exchangeValue;
  const finalPrice = Math.max(price - totalExchangeDiscount, 0);

  const stepOneValid = Boolean(
    pincode.length === 6 &&
      isPincodeServiceable &&
      brand &&
      type &&
      capacity &&
      age
  );

  const stepTwoValid = Boolean(
    workingCondition && bodyCondition && accessoriesAvailable
  );

  const resetForm = () => {
    setStep(1);
    setPincode("");
    setBrand("");
    setType("");
    setCapacity("");
    setAge("");
    setWorkingCondition("");
    setBodyCondition("");
    setAccessoriesAvailable("");
  };

  const closeModal = () => {
    setOpen(false);

    if (!appliedExchange) {
      setPurchaseMode("without");
    }

    resetForm();
  };

  const removeExchange = () => {
    setPurchaseMode("without");
    setAppliedExchange(null);
    onExchangeChange?.(null);
  };

  const applyExchange = () => {
    const exchange: AppliedApplianceExchange = {
      category: exchangeCategory,
      brand,
      type,
      capacity,
      age,
      pincode,
      workingCondition,
      bodyCondition,
      accessoriesAvailable,
      exchangeValue,
      totalExchangeDiscount,
      finalPrice,
    };

    setPurchaseMode("with");
    setAppliedExchange(exchange);
    onExchangeChange?.(exchange);
    setOpen(false);
  };

  return (
    <>
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-base font-bold text-zinc-900">Buy Options</h3>

          <p className="mt-1 text-sm text-zinc-500">
            Choose whether you want to buy this product with or without exchange.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Without Exchange Card */}
          <button
            type="button"
            onClick={removeExchange}
            className={`rounded-2xl border p-4 text-left transition ${
              purchaseMode === "without"
                ? "border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900"
                : "border-zinc-200 bg-white hover:border-zinc-400"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-zinc-900">
                  Without Exchange
                </h4>

                <p className="mt-1 text-xs text-zinc-500">
                  Buy this product without exchanging your old appliance.
                </p>
              </div>

              <span
                className={`mt-1 flex h-4 w-4 items-center justify-center rounded-full border ${
                  purchaseMode === "without"
                    ? "border-zinc-900 bg-zinc-900"
                    : "border-zinc-300"
                }`}
              >
                {purchaseMode === "without" && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </span>
            </div>

            <div className="mt-4">
              <p className="text-xs font-medium text-zinc-500">Price</p>

              <p className="text-lg font-bold text-zinc-900">
                {formatPrice(price)}
              </p>
            </div>
          </button>

          {/* With Exchange Card */}
          <button
            type="button"
            onClick={() => {
              setPurchaseMode("with");

              if (!appliedExchange) {
                setOpen(true);
              }
            }}
            className={`rounded-2xl border p-4 text-left transition ${
              purchaseMode === "with"
                ? "border-green-700 bg-green-50 ring-1 ring-green-700"
                : "border-zinc-200 bg-white hover:border-green-600"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-zinc-900">
                  With Exchange
                </h4>

                <p className="mt-1 text-xs text-zinc-500">
                  Exchange your old {config.categoryLabel.toLowerCase()} and
                  save more.
                </p>
              </div>

              <span
                className={`mt-1 flex h-4 w-4 items-center justify-center rounded-full border ${
                  purchaseMode === "with"
                    ? "border-green-700 bg-green-700"
                    : "border-zinc-300"
                }`}
              >
                {purchaseMode === "with" && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </span>
            </div>

            {!appliedExchange ? (
              <div className="mt-4">
                <p className="text-xs font-medium text-green-700">
                  Exchange available
                </p>

                <p className="text-sm font-bold text-zinc-900">
                  Check exchange value
                </p>

                <p className="mt-1 text-xs font-semibold text-green-700">
                  Exchange value: {formatPrice(exchangeValue)}
                </p>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-xs font-medium text-green-700">
                  Exchange Applied
                </p>

                <p className="text-lg font-bold text-zinc-900">
                  {formatPrice(appliedExchange.finalPrice)}
                </p>

                <p className="mt-1 text-xs font-semibold text-green-700">
                  You save {formatPrice(appliedExchange.totalExchangeDiscount)}
                </p>
              </div>
            )}
          </button>
        </div>

        {/* Exchange Applied Summary */}
        {appliedExchange && purchaseMode === "with" && (
          <div className="mt-5 space-y-4 rounded-xl bg-zinc-50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-green-700">
                  Exchange Applied
                </h4>

                <p className="mt-1 text-sm text-zinc-500">
                  {appliedExchange.brand} {appliedExchange.type},{" "}
                  {appliedExchange.capacity}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPurchaseMode("with");
                  setOpen(true);
                }}
                className="text-sm font-bold text-blue-700 hover:underline"
              >
                Change
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <SummaryRow label="Product Price" value={formatPrice(price)} />

              <SummaryRow
                label="Exchange Value"
                value={`- ${formatPrice(appliedExchange.exchangeValue)}`}
                green
              />

              <SummaryRow
                label="Price After Exchange"
                value={formatPrice(appliedExchange.finalPrice)}
                strong
              />
            </div>

            <button
              type="button"
              onClick={removeExchange}
              className="text-sm font-bold text-red-600 hover:underline"
            >
              Remove Exchange
            </button>

            <p className="text-xs leading-relaxed text-zinc-500">
              Final exchange approval is subject to verification during pickup or
              delivery. If details do not match, the exchange can be rejected.
            </p>
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-5">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">
                  {config.title}
                </h2>

                <p className="text-sm text-zinc-500">Step {step} of 3</p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border px-3 py-1 text-sm font-bold hover:bg-zinc-50"
              >
                ✕
              </button>
            </div>

            <div className="p-5">
              <div className="mb-6 grid grid-cols-3 gap-2 text-center text-xs font-bold">
                <div className={step >= 1 ? "text-blue-600" : "text-zinc-400"}>
                  1. Device
                </div>

                <div className={step >= 2 ? "text-blue-600" : "text-zinc-400"}>
                  2. Condition
                </div>

                <div className={step >= 3 ? "text-blue-600" : "text-zinc-400"}>
                  3. Confirm
                </div>
              </div>

              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-zinc-900">
                      Enter Pincode
                    </label>

                    <input
                      value={pincode}
                      onChange={(e) =>
                        setPincode(e.target.value.replace(/\D/g, ""))
                      }
                      maxLength={6}
                      placeholder="Example: 110059"
                      className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-zinc-900"
                    />

                    {pincode.length === 6 && (
                      <p
                        className={`mt-2 text-sm font-medium ${
                          isPincodeServiceable
                            ? "text-green-700"
                            : "text-red-600"
                        }`}
                      >
                        {isPincodeServiceable
                          ? "Exchange is available in your area."
                          : "Exchange is not available in your area."}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <SelectField
                      label="Brand"
                      value={brand}
                      onChange={setBrand}
                      options={[...config.brands]}
                    />

                    <SelectField
                      label={config.typeLabel}
                      value={type}
                      onChange={setType}
                      options={[...config.types]}
                    />

                    <SelectField
                      label={config.capacityLabel}
                      value={capacity}
                      onChange={setCapacity}
                      options={[...config.capacities]}
                    />

                    <SelectField
                      label="Product Age"
                      value={age}
                      onChange={setAge}
                      options={ageOptions}
                    />
                  </div>

                  <button
                    type="button"
                    disabled={!stepOneValid}
                    onClick={() => setStep(2)}
                    className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
                  >
                    Continue
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <ConditionQuestion
                    title={`Is your old ${config.categoryLabel.toLowerCase()} in working condition?`}
                    description="The product should power on and perform its basic function."
                    value={workingCondition}
                    onChange={setWorkingCondition}
                  />

                  <ConditionQuestion
                    title="Is the body in acceptable condition?"
                    description="The product should not be completely damaged, broken, burnt, or physically unusable."
                    value={bodyCondition}
                    onChange={setBodyCondition}
                  />

                  <ConditionQuestion
                    title={
                      exchangeCategory === "ac"
                        ? "Are remote and both AC units available?"
                        : exchangeCategory === "refrigerator"
                        ? "Are shelves, trays, and doors in usable condition?"
                        : "Are main accessories available?"
                    }
                    description={
                      exchangeCategory === "ac"
                        ? "For Split AC, both indoor and outdoor units should be available for pickup."
                        : exchangeCategory === "refrigerator"
                        ? "Shelves, trays, and doors should be available and in usable condition during pickup."
                        : "Required accessories should be available during pickup."
                    }
                    value={accessoriesAvailable}
                    onChange={setAccessoriesAvailable}
                  />

                  {exchangeCategory === "ac" && (
                    <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                      Old AC should be uninstalled and kept ready before pickup.
                      For Split AC, both indoor and outdoor units are required.
                    </div>
                  )}

                  {exchangeCategory === "refrigerator" && (
                    <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                      Old refrigerator should be emptied, defrosted, and kept
                      ready before pickup. Shelves, trays, and doors should be
                      available.
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full rounded-xl border px-4 py-3 text-sm font-bold text-zinc-900 hover:bg-zinc-50"
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      disabled={!stepTwoValid}
                      onClick={() => setStep(3)}
                      className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <div className="rounded-2xl bg-green-50 p-5 text-center">
                    <h3 className="text-2xl font-bold text-green-700">
                      Hurray!
                    </h3>

                    <p className="mt-1 text-sm text-zinc-600">
                      Your exchange value
                    </p>

                    <div className="mt-4 text-3xl font-bold text-zinc-900">
                      {formatPrice(exchangeValue)}
                    </div>
                  </div>

                  <div className="rounded-xl border p-4 text-sm">
                    <h4 className="mb-3 font-bold text-zinc-900">
                      Exchange Product Details
                    </h4>

                    <div className="space-y-2">
                      <SummaryRow label="Brand" value={brand} />
                      <SummaryRow label="Type" value={type} />
                      <SummaryRow label="Capacity" value={capacity} />
                      <SummaryRow label="Age" value={age} />

                      <SummaryRow
                        label="Working Condition"
                        value={workingCondition === "yes" ? "Yes" : "No"}
                      />
                    </div>
                  </div>

                  <div className="rounded-xl bg-zinc-50 p-4 text-sm">
                    <h4 className="mb-3 font-bold text-zinc-900">
                      Price Summary
                    </h4>

                    <SummaryRow
                      label="New Product Price"
                      value={formatPrice(price)}
                    />

                    <SummaryRow
                      label="Exchange Value"
                      value={`- ${formatPrice(exchangeValue)}`}
                      green
                    />

                    <SummaryRow
                      label="Price After Exchange"
                      value={formatPrice(finalPrice)}
                      strong
                    />
                  </div>

                  <div className="rounded-xl bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-600">
                    <strong>Exchange can be rejected if:</strong>

                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      <li>Brand, type, or capacity does not match.</li>
                      <li>
                        Product condition does not match the selected details.
                      </li>
                      <li>Old product is not ready for pickup.</li>

                      {exchangeCategory === "ac" && (
                        <li>
                          Old AC is not uninstalled or indoor/outdoor units are
                          missing.
                        </li>
                      )}

                      {exchangeCategory === "refrigerator" && (
                        <li>
                          Shelves, trays, or doors are missing, damaged, or not
                          in usable condition.
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full rounded-xl border px-4 py-3 text-sm font-bold text-zinc-900 hover:bg-zinc-50"
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={applyExchange}
                      className="w-full rounded-xl bg-green-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-800"
                    >
                      Apply Exchange
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-zinc-900">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-zinc-900"
      >
        <option value="">Select {label}</option>

        {options.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}

function ConditionQuestion({
  title,
  description,
  value,
  onChange,
}: {
  title: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-xl border p-4">
      <h4 className="font-bold text-zinc-900">{title}</h4>

      <p className="mt-1 text-sm text-zinc-500">{description}</p>

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => onChange("yes")}
          className={`rounded-xl border px-5 py-2 text-sm font-bold ${
            value === "yes"
              ? "border-green-700 bg-green-50 text-green-700"
              : "text-zinc-700 hover:bg-zinc-50"
          }`}
        >
          Yes
        </button>

        <button
          type="button"
          onClick={() => onChange("no")}
          className={`rounded-xl border px-5 py-2 text-sm font-bold ${
            value === "no"
              ? "border-red-600 bg-red-50 text-red-600"
              : "text-zinc-700 hover:bg-zinc-50"
          }`}
        >
          No
        </button>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong,
  green,
}: {
  label: string;
  value: string;
  strong?: boolean;
  green?: boolean;
}) {
  return (
    <div
      className={`flex justify-between gap-4 ${
        strong ? "border-t pt-2 font-bold" : ""
      }`}
    >
      <span className={strong ? "text-zinc-900" : "text-zinc-500"}>
        {label}
      </span>

      <span
        className={`text-right ${
          green ? "font-semibold text-green-700" : "text-zinc-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export function getExchangeCategoryFromProduct(
  product: any
): ExchangeCategory | null {
  const categoryText = [
    product?.name,
    ...(product?.categories || []).map(
      (cat: any) => `${cat.name || ""} ${cat.slug || ""}`
    ),
  ]
    .join(" ")
    .toLowerCase();

  if (
    categoryText.includes("air conditioner") ||
    categoryText.includes("air-conditioner") ||
    categoryText.includes("split ac") ||
    categoryText.includes("window ac") ||
    categoryText.includes(" ac ")
  ) {
    return "ac";
  }

  if (
    categoryText.includes("washing machine") ||
    categoryText.includes("washing-machine") ||
    categoryText.includes("washer")
  ) {
    return "washing_machine";
  }

  if (
    categoryText.includes("air cooler") ||
    categoryText.includes("air-cooler") ||
    categoryText.includes("cooler")
  ) {
    return "cooler";
  }

  if (
    categoryText.includes("refrigerator") ||
    categoryText.includes("fridge") ||
    categoryText.includes("single door") ||
    categoryText.includes("double door") ||
    categoryText.includes("side by side")
  ) {
    return "refrigerator";
  }

  return null;
}