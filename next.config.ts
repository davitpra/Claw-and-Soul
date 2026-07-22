import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@shopify/polaris"],
  // Rutas renombradas para que la URL coincida con el copy del nav ("Catalog",
  // "Studio"). Next reenvía el query string solo cuando el destino no trae el
  // suyo, así que /shop?q=cat llega a /catalog?q=cat.
  async redirects() {
    return [
      { source: "/shop", destination: "/catalog", permanent: true },
      { source: "/paint-by-numbers", destination: "/studio", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "fal.media",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
