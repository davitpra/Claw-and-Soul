import Link from "next/link";
import { Container } from "@/shared/ui/Container";
import { FacebookIcon, InstagramIcon } from "@/shared/ui/SocialIcons";
import WavesDivider from "@/shared/ui/WavesDivider";
import { BRAND, FOOTER_SECTIONS } from "@/shared/config/navigation";

export default function Footer() {
  return (
    <>
      <WavesDivider
        fillColor="var(--color-slate-dark)"
        waveWidth={0.1}
        height={20}
      />
      <footer className="bg-slate-dark text-white py-16">
        <Container>
          {/* Cierre del funnel principal: el Studio es lo que se puede probar
              sin pagar, así que ocupa el lugar más visible del footer. */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <h3 className="font-display text-2xl md:text-3xl font-black mb-3">
                Turn your pet&apos;s photo into a painting only you could make
              </h3>
              <p className="text-white/70">
                Upload a photo, pick a style, and download your paint-by-numbers
                — free to try, no account needed to start.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 shrink-0">
              <Link
                className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                href="/studio"
              >
                <span className="material-symbols-outlined text-[20px]">
                  palette
                </span>
                Try the Studio free
              </Link>
              <Link
                className="text-white/70 hover:text-white font-bold transition-all"
                href="/catalog"
              >
                Create my own Painting
              </Link>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
            {FOOTER_SECTIONS.map((section) => (
              <nav
                key={section.title}
                aria-label={section.title}
                className="flex flex-col gap-4"
              >
                <h4 className="font-display font-black text-lg">
                  {section.title}
                </h4>
                {section.links.map((link) => (
                  <Link
                    key={link.href}
                    className="text-white/70 hover:text-white transition-all"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            ))}
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col-reverse items-center gap-6 sm:flex-row sm:justify-between">
            <p className="text-white/40 text-sm">
              © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                className="text-white/70 hover:text-primary transition-all flex items-center gap-2 text-sm"
                href={`mailto:${BRAND.email}`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  mail
                </span>
                {BRAND.email}
              </a>
              <div className="flex gap-3">
                <a
                  aria-label="Facebook"
                  className="bg-white/10 p-2 rounded-full hover:bg-primary transition-all"
                  href={BRAND.facebookUrl}
                >
                  <FacebookIcon className="size-5" />
                </a>
                <a
                  aria-label="Instagram"
                  className="bg-white/10 p-2 rounded-full hover:bg-primary transition-all"
                  href={BRAND.instagramUrl}
                >
                  <InstagramIcon className="size-5" />
                </a>
              </div>
            </div>
          </div>
        </Container>
      </footer>
    </>
  );
}
