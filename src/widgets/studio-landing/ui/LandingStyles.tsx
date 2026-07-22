import Link from "next/link";
import { Container } from "@/shared/ui/Container";
import { Carousel } from "@/shared/ui/Carousel";
import { Card } from "@/shared/ui/Card";
import { FRAME_SHADOWS } from "@/entities/product/lib/frameStyle";
import {
  DIFFICULTY_LABELS,
  StyleDifficulty,
} from "@/entities/art-style/model/difficulty";

// Mismo "poster flotando" que las cards de CollectionSection.
const posterClasses =
  "transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_22px_40px_-14px_rgba(16,54,66,0.50)]";

interface LandingStyle {
  name: string;
  img: string;
  difficulty: StyleDifficulty;
}

const STYLES: LandingStyle[] = [
  {
    name: "Signature Bloom",
    img: "/landing/style-signature-bloom.webp",
    difficulty: "easy",
  },
  {
    name: "Signature Classic",
    img: "/landing/style-signature.webp",
    difficulty: "easy",
  },
  {
    name: "Fauvist",
    img: "/landing/style-fauvist.webp",
    difficulty: "medium",
  },
  {
    name: "Pop Art",
    img: "/landing/style-pop-art.webp",
    difficulty: "medium",
  },
];

export default function LandingStyles() {
  return (
    <section id="styles" className="w-full scroll-mt-24 bg-white py-20">
      <Container>
        <div className="mb-14 text-center">
          <span className="mb-5 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
            Art styles
          </span>
          <h2 className="font-display text-4xl font-black leading-[1.1] tracking-tight text-slate-dark md:text-5xl">
            One Photo, Endless Styles
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-slate-dark/55">
            With an Easy, Medium or Challenging paint difficulty, so
            there&apos;s a canvas for every skill level.
          </p>
        </div>

        <Carousel gap="gap-8" perView={4} mobileOne>
          {STYLES.map((style) => (
            <div key={style.name} className="group flex flex-col gap-4 ">
              <Card
                imageUrl={style.img}
                imageAlt={`The same tabby cat rendered in the ${style.name} style`}
                className={`${posterClasses} ${FRAME_SHADOWS.art} aspect-2/3`}
              >
                <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  <span className="material-symbols-outlined text-[14px]">
                    brush
                  </span>
                  {DIFFICULTY_LABELS[style.difficulty]}
                </span>
              </Card>
              <div className="flex items-center justify-center gap-2">
                <p className="font-bold text-slate-dark">{style.name}</p>
              </div>
            </div>
          ))}
        </Carousel>

        <div className="mt-12 flex justify-center">
          <Link
            href="/paint-by-numbers"
            className="flex items-center justify-center rounded-xl bg-primary px-8 py-4 text-base font-bold text-white shadow-lg shadow-primary/20 transition-transform hover:scale-105 hover:bg-primary-dark"
          >
            Look for more styles
          </Link>
        </div>
      </Container>
    </section>
  );
}
