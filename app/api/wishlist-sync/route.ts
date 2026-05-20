import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, productIds } = await req.json();

    if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

    const ck = process.env.WC_CONSUMER_KEY;
    const cs = process.env.WC_CONSUMER_SECRET;
    const baseUrl = process.env.WORDPRESS_URL?.replace(/\/$/, "");

    // Save wishlist IDs into a custom meta field called 'saved_wishlist'
    const response = await fetch(`${baseUrl}/wp-json/wc/v3/customers/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${ck}:${cs}`).toString("base64")}`,
      },
      body: JSON.stringify({
        meta_data: [
          {
            key: "saved_wishlist",
            value: JSON.stringify(productIds), // Store as a JSON string
          },
        ],
      }),
    });

    if (!response.ok) throw new Error("Failed to sync with WordPress");

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
