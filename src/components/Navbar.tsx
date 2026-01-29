"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import UserMenu from "./UserMenu";

export default function Navbar() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { isAuthenticated, isLoading } = useAuth();

  const navLinks = [
    { name: "Shop", href: "/shop" },
    { name: "Gallery", href: "/gallery" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap bg-white backdrop-blur-md px-6 py-4 lg:px-10 border-b border-[#E0DED9]">
      <div className="flex items-center gap-8 bg-white">
        <Link
          className="flex items-center gap-3 text-text-main hover:opacity-80 transition-opacity"
          href="/"
        >
          <div className="size-10 relative overflow-hidden`">
            <Image
              src="/Logo.jpg"
              alt="Claw & Soul Logo"
              fill
              className="object-contain bg-white rounded-full"
              priority
            />
          </div>
          <h2 className="text-text-main text-xl font-bold leading-tight tracking-[-0.015em]">
            Claw & Soul
          </h2>
        </Link>
        <div className="hidden lg:flex items-center gap-9">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              className={`text-sm leading-normal transition-colors hover:text-primary ${
                pathname === link.href
                  ? "text-primary font-bold"
                  : "text-text-main font-medium"
              }`}
              href={link.href}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex flex-1 justify-end gap-6 items-center">
        <label className="hidden md:flex flex-col min-w-40 h-10 max-w-64 group">
          <div className="flex w-full flex-1 items-stretch rounded-xl h-full border border-transparent focus-within:border-primary/50 transition-colors">
            <div className="text-text-muted flex bg-white/50 items-center justify-center pl-4 rounded-l-xl border-r-0">
              <span className="material-symbols-outlined text-[20px]">
                search
              </span>
            </div>
            <input
              className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-text-main focus:outline-0 focus:ring-0 border-none bg-white/50 focus:border-none h-full placeholder:text-text-muted px-4 rounded-l-none border-l-0 pl-2 text-sm font-normal leading-normal transition-colors"
              placeholder="Search gifts..."
            />
          </div>
        </label>
        <div className="flex gap-2 items-center">
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <UserMenu />
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    className="flex cursor-pointer items-center justify-center rounded-xl h-10 px-4 bg-white/50 hover:bg-white text-text-main transition-colors shadow-sm text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="flex cursor-pointer items-center justify-center rounded-xl h-10 px-4 bg-primary hover:bg-primary-dark text-white transition-colors shadow-sm text-sm font-semibold"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </>
          )}
          <Link
            href="/cart"
            className="flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 w-10 bg-white/50 hover:bg-white text-text-main transition-colors shadow-sm relative"
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold size-4 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
