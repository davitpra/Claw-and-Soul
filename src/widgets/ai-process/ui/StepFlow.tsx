"use client";

import Image from "next/image";
import { Fragment } from "react";
import { useInView } from "@/hooks/useInView";
import type { ProcessStep } from "../model/types";

// Cada paso entra 0.16s después del anterior y la flecha que lo precede cae a
// mitad de camino, así el recorrido se lee de izquierda a derecha (arriba→abajo
// en móvil) en vez de aparecer todo de golpe.
const STEP_STAGGER = 0.16;
// Los puntos empiezan a latir cuando la flecha ya terminó de entrar.
const FLOW_START = 0.35;
const DOT_STAGGER = 0.1;
const DOTS = [0, 1, 2, 3, 4];

export function StepFlow({ steps }: { steps: ProcessStep[] }) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className="flex flex-col lg:flex-row items-stretch gap-0"
    >
      {steps.map((step, i) => (
        <Fragment key={step.title}>
          {i > 0 && (
            <DottedArrow
              delay={i * STEP_STAGGER - STEP_STAGGER / 2}
              revealed={inView}
            />
          )}
          <Step step={step} delay={i * STEP_STAGGER} revealed={inView} />
        </Fragment>
      ))}
    </div>
  );
}

function Step({
  step,
  delay,
  revealed,
}: {
  step: ProcessStep;
  delay: number;
  revealed: boolean;
}) {
  return (
    <div
      className={`group relative flex-1 ${
        revealed ? "animate-step-in" : "opacity-0"
      }`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex flex-col items-center gap-5 h-full">
        <div className="flex-1 flex items-center justify-center bg-[var(--section-contrast,#fff)] rounded-full">
          <Image
            src={step.img}
            alt={step.alt}
            width={200}
            height={150}
            className="transition-all group-hover:scale-105"
          />
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
  );
}

function DottedArrow({
  delay,
  revealed,
}: {
  delay: number;
  revealed: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-center py-6 lg:py-0 lg:px-2 shrink-0 ${
        revealed ? "animate-arrow-in" : "opacity-0"
      }`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-center gap-0.5 rotate-90 lg:rotate-0">
        {DOTS.map((i) => (
          <div
            key={i}
            className={`size-1 rounded-full bg-slate-300 ${
              revealed ? "animate-flow-dot" : ""
            }`}
            // La opacidad inline es el estado en reposo (y el único visible con
            // reduced motion); la animación la pisa mientras corre.
            style={{
              opacity: 0.4 + i * 0.12,
              animationDelay: `${delay + FLOW_START + i * DOT_STAGGER}s`,
            }}
          />
        ))}
        <div
          className={`ml-0.5 text-slate-400 ${
            revealed ? "animate-flow-tip" : ""
          }`}
          style={{
            animationDelay: `${
              delay + FLOW_START + DOTS.length * DOT_STAGGER
            }s`,
          }}
        >
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
