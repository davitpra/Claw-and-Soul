import { useEffect, useState } from "react";

// Rota un array de frases en un intervalo mientras `active` sea true. Pensado para
// mensajes de carga que van cambiando (estilo "status ticker"). Mientras está inactivo
// devuelve la primera frase, de forma determinista.
export function useRotatingMessage(
  messages: string[],
  { active, intervalMs = 3000 }: { active: boolean; intervalMs?: number },
): string {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active || messages.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs, messages.length]);

  if (!active) return messages[0] ?? "";
  return messages[index] ?? messages[0] ?? "";
}
