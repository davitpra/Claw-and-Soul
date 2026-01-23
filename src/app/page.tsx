import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCollectionProducts } from "@/lib/shopify";
import Hero from "@/components/home/Hero";
import AIPreview from "@/components/home/AIPreview";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import CustomerGallery from "@/components/home/CustomerGallery";
import Reviews from "@/components/home/Reviews";

export default async function Home() {
  const featuredCollection = await getCollectionProducts(
    "featured-collection",
    4
  );

  const products = featuredCollection?.products?.edges || [];

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <Navbar />

      <main className="flex-1">
        <Hero />
        <AIPreview />
        <FeaturedProducts
          products={products}
          featuredCollection={featuredCollection}
        />
        <CustomerGallery />
        <Reviews />
      </main>

      <Footer />
    </div>
  );
}
