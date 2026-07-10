"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Landmark,
  Loader2,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

type PineLabsMoney = {
  currency?: string;
  value?: number;
};

type PineLabsDiscount = {
  discount_type?: string;
  percentage?: number;
  amount?: PineLabsMoney;
  max_amount?: PineLabsMoney;
};

type PineLabsIssuerData = {
  terms_and_conditions?: string;
  show_key_fact_statement?: boolean;
  is_consent_page_required?: boolean;
  auth_type?: string;
};

type PineLabsTenure = {
  tenure_id: string;
  name: string;
  tenure_type?: string;
  tenure_value: number;

  discount?: PineLabsDiscount | null;

  monthly_emi_amount?: PineLabsMoney | null;
  total_emi_amount?: PineLabsMoney | null;
  interest_amount?: PineLabsMoney | null;

  interest_rate_percentage?: number;

  processing_fee_amount?: PineLabsMoney | null;
  emi_type?: string;
};

type PineLabsIssuer = {
  id: string;
  name?: string;
  display_name?: string;
  issuer_type?: string;
  priority?: number;
  issuer_data?: PineLabsIssuerData | null;
  tenures?: PineLabsTenure[];
};

type EMIOffersApiResponse = {
  success?: boolean;
  error?: string;
  issuers?: PineLabsIssuer[];
};

interface EMIOptionsProps {
  price: string | number;

  /*
    Kept so existing component usage does not break.
    Later useful for Brand EMI / product_details integration.
  */
  productCode?: string;
}

function parsePrice(value: string | number): number {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  const cleaned = value.replace(/[₹,\s]/g, "").trim();

  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
    return 0;
  }

  const parsed = Number(cleaned);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function formatPaise(value?: number | null): string {
  const amountInRupees = Number(value || 0) / 100;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amountInRupees);
}

function getValidTenures(issuer: PineLabsIssuer): PineLabsTenure[] {
  return (issuer.tenures || [])
    .filter((tenure) => Number(tenure.tenure_value || 0) > 0)
    .filter(
      (tenure) =>
        Number(tenure.monthly_emi_amount?.value || 0) > 0
    )
    .sort(
      (firstTenure, secondTenure) =>
        Number(firstTenure.tenure_value || 0) -
        Number(secondTenure.tenure_value || 0)
    );
}

function isNoCostEMI(tenure: PineLabsTenure): boolean {
  const emiType = tenure.emi_type?.toUpperCase() || "";

  return emiType === "NO_COST" || emiType === "NO_COST_EMI";
}

function getOfferText(issuer: PineLabsIssuer): string | null {
  const tenureWithOffer = getValidTenures(issuer).find((tenure) => {
    const percentage = Number(tenure.discount?.percentage || 0);
    const amount = Number(tenure.discount?.amount?.value || 0);
    const maxAmount = Number(tenure.discount?.max_amount?.value || 0);

    return percentage > 0 || amount > 0 || maxAmount > 0;
  });

  const discount = tenureWithOffer?.discount;

  if (!discount) {
    return null;
  }

  const percentage = Number(discount.percentage || 0);
  const maximumDiscount = Number(discount.max_amount?.value || 0);
  const discountAmount = Number(discount.amount?.value || 0);

  if (percentage > 0 && maximumDiscount > 0) {
    return `${percentage}% instant discount up to ${formatPaise(
      maximumDiscount
    )}`;
  }

  if (percentage > 0) {
    return `${percentage}% instant discount available`;
  }

  if (discountAmount > 0) {
    return `Instant discount of ${formatPaise(discountAmount)}`;
  }

  return null;
}

export function EMIOptions({ price }: EMIOptionsProps) {
  const numericPrice = parsePrice(price);

  const [open, setOpen] = useState(false);
  const [issuers, setIssuers] = useState<PineLabsIssuer[]>([]);
  const [activeIssuerId, setActiveIssuerId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const hasNoCostEMI = useMemo(() => {
    return issuers.some((issuer) =>
      getValidTenures(issuer).some(isNoCostEMI)
    );
  }, [issuers]);

  const starting24MonthPlan = useMemo(() => {
    const twentyFourMonthPlans = issuers
      .flatMap((issuer) => getValidTenures(issuer))
      .filter((tenure) => tenure.tenure_value === 24)
      .sort(
        (firstPlan, secondPlan) =>
          Number(firstPlan.monthly_emi_amount?.value || 0) -
          Number(secondPlan.monthly_emi_amount?.value || 0)
      );

    return twentyFourMonthPlans[0] || null;
  }, [issuers]);

  const loadEMIOffers = useCallback(async () => {
    if (!numericPrice || numericPrice <= 0) {
      setIssuers([]);
      setActiveIssuerId("");
      setLoading(false);
      setError("Product price is unavailable.");
      return;
    }

    setLoading(true);
    setError("");
    setIssuers([]);
    setActiveIssuerId("");

    try {
      const response = await fetch("/api/pinelabs/emi-offers", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: numericPrice,
        }),
      });

      const data = (await response.json()) as EMIOffersApiResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to fetch available EMI plans."
        );
      }

      const receivedIssuers = Array.isArray(data.issuers)
        ? data.issuers
        : [];

      setIssuers(receivedIssuers);
      setActiveIssuerId(receivedIssuers[0]?.id || "");

      if (receivedIssuers.length === 0) {
        setError(
          "No Credit Card EMI plans are currently available for this product."
        );
      }
    } catch (requestError) {
      setIssuers([]);
      setActiveIssuerId("");

      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to fetch available EMI plans."
      );
    } finally {
      setLoading(false);
    }
  }, [numericPrice]);

  useEffect(() => {
    void loadEMIOffers();
  }, [loadEMIOffers]);

  const handleDialogChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (nextOpen && issuers.length === 0 && !loading) {
      void loadEMIOffers();
    }

    if (!nextOpen) {
      setError("");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <p className="text-[15px] text-zinc-600">
          {loading && issuers.length === 0 ? (
            "Checking EMI options..."
          ) : starting24MonthPlan ? (
            <>
              EMI starting from{" "}
              <span className="font-bold text-zinc-900">
                {formatPaise(
                  starting24MonthPlan.monthly_emi_amount?.value
                )}
                /mo
              </span>{" "}
              for 24 months.
            </>
          ) : (
            "EMI plans available on participating credit cards."
          )}
        </p>

        <Dialog open={open} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="text-sm font-bold text-blue-700 underline underline-offset-4 transition-colors hover:text-blue-800"
            >
              See EMI options
            </button>
          </DialogTrigger>

          <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden gap-0 rounded-2xl p-0 [&>button]:right-4 [&>button]:top-4 [&>button]:z-50 [&>button]:rounded-full [&>button]:bg-white/15 [&>button]:p-2 [&>button]:text-white [&>button]:opacity-100 [&>button]:shadow-sm [&>button]:transition-colors [&>button]:hover:bg-white/25 [&>button]:hover:text-white [&>button]:focus:ring-2 [&>button]:focus:ring-white/50 [&>button]:focus:ring-offset-0">
            <DialogHeader className="sr-only">
              <DialogTitle>Bank Offers and EMI</DialogTitle>
              <DialogDescription>
                Available Credit Card EMI plans.
              </DialogDescription>
            </DialogHeader>

            <div className="bg-zinc-950 p-6 text-white">
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <Landmark className="text-blue-400" size={20} />
                Bank Offers & EMI
              </DialogTitle>

              <DialogDescription className="mt-1 text-zinc-400">
                Available Credit Card EMI plans for this product.
              </DialogDescription>
            </div>

            <div className="min-h-[420px] max-h-[65vh] overflow-y-auto bg-white p-6">
              {loading && issuers.length === 0 && (
                <div className="flex h-[360px] flex-col items-center justify-center gap-3">
                  <Loader2
                    className="animate-spin text-blue-700"
                    size={28}
                  />

                  <p className="text-sm font-medium text-zinc-500">
                    Loading available EMI plans...
                  </p>
                </div>
              )}

              {!loading && error && issuers.length === 0 && (
                <div className="flex h-[360px] flex-col items-center justify-center gap-4 px-8 text-center">
                  <AlertCircle className="text-red-500" size={28} />

                  <p className="text-sm font-semibold text-zinc-800">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={() => void loadEMIOffers()}
                    className="text-sm font-bold text-blue-700 underline underline-offset-4"
                  >
                    Try again
                  </button>
                </div>
              )}

              {issuers.length > 0 && (
                <Tabs
                  value={activeIssuerId}
                  onValueChange={setActiveIssuerId}
                  className="flex flex-col md:flex-row"
                >
                  <TabsList className="flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl border border-zinc-100 bg-zinc-50 p-2 md:w-48 md:flex-col md:overflow-visible">
                    {issuers.map((issuer) => (
                      <TabsTrigger
                        key={issuer.id}
                        value={issuer.id}
                        className="w-auto shrink-0 justify-start py-3 text-left text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm md:w-full"
                      >
                        {issuer.display_name ||
                          issuer.name ||
                          "Credit Card EMI"}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <div className="mt-4 flex-1 md:mt-0 md:pl-5">
                    {issuers.map((issuer) => {
                      const tenures = getValidTenures(issuer);
                      const offerText = getOfferText(issuer);

                      return (
                        <TabsContent
                          key={issuer.id}
                          value={issuer.id}
                          className="m-0 space-y-4"
                        >
                          {offerText && (
                            <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                              <CheckCircle2
                                className="shrink-0 text-emerald-600"
                                size={19}
                              />

                              <p className="text-sm font-bold text-emerald-900">
                                {offerText}
                              </p>
                            </div>
                          )}

                          <div className="overflow-hidden rounded-2xl border border-zinc-100 shadow-sm">
                            <table className="w-full text-left text-sm">
                              <thead className="border-b border-zinc-100 bg-zinc-50">
                                <tr>
                                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-900">
                                    Plan
                                  </th>

                                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-zinc-900">
                                    Monthly EMI
                                  </th>
                                </tr>
                              </thead>

                              <tbody className="divide-y divide-zinc-100">
                                {tenures.map((tenure) => {
                                  const noCost = isNoCostEMI(tenure);

                                  return (
                                    <tr
                                      key={tenure.tenure_id}
                                      className={cn(
                                        "transition-colors hover:bg-zinc-50",
                                        noCost && "bg-orange-50/50"
                                      )}
                                    >
                                      <td className="px-4 py-4">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className="font-bold text-zinc-900">
                                            {tenure.name ||
                                              `${tenure.tenure_value} Months`}
                                          </span>

                                          {noCost && (
                                            <Badge className="border-none bg-orange-500 px-1.5 py-0.5 text-[9px] font-black text-white hover:bg-orange-500">
                                              NO COST
                                            </Badge>
                                          )}
                                        </div>

                                        <p className="mt-1 text-[10px] font-medium text-zinc-400">
                                          {noCost
                                            ? "ZERO INTEREST"
                                            : tenure.interest_rate_percentage
                                            ? `${tenure.interest_rate_percentage}% p.a. interest`
                                            : "Interest details at checkout"}
                                        </p>
                                      </td>

                                      <td className="px-4 py-4 text-right">
                                        <p className="font-bold text-zinc-900">
                                          {formatPaise(
                                            tenure.monthly_emi_amount?.value
                                          )}
                                        </p>

                                        <p className="mt-1 text-[10px] text-zinc-400">
                                          Total:{" "}
                                          {formatPaise(
                                            tenure.total_emi_amount?.value
                                          )}
                                        </p>

                                        {Number(
                                          tenure.processing_fee_amount?.value ||
                                            0
                                        ) > 0 && (
                                          <p className="mt-1 text-[10px] text-zinc-400">
                                            Processing fee:{" "}
                                            {formatPaise(
                                              tenure.processing_fee_amount
                                                ?.value
                                            )}
                                            {" + applicable taxes"}
                                          </p>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          {issuer.issuer_data?.terms_and_conditions && (
                            <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
                              <p className="text-[11px] leading-relaxed text-amber-800">
                                <span className="font-bold">
                                  Bank terms:{" "}
                                </span>
                                {issuer.issuer_data.terms_and_conditions}
                              </p>
                            </div>
                          )}
                        </TabsContent>
                      );
                    })}
                  </div>
                </Tabs>
              )}
            </div>

            <div className="flex items-start gap-2 border-t border-zinc-100 bg-zinc-50 px-6 py-4">
              <Info
                className="mt-0.5 shrink-0 text-zinc-400"
                size={15}
              />

              <p className="text-[10px] italic leading-relaxed text-zinc-400">
                EMI plans are shown for the current product amount. Final bank
                eligibility, charges, applicable GST, and EMI confirmation are
                completed securely by Pine Labs during checkout.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {hasNoCostEMI && (
        <div className="flex w-fit items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-2.5 py-1.5 text-amber-700">
          <Zap size={14} fill="currentColor" />

          <span className="text-[11px] font-black uppercase tracking-wider">
            No Cost EMI Available
          </span>
        </div>
      )}
    </div>
  );
}