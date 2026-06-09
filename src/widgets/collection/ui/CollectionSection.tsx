"use client";

import Link from "next/link";
import { StyleImage } from "@/hooks/useStyleImages";
import { Container } from "@/shared/ui/Container";
import { Carousel } from "@/shared/ui/Carousel";
import { Card } from "@/shared/ui/Card";

const cardSizeClasses =
  "flex-[0_0_72%] sm:flex-[0_0_45%] md:flex-[0_0_33%] lg:flex-[0_0_22%] min-w-0";

// Aspecto de "poster flotando": esquinas redondeadas, sombra teñida en teal
// oscuro y una ligera elevación al pasar el cursor.
const posterClasses =
  "shadow-[0_18px_40px_-12px_rgba(16,54,66,0.45)] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_30px_55px_-12px_rgba(16,54,66,0.55)]";

interface StyleCardProps {
  image: StyleImage;
  badgeLabel?: string;
}

function StyleCard({ image, badgeLabel }: StyleCardProps) {
  return (
    <div className={cardSizeClasses}>
      <Card
        imageUrl={image.imageUrl}
        imageAlt={image.altImage ?? undefined}
        naturalAspect
        className={posterClasses}
      >
        {badgeLabel && (
          <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold uppercase px-2 py-1 tracking-wider">
            {badgeLabel}
          </span>
        )}
      </Card>
      {image.altImage && (
        <h3 className="mt-1 text-center text-lg font-bold text-[#103642]">
          {image.altImage}
        </h3>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className={`${cardSizeClasses} overflow-hidden`}>
      <div className="aspect-4/5 w-full animate-pulse bg-slate-200" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-3/4 mx-auto animate-pulse bg-slate-200 rounded" />
        <div className="h-3 w-1/3 mx-auto animate-pulse bg-slate-200 rounded" />
      </div>
    </div>
  );
}

interface CollectionSectionProps {
  images: StyleImage[];
  isLoading: boolean;
  error: string | null;
  title: string;
  ctaHref?: string;
  ctaLabel?: string;
  badgeLabel?: string;
  background?: string;
}

export default function CollectionSection({
  images,
  isLoading,
  error,
  title,
  ctaHref,
  ctaLabel,
  badgeLabel,
  background,
}: CollectionSectionProps) {
  if (!isLoading && (error || images.length === 0)) return null;

  return (
    <section className={`py-20 ${background}`}>
      <Container>
        <div className="flex flex-col gap-1">
          <span className="text-center text-primary font-bold tracking-wider uppercase text-md">
            Choose Your Style
          </span>
          <h2 className="text-4xl font-black text-[#103642] leading-[1.1] tracking-tight text-center mb-10">
            {title}
          </h2>
        </div>

        <Carousel gap="gap-8">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            : images.map((image) => (
                <StyleCard
                  key={image.id}
                  image={image}
                  badgeLabel={badgeLabel}
                />
              ))}
        </Carousel>

        {ctaHref && ctaLabel && (
          <div className="flex justify-center mt-10">
            <Link
              href={ctaHref}
              className="bg-primary hover:bg-primary-dark text-white rounded-xl px-8 py-3 font-bold shadow-lg shadow-primary/20 transition-colors"
            >
              {ctaLabel}
            </Link>
          </div>
        )}
      </Container>
    </section>
  );
}
