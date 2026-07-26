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
   * PBN ya persistido con el que se abrió el estudio (`/studio?pbnId=…`). Siembra
   * la referencia para que la card de compra reutilice ese PBN en vez de guardar
   * un duplicado idéntico. Deja de valer en cuanto se reprocesa: ver `resetSaved`.
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
  const { save, saving, savedId, error: saveError } = useSavePbn();
  const [savedPbn, setSavedPbn] = useState<SavedPbnRef | null>(initialSavedPbn);

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
      config: buildPbnConfig(inputOptions, renderOptions, exp),
    });
    if (!saved) return null;
    const savedRef: SavedPbnRef = {
      id: saved.id,
      previewUrl: (saved.previewUrl as string | undefined) ?? null,
    };
    setSavedPbn(savedRef);
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

  // Tras reprocesar, el resultado en pantalla ya no es el PBN persistido: olvida
  // la referencia para que el siguiente guardado (o compra) cree uno nuevo.
  const resetSaved = useCallback(() => setSavedPbn(null), []);

  return {
    handleSave,
    ensureSaved,
    resetSaved,
    saving,
    savedId,
    saveError,
    savedPbn,
  };
}
