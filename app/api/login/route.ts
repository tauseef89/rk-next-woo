import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    const wpResponse = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/rakesh/v1/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await wpResponse.json();

    if (!wpResponse.ok || !data.success) {
      const cleanMessage =
        data.message?.replace(/<[^>]*>?/gm, "") || "Invalid credentials";

      return NextResponse.json(
        {
          success: false,
          message: cleanMessage,
        },
        { status: wpResponse.status }
      );
    }

    const token = data.token;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Token missing from WordPress login response.",
        },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name: data.user?.name,
      },
    });

    response.cookies.set("customer_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}