import type { ReactNode } from "react";
import Link from "next/link";
import { Container } from "@/shared/ui/Container";
import CompareSlider from "./CompareSlider";

export interface ShowcaseFeature {
  text: string;
  /** Material Symbols name. Falls back to a checkmark when omitted. */
  icon?: string;
}

export interface ShowcaseImage {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
  width: number;
  height: number;
  alt: string;
}

export interface ShowcaseCta {
  href: string;
  label: string;
}

interface StudioShowcaseProps {
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  features?: ShowcaseFeature[];
  image?: ShowcaseImage;
  /** `null` hides the button. */
  primaryCta?: ShowcaseCta | null;
  secondaryCta?: ShowcaseCta | null;
}

const DEFAULT_FEATURES: ShowcaseFeature[] = [
  { text: "Your preview is ready in seconds" },
  { text: "Numbered color regions you can print" },
  { text: "100% free to try before you order" },
];

const DEFAULT_IMAGE: ShowcaseImage = {
  beforeSrc: "/studio/bengal-art.webp",
  afterSrc: "/studio/bengal-pbn.webp",
  width: 928,
  height: 1152,
  alt: "A Bengal cat portrait transformed into a paint-by-numbers template in the Studio",
};

export default function StudioShowcase({
  eyebrow = "Claw & Soul Studio",
  title = (
    <>
      See your pet as a<br /> paint-by-numbers — free
    </>
  ),
  description = "Upload one photo and watch the Studio transform your best friend into a numbered, hand-paintable canvas in seconds. No skills, no commitment — just try it and see.",
  features = DEFAULT_FEATURES,
  image = DEFAULT_IMAGE,
  primaryCta = {
    href: "/paint-by-numbers",
    label: "Try the Studio — it's free",
  },
  secondaryCta = { href: "/shop", label: "Browse finished pieces" },
}: StudioShowcaseProps) {
  return (
    <section className="w-full bg-cream py-20 md:py-28">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 lg:order-1 items-center flex flex-col gap-4 text-center lg:items-start lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E0DED9] bg-white px-4 py-1.5 text-primary">
              <span className="material-symbols-outlined text-[16px]">
                pets
              </span>
              <span className="text-xs font-bold tracking-wider uppercase">
                {eyebrow}
              </span>
            </span>
            <h2 className="mt-5 font-display text-4xl font-black leading-[1.1] tracking-tight text-slate-dark md:text-5xl">
              {title}
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-slate-dark/70">
              {description}
            </p>

            {/* ── Feature bullets ── */}
            <ul className="mt-8 space-y-3">
              {features.map((feature) => (
                <li
                  key={feature.text}
                  className="flex items-center gap-3 text-sm text-slate-dark/75"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {feature.icon ? (
                      <span className="material-symbols-outlined text-[18px]">
                        {feature.icon}
                      </span>
                    ) : (
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M2.5 6.2 5 8.5l4.5-5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  {feature.text}
                </li>
              ))}
            </ul>

            {(primaryCta || secondaryCta) && (
              <div className="mt-10 flex flex-wrap items-center gap-4">
                {primaryCta && (
                  <Link
                    href={primaryCta.href}
                    className="flex items-center justify-center rounded-xl bg-primary px-8 py-4 text-base font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:bg-primary-dark"
                  >
                    {primaryCta.label}
                  </Link>
                )}
                {secondaryCta && (
                  <Link
                    href={secondaryCta.href}
                    className="text-sm font-bold text-slate-dark/70 underline-offset-4 transition-colors hover:text-primary hover:underline"
                  >
                    {secondaryCta.label}
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* ── Image ── */}
          <div className="order-1 lg:order-2">
            <div className="relative mx-auto max-w-md lg:max-w-lg">
              {/* Glow */}
              <div className="absolute -inset-4 -z-10 rounded-4xl bg-primary/20 blur-2xl" />
              <div className="overflow-hidden border border-white/10 bg-white/5 shadow-2xl">
                <CompareSlider {...image} />
              </div>
              {/* Hint */}
              <div className="absolute -bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-dark shadow-lg">
                <span className="size-2 rounded-full bg-primary" />
                Drag to compare
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
