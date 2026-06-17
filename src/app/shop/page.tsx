"use client";

import { Navbar } from "@/widgets/navbar";
import { Footer } from "@/widgets/footer";
import { useState, useEffect } from "react";
import { getProducts } from "@/lib/shopify";
import { Product } from "@/entities/pet-product/model/types";
import { ProductCard } from "@/entities/pet-product/ui/ProductCard";

// Producto de entidad + la categoría usada por el filtro del shop.
type ShopProduct = Product & { category: string };

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState("All Products");
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(["All Products"]);

  // Fetch products from Shopify
  useEffect(() => {
    async function fetchProducts() {
      try {
        const fetchedData = await getProducts(20);

        console.log("Fetched products from Shopify:", fetchedData);
        console.log("Total products fetched:", fetchedData.length);

        const mappedProducts = fetchedData.map((node) => {
          const price = node.priceRange?.minVariantPrice || {
            amount: "0.00",
            currencyCode: "USD",
          };
          const category = node.collections?.edges?.[0]?.node.title || "Other";

          // Formatea un monto como moneda (p. ej. "$42.00").
          const formatMoney = (amount: string, currencyCode: string) =>
            new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: currencyCode,
              currencyDisplay: "narrowSymbol",
            }).format(parseFloat(amount));

          // Precio comparativo (de lista): solo es oferta si supera al precio actual.
          const compareAt = node.compareAtPriceRange?.minVariantPrice;
          const priceAmount = parseFloat(price.amount);
          const compareAmount = compareAt ? parseFloat(compareAt.amount) : 0;
          const onSale = compareAmount > priceAmount;

          return {
            name: node.title,
            desc: node.description || "AI Personalized Pet Art",
            price: `${formatMoney(price.amount, price.currencyCode)} ${price.currencyCode}`,
            compareAtPrice: onSale
              ? formatMoney(compareAt!.amount, compareAt!.currencyCode)
              : undefined,
            discountPercent: onSale
              ? Math.round((1 - priceAmount / compareAmount) * 100)
              : undefined,
            img: node.images.edges[0]?.node.url || "/placeholder-image.jpg",
            shopifyHandle: node.handle,
            label: category,
            category,
          };
        });

        setProducts(mappedProducts);

        // Extract unique categories from products
        const uniqueCategories = [
          "All Products",
          ...Array.from(new Set(mappedProducts.map((p) => p.category))),
        ];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-clip bg-white">
      <Navbar />

      <main className="grow w-full px-4 md:px-10 py-10 md:py-16">
        <div className="container-site flex flex-col items-center">
          {/* Hero Section */}
          <div className="text-center mb-10 md:mb-14 max-w-2xl">
            <span className="text-primary font-bold tracking-widest text-xs uppercase mb-3 block">
              Handcrafted for Happiness
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-secondary mb-4 leading-tight">
              Our Soulful Collection
            </h1>
            <p className="text-secondary/70 text-lg leading-relaxed">
              Discover personalized treasures designed to celebrate the
              unconditional love of your furry companions.
            </p>
          </div>

          {/* Categories */}
          <div className="w-full flex justify-center mb-12 overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex gap-3 px-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`flex h-12 shrink-0 items-center justify-center rounded-full px-6 transition-all ${
                    activeCategory === category
                      ? "bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105"
                      : "bg-white text-secondary border border-[#E0DED9] hover:border-primary hover:text-primary"
                  }`}
                >
                  <span className="text-sm font-bold tracking-wide">
                    {category}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Product Grid */}
              {products.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-secondary/60 text-xl">
                    No products found in your Shopify store.
                  </p>
                  <p className="text-secondary/40 mt-2">
                    Add some products in your Shopify Admin to see them here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
                  {products
                    .filter(
                      (p) =>
                        activeCategory === "All Products" ||
                        p.category === activeCategory,
                    )
                    .map((product) => (
                      <ProductCard
                        key={product.shopifyHandle}
                        product={product}
                        showPrice={true}
                        showBadge={false}
                      />
                    ))}
                </div>
              )}
            </>
          )}

          {/* Load More */}
          {!loading && products.length > 0 && (
            <div className="mt-16 text-center">
              <button className="px-8 py-3 bg-transparent border-b-2 border-secondary text-secondary font-bold hover:text-primary hover:border-primary transition-colors text-sm uppercase tracking-widest">
                Load More Products
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
