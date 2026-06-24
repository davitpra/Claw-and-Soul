import { ReactNode } from "react";

interface SectionHeadingProps {
  /** Nombre del icono Material Symbols mostrado en el chip teal. */
  icon: string;
  /** Título de la sección (renderizado como `<h2>` con Epilogue 900). */
  title: string;
  /** Contenido opcional a la derecha del título: contador, badge, acción. */
  trailing?: ReactNode;
}

/**
 * Encabezado de sección de Claw & Soul: chip de icono teal + título.
 * Da una jerarquía visual consistente a las secciones de una página.
 */
export default function SectionHeading({
  icon,
  title,
  trailing,
}: SectionHeadingProps) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      </span>
      <h2 className="font-display text-lg font-black text-text-main">{title}</h2>
      {trailing}
    </div>
  );
}
