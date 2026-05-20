import { NextResponse } from "next/server";
import { cookies } from "next/headers"; // 1. Import cookies

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/jwt-auth/v1/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const cleanMessage = data.message?.replace(/<[^>]*>?/gm, "") || "Invalid credentials";
      return NextResponse.json({ message: cleanMessage }, { status: response.status });
    }

    // 2. Set the Cookie securely
    const cookieStore = await cookies();
    cookieStore.set("woo-token", data.token, {
      httpOnly: true, // Prevents JavaScript access (XSS protection)
      secure: process.env.NODE_ENV === "production", // Only over HTTPS in production
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    // 3. Return the data to the frontend
    return NextResponse.json({
      token: data.token,
      user: {
        id: data.user_id,
        email: data.user_email,
        name: data.user_display_name,
      },
    });
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
