"use client";

import { btnPrimary, btnSecondary } from "./pbnStyles";

interface ProcessSaveButtonsProps {
  hasOutput: boolean;
  saving: boolean;
  savedId: string | null;
  saveError: string | null;
  onSave: () => void;
  isProcessing: boolean;
  onProcess: () => void;
  onCancel: () => void;
}

/**
 * Botones de acción del generador: "Generate" (procesar) y "Save to my
 * account", junto con los mensajes de estado del guardado.
 */
export default function ProcessSaveButtons({
  hasOutput,
  saving,
  savedId,
  saveError,
  onSave,
  isProcessing,
  onProcess,
  onCancel,
}: ProcessSaveButtonsProps) {
  return (
    <>
      <div className="flex gap-4 mb-4">
        <div className="flex items-center w-full gap-2">
          <button
            className={`${btnPrimary} w-full`}
            onClick={onProcess}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="material-symbols-outlined animate-spin">
                  progress_activity
                </span>
                Processing...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">check_circle</span>
                Generate
              </>
            )}
          </button>
          {isProcessing && (
            <button className={`${btnSecondary} w-full`} onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
        {hasOutput && !isProcessing && (
          <button
            type="button"
            className={`${btnSecondary} w-full`}
            onClick={onSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="material-symbols-outlined animate-spin">
                  progress_activity
                </span>
                Saving...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">
                  {savedId ? "check_circle" : "bookmark_add"}
                </span>
                {savedId ? "Save project" : "Save to my account"}
              </>
            )}
          </button>
        )}
      </div>
      {savedId && (
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-body text-background-dark">
            Saved to your library.{" "}
            <a href="/user/pbn" className="font-semibold underline">
              View my Paint by Numbers
            </a>
          </p>
        </div>
      )}
      {saveError && (
        <p className="font-body text-sm text-red-600">{saveError}</p>
      )}
    </>
  );
}
