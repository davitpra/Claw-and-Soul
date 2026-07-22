// Grupo de filtros con su heading. `break-inside-avoid` evita que se parta entre
// las dos columnas del modal; el `mb-8` hace de separación vertical.
export function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="break-inside-avoid mb-8">
      <h3 className="font-display font-black text-slate-dark text-sm uppercase tracking-widest mb-3">
        {title}
      </h3>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}
