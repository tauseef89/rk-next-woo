import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    /**
     * 1. Read Headers
     */
    const webhookId = request.headers.get("webhook-id");
    const webhookTimestamp = request.headers.get("webhook-timestamp");
    const webhookSignature = request.headers.get("webhook-signature");

    console.log(`[PINE WEBHOOK ARRIVED] ID: ${webhookId}, TS: ${webhookTimestamp}, SIG: ${webhookSignature}`);

    /**
     * 2. Validate Headers Existence
     */
    if (!webhookId || !webhookTimestamp || !webhookSignature) {
      return NextResponse.json(
        { success: false, error: "Missing required webhook authentication headers" },
        { status: 400 }
      );
    }

    /**
     * 3. Read Raw Body
     */
    const rawBody = await request.text();

    /**
     * 4. Generate Signed Content String Structure
     */
    const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`;

    /**
     * 5. Generate Expected HMAC SHA256 Signature
     */
    const generatedSignature = crypto
      .createHmac("sha256", process.env.PINELABS_CLIENT_SECRET || "")
      .update(signedContent)
      .digest("base64");

    /**
     * 6. Clean and Parse Received Signature Token
     * Pine Labs transmits signatures using key/value syntax (e.g., "v1=signature_hash").
     * If a fallback format or compound string is sent, we safely isolate the hash value.
     */
    let receivedSignature = webhookSignature;
    if (webhookSignature.includes("v1=")) {
      receivedSignature = webhookSignature.split("v1=")[1]?.trim();
    } else if (webhookSignature.includes(",")) {
      receivedSignature = webhookSignature.split(",")[1]?.trim();
    }

    console.log(`[SIGNATURE MATRIX] Generated: ${generatedSignature} | Received: ${receivedSignature}`);

    /**
     * 7. Secure Signature Verification (Timing Safe Comparison)
     */
    const expectedBuffer = Buffer.from(generatedSignature);
    const receivedBuffer = Buffer.from(receivedSignature || "");

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      console.error("[CRITICAL VALIDATION ERROR]: Invalid webhook cryptographic signature signature matching failed.");
      return NextResponse.json(
        { success: false, error: "Invalid cryptographic validation signature mismatch" },
        { status: 401 }
      );
    }

    /**
     * 8. Safely Parse Payload Structure JSON
     */
    const body = JSON.parse(rawBody);
    
    // Pine Labs payloads may place data fields under a top-level `data` object parameter block
    const targetData = body?.data || body;

    const orderId = targetData?.order_id;
    const status = targetData?.status || targetData?.payment_status;
    const merchantRef = targetData?.merchant_order_reference;

    if (!merchantRef) {
      return NextResponse.json(
        { success: false, error: "Merchant order reference context absent from transaction event block" },
        { status: 400 }
      );
    }

    /**
     * 9. Parse and Extract WooCommerce Order ID Number Mapping
     */
    let wooOrderId = merchantRef.replace("WC", "").replace(/\D/g, ""); // Safely strips out everything but numerical array values
    
    // Fallback split logic if you are tracking timestamps using structural character bounds (e.g., WC{id}T{timestamp})
    if (merchantRef.includes("T")) {
      wooOrderId = merchantRef.split("T")[0].replace("WC", "");
    }

    console.log(`[WEBHOOK EVENT COMPILING] Woo Order ID Target: ${wooOrderId}, Gateway Status State: ${status}`);

    /**
     * 10. Process Order Status Routing Updates
     */
    const successStatuses = ["AUTHORIZED", "PROCESSED", "CAPTURED", "SUCCESS", "PAID", "CHARGED"];
    const normalizedStatus = String(status).toUpperCase();

    const authHeader = `Basic ${Buffer.from(
      `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`
    ).toString("base64")}`;

    if (successStatuses.includes(normalizedStatus)) {
      console.log(`[TRANSACTION STATUS SUCCESS] Updating WC Order #${wooOrderId} to Processing State.`);
      
      await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/orders/${wooOrderId}`, {
        method: "PUT",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "processing",
          set_paid: true,
          transaction_id: String(orderId || merchantRef),
        }),
      });
    } else {
      console.log(`[TRANSACTION STATUS EXCEPTION] Updating WC Order #${wooOrderId} to Failed State. Status: ${status}`);
      
      await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/orders/${wooOrderId}`, {
        method: "PUT",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "failed",
          customer_note: `Pine Labs transaction notification received negative state signature: ${status}`
        }),
      });
    }

    // Acknowledge receipt to the payment gateway engine to prevent retry queues
    return NextResponse.json({ success: true, processed: true }, { status: 200 });

  } catch (error) {
    console.error("[WEBHOOK EXCEPTION RECOVERY RUNTIME]:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal Server Execution error block" },
      { status: 500 }
    );
  }
}
