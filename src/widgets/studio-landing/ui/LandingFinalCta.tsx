import Link from "next/link";
import { Container } from "@/shared/ui/Container";

export default function LandingFinalCta() {
  return (
    <section className="w-full bg-primary py-20">
      <Container>
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 text-center">
          <h2 className="font-display text-3xl font-black leading-[1.15] tracking-tight text-white md:text-5xl">
            They Give Us Their Whole Lives. Give Them a Masterpiece.
          </h2>
          <Link
            href="/paint-by-numbers"
            className="flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-primary shadow-lg transition-transform hover:scale-105 hover:bg-cream"
          >
            <span className="material-symbols-outlined text-[20px]">
              upload
            </span>
            Start With a Photo — It&apos;s Free
          </Link>
          <p className="text-sm font-medium text-white/70">
            No account needed · Free PDF download · Canvas, poster &amp; kits
            available
          </p>
        </div>
      </Container>
    </section>
  );
}
