import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, first_name, last_name, password, username } = await req.json();

    // 1. Create the user in WooCommerce
    const auth = Buffer.from(
      `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
    ).toString("base64");

    const createRes = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/customers`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({ email, first_name, last_name, username, password }),
      }
    );

    const userData = await createRes.json();

    if (!createRes.ok) {
      return NextResponse.json(
        { message: userData.message || "Registration failed" },
        { status: createRes.status }
      );
    }

    // 2. Generate a JWT Token for the new user immediately
    const loginRes = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/jwt-auth/v1/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      }
    );

    const loginData = await loginRes.json();

    // 3. Return both the user and the token to the frontend
    return NextResponse.json({
      message: "User created and logged in successfully",
      token: loginData.token, // This allows the "Auto-Login"
      user: {
        id: userData.id,
        email: userData.email,
        name: `${userData.first_name} ${userData.last_name}`.trim() || userData.username,
      },
    });

  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
