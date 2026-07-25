"use client";

import { useState } from "react";
import Link from "next/link";
import { StyleImage } from "@/hooks/useStyleImages";
import { Container } from "@/shared/ui/Container";
import { Card } from "@/shared/ui/Card";
import { SetLighting } from "@/entities/product/ui/SetLighting";
import { SET_ARTWORK_SHADOW_HOVER } from "@/entities/product/lib/setLighting";

// "Poster flotando" como en CollectionSection, pero con la sombra cálida de
// SetLighting, que al levantarse crece en la dirección de la luz.
const posterClasses = `transition-all duration-300 ease-out hover:-translate-y-1.5 ${SET_ARTWORK_SHADOW_HOVER}`;

// Mínimo de slides en media vuelta del marquee para que nunca se vea un hueco.
const MIN_LOOP_ITEMS = 10;

interface StyleGalleryProps {
  images: StyleImage[];
  isLoading: boolean;
  error: string | null;
  title: string;
  eyebrow?: string | null;
  description?: string | null;
  ctaHref?: string;
  ctaLabel?: string;
  background?: string;
}

function MarqueeCard({
  image,
  onSelect,
}: {
  image: StyleImage;
  onSelect: (image: StyleImage) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(image)}
      aria-label={`Feature ${image.altImage ?? "this artwork"} in the center`}
      className="w-60 md:w-72 shrink-0 cursor-pointer opacity-60 saturate-[.85] transition-all hover:opacity-100 hover:saturate-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-primary"
    >
      <Card
        imageUrl={image.imageUrl}
        imageAlt={image.altImage ?? undefined}
        naturalAspect
        className="w-full"
      />
    </button>
  );
}

function SkeletonBand() {
  return (
    <div className="flex justify-center gap-6 overflow-hidden">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`w-60 md:w-72 shrink-0 aspect-848/1264 animate-pulse bg-slate-200 ${
            i === 2 ? "scale-110" : "opacity-60"
          }`}
        />
      ))}
    </div>
  );
}

export function StyleGallery({
  images,
  isLoading,
  error,
  title,
  eyebrow,
  description,
  ctaHref,
  ctaLabel,
  background = "bg-cream",
}: StyleGalleryProps) {
  // Imagen destacada elegida al hacer click; null = usa la primary por defecto.
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!isLoading && (error || images.length === 0)) return null;

  const fallback = images.find((image) => image.isPrimary) ?? images[0];
  const featured = images.find((image) => image.id === selectedId) ?? fallback;
  const rest = images
    .filter((image) => image.id !== featured?.id)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  // Repite las laterales hasta llenar media vuelta; el track las pinta 2×.
  const loop: StyleImage[] = [];
  while (rest.length > 0 && loop.length < MIN_LOOP_ITEMS) {
    loop.push(...rest);
  }

  return (
    <section className={`py-20 ${background}`}>
      <Container>
        <div className="flex flex-col items-center gap-5 mb-12">
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
          <h2 className="font-display text-4xl md:text-5xl font-black text-text-main leading-[1.1] tracking-tight text-center max-w-2xl whitespace-pre-line">
            {title}
          </h2>
          {description && (
            <p className="text-center text-text-muted max-w-xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </Container>

      {isLoading ? (
        <SkeletonBand />
      ) : (
        <div
          className="relative overflow-hidden h-115 md:h-145"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          }}
        >
          {loop.length > 0 && (
            <div className="absolute inset-y-0 left-0 flex w-max items-center animate-marquee">
              {/* Dos mitades idénticas (gap incluido vía pr-6) para que -50% cierre el loop exacto. */}
              <div className="flex items-center gap-6 pr-6">
                {loop.map((image, i) => (
                  <MarqueeCard
                    key={`${image.id}-a-${i}`}
                    image={image}
                    onSelect={(img) => setSelectedId(img.id)}
                  />
                ))}
              </div>
              <div aria-hidden className="flex items-center gap-6 pr-6">
                {loop.map((image, i) => (
                  <MarqueeCard
                    key={`${image.id}-b-${i}`}
                    image={image}
                    onSelect={(img) => setSelectedId(img.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {featured && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              {/* La luz va en el envoltorio para que la sombra y las capas de
                  sol/penumbra se levanten junto al póster en el hover. */}
              <SetLighting
                key={featured.id}
                className={`w-72 md:w-88 animate-fade-in-up ${posterClasses}`}
              >
                <Card
                  imageUrl={featured.imageUrl}
                  imageAlt={featured.altImage ?? undefined}
                  naturalAspect
                  className="w-full"
                />
              </SetLighting>
            </div>
          )}
        </div>
      )}

      {ctaHref && ctaLabel && (
        <Container>
          <div className="flex justify-center mt-10">
            <Link
              href={ctaHref}
              className="bg-primary hover:bg-primary-dark text-white rounded-xl px-8 py-3 font-bold shadow-lg shadow-primary/20 transition-colors"
            >
              {ctaLabel}
            </Link>
          </div>
        </Container>
      )}
    </section>
  );
}
