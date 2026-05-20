import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const logContainer: string[] = [];

  try {
    logContainer.push("Initializing Pine Labs isolation diagnostics test...");

    // 1. Force check environment variables
    const clientId = process.env.PINELABS_CLIENT_ID;
    const clientSecret = process.env.PINELABS_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Missing PINELABS_CLIENT_ID or PINELABS_CLIENT_SECRET in .env.local");
    }
    logContainer.push("✅ Environment variables validated.");

    // 2. HARDCODED ENFORCED TOKEN ROUTE
    const tokenUrl = "https://pluraluat.v2.pinepg.in/api/auth/v1/token";
    logContainer.push(`Connecting to Token Endpoint: ${tokenUrl}`);

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
      }),
      cache: "no-store",
    });

    const tokenRawText = await tokenResponse.text();
    logContainer.push(`Token response status received: ${tokenResponse.status}`);

    if (!tokenResponse.ok) {
      throw new Error(`Token Generation Failed. Raw response: ${tokenRawText}`);
    }

    const tokenData = JSON.parse(tokenRawText);
    const accessToken = tokenData.access_token;
    logContainer.push("✅ Bearer token acquired successfully.");

    // 3. HARDCODED ENFORCED PAYMENT ROUTE (Bypasses all hidden configs)
    const paymentUrl = "https://pluraluat.v2.pinepg.in/api/";
    const uniqueOrderId = `TEST-${Date.now()}`;
    const uniqueRequestId = crypto.randomUUID();
    const currentUtcTimestamp = new Date().toISOString();

    logContainer.push(`Connecting FORCED to: ${paymentUrl}`);
    logContainer.push(`Generated Test Order ID: ${uniqueOrderId}`);

    const paymentResponse = await fetch(paymentUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "Request-Timestamp": currentUtcTimestamp,
        "Request-ID": uniqueRequestId,
      },
      body: JSON.stringify({
        merchant_order_id: uniqueOrderId,
        amount: 2000, // ₹20.00 expressed in Paise minor units
        currency: "INR",
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/callback/pinelabs`,
        customer_email: "test-customer@example.com",
        customer_phone: "9999999999",
      }),
      cache: "no-store",
    });

    const paymentRawText = await paymentResponse.text();
    logContainer.push(`Payment session response status received: ${paymentResponse.status}`);

    // SAFE GUARD: Check if the return payload is HTML before calling JSON.parse
    if (paymentRawText.trim().startsWith("<!DOCTYPE") || paymentRawText.trim().startsWith("<html")) {
      console.error("[CRITICAL INTERCEPTED HTML DUMP]:", paymentRawText.slice(0, 1000));
      throw new Error("Server returned an HTML document instead of API JSON data. Your local environment config is altering request mappings.");
    }

    if (!paymentResponse.ok) {
      throw new Error(`Payment Session Initialization Failed. Raw response: ${paymentRawText}`);
    }

    const paymentData = JSON.parse(paymentRawText);
    const destinationUrl = paymentData.redirect_url || paymentData.payment_url;

    if (!destinationUrl) {
      throw new Error(`Pine Labs returned success, but payment redirection URL property was missing. Full payload: ${paymentRawText}`);
    }

    logContainer.push("🎉 SUCCESS! Payment gateway link generated.");

    return NextResponse.json({
      success: true,
      logs: logContainer,
      paymentUrl: destinationUrl,
    });

  } catch (error: any) {
    logContainer.push(`❌ CRITICAL FAILURE: ${error.message}`);
    return NextResponse.json(
      { success: false, logs: logContainer, error: error.message },
      { status: 500 }
    );
  }
}
