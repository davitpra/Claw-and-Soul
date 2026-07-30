import type { ReactNode } from "react";
import { Navbar } from "@/widgets/navbar";
import { Footer } from "@/widgets/footer";
import { Container } from "@/shared/ui/Container";

interface LegalPageProps {
  title: string;
  intro: string;
  /** Fecha de última revisión, ya formateada (p. ej. "July 30, 2026"). */
  lastUpdated: string;
  children: ReactNode;
}

/**
 * Layout compartido de las páginas de texto legal (/privacy, /terms,
 * /shipping-returns). Los `children` son secciones `<section>` con un `<h2>` y
 * párrafos; los estilos de prosa se aplican desde aquí para no repetirlos.
 */
export default function LegalPage({
  title,
  intro,
  lastUpdated,
  children,
}: LegalPageProps) {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-clip bg-white">
      <Navbar />

      <main className="flex-1 py-12 lg:py-20">
        <Container>
          <div className="max-w-3xl">
            <span className="text-primary font-bold tracking-wider text-sm uppercase">
              Legal
            </span>
            <h1 className="font-display text-text-main text-4xl md:text-5xl font-black leading-tight mt-4">
              {title}
            </h1>
            <p className="text-text-muted text-lg leading-relaxed mt-4">
              {intro}
            </p>
            <p className="text-text-muted/70 text-sm mt-4">
              Last updated: {lastUpdated}
            </p>

            <div className="mt-12 flex flex-col gap-10 text-text-muted leading-relaxed [&_h2]:font-display [&_h2]:text-text-main [&_h2]:text-2xl [&_h2]:font-black [&_h2]:mb-3 [&_li]:mb-2 [&_p+p]:mt-3 [&_ul]:list-disc [&_ul]:pl-6">
              {children}
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
