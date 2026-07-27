"use client";

import Image from "next/image";
import { Fragment, type CSSProperties } from "react";
import { useInView } from "@/hooks/useInView";
import type { ProcessStep } from "../model/types";

// En desktop la fila es horizontal: los pasos entran en viewport a la vez, así
// que el stagger es lo que hace que el recorrido se lea de izquierda a derecha.
// En móvil cada paso se dispara por su propia intersección al hacer scroll.
const STEP_STAGGER = 0.16;
const DOTS = [0, 1, 2, 3, 4];

export function StepFlow({ steps }: { steps: ProcessStep[] }) {
  return (
    <div className="flex flex-col lg:flex-row items-stretch gap-0">
      {steps.map((step, i) => (
        <Fragment key={step.title}>
          {i > 0 && <DottedArrow />}
          <Step step={step} delay={i * STEP_STAGGER} />
        </Fragment>
      ))}
    </div>
  );
}

function Step({ step, delay }: { step: ProcessStep; delay: number }) {
  // Cada paso observa su propio nodo: aparece cuando él entra en pantalla, no
  // cuando lo hace la fila entera.
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`group relative flex-1 ${
        inView ? "animate-step-in" : "opacity-0"
      }`}
      // El delay solo se aplica en desktop (ver `--step-delay` en globals.css).
      style={{ "--step-delay": `${delay}s` } as CSSProperties}
    >
      <div className="flex flex-col items-center gap-5 h-full">
        {/* rounded-full solo da un círculo si la caja es cuadrada: aspect-square
            evita que flex-1 la estire y la convierta en elipse. */}
        <div className="w-full max-w-56 aspect-square flex items-center justify-center bg-white rounded-full">
          <Image
            src={step.img}
            alt={step.alt}
            width={200}
            height={150}
            className="w-4/5 h-auto object-contain transition-all group-hover:scale-105"
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

function DottedArrow() {
  return (
    <div className="flex items-center justify-center py-6 lg:py-0 lg:px-2 shrink-0">
      <div className="flex items-center gap-0.5 rotate-90 lg:rotate-0">
        {DOTS.map((i) => (
          <div
            key={i}
            className="size-1 rounded-full bg-slate-300"
            // Degradado de opacidad hacia la punta, para que el recorrido se lea
            // en dirección al paso siguiente.
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
