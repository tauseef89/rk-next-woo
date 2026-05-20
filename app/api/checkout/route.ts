import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/woocommerce";
import type { CreateOrderInput } from "@/lib/woocommerce.d";

export async function POST(request: NextRequest) {
  try {
    /**
     * 1. Validate Content Type
     */
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { success: false, error: "Content-Type must be application/json" },
        { status: 400 }
      );
    }

    /**
     * 2. Parse Request Body
     */
    const body = await request.json();

    /**
     * 3. Validate Required Fields
     */
    if (!body?.billing?.email) {
      return NextResponse.json(
        { success: false, error: "Billing email is required" },
        { status: 400 }
      );
    }

    if (!body.line_items || body.line_items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart is empty" },
        { status: 400 }
      );
    }

    /**
     * 4. Create WooCommerce Order
     */
    const orderData: CreateOrderInput = {
      customer_id: body.customer_id || 0,
      set_paid: false,
      payment_method: "pinelabs",
      payment_method_title: "Pine Labs Online Gateway",
      billing: body.billing,
      shipping: body.shipping,
      line_items: body.line_items,
      customer_note: body.customer_note || "",
      coupon_lines: body.coupon_lines || [],
    };

    const order = await createOrder(orderData);
    if (!order || !order.id) {
      throw new Error("WooCommerce order creation failed");
    }

    /**
     * 5. Generate Unique Request Context
     * Note: Generate fresh credentials on every call to avoid duplication conflicts on retries.
     */
    const tokenRequestId = crypto.randomUUID();
    const checkoutRequestId = crypto.randomUUID();
    const requestTimestamp = new Date().toISOString();

    /**
     * 6. Generate Pine Labs Access Token
     */
    const tokenResponse = await fetch(
      `${process.env.PINELABS_API_BASE_URL}/api/auth/v1/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Request-ID": tokenRequestId,
          "Request-Timestamp": requestTimestamp,
          accept: "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.PINELABS_CLIENT_ID,
          client_secret: process.env.PINELABS_CLIENT_SECRET,
          grant_type: "client_credentials",
        }),
      }
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("[PINE LABS AUTH ERROR]:", errorText);
      return NextResponse.json(
        { success: false, error: "Pine Labs authentication failed" },
        { status: 502 }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error("Access token omitted from Pine Labs authorization response");
    }

    /**
     * 7. Prepare and Customise Payment Data
     * Always derive calculations safely directly from the final response object.
     */
    const amountInPaise = Math.round(parseFloat(order.total) * 100);
    const merchantOrderReference = `WC${order.id}T${Date.now()}`;

    // Clean data strings to match strict remote provider alphanumeric validation constraints
    const cleanFirstName = order.billing.first_name?.replace(/[^a-zA-Z\s]/g, "").trim() || "Customer";
    const cleanLastName = order.billing.last_name?.replace(/[^a-zA-Z\s]/g, "").trim() || "User";
    
    let cleanMobile = order.billing.phone?.replace(/\D/g, "") || "9999999999";
    if (cleanMobile.length > 10) {
      cleanMobile = cleanMobile.slice(-10); // Extract last 10 characters to comply with specific region constraints
    }

    /**
     * 8. Create Pine Labs Infinity Checkout Order Session
     */
    const pineLabsResponse = await fetch(
      `${process.env.PINELABS_API_BASE_URL}/api/checkout/v1/orders`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "Request-ID": checkoutRequestId,
          "Request-Timestamp": requestTimestamp,
          accept: "application/json",
        },
        body: JSON.stringify({
          merchant_order_reference: merchantOrderReference,
          order_amount: {
            value: amountInPaise,
            currency: "INR",
          },
          integration_mode: "REDIRECT",
          pre_auth: false,
          allowed_payment_methods: ["CARD", "UPI", "NETBANKING", "WALLET"],
          notes: `WooCommerce Order #${order.id}`,
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/callback/pinelabs?woo_order_id=${order.id}&merchant_ref=${merchantOrderReference}`,
          failure_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/failed`,
          purchase_details: {
            customer: {
              email_id: order.billing.email,
              first_name: cleanFirstName,
              last_name: cleanLastName,
              mobile_number: cleanMobile,
              country_code: "91",
            },
          },
        }),
      }
    );

    const paymentSession = await pineLabsResponse.json();

    console.log("FULL PINE RESPONSE:", JSON.stringify(paymentSession, null, 2));

    if (!pineLabsResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Pine Labs checkout session creation failed",
          details: paymentSession
        },
        { status: 502 }
      );
    }

    /**
     * 9. Extract Secure Redirect Field Properties
     * Pine Labs structural signatures return the payment redirect target through specific payload properties.
     */
    const paymentUrl = paymentSession?.redirect_url || paymentSession?.data?.redirect_url;
    const pineOrderId = paymentSession?.order_id || paymentSession?.data?.order_id;

    if (!paymentUrl) {
      throw new Error("Redirect target context reference missing from payment gateway response structural properties");
    }

    /**
     * 10. Return Structured Gateway Configuration Object
     */
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        number: order.number,
        status: order.status,
        total: order.total,
        currency: order.currency,
        needs_payment: order.needs_payment,
      },
      pine_labs: {
        order_id: pineOrderId || "NOT_PROVIDED",
        merchant_order_reference: merchantOrderReference,
        payment_url: paymentUrl,
      },
    });
  } catch (error) {
    console.error("[CHECKOUT API ERROR]:", error);

    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
