import Link from "next/link";
import { Container } from "@/shared/ui/Container";
import { Card } from "@/shared/ui/Card";

const PRODUCTS = [
  {
    name: "Framed Canvas",
    img: "/landing/product-canvas.webp",
    alt: "A framed watercolor pet portrait hanging on a living-room wall",
    text: "Your pet's portrait, gallery-ready and printed on premium canvas.",
  },
  {
    name: "Art Poster",
    img: "/landing/product-poster.webp",
    alt: "A linocut cat art poster in a slim frame on a shelf",
    text: "Museum-quality print of any style, sized for every wall.",
  },
  {
    name: "Complete Paint Kit",
    img: "/landing/product-kit.webp",
    alt: "A paint-by-numbers kit with numbered canvas, brushes and paint pots",
    text: "Numbered canvas, brushes and paints delivered to your door.",
  },
];

export default function LandingProducts() {
  return (
    <section className="w-full bg-white py-20">
      <Container>
        <div className="mb-14 text-center">
          <span className="mb-5 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
            Keep it forever
          </span>
          <h2 className="font-display text-4xl font-black leading-[1.1] tracking-tight text-slate-dark md:text-5xl">
            Free to Paint. Beautiful to Keep.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-slate-dark/55">
            Your coloring page is free forever. When you&apos;re ready, bring it
            to life:
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {PRODUCTS.map((product) => (
            <Link
              key={product.name}
              href="/shop"
              className="group flex flex-col gap-3"
            >
              <Card
                imageUrl={product.img}
                imageAlt={product.alt}
                className="transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:shadow-md"
              />
              <div>
                <p className="font-bold text-slate-dark transition-colors group-hover:text-primary">
                  {product.name}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-dark/55">
                  {product.text}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
