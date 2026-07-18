"use client";

import { CSSProperties, useState } from "react";
import Link from "next/link";
import { Container } from "@/shared/ui/Container";

export interface ExpandingGalleryItem {
  title: string;
  /** Texto secundario bajo el título en el panel abierto. */
  description?: string;
  /** Etiqueta del botón CTA; si se omite el botón no se renderiza. */
  cta?: string;
  /** Destino del link; toda la card es clickeable. */
  href: string;
  imageUrl: string;
  imageAlt?: string;
  /** Wordmark opcional; se fuerza a blanco sobre el panel oscuro. */
  logoUrl?: string;
  logoAlt?: string;
  /** Badges superiores de la card. */
  tags?: string[];
}

interface ExpandingGalleryProps {
  /** Diseñado para 3 items (60/20/20); soporta n repartiendo el 40% restante. */
  items: ExpandingGalleryItem[];
  eyebrow?: string;
  title?: string;
  description?: string;
  background?: string;
}

/**
 * Galería "acordeón horizontal": en desktop el panel activo se expande al 60%
 * y el resto colapsa con blur; hover/focus cambian el activo. El JS solo fija
 * `data-state`; la animación es CSS puro vía variantes `data-[state]`.
 * En tablet los paneles se apilan a lo ancho y en móvil quedan como cards
 * compactas sin imagen.
 */
export default function ExpandingGallery({
  items,
  eyebrow,
  title,
  description,
  background = "bg-white",
}: ExpandingGalleryProps) {
  // Índice del panel expandido; el último hovereado queda abierto (no se resetea).
  const [active, setActive] = useState(0);

  if (items.length === 0) return null;

  // Anchos del acordeón como CSS vars para no depender de exactamente 3 items.
  const widths = {
    "--open-w": "60%",
    "--closed-w": `${(40 / Math.max(items.length - 1, 1)).toFixed(4)}%`,
  } as CSSProperties;

  const hasHeader = Boolean(eyebrow || title || description);

  return (
    <section className={`py-20 ${background}`}>
      <Container>
        {hasHeader && (
          <div className="flex flex-col items-center gap-5 mb-12">
            {eyebrow && (
              <span className="inline-flex items-center gap-2 rounded-full border border-cream bg-white px-4 py-1.5 text-primary">
                <span className="material-symbols-outlined text-[16px]">
                  pets
                </span>
                <span className="text-xs font-bold tracking-wider uppercase">
                  {eyebrow}
                </span>
              </span>
            )}
            {title && (
              <h2 className="font-display text-4xl md:text-5xl font-black text-text-main leading-[1.1] tracking-tight text-center max-w-2xl whitespace-pre-line">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-center text-text-muted max-w-xl leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}

        <div
          className="flex flex-col gap-5 lg:aspect-1336/420 lg:flex-row"
          style={widths}
        >
          {items.map((item, i) => (
            <div
              key={`${item.href}-${i}`}
              data-state={i === active ? "open" : "closed"}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              className="group max-lg:w-full max-lg:flex-1 max-md:h-50 md:max-lg:aspect-1336/420 lg:transform-gpu lg:transition-all motion-reduce:transition-none lg:data-[state=closed]:w-(--closed-w) lg:data-[state=closed]:duration-500 lg:data-[state=open]:w-(--open-w) lg:data-[state=open]:duration-400"
            >
              <Link
                href={item.href}
                className="relative block h-full w-full overflow-hidden rounded-xl bg-cream text-slate-dark"
              >
                {/* Lienzo 2× centrado en la card: su alto (constante) dimensiona la
                    imagen, así el ancho animado solo revela/oculta sin reescalar. */}
                <div className="absolute -inset-[50%] hidden h-[200%] w-[200%] md:block lg:group-data-[state=closed]:blur-sm">
                  <div className="absolute top-[calc(25%+40px)] right-[calc(50%+40px)] aspect-square h-[calc(50%+40px)]">
                    <div className="h-full w-full overflow-clip rounded-xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt={item.imageAlt ?? item.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover object-top-left"
                      />
                    </div>
                  </div>
                  {item.logoUrl && (
                    <div className="absolute inset-y-[25%] left-[50%] flex aspect-389/420 h-[50%] items-center justify-center max-lg:hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.logoUrl}
                        alt={item.logoAlt ?? ""}
                        loading="lazy"
                        decoding="async"
                        className="h-8 brightness-0 invert"
                      />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 hidden h-[50%] bg-linear-to-t from-slate-dark from-50% to-transparent lg:group-data-[state=closed]:block" />
                </div>

                {/* Capa de contenido; en cerrado los textos se desvanecen con delay
                    para entrar después de que el panel termina de expandirse. */}
                <div className="relative flex flex-col justify-between gap-4 md:absolute md:inset-0 md:inset-x-[50%] md:w-[50%]">
                  <div className="flex h-20 items-center gap-2 p-4 transition-opacity delay-200 duration-500 motion-reduce:transition-none lg:group-data-[state=closed]:opacity-0">
                    {item.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider whitespace-nowrap"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2 p-4 transition-all delay-250 duration-500 motion-reduce:transition-none lg:group-data-[state=closed]:translate-y-4 lg:group-data-[state=closed]:opacity-0">
                    {item.logoUrl && (
                      <div className="lg:hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.logoUrl}
                          alt={item.logoAlt ?? ""}
                          loading="lazy"
                          decoding="async"
                          className="h-5 brightness-0 invert"
                        />
                      </div>
                    )}
                    <h3 className="font-display text-xl font-black leading-tight text-slate-dark lg:text-2xl">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm leading-relaxed text-slate-dark line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-between gap-2">
                      {item.cta ? (
                        <span className="rounded-xl bg-primary px-4 py-2 font-display text-sm font-black whitespace-nowrap text-white transition-colors group-hover:bg-primary-dark lg:text-base">
                          {item.cta}
                        </span>
                      ) : (
                        <span aria-hidden />
                      )}
                      <div className="flex size-8 items-center justify-center rounded-full bg-cream text-slate-dark transition-transform motion-reduce:transition-none group-hover:translate-x-1 group-hover:-translate-y-1 lg:size-10">
                        <span className="material-symbols-outlined text-[20px]">
                          arrow_outward
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
