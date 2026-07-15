import { Navbar } from "@/widgets/navbar";
import { Footer } from "@/widgets/footer";
import { Hero } from "@/widgets/home-hero";
import { CollectionShowcase } from "@/widgets/collection-showcase";
import { Reviews } from "@/widgets/reviews";
import { NewCollection } from "@/widgets/collection";
import { AIProcess } from "@/widgets/ai-process";
import { HomeStyleGallery } from "@/widgets/style-gallery";

export default async function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-clip bg-background-light">
      <Navbar />

      <main className="flex-1">
        <Hero />
        <NewCollection />
        <HomeStyleGallery />
        <CollectionShowcase handle="feature-collection" />
        <AIProcess />
        <Reviews />
      </main>

      <Footer />
    </div>
  );
}
