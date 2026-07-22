import Link from "next/link";
import { Container } from "@/shared/ui/Container";
import { Card } from "@/shared/ui/Card";
import {
  DIFFICULTY_LABELS,
  StyleDifficulty,
} from "@/entities/art-style/model/difficulty";

interface LandingStyle {
  name: string;
  img: string;
  difficulty: StyleDifficulty;
  blurb: string;
}

const STYLES: LandingStyle[] = [
  {
    name: "Watercolor Portrait",
    img: "/landing/style-watercolor.webp",
    difficulty: "easy",
    blurb: "Soft, dreamy washes that capture every whisker with warmth.",
  },
  {
    name: "Classic Linocut",
    img: "/landing/style-linocut.webp",
    difficulty: "medium",
    blurb: "Bold hand-carved lines that turn your pet into timeless wall art.",
  },
  {
    name: "Royal Portrait",
    img: "/landing/style-royal.webp",
    difficulty: "challenging",
    blurb: "Regal, museum-style portraits fit for your four-legged royalty.",
  },
  {
    name: "Pop Art",
    img: "/landing/style-popart.webp",
    difficulty: "easy",
    blurb: "Playful color blocks with serious personality.",
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
            Watercolor, linocut, royal portrait and more — each with an Easy,
            Medium or Challenging paint difficulty, so there&apos;s a canvas for
            every skill level.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STYLES.map((style) => (
            <div key={style.name} className="group flex flex-col gap-3">
              <Card
                imageUrl={style.img}
                imageAlt={`The same tabby cat rendered in the ${style.name} style`}
                className="transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:shadow-md"
              >
                <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-primary px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  <span className="material-symbols-outlined text-[14px]">
                    brush
                  </span>
                  {DIFFICULTY_LABELS[style.difficulty]}
                </span>
              </Card>
              <div>
                <p className="font-bold text-slate-dark">{style.name}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-dark/55">
                  {style.blurb}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            href="/paint-by-numbers"
            className="flex items-center justify-center rounded-xl bg-primary px-8 py-4 text-base font-bold text-white shadow-lg shadow-primary/20 transition-transform hover:scale-105 hover:bg-primary-dark"
          >
            Try a Style With Your Photo
          </Link>
        </div>
      </Container>
    </section>
  );
}
