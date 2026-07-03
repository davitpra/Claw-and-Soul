import { useCallback, useEffect, useRef, useState } from "react";
import { EXAMPLE_IMAGE } from "./constants";

/**
 * Owns the input canvas and the ways an image gets onto it: the default example,
 * clipboard paste and the file picker. Keeps a pristine snapshot of the loaded
 * image in `originalImageRef` because the input canvas is overwritten in-place by
 * the processing pipeline (k-means) and the before/after comparator needs the
 * untouched original.
 *
 * `initialImageSrc` permite arrancar desde una URL concreta (la imagen generada
 * del item del pedido) en vez del ejemplo por defecto. Se carga con
 * `crossOrigin="anonymous"` para que un origen remoto (Cloudinary) no "taintee" el
 * canvas y el export (`toDataURL`) siga funcionando.
 */
export function useImageInput(
  log: (msg: string) => void,
  initialImageSrc?: string,
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

  // Carga cualquier URL en el canvas de entrada (con CORS habilitado). El ejemplo
  // por defecto y la imagen seedeada usan el mismo camino.
  const loadUrl = useCallback(
    (src: string, errorMsg: string) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => drawImageToInput(img);
      img.onerror = () => log(errorMsg);
      img.src = src;
    },
    [drawImageToInput, log],
  );

  // load the seeded/default image & wire up clipboard paste
  useEffect(() => {
    loadUrl(
      initialImageSrc ?? EXAMPLE_IMAGE,
      initialImageSrc ? "Unable to load image" : "Unable to load example image",
    );

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
  }, [loadUrl, drawImageToInput, initialImageSrc]);

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
    onDragOver,
    onDragLeave,
    onDrop,
  };
}
