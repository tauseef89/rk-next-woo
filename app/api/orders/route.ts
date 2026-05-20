import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ message: "User ID is required" }, { status: 400 });
  }

  try {
    const auth = Buffer.from(
      `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
    ).toString("base64");

    // Fetch orders filtered by the specific customer ID
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/orders?customer=${userId}&per_page=5`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    const orders = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: orders.message || "Failed to fetch orders" },
        { status: response.status }
      );
    }

    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
