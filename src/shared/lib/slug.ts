/**
 * Normaliza un texto a un slug ASCII apto para nombres de archivo y URLs:
 * quita diacríticos, pasa a minúsculas y colapsa lo demás en guiones.
 */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
