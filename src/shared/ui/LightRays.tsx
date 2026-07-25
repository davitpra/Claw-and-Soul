import type { CSSProperties } from "react";

/**
 * Semillas de los haces. Cada una desvía un rayo del reparto uniforme para que
 * el conjunto no se vea como una reja: `jitter` corre la posición, `width`
 * multiplica el ancho base y `duration`/`delay` desincronizan el shimmer.
 *
 * Los `delay` son negativos a propósito: así cada haz arranca con su ciclo ya
 * empezado y no se ve un fade-in colectivo al montar el componente.
 *
 * Las 4 primeras reproducen exactamente los rayos originales del home hero
 * (8% / 30% / 55% / 80%, anchos 96/64/112/80px a 1440px); el resto solo entra
 * en juego con `count > 4`.
 */
const RAY_SEEDS = [
  { jitter: -0.045, width: 1.33, duration: 9, delay: 0 },
  { jitter: -0.075, width: 0.89, duration: 12, delay: -3 },
  { jitter: -0.075, width: 1.56, duration: 8, delay: -6 },
  { jitter: -0.075, width: 1.11, duration: 13, delay: -1.5 },
  { jitter: 0.04, width: 1.2, duration: 10.5, delay: -4.5 },
  { jitter: -0.02, width: 0.75, duration: 14, delay: -8 },
  { jitter: 0.055, width: 1.45, duration: 8.5, delay: -2.5 },
  { jitter: -0.06, width: 1, duration: 11.5, delay: -7 },
];

/** Ancho mínimo del haz, en rem por unidad de `width`. Evita hilos invisibles en cajas chicas. */
const MIN_WIDTH_REM = 3;
/** Ancho máximo del haz, en rem por unidad de `width`. Evita manchones en pantallas anchas. */
const MAX_WIDTH_REM = 6;

interface LightRaysProps {
  /** Cantidad de haces. Se reparten a lo ancho y toman su variación de `RAY_SEEDS`. */
  count?: number;
  /**
   * Ancho base de cada haz, como % del ancho del contenedor (`cqw`). Cada haz
   * lo multiplica por su semilla, y el resultado queda acotado entre
   * `MIN_WIDTH_REM` y `MAX_WIDTH_REM` para que el efecto funcione igual en una
   * sección a pantalla completa que dentro de una card.
   */
  width?: number;
  /** Inclinación de los haces en grados. Negativo = caen hacia la izquierda. */
  angle?: number;
  /** Color del haz. Acepta cualquier color CSS; se desvanece hacia abajo. */
  color?: string;
  /** Velocidad del shimmer, como multiplicador. `1` es el default, `2` va al doble. */
  speed?: number;
  /** Intensidad global, sobre el conjunto. Se multiplica con la opacidad animada de cada haz. */
  opacity?: number;
  /** Difuminado del haz en px. Sin él se ve como una barra sólida. */
  blur?: number;
  /** Desplazamiento horizontal del shimmer en px, ida y vuelta. */
  drift?: number;
  /** Desactiva el shimmer y deja los haces quietos. */
  animated?: boolean;
  className?: string;
}

/**
 * Rayos de sol decorativos: haces diagonales que "respiran" (opacidad) y derivan
 * unos px en horizontal, cada uno a su propio ritmo.
 *
 * Se estira sobre todo su contenedor, que tiene que ser `relative
 * overflow-hidden` — el recorte es lo que hace que los haces terminen en el
 * borde de la sección. No tiene z-index: colocalo como **último hijo** para que
 * pinte sobre el contenido, o como primero (con el contenido en `relative`)
 * para que quede detrás. Es `aria-hidden` y no captura clics.
 *
 * ```tsx
 * <section className="relative overflow-hidden bg-cream">
 *   …
 *   <LightRays />
 * </section>
 *
 * // Más suave, en teal, dentro de una card
 * <div className="relative overflow-hidden rounded-xl">
 *   …
 *   <LightRays count={3} color="var(--color-primary)" opacity={0.4} speed={0.6} />
 * </div>
 * ```
 */
export default function LightRays({
  count = 4,
  width = 5,
  angle = -18,
  color = "var(--color-white)",
  speed = 1,
  opacity = 1,
  blur = 12,
  drift = 14,
  animated = true,
  className,
}: LightRaysProps) {
  // Mismo gradiente que `from-<color>/50 via-<color>/15 to-transparent`:
  // interpolamos en oklab para que el desvanecido no pase por gris.
  const gradient = `linear-gradient(to bottom in oklab, color-mix(in oklab, ${color} 50%, transparent), color-mix(in oklab, ${color} 15%, transparent), transparent)`;

  const rays = Array.from({ length: Math.max(count, 0) }, (_, i) => {
    const seed = RAY_SEEDS[i % RAY_SEEDS.length];
    // Reparto uniforme + jitter: con cualquier `count` los haces quedan
    // distribuidos, y con 4 caen sobre las posiciones originales del hero.
    const left = ((i + 0.5) / count + seed.jitter) * 100;
    const w = seed.width;

    return {
      key: i,
      left: `${left}%`,
      width: `clamp(${w * MIN_WIDTH_REM}rem, ${w * width}cqw, ${w * MAX_WIDTH_REM}rem)`,
      duration: `${seed.duration / Math.max(speed, 0.05)}s`,
      delay: `${seed.delay / Math.max(speed, 0.05)}s`,
    };
  });

  return (
    <div
      aria-hidden
      className={[
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      // `inline-size` hace que los `cqw` de los haces midan este contenedor y
      // no el viewport: es lo que permite reusar el efecto en cajas chicas.
      style={{ containerType: "inline-size", opacity }}
    >
      {rays.map((ray) => (
        <span
          key={ray.key}
          // -top/height: el haz sobresale arriba y abajo para que la rotación
          // no descubra sus extremos dentro del recorte del contenedor.
          className={`absolute -top-[20%] h-[150%] ${animated ? "light-ray" : ""}`}
          style={
            {
              left: ray.left,
              width: ray.width,
              // Sin animación no hay keyframe que fije la opacidad: usamos el
              // mismo nivel visible que `.light-ray` deja en reduced motion.
              opacity: animated ? undefined : 0.5,
              // Propiedad independiente, no `transform`: la animación mueve
              // `translate` y así no pisa esta rotación.
              rotate: `${angle}deg`,
              backgroundImage: gradient,
              filter: `blur(${blur}px)`,
              "--ray-duration": ray.duration,
              "--ray-delay": ray.delay,
              "--ray-drift": `${drift}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
