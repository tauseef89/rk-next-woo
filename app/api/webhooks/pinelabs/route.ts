import crypto from "crypto";

import {
  NextRequest,
  NextResponse,
} from "next/server";

/**
 * =========================================================
 * WooCommerce Order Updater
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

    await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/orders/${orderId}`,
      {
        method: "PUT",

        headers: {
          Authorization:
            authHeader,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          status,

          set_paid:
            status ===
            "processing",

          ...(transactionId && {
            transaction_id:
              transactionId,
          }),
        }),
      }
    );

    return true;
  } catch (error) {
    console.error(
      "[WEBHOOK WC UPDATE ERROR]",
      error
    );

    return false;
  }
}

/**
 * =========================================================
 * Pine Labs Webhook
 * =========================================================
 */

export async function POST(
  request: NextRequest
) {
  try {
    /**
     * HEADERS
     */

    const webhookId =
      request.headers.get(
        "webhook-id"
      );

    const webhookTimestamp =
      request.headers.get(
        "webhook-timestamp"
      );

    const webhookSignature =
      request.headers.get(
        "webhook-signature"
      );

    /**
     * RAW BODY
     */

    const rawBody =
      await request.text();

    /**
     * SIGNATURE VALIDATION
     */

    if (
      webhookId &&
      webhookTimestamp &&
      webhookSignature
    ) {
      const signedContent =
        `${webhookId}.${webhookTimestamp}.${rawBody}`;

      const generatedSignature =
        crypto
          .createHmac(
            "sha256",
            process.env
              .PINELABS_CLIENT_SECRET || ""
          )
          .update(signedContent)
          .digest("base64");

      const receivedSignature =
        webhookSignature.split(
          ","
        )[1];

      /**
       * STRICT SIGNATURE CHECK
       */

      if (
        generatedSignature !==
        receivedSignature
      ) {
        console.error(
          "[INVALID WEBHOOK SIGNATURE]"
        );

        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid signature",
          },
          { status: 401 }
        );
      }
    }

    /**
     * PARSE BODY
     */

    const body =
      JSON.parse(rawBody);

    /**
     * PAYMENT DATA
     */

    const paymentStatus =
      (
        body?.status ||
        body?.payment_status ||
        ""
      ).toUpperCase();

    const merchantRef =
      body?.merchant_order_reference;

    const transactionId =
      body?.order_id;

    /**
     * Extract Woo Order ID
     */

    let wooOrderId = "";

    if (merchantRef) {
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

    const wcStatus =
      successStatuses.includes(
        paymentStatus
      )
        ? "processing"
        : "failed";

    /**
     * UPDATE WOO ORDER
     */

    if (wooOrderId) {
      await updateWooCommerceOrder(
        wooOrderId,
        wcStatus,
        transactionId
      );
    }

    /**
     * ACKNOWLEDGE WEBHOOK
     */

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "[WEBHOOK ERROR]",
      error
    );

    return NextResponse.json(
      {
        success: false,
      },
      { status: 500 }
    );
  }
}