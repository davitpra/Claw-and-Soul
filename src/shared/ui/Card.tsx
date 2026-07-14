import { ReactNode } from "react";

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
export function Card({ imageUrl, imageAlt, className = "", children, naturalAspect = false, onImageError }: CardProps) {
  return (
    <div className={`relative overflow-hidden bg-white shadow-sm ${className}`}>
      {naturalAspect ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={imageAlt ?? ""}
          loading="lazy"
          decoding="async"
          onError={onImageError}
          className="block w-full h-auto"
        />
      ) : (
        <div
          className="aspect-4/5 w-full bg-cover bg-center"
          style={{ backgroundImage: `url('${imageUrl}')` }}
          role={imageAlt ? "img" : undefined}
          aria-label={imageAlt || undefined}
        />
      )}
      {children}
    </div>
  );
}
