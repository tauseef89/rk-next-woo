import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    const wpResponse = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/rakesh/v1/forgot-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    const data = await wpResponse.json().catch(() => null);

    if (!wpResponse.ok || !data?.success) {
      const cleanMessage =
        data?.message?.replace(/<[^>]*>?/gm, "") ||
        "Unable to send reset link";

      return NextResponse.json(
        {
          success: false,
          message: cleanMessage,
        },
        { status: wpResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot Password API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}