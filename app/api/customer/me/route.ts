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

    const wpUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/rakesh/v1/me`;

    const response = await fetch(wpUrl, {
      method: "GET",
      headers: {
        "X-Rakesh-Token": token,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const parsed = await readJsonSafely(response);

    if (!parsed.isJson) {
      console.error("WordPress /me returned non-JSON:", {
        status: response.status,
        preview: parsed.raw.slice(0, 500),
      });

      return NextResponse.json(
        {
          success: false,
          message: "WordPress customer API returned invalid response.",
          status: response.status,
          preview: parsed.raw.slice(0, 300),
        },
        { status: 500 }
      );
    }

    const data = parsed.data;

    if (!response.ok || !data.success) {
      console.error("WordPress /me error:", {
        status: response.status,
        data,
      });

      return NextResponse.json(
        {
          success: false,
          message: data.message || "Unable to fetch customer details",
          debug: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      user: data.user,
    });
  } catch (error) {
    console.error("Customer me API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}