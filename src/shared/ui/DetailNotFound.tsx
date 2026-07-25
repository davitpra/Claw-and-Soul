import Link from "next/link";

interface DetailNotFoundProps {
  /** Material Symbols icon name shown in the circle. */
  icon: string;
  title: string;
  message: string;
  backHref: string;
  backLabel: string;
}

/**
 * Estado "no encontrado" genérico de una página de detalle: icono en círculo +
 * título + mensaje + botón primario de vuelta. Compartido por OrderDetail y
 * GenerationDetail, que sólo difieren en el icono, los textos y el destino.
 */
export function DetailNotFound({
  icon,
  title,
  message,
  backHref,
  backLabel,
}: DetailNotFoundProps) {
  return (
    <section className="rounded-xl bg-white p-8 text-center md:p-12">
      <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-cream text-text-muted">
        <span className="material-symbols-outlined text-[32px]">{icon}</span>
      </span>
      <h1 className="mt-4 font-display text-xl font-black text-text-main">
        {title}
      </h1>
      <p className="mt-1 text-sm text-text-muted">{message}</p>
      <Link
        href={backHref}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-dark hover:shadow-md"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        {backLabel}
      </Link>
    </section>
  );
}
