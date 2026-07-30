"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import type { FormEvent } from "react";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useIsBelowLg } from "@/hooks/useMediaQuery";
import { MAIN_NAV } from "@/shared/config/navigation";
import UserMenu from "./UserMenu";
import CreditsBadge from "./CreditsBadge";

/** Por debajo de este scroll el navbar se comporta como uno normal: nunca se oculta. */
const HIDE_AFTER_SCROLL_Y = 80;
/** Inactividad tras la que el navbar se retira solo en mobile. */
const IDLE_HIDE_MS = 4000;

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount } = useCart();
  const { isAuthenticated, isLoading } = useAuth();
  const isBelowLg = useIsBelowLg();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [elevated, setElevated] = useState(false);
  const [hidden, setHidden] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Handle scroll effect: estilo al hacer scroll + ocultar/mostrar según dirección.
  // Con el menú móvil abierto no escuchamos: bloquear el scroll del body altera
  // window.scrollY, y ese salto se leería como "el usuario está bajando", ocultando
  // el header justo debajo del panel (que está anclado a top-16).
  useEffect(() => {
    if (mobileMenuOpen) return;

    // En mobile el navbar también se retira solo tras IDLE_HIDE_MS sin scroll:
    // recupera los 4rem de alto cuando el usuario deja de navegar. Si el foco
    // está dentro del header (buscador, menú de usuario) se pospone en vez de
    // ocultarse, para no arrancarle el input de debajo del dedo.
    const scheduleAutoHide = () => {
      autoHideTimer.current = setTimeout(() => {
        if (headerRef.current?.contains(document.activeElement)) {
          scheduleAutoHide();
          return;
        }
        setHidden(true);
      }, IDLE_HIDE_MS);
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // La sombra es feedback de actividad: se muestra mientras se hace scroll
      // (y solo si ya despegamos del tope) y se retira al quedarse quieto.
      setElevated(currentScrollY > 10);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => setElevated(false), 150);

      // Ocultar al bajar (después de pasar el navbar), mostrar al subir
      if (
        currentScrollY > lastScrollY.current &&
        currentScrollY > HIDE_AFTER_SCROLL_Y
      ) {
        setHidden(true);
      } else if (currentScrollY < lastScrollY.current) {
        setHidden(false);
      }

      // Cada evento de scroll reinicia la cuenta atrás. Cerca del tope no se
      // arma nada: ahí el navbar se comporta como uno normal, siempre visible.
      if (autoHideTimer.current) clearTimeout(autoHideTimer.current);
      if (isBelowLg && currentScrollY > HIDE_AFTER_SCROLL_Y) {
        scheduleAutoHide();
      }

      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (autoHideTimer.current) clearTimeout(autoHideTimer.current);
    };
  }, [mobileMenuOpen, isBelowLg]);

  // Al pasar a desktop el auto-ocultado deja de aplicar: si el navbar quedó
  // escondido por el temporizador móvil, lo devolvemos a la vista (mismo patrón
  // "setState during render" que el cierre del menú al cambiar de ruta).
  const [prevIsBelowLg, setPrevIsBelowLg] = useState(isBelowLg);
  if (prevIsBelowLg !== isBelowLg) {
    setPrevIsBelowLg(isBelowLg);
    if (!isBelowLg) setHidden(false);
  }

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
        ref={headerRef}
        className={`sticky top-0 z-50 bg-white backdrop-blur-md  transition-all duration-300 ${
          elevated ? "border-[#E0DED9] shadow-md" : "border-transparent"
        } ${hidden && !mobileMenuOpen ? "-translate-y-full" : "translate-y-0"}`}
      >
        <nav className="container-site px-4 sm:px-6 lg:px-8 ">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 text-text-main hover:opacity-80 transition-opacity group z-50"
            >
              <Image
                src="/Logo.svg"
                alt="Claw & Soul Logo"
                width={20}
                height={20}
                priority
                className="size-9 lg:size-11 transition-transform group-hover:scale-105"
              />
              <h2 className="font-display text-text-main text-lg lg:text-2xl font-black leading-tight tracking-[-0.015em] hidden sm:block">
                Claw & Soul
              </h2>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
              {MAIN_NAV.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-display leading-normal font-bold transition-all relative group ${
                    pathname === link.href
                      ? "text-primary"
                      : "text-slate-dark hover:text-primary"
                  }`}
                >
                  {link.label}
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
            <div className="flex flex-1 lg:flex-none items-center justify-end gap-2 sm:gap-3 lg:gap-4 min-w-0 ml-3 lg:ml-0">
              {/* Search Bar (ocupa el espacio libre en mobile, ancho fijo en desktop) */}
              <form
                onSubmit={handleSearch}
                className="flex flex-1 lg:flex-none items-center min-w-0"
                role="search"
              >
                <div className="relative group w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-[18px] text-text-muted group-focus-within:text-primary transition-colors">
                      search
                    </span>
                  </div>
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full lg:w-48 xl:w-64 h-10 pl-10 pr-3 rounded-xl border border-[#E0DED9] bg-white/50 focus:bg-white text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    placeholder="Search..."
                    aria-label="Search"
                  />
                </div>
              </form>

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
                        className="font-display flex items-center justify-center rounded-xl h-10 px-5 bg-white hover:bg-gray-50 text-text-main border border-[#E0DED9] transition-all shadow-sm text-sm font-bold hover:shadow-md"
                      >
                        Login
                      </Link>
                      <Link
                        href="/signup"
                        className="font-display flex items-center justify-center rounded-xl h-10 px-5 bg-primary hover:bg-primary-dark text-white transition-all shadow-sm text-sm font-bold hover:shadow-md hover:scale-105"
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

      {/* Mobile Menu: se despliega desde arriba y se esconde detrás del header
          (el header es opaco y tiene z-50, así que el panel cerrado queda tapado). */}
      <div
        id="mobile-menu"
        aria-hidden={!mobileMenuOpen}
        className={`lg:hidden fixed top-16 inset-x-0 z-40 max-h-[calc(100dvh-4rem)] overflow-y-auto bg-white rounded-b-2xl shadow-2xl transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen
            ? "translate-y-0"
            : "-translate-y-full pointer-events-none invisible"
        }`}
      >
        <div className="container-site px-4 sm:px-6 py-4">
          {/* Navigation Links */}
          <nav className="space-y-1">
            {MAIN_NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                tabIndex={mobileMenuOpen ? undefined : -1}
                className={`font-display block px-4 py-3 rounded-xl text-base font-bold transition-all ${
                  pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-text-main hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons - Mobile */}
          {!isLoading && !isAuthenticated && (
            <div className="mt-4 pt-4 border-t border-[#E0DED9] grid grid-cols-2 gap-3">
              <Link
                href="/login"
                tabIndex={mobileMenuOpen ? undefined : -1}
                className="font-display flex items-center justify-center rounded-xl h-12 px-5 bg-white hover:bg-gray-50 text-text-main border border-[#E0DED9] transition-all shadow-sm text-base font-bold w-full"
              >
                Login
              </Link>
              <Link
                href="/signup"
                tabIndex={mobileMenuOpen ? undefined : -1}
                className="font-display flex items-center justify-center rounded-xl h-12 px-5 bg-primary hover:bg-primary-dark text-white transition-all shadow-sm text-base font-bold w-full"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
