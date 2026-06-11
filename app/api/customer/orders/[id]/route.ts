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

function getMetaValue(metaData: any[] = [], key: string) {
  return metaData.find((meta) => meta.key === key)?.value || "";
}

function extractItemAdjustments(item: any) {
  const metaData = item.meta_data || [];

  const exchangeApplied = getMetaValue(metaData, "exchange_applied") === "yes";
  const warrantyApplied =
    getMetaValue(metaData, "extended_warranty_applied") === "yes";

  return {
    exchange: exchangeApplied
      ? {
          applied: true,
          category: getMetaValue(metaData, "exchange_category"),
          product: getMetaValue(metaData, "exchange_product"),
          age: getMetaValue(metaData, "exchange_age"),
          pincode: getMetaValue(metaData, "exchange_pincode"),
          workingCondition: getMetaValue(
            metaData,
            "exchange_working_condition"
          ),
          bodyCondition: getMetaValue(metaData, "exchange_body_condition"),
          accessoriesAvailable: getMetaValue(
            metaData,
            "exchange_accessories_available"
          ),
          value: getMetaValue(metaData, "exchange_value"),
        }
      : null,

    extendedWarranty: warrantyApplied
      ? {
          applied: true,
          title: getMetaValue(metaData, "extended_warranty_title"),
          percentage: getMetaValue(metaData, "extended_warranty_percentage"),
          price: getMetaValue(metaData, "extended_warranty_price"),
        }
      : null,
  };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order ID.",
        },
        { status: 400 }
      );
    }

    /**
     * Step 1: Get logged-in customer from custom plugin.
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

    /**
     * Step 2: Fetch WooCommerce order securely from server side.
     */
    const auth = Buffer.from(
      `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
    ).toString("base64");

    const orderRes = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/orders/${id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const orderParsed = await readJsonSafely(orderRes);

    if (!orderParsed.isJson) {
      return NextResponse.json(
        {
          success: false,
          message: "WooCommerce order API returned invalid response.",
          preview: orderParsed.raw.slice(0, 300),
        },
        { status: 500 }
      );
    }

    const order = orderParsed.data;

    if (!orderRes.ok) {
      return NextResponse.json(
        {
          success: false,
          message: order.message || "Failed to fetch order.",
          debug: order,
        },
        { status: orderRes.status }
      );
    }

    /**
     * Step 3: Security check.
     */
    if (Number(order.customer_id) !== customerId) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not allowed to view this order.",
        },
        { status: 403 }
      );
    }

    /**
     * Step 4: Enrich line items with product slug/image and exchange/warranty details.
     */
    const enrichedItems = await Promise.all(
      (order.line_items || []).map(async (item: any) => {
        const adjustments = extractItemAdjustments(item);

        try {
          if (!item.product_id) {
            return {
              ...item,
              slug: "",
              image: null,
              exchange: adjustments.exchange,
              extendedWarranty: adjustments.extendedWarranty,
            };
          }

          const productRes = await fetch(
            `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/products/${item.product_id}`,
            {
              method: "GET",
              headers: {
                Authorization: `Basic ${auth}`,
                Accept: "application/json",
              },
              cache: "no-store",
            }
          );

          const productParsed = await readJsonSafely(productRes);

          if (!productRes.ok || !productParsed.isJson) {
            return {
              ...item,
              slug: "",
              image: null,
              exchange: adjustments.exchange,
              extendedWarranty: adjustments.extendedWarranty,
            };
          }

          const productData = productParsed.data;

          return {
            ...item,
            slug: productData.slug || "",
            permalink: productData.permalink || "",
            image: productData.images?.[0]?.src || item.image?.src || null,
            exchange: adjustments.exchange,
            extendedWarranty: adjustments.extendedWarranty,
          };
        } catch {
          return {
            ...item,
            slug: "",
            image: null,
            exchange: adjustments.exchange,
            extendedWarranty: adjustments.extendedWarranty,
          };
        }
      })
    );

    /**
     * Step 5: Return order with fee lines also.
     * Exchange discount and extended warranty are stored in fee_lines.
     */
    return NextResponse.json({
      success: true,
      order: {
        ...order,
        line_items: enrichedItems,
        fee_lines: order.fee_lines || [],
        meta_data: order.meta_data || [],
      },
    });
  } catch (error) {
    console.error("Order details API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}