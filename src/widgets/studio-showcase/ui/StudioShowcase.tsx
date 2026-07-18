import Link from "next/link";
import { Container } from "@/shared/ui/Container";
import CompareSlider from "./CompareSlider";

export default function StudioShowcase() {
  return (
    <section className="w-full bg-cream py-20 md:py-28">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* ── Copy ── */}
          <div className="order-2 lg:order-1 items-center flex flex-col gap-4 text-center lg:items-start lg:text-left">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#7ec6db]">
              Claw &amp; Soul Studio
            </span>
            <h2 className="mt-5 font-display text-4xl font-black leading-[1.1] tracking-tight text-slate-dark md:text-5xl">
              Turn your pet into a<br /> paint-by-numbers
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-dark">
              Upload one photo and the Studio vectorizes it into a
              hand-paintable, numbered SVG — every region mapped to a color,
              ready to print and paint. No skills required, just a clear picture
              of your best friend.
            </p>

            {/* ── Feature bullets ── */}
            <ul className="mt-8 space-y-3">
              {[
                "Instant SVG vectorization, edge to edge",
                "Numbered color regions you can print",
                "Free to try before you order",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-sm text-slate-dark/75"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#448da6]/25 text-[#7ec6db]">
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2.5 6.2 5 8.5l4.5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/paint-by-numbers"
                className="flex items-center justify-center rounded-xl bg-primary px-8 py-4 text-base font-bold text-white shadow-lg shadow-primary/20 transition-transform hover:scale-105 hover:bg-primary-dark"
              >
                Open the Studio
              </Link>
              <Link
                href="/shop"
                className="text-sm font-bold text-slate-dark/70 underline-offset-4 transition-colors hover:text-primary hover:underline"
              >
                Browse finished pieces
              </Link>
            </div>
          </div>

          {/* ── Image ── */}
          <div className="order-1 lg:order-2">
            <div className="relative mx-auto max-w-md lg:max-w-lg">
              {/* Glow */}
              <div className="absolute -inset-4 -z-10 rounded-4xl bg-[#448da6]/20 blur-2xl" />
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl">
                <CompareSlider
                  beforeSrc="/studio/bengal-art.webp"
                  afterSrc="/studio/bengal-pbn.webp"
                  width={928}
                  height={1152}
                  alt="A Bengal cat portrait transformed into a paint-by-numbers template in the Studio"
                />
              </div>
              {/* Hint */}
              <div className="absolute -bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#103642] shadow-lg">
                <span className="size-2 rounded-full bg-[#448da6]" />
                Drag to compare
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
