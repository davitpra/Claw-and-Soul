// Optimización de imágenes Cloudinary vía transformaciones en la URL.
// Las fotos se guardan como `secure_url` crudo (sin transform), así que para
// thumbnails inyectamos `f_auto,q_auto,w_<width>` tras `/upload/` y evitamos
// descargar la imagen a resolución completa.

/**
 * Devuelve una variante optimizada de una URL de Cloudinary para mostrarla a
 * `width` px. Si la URL no es de Cloudinary (o ya trae transform), se devuelve
 * sin cambios.
 */
export function cloudinaryThumb(url: string | null, width: number): string {
  if (!url || !url.includes("res.cloudinary.com")) return url ?? "";

  const marker = "/upload/";
  const idx = url.indexOf(marker);
  if (idx === -1) return url;

  const after = url.slice(idx + marker.length);

  // Evita duplicar transformaciones si ya las trae.
  if (/^[a-z]_[^/]+\//.test(after)) return url;

  const transform = `f_auto,q_auto,w_${width}/`;
  return `${url.slice(0, idx + marker.length)}${transform}${after}`;
}
