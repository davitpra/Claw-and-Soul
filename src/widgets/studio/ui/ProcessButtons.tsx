"use client";

import { btnPrimary, btnSecondary } from "@/features/pbn-studio/ui/pbnStyles";

interface ProcessButtonsProps {
  isProcessing: boolean;
  hasImage: boolean;
  hasOutput: boolean;
  onProcess: () => void;
  onCancel: () => void;
  onDownload: () => void;
}

/**
 * Botones de acción del generador: "Generate" (procesar), "Cancel" mientras se
 * procesa y "Download" una vez hay resultado — un acceso directo a la descarga,
 * que si no sólo se alcanza desde el menú ⋯ del post.
 */
export default function ProcessButtons({
  isProcessing,
  hasImage,
  hasOutput,
  onProcess,
  onCancel,
  onDownload,
}: ProcessButtonsProps) {
  return (
    <>
      <div className="flex gap-4">
        <div className="flex flex-col items-center w-full gap-2">
          <button
            className={`${btnPrimary} w-full`}
            onClick={onProcess}
            disabled={isProcessing || !hasImage}
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
          {/* Nunca convive con "Cancel": ése sólo sale mientras se procesa. */}
          {!isProcessing && hasOutput && (
            <button className={`${btnSecondary} w-full`} onClick={onDownload}>
              <span className="material-symbols-outlined">download</span>
              Download
            </button>
          )}
        </div>
      </div>
    </>
  );
}
