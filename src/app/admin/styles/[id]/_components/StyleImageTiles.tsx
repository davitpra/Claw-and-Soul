import { Spinner } from "@shopify/polaris";
import { DeleteIcon, PlusIcon } from "@shopify/polaris-icons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { AdminStyleImage } from "@/entities/admin/api";

// Miniatura ordenable (drag&drop) de la galería de imágenes del estilo.
export function SortableImageTile({
  img,
  isPrimary,
  isLoading,
  onView,
  onDelete,
}: {
  img: AdminStyleImage;
  isPrimary: boolean;
  isLoading: boolean;
  onView: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: img.id });

  const tileStyle: React.CSSProperties = {
    gridColumn: isPrimary ? "span 2" : "span 1",
    gridRow: isPrimary ? "span 2" : "span 1",
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
    border: "1px solid var(--p-color-border)",
    aspectRatio: "1 / 1",
    cursor: "grab",
    background: "var(--p-color-bg-surface)",
  };

  return (
    <div ref={setNodeRef} style={tileStyle} {...attributes} {...listeners}>
      <button
        type="button"
        onClick={onView}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label={`Ver imagen ${img.orderIndex}`}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          border: 0,
          padding: 0,
          background: "none",
          cursor: "pointer",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img.imageUrl}
          alt={img.altImage ?? ""}
          draggable={false}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </button>

      {isLoading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.7)",
          }}
        >
          <Spinner size="small" />
        </div>
      )}

      <button
        type="button"
        aria-label="Eliminar imagen"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onDelete}
        style={{
          position: "absolute",
          top: 6,
          right: 6,
          background: "rgba(255,255,255,0.9)",
          border: "1px solid var(--p-color-border)",
          borderRadius: 6,
          padding: "4px 6px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 0,
        }}
      >
        <DeleteIcon width={16} height={16} />
      </button>
    </div>
  );
}

// Celda de "subir imagen" al final de la galería.
export function UploadTile({
  uploading,
  onClick,
}: {
  uploading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={uploading}
      style={{
        aspectRatio: "1 / 1",
        border: "1px dashed var(--p-color-border)",
        borderRadius: 8,
        background: "var(--p-color-bg-surface-secondary)",
        cursor: uploading ? "default" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: uploading ? 0.6 : 1,
        flexDirection: "column",
        gap: 4,
      }}
    >
      {uploading ? <Spinner size="small" /> : <PlusIcon width={24} height={24} />}
    </button>
  );
}
