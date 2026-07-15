"use client";

import { useCallback, useRef, useState } from "react";

interface CompareSliderProps {
  /** Revealed on the left of the divider. */
  beforeSrc: string;
  /** Revealed on the right; also defines the aspect ratio. */
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
  /** Intrinsic size, used to lock the aspect ratio (avoids layout shift). */
  width: number;
  height: number;
  alt?: string;
}

export default function CompareSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = "Original",
  afterLabel = "Paint by numbers",
  width,
  height,
  alt = "",
}: CompareSliderProps) {
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

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 4));
    if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 4));
  }, []);

  const label =
    "pointer-events-none absolute bottom-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white";

  return (
    <div
      ref={wrapperRef}
      role="slider"
      tabIndex={0}
      aria-label="Compare original photo with the paint-by-numbers result"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pos)}
      className="relative w-full cursor-ew-resize touch-none select-none overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[#7ec6db]"
      style={{ aspectRatio: `${width} / ${height}` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onKeyDown={onKeyDown}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* base = after (SVG), defines the rendered surface */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="absolute inset-0 h-full w-full object-cover"
        src={afterSrc}
        alt={alt}
        draggable={false}
      />
      {/* overlay = before (PNG), clipped to the left of the divider */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src={beforeSrc}
          alt=""
          draggable={false}
        />
      </div>
      <span className={`${label} left-3`}>{beforeLabel}</span>
      <span className={`${label} right-3`}>{afterLabel}</span>
      {/* divider + handle */}
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
