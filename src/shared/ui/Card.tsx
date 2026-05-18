import { ReactNode } from "react";

interface CardProps {
  /** URL de la imagen que ocupa la card (relación 4/5). */
  imageUrl: string;
  /** Texto alternativo de la imagen para accesibilidad. */
  imageAlt?: string;
  /** Clases extra del contenedor (tamaño en carruseles, ring de selección, etc.). */
  className?: string;
  /** Contenido superpuesto sobre la imagen: badges, etiquetas, overlays. */
  children?: ReactNode;
}

/**
 * Card visual base de Claw & Soul: contenedor plano con imagen en relación 4/5.
 * Las superposiciones (badges, etiquetas, gradientes) se pasan como `children`
 * y se posicionan con `absolute` respecto a este contenedor.
 */
export function Card({ imageUrl, imageAlt, className = "", children }: CardProps) {
  return (
    <div className={`relative overflow-hidden bg-white shadow-sm ${className}`}>
      <div
        className="aspect-4/5 w-full bg-cover bg-center"
        style={{ backgroundImage: `url('${imageUrl}')` }}
        role={imageAlt ? "img" : undefined}
        aria-label={imageAlt || undefined}
      />
      {children}
    </div>
  );
}
