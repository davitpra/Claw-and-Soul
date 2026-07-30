import { useEffect, useState } from "react";
import { adminApi, AdminStyle } from "@/entities/admin/api";

/**
 * Carga, estado y acciones de la lista de estilos del admin.
 *
 * El borrado es permanente y arrastra imágenes y generaciones, así que pasa por
 * un target explícito (`deletingTarget`) más una confirmación extra
 * (`forceConfirm`) cuando el estilo tiene generaciones asociadas.
 */
export function useStylesList() {
  const [styles, setStyles] = useState<AdminStyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deletingTarget, setDeletingTarget] = useState<AdminStyle | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [forceConfirm, setForceConfirm] = useState(false);

  // Las generaciones del estilo que está por borrarse: decide si hace falta la
  // confirmación extra y cuántas se pierden.
  const generationCount = deletingTarget?._count?.generations ?? 0;

  const load = () => {
    setLoading(true);
    adminApi.styles
      .list()
      .then(setStyles)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const closeDeleteModal = () => {
    if (deleting) return;
    setDeletingTarget(null);
    setForceConfirm(false);
  };

  const handleToggle = async (style: AdminStyle) => {
    setToggling(style.id);
    try {
      if (style.isActive) {
        await adminApi.styles.deactivate(style.id);
      } else {
        await adminApi.styles.update(style.id, { isActive: true });
      }
      load();
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingTarget) return;
    setDeleting(true);
    try {
      await adminApi.styles.delete(deletingTarget.id, generationCount > 0);
      setDeletingTarget(null);
      setForceConfirm(false);
      load();
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  return {
    // data
    styles,
    generationCount,
    // status
    loading,
    error,
    toggling,
    deletingTarget,
    deleting,
    forceConfirm,
    // setters
    setError,
    setDeletingTarget,
    setForceConfirm,
    // actions
    closeDeleteModal,
    handleToggle,
    handleDelete,
  };
}
