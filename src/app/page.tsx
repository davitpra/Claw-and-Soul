import { Navbar } from "@/widgets/navbar";
import { Footer } from "@/widgets/footer";
import { Hero } from "@/widgets/home-hero";
import { CollectionShowcase } from "@/widgets/collection-showcase";
import { CustomerGallery } from "@/widgets/customer-gallery";
import { Reviews } from "@/widgets/reviews";
import { NewCollection } from "@/widgets/collection";
import { AIProcess } from "@/widgets/ai-process";

export default async function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light">
      <Navbar />

      <main className="flex-1">
        <Hero />
        <NewCollection />
        <CollectionShowcase handle="feature-collection" />
        <AIProcess />
        <CustomerGallery />
        <Reviews />
      </main>

      <Footer />
    </div>
  );
}
