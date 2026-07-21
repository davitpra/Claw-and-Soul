"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { CropRect } from "@/lib/pbn/svgExport";
import { btnPrimary, btnSecondary } from "@/features/pbn-studio/ui/pbnStyles";

interface CropModalProps {
  imageSrc: string;
  imageWidth: number;
  imageHeight: number;
  /** Target crop aspect ratio (width / height) locked to the chosen paper. */
  aspect: number;
  title?: string;
  onCancel: () => void;
  onConfirm: (crop: CropRect) => void;
}

type Corner = "nw" | "ne" | "sw" | "se";

const MIN_SIZE = 40; // minimum crop size in image pixels

/** Largest centered rectangle of the given aspect that fits inside the image. */
function initialCrop(imgW: number, imgH: number, aspect: number): CropRect {
  let w = imgW;
  let h = w / aspect;
  if (h > imgH) {
    h = imgH;
    w = h * aspect;
  }
  return { x: (imgW - w) / 2, y: (imgH - h) / 2, w, h };
}

export default function CropModal({
  imageSrc,
  imageWidth,
  imageHeight,
  aspect,
  title,
  onCancel,
  onConfirm,
}: CropModalProps) {
  const [crop, setCrop] = useState<CropRect>(() =>
    initialCrop(imageWidth, imageHeight, aspect),
  );
  const [displayScale, setDisplayScale] = useState(1);
  const imgRef = useRef<HTMLImageElement>(null);
  // Drag state kept in a ref so window listeners always read the latest values.
  const dragRef = useRef<
    | { mode: "move"; startX: number; startY: number; orig: CropRect }
    | { mode: "resize"; corner: Corner; orig: CropRect }
    | null
  >(null);

  // Reset the crop whenever the source image or target aspect changes.
  useEffect(() => {
    setCrop(initialCrop(imageWidth, imageHeight, aspect));
  }, [imageWidth, imageHeight, aspect]);

  const measure = useCallback(() => {
    const el = imgRef.current;
    if (el && el.clientWidth > 0) setDisplayScale(el.clientWidth / imageWidth);
  }, [imageWidth]);

  useLayoutEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  // Escape to close.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const clampMove = useCallback(
    (x: number, y: number, w: number, h: number): CropRect => ({
      x: Math.min(Math.max(0, x), imageWidth - w),
      y: Math.min(Math.max(0, y), imageHeight - h),
      w,
      h,
    }),
    [imageWidth, imageHeight],
  );

  const resizeFrom = useCallback(
    (corner: Corner, orig: CropRect, natX: number, natY: number): CropRect => {
      // The opposite corner stays fixed; signs say which way the box grows.
      const anchorX =
        corner === "nw" || corner === "sw" ? orig.x + orig.w : orig.x;
      const anchorY =
        corner === "nw" || corner === "ne" ? orig.y + orig.h : orig.y;
      const signX = corner === "ne" || corner === "se" ? 1 : -1;
      const signY = corner === "sw" || corner === "se" ? 1 : -1;

      const px = Math.min(Math.max(0, natX), imageWidth);
      const py = Math.min(Math.max(0, natY), imageHeight);

      const availW = signX > 0 ? imageWidth - anchorX : anchorX;
      const availH = signY > 0 ? imageHeight - anchorY : anchorY;
      const dx = signX > 0 ? px - anchorX : anchorX - px;
      const dy = signY > 0 ? py - anchorY : anchorY - py;

      let w = Math.max(dx, dy * aspect); // follow the dominant axis
      w = Math.min(w, availW, availH * aspect);
      w = Math.max(w, MIN_SIZE);
      const h = w / aspect;

      const x = signX > 0 ? anchorX : anchorX - w;
      const y = signY > 0 ? anchorY : anchorY - h;
      return { x, y, w, h };
    },
    [imageWidth, imageHeight, aspect],
  );

  // Global pointer handlers active during a drag.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      const el = imgRef.current;
      if (!drag || !el) return;
      const rect = el.getBoundingClientRect();
      const scale = displayScale || 1;
      if (drag.mode === "move") {
        const dx = (e.clientX - drag.startX) / scale;
        const dy = (e.clientY - drag.startY) / scale;
        setCrop(
          clampMove(
            drag.orig.x + dx,
            drag.orig.y + dy,
            drag.orig.w,
            drag.orig.h,
          ),
        );
      } else {
        const natX = (e.clientX - rect.left) / scale;
        const natY = (e.clientY - rect.top) / scale;
        setCrop(resizeFrom(drag.corner, drag.orig, natX, natY));
      }
    };
    const onUp = () => {
      dragRef.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [displayScale, clampMove, resizeFrom]);

  const startMove = (e: React.PointerEvent) => {
    e.preventDefault();
    dragRef.current = {
      mode: "move",
      startX: e.clientX,
      startY: e.clientY,
      orig: crop,
    };
  };

  const startResize = (corner: Corner) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = { mode: "resize", corner, orig: crop };
  };

  const box = {
    left: crop.x * displayScale,
    top: crop.y * displayScale,
    width: crop.w * displayScale,
    height: crop.h * displayScale,
  };

  const handle =
    "absolute size-4 rounded-full border-2 border-primary bg-white shadow";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onCancel}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E0DED9] px-6 py-4">
          <span className="font-display font-black text-slate-dark">
            Select the area to export{title ? ` — ${title}` : ""}
          </span>
          <button
            className="flex size-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-gray-100 hover:text-slate-dark"
            onClick={onCancel}
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <div className="flex flex-1 items-center justify-center overflow-auto p-6">
          <div className="relative inline-block select-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Paint by numbers preview"
              className="block max-h-[55vh] w-auto max-w-full"
              draggable={false}
              onLoad={measure}
            />
            <div
              className="absolute cursor-move border-2 border-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]"
              style={box}
              onPointerDown={startMove}
            >
              <span
                className={`${handle} -left-2 -top-2 cursor-nwse-resize`}
                onPointerDown={startResize("nw")}
              />
              <span
                className={`${handle} -right-2 -top-2 cursor-nesw-resize`}
                onPointerDown={startResize("ne")}
              />
              <span
                className={`${handle} -bottom-2 -left-2 cursor-nesw-resize`}
                onPointerDown={startResize("sw")}
              />
              <span
                className={`${handle} -bottom-2 -right-2 cursor-nwse-resize`}
                onPointerDown={startResize("se")}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-[#E0DED9] px-6 py-4">
          <button className={btnSecondary} onClick={onCancel}>
            Cancel
          </button>
          <button
            className={btnPrimary}
            onClick={() =>
              onConfirm({
                x: Math.round(crop.x),
                y: Math.round(crop.y),
                w: Math.round(crop.w),
                h: Math.round(crop.h),
              })
            }
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
