import { NextResponse } from "next/server";

/**
 * Guest Order Tracking API
 * Expects orderId and billingEmail in the request body
 */
export async function POST(req: Request) {
  try {
    const { orderId, billingEmail } = await req.json();

    if (!orderId || !billingEmail) {
      return NextResponse.json(
        { message: "Order ID and Email are required" },
        { status: 400 }
      );
    }

    // 1. Setup WooCommerce Authentication
    const auth = Buffer.from(
      `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
    ).toString("base64");

    // 2. Fetch the order from WooCommerce
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/orders/${orderId}`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const order = await response.json();

    // 3. Handle Order Not Found
    if (!response.ok) {
      return NextResponse.json(
        { message: "Order not found. Please check your Order ID." },
        { status: 404 }
      );
    }

    // 4. SECURITY CHECK: Verify the email matches the billing email
    // This prevents random users from guessing Order IDs to see private data.
    const isEmailValid = 
      order.billing.email.toLowerCase() === billingEmail.toLowerCase();

    if (!isEmailValid) {
      return NextResponse.json(
        { message: "Email address does not match this Order ID." },
        { status: 401 }
      );
    }

    // 5. Return the order data
    return NextResponse.json(order);

  } catch (error) {
    console.error("Tracking API Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
