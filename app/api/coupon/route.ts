import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code")?.toLowerCase();

    if (!code) {
      return NextResponse.json({ message: "Coupon code is required" }, { status: 400 });
    }

    const auth = Buffer.from(
      `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
    ).toString("base64");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/coupons?code=${code}`,
      {
        headers: { Authorization: `Basic ${auth}` },
        next: { revalidate: 60 }
      }
    );

    const data = await res.json();

    if (!res.ok || data.length === 0) {
      return NextResponse.json({ message: "Invalid or expired coupon" }, { status: 404 });
    }

    const coupon = data[0];

    // --- NEW: Expiry Check ---
    if (coupon.date_expires && new Date(coupon.date_expires) < new Date()) {
      return NextResponse.json({ message: "This coupon has expired" }, { status: 400 });
    }

    // --- NEW: Usage Limit Check ---
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return NextResponse.json({ message: "Coupon usage limit reached" }, { status: 400 });
    }

    return NextResponse.json({
      id: coupon.id,
      code: coupon.code,
      // Parsed as numbers for easier frontend math
      amount: parseFloat(coupon.amount || "0"),
      discount_type: coupon.discount_type,
      minimum_amount: parseFloat(coupon.minimum_amount || "0"),
      individual_use: coupon.individual_use,
    });

  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
