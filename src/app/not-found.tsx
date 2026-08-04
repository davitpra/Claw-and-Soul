import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/widgets/navbar";
import { Footer } from "@/widgets/footer";
import { Container } from "@/shared/ui/Container";
import { MAIN_NAV } from "@/shared/config/navigation";

export const metadata: Metadata = {
  title: "Page not found · Claw & Soul",
};

/** Destinos que ya tienen su propio botón arriba: no se repiten en la fila de
 *  rescate, que sale de `MAIN_NAV` para no duplicar la navegación a mano. */
const CTA_HREFS = ["/", "/catalog"];

/**
 * 404 global. Cubre tanto las URLs inexistentes como las llamadas a
 * `notFound()` (hoy, `app/admin/layout.tsx` para quien no es admin).
 * Monta Navbar y Footer por su cuenta porque el layout raíz solo trae fuentes
 * y providers: no hay layout de storefront del que heredarlos.
 */
export default function NotFound() {
  const rescueLinks = MAIN_NAV.filter(
    (link) => !CTA_HREFS.includes(link.href),
  );

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-clip bg-background-light">
      <Navbar />

      <main className="flex flex-1 items-center py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-2xl animate-fade-in-up text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-primary">
              Error 404
            </span>

            <p className="mt-4 font-display text-6xl font-black leading-none text-text-main md:text-8xl">
              404
            </p>

            <h1 className="mt-6 font-display text-2xl font-black leading-tight text-text-main md:text-3xl">
              This page ran off chasing a butterfly
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-text-muted">
              The link may be broken or the page may have moved — but there is
              plenty of art left to find.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-sm transition-all hover:bg-primary-dark hover:shadow-md sm:w-auto"
              >
                <span className="material-symbols-outlined text-[18px]">
                  arrow_back
                </span>
                Back home
              </Link>
              <Link
                href="/catalog"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#E0DED9] bg-white px-6 py-3 font-bold text-text-main transition-all hover:bg-gray-50 sm:w-auto"
              >
                <span className="material-symbols-outlined text-[18px]">
                  storefront
                </span>
                Browse the catalog
              </Link>
            </div>

            {rescueLinks.length > 0 && (
              <p className="mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-text-muted">
                <span>Or head to</span>
                {rescueLinks.map((link, i) => (
                  <span key={link.href} className="flex items-center gap-2">
                    {i > 0 && <span aria-hidden="true">·</span>}
                    <Link
                      href={link.href}
                      className="font-bold text-primary underline transition-colors hover:text-primary-dark"
                    >
                      {link.label}
                    </Link>
                  </span>
                ))}
              </p>
            )}
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
