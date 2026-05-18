"use client";

import Link from "next/link";
import { StyleImage } from "@/hooks/useStyleImages";
import { Container } from "@/shared/ui/Container";
import { Carousel } from "@/shared/ui/Carousel";

interface StyleCardProps {
  image: StyleImage;
  badgeLabel?: string;
}

function StyleCard({ image, badgeLabel }: StyleCardProps) {
  return (
    <div className="relative overflow-hidden bg-white shadow-sm flex-[0_0_72%] sm:flex-[0_0_45%] md:flex-[0_0_33%] lg:flex-[0_0_22%] min-w-0">
      <div
        className="aspect-4/5 w-full bg-cover bg-center"
        style={{ backgroundImage: `url('${image.imageUrl}')` }}
      />
      {badgeLabel && (
        <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold uppercase px-2 py-1 rounded-full tracking-wider">
          {badgeLabel}
        </span>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex-[0_0_72%] sm:flex-[0_0_45%] md:flex-[0_0_33%] lg:flex-[0_0_22%] min-w-0 overflow-hidden">
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
  ctaHref: string;
  ctaLabel: string;
  badgeLabel?: string;
}

export default function CollectionSection({
  images,
  isLoading,
  error,
  title,
  ctaHref,
  ctaLabel,
  badgeLabel,
}: CollectionSectionProps) {
  if (!isLoading && (error || images.length === 0)) return null;

  return (
    <section className="py-20 bg-white">
      <Container>
        <h2 className="text-4xl font-black text-[#103642] md:text-5xl leading-[1.1] tracking-tight text-center mb-10">
          {title}
        </h2>

        <Carousel gap="gap-8">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            : images.map((image) => (
                <StyleCard key={image.id} image={image} badgeLabel={badgeLabel} />
              ))}
        </Carousel>

        <div className="flex justify-center mt-10">
          <Link
            href={ctaHref}
            className="bg-primary hover:bg-primary-dark text-white rounded-xl px-8 py-3 font-bold shadow-lg shadow-primary/20 transition-colors"
          >
            {ctaLabel}
          </Link>
        </div>
      </Container>
    </section>
  );
}
