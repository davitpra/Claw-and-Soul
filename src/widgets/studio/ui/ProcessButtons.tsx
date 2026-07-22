"use client";

import { btnPrimary, btnSecondary } from "@/features/pbn-studio/ui/pbnStyles";

interface ProcessButtonsProps {
  isProcessing: boolean;
  hasImage: boolean;
  onProcess: () => void;
  onCancel: () => void;
}

/**
 * Botones de acción del generador: "Generate" (procesar)
 */
export default function ProcessButtons({
  isProcessing,
  hasImage,
  onProcess,
  onCancel,
}: ProcessButtonsProps) {
  return (
    <>
      <div className="flex gap-4">
        <div className="flex items-center w-full gap-2">
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
        </div>
      </div>
    </>
  );
}
