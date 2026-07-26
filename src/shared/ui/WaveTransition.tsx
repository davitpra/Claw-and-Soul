import WavesDivider from "./WavesDivider";

interface WaveTransitionProps {
  /** Color CSS de la sección de arriba. */
  from: string;
  /** Color CSS de la sección de abajo. */
  to: string;
  /** Invierte la onda: las crestas apuntan hacia arriba. Solo estético. */
  flip?: boolean;
  /** Alto del divisor en px. */
  height?: number;
  className?: string;
}

/**
 * Transición ondulada entre dos secciones de color conocido.
 *
 * `WavesDivider` solo pinta un lado (`fillColor`) y deja el otro transparente,
 * así que por sí solo depende de que el fondo de la página aporte el color que
 * falta — un contrato implícito que se rompe apenas una sección se reordena o
 * se renderiza condicionalmente. Acá ese lado lo pinta el wrapper, con lo que
 * el divisor funciona entre cualquier par de colores.
 *
 * Con `flip` la capa sólida se va arriba, así que los dos colores se
 * intercambian; encapsular ese swap es justamente lo que evita el desfase.
 */
export default function WaveTransition({
  from,
  to,
  flip = false,
  height,
  className,
}: WaveTransitionProps) {
  const fill = flip ? from : to;
  const backdrop = flip ? to : from;

  return (
    <div className={className} style={{ background: backdrop }}>
      <WavesDivider
        waveColor={fill}
        fillColor={fill}
        flip={flip}
        height={height}
      />
    </div>
  );
}
