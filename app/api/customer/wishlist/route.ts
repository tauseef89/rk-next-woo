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

function getWordPressUrl() {
  return process.env.NEXT_PUBLIC_WORDPRESS_URL?.replace(/\/$/, "");
}

export async function GET() {
  try {
    const wpUrl = getWordPressUrl();

    if (!wpUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "NEXT_PUBLIC_WORDPRESS_URL is missing.",
          wishlist: [],
        },
        { status: 500 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("customer_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Not logged in. customer_token cookie missing.",
          wishlist: [],
        },
        { status: 401 }
      );
    }

    const wpResponse = await fetch(`${wpUrl}/wp-json/rakesh/v1/wishlist`, {
      method: "GET",
      headers: {
        "x-rakesh-token": token,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const parsed = await readJsonSafely(wpResponse);

    if (!parsed.isJson) {
      return NextResponse.json(
        {
          success: false,
          message: "WordPress wishlist API returned invalid response.",
          wishlist: [],
          raw: parsed.raw,
        },
        { status: 500 }
      );
    }

    const data = parsed.data;

    return NextResponse.json(
      {
        success: Boolean(data.success),
        message: data.message || "",
        wishlist: Array.isArray(data.wishlist)
          ? data.wishlist.map(Number).filter(Boolean)
          : [],
      },
      { status: wpResponse.status }
    );
  } catch (error) {
    console.error("Wishlist GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        wishlist: [],
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const wpUrl = getWordPressUrl();

    if (!wpUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "NEXT_PUBLIC_WORDPRESS_URL is missing.",
          wishlist: [],
        },
        { status: 500 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("customer_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Not logged in. customer_token cookie missing.",
          wishlist: [],
        },
        { status: 401 }
      );
    }

    let body: any;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON body.",
          wishlist: [],
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(body?.wishlist)) {
      return NextResponse.json(
        {
          success: false,
          message: "Wishlist must be an array.",
          received: body,
          wishlist: [],
        },
        { status: 400 }
      );
    }

    const wishlist = body.wishlist
      .map((id: unknown) => Number(id))
      .filter((id: number) => Number.isInteger(id) && id > 0);

    const uniqueWishlist = Array.from(new Set(wishlist));

    const wpResponse = await fetch(`${wpUrl}/wp-json/rakesh/v1/wishlist`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-rakesh-token": token,
        Accept: "application/json",
      },
      body: JSON.stringify({
        wishlist: uniqueWishlist,
      }),
      cache: "no-store",
    });

    const parsed = await readJsonSafely(wpResponse);

    if (!parsed.isJson) {
      return NextResponse.json(
        {
          success: false,
          message: "WordPress wishlist API returned invalid response.",
          raw: parsed.raw,
          wishlist: [],
        },
        { status: 500 }
      );
    }

    const data = parsed.data;

    return NextResponse.json(
      {
        success: Boolean(data.success),
        message: data.message || "Wishlist updated.",
        wishlist: Array.isArray(data.wishlist)
          ? data.wishlist.map(Number).filter(Boolean)
          : uniqueWishlist,
      },
      { status: wpResponse.status }
    );
  } catch (error) {
    console.error("Wishlist PUT error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        wishlist: [],
      },
      { status: 500 }
    );
  }
}