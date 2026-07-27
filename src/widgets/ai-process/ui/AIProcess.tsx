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
        <div className="flex flex-col items-center gap-5 mb-12 mx-8 text-center">
          {eyebrow && (
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E0DED9] bg-white px-4 py-1.5 text-primary">
              <span className="material-symbols-outlined text-[16px]">
                pets
              </span>
              <span className="text-xs font-bold tracking-wider uppercase">
                {eyebrow}
              </span>
            </span>
          )}
          <h2 className="font-display text-4xl font-black text-slate-dark md:text-5xl leading-[1.1] tracking-tight">
            {title}
          </h2>
          <p className="text-base text-slate-dark/55 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* ── Flujo de pasos (cliente: entra animado al scrollear) ── */}
        <StepFlow steps={steps} />
      </Container>
    </section>
  );
}
