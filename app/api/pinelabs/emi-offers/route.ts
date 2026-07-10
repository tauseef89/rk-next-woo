// app/api/pinelabs/emi-offers/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getPineLabsToken } from "@/lib/pinelabs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type EMIRequestBody = {
  amount?: string | number;
};

type PineLabsMoney = {
  currency?: string;
  value?: number;
};

type PineLabsOfferParameter = {
  program_type?: string;
  offer_id?: string;
  offer_parameter_id?: string;
};

type PineLabsDiscount = {
  discount_type?: string;
  percentage?: number;
  amount?: PineLabsMoney;
  max_amount?: PineLabsMoney;
};

type PineLabsProcessingFeeDetails = {
  percentage?: number;
  amount?: PineLabsMoney;
};

type PineLabsIssuerData = {
  terms_and_conditions?: string;
  show_key_fact_statement?: boolean;
  is_consent_page_required?: boolean;
  auth_type?: string;
};

type PineLabsV1Tenure = {
  tenure_id?: string;
  name?: string;
  tenure_type?: string;
  tenure_value?: number;

  issuer_offer_parameters?: PineLabsOfferParameter[];
  details?: unknown[];

  discount?: PineLabsDiscount;

  loan_amount?: PineLabsMoney;
  auth_amount?: PineLabsMoney;
  total_discount_amount?: PineLabsMoney;
  net_payment_amount?: PineLabsMoney;

  monthly_emi_amount?: PineLabsMoney;
  total_emi_amount?: PineLabsMoney;
  interest_amount?: PineLabsMoney;
  interest_rate_percentage?: number;

  processing_fee_details?: PineLabsProcessingFeeDetails;
  processing_fee_amount?: PineLabsMoney;

  emi_type?: string;
};

type PineLabsV1Issuer = {
  id?: string;
  name?: string;
  display_name?: string;
  issuer_type?: string;
  priority?: number;
  tenures?: PineLabsV1Tenure[];
  issuer_data?: PineLabsIssuerData;
};

type PineLabsV1OfferDiscoveryResponse = {
  issuers?: PineLabsV1Issuer[];
  message?: string;
  error?: {
    message?: string;
  };
};

function parseAmount(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  if (typeof value === "string") {
    const cleaned = value.replace(/[₹,\s]/g, "").trim();

    if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
      return 0;
    }

    const parsed = Number(cleaned);

    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }

  return 0;
}

async function getResponseData(
  response: Response
): Promise<PineLabsV1OfferDiscoveryResponse> {
  const rawResponse = await response.text();

  if (!rawResponse) {
    return {};
  }

  try {
    return JSON.parse(rawResponse) as PineLabsV1OfferDiscoveryResponse;
  } catch {
    return {
      message: rawResponse,
    };
  }
}

function getPineLabsErrorMessage(
  data: PineLabsV1OfferDiscoveryResponse
): string {
  return (
    data.error?.message ||
    data.message ||
    "Unable to fetch available EMI plans."
  );
}

function buildSafeIssuers(issuers: PineLabsV1Issuer[]) {
  return issuers
    /*
      Credit Card EMI only.

      To include Debit Card EMI in future, change this to:

      .filter((issuer) =>
        ["CC_BANK", "DC_BANK"].includes(issuer.issuer_type || "")
      )
    */
    .filter((issuer) => issuer.issuer_type === "CC_BANK")
    .map((issuer) => {
      const safeTenures = (issuer.tenures || [])
        /*
          Removes "No EMI Only Cashback" records
          where tenure_value is 0.
        */
        .filter((tenure) => Number(tenure.tenure_value || 0) > 0)
        .filter(
          (tenure) =>
            Number(tenure.monthly_emi_amount?.value || 0) > 0
        )
        .map((tenure) => ({
          tenure_id: tenure.tenure_id || "",
          name:
            tenure.name ||
            `${Number(tenure.tenure_value || 0)} Months`,
          tenure_type: tenure.tenure_type || "MONTH",
          tenure_value: Number(tenure.tenure_value || 0),

          /*
            Preserve these fields for future Offer Validation.
            Do not trust selected EMI values received from frontend.
          */
          issuer_offer_parameters:
            tenure.issuer_offer_parameters || [],

          details: tenure.details || [],
          discount: tenure.discount || null,

          loan_amount: tenure.loan_amount || null,
          auth_amount: tenure.auth_amount || null,
          total_discount_amount:
            tenure.total_discount_amount || null,
          net_payment_amount:
            tenure.net_payment_amount || null,

          monthly_emi_amount:
            tenure.monthly_emi_amount || null,

          total_emi_amount:
            tenure.total_emi_amount || null,

          interest_amount: tenure.interest_amount || null,

          interest_rate_percentage: Number(
            tenure.interest_rate_percentage || 0
          ),

          processing_fee_details:
            tenure.processing_fee_details || null,

          processing_fee_amount:
            tenure.processing_fee_amount || null,

          emi_type: tenure.emi_type || "STANDARD",
        }))
        .sort(
          (firstTenure, secondTenure) =>
            firstTenure.tenure_value - secondTenure.tenure_value
        );

      return {
        id: issuer.id || "",
        name: issuer.name || "",
        display_name:
          issuer.display_name ||
          issuer.name ||
          "Credit Card EMI",
        issuer_type: issuer.issuer_type || "",
        priority: Number(issuer.priority || 0),

        /*
          Only safe text/configuration needed by frontend.
          Do not return consent HTML or sensitive issuer data.
        */
        issuer_data: issuer.issuer_data
          ? {
              terms_and_conditions:
                issuer.issuer_data.terms_and_conditions || "",
              show_key_fact_statement: Boolean(
                issuer.issuer_data.show_key_fact_statement
              ),
              is_consent_page_required: Boolean(
                issuer.issuer_data.is_consent_page_required
              ),
              auth_type: issuer.issuer_data.auth_type || "",
            }
          : null,

        tenures: safeTenures,
      };
    })
    .filter((issuer) => issuer.tenures.length > 0)
    .sort(
      (firstIssuer, secondIssuer) =>
        firstIssuer.priority - secondIssuer.priority
    );
}

export async function POST(request: NextRequest) {
  try {
    let body: EMIRequestBody;

    try {
      body = (await request.json()) as EMIRequestBody;
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Request body must be valid JSON.",
        },
        { status: 400 }
      );
    }

    const amountInRupees = parseAmount(body.amount);
    const amountInPaise = Math.round(amountInRupees * 100);

    if (
      !amountInRupees ||
      amountInPaise < 100 ||
      !Number.isSafeInteger(amountInPaise)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide a valid product amount.",
        },
        { status: 400 }
      );
    }

    const baseUrl = process.env.PINELABS_API_BASE_URL?.replace(
      /\/$/,
      ""
    );

    if (!baseUrl) {
      throw new Error("PINELABS_API_BASE_URL is missing");
    }

    const payload = {
      order_amount: {
        currency: "INR",
        value: amountInPaise,
      },
    };

    const accessToken = await getPineLabsToken();

    const pineLabsResponse = await fetch(
      `${baseUrl}/api/affordability/v1/offer/discovery`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Request-ID": crypto.randomUUID(),
          "Request-Timestamp": new Date().toISOString(),
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      }
    );

    const pineLabsData = await getResponseData(pineLabsResponse);

    if (!pineLabsResponse.ok) {
      console.error("[PINE LABS EMI OFFERS V1 ERROR]", {
        status: pineLabsResponse.status,
        response: pineLabsData,
      });

      return NextResponse.json(
        {
          success: false,
          error: getPineLabsErrorMessage(pineLabsData),
          pine_labs_status: pineLabsResponse.status,
        },
        { status: pineLabsResponse.status }
      );
    }

    const safeIssuers = buildSafeIssuers(
      Array.isArray(pineLabsData.issuers)
        ? pineLabsData.issuers
        : []
    );

    return NextResponse.json({
      success: true,
      request: {
        amount_in_rupees: amountInRupees,
        amount_in_paise: amountInPaise,
        bin_used: null,
      },
      issuers: safeIssuers,
    });
  } catch (error) {
    console.error("[PINE LABS EMI OFFERS V1 ROUTE ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to fetch available EMI plans.",
      },
      { status: 500 }
    );
  }
}