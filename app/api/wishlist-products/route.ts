import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { ids } = await req.json();
    if (!ids || ids.length === 0) return NextResponse.json([]);

    const ck = process.env.WC_CONSUMER_KEY;
    const cs = process.env.WC_CONSUMER_SECRET;
    const baseUrl = process.env.WORDPRESS_URL?.replace(/\/$/, "");

    // Explicitly request JSON and handle the response safely
    const response = await fetch(
      `${baseUrl}/wp-json/wc/v3/products?include=${ids.join(",")}&consumer_key=${ck}&consumer_secret=${cs}`,
      {
        headers: { 
          "Accept": "application/json", // <-- Crucial step
        },
        cache: 'no-store'
      }
    );

    const contentType = response.headers.get("content-type");
    
    if (!response.ok || !contentType?.includes("application/json")) {
      const errorBody = await response.text();
      console.error("WordPress returned non-JSON. Likely a 404/500 HTML page:", errorBody.substring(0, 200));
      return NextResponse.json({ error: "Upstream API error" }, { status: response.status });
    }

    const products = await response.json();
    return NextResponse.json(products);
  } catch (error: any) {
    console.error("API Route Crash:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
