import { NextResponse } from "next/server";

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

export async function POST(request: Request) {
  try {
    const { query, variables } = await request.json();

    if (!domain || !accessToken) {
      return NextResponse.json(
        { error: "Shopify credentials not configured on server" },
        { status: 500 }
      );
    }

    const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const endpoint = `https://${cleanDomain}/api/2024-01/graphql.json`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": accessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Shopify API Error:", data);
      return NextResponse.json(data, { status: res.status });
    }

    if (data.errors) {
      console.error("Shopify GraphQL Errors:", data.errors);
      // We still return 200 if it's a GraphQL error, but the client should handle it
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Shopify Proxy Exception:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error during Shopify fetch",
        details: error instanceof Error ? error.message : "Unknown",
      },
      { status: 500 }
    );
  }
}
