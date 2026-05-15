interface AccordionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  summaryClassName?: string;
  titleClassName?: string;
  contentClassName?: string;
  iconClassName?: string;
}

export default function Accordion({
  title,
  children,
  className = "",
  summaryClassName = "",
  titleClassName = "",
  contentClassName = "",
  iconClassName = "",
}: AccordionProps) {
  return (
    <details className={`group ${className}`}>
      <summary
        className={`flex cursor-pointer items-center justify-between list-none [&::-webkit-details-marker]:hidden ${summaryClassName}`}
      >
        <span className={titleClassName}>{title}</span>
        <span
          className={`material-symbols-outlined transition-transform duration-300 group-open:rotate-180 ${iconClassName}`}
        >
          expand_more
        </span>
      </summary>
      <div className={contentClassName}>{children}</div>
    </details>
  );
}
