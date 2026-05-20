import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 3) {
    return NextResponse.json([]);
  }

  // 1. Build the WooCommerce URL
  const url = `${process.env.WORDPRESS_URL}/wp-json/wc/v3/products?search=${encodeURIComponent(query)}&per_page=6`;
  
  // 2. Prepare Authentication (Server-side only)
  const auth = Buffer.from(
    `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
  ).toString("base64");

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });
    
    if (!response.ok) throw new Error("WooCommerce API error");
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
