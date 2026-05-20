import { NextResponse } from "next/server";

export async function GET() {
  try {
    const auth = Buffer.from(
      `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
    ).toString("base64");

    // Replace '1' with your actual Shipping Zone ID
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/shipping/zones/1/methods`,
      {
        headers: { Authorization: `Basic ${auth}` },
        cache: 'no-store'
      }
    );

    const methods = await res.json();

    // Filter to only include 'local_pickup' methods
    const pickupLocations = methods
      .filter((m: any) => m.method_id === "local_pickup" && m.enabled === true)
      .map((m: any) => ({
        id: m.instance_id,
        name: m.title,
        // If you've added addresses in descriptions or titles, parse them here
        description: m.settings?.description?.value || "" 
      }));

    return NextResponse.json(pickupLocations);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 });
  }
}
