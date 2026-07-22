import ExpandingGallery, {
  type ExpandingGalleryItem,
} from "@/widgets/expanding-gallery/ui/ExpandingGallery";
import { toFrameStyle } from "@/entities/product/lib/frameStyle";

// Contenido estático, pero con el mismo `template` que usa el backend: de ahí
// salen tanto el badge como la presentación de la miniatura, igual que en
// `SameStyleGallery`.
const PRODUCTS = [
  {
    template: "Poster",
    title: "Paint on Paper",
    description:
      "Heavyweight matte paper, numbered and ready for your brush. The easy, low-pressure way to start.",
    cta: "Order on paper",
    href: "/shop",
    imageUrl: "/studio/bengal-pbn.webp",
    imageAlt:
      "A numbered paint-by-numbers Bengal cat design printed on matte paper",
  },
  {
    template: "Canvas",
    title: "Paint on Canvas",
    description:
      "Real cotton canvas stretched over a wooden frame — the surface real painters use. Hang it the moment you set the brush down.",
    cta: "Order on canvas",
    href: "/shop",
    imageUrl: "/studio/bengal-pbn.webp",
    imageAlt:
      "A numbered paint-by-numbers Bengal cat design printed on a framed cotton canvas",
  },
];

const PRODUCT_ITEMS: ExpandingGalleryItem[] = PRODUCTS.map((product) => ({
  ...product,
  tags: [product.template],
  frameStyle: toFrameStyle(product.template),
}));

export default function LandingProducts() {
  return (
    <ExpandingGallery
      eyebrow="Choose your surface"
      title="Paint Them on Paper. Or on Canvas."
      description="Same design, two ways to paint it — pick the surface that fits how you like to work."
      items={PRODUCT_ITEMS}
    />
  );
}
