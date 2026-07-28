"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/shared/ui/Container";
import { CanvasEdgeOverlay } from "@/entities/product/ui/CanvasEdgeOverlay";
import { SetLighting } from "@/entities/product/ui/SetLighting";
import { setArtworkFilter } from "@/entities/product/lib/setLighting";
import { toFrameStyle, POSTER_FRAME } from "@/entities/product/lib/frameStyle";
import { templateLabel } from "@/entities/product/lib/template";
import type { ArtKind } from "@/entities/product/model/artKind";
import type { Product } from "@/entities/pet-product/model/types";
import { ALTERNATIVE_COPY } from "../model/alternativeCopy";

interface ArtKindAlternativeProps {
  /** Productos del mismo estilo con el tipo de obra contrario, ya filtrados y ordenados. */
  options: Product[];
  /** Tipo de obra que ofrece la sección: decide copy, escena y CTA. */
  target: ArtKind;
}

/**
 * Sección de cierre que ofrece la misma obra en el *otro* tipo de contenido: el
 * arte terminado a quien está viendo un coloreable, y el coloreable a quien está
 * viendo arte terminado. El copy y la escena de cada dirección viven en
 * `model/alternativeCopy.ts`.
 *
 * Cuando el estilo tiene la obra en varios formatos, las pills los ofrecen todos:
 * elegir uno cambia la obra colgada en el set —y el marco con que se presenta—,
 * el precio y el destino del CTA.
 * El padre decide si la sección aparece (`useArtKindAlternative`), así que acá
 * `options` siempre trae al menos un producto.
 */
export default function ArtKindAlternative({
  options,
  target,
}: ArtKindAlternativeProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const copy = ALTERNATIVE_COPY[target];

  // El índice puede quedar fuera de rango si las opciones se recargan (cambio de
  // producto sin desmontar la sección); el primero es siempre seguro.
  const selected = options[selectedIndex] ?? options[0];
  if (!selected) return null;

  // La obra se presenta como el formato elegido en las pills: lienzo con cantos
  // para Canvas, margen de papel para Poster, plana para Digital.
  const frameStyle = toFrameStyle(selected.template);

  return (
    <section>
      <Container className="flex flex-col items-center gap-8 py-16 md:flex-row md:gap-16 md:py-0">
        <div className="flex w-full flex-col gap-4 md:w-1/2">
          <h2 className="font-display text-4xl font-black text-[#103642] leading-[1.1] tracking-tight mb-2 lg:mb-8">
            {copy.title}
          </h2>
          <p className="font-body text-text-main">{copy.body}</p>
          <div className="my-4 grid grid-cols-3 gap-4">
            {copy.perks.map(({ icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 text-center"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-[24px]">
                    {icon}
                  </span>
                </span>
                <span className="text-sm font-medium text-[#103642]">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Con una sola opción no hay nada que elegir: una pill suelta se lee
              como un botón muerto, así que solo queda el CTA. */}
          {options.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {options.map((option, index) => {
                const isSelected = option === selected;
                return (
                  <button
                    key={option.shopifyHandle}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedIndex(index)}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                      isSelected
                        ? "bg-primary text-white"
                        : "border border-[#E0DED9] bg-white text-text-main hover:border-primary hover:text-primary"
                    }`}
                  >
                    {templateLabel(option.template)}
                  </button>
                );
              })}
            </div>
          )}

          <Link
            href={`/product/${selected.shopifyHandle}`}
            className="flex w-fit items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-sm transition-all hover:bg-primary-dark hover:shadow-md"
          >
            {selected.price && <span>{selected.price} ·</span>}
            {copy.cta}
            <span className="material-symbols-outlined text-[20px]">
              arrow_forward
            </span>
          </Link>
        </div>
        {/* El mask vive en el wrapper (no en el <Image>) para que el fundido
            del borde derecho también afecte a la obra colgada encima. */}
        <div
          className="relative w-full overflow-hidden md:w-2/5"
          style={{
            maskImage: "linear-gradient(to left, transparent, black 15%)",
            WebkitMaskImage: "linear-gradient(to left, transparent, black 15%)",
          }}
        >
          <Image
            src={copy.setImage}
            alt={copy.setImageAlt}
            width={copy.setImageSize.width}
            height={copy.setImageSize.height}
            sizes="(max-width: 768px) 100vw, 600px"
            className="h-auto w-full"
          />
          {/* Obra colgada en la pared vacía del set, con el marco de su formato.
              El mat del póster va en el wrapper —ya acotado por el ancho del
              `artworkClassName`—, así que la obra encoge sin crecer en la escena. */}
          <div className={`absolute ${copy.artworkClassName}`}>
            <SetLighting className={frameStyle === "poster" ? POSTER_FRAME : ""}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selected.img}
                alt={selected.name}
                loading="lazy"
                decoding="async"
                className="block h-auto w-full"
                style={setArtworkFilter}
              />
              {frameStyle === "canvas" && <CanvasEdgeOverlay />}
            </SetLighting>
          </div>
        </div>
      </Container>
    </section>
  );
}
