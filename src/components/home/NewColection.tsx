"use client";

import Link from "next/link";
import { useStyleImages, StyleImage } from "@/hooks/useStyleImages";
import { Container } from "@/components/ui/Container";
import { Carousel } from "@/components/ui/Carousel";

function StyleCard({ image }: { image: StyleImage }) {
  return (
    <div className="relative overflow-hidden bg-white shadow-sm flex-[0_0_72%] sm:flex-[0_0_45%] md:flex-[0_0_33%] lg:flex-[0_0_22%] min-w-0">
      <div
        className="aspect-[4/5] w-full bg-cover bg-center"
        style={{ backgroundImage: `url('${image.imageUrl}')` }}
      />
      <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold uppercase px-2 py-1 rounded-full tracking-wider">
        Nuevo
      </span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex-[0_0_72%] sm:flex-[0_0_45%] md:flex-[0_0_33%] lg:flex-[0_0_22%] min-w-0 overflow-hidden">
      <div className="aspect-[4/5] w-full animate-pulse bg-slate-200" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-3/4 mx-auto animate-pulse bg-slate-200 rounded" />
        <div className="h-3 w-1/3 mx-auto animate-pulse bg-slate-200 rounded" />
      </div>
    </div>
  );
}

export default function NewColection() {
  const { images, isLoading, error } = useStyleImages();

  if (!isLoading && (error || images.length === 0)) return null;

  return (
    <section className="py-20 bg-white">
      <Container>
        <h2 className="text-4xl font-black text-[#103642] md:text-5xl leading-[1.1] tracking-tight text-center mb-10">
          Last Collection
        </h2>

        <Carousel gap="gap-8">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            : images.map((image) => <StyleCard key={image.id} image={image} />)}
        </Carousel>

        <div className="flex justify-center mt-10">
          <Link
            href="/ia-generator"
            className="bg-primary hover:bg-primary-dark text-white rounded-xl px-8 py-3 font-bold shadow-lg shadow-primary/20 transition-colors"
          >
            Ver colección completa
          </Link>
        </div>
      </Container>
    </section>
  );
}
