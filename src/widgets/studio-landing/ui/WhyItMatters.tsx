import { Container } from "@/shared/ui/Container";

const REASONS = [
  {
    icon: "favorite",
    title: "Celebrate",
    text: "Capture the goofy grin, the tilted head, the little soul that fills your home with joy every single day.",
  },
  {
    icon: "military_tech",
    title: "Honor",
    text: "A service dog's retirement, a cat's 15th birthday — some milestones deserve more than a photo in your camera roll.",
  },
  {
    icon: "all_inclusive",
    title: "Remember",
    text: "For the ones who crossed the rainbow bridge: painting their portrait, stroke by stroke, is a quiet way to say thank you. Many families tell us it helped them heal.",
  },
];

export default function WhyItMatters() {
  return (
    <section className="w-full bg-cream py-20">
      <Container>
        <div className="mb-14 text-center">
          <span className="mb-5 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
            Why it matters
          </span>
          <h2 className="font-display text-4xl font-black leading-[1.1] tracking-tight text-slate-dark md:text-5xl">
            More Than a Portrait
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-slate-dark/55">
            Every canvas starts with a story. Here&apos;s why pet parents paint
            with us.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {REASONS.map((reason) => (
            <div
              key={reason.title}
              className="flex flex-col items-center gap-4 rounded-xl border-2 border-primary bg-primary/10 px-7 py-10 text-center"
            >
              <span className="material-symbols-outlined text-[64px] leading-none text-primary-dark">
                {reason.icon}
              </span>
              <h3 className="font-display text-2xl font-black text-slate-dark">
                {reason.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-dark/70">
                {reason.text}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
