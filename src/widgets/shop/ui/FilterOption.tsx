// Fila de checkbox del sidebar: label a la izquierda, conteo de resultados a la derecha.
export function FilterOption({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group/option py-1.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 shrink-0 rounded border-[#E0DED9] accent-primary"
      />
      <span
        className={`flex-1 text-sm transition-all ${
          checked
            ? "text-slate-dark font-bold"
            : "text-slate-dark/70 group-hover/option:text-slate-dark"
        }`}
      >
        {label}
      </span>
      <span className="text-xs text-text-muted tabular-nums">{count}</span>
    </label>
  );
}
