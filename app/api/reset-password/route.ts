import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { login, key, password } = await req.json();

    if (!login || !key || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Login, key and password are required.",
        },
        { status: 400 }
      );
    }

    const wpResponse = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/rakesh/v1/reset-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          login,
          key,
          password,
        }),
      }
    );

    const data = await wpResponse.json().catch(() => null);

    if (!wpResponse.ok || !data?.success) {
      return NextResponse.json(
        {
          success: false,
          message: data?.message || "Unable to reset password.",
        },
        { status: wpResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (error) {
    console.error("Reset Password API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}