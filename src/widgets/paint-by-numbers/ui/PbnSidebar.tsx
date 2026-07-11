"use client";

import type { useImageInput } from "../model/useImageInput";
import type { InputOptions } from "../model/useInputOptions";
import type { ExportControls as ExportControlsState } from "../model/useExport";
import { card, stepTitle } from "./pbnStyles";
import InputOptionsPane from "./InputOptionsPane";
import ProcessButtons from "./ProcessButtons";
import PbnImageStep from "./PbnImageStep";

interface PbnSidebarProps {
  imageInput: ReturnType<typeof useImageInput>;
  inputOptions: InputOptions;
  exp: ExportControlsState;
  hasOutput: boolean;
  isProcessing: boolean;
  onProcess: () => void;
  onCancel: () => void;
}

/**
 * The numbered step cards (upload, image settings, export) that make up the
 * Paint by Numbers sidebar. Extracted so a single mounted instance can be placed
 * either inline in the desktop grid column or inside the mobile bottom sheet —
 * mounting it twice would duplicate the file <input> and its ref.
 */
export default function PbnSidebar({
  imageInput,
  inputOptions,
  isProcessing,
  onProcess,
  onCancel,
}: PbnSidebarProps) {
  const { imageSrc } = imageInput;

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Step 1: image — thumbnail on the right, click to replace */}
      <PbnImageStep imageInput={imageInput} />

      {/* Step 2: Image settings */}
      <section className={card}>
        <h3 className={`${stepTitle}`}>Image settings</h3>
        <InputOptionsPane opts={inputOptions} imageSrc={imageSrc} />
      </section>
      {/* Buttons for process*/}
      <ProcessButtons
        isProcessing={isProcessing}
        hasImage={!!imageSrc}
        onProcess={onProcess}
        onCancel={onCancel}
      />
    </div>
  );
}
