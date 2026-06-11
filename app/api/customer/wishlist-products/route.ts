import { NextResponse } from "next/server";
import { cookies } from "next/headers";

interface WishlistProduct {
  id: number;
  name: string;
  slug: string;
  price: string;
  regular_price: string;
  image: string;
  category: string;
}

interface ProductFetchResult {
  success: boolean;
  status: number;
  message: string;
  products: WishlistProduct[];
}

function getWordPressUrl(): string {
  return (
    process.env.NEXT_PUBLIC_WORDPRESS_URL ||
    process.env.WORDPRESS_URL ||
    ""
  ).replace(/\/$/, "");
}

function getWooKeys() {
  return {
    ck: process.env.WC_CONSUMER_KEY || process.env.WOOCOMMERCE_CONSUMER_KEY,
    cs: process.env.WC_CONSUMER_SECRET || process.env.WOOCOMMERCE_CONSUMER_SECRET,
  };
}

async function readJsonSafely(response: Response): Promise<{
  isJson: boolean;
  data: any;
  raw: string;
}> {
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

function toCleanNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((id: unknown) => Number(id))
    .filter((id: number): id is number => Number.isInteger(id) && id > 0);
}

function uniqueNumbers(ids: number[]): number[] {
  return Array.from(new Set<number>(ids));
}

function normalizeProduct(product: any): WishlistProduct {
  return {
    id: Number(product?.id),
    name: String(product?.name || ""),
    slug: String(product?.slug || product?.id || ""),
    price: String(product?.price || ""),
    regular_price: String(product?.regular_price || ""),
    image: String(product?.images?.[0]?.src || "/placeholder.png"),
    category: String(product?.categories?.[0]?.name || "Collection"),
  };
}

async function fetchProductsByIds(ids: number[]): Promise<ProductFetchResult> {
  const baseUrl = getWordPressUrl();
  const { ck, cs } = getWooKeys();

  if (!baseUrl) {
    return {
      success: false,
      status: 500,
      message: "WORDPRESS_URL or NEXT_PUBLIC_WORDPRESS_URL is missing.",
      products: [],
    };
  }

  if (!ck || !cs) {
    return {
      success: false,
      status: 500,
      message: "WooCommerce consumer key or secret is missing.",
      products: [],
    };
  }

  const cleanIds: number[] = uniqueNumbers(
    ids.filter((id: number): id is number => Number.isInteger(id) && id > 0)
  );

  if (cleanIds.length === 0) {
    return {
      success: true,
      status: 200,
      message: "",
      products: [],
    };
  }

  const url = new URL(`${baseUrl}/wp-json/wc/v3/products`);

  url.searchParams.set("include", cleanIds.join(","));
  url.searchParams.set("per_page", "100");
  url.searchParams.set("consumer_key", ck);
  url.searchParams.set("consumer_secret", cs);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const parsed = await readJsonSafely(response);

  if (!parsed.isJson) {
    console.error("WooCommerce returned non-JSON response:", {
      status: response.status,
      raw: parsed.raw.substring(0, 500),
    });

    return {
      success: false,
      status: response.status || 500,
      message: "WooCommerce returned non-JSON response.",
      products: [],
    };
  }

  if (!response.ok || !Array.isArray(parsed.data)) {
    console.error("WooCommerce products API error:", parsed.data);

    return {
      success: false,
      status: response.status || 500,
      message: parsed.data?.message || "Unable to fetch products.",
      products: [],
    };
  }

  const productMap = new Map<number, WishlistProduct>();

  parsed.data.forEach((product: any) => {
    const normalized = normalizeProduct(product);

    if (Number.isInteger(normalized.id) && normalized.id > 0) {
      productMap.set(normalized.id, normalized);
    }
  });

  const orderedProducts: WishlistProduct[] = cleanIds
    .map((id: number) => productMap.get(id))
    .filter((product): product is WishlistProduct => Boolean(product));

  return {
    success: true,
    status: 200,
    message: "",
    products: orderedProducts,
  };
}

/**
 * GET /api/customer/wishlist-products
 * Used by My Account Wishlist page.
 * Reads wishlist IDs from your custom WordPress plugin,
 * then fetches product details from WooCommerce.
 */
export async function GET() {
  try {
    const baseUrl = getWordPressUrl();

    if (!baseUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "WORDPRESS_URL or NEXT_PUBLIC_WORDPRESS_URL is missing.",
          wishlist: [],
          products: [],
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
          products: [],
        },
        { status: 401 }
      );
    }

    const wishlistResponse = await fetch(`${baseUrl}/wp-json/rakesh/v1/wishlist`, {
      method: "GET",
      headers: {
        "x-rakesh-token": token,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const parsedWishlist = await readJsonSafely(wishlistResponse);

    if (!parsedWishlist.isJson) {
      console.error("WordPress wishlist API returned non-JSON response:", {
        status: wishlistResponse.status,
        raw: parsedWishlist.raw.substring(0, 500),
      });

      return NextResponse.json(
        {
          success: false,
          message: "WordPress wishlist API returned non-JSON response.",
          wishlist: [],
          products: [],
        },
        { status: 500 }
      );
    }

    const wishlistData = parsedWishlist.data;

    if (!wishlistResponse.ok || !wishlistData?.success) {
      return NextResponse.json(
        {
          success: false,
          message: wishlistData?.message || "Unable to fetch wishlist.",
          wishlist: [],
          products: [],
        },
        { status: wishlistResponse.status }
      );
    }

    const wishlistIds: number[] = uniqueNumbers(
      toCleanNumberArray(wishlistData.wishlist)
    );

    if (wishlistIds.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: "",
          wishlist: [],
          products: [],
        },
        { status: 200 }
      );
    }

    const productResult = await fetchProductsByIds(wishlistIds);

    return NextResponse.json(
      {
        success: productResult.success,
        message: productResult.message,
        wishlist: wishlistIds,
        products: productResult.products,
      },
      { status: productResult.status }
    );
  } catch (error: any) {
    console.error("Wishlist products GET crash:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal Server Error",
        wishlist: [],
        products: [],
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/customer/wishlist-products
 * Optional helper route.
 * Use only if you manually send { ids: [101, 102] }.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as {
      ids?: unknown;
    } | null;

    const ids: number[] = uniqueNumbers(toCleanNumberArray(body?.ids));

    if (ids.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: "",
          products: [],
        },
        { status: 200 }
      );
    }

    const productResult = await fetchProductsByIds(ids);

    return NextResponse.json(
      {
        success: productResult.success,
        message: productResult.message,
        products: productResult.products,
      },
      { status: productResult.status }
    );
  } catch (error: any) {
    console.error("Wishlist products POST crash:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal Server Error",
        products: [],
      },
      { status: 500 }
    );
  }
}