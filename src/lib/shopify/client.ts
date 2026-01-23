const domain = process.env.SHOPIFY_STORE_DOMAIN;
const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

export async function shopifyFetch<T>({
  query,
  variables = {},
}: {
  query: string;
  variables?: any;
}): Promise<{ data: T } | never> {
  const isClient = typeof window !== "undefined";

  if (isClient) {
    try {
      const res = await fetch("/api/shopify/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(
          `Proxy error: ${res.status} ${
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
      console.error("Client fetch error via proxy:", error);
      throw error;
    }
  }

  // Server-side fetching
  if (!domain || !accessToken) {
    throw new Error("Shopify credentials missing on server.");
  }

  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const endpoint = `https://${cleanDomain}/api/2024-01/graphql.json`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": accessToken,
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 3600 },
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(
        `Shopify API error: ${res.status} ${
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
    console.error("Server fetch error:", error);
    throw error;
  }
}
