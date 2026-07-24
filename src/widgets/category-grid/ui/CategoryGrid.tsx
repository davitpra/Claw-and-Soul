import Link from "next/link";
import { Container } from "@/shared/ui/Container";
import { Card } from "@/shared/ui/Card";
import { getCollectionsWithImage } from "@/lib/shopify/actions/collections";

interface CategoryGridProps {
  title?: string;
  description?: string;
  /** Máximo de categorías a mostrar. */
  limit?: number;
  /**
   * Handles a incluir y en qué orden. Si se omite, se usan las primeras
   * `limit` colecciones que devuelva Shopify.
   */
  handles?: string[];
  background?: string;
  eyebrow?: string;
  /** Texto del CTA que lleva al catálogo completo. */
  ctaLabel?: string;
  ctaHref?: string;
}

export default async function CategoryGrid({
  title = "Find your pet's perfect style",
  description = "From classic portraits to playful pop art — pick a style and turn your pet's photo into a masterpiece you paint yourself.",
  limit = 8,
  handles,
  background = "bg-white",
  eyebrow = "Catalog",
  ctaLabel = "View all styles",
  ctaHref = "/catalog",
}: CategoryGridProps) {
  const collections = await getCollectionsWithImage(handles ? 250 : limit);

  const categories = handles
    ? handles
        .map((handle) => collections.find((c) => c.handle === handle))
        .filter((c) => c !== undefined)
    : collections.slice(0, limit);

  if (categories.length === 0) return null;

  return (
    <section className={`py-20 ${background}`}>
      <Container>
        <div className="flex flex-col items-center gap-3 mb-12">
          {eyebrow && (
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E0DED9] bg-white px-4 py-1.5 text-primary">
              <span className="material-symbols-outlined text-[16px]">
                pets
              </span>
              <span className="text-xs font-bold tracking-wider uppercase">
                {eyebrow}
              </span>
            </span>
          )}
          <h2 className="font-display text-4xl md:text-5xl font-black text-text-main leading-[1.1] tracking-tight text-center">
            {title}
          </h2>
          {description && (
            <p className="text-center text-text-muted max-w-xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* gap-8 en lg para que el ancho de card coincida con el del Carousel
            de CollectionSection, que asume ese mismo gap. */}
        {/* Muro de arte: al hacer hover sobre una card las hermanas se atenúan
            (group/wall) y la activa se ilumina, como un foco de galería. */}
        <ul className="group/wall grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-8">
          {categories.map((category) => (
            <li
              key={category.id}
              className="transition-all duration-300 ease-out group-hover/wall:not-hover:opacity-55 group-hover/wall:not-hover:saturate-50"
            >
              <Link
                // /shop pide la colección a Shopify por handle.
                href={`/catalog?collection=${encodeURIComponent(category.handle)}`}
                className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                <Card
                  imageUrl={category.imageUrl}
                  imageAlt={category.imageAlt ?? category.title}
                  className="transition-all duration-300 ease-out group-hover:shadow-md group-hover:brightness-[1.08]"
                >
                  {/* En reposo la obra se ve limpia; el degradado y el título
                      aparecen al iluminarla. En touch (sin hover) quedan
                      siempre visibles para no perder el nombre. */}
                  <div className="absolute inset-0 transition-opacity duration-300 ease-out pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:group-focus-visible:opacity-100">
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
                    <h3 className="absolute inset-x-0 bottom-0 px-4 pb-4 text-center font-display font-black text-white text-lg md:text-2xl lg:text-3xl drop-shadow-sm">
                      {category.title}
                    </h3>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex justify-center">
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-bold text-white transition-all hover:bg-primary-dark hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            {ctaLabel}
            <span className="material-symbols-outlined text-[20px]">
              arrow_forward
            </span>
          </Link>
        </div>
      </Container>
    </section>
  );
}
