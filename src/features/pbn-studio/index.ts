/**
 * Paint by Numbers studio — the pipeline layer shared by the two surfaces that
 * expose it: the public studio (`widgets/studio`) and the admin studio
 * (`app/admin/_components/pbn`).
 *
 * Everything here is presentation-agnostic: the hooks that drive `@/lib/pbn`'s
 * algorithms, plus the handful of primitives both UIs already agree on. The two
 * surfaces keep their own `ui/` layers because their layouts genuinely differ
 * (an Instagram-style post vs. numbered step cards) — but they must not fork the
 * pipeline again.
 *
 * The shared Tailwind class constants live in `./ui/pbnStyles` and are imported
 * from there directly: their names (`card`, `btnPrimary`, …) are too generic to
 * re-export through this barrel.
 */

export * from "./model/constants";
export * from "./model/useLog";
export * from "./model/useExport";
export * from "./model/useImageInput";
export * from "./model/useInputOptions";
export * from "./model/usePaintMixing";
export * from "./model/useProcessing";
export * from "./model/useRenderOptions";

export { default as ProgressBar } from "./ui/ProgressBar";
export { HelpTip, Toggle, Segmented } from "./ui/controls";
