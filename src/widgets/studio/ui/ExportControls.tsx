import { ExportControls as ExportControlsState } from "@/features/pbn-studio";
import {
  btnPrimary,
  fieldInput,
  fieldLabel,
} from "@/features/pbn-studio/ui/pbnStyles";

interface ExportControlsProps {
  exp: ExportControlsState;
  hasOutput: boolean;
  onClose?: () => void;
}

export default function ExportControls({
  exp,
  hasOutput,
  onClose,
}: ExportControlsProps) {
  if (!hasOutput) return null;
  return (
    <div className="flex flex-col gap-5">
      {/* PDF cropped to a standard paper size */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1.5">
          <span className={fieldLabel}>Paper size</span>
          <select
            className={fieldInput}
            value={exp.paperFormat}
            onChange={(e) =>
              exp.setPaperFormat(e.target.value as typeof exp.paperFormat)
            }
          >
            <option value="a3">A3</option>
            <option value="a4">A4</option>
            <option value="a5">A5</option>
            <option value="letter">Letter</option>
            <option value="legal">Legal</option>
            <option value="tabloid">Tabloid</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={fieldLabel}>Orientation</span>
          <select
            className={fieldInput}
            value={exp.paperOrientation}
            onChange={(e) =>
              exp.setPaperOrientation(
                e.target.value as typeof exp.paperOrientation,
              )
            }
          >
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={fieldLabel}>Download PDF</span>
          <button
            className={btnPrimary}
            onClick={() =>
              void exp.handleDownloadPDFStandard().finally(() => onClose?.())
            }
          >
            Continue
          </button>
        </label>
      </div>
    </div>
  );
}
