export async function shopifyFetch<T>({
  query,
  variables = {},
}: {
  query: string;
  variables?: any;
}): Promise<{ data: T } | never> {
  try {
    const isServer = typeof window === "undefined";

    let url: string;
    let headers: Record<string, string> = { "Content-Type": "application/json" };

    if (isServer) {
      // En el servidor, llamar directamente a Shopify sin pasar por el proxy
      const domain = process.env.SHOPIFY_STORE_DOMAIN;
      const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

      if (!domain || !accessToken) {
        throw new Error("Shopify credentials not configured on server");
      }

      const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
      url = `https://${cleanDomain}/api/2026-01/graphql.json`;
      headers["X-Shopify-Storefront-Access-Token"] = accessToken;
    } else {
      url = "/api/shopify/proxy";
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
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
