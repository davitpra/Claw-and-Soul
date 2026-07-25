import Link from "next/link";
import { Container } from "@/shared/ui/Container";
import { FacebookIcon, InstagramIcon } from "@/shared/ui/SocialIcons";
import WavesDivider from "@/shared/ui/WavesDivider";

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
            <div>
              <h3 className="font-display text-2xl font-black mb-6">
                Stay Connected
              </h3>
              <p className="text-white/70 mb-8">
                Join our newsletter for exclusive offers and pet art
                inspiration.
              </p>
              <form className="flex flex-col sm:flex-row gap-3">
                <input
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your email"
                  type="email"
                />
                <button
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold transition-colors"
                  type="button"
                >
                  Subscribe
                </button>
              </form>
              <div className="mt-12">
                <h4 className="font-display font-black mb-4">Contact Us</h4>
                <div className="flex flex-col gap-2 text-white/70">
                  <a
                    className="hover:text-primary transition-colors flex items-center gap-2"
                    href="mailto:hello@clawandsoul.com"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      mail
                    </span>{" "}
                    hello@clawandsoul.com
                  </a>
                  <p className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">
                      location_on
                    </span>{" "}
                    123 Paws Avenue, Art City, CA
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div className="flex flex-col gap-4">
                <h4 className="font-display font-black text-lg">Catalog</h4>
                <Link
                  className="text-white/70 hover:text-white transition-colors"
                  href="/catalog"
                >
                  Portraits
                </Link>
                <Link
                  className="text-white/70 hover:text-white transition-colors"
                  href="/catalog"
                >
                  Puzzles
                </Link>
                <Link
                  className="text-white/70 hover:text-white transition-colors"
                  href="/phone-cases"
                >
                  Phone Cases
                </Link>
                <Link
                  className="text-white/70 hover:text-white transition-colors"
                  href="/gift-cards"
                >
                  Gift Cards
                </Link>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="font-display font-black text-lg">Company</h4>
                <Link
                  className="text-white/70 hover:text-white transition-colors"
                  href="/about"
                >
                  About Us
                </Link>
                <Link
                  className="text-white/70 hover:text-white transition-colors"
                  href="/reviews"
                >
                  Reviews
                </Link>
                <Link
                  className="text-white/70 hover:text-white transition-colors"
                  href="/careers"
                >
                  Careers
                </Link>
                <Link
                  className="text-white/70 hover:text-white transition-colors"
                  href="/privacy"
                >
                  Privacy Policy
                </Link>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="font-display font-black text-lg">Follow Us</h4>
                <div className="flex gap-4">
                  <a
                    aria-label="Facebook"
                    className="bg-white/10 p-2 rounded-full hover:bg-primary transition-colors"
                    href="#"
                  >
                    <FacebookIcon className="size-5" />
                  </a>
                  <a
                    aria-label="Instagram"
                    className="bg-white/10 p-2 rounded-full hover:bg-primary transition-colors"
                    href="#"
                  >
                    <InstagramIcon className="size-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 mt-16 pt-8 text-center text-white/40 text-sm">
            <p>© 2024 Claw and Soul. All rights reserved.</p>
          </div>
        </Container>
      </footer>
    </>
  );
}
