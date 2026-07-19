import { Navbar } from "@/widgets/navbar";
import { Footer } from "@/widgets/footer";
import { Hero } from "@/widgets/home-hero";
import { NewCollection } from "@/widgets/collection";
import { CategoryGrid } from "@/widgets/category-grid";
import { HomeStyleGallery } from "@/widgets/style-gallery";
import { StudioShowcase } from "@/widgets/studio-showcase";
import {
  ExpandingGallery,
  ExpandingGalleryItem,
} from "@/widgets/expanding-gallery";

// Items de demostración del acordeón; reemplazar por contenido real cuando se defina.
const HOME_GALLERY_ITEMS: ExpandingGalleryItem[] = [
  {
    title: "Classic Linocut",
    description:
      "Bold hand-carved lines that turn your pet into timeless wall art.",
    cta: "Shop now",
    href: "/shop",
    imageUrl:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-dark-1.svg",
    tags: ["Canvas", "Bestseller"],
  },
  {
    title: "Watercolor Portrait",
    description: "Soft, dreamy washes that capture every whisker with warmth.",
    cta: "Shop now",
    href: "/shop",
    imageUrl:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-dark-2.svg",
    tags: ["Canvas", "New"],
  },
  {
    title: "Royal Pet",
    description:
      "Regal, museum-style portraits fit for your four-legged royalty.",
    cta: "Shop now",
    href: "/shop",
    imageUrl:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-dark-3.svg",
    tags: ["Canvas", "Limited"],
  },
];

export default async function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-clip bg-background-light">
      <Navbar />

      <main className="flex-1">
        <Hero />
        <NewCollection />
        <HomeStyleGallery />
        <ExpandingGallery
          eyebrow="Featured work"
          title="Stories on canvas"
          items={HOME_GALLERY_ITEMS}
        />
        <CategoryGrid />
        <StudioShowcase />
      </main>

      <Footer />
    </div>
  );
}
