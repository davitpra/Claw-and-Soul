import { ExportControls as ExportControlsState } from "../model/useExport";
import { btnPrimary, btnSecondary, fieldInput, fieldLabel } from "./pbnStyles";

interface ExportControlsProps {
  exp: ExportControlsState;
  hasOutput: boolean;
}

export default function ExportControls({ exp, hasOutput }: ExportControlsProps) {
  if (!hasOutput) return null;
  return (
    <div className="mt-4 flex flex-col gap-5">
      {/* Direct downloads */}
      <div className="flex flex-wrap gap-3">
        <button className={btnPrimary} onClick={exp.handleDownloadSVG}>
          <span className="material-symbols-outlined text-[18px]">download</span>
          Download SVG
        </button>
        <button className={btnPrimary} onClick={exp.handleDownloadPNG}>
          <span className="material-symbols-outlined text-[18px]">download</span>
          Download PNG
        </button>
        <button className={btnSecondary} onClick={exp.handleDownloadPalette}>
          <span className="material-symbols-outlined text-[18px]">palette</span>
          Download palette
        </button>
      </div>

      {/* PDF at exact physical size */}
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5">
          <span className={fieldLabel}>Unit</span>
          <select
            className={fieldInput}
            value={exp.pdfUnit}
            onChange={(e) => exp.onPdfUnitChange(e.target.value as "cm" | "in")}
          >
            <option value="cm">cm</option>
            <option value="in">inches</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={fieldLabel}>Width ({exp.pdfUnit})</span>
          <input
            type="number"
            className={fieldInput}
            min={1}
            step={0.1}
            value={exp.pdfWidth}
            onChange={(e) => exp.onPdfWidthChange(parseFloat(e.target.value) || 0)}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={fieldLabel}>Height ({exp.pdfUnit})</span>
          <input
            type="number"
            className={fieldInput}
            min={1}
            step={0.1}
            value={exp.pdfHeight}
            onChange={(e) =>
              exp.onPdfHeightChange(parseFloat(e.target.value) || 0)
            }
          />
        </label>
        <button className={btnSecondary} onClick={exp.handleDownloadPDF}>
          <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
          Download PDF
        </button>
      </div>

      {/* PDF cropped to a standard paper size */}
      <div className="flex flex-wrap items-end gap-3">
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
        <button
          className={btnSecondary}
          onClick={() => void exp.handleDownloadPDFStandard()}
        >
          <span className="material-symbols-outlined text-[18px]">crop</span>
          Select area &amp; download PDF
        </button>
      </div>
    </div>
  );
}
