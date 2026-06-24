// Helpers genéricos para errores de la capa de fetch.

// HTTP 404 lanzado por fetchJSON trae el status en el mensaje; lo detectamos para
// distinguir "no encontrado" de un error genérico de red.
export function isNotFound(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /404|not found/i.test(msg);
}
