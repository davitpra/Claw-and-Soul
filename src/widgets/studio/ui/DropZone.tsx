// Drop zone hero: fills the viewport height until an image is loaded. The
// hidden file <input> lives in <Studio>, so we just trigger it via
// openFilePicker (avoids a duplicate ref). Drag/drop handlers come from
// useImageInput; this component is purely presentational.
export default function DropZone({
  isDragging,
  openFilePicker,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  isDragging: boolean;
  openFilePicker: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  return (
    <button
      type="button"
      onClick={openFilePicker}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`flex h-full min-h-[80vh] w-full flex-col items-center justify-center gap-4 rounded-xl border-4 border-dashed p-8 text-center transition-all ${
        isDragging
          ? "border-primary bg-primary/5 scale-[1.005]"
          : "border-[#E0DED9] bg-white hover:border-primary hover:bg-primary/5"
      }`}
    >
      <span className="material-symbols-outlined text-6xl text-primary">
        upload_file
      </span>
      <span className="font-display text-2xl font-black text-text-main sm:text-3xl">
        Drag and drop your image
      </span>
      <span className="font-body text-sm text-text-muted">
        or <strong>click to browse</strong> · paste from your clipboard (Ctrl+V)
      </span>
      <span className="font-body text-xs text-text-muted">PNG, JPG or GIF</span>
    </button>
  );
}
