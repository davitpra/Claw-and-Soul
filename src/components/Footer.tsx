import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-dark text-white py-16">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          <div>
            <h3 className="text-2xl font-bold mb-6">Stay Connected</h3>
            <p className="text-white/70 mb-8">
              Join our newsletter for exclusive offers and pet art inspiration.
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
              <h4 className="font-bold mb-4">Contact Us</h4>
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
              <h4 className="font-bold text-lg">Shop</h4>
              <Link
                className="text-white/70 hover:text-white transition-colors"
                href="/shop"
              >
                Portraits
              </Link>
              <Link
                className="text-white/70 hover:text-white transition-colors"
                href="/shop"
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
              <h4 className="font-bold text-lg">Company</h4>
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
              <h4 className="font-bold text-lg">Follow Us</h4>
              <div className="flex gap-4">
                <a
                  className="bg-white/10 p-2 rounded-full hover:bg-primary transition-colors"
                  href="#"
                >
                  <svg
                    aria-hidden="true"
                    className="size-5 fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path>
                  </svg>
                </a>
                <a
                  className="bg-white/10 p-2 rounded-full hover:bg-primary transition-colors"
                  href="#"
                >
                  <svg
                    aria-hidden="true"
                    className="size-5 fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465C9.673 2.013 10.03 2 12.48 2h-.165zm-2.964 4.524c-2.313 0-4.187 1.874-4.187 4.187s1.874 4.187 4.187 4.187 4.187-1.874 4.187-4.187-1.874-4.187-4.187-4.187zm0 6.643a2.456 2.456 0 110-4.912 2.456 2.456 0 010 4.912zm6.65-7.39a1.155 1.155 0 110 2.31 1.155 1.155 0 010-2.31z"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-16 pt-8 text-center text-white/40 text-sm">
          <p>© 2024 Claw and Soul. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
