import { useCallback, useEffect, useRef, useState } from "react";
import { EXAMPLE_IMAGE } from "./constants";

/**
 * Owns the input canvas and the ways an image gets onto it: the default example,
 * clipboard paste and the file picker. Keeps a pristine snapshot of the loaded
 * image in `originalImageRef` because the input canvas is overwritten in-place by
 * the processing pipeline (k-means) and the before/after comparator needs the
 * untouched original.
 */
export interface ImageInputOptions {
  /**
   * When `initialUrl` fails to load, fall back to the built-in example so the
   * studio is never empty. The admin opts out: silently swapping an order's
   * artwork for the sample cat would be worse than an empty canvas, because the
   * result gets saved back onto the order item.
   */
  fallbackToExample?: boolean;
}

export function useImageInput(
  log: (msg: string) => void,
  initialUrl?: string | null,
  { fallbackToExample = true }: ImageInputOptions = {},
) {
  const inputCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalImageRef = useRef<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  // data URL of the currently loaded image, exposed as state so the UI can
  // render a preview thumbnail (originalImageRef is a ref and won't re-render)
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const drawImageToInput = useCallback((img: HTMLImageElement) => {
    const c = inputCanvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    c.width = img.naturalWidth || img.width;
    c.height = img.naturalHeight || img.height;
    ctx.drawImage(img, 0, 0);
    // snapshot the pristine image before any processing overwrites the canvas
    const dataUrl = c.toDataURL();
    originalImageRef.current = dataUrl;
    setImageSrc(dataUrl);
  }, []);

  const loadExample = useCallback(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => drawImageToInput(img);
    img.onerror = () => log("Unable to load example image");
    img.src = EXAMPLE_IMAGE;
  }, [drawImageToInput, log]);

  // Carga una imagen remota (p.ej. el resultUrl de una generación al llegar desde
  // "Enviar a PBN"). crossOrigin para poder leer el canvas después.
  const loadFromUrl = useCallback(
    (url: string) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => drawImageToInput(img);
      img.onerror = () => {
        if (fallbackToExample) {
          log("Unable to load image, using example instead");
          loadExample();
        } else {
          log("Unable to load image");
        }
      };
      img.src = url;
    },
    [drawImageToInput, log, loadExample, fallbackToExample],
  );

  // load the initial image (remote URL if provided, else the example) & wire up
  // clipboard paste
  useEffect(() => {
    if (initialUrl) loadFromUrl(initialUrl);
    else loadExample();

    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          if (!blob) continue;
          const url = URL.createObjectURL(blob);
          const img = new Image();
          img.onload = () => {
            drawImageToInput(img);
            URL.revokeObjectURL(url);
          };
          img.src = url;
          e.preventDefault();
          return;
        }
      }
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [initialUrl, loadExample, loadFromUrl, drawImageToInput]);

  const loadFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        log("Please choose an image file");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => drawImageToInput(img);
        img.onerror = () => alert("Unable to load image");
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    },
    [drawImageToInput, log],
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      loadFile(files[0]);
    },
    [loadFile],
  );

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) loadFile(file);
    },
    [loadFile],
  );

  return {
    inputCanvasRef,
    fileInputRef,
    originalImageRef,
    onFileChange,
    imageSrc,
    isDragging,
    openFilePicker,
    loadFromUrl,
    onDragOver,
    onDragLeave,
    onDrop,
  };
}
