import ExpandingGallery, { type ExpandingGalleryItem } from "./ExpandingGallery";

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

export default function HomeExpandingGallery() {
  return (
    <ExpandingGallery
      eyebrow="Featured work"
      title="Stories on canvas"
      items={HOME_GALLERY_ITEMS}
    />
  );
}
