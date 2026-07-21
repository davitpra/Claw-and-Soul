"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RGB } from "@/lib/pbn/common";
import { extractDominantColors, sampleColorAt } from "@/lib/pbn/palettePicker";
import { InputOptions, Segmented } from "@/features/pbn-studio";
import { btnSecondary, fieldLabel } from "@/features/pbn-studio/ui/pbnStyles";

const rgbCss = (c: RGB) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
const rgbKey = (c: RGB) => `${c[0]},${c[1]},${c[2]}`;
const sameColor = (a: RGB, b: RGB) =>
  a[0] === b[0] && a[1] === b[1] && a[2] === b[2];

// Loupe magnification and the size of the source region it magnifies.
const LOUPE_SIZE = 120;
const LOUPE_SRC = 15; // odd, so there's a centered pixel under the crosshair

/** A single clickable color chip; shows a check when active. */
function Swatch({
  color,
  active,
  onClick,
  onRemove,
  title,
}: {
  color: RGB;
  active?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  title?: string;
}) {
  return (
    <span className="relative inline-block">
      <button
        type="button"
        className={`flex size-9 items-center justify-center rounded-md border text-xs font-bold text-white transition-transform ${
          active
            ? "border-primary ring-2 ring-primary ring-offset-1"
            : "border-black/10 hover:scale-105"
        }`}
        style={{ background: rgbCss(color) }}
        onClick={onClick}
        title={title ?? rgbCss(color)}
        aria-label={title ?? rgbCss(color)}
        aria-pressed={active}
      >
        {active && <span className="mix-blend-difference">✓</span>}
      </button>
      {onRemove && (
        <button
          type="button"
          className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-slate-dark text-[10px] font-bold leading-none text-white shadow hover:bg-red-600"
          onClick={onRemove}
          aria-label={`Remove ${rgbCss(color)}`}
        >
          ×
        </button>
      )}
    </span>
  );
}

export default function PalettePicker({
  opts,
  imageSrc,
}: {
  opts: InputOptions;
  imageSrc: string | null;
}) {
  const [suggested, setSuggested] = useState<RGB[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const { setAllPickedColors } = opts;

  // Extract dominant colors whenever the source image changes, and select them
  // all by default so the user starts with the full suggested palette.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!imageSrc) {
        if (!cancelled) {
          setSuggested([]);
          setAllPickedColors([]);
        }
        return;
      }
      try {
        const colors = await extractDominantColors(imageSrc, 12);
        if (!cancelled) {
          setSuggested(colors);
          setAllPickedColors(colors);
        }
      } catch {
        if (!cancelled) {
          setSuggested([]);
          setAllPickedColors([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [imageSrc, setAllPickedColors]);

  const isPicked = useCallback(
    (c: RGB) => opts.pickedColors.some((p) => sameColor(p, c)),
    [opts.pickedColors],
  );

  // suggested colors the user hasn't picked yet — the only ones worth offering.
  const unpicked = suggested.filter((c) => !isPicked(c));

  return (
    <div className="flex flex-col gap-3">
      {opts.pickedColors.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className={fieldLabel}>Your colors</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {opts.pickedColors.map((c) => (
              <Swatch
                key={rgbKey(c)}
                color={c}
                onRemove={() => opts.removePickedColor(c)}
              />
            ))}
            <button
              type="button"
              className="ml-1 text-xs font-semibold text-primary hover:text-primary-dark"
              onClick={opts.clearPickedColors}
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {unpicked.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className={fieldLabel}>Choose your palette</span>
          <div className="flex flex-wrap gap-1.5">
            {unpicked.map((c) => (
              <Swatch
                key={rgbKey(c)}
                color={c}
                onClick={() => opts.togglePickedColor(c)}
              />
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        className={`${btnSecondary} w-full mt-2`}
        onClick={() => setPickerOpen(true)}
        disabled={!imageSrc}
      >
        <span className="material-symbols-outlined text-[18px]">colorize</span>
        Pick from photo
      </button>
      <span className="text-xs text-text-muted">
        Pick the colors your paint-by-number should use. Leave empty to let the
        app choose them automatically.
      </span>

      {opts.pickedColors.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className={fieldLabel}>How to use them</span>
          <Segmented
            fullWidth
            name="palettemode"
            options={[
              { value: "exact", label: "Only my colors" },
              { value: "complement", label: "My colors + auto" },
            ]}
            value={opts.paletteMode}
            onChange={opts.setPaletteMode}
          />
        </div>
      )}

      {pickerOpen && imageSrc && (
        <EyedropperModal
          imageSrc={imageSrc}
          pickedColors={opts.pickedColors}
          onPick={opts.addPickedColor}
          onRemove={opts.removePickedColor}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}

function EyedropperModal({
  imageSrc,
  pickedColors,
  onPick,
  onRemove,
  onClose,
}: {
  imageSrc: string;
  pickedColors: RGB[];
  onPick: (c: RGB) => void;
  onRemove: (c: RGB) => void;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loupeRef = useRef<HTMLCanvasElement>(null);
  const [hoverColor, setHoverColor] = useState<RGB | null>(null);
  const [loupe, setLoupe] = useState<{ x: number; y: number } | null>(null);

  // Draw the pristine image into the canvas at its natural resolution; CSS
  // scales it down for display while sampling stays pixel-accurate.
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      canvas.getContext("2d")?.drawImage(img, 0, 0);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Convert a pointer event to canvas pixel coordinates.
  const toCanvasXY = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    return {
      x,
      y,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
  };

  const onMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y, offsetX, offsetY } = toCanvasXY(e);
    setHoverColor(sampleColorAt(canvas, x, y));
    setLoupe({ x: offsetX, y: offsetY });

    // render the magnified region into the loupe canvas
    const loupeCanvas = loupeRef.current;
    if (loupeCanvas) {
      const lctx = loupeCanvas.getContext("2d");
      if (lctx) {
        lctx.imageSmoothingEnabled = false;
        lctx.clearRect(0, 0, LOUPE_SIZE, LOUPE_SIZE);
        const sx = Math.round(x) - (LOUPE_SRC - 1) / 2;
        const sy = Math.round(y) - (LOUPE_SRC - 1) / 2;
        lctx.drawImage(
          canvas,
          sx,
          sy,
          LOUPE_SRC,
          LOUPE_SRC,
          0,
          0,
          LOUPE_SIZE,
          LOUPE_SIZE,
        );
        // crosshair over the centered pixel
        const px = LOUPE_SIZE / 2;
        const cell = LOUPE_SIZE / LOUPE_SRC;
        lctx.strokeStyle = "rgba(0,0,0,0.9)";
        lctx.lineWidth = 1;
        lctx.strokeRect(px - cell / 2, px - cell / 2, cell, cell);
        lctx.strokeStyle = "rgba(255,255,255,0.9)";
        lctx.strokeRect(
          px - cell / 2 - 1,
          px - cell / 2 - 1,
          cell + 2,
          cell + 2,
        );
      }
    }
  };

  const onLeave = () => setLoupe(null);

  const onClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = toCanvasXY(e);
    onPick(sampleColorAt(canvas, x, y));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E0DED9] px-4 py-3">
          <span className="font-display font-black text-slate-dark">
            Pick colors from your photo
          </span>
          <button
            className="flex size-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-gray-100 hover:text-slate-dark"
            onClick={onClose}
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <p className="px-4 pt-3 font-body text-sm text-text-muted">
          Click anywhere on the photo to add that color to your palette. The
          swatches detected automatically appear in the settings panel.
        </p>
        <div className="flex justify-center overflow-auto p-4">
          <div className="relative inline-block">
            <canvas
              ref={canvasRef}
              className="block h-auto max-h-[55vh] w-auto max-w-full cursor-crosshair rounded-lg"
              onMouseMove={onMove}
              onMouseLeave={onLeave}
              onClick={onClick}
            />
            {loupe && (
              <div
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-[130%] overflow-hidden rounded-full border-2 border-white shadow-lg"
                style={{
                  left: loupe.x,
                  top: loupe.y,
                  width: LOUPE_SIZE,
                  height: LOUPE_SIZE,
                }}
              >
                <canvas
                  ref={loupeRef}
                  width={LOUPE_SIZE}
                  height={LOUPE_SIZE}
                  className="block"
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-[#E0DED9] px-4 py-3">
          <div className="flex items-center gap-2">
            <span
              className="inline-block size-8 rounded-md border border-black/10"
              style={{
                background: hoverColor ? rgbCss(hoverColor) : "transparent",
              }}
            />
            <span className="font-body text-sm text-slate-dark">
              {hoverColor
                ? `rgb(${hoverColor[0]}, ${hoverColor[1]}, ${hoverColor[2]})`
                : "Hover over the photo"}
            </span>
          </div>
          {pickedColors.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className={fieldLabel}>Your colors</span>
              <div className="flex flex-wrap gap-1.5">
                {pickedColors.map((c) => (
                  <Swatch
                    key={rgbKey(c)}
                    color={c}
                    onRemove={() => onRemove(c)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
