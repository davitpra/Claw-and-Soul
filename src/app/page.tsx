import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCollectionProducts } from "@/lib/shopify";
import Hero from "@/components/home/Hero";
import AIPreview from "@/components/home/AIPreview";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import CustomerGallery from "@/components/home/CustomerGallery";
import Reviews from "@/components/home/Reviews";
import NewColection from "@/components/home/NewColection";

export default async function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <Navbar />

      <main className="flex-1">
        <Hero />
        <NewColection />
        <FeaturedProducts />
        <AIPreview />
        <CustomerGallery />
        <Reviews />
      </main>

      <Footer />
    </div>
  );
}
