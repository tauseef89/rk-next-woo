import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type AddressType = "billing" | "shipping";

type AddressData = {
  first_name?: string;
  last_name?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  phone?: string;
};

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

    const type = body.type as AddressType;
    const address = body.address as AddressData;

    if (!type || !["billing", "shipping"].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid address type.",
        },
        { status: 400 }
      );
    }

    if (!address || typeof address !== "object") {
      return NextResponse.json(
        {
          success: false,
          message: "Address data is required.",
        },
        { status: 400 }
      );
    }

    const wpUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/rakesh/v1/address`;

    const wpResponse = await fetch(wpUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Rakesh-Token": token,
        Accept: "application/json",
      },
      body: JSON.stringify({
        type,
        address: {
          first_name: address.first_name || "",
          last_name: address.last_name || "",
          address_1: address.address_1 || "",
          address_2: address.address_2 || "",
          city: address.city || "",
          state: address.state || "",
          postcode: address.postcode || "",
          country: address.country || "IN",
          phone: address.phone || "",
        },
      }),
      cache: "no-store",
    });

    const parsed = await readJsonSafely(wpResponse);

    if (!parsed.isJson) {
      console.error("WordPress address API returned non-JSON:", {
        status: wpResponse.status,
        url: wpUrl,
        preview: parsed.raw.slice(0, 500),
      });

      return NextResponse.json(
        {
          success: false,
          message: "WordPress address API returned invalid response.",
          status: wpResponse.status,
          preview: parsed.raw.slice(0, 300),
        },
        { status: 500 }
      );
    }

    const data = parsed.data;

    if (!wpResponse.ok || !data.success) {
      console.error("WordPress address API error:", {
        status: wpResponse.status,
        data,
      });

      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to update address.",
          debug: data,
        },
        { status: wpResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: data.message || "Address updated successfully.",
      user: data.user || null,
    });
  } catch (error) {
    console.error("Customer address API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}