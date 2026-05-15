"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    // Close on Escape key
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setIsOpen(false);
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 w-10 bg-primary hover:bg-primary-dark text-white transition-colors shadow-sm"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <span className="material-symbols-outlined text-[20px]">
          account_circle
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#E0DED9] overflow-hidden z-50 transition-all duration-200"
          role="menu"
        >
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-[#E0DED9] bg-cream">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">
                account_circle
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-main truncate">
                  {user?.fullName || "User"}
                </p>
                <p className="text-xs text-text-muted truncate">
                  {user?.email || ""}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/user/profile"
              onClick={closeMenu}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-main hover:bg-cream transition-colors"
              role="menuitem"
            >
              <span className="material-symbols-outlined text-[18px] text-text-muted">
                person
              </span>
              <span>Profile</span>
            </Link>

            <Link
              href="/user/generations"
              onClick={closeMenu}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-main hover:bg-cream transition-colors"
              role="menuitem"
            >
              <span className="material-symbols-outlined text-[18px] text-text-muted">
                palette
              </span>
              <span>My Generations</span>
            </Link>

            <Link
              href="/user/orders"
              onClick={closeMenu}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-main hover:bg-cream transition-colors"
              role="menuitem"
            >
              <span className="material-symbols-outlined text-[18px] text-text-muted">
                shopping_bag
              </span>
              <span>Order History</span>
            </Link>
          </div>

          {/* Divider */}
          <div className="border-t border-[#E0DED9]" />

          {/* Logout */}
          <div className="py-1">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
              role="menuitem"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isLoggingOut ? "hourglass_empty" : "logout"}
              </span>
              <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
