"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { StyleImage } from "@/hooks/useStyleImages";
import { Container } from "@/shared/ui/Container";
import { Carousel } from "@/shared/ui/Carousel";
import { Card } from "@/shared/ui/Card";

// Aspecto de "poster flotando": ligera elevación y sombra teñida en teal al hover.
const posterClasses =
  "transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_22px_40px_-14px_rgba(16,54,66,0.50)]";

/** Datos mínimos que necesita cada card; `StyleImage` los cumple. */
export type CollectionCardImage = Pick<
  StyleImage,
  "id" | "imageUrl" | "altImage"
>;

interface StyleCardProps {
  image: CollectionCardImage;
  badgeLabel?: string;
  altText?: boolean;
  href?: string;
  footer?: ReactNode;
}

function StyleCard({ image, badgeLabel, altText, href, footer }: StyleCardProps) {
  const content = (
    <>
      <Card
        imageUrl={image.imageUrl}
        imageAlt={image.altImage ?? undefined}
        naturalAspect
        className={posterClasses}
      >
        {badgeLabel && (
          <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold uppercase px-2 py-1 rounded-full tracking-wider">
            {badgeLabel}
          </span>
        )}
      </Card>
      {footer ??
        (image.altImage && altText && (
          <div className="flex items-center justify-center">
            <h3 className="font-display font-black text-slate-dark md:text-lg">
              {image.altImage}
            </h3>
          </div>
        ))}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="group flex flex-col gap-4">
        {content}
      </Link>
    );
  }

  return <div className="group flex flex-col gap-4">{content}</div>;
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
  images: CollectionCardImage[];
  isLoading: boolean;
  error: string | null;
  title: string;
  eyebrow?: string | null;
  description?: string | null;
  ctaHref?: string;
  ctaLabel?: string;
  badgeLabel?: string;
  background?: string;
  altText?: boolean;
  /** Si se define, cada card enlaza a la URL devuelta. */
  getHref?: (image: CollectionCardImage) => string | undefined;
  /** Footer custom bajo cada card; reemplaza el caption centrado por defecto. */
  renderFooter?: (image: CollectionCardImage) => ReactNode;
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
  background,
  altText = true,
  getHref,
  renderFooter,
}: CollectionSectionProps) {
  if (!isLoading && (error || images.length === 0)) return null;

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

        <Carousel gap="gap-8" perView={4} mobileOne>
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            : images.map((image) => (
                <StyleCard
                  key={image.id}
                  image={image}
                  badgeLabel={badgeLabel}
                  altText={altText}
                  href={getHref?.(image)}
                  footer={renderFooter?.(image)}
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
