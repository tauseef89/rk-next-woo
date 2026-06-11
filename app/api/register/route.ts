import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, first_name, last_name, password, username, phone } =
      await req.json();

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required",
        },
        { status: 400 }
      );
    }

    const name =
      `${first_name || ""} ${last_name || ""}`.trim() || username || email;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/rakesh/v1/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      const cleanMessage =
        data.message?.replace(/<[^>]*>?/gm, "") || "Registration failed";

      return NextResponse.json(
        {
          success: false,
          message: cleanMessage,
        },
        { status: response.status }
      );
    }

    const cookieStore = await cookies();

    cookieStore.set("customer_token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({
      success: true,
      message: "User created and logged in successfully",
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        phone: data.user.phone || phone || "",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}