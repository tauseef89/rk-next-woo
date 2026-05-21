import {
  NextRequest,
  NextResponse,
} from "next/server";

/**
 * =========================================================
 * WooCommerce Order Update Helper
 * =========================================================
 */

async function updateWooCommerceOrder(
  orderId: string,
  status: string,
  transactionId?: string
) {
  try {
    const authHeader = `Basic ${Buffer.from(
      `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
    ).toString("base64")}`;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/orders/${orderId}`,
      {
        method: "PUT",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            authHeader,
        },

        body: JSON.stringify({
          status,

          set_paid:
            status ===
            "processing",

          ...(transactionId && {
            transaction_id:
              String(transactionId),
          }),
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error(
      "[WC UPDATE ERROR]",
      error
    );

    return false;
  }
}

/**
 * =========================================================
 * Parse Pine Labs Request Body
 * =========================================================
 */

async function parseRequestBody(
  request: NextRequest
) {
  try {
    const contentType =
      (
        request.headers.get(
          "content-type"
        ) || ""
      ).toLowerCase();

    /**
     * JSON
     */

    if (
      contentType.includes(
        "application/json"
      )
    ) {
      const clone =
        request.clone();

      return await clone.json();
    }

    /**
     * FORM DATA
     */

    if (
      contentType.includes(
        "multipart/form-data"
      ) ||
      contentType.includes(
        "application/x-www-form-urlencoded"
      )
    ) {
      const clone =
        request.clone();

      const formData =
        await clone.formData();

      const result: Record<
        string,
        any
      > = {};

      formData.forEach(
        (value, key) => {
          result[key] = value;
        }
      );

      return result;
    }

    /**
     * RAW TEXT
     */

    const clone =
      request.clone();

    const rawText =
      await clone.text();

    if (rawText) {
      const params =
        new URLSearchParams(
          rawText
        );

      const result: Record<
        string,
        any
      > = {};

      params.forEach(
        (value, key) => {
          result[key] = value;
        }
      );

      return result;
    }

    return {};
  } catch (error) {
    console.error(
      "[BODY PARSE ERROR]",
      error
    );

    return {};
  }
}

/**
 * =========================================================
 * Unified Pine Labs Callback Processor
 * =========================================================
 */

async function processCallback(
  request: NextRequest
) {
  try {
    const searchParams =
      request.nextUrl.searchParams;

    let wooOrderId =
      searchParams.get(
        "woo_order_id"
      );

    let merchantRef =
      searchParams.get(
        "merchant_ref"
      );

    /**
     * BODY
     */

    const parsedBody =
      request.method === "POST"
        ? await parseRequestBody(
            request
          )
        : {};

    const payload =
      parsedBody?.data ||
      parsedBody;

    /**
     * PAYMENT DATA
     */

    const paymentStatus =
      payload
        ?.payment_status ||
      payload
        ?.ppc_PaymentStatus ||
      payload?.status ||
      payload?.ppc_Status ||
      "";

    const responseCode =
      payload
        ?.ppc_ResponseCode ||
      payload
        ?.response_code ||
      payload
        ?.ppc_Parent_TxnStatus ||
      "";

    const transactionId =
      payload?.order_id ||
      payload
        ?.ppc_PineLabsTxnId ||
      payload
        ?.ppc_UniqueMerchantTxnID ||
      "";

    /**
     * Merchant Ref Fallbacks
     */

    if (
      !merchantRef &&
      payload?.merchant_order_reference
    ) {
      merchantRef =
        payload.merchant_order_reference;
    }

    if (
      !merchantRef &&
      payload?.ppc_MerchantReferenceNo
    ) {
      merchantRef =
        payload.ppc_MerchantReferenceNo;
    }

    /**
     * Woo Order ID Extraction
     */

    if (
      !wooOrderId &&
      merchantRef
    ) {
      const cleanRef =
        String(merchantRef);

      if (
        cleanRef.includes(
          "T"
        )
      ) {
        wooOrderId =
          cleanRef
            .split("T")[0]
            .replace("WC", "");
      } else {
        wooOrderId =
          cleanRef
            .replace("WC", "")
            .replace(
              /\D/g,
              ""
            );
      }
    }

    /**
     * Validate Woo Order
     */

    if (!wooOrderId) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/checkout/failed?error=no_order`
      );
    }

    /**
     * Normalize Status
     */

    const normalizedStatus =
      String(
        paymentStatus
      ).toUpperCase();

    const normalizedCode =
      String(
        responseCode
      );

    /**
     * SUCCESS DETECTION
     */

    const successStatuses = [
      "CAPTURED",
      "SUCCESS",
      "AUTHORIZED",
      "PAID",
      "CHARGED",
      "PROCESSED",
    ];

    const successCodes = [
      "1",
      "4",
      "200",
    ];

    const isSuccessful =
      successStatuses.includes(
        normalizedStatus
      ) ||
      successCodes.includes(
        normalizedCode
      );

    /**
     * WC STATUS
     */

    const wcStatus =
      isSuccessful
        ? "processing"
        : "failed";

    /**
     * UPDATE WOO ORDER
     */

    await updateWooCommerceOrder(
      wooOrderId,
      wcStatus,
      transactionId
    );

    /**
     * Redirect Customer
     */

    const redirectPage =
      isSuccessful
        ? "success"
        : "failed";

    const redirectUrl =
      `${process.env.NEXT_PUBLIC_APP_URL}/checkout/${redirectPage}?order=${wooOrderId}`;

    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Redirecting...</title>

          <meta charset="utf-8" />

          <meta
            http-equiv="refresh"
            content="0;url=${redirectUrl}"
          />
        </head>

        <body>
          <script>
            window.location.replace("${redirectUrl}");
          </script>
        </body>
      </html>
      `,
      {
        status: 200,

        headers: {
          "Content-Type":
            "text/html; charset=utf-8",
        },
      }
    );
  } catch (error) {
    console.error(
      "[CALLBACK ERROR]",
      error
    );

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/checkout/failed`
    );
  }
}

export async function GET(
  request: NextRequest
) {
  return processCallback(
    request
  );
}

export async function POST(
  request: NextRequest
) {
  return processCallback(
    request
  );
}