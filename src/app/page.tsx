import { Navbar } from "@/widgets/navbar";
import { Footer } from "@/widgets/footer";
import { Hero } from "@/widgets/home-hero";
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
        <CustomerGallery />
        <Reviews />
      </main>

      <Footer />
    </div>
  );
}
