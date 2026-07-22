import { Navbar } from "@/widgets/navbar";
import { Footer } from "@/widgets/footer";
import { HomeHero } from "@/widgets/home-hero";
import { NewCollection } from "@/widgets/collection";
import { CategoryGrid } from "@/widgets/category-grid";
import { HomeStyleGallery } from "@/widgets/style-gallery";
import { StudioShowcase } from "@/widgets/studio-showcase";
import WavesDivider from "@/shared/ui/WavesDivider";

export default async function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-clip bg-background-light">
      <Navbar />

      <main className="flex-1">
        <HomeHero />
        <WavesDivider />
        <NewCollection />
        <WavesDivider flip />
        <HomeStyleGallery />
        <WavesDivider />
        <CategoryGrid />
        <WavesDivider flip />
        <StudioShowcase />
      </main>

      <Footer />
    </div>
  );
}
