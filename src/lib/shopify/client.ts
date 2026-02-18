export async function shopifyFetch<T>({
  query,
  variables = {},
}: {
  query: string;
  variables?: any;
}): Promise<{ data: T } | never> {
  try {
    // En el servidor, necesitamos una URL absoluta
    const isServer = typeof window === "undefined";
    const baseUrl = isServer
      ? process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      : "";
    const url = `${baseUrl}/api/shopify/proxy`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(
        `Shopify proxy error: ${res.status} ${
          json.errors ? JSON.stringify(json.errors) : JSON.stringify(json)
        }`
      );
    }

    if (!json.data) {
      throw new Error(
        `Shopify error: ${
          json.errors ? JSON.stringify(json.errors) : "No data returned"
        }`
      );
    }

    return json;
  } catch (error) {
    console.error("Shopify fetch error via proxy:", error);
    throw error;
  }
}
