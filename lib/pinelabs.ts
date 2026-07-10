type PineLabsTokenResponse = {
  access_token?: string;
  expires_in?: number;
  message?: string;
  error?: {
    message?: string;
  };
};

function parseJsonSafely<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export async function getPineLabsToken(): Promise<string> {
  const baseUrl = process.env.PINELABS_API_BASE_URL?.replace(/\/$/, "");
  const clientId = process.env.PINELABS_CLIENT_ID;
  const clientSecret = process.env.PINELABS_CLIENT_SECRET;

  if (!baseUrl) {
    throw new Error("PINELABS_API_BASE_URL is missing");
  }

  if (!clientId) {
    throw new Error("PINELABS_CLIENT_ID is missing");
  }

  if (!clientSecret) {
    throw new Error("PINELABS_CLIENT_SECRET is missing");
  }

  const response = await fetch(`${baseUrl}/api/auth/v1/token`, {
    method: "POST",

    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Request-ID": crypto.randomUUID(),
      "Request-Timestamp": new Date().toISOString(),
    },

    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),

    cache: "no-store",
  });

  const rawResponse = await response.text();

  const data = parseJsonSafely<PineLabsTokenResponse>(rawResponse);

  if (!response.ok) {
    console.error("[PINE LABS TOKEN ERROR]", {
      status: response.status,
      response: data ?? rawResponse,
    });

    throw new Error(
      data?.message ||
        data?.error?.message ||
        `Pine Labs token generation failed. Status: ${response.status}`
    );
  }

  if (!data?.access_token) {
    console.error("[PINE LABS TOKEN MISSING]", {
      response: data ?? rawResponse,
    });

    throw new Error("Pine Labs did not return an access token");
  }

  return data.access_token;
}