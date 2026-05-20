// app/api/orders/[id]/route.ts

import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = Buffer.from(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`).toString("base64");

    // 1. Fetch the Order
    const orderRes = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/orders/${id}`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    const order = await orderRes.json();

    if (!orderRes.ok) return NextResponse.json(order, { status: orderRes.status });

    // 2. Fetch Slugs for each line item (WooCommerce doesn't provide slugs in order lines)
    const enrichedItems = await Promise.all(
      order.line_items.map(async (item: any) => {
        const productRes = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/products/${item.product_id}`, {
          headers: { Authorization: `Basic ${auth}` },
        });
        const productData = await productRes.json();
        return { ...item, slug: productData.slug }; // Attach the slug here
      })
    );

    return NextResponse.json({ ...order, line_items: enrichedItems });
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
