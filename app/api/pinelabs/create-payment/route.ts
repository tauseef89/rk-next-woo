import { NextResponse } from "next/server";
import { getPineLabsToken } from "@/lib/pinelabs";

export async function POST() {
  try {
    const token = await getPineLabsToken();

    const payload = {
  merchant_order_reference:
    `ORD${Date.now()}${Math.floor(
      Math.random() * 1000
    )}`,

  order_amount: {
    value: 100,
    currency: "INR",
  },

  callback_url:
    "http://localhost:3000/payment-success",
};

    console.log(payload);

    const response = await fetch(
      `${process.env.PINELABS_API_BASE_URL}/api/pay/v1/orders`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    console.log(data);

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}