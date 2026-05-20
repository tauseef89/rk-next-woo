import { NextResponse } from "next/server";

const WP_URL = process.env.WORDPRESS_URL?.replace(/\/$/, "");
const API_BASE = `${WP_URL}/wp-json/yith/wishlist/v1`;
const AUTH_HEADER = `Basic ${Buffer.from(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`).toString('base64')}`;

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    
    // If we have a Bearer token, we use it to fetch the specific user's wishlist
    const fetchOptions: any = {
      headers: { Authorization: AUTH_HEADER }, // Basic Auth for Admin access
      cache: "no-store",
    };

    // If a user token is provided, YITH will filter by that user
    const res = await fetch(`${API_BASE}/wishlists`, fetchOptions);
    const data = await res.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}


export async function POST(req: Request) {
  try {
    const { productId, wishlistId = 0 } = await req.json();
    // YITH endpoint: /wishlists/{wishlist_id}/product/{product_id}
    const res = await fetch(`${API_BASE}/wishlists/${wishlistId}/product/${productId}`, {
      method: "POST",
      headers: { Authorization: AUTH_HEADER },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Add failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { productId, wishlistId } = await req.json();
    const res = await fetch(`${API_BASE}/wishlists/${wishlistId}/product/${productId}`, {
      method: "DELETE",
      headers: { Authorization: AUTH_HEADER },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Remove failed" }, { status: 500 });
  }
}
