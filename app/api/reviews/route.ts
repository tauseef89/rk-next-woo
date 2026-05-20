// app/api/reviews/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { productId, review, token } = await req.json();

    // 1. Check if the URL is defined
    if (!process.env.WORDPRESS_URL) {
      console.error("ERROR: WORDPRESS_URL is missing in .env");
      return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
    }

    const response = await fetch(`${process.env.WORDPRESS_URL}/wp-json/wc/v3/products/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "consumer_key": process.env.WC_CONSUMER_KEY!,
        "consumer_secret": process.env.WC_CONSUMER_SECRET!,
      },
      body: JSON.stringify({
        product_id: productId,
        ...review,
        status: "hold",
      }),
    });

    const data = await response.json();

    // 2. If WordPress returns an error, catch the SPECIFIC message
    if (!response.ok) {
      console.error("WordPress API Error:", data); // Check your VS Code terminal for this!
      return NextResponse.json({ 
        message: data.message || "WordPress rejected the review" 
      }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    // 3. Catch system/network errors
    console.error("DETAILED SYSTEM ERROR:", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
