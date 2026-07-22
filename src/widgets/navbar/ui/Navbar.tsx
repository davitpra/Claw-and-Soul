"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import type { FormEvent } from "react";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import UserMenu from "./UserMenu";
import CreditsBadge from "./CreditsBadge";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount } = useCart();
  const { isAuthenticated, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  // Navega a la tienda con el término como query param. Si está vacío, va a
  // /catalog sin filtro, para que enviar el buscador vacío también quite la búsqueda.
  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = searchTerm.trim();
    router.push(term ? `/catalog?q=${encodeURIComponent(term)}` : "/catalog");
    setMobileMenuOpen(false);
  };

  // Vaciar el input (incluida la "X" nativa de type="search") limpia el filtro
  // al instante cuando ya estamos en la página de resultados.
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value.trim() === "" && pathname === "/catalog") {
      router.push("/catalog");
    }
  };

  // Cierra el menú móvil al cambiar de ruta sin un effect (patrón "setState during render").
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  const navLinks = [
    { name: "Studio", href: "/studio" },
    { name: "Catalog", href: "/catalog" },
    { name: "Contact", href: "/contact" },
  ];

  // Handle scroll effect: estilo al hacer scroll + ocultar/mostrar según dirección
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setScrolled(currentScrollY > 10);

      // Ocultar al bajar (después de pasar el navbar), mostrar al subir
      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setHidden(true);
      } else if (currentScrollY < lastScrollY.current) {
        setHidden(false);
      }

      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b transition-all duration-300 ${
          scrolled ? "border-[#E0DED9] shadow-md" : "border-transparent"
        } ${hidden ? "-translate-y-full" : "translate-y-0"}`}
      >
        <nav className="container-site px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 text-text-main hover:opacity-80 transition-opacity group z-50"
            >
              <Image
                src="/Logo.svg"
                alt="Claw & Soul Logo"
                width={50}
                height={50}
                className=""
              />
              <h2 className="font-display text-text-main text-lg lg:text-2xl font-black leading-tight tracking-[-0.015em] hidden sm:block">
                Claw & Soul
              </h2>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium leading-normal transition-all relative group ${
                    pathname === link.href
                      ? "text-primary"
                      : "text-slate-dark hover:text-primary"
                  }`}
                >
                  {link.name}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${
                      pathname === link.href
                        ? "w-full"
                        : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3 lg:gap-4">
              {/* Search Bar - Desktop */}
              <form
                onSubmit={handleSearch}
                className="hidden lg:flex items-center"
              >
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-[18px] text-text-muted group-focus-within:text-primary transition-colors">
                      search
                    </span>
                  </div>
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-48 xl:w-64 h-10 pl-10 pr-4 rounded-xl border border-[#E0DED9] bg-white/50 focus:bg-white text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    placeholder="Search gifts..."
                  />
                </div>
              </form>

              {/* Search Icon - Mobile (abre el menú con el buscador) */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden flex items-center justify-center size-10 rounded-xl bg-white/50 hover:bg-white border border-transparent hover:border-[#E0DED9] text-text-main transition-all shadow-sm"
                aria-label="Search"
              >
                <span className="material-symbols-outlined text-[20px]">
                  search
                </span>
              </button>

              {/* Auth Buttons / User Menu */}
              {!isLoading && (
                <>
                  {isAuthenticated ? (
                    <>
                      <CreditsBadge />
                      <UserMenu />
                    </>
                  ) : (
                    <div className="hidden md:flex gap-2">
                      <Link
                        href="/login"
                        className="flex items-center justify-center rounded-xl h-10 px-5 bg-white hover:bg-gray-50 text-text-main border border-[#E0DED9] transition-all shadow-sm text-sm font-medium hover:shadow-md"
                      >
                        Login
                      </Link>
                      <Link
                        href="/signup"
                        className="flex items-center justify-center rounded-xl h-10 px-5 bg-primary hover:bg-primary-dark text-white transition-all shadow-sm text-sm font-semibold hover:shadow-md hover:scale-105"
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </>
              )}

              {/* Cart */}
              <Link
                href="/cart"
                className="flex items-center justify-center size-10 rounded-full bg-white hover:bg-gray-50 border border-transparent hover:border-[#E0DED9] text-text-main transition-all shadow-sm hover:shadow-md relative group"
                aria-label="Shopping cart"
              >
                <span className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform">
                  shopping_cart
                </span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold min-w-4.5 h-4.5 px-1 flex items-center justify-center rounded-full shadow-md animate-in fade-in zoom-in">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden flex items-center justify-center size-10 rounded-xl bg-white hover:bg-gray-50 border border-transparent hover:border-[#E0DED9] text-text-main transition-all shadow-sm"
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                <span className="material-symbols-outlined text-[24px]">
                  {mobileMenuOpen ? "close" : "menu"}
                </span>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-in fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed top-16 right-0 bottom-0 w-full max-w-sm bg-white z-40 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Search Bar - Mobile */}
          <form
            onSubmit={handleSearch}
            className="p-4 border-b border-[#E0DED9]"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-[18px] text-text-muted">
                  search
                </span>
              </div>
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#E0DED9] bg-white text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                placeholder="Search gifts..."
              />
            </div>
          </form>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-all ${
                  pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-text-main hover:bg-gray-50"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons - Mobile */}
          {!isLoading && !isAuthenticated && (
            <div className="p-4 border-t border-[#E0DED9] space-y-3">
              <Link
                href="/signup"
                className="flex items-center justify-center rounded-xl h-12 px-5 bg-primary hover:bg-primary-dark text-white transition-all shadow-sm text-base font-semibold w-full"
              >
                Sign Up
              </Link>
              <Link
                href="/login"
                className="flex items-center justify-center rounded-xl h-12 px-5 bg-white hover:bg-gray-50 text-text-main border border-[#E0DED9] transition-all shadow-sm text-base font-medium w-full"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
