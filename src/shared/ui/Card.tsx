import { ReactNode } from "react";
import { NaturalImage } from "@/shared/ui/NaturalImage";

interface CardProps {
  /** URL de la imagen que ocupa la card. */
  imageUrl: string;
  /** Texto alternativo de la imagen para accesibilidad. */
  imageAlt?: string;
  /** Clases extra del contenedor (tamaño en carruseles, ring de selección, etc.). */
  className?: string;
  /** Contenido superpuesto sobre la imagen: badges, etiquetas, overlays. */
  children?: ReactNode;
  /** Muestra la imagen en su proporción natural (alto variable) en vez de recortarla a 4/5. */
  naturalAspect?: boolean;
  /**
   * Se invoca si la imagen no carga (404, host caído…), para que el consumidor pueda
   * renderizar un fallback en vez del icono de imagen rota del navegador.
   * Solo aplica con `naturalAspect` (la otra rama pinta la imagen como background).
   */
  onImageError?: () => void;
}

/**
 * Card visual base de Claw & Soul. Por defecto recorta la imagen a 4/5.
 * Con `naturalAspect` el alto se adapta a la proporción real de la imagen.
 * Los `children` se posicionan con `absolute` sobre la imagen.
 */
export function Card({
  imageUrl,
  imageAlt,
  className = "",
  children,
  naturalAspect = false,
  onImageError,
}: CardProps) {
  return (
    <div className={`relative overflow-hidden bg-white shadow-sm ${className}`}>
      {naturalAspect && imageUrl ? (
        // Reserva su caja antes de cargar: sin ella la card mide 0 de alto y la
        // grilla salta cuando la imagen aparece (ver NaturalImage).
        <NaturalImage src={imageUrl} alt={imageAlt} onError={onImageError} />
      ) : (
        // Sin imagen (o sin `naturalAspect`): caja con proporción fija. Un <img>
        // sin src dispara un warning y colapsa sin alto, así que los ítems sin
        // imagen caen siempre a este placeholder (bg-white con aspecto definido).
        <div
          className="aspect-2/3 w-full bg-cover bg-center"
          style={
            imageUrl ? { backgroundImage: `url('${imageUrl}')` } : undefined
          }
          role={imageAlt ? "img" : undefined}
          aria-label={imageAlt || undefined}
        />
      )}
      {children}
    </div>
  );
}
