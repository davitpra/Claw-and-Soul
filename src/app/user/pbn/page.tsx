"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "@/shared/ui/Container";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { PbnBuyButton } from "@/features/pbn-purchase";

interface PaintByNumbersItem {
  id: string;
  previewUrl: string | null;
  outlineSvgUrl: string | null;
  paletteUrl: string | null;
  colorCount: number | null;
  createdAt: string;
}

interface PbnListResponse {
  data: { data: PaintByNumbersItem[]; meta: { total: number } };
}

export default function UserPbnPage() {
  const { get, delete: del } = useAuthFetch();
  const [items, setItems] = useState<PaintByNumbersItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PaintByNumbersItem | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // setState only inside the promise callbacks (never synchronously in the
  // effect body) to satisfy the repo's react-hooks/set-state-in-effect rule.
  const fetchList = useCallback(() => {
    return get<PbnListResponse>("/paint-by-numbers")
      .then((res) => {
        setItems(res.data.data);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "No se pudieron cargar tus PBN",
        );
      })
      .finally(() => setIsLoading(false));
  }, [get]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete || deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await del(`/paint-by-numbers/${pendingDelete.id}`);
      setItems((prev) => prev.filter((p) => p.id !== pendingDelete.id));
      setPendingDelete(null);
    } catch {
      setDeleteError("No se pudo eliminar este Paint by Numbers.");
    } finally {
      setDeleting(false);
    }
  }, [del, pendingDelete, deleting]);

  return (
    <Container className="pb-10">
      <section className="rounded-xl bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-black text-text-main">
            Mis Paint by Numbers
          </h2>
          <Link
            href="/studio"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition-all hover:bg-primary-dark hover:shadow-md"
          >
            Crear nuevo
          </Link>
        </div>

        <div className="mt-4">
          {isLoading && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-4/5 animate-pulse rounded-xl bg-cream"
                />
              ))}
            </div>
          )}

          {!isLoading && error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {!isLoading && !error && items.length === 0 && (
            <div className="rounded-xl bg-cream px-4 py-8 text-center">
              <p className="text-text-muted">Aún no has guardado ningún PBN.</p>
              <Link
                href="/studio"
                className="mt-3 inline-block rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition-all hover:bg-primary-dark hover:shadow-md"
              >
                Crear tu primer Paint by Numbers
              </Link>
            </div>
          )}

          {!isLoading && !error && items.length > 0 && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {items.map((pbn) => (
                <article
                  key={pbn.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-cream bg-white"
                >
                  <div className="aspect-4/5 bg-cream">
                    {pbn.previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={pbn.previewUrl}
                        alt="Paint by Numbers preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-text-muted">
                        <span className="material-symbols-outlined text-3xl">
                          format_paint
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-3">
                    <p className="text-xs text-text-muted">
                      {pbn.colorCount ? `${pbn.colorCount} colores · ` : ""}
                      {new Date(pbn.createdAt).toLocaleDateString()}
                    </p>
                    <div className="mt-auto flex flex-col gap-2">
                      <PbnBuyButton
                        pbn={{ id: pbn.id, previewUrl: pbn.previewUrl }}
                        variant="block"
                      />
                      <div className="flex flex-wrap gap-2">
                        {pbn.outlineSvgUrl && (
                          <a
                            href={pbn.outlineSvgUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary/20"
                          >
                            Descargar
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteError(null);
                            setPendingDelete(pbn);
                          }}
                          className="rounded-lg px-3 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="¿Eliminar este Paint by Numbers?"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        loadingLabel="Eliminando…"
        loading={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (!deleting) setPendingDelete(null);
        }}
      >
        {pendingDelete?.previewUrl && (
          <div
            className="aspect-4/5 w-full rounded-xl bg-cover bg-center"
            style={{ backgroundImage: `url('${pendingDelete.previewUrl}')` }}
          />
        )}
      </ConfirmDialog>
    </Container>
  );
}
