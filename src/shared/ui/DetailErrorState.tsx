import type { ReactNode } from "react";

interface DetailErrorStateProps {
  /** Back-link slot rendered above the error box (entity-specific). */
  back: ReactNode;
  message: string;
  onRetry: () => void;
}

/**
 * Estado de error genérico de una página de detalle: link de vuelta + caja roja
 * con el mensaje + botón "Retry". Compartido por OrderDetail y GenerationDetail;
 * el link de vuelta se pasa como slot porque cada página apunta a su listado.
 */
export function DetailErrorState({
  back,
  message,
  onRetry,
}: DetailErrorStateProps) {
  return (
    <section className="rounded-xl bg-white p-6 md:p-8">
      {back}
      <div className="mt-5 flex flex-col items-center rounded-xl bg-red-50 px-4 py-8 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <span className="material-symbols-outlined text-[26px]">error</span>
        </span>
        <p className="mt-3 text-sm text-red-700">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Retry
        </button>
      </div>
    </section>
  );
}
