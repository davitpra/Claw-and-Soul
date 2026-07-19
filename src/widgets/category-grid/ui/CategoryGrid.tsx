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
}

export default async function CategoryGrid({
  title = "Shop By Category",
  description = "Discover Our Collections",
  limit = 12,
  handles,
  background = "bg-white",
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
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-8">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                // /shop filtra por título de colección, no por handle.
                href={`/shop?collection=${encodeURIComponent(category.title)}`}
                className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                <Card
                  imageUrl={category.imageUrl}
                  imageAlt={category.imageAlt ?? category.title}
                  className="transition-all duration-300 ease-out group-hover:shadow-md"
                >
                  {/* Degradado permanente que garantiza legibilidad del título;
                      se intensifica al hover sin mover nada de sitio. */}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/70 via-black/25 to-transparent transition-all duration-300 ease-out group-hover:from-black/85 group-hover:via-black/45" />
                  <h3 className="absolute inset-x-0 bottom-0 px-4 pb-4 text-center font-display font-black text-white text-lg md:text-2xl lg:text-3xl drop-shadow-sm">
                    {category.title}
                  </h3>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
