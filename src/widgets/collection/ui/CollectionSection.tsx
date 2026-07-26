"use client";

import Link from "next/link";
import { StyleImage } from "@/hooks/useStyleImages";
import { Container } from "@/shared/ui/Container";
import { Carousel } from "@/shared/ui/Carousel";
import { Card } from "@/shared/ui/Card";
import {
  FRAME_SHADOWS,
  type FrameStyle,
} from "@/entities/product/lib/frameStyle";
import { CanvasEdgeOverlay } from "@/entities/product/ui/CanvasEdgeOverlay";
import LightRays from "@/shared/ui/LightRays";

// Aspecto de "poster flotando": ligera elevación y sombra teñida en teal al hover.
const posterClasses =
  "transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_22px_40px_-14px_rgba(16,54,66,0.50)]";

interface StyleCardProps {
  image: StyleImage;
  badgeLabel?: string;
  altText?: boolean;
  frameStyle?: FrameStyle;
}

function StyleCard({
  image,
  badgeLabel,
  altText,
  frameStyle = "art",
}: StyleCardProps) {
  return (
    <div className="group flex flex-col gap-4">
      <Card
        imageUrl={image.imageUrl}
        imageAlt={image.altImage ?? undefined}
        naturalAspect
        className={`${posterClasses} ${FRAME_SHADOWS[frameStyle]}`}
      >
        {frameStyle === "canvas" && <CanvasEdgeOverlay />}
        {badgeLabel && (
          <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold uppercase px-2 py-1 rounded-full tracking-wider">
            {badgeLabel}
          </span>
        )}
      </Card>
      {image.altImage && altText && (
        <div className="flex items-center justify-center">
          <h3 className="font-display font-black text-slate-dark md:text-lg">
            {image.altImage}
          </h3>
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden">
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
  title?: string;
  eyebrow?: string | null;
  description?: string | null;
  ctaHref?: string;
  ctaLabel?: string;
  badgeLabel?: string;
  background?: string;
  altText?: boolean;
  frameStyle?: FrameStyle;
}

export default function CollectionSection({
  images,
  isLoading,
  error,
  title,
  eyebrow,
  description,
  ctaHref,
  ctaLabel,
  badgeLabel,
  background = "",
  altText = true,
  frameStyle = "art",
}: CollectionSectionProps) {
  if (!isLoading && (error || images.length === 0)) return null;

  return (
    <section className={`relative overflow-hidden py-20 ${background}`}>
      <Container>
        <div className="flex flex-col items-center gap-5 mb-12">
          {eyebrow && (
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E0DED9] bg-[var(--section-contrast,#fff)] px-4 py-1.5 text-primary">
              <span className="material-symbols-outlined text-[16px]">
                pets
              </span>
              <span className="text-xs font-bold tracking-wider uppercase">
                {eyebrow}
              </span>
            </span>
          )}
          <h2 className="font-display text-4xl md:text-5xl font-black text-text-main leading-[1.1] tracking-tight text-center max-w-2xl whitespace-pre-line">
            {title}
          </h2>
          {description && (
            <p className="text-center text-text-muted max-w-xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        <Carousel gap="gap-4 md:gap-8" perView={4} mobileSlides={2}>
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            : images.map((image) => (
                <StyleCard
                  key={image.id}
                  image={image}
                  badgeLabel={badgeLabel}
                  altText={altText}
                  frameStyle={frameStyle}
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
      {/* Rayos de luz decorativos; último hijo para pintar por encima de todo el contenido (imagen incluida) sin bloquear clics. */}
      <LightRays />
    </section>
  );
}
