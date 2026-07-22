import Image from "next/image";
import type { ReactNode } from "react";
import { Container } from "@/shared/ui/Container";

export type ProcessStep = {
  img: string;
  alt: string;
  title: string;
  text: string;
};

const BACKGROUNDS = {
  cream: "bg-cream",
  white: "bg-white",
} as const;

type AIProcessProps = {
  eyebrow: string;
  title: string;
  subtitle: ReactNode;
  steps: ProcessStep[];
  background: keyof typeof BACKGROUNDS;
};

export default function AIProcess({
  eyebrow,
  title,
  subtitle,
  steps,
  background,
}: AIProcessProps) {
  return (
    <section className={`w-full py-20 ${BACKGROUNDS[background]}`}>
      <Container className="relative">
        {/* ── Header ── */}
        <div className="mb-14 text-center">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-primary mb-5">
            {eyebrow}
          </span>
          <h2 className="font-display text-4xl font-black text-slate-dark md:text-5xl leading-[1.1] tracking-tight">
            {title}
          </h2>
          <p className="mt-4 max-w-lg mx-auto text-base text-slate-dark/55 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* ── 3-Step Flow ── */}
        <div className="flex flex-col lg:flex-row items-stretch gap-0">
          {steps.map((step, i) => (
            <Step key={step.title} step={step} isLast={i === steps.length - 1} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function Step({ step, isLast }: { step: ProcessStep; isLast: boolean }) {
  return (
    <>
      <div className="relative flex-1">
        <div className="flex flex-col items-center gap-5 h-full">
          <div className="flex-1 flex items-center justify-center bg-white rounded-full">
            <Image src={step.img} alt={step.alt} width={200} height={150} />
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-slate-dark tracking-tight">
              {step.title}
            </p>
            <p className="mt-2 text-sm text-slate-dark/50 leading-relaxed max-w-50 mx-auto">
              {step.text}
            </p>
          </div>
        </div>
      </div>
      {!isLast && <DottedArrow />}
    </>
  );
}

function DottedArrow() {
  return (
    <div className="flex items-center justify-center py-6 lg:py-0 lg:px-2 shrink-0">
      <div className="flex items-center gap-0.5 rotate-90 lg:rotate-0">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="size-1 rounded-full bg-slate-300"
            style={{ opacity: 0.4 + i * 0.12 }}
          />
        ))}
        <div className="ml-0.5 text-slate-400">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M1 5h8M5.5 1.5L9 5l-3.5 3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
