"use client";

import { useCallback, useRef, useState } from "react";

interface ImageCompareSliderProps {
  /** Shown on the left (revealed) side of the divider. */
  originalSrc: string;
  /** Shown on the right side and defines the rendered size. */
  processedSrc: string;
  leftLabel?: string;
  rightLabel?: string;
}

export default function ImageCompareSlider({
  originalSrc,
  processedSrc,
  leftLabel,
  rightLabel,
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

  const label =
    "pointer-events-none absolute top-3 rounded-full bg-black/60 px-2.5 py-1 font-body text-xs font-semibold text-white";

  return (
    <div
      ref={wrapperRef}
      className="relative w-full cursor-ew-resize touch-none select-none overflow-hidden rounded-xl border-4 border-white shadow-xl"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* base = processed, defines the rendered size */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="block h-auto w-full"
        src={processedSrc}
        alt=""
        draggable={false}
      />
      {/* overlay = original, clipped to the left of the divider */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="absolute inset-0 h-full w-full object-cover"
        src={originalSrc}
        alt=""
        draggable={false}
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      />
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
