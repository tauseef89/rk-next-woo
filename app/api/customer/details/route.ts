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

export async function PUT(req: Request) {
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

    const body = await req.json();

    const wpResponse = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/rakesh/v1/details`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Rakesh-Token": token,
          Accept: "application/json",
        },
        body: JSON.stringify({
          first_name: body.first_name || "",
          last_name: body.last_name || "",
          display_name: body.display_name || "",
          email: body.email || "",
          password: body.password || "",
          wishlist: Array.isArray(body.wishlist) ? body.wishlist : [],
        }),
        cache: "no-store",
      }
    );

    const parsed = await readJsonSafely(wpResponse);

    if (!parsed.isJson) {
      return NextResponse.json(
        {
          success: false,
          message: "WordPress details API returned invalid response.",
          status: wpResponse.status,
          preview: parsed.raw.slice(0, 300),
        },
        { status: 500 }
      );
    }

    const data = parsed.data;

    if (!wpResponse.ok || !data.success) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to update account details.",
          debug: data,
        },
        { status: wpResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: data.message || "Account details updated successfully.",
      user: data.user || null,
    });
  } catch (error) {
    console.error("Customer details API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}