import type { CSSProperties } from "react";

/** Ancho de medio período de la onda, en unidades del viewBox. */
const SEGMENT = 88;
/** Amplitud (cresta a valle) de la onda, en unidades del viewBox. */
const AMPLITUDE = 18;
/** Dónde empieza el path. Sobra por la izquierda para que la animación no descubra el borde. */
const START_X = -160;
/** Ancho de viewBox de referencia: `waveWidth: 1` renderiza exactamente esto. */
const BASE_VIEWBOX_WIDTH = 150;
/**
 * Desplazamiento del parallax: exactamente medio período a cada lado, para que
 * el final del ciclo caiga sobre el inicio y el loop no tenga salto.
 * Debe coincidir con los `@keyframes waves-drift-*` de `globals.css`.
 */
const DRIFT = SEGMENT;
/** Duración base (capa más lenta) con `speed: 1`. */
const BASE_DURATION_S = 10;

/**
 * Construye la onda con las repeticiones justas para tapar todo el viewBox
 * incluso en los extremos del desplazamiento.
 *
 * El path es una sinusoide de segmentos alternados que se cierra hacia abajo
 * (`v44h-…z`). El primer segmento va con `c` y los demás encadenados con `s`,
 * que hereda la tangente y mantiene la curva suave en cada cruce.
 */
function buildWavePath(viewBoxWidth: number) {
  // Caso peor: la onda desplazada a la izquierda; su borde derecho tiene que
  // seguir pasando el borde derecho del viewBox.
  const needed = viewBoxWidth - START_X - 50 + DRIFT;
  // Par de segmentos, si no la onda cerraría a distinta altura de la que abrió.
  const segments = Math.max(4, Math.ceil(needed / SEGMENT / 2) * 2);

  const chained: string[] = [];
  for (let i = 1; i < segments; i++) {
    // El primer segmento (`c`) baja, así que los impares suben y los pares bajan.
    const dy = i % 2 === 1 ? AMPLITUDE : -AMPLITUDE;
    chained.push(`58 ${dy} ${SEGMENT} ${dy}`);
  }

  return (
    `M${START_X} 44` +
    `c30 0 58-${AMPLITUDE} ${SEGMENT}-${AMPLITUDE}` +
    `s${chained.join(" ")}` +
    `v44h-${segments * SEGMENT}z`
  );
}

/**
 * Capas de atrás hacia adelante. `y` desplaza la onda dentro del viewBox
 * (más alto = más abajo = más tapada por la capa sólida final).
 */
const LAYERS = [
  { y: 3, opacity: 0.35 },
  { y: 0, opacity: 0.5 },
  { y: 9, opacity: 0.7 },
  { y: 6, opacity: 1 },
] as const;

interface WavesDividerProps {
  /** Alto del divisor en px. */
  height?: number;
  /**
   * Ancho de cada onda, como multiplicador. `1` es el default; `2` hace ondas
   * el doble de anchas (más suaves), `0.5` las hace el doble de angostas
   * (más ondas a lo ancho). Ojo: ensanchar la onda también la hace parecer
   * más lenta — compensá con `speed`.
   */
  waveWidth?: number;
  /** Velocidad del parallax, como multiplicador. `1` es el default, `2` va al doble. */
  speed?: number;
  /** Invierte el divisor verticalmente: las crestas apuntan hacia arriba. */
  flip?: boolean;
  /** Desactiva el parallax y deja las ondas quietas. */
  animated?: boolean;
  /** Color de las 3 capas traslúcidas. Acepta cualquier color CSS. */
  waveColor?: string;
  /** Color de la capa sólida frontal: debe coincidir con el fondo de la sección que sigue. */
  fillColor?: string;
  className?: string;
}

/**
 * Transición ondulada entre dos secciones, con 4 capas animadas a distinta
 * velocidad para dar sensación de profundidad.
 *
 * Es un elemento de bloque normal: se coloca entre las dos secciones que separa.
 * `preserveAspectRatio="none"` hace que se estire a cualquier ancho sin recortar.
 *
 * ```tsx
 * <section className="bg-primary">…</section>
 * <WavesDivider height={50} waveWidth={1.5} speed={0.6} fillColor="var(--color-cream)" />
 * <section className="bg-cream">…</section>
 * ```
 */
export default function WavesDivider({
  height = 50,
  waveWidth = 0.5,
  speed = 0.5,
  flip = false,
  animated = true,
  waveColor = "var(--color-white)",
  fillColor = "var(--color-white)",
  className,
}: WavesDividerProps) {
  // Ondas más anchas = ver menos onda a lo ancho = viewBox más angosto.
  const viewBoxWidth = BASE_VIEWBOX_WIDTH / Math.max(waveWidth, 0.05);
  const wavePath = buildWavePath(viewBoxWidth);

  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 24 ${viewBoxWidth} 28`}
      preserveAspectRatio="none"
      style={
        {
          height,
          "--waves-duration": `${BASE_DURATION_S / Math.max(speed, 0.05)}s`,
        } as CSSProperties
      }
      className={["block w-full", flip ? "-scale-y-100" : "", className]
        .filter(Boolean)
        .join(" ")}
    >
      {LAYERS.map((layer, i) => {
        const isFront = i === LAYERS.length - 1;
        return (
          <g key={i} transform={`translate(50, ${layer.y})`}>
            <path
              d={wavePath}
              fill={isFront ? fillColor : waveColor}
              fillOpacity={layer.opacity}
              className={
                animated ? `waves-layer waves-layer-${i + 1}` : undefined
              }
            />
          </g>
        );
      })}
    </svg>
  );
}
