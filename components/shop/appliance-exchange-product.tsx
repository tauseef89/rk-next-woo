"use client";

import { useMemo, useState } from "react";

export type ExchangeCategory =
  | "ac"
  | "washing_machine"
  | "refrigerator"
  | "deep_freezer"
  | "microwave"
  | "geyser"
  | "stabilizer"
  | "water_dispenser"
  | "water_ro"
  | "chimney";

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
  quoteNote?: string;
};

type ApplianceExchangeProductProps = {
  productPrice: string | number;
  exchangeCategory: ExchangeCategory;
  onExchangeChange?: (exchange: AppliedApplianceExchange | null) => void;
};

type ApplianceConfig = {
  title: string;
  categoryLabel: string;
  typeLabel: string;
  capacityLabel: string;
  brands: string[];
  types: string[];
  capacities: string[];
  requiresCapacity: boolean;
};

type ExchangeQuote = {
  amount: number;
  note?: string;
};

const COMMON_BRANDS = [
  "LG",
  "Samsung",
  "Whirlpool",
  "Haier",
  "Godrej",
  "Panasonic",
  "Bosch",
  "IFB",
  "Voltas",
  "Other",
];

const applianceConfigs: Record<ExchangeCategory, ApplianceConfig> = {
  ac: {
    title: "Exchange your old AC",
    categoryLabel: "Air Conditioner",
    typeLabel: "AC Type",
    capacityLabel: "Cooling Capacity",
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
    types: ["Window AC", "Split AC", "Cassette AC"],
    capacities: [],
    requiresCapacity: true,
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
      "Semi Automatic",
      "Fully Automatic Top Load",
      "Fully Automatic Front Load",
    ],
    capacities: ["Below 6 kg", "6 - 7 kg", "7.5 - 8 kg", "Above 8 kg"],
    requiresCapacity: true,
  },

  refrigerator: {
    title: "Exchange your old Refrigerator",
    categoryLabel: "Refrigerator",
    typeLabel: "Refrigerator Type",
    capacityLabel: "Capacity",
    brands: COMMON_BRANDS,
    types: ["Direct Cool", "Double Door", "Side by Side"],
    capacities: [
      "Up to 190L",
      "191L - 250L",
      "251L - 350L",
      "351L - 500L",
      "Above 500L",
    ],
    requiresCapacity: true,
  },

  deep_freezer: {
    title: "Exchange your old Deep Freezer",
    categoryLabel: "Deep Freezer",
    typeLabel: "Freezer Type",
    capacityLabel: "Capacity",
    brands: COMMON_BRANDS,
    types: ["Chest Freezer", "Vertical Freezer"],
    capacities: ["150L - 320L", "Above 400L"],
    requiresCapacity: true,
  },

  microwave: {
    title: "Exchange your old Microwave",
    categoryLabel: "Microwave",
    typeLabel: "Microwave Type",
    capacityLabel: "Capacity",
    brands: COMMON_BRANDS,
    types: ["Solo Microwave", "Grill Microwave", "Convection Microwave"],
    capacities: [],
    requiresCapacity: false,
  },

  geyser: {
    title: "Exchange your old Geyser",
    categoryLabel: "Geyser",
    typeLabel: "Geyser Type",
    capacityLabel: "Capacity",
    brands: COMMON_BRANDS,
    types: ["Storage Water Heater", "Instant Water Heater"],
    capacities: [],
    requiresCapacity: false,
  },

  stabilizer: {
    title: "Exchange your old Stabilizer",
    categoryLabel: "Stabilizer",
    typeLabel: "Stabilizer Type",
    capacityLabel: "Capacity",
    brands: COMMON_BRANDS,
    types: ["Voltage Stabilizer"],
    capacities: [],
    requiresCapacity: false,
  },

  water_dispenser: {
    title: "Exchange your old Water Dispenser",
    categoryLabel: "Water Dispenser",
    typeLabel: "Dispenser Type",
    capacityLabel: "Capacity",
    brands: COMMON_BRANDS,
    types: ["Water Dispenser"],
    capacities: [],
    requiresCapacity: false,
  },

  water_ro: {
    title: "Exchange your old Water RO",
    categoryLabel: "Water RO",
    typeLabel: "RO Type",
    capacityLabel: "Capacity",
    brands: COMMON_BRANDS,
    types: ["Water RO / Purifier"],
    capacities: [],
    requiresCapacity: false,
  },

  chimney: {
    title: "Exchange your old Chimney",
    categoryLabel: "Kitchen Chimney",
    typeLabel: "Chimney Type",
    capacityLabel: "Capacity",
    brands: COMMON_BRANDS,
    types: ["Kitchen Chimney"],
    capacities: [],
    requiresCapacity: false,
  },
};

const ageOptions = [
  "Less than 1 year",
  "1 - 2 years",
  "2 - 4 years",
  "4 - 6 years",
  "More than 6 years",
];

const acCapacityByType: Record<string, string[]> = {
  "Window AC": ["0.75 Ton", "1 Ton", "1.5 Ton", "2 Ton"],
  "Split AC": ["0.75 Ton", "1 Ton", "1.5 Ton", "2 Ton", "2.5 Ton", "3 Ton"],
  "Cassette AC": ["2.5 Ton", "3 Ton"],
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

function getCapacityOptions(
  category: ExchangeCategory,
  type: string
): string[] {
  if (category === "ac") {
    return acCapacityByType[type] || [];
  }

  return applianceConfigs[category].capacities;
}

function calculateExchangeQuote(
  category: ExchangeCategory,
  type: string,
  capacity: string
): ExchangeQuote | null {
  if (!type) return null;

  if (category === "ac") {
    if (
      (type === "Window AC" || type === "Split AC") &&
      capacity === "0.75 Ton"
    ) {
      return { amount: 3000 };
    }

    if (
      (type === "Window AC" || type === "Split AC") &&
      capacity === "1 Ton"
    ) {
      return { amount: 4500 };
    }

    if (
      (type === "Window AC" || type === "Split AC") &&
      capacity === "1.5 Ton"
    ) {
      return {
        amount: 5500,
        note:
          "1.5 Ton AC exchange is listed as ₹5,500–₹6,000. This estimate starts at ₹5,500 and is subject to pickup verification.",
      };
    }

    if (
      (type === "Window AC" || type === "Split AC") &&
      capacity === "2 Ton"
    ) {
      return { amount: 6500 };
    }

    if (
      (type === "Split AC" || type === "Cassette AC") &&
      capacity === "2.5 Ton"
    ) {
      return { amount: 6500 };
    }

    if (
      (type === "Split AC" || type === "Cassette AC") &&
      capacity === "3 Ton"
    ) {
      return { amount: 7000 };
    }

    return null;
  }

  if (category === "washing_machine") {
    if (type === "Semi Automatic") {
      return { amount: 1000 };
    }

    if (type === "Fully Automatic Top Load") {
      return { amount: 1000 };
    }

    if (type === "Fully Automatic Front Load") {
      return { amount: 1500 };
    }

    return null;
  }

  if (category === "refrigerator") {
    if (type === "Direct Cool") {
      return { amount: 1500 };
    }

    if (type === "Double Door") {
      return {
        amount: 1500,
        note:
          "Double Door refrigerator exchange is listed as ₹1,500–₹2,000. This estimate starts at ₹1,500 and is subject to pickup verification.",
      };
    }

    if (type === "Side by Side") {
      return { amount: 4000 };
    }

    return null;
  }

  if (category === "deep_freezer") {
    if (capacity === "150L - 320L") {
      return { amount: 1500 };
    }

    if (capacity === "Above 400L") {
      return {
        amount: 1500,
        note:
          "Deep Freezer above 400L is listed as ₹1,500–₹2,000. This estimate starts at ₹1,500 and is subject to pickup verification.",
      };
    }

    return null;
  }

  if (category === "microwave") {
    return { amount: 500 };
  }

  if (category === "geyser") {
    return { amount: 500 };
  }

  if (category === "stabilizer") {
    return { amount: 200 };
  }

  if (category === "water_dispenser") {
    return { amount: 500 };
  }

  if (category === "water_ro") {
    return { amount: 200 };
  }

  if (category === "chimney") {
    return { amount: 200 };
  }

  return null;
}

export function ApplianceExchangeProduct({
  productPrice,
  exchangeCategory,
  onExchangeChange,
}: ApplianceExchangeProductProps) {
  const productAmount = parsePrice(productPrice);
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

  const capacityOptions = useMemo(() => {
    return getCapacityOptions(exchangeCategory, type);
  }, [exchangeCategory, type]);

  const isPincodeServiceable = useMemo(() => {
    const allowedPrefixes = ["110", "121", "122", "201", "203", "301"];

    return allowedPrefixes.some((prefix) => pincode.startsWith(prefix));
  }, [pincode]);

  const exchangeQuote = useMemo(() => {
    return calculateExchangeQuote(exchangeCategory, type, capacity);
  }, [exchangeCategory, type, capacity]);

  const exchangeValue = exchangeQuote?.amount || 0;
  const finalPrice = Math.max(productAmount - exchangeValue, 0);

  const stepOneValid = Boolean(
    pincode.length === 6 &&
      isPincodeServiceable &&
      brand &&
      type &&
      age &&
      (!config.requiresCapacity || capacity) &&
      exchangeQuote
  );

  const stepTwoValid =
    workingCondition === "yes" &&
    bodyCondition === "yes" &&
    accessoriesAvailable === "yes";

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

  const openExchangeModal = () => {
    if (appliedExchange) {
      setPincode(appliedExchange.pincode);
      setBrand(appliedExchange.brand);
      setType(appliedExchange.type);
      setCapacity(
        appliedExchange.capacity === "Not Applicable"
          ? ""
          : appliedExchange.capacity
      );
      setAge(appliedExchange.age);
      setWorkingCondition(appliedExchange.workingCondition);
      setBodyCondition(appliedExchange.bodyCondition);
      setAccessoriesAvailable(appliedExchange.accessoriesAvailable);
    } else {
      resetForm();
    }

    setStep(1);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);

    if (!appliedExchange) {
      setPurchaseMode("without");
      resetForm();
    }
  };

  const removeExchange = () => {
    setPurchaseMode("without");
    setAppliedExchange(null);
    onExchangeChange?.(null);
    resetForm();
  };

  const applyExchange = () => {
    if (!exchangeQuote) return;

    const exchange: AppliedApplianceExchange = {
      category: exchangeCategory,
      brand,
      type,
      capacity: capacity || "Not Applicable",
      age,
      pincode,
      workingCondition,
      bodyCondition,
      accessoriesAvailable,
      exchangeValue,
      totalExchangeDiscount: exchangeValue,
      finalPrice,
      quoteNote: exchangeQuote.note,
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
            Choose whether you want to buy this product with or without
            exchange.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
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
                {formatPrice(productAmount)}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setPurchaseMode("with");
              openExchangeModal();
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

            <div className="mt-4">
              {appliedExchange ? (
                <>
                  <p className="text-xs font-medium text-green-700">
                    Exchange Applied
                  </p>

                  <p className="text-lg font-bold text-zinc-900">
                    {formatPrice(appliedExchange.finalPrice)}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-green-700">
                    You save{" "}
                    {formatPrice(appliedExchange.totalExchangeDiscount)}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs font-medium text-green-700">
                    Exchange available
                  </p>

                  <p className="text-sm font-bold text-zinc-900">
                    Select old appliance details
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    Exchange value will be shown after selection.
                  </p>
                </>
              )}
            </div>
          </button>
        </div>

        {appliedExchange && purchaseMode === "with" && (
          <div className="mt-5 space-y-4 rounded-xl bg-zinc-50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-green-700">
                  Exchange Applied
                </h4>

                <p className="mt-1 text-sm text-zinc-500">
                  {appliedExchange.brand} {appliedExchange.type}
                  {appliedExchange.capacity !== "Not Applicable"
                    ? `, ${appliedExchange.capacity}`
                    : ""}
                </p>
              </div>

              <button
                type="button"
                onClick={openExchangeModal}
                className="text-sm font-bold text-blue-700 hover:underline"
              >
                Change
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <SummaryRow
                label="Product Price"
                value={formatPrice(productAmount)}
              />

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

            {appliedExchange.quoteNote && (
              <p className="rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
                {appliedExchange.quoteNote}
              </p>
            )}

            <button
              type="button"
              onClick={removeExchange}
              className="text-sm font-bold text-red-600 hover:underline"
            >
              Remove Exchange
            </button>
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
                      onChange={(event) =>
                        setPincode(event.target.value.replace(/\D/g, ""))
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
                      options={config.brands}
                    />

                    <SelectField
                      label={config.typeLabel}
                      value={type}
                      onChange={(value) => {
                        setType(value);
                        setCapacity("");
                      }}
                      options={config.types}
                    />

                    {config.requiresCapacity && (
                      <SelectField
                        label={config.capacityLabel}
                        value={capacity}
                        onChange={setCapacity}
                        options={capacityOptions}
                        disabled={!type}
                      />
                    )}

                    <SelectField
                      label="Product Age"
                      value={age}
                      onChange={setAge}
                      options={ageOptions}
                    />
                  </div>

                  {type &&
                    (!config.requiresCapacity || capacity) &&
                    !exchangeQuote && (
                      <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
                        Exchange pricing is not available for this product type
                        and capacity.
                      </p>
                    )}

                  {exchangeQuote && (
                    <div className="rounded-xl bg-green-50 p-4">
                      <p className="text-sm font-medium text-green-700">
                        Estimated Exchange Value
                      </p>

                      <p className="mt-1 text-2xl font-bold text-zinc-900">
                        {formatPrice(exchangeQuote.amount)}
                      </p>

                      {exchangeQuote.note && (
                        <p className="mt-2 text-xs leading-relaxed text-amber-800">
                          {exchangeQuote.note}
                        </p>
                      )}
                    </div>
                  )}

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
                    description="The appliance must power on and perform its basic function."
                    value={workingCondition}
                    onChange={setWorkingCondition}
                  />

                  <ConditionQuestion
                    title="Is the body in acceptable condition?"
                    description="The appliance should not be burnt, broken, heavily damaged, or unusable."
                    value={bodyCondition}
                    onChange={setBodyCondition}
                  />

                  <ConditionQuestion
                    title="Are required accessories available?"
                    description="Required accessories should be available during pickup."
                    value={accessoriesAvailable}
                    onChange={setAccessoriesAvailable}
                  />

                  {exchangeCategory === "ac" && (
                    <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                      Old AC should be uninstalled and ready before pickup. For
                      Split AC, both indoor and outdoor units are required.
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
                      Exchange Eligible
                    </h3>

                    <p className="mt-1 text-sm text-zinc-600">
                      Your estimated exchange value
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

                      {capacity && (
                        <SummaryRow label="Capacity" value={capacity} />
                      )}

                      <SummaryRow label="Age" value={age} />
                      <SummaryRow label="Working Condition" value="Yes" />
                    </div>
                  </div>

                  <div className="rounded-xl bg-zinc-50 p-4 text-sm">
                    <h4 className="mb-3 font-bold text-zinc-900">
                      Price Summary
                    </h4>

                    <SummaryRow
                      label="New Product Price"
                      value={formatPrice(productAmount)}
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

                  {exchangeQuote?.note && (
                    <div className="rounded-xl bg-amber-50 p-4 text-xs leading-relaxed text-amber-800">
                      {exchangeQuote.note}
                    </div>
                  )}

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
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-zinc-900">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-zinc-900 disabled:cursor-not-allowed disabled:bg-zinc-100"
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
  strong = false,
  green = false,
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
  const categories = Array.isArray(product?.categories)
    ? product.categories
    : [];

  const categoryText = categories.map((category: any) => {
    return `${category?.name || ""} ${category?.slug || ""}`;
  });

  const searchableText = [product?.name || "", ...categoryText]
    .join(" ")
    .toLowerCase()
    .replace(/[-_/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (
    /\b(deep freezer|deep freezers|deepfreezer|chest freezer|vertical freezer)\b/.test(
      searchableText
    )
  ) {
    return "deep_freezer";
  }

  if (
    /\b(air conditioner|air conditioners|split ac|window ac|cassette ac)\b/.test(
      searchableText
    )
  ) {
    return "ac";
  }

  if (/\b(washing machine|washing machines|washer)\b/.test(searchableText)) {
    return "washing_machine";
  }

  if (/\b(microwave|microwave oven)\b/.test(searchableText)) {
    return "microwave";
  }

  if (/\b(geyser|water heater)\b/.test(searchableText)) {
    return "geyser";
  }

  if (/\bstabilizer\b/.test(searchableText)) {
    return "stabilizer";
  }

  if (/\b(water dispenser|dispenser)\b/.test(searchableText)) {
    return "water_dispenser";
  }

  if (/\b(water ro|ro purifier|water purifier)\b/.test(searchableText)) {
    return "water_ro";
  }

  if (/\b(kitchen chimney|chimney)\b/.test(searchableText)) {
    return "chimney";
  }

  if (
    /\b(refrigerator|refrigerators|fridge|direct cool|double door|side by side)\b/.test(
      searchableText
    )
  ) {
    return "refrigerator";
  }

  return null;
}