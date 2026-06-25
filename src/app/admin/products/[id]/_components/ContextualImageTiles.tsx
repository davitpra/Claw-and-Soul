import { Badge, Spinner } from "@shopify/polaris";
import { DeleteIcon, PlusIcon } from "@shopify/polaris-icons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { AdminProductImage } from "@/entities/admin/api";
import { TYPE_LABEL } from "./contextualImages";

// Miniatura ordenable (drag&drop) de una imagen contextual de la app.
export function SortableImageTile({
  img,
  isPrimary,
  isLoading,
  onView,
  onDelete,
}: {
  img: AdminProductImage;
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
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
    border: isPrimary
      ? "2px solid var(--p-color-border-emphasis)"
      : "1px solid var(--p-color-border)",
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
        aria-label="Ver / editar imagen"
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

      <div style={{ position: "absolute", top: 6, left: 6 }}>
        <Badge tone={isPrimary ? "success" : undefined} size="small">
          {isPrimary ? `★ ${TYPE_LABEL[img.type]}` : TYPE_LABEL[img.type]}
        </Badge>
      </div>

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

// Miniatura de la imagen del producto sincronizada desde Shopify (solo lectura).
export function ProductImageTile({
  url,
  alt,
  onClick,
}: {
  url: string;
  alt: string | null;
  onClick: () => void;
}) {
  return (
    <div
      style={{
        position: "relative",
        borderRadius: 8,
        overflow: "hidden",
        border: "1px solid var(--p-color-border)",
        aspectRatio: "1 / 1",
        background: "var(--p-color-bg-surface)",
      }}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label="Ampliar imagen de producto"
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          border: 0,
          padding: 0,
          background: "none",
          cursor: "zoom-in",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={alt ?? ""}
          draggable={false}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </button>
      <div style={{ position: "absolute", top: 6, left: 6 }}>
        <Badge tone="info" size="small">
          Producto
        </Badge>
      </div>
    </div>
  );
}

// Celda de "subir imagen" al final de cada bucket.
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
