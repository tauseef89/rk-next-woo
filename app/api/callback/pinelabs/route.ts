import { NextRequest, NextResponse } from "next/server";

/**
 * SUCCESS / RETURN CALLBACK (GET handler)
 * Triggers when Pine Labs returns the customer's browser back to your platform.
 * URL Example: /api/callback/pinelabs?woo_order_id=1198&merchant_ref=WC1198T1779256382736
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const wooOrderId = searchParams.get("woo_order_id");
    const merchantRef = searchParams.get("merchant_ref");
    
    console.log(`[PINE RETURN GET SUCCESS] Order ID: ${wooOrderId}, Merchant Ref: ${merchantRef}`);

    if (!wooOrderId) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/checkout/failed?error=missing_order_id`);
    }

    /**
     * OPTIONAL BACKEND SYNC (Highly Recommended):
     * Proactively mark the order as processing over the REST API so the frontend order-receipt 
     * component doesn't show "Pending Payment" while waiting for the async webhook to fire.
     */
    try {
      await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/orders/${wooOrderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(
            `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`
          ).toString("base64")}`,
        },
        body: JSON.stringify({
          status: "processing",
          transaction_id: merchantRef || "",
        }),
      });
      console.log(`[GET RETURN] WooCommerce Order #${wooOrderId} marked as processing.`);
    } catch (wcErr) {
      console.error("[GET RETURN] Silent fail updating WC order status:", wcErr);
      // We catch silently so the user still goes to the success page if the WP API blips.
    }

    // Force redirect the browser to your clean frontend success page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?order=${wooOrderId}`);

  } catch (error) {
    console.error("GET CALLBACK RUNTIME ERROR:", error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/checkout/failed`);
  }
}

/**
 * FAILED / WEBHOOK ASYNC CALLBACK (POST handler)
 * Receives payment failure payloads or direct server-to-server notifications from Pine Labs
 */
export async function POST(request: NextRequest) {
  try {
    console.log("[PINE CALLBACK POST RECEIVE]");
    
    let body: any = {};
    try {
      body = await request.json();
      console.log("PINE POST BODY DATA:", JSON.stringify(body, null, 2));
    } catch {
      console.log("Could not parse JSON payload body from POST engine request context");
    }

    // Extract identifier fields from Pine Labs standard payload wrappers
    const merchantRef = body?.merchant_order_reference || body?.data?.merchant_order_reference;
    const paymentStatus = body?.payment_status || body?.data?.payment_status;
    
    // Fallback extraction from URL search parameters if Pine Labs appended queries to the POST route
    const searchParams = request.nextUrl.searchParams;
    const wooOrderId = searchParams.get("woo_order_id") || (merchantRef ? merchantRef.split("T")[0].replace("WC", "") : null);

    if (wooOrderId) {
      let targetWcStatus = "failed";
      
      // Determine real transaction state changes mapping back to WooCommerce structures
      if (paymentStatus === "CAPTURED" || paymentStatus === "SUCCESS") {
        targetWcStatus = "processing";
      } else if (paymentStatus === "CANCELLED") {
        targetWcStatus = "cancelled";
      }

      console.log(`[ASYNC POST STATUS] Updating WC Order #${wooOrderId} status to: ${targetWcStatus}`);

      // Sync backend status state over WooCommerce API layer
      await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/orders/${wooOrderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(
            `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
          ).toString("base64")}`,
        },
        body: JSON.stringify({
          status: targetWcStatus,
          customer_note: `Pine Labs transaction status update: ${paymentStatus || "FAILED"}`
        }),
      });
    }

    /**
     * CRITICAL FIX: Do NOT try to redirect the server request using NextResponse.redirect().
     * Instead, acknowledge receipt to Pine Labs with a 200 JSON object containing a redirect schema parameter.
     */
    return NextResponse.json({
      success: true,
      message: "Callback collected successfully",
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/failed`
    }, { status: 200 });

  } catch (error) {
    console.error("POST CALLBACK RUNTIME ERROR:", error);
    
    // Always return a valid JSON error payload block to protect endpoint routing stability
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Internal processing exception context"
    }, { status: 500 });
  }
}
