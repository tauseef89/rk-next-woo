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

export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const perPage = searchParams.get("per_page") || "10";

    const wpUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/rakesh/v1/orders?per_page=${perPage}`;

    const wpResponse = await fetch(wpUrl, {
      method: "GET",
      headers: {
        "X-Rakesh-Token": token,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const parsed = await readJsonSafely(wpResponse);

    if (!parsed.isJson) {
      console.error("WordPress orders API returned non-JSON:", {
        status: wpResponse.status,
        url: wpUrl,
        preview: parsed.raw.slice(0, 500),
      });

      return NextResponse.json(
        {
          success: false,
          message: "WordPress orders API returned invalid response.",
          status: wpResponse.status,
          preview: parsed.raw.slice(0, 300),
        },
        { status: 500 }
      );
    }

    const data = parsed.data;

    if (!wpResponse.ok || !data.success) {
      console.error("WordPress orders API error:", {
        status: wpResponse.status,
        data,
      });

      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to fetch orders",
          debug: data,
        },
        { status: wpResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      orders: Array.isArray(data.orders) ? data.orders : [],
    });
  } catch (error) {
    console.error("Customer orders API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}