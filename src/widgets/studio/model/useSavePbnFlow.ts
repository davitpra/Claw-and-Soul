import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { RGB } from "@/lib/pbn/common";
import type { MixRecipe } from "@/lib/pbn/paintMixing";
import { useAuth } from "@/context/AuthContext";
import { useSavePbn } from "./useSavePbn";
import type {
  InputOptions,
  RenderOptions,
  ExportControls,
} from "@/features/pbn-studio";

/** Reference to a persisted PBN, enough to reuse it in the purchase flow. */
export interface SavedPbnRef {
  id: string;
  previewUrl?: string | null;
}

interface UseSavePbnFlowArgs {
  svgContainerRef: React.RefObject<HTMLDivElement | null>;
  guideRef: React.RefObject<HTMLDivElement | null>;
  originalImageRef: React.RefObject<string | null>;
  compareImgs: { original: string; processed: string } | null;
  palette: RGB[];
  recipes: MixRecipe[] | null;
  generationId: string | null;
  inputOptions: InputOptions;
  renderOptions: RenderOptions;
  exp: ExportControls;
  /**
   * PBN ya persistido con el que se abrió el estudio (`/studio?pbnId=…`). Hace
   * dos cosas: marca el resultado en pantalla como ya guardado (la card de
   * compra lo reutiliza en vez de duplicarlo) y fija la fila que los guardados
   * de esta sesión van a actualizar. Lo primero caduca al editar (`markDirty`);
   * lo segundo no.
   */
  initialSavedPbn?: SavedPbnRef | null;
}

/**
 * Assembles the JSON-serializable settings snapshot that lets the backend
 * reproduce this PBN (input pipeline + SVG render options + paper size).
 */
function buildPbnConfig(
  inputOptions: InputOptions,
  renderOptions: RenderOptions,
  exp: ExportControls,
) {
  return {
    input: inputOptions.buildSettings(),
    render: {
      showLabels: renderOptions.showLabels,
      fillFacets: renderOptions.fillFacets,
      showBorders: renderOptions.showBorders,
      labelFontSize: renderOptions.labelFontSize,
      labelFontColor: renderOptions.labelFontColor,
      fillOpacity: renderOptions.fillOpacity,
    },
    paper: {
      format: exp.paperFormat,
      orientation: exp.paperOrientation,
      width: exp.pdfWidth,
      height: exp.pdfHeight,
      unit: exp.pdfUnit,
    },
  };
}

/**
 * Orchestrates "save to my account" for the studio: gathers the rendered
 * artifacts + config, persists them via {@link useSavePbn}, and keeps a
 * reference so the purchase card can reuse the saved PBN instead of re-saving.
 * Una vez hay fila (porque el estudio se abrió sobre un PBN o porque ya se
 * guardó una vez), los guardados siguientes la reemplazan en vez de acumular
 * copias de la misma obra.
 * Redirects to login (preserving the return path) when there's no session.
 */
export function useSavePbnFlow({
  svgContainerRef,
  guideRef,
  originalImageRef,
  compareImgs,
  palette,
  recipes,
  generationId,
  inputOptions,
  renderOptions,
  exp,
  initialSavedPbn = null,
}: UseSavePbnFlowArgs) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const {
    save,
    saving,
    savedId,
    error: saveError,
    limitReached,
  } = useSavePbn();
  const [savedPbn, setSavedPbn] = useState<SavedPbnRef | null>(initialSavedPbn);
  // Fila que esta sesión del estudio actualiza. A diferencia de `savedPbn`, no
  // se pierde al editar: sin ella cada guardado tras un cambio crearía una copia
  // de la misma obra (el bug de los PBN duplicados en la galería).
  const [targetPbnId, setTargetPbnId] = useState<string | null>(
    initialSavedPbn?.id ?? null,
  );

  const handleSave = useCallback(async (): Promise<SavedPbnRef | null> => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/studio");
      return null;
    }
    const saved = await save({
      svgContainerRef,
      guideRef,
      previewDataUrl: compareImgs?.processed,
      sourceDataUrl: originalImageRef.current,
      palette,
      recipes,
      generationId,
      pbnId: targetPbnId,
      config: buildPbnConfig(inputOptions, renderOptions, exp),
    });
    if (!saved) return null;
    const savedRef: SavedPbnRef = {
      id: saved.id,
      previewUrl: (saved.previewUrl as string | undefined) ?? null,
    };
    setSavedPbn(savedRef);
    // El id de la respuesta manda: si el PBN estaba comprado el backend forkeó
    // una copia, y los siguientes guardados deben ir contra ella.
    setTargetPbnId(saved.id);
    return savedRef;
  }, [
    isAuthenticated,
    router,
    save,
    svgContainerRef,
    guideRef,
    compareImgs,
    originalImageRef,
    palette,
    recipes,
    generationId,
    targetPbnId,
    inputOptions,
    renderOptions,
    exp,
  ]);

  // Resolve a saved PBN for the purchase card: reuse the existing one, or save
  // on demand (handleSave redirects to login when there's no session).
  const ensureSaved = useCallback(
    () => (savedPbn ? Promise.resolve(savedPbn) : handleSave()),
    [savedPbn, handleSave],
  );

  // Lo que hay en pantalla dejó de coincidir con lo persistido (se reprocesó o
  // cambió una opción de render): reaparece el botón de guardar. `targetPbnId`
  // sobrevive, así que ese guardado actualiza la obra en vez de clonarla.
  const markDirty = useCallback(() => setSavedPbn(null), []);

  return {
    handleSave,
    ensureSaved,
    markDirty,
    saving,
    savedId,
    saveError,
    /** El guardado falló porque la cuenta llegó al tope de obras guardadas. */
    limitReached,
    savedPbn,
    /** Hay una fila que este guardado va a reemplazar (copy del botón). */
    isUpdate: targetPbnId !== null,
  };
}
