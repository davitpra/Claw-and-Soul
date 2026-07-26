import type { ReactNode } from "react";
import { Container } from "@/shared/ui/Container";
import type { ProcessStep } from "../model/types";
import { StepFlow } from "./StepFlow";

const BACKGROUNDS = {
  cream: "bg-cream",
  white: "bg-white",
  /** Dentro de un `SectionFlow` el color lo pone el wrapper. */
  transparent: "",
} as const;

type AIProcessProps = {
  eyebrow: string;
  title: string;
  subtitle: ReactNode;
  steps: ProcessStep[];
  background?: keyof typeof BACKGROUNDS;
};

export default function AIProcess({
  eyebrow,
  title,
  subtitle,
  steps,
  background = "transparent",
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

        {/* ── Flujo de pasos (cliente: entra animado al scrollear) ── */}
        <StepFlow steps={steps} />
      </Container>
    </section>
  );
}
