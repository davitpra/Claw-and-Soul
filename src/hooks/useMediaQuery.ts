import { useSyncExternalStore } from "react";

/**
 * Subscribes to a CSS media query and returns whether it currently matches.
 *
 * Uses `useSyncExternalStore` so the correct value is available on the first
 * client paint without a hydration mismatch: the server snapshot is a stable
 * default (`false`) and React reconciles to the real `matchMedia` result on the
 * client. Prefer this over a `useState` + `useEffect` pattern, which flashes the
 * default value for one frame.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/**
 * True below Tailwind's `lg` breakpoint (1024px) — the same breakpoint that
 * governs the Paint by Numbers sidebar layout, so JS and CSS stay in sync.
 */
export const useIsMobile = () => useMediaQuery("(max-width: 1023.98px)");
