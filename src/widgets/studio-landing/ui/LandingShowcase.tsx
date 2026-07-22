import { Container } from "@/shared/ui/Container";
import CompareSlider from "@/widgets/studio-showcase/ui/CompareSlider";

const PROOF_POINTS = [
  { icon: "gesture", text: "AI-traced from your exact photo" },
  { icon: "palette", text: "Numbered colors matched to real paint" },
  { icon: "print", text: "Ready to print at home" },
];

export default function LandingShowcase() {
  return (
    <section className="w-full bg-cream py-20 md:py-28">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 flex flex-col items-center gap-4 text-center lg:order-1 lg:items-start lg:text-left">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              Before &amp; After
            </span>
            <h2 className="mt-5 font-display text-4xl font-black leading-[1.1] tracking-tight text-slate-dark md:text-5xl">
              See the Magic for Yourself
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-slate-dark/70">
              Drag the slider to watch a real photo become a numbered canvas —
              every whisker traced, every color mapped, ready for your brush.
            </p>
            <ul className="mt-8 space-y-3">
              {PROOF_POINTS.map((point) => (
                <li
                  key={point.text}
                  className="flex items-center gap-3 text-sm text-slate-dark/75"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <span className="material-symbols-outlined text-[18px]">
                      {point.icon}
                    </span>
                  </span>
                  {point.text}
                </li>
              ))}
            </ul>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative mx-auto max-w-md lg:max-w-lg">
              <div className="absolute -inset-4 -z-10 rounded-4xl bg-primary/20 blur-2xl" />
              <div className="overflow-hidden rounded-xl bg-white shadow-2xl">
                <CompareSlider
                  beforeSrc="/landing/before-photo.webp"
                  afterSrc="/landing/after-pbn.webp"
                  beforeLabel="Their Photo"
                  afterLabel="Your Canvas"
                  width={900}
                  height={1200}
                  alt="A golden retriever photo transformed into a numbered paint-by-numbers canvas"
                />
              </div>
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
