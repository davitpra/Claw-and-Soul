import { Navbar } from "@/widgets/navbar";
import { Footer } from "@/widgets/footer";
import { getCollectionProducts } from "@/lib/shopify";
import { Hero } from "@/widgets/home-hero";
import { AIPreview } from "@/widgets/ai-preview";
import { FeaturedProducts } from "@/widgets/featured-products";
import { CustomerGallery } from "@/widgets/customer-gallery";
import { Reviews } from "@/widgets/reviews";
import { NewCollection } from "@/widgets/new-collection";

export default async function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <Navbar />

      <main className="flex-1">
        <Hero />
        <NewCollection />
        <FeaturedProducts />
        <AIPreview />
        <CustomerGallery />
        <Reviews />
      </main>

      <Footer />
    </div>
  );
}
