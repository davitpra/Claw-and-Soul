"use client";

import { useEffect, useRef, useState } from "react";

export interface PbnPostMenuItem {
  label: string;
  /** Material Symbols icon name. */
  icon: string;
  onClick: () => void;
  /** When true the item is not rendered (e.g. Save hidden until there's output). */
  hidden?: boolean;
}

/**
 * Instagram-style three-dots ("⋯") menu anchored to the post header. Follows the
 * same open/close + outside-click + Escape pattern as the navbar UserMenu so the
 * behaviour stays consistent across the app.
 */
export default function PbnPostMenu({ items }: { items: PbnPostMenuItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
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

  const visible = items.filter((i) => !i.hidden);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex size-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20"
        aria-label="Post options"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <span className="material-symbols-outlined text-[22px]">more_horiz</span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-[#E0DED9] bg-white shadow-lg z-50"
          role="menu"
        >
          <div className="py-1">
            {visible.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  item.onClick();
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-text-main transition-colors hover:bg-cream"
                role="menuitem"
              >
                <span className="material-symbols-outlined text-[18px] text-text-muted">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
