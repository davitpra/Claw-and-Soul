"use client";

import { useCallback, useRef, useState } from "react";

interface ImageCompareSliderProps {
  /** Shown on the left (revealed) side of the divider. */
  originalSrc: string;
  /** Shown on the right side and defines the rendered size. */
  processedSrc: string;
  /** Optional overlay that highlights one color's sections (Result side only). */
  highlightSrc?: string;
  leftLabel?: string;
  rightLabel?: string;
  /**
   * Renders the slider with its own rounded white frame + shadow (default).
   * Set false when a parent supplies the card surface (e.g. the Instagram-style
   * post, where the image and footer share one card).
   */
  framed?: boolean;
  /**
   * By default the slider sizes itself from the image (`w-fit`, 80dvh tall),
   * which is what the studio canvas wants. With `fill` it stretches to its
   * parent instead, so a caller can box it (e.g. `aspect-4/5 w-full`).
   */
  fill?: boolean;
}

export default function ImageCompareSlider({
  originalSrc,
  processedSrc,
  highlightSrc,
  leftLabel,
  rightLabel,
  framed = true,
  fill = false,
}: ImageCompareSliderProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);

  const updateFromClientX = useCallback((clientX: number) => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, next)));
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      updateFromClientX(e.clientX);
    },
    [updateFromClientX],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        updateFromClientX(e.clientX);
      }
    },
    [updateFromClientX],
  );

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);

  // Anchored to the bottom corners so they don't collide with the Instagram-
  // style post header overlaid on the top of the result.
  const label =
    "pointer-events-none absolute bottom-3 rounded-full bg-black/60 px-2.5 py-1 font-body text-xs font-semibold text-white";

  return (
    <div
      ref={wrapperRef}
      className={`relative mx-auto max-w-full cursor-ew-resize touch-none select-none overflow-hidden ${
        fill ? "h-full w-full" : "h-[calc(80dvh)] w-fit"
      } ${framed ? "rounded-xl border-4 border-white shadow-xl" : ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* base = processed; defines the rendered size unless the parent does */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={`block h-full max-w-full object-cover ${
          fill ? "w-full" : "w-auto"
        }`}
        src={processedSrc}
        alt=""
        draggable={false}
      />
      {/* highlight overlay — sits between the processed base and the (clipped)
          original, so the original stacked on top hides it on the left side and
          the highlight only shows on the Result (right) side */}
      {highlightSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          src={highlightSrc}
          alt=""
          draggable={false}
        />
      )}
      {/* overlay = original, clipped to the left of the divider. The clip-path
          lives on the wrapping div (not the <img>) to avoid Chrome's dark
          anti-aliasing fringe at the clip edge on replaced elements. */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src={originalSrc}
          alt=""
          draggable={false}
        />
      </div>
      {/* transparent guard: absorbs right-click / long-press so it lands on a
          plain div instead of an <img> (no "Save image as"). Pointer events
          still bubble to the wrapper, so the slider drag keeps working. */}
      <div className="absolute inset-0" aria-hidden />
      {leftLabel && <span className={`${label} left-3`}>{leftLabel}</span>}
      {rightLabel && <span className={`${label} right-3`}>{rightLabel}</span>}
      <div
        className="absolute inset-y-0 -ml-px w-0.5 bg-primary"
        style={{ left: `${pos}%` }}
      >
        <span className="absolute left-1/2 top-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-sm text-white shadow-lg">
          ⇄
        </span>
      </div>
    </div>
  );
}
