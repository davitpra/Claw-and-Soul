"use client";

import { type ReactNode, useState } from "react";
import { Drawer } from "vaul";

/** Snap heights for the settings sheet: a peek bar that doubles as the
 * "Ajustes" handle, an intermediate dock (preview + some settings, reachable by
 * dragging), and an expanded state covering 90% (leaving a strip of the preview
 * visible). The content only becomes scrollable at the topmost snap point (a vaul
 * constraint), so the last options are only reachable at SNAP_OPEN — that's why
 * tapping the handle opens straight there. */
const SNAP_PEEK = "96px";
const SNAP_HALF = 0.5;
const SNAP_OPEN = 0.95;
const snapPoints = [SNAP_PEEK, SNAP_HALF, SNAP_OPEN];

/**
 * Mobile-only bottom sheet that houses the Paint by Numbers sidebar. Non-modal
 * (no dark overlay) so the preview above stays visible and interactive while the
 * user tweaks settings — the "toquetea y ve" pattern. The lowest snap point is a
 * persistent peek bar that acts as the "Ajustes" handle; it can't be dismissed.
 */
export default function PbnSettingsDrawer({
  children,
}: {
  children: ReactNode;
}) {
  const [snap, setSnap] = useState<number | string | null>(SNAP_PEEK);

  return (
    <Drawer.Root
      open
      modal={false}
      dismissible={false}
      snapPoints={snapPoints}
      // Disable velocity-based swiping so a fast drag can't skip the intermediate
      // 0.5 dock; each gesture moves to the adjacent snap point.
      snapToSequentialPoint
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
    >
      <Drawer.Portal>
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-40 flex h-full max-h-[97%] flex-col rounded-t-xl bg-white shadow-xl lg:hidden">
          {/* Peek bar / handle: tap opens straight to the expanded state (so every
              option is visible and scrollable); tap again collapses back to the
              peek. The intermediate dock is still reachable by dragging. */}
          <button
            type="button"
            onClick={() =>
              setSnap((s) => (s === SNAP_OPEN ? SNAP_PEEK : SNAP_OPEN))
            }
            className="flex flex-col items-center gap-2 pt-3 pb-2"
            aria-label="Alternar panel de ajustes"
          >
            <span
              className="h-1.5 w-10 rounded-full bg-slate-300"
              aria-hidden
            />
            <span className="flex items-center gap-2 font-display text-lg font-black text-slate-dark">
              <span className="material-symbols-outlined text-[20px] text-primary">
                tune
              </span>
              Settings
            </span>
          </button>
          <Drawer.Title className="sr-only">
            Ajustes de Paint by Numbers
          </Drawer.Title>
          <Drawer.Description className="sr-only">
            Sube tu imagen y ajusta las opciones; el preview se actualiza
            arriba.
          </Drawer.Description>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-8">
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
