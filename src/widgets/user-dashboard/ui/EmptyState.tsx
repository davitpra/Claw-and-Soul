import Link from "next/link";

interface Props {
  icon: string;
  title: string;
  description: string;
  cta?: { href: string; icon: string; label: string };
  // Dentro de una sección del dashboard el título de la sección ya es el h2.
  headingLevel?: "h2" | "h3";
}

// Estado vacío compartido de las listas del área de usuario: icono en círculo,
// título, descripción y CTA opcional.
export function EmptyState({
  icon,
  title,
  description,
  cta,
  headingLevel = "h2",
}: Props) {
  const Heading = headingLevel;

  return (
    <div className="px-4 py-8 text-center">
      <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-cream text-text-muted">
        <span className="material-symbols-outlined text-[32px]">{icon}</span>
      </span>
      <Heading className="mt-4 font-display text-xl font-black text-text-main">
        {title}
      </Heading>
      <p className="mt-1 text-sm text-text-muted">{description}</p>
      {cta && (
        <Link
          href={cta.href}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-dark hover:shadow-md"
        >
          <span className="material-symbols-outlined text-[18px]">
            {cta.icon}
          </span>
          {cta.label}
        </Link>
      )}
    </div>
  );
}
