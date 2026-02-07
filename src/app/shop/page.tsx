"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getProducts, ShopifyProduct } from "@/lib/shopify";

interface Product {
  id: string | number;
  name: string;
  handle: string;
  style: string;
  price: string;
  image: string;
  bestseller?: boolean;
  new?: boolean;
  category: string;
}

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState("All Products");
  const [products, setProducts] = useState<Product[]>([]);
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
          const currencySymbol =
            price.currencyCode === "USD" ? "$" : price.currencyCode;

          return {
            id: node.id,
            name: node.title,
            handle: node.handle,
            style: node.description || "AI Personalized Pet Art",
            price: `${currencySymbol}${parseFloat(price.amount).toFixed(2)}`,
            image: node.images.edges[0]?.node.url || "/placeholder-image.jpg",
            category: node.collections?.edges?.[0]?.node.title || "Other",
            bestseller: false,
            new: false,
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
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-cream">
      <Navbar />

      <main className="flex-grow w-full px-4 md:px-10 py-10 md:py-16">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                  {products
                    .filter(
                      (p) =>
                        activeCategory === "All Products" ||
                        p.category === activeCategory,
                    )
                    .map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.handle}`}
                        className="group flex flex-col bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                      >
                        <div className="relative w-full aspect-[4/3] overflow-hidden">
                          <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                            style={{
                              backgroundImage: `url('${product.image}')`,
                            }}
                          ></div>
                          <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full text-secondary hover:text-red-500 transition-colors shadow-sm z-10">
                            <span className="material-symbols-outlined text-[20px] fill-current">
                              favorite
                            </span>
                          </button>
                          {product.bestseller && (
                            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-secondary uppercase tracking-wider shadow-sm z-10">
                              Bestseller
                            </div>
                          )}
                          {product.new && (
                            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-secondary uppercase tracking-wider shadow-sm z-10">
                              New
                            </div>
                          )}
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                          <div className="mb-4">
                            <h3 className="font-display text-xl font-bold text-secondary mb-1">
                              {product.name}
                            </h3>
                            <p className="text-secondary/70 text-sm line-clamp-2">
                              {product.style}
                            </p>
                          </div>
                          <div className="mt-auto flex items-center justify-between pt-4 border-t border-secondary/5">
                            <span className="font-bold text-lg text-secondary">
                              {product.price}
                            </span>
                            <div className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-dark transition-colors shadow-md">
                              Personalize with AI
                            </div>
                          </div>
                        </div>
                      </Link>
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
