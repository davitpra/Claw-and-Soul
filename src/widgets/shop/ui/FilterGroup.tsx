// Grupo de filtros con su heading.
export function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="font-display font-black text-slate-dark text-sm uppercase tracking-widest mb-3">
        {title}
      </h3>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}
