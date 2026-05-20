export async function getPineLabsToken() {
  const response = await fetch(
    `${process.env.PINELABS_API_BASE_URL}/api/auth/v1/token`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        client_id: process.env.PINELABS_CLIENT_ID,
        client_secret:
          process.env.PINELABS_CLIENT_SECRET,
        grant_type: "client_credentials",
      }),

      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data.access_token;
}