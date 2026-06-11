import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/woocommerce";
import type { CreateOrderInput } from "@/lib/woocommerce.d";

type CheckoutCartItem = {
  cart_line_key?: string;

  product_id: number;
  variation_id?: number;
  quantity: number;

  name?: string;
  original_price?: number | string;
  adjusted_price?: number | string;
  line_total?: number | string;

  exchange_applied?: boolean;
  exchange?: {
    category: "ac" | "washing_machine" | "cooler" | "refrigerator";
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
  } | null;

  extended_warranty_applied?: boolean;
  extended_warranty?: {
    title: string;
    percentage: number;
    price: number;
  } | null;
};

function parseMoney(value: string | number | undefined | null) {
  if (!value) return 0;
  if (typeof value === "number") return value;

  return Number(value.replace(/[^0-9.-]/g, "")) || 0;
}

function money(value: number) {
  return value.toFixed(2);
}

function cleanText(value: unknown) {
  return String(value || "")
    .replace(/[^\w\s.,:/()-]/g, "")
    .trim();
}

function buildLineItemMeta(item: CheckoutCartItem) {
  const metaData: { key: string; value: string | number }[] = [];

  if (item.cart_line_key) {
    metaData.push({
      key: "cart_line_key",
      value: item.cart_line_key,
    });
  }

  if (item.exchange_applied && item.exchange) {
    metaData.push(
      {
        key: "exchange_applied",
        value: "yes",
      },
      {
        key: "exchange_category",
        value: item.exchange.category,
      },
      {
        key: "exchange_product",
        value: `${item.exchange.brand} ${item.exchange.type} ${item.exchange.capacity}`,
      },
      {
        key: "exchange_age",
        value: item.exchange.age,
      },
      {
        key: "exchange_pincode",
        value: item.exchange.pincode,
      },
      {
        key: "exchange_working_condition",
        value: item.exchange.workingCondition,
      },
      {
        key: "exchange_body_condition",
        value: item.exchange.bodyCondition,
      },
      {
        key: "exchange_accessories_available",
        value: item.exchange.accessoriesAvailable,
      },
      {
        key: "exchange_value",
        value: item.exchange.exchangeValue,
      }
    );
  }

  if (item.extended_warranty_applied && item.extended_warranty) {
    metaData.push(
      {
        key: "extended_warranty_applied",
        value: "yes",
      },
      {
        key: "extended_warranty_title",
        value: item.extended_warranty.title,
      },
      {
        key: "extended_warranty_percentage",
        value: item.extended_warranty.percentage,
      },
      {
        key: "extended_warranty_price",
        value: item.extended_warranty.price,
      }
    );
  }

  return metaData;
}

function buildAdjustedLineItems(cartItems: CheckoutCartItem[]) {
  return cartItems.map((item) => {
    const quantity = Number(item.quantity || 1);

    const originalUnitPrice = parseMoney(
      item.original_price ?? item.adjusted_price
    );

    const originalLineTotal = originalUnitPrice * quantity;

    return {
      product_id: Number(item.product_id),
      ...(item.variation_id
        ? {
            variation_id: Number(item.variation_id),
          }
        : {}),
      quantity,
      subtotal: money(originalLineTotal),
      total: money(originalLineTotal),
      meta_data: buildLineItemMeta(item),
    };
  });
}

function buildFeeLines(cartItems: CheckoutCartItem[]) {
  return cartItems.flatMap((item) => {
    const fees: {
      name: string;
      tax_status: "none";
      total: string;
    }[] = [];

    const quantity = Number(item.quantity || 1);

    if (item.exchange_applied && item.exchange) {
      const exchangeDiscount =
        Number(item.exchange.exchangeValue || 0) * quantity;

      if (exchangeDiscount > 0) {
        fees.push({
          name: cleanText(
            `Exchange Discount - ${item.exchange.brand} ${item.exchange.type} ${item.exchange.capacity}`
          ),
          tax_status: "none",
          total: money(-exchangeDiscount),
        });
      }
    }

    if (item.extended_warranty_applied && item.extended_warranty) {
      const warrantyFee = Number(item.extended_warranty.price || 0) * quantity;

      if (warrantyFee > 0) {
        fees.push({
          name: cleanText(
            `${item.extended_warranty.title} ${item.extended_warranty.percentage}%`
          ),
          tax_status: "none",
          total: money(warrantyFee),
        });
      }
    }

    return fees;
  });
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { success: false, error: "Content-Type must be application/json" },
        { status: 400 }
      );
    }

    const body = await request.json();

    if (!body?.billing?.email) {
      return NextResponse.json(
        { success: false, error: "Billing email is required" },
        { status: 400 }
      );
    }

    const cartItems: CheckoutCartItem[] = Array.isArray(body.cart_items)
      ? body.cart_items
      : [];

    const hasAdjustedCartItems = cartItems.length > 0;

    if (
      !hasAdjustedCartItems &&
      (!body.line_items || body.line_items.length === 0)
    ) {
      return NextResponse.json(
        { success: false, error: "Cart is empty" },
        { status: 400 }
      );
    }

    const lineItems = hasAdjustedCartItems
      ? buildAdjustedLineItems(cartItems)
      : body.line_items;

    const feeLines = hasAdjustedCartItems ? buildFeeLines(cartItems) : [];

    const rewardPoints = body.reward_points || null;

    const redeemedPoints = Math.floor(Number(rewardPoints?.points || 0));
    const rewardPointValue = Number(rewardPoints?.point_value || 1);
    const rewardDiscountAmount = Number(rewardPoints?.amount || 0);

    if (redeemedPoints > 0 && rewardDiscountAmount > 0) {
      feeLines.push({
        name: `RR Reward Points Redeemed (${redeemedPoints} pts)`,
        tax_status: "none",
        total: money(-rewardDiscountAmount),
      });
    }

    const hasExchangeOrWarranty =
      hasAdjustedCartItems &&
      cartItems.some(
        (item) => item.exchange_applied || item.extended_warranty_applied
      );

    const orderData = {
      customer_id: body.customer_id || 0,
      set_paid: false,
      status: "pending",
      payment_method: "pinelabs",
      payment_method_title: "Pine Labs Online Gateway",
      billing: body.billing,
      shipping: body.shipping,
      line_items: lineItems,
      fee_lines: feeLines,
      customer_note: body.customer_note || "",
      coupon_lines: body.coupon_lines || [],
      meta_data: [
        {
          key: "frontend_total_amount",
          value: body.total_amount ? money(parseMoney(body.total_amount)) : "",
        },
        {
          key: "has_exchange_or_warranty",
          value: hasExchangeOrWarranty ? "yes" : "no",
        },
        {
          key: "reward_points_redeemed",
          value: redeemedPoints,
        },
        {
          key: "reward_point_value",
          value: rewardPointValue,
        },
        {
          key: "reward_discount_amount",
          value: money(rewardDiscountAmount),
        },
      ],
    } as CreateOrderInput & {
      fee_lines?: any[];
      meta_data?: any[];
      status?: string;
    };

    const order = await createOrder(orderData);

    if (!order || !order.id) {
      throw new Error("WooCommerce order creation failed");
    }

    const frontendTotal = parseMoney(body.total_amount);
    const wooTotal = parseMoney(order.total);

    if (frontendTotal > 0 && Math.abs(frontendTotal - wooTotal) > 1) {
      console.warn("[CHECKOUT TOTAL MISMATCH]", {
        frontendTotal,
        wooTotal,
        orderId: order.id,
      });
    }

    const tokenRequestId = crypto.randomUUID();
    const checkoutRequestId = crypto.randomUUID();
    const requestTimestamp = new Date().toISOString();

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
      throw new Error(
        "Access token omitted from Pine Labs authorization response"
      );
    }

    const amountInPaise = Math.round(parseMoney(order.total) * 100);
    const merchantOrderReference = `WC${order.id}T${Date.now()}`;

    if (amountInPaise <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid payment amount" },
        { status: 400 }
      );
    }

    const cleanFirstName =
      order.billing.first_name?.replace(/[^a-zA-Z\s]/g, "").trim() ||
      "Customer";

    const cleanLastName =
      order.billing.last_name?.replace(/[^a-zA-Z\s]/g, "").trim() || "User";

    let cleanMobile = order.billing.phone?.replace(/\D/g, "") || "9999999999";

    if (cleanMobile.length > 10) {
      cleanMobile = cleanMobile.slice(-10);
    }

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
          details: paymentSession,
        },
        { status: 502 }
      );
    }

    const paymentUrl =
      paymentSession?.redirect_url || paymentSession?.data?.redirect_url;

    const pineOrderId =
      paymentSession?.order_id || paymentSession?.data?.order_id;

    if (!paymentUrl) {
      throw new Error(
        "Redirect target context reference missing from payment gateway response structural properties"
      );
    }

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
        amount_paid_to_gateway: amountInPaise,
      },
    });
  } catch (error) {
    console.error("[CHECKOUT API ERROR]:", error);

    const message =
      error instanceof Error ? error.message : "Internal Server Error";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}