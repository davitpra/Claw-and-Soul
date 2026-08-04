"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/widgets/navbar";
import { Footer } from "@/widgets/footer";
import { Container } from "@/shared/ui/Container";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Pantalla de error global, hermana de `not-found.tsx` y con el mismo shell.
 * No captura errores del layout raíz — para eso haría falta un
 * `global-error.tsx`, que hoy no existe.
 *
 * El mensaje del error no se muestra: en producción Next lo reemplaza por un
 * texto genérico de todos modos, y el `digest` es lo único que sirve para
 * cruzarlo con los logs del servidor desde soporte.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-clip bg-background-light">
      <Navbar />

      <main className="flex flex-1 items-center py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-2xl animate-fade-in-up text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-primary">
              Unexpected error
            </span>

            <span className="mx-auto mt-6 flex size-16 items-center justify-center rounded-full bg-cream text-text-muted">
              <span className="material-symbols-outlined text-[32px]">
                error
              </span>
            </span>

            <h1 className="mt-6 font-display text-2xl font-black leading-tight text-text-main md:text-3xl">
              Something went wrong
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-text-muted">
              We could not load this page. Try again — if it keeps happening,
              let us know and we will look into it.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={reset}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-sm transition-all hover:bg-primary-dark hover:shadow-md sm:w-auto"
              >
                <span className="material-symbols-outlined text-[18px]">
                  refresh
                </span>
                Try again
              </button>
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#E0DED9] bg-white px-6 py-3 font-bold text-text-main transition-all hover:bg-gray-50 sm:w-auto"
              >
                <span className="material-symbols-outlined text-[18px]">
                  arrow_back
                </span>
                Back home
              </Link>
            </div>

            <p className="mt-8 text-sm text-text-muted">
              Still stuck?{" "}
              <Link
                href="/contact"
                className="font-bold text-primary underline transition-colors hover:text-primary-dark"
              >
                Contact us
              </Link>
            </p>

            {error.digest && (
              <p className="mt-4 text-xs text-text-muted/70">
                Reference code: {error.digest}
              </p>
            )}
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
