import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function readJsonSafely(response: Response) {
  const text = await response.text();

  try {
    return {
      isJson: true,
      data: JSON.parse(text),
      raw: text,
    };
  } catch {
    return {
      isJson: false,
      data: null,
      raw: text,
    };
  }
}

function parseAmount(value: string | number | undefined | null) {
  if (!value) return 0;
  if (typeof value === "number") return value;

  return Number(value.replace(/[^0-9.-]/g, "")) || 0;
}

function calculatePoints(total: string | number) {
  const amount = parseAmount(total);

  // 1 point for every ₹100 spent
  return Math.floor(amount / 100);
}

function addMonths(dateString: string, months: number) {
  const date = new Date(dateString);
  date.setMonth(date.getMonth() + months);
  return date.toISOString();
}

function isExpiringSoon(expiryDate: string) {
  const now = new Date();
  const expiry = new Date(expiryDate);

  const diffMs = expiry.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  return diffDays > 0 && diffDays <= 30;
}

function getMetaValue(metaData: any[] = [], key: string) {
  return metaData.find((meta) => meta.key === key)?.value || 0;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("customer_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Not logged in",
        },
        { status: 401 }
      );
    }

    /**
     * Step 1: Verify logged-in customer.
     */
    const customerRes = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/rakesh/v1/me`,
      {
        method: "GET",
        headers: {
          "X-Rakesh-Token": token,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const customerParsed = await readJsonSafely(customerRes);

    if (!customerParsed.isJson) {
      return NextResponse.json(
        {
          success: false,
          message: "WordPress customer API returned invalid response.",
          preview: customerParsed.raw.slice(0, 300),
        },
        { status: 500 }
      );
    }

    const customerData = customerParsed.data;

    if (!customerRes.ok || !customerData.success) {
      return NextResponse.json(
        {
          success: false,
          message: customerData.message || "Unable to verify customer.",
          debug: customerData,
        },
        { status: customerRes.status }
      );
    }

    const customerId = Number(customerData.user.id);

    if (!customerId) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer ID not found.",
        },
        { status: 400 }
      );
    }

    /**
     * Step 2: Fetch WooCommerce orders for this customer.
     */
    const auth = Buffer.from(
      `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
    ).toString("base64");

    const ordersRes = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/orders?customer=${customerId}&per_page=100&orderby=date&order=desc`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const ordersParsed = await readJsonSafely(ordersRes);

    if (!ordersParsed.isJson) {
      return NextResponse.json(
        {
          success: false,
          message: "WooCommerce orders API returned invalid response.",
          preview: ordersParsed.raw.slice(0, 300),
        },
        { status: 500 }
      );
    }

    if (!ordersRes.ok) {
      return NextResponse.json(
        {
          success: false,
          message: ordersParsed.data?.message || "Failed to fetch orders.",
          debug: ordersParsed.data,
        },
        { status: ordersRes.status }
      );
    }

    const orders = Array.isArray(ordersParsed.data) ? ordersParsed.data : [];

    /**
     * Earn points only after successful payment.
     */
    const earningStatuses = ["processing", "completed"];

    const earningOrders = orders.filter((order: any) =>
      earningStatuses.includes(order.status)
    );

    /**
     * Deduct redeemed points immediately from active orders.
     *
     * If payment fails/cancelled, the order status should become failed/cancelled.
     * Then points will automatically return because those statuses are excluded here.
     */
    const redemptionDeductionStatuses = [
      "pending",
      "processing",
      "completed",
      "on-hold",
    ];

    const redemptionOrders = orders.filter((order: any) =>
      redemptionDeductionStatuses.includes(order.status)
    );

    /**
     * Earned points history.
     */
    const history = earningOrders.map((order: any) => {
      const earned = calculatePoints(order.total);
      const expiryDate = addMonths(order.date_created, 3);

      const redeemedOnThisOrder = Number(
        getMetaValue(order.meta_data || [], "reward_points_redeemed") || 0
      );

      return {
        order_id: order.id,
        order_number: order.number,
        order_status: order.status,
        order_total: parseAmount(order.total),
        points: earned,
        redeemed: redeemedOnThisOrder,
        type: "earned",
        date: order.date_created,
        expiry_date: expiryDate,
      };
    });

    /**
     * Total earned points.
     */
    const earned = history.reduce((sum: number, item: any) => {
      return sum + Number(item.points || 0);
    }, 0);

    /**
     * Total redeemed points from active orders.
     */
    const redeemed = redemptionOrders.reduce((sum: number, order: any) => {
      return (
        sum +
        Number(
          getMetaValue(order.meta_data || [], "reward_points_redeemed") || 0
        )
      );
    }, 0);

    /**
     * Final available balance.
     */
    const available = Math.max(0, earned - redeemed);

    /**
     * Expiring soon points.
     */
    const expiringSoon = history.reduce((sum: number, item: any) => {
      if (isExpiringSoon(item.expiry_date)) {
        return sum + Number(item.points || 0);
      }

      return sum;
    }, 0);

    return NextResponse.json({
      success: true,
      points: {
        available,
        earned,
        redeemed,
        expiring_soon: expiringSoon,
        point_value: 1,
        total_orders: orders.length,
        eligible_orders: earningOrders.length,
        redemption_orders: redemptionOrders.length,
        earning_rule: "You earn 1 point for every ₹100 spent.",
        expiry_rule: "Points expire after 3 months.",
        history,
      },
    });
  } catch (error) {
    console.error("[CUSTOMER POINTS API ERROR]:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}