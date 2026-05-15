import Accordion from "@/shared/ui/Accordion";

interface ProductAccordionsProps {
  html: string;
}

const panelClassName =
  "rounded-xl border border-[#E0DED9] shadow-sm open:shadow-md transition-all duration-300";
const titleClassName = "font-bold text-text- tracking-widest";
const iconClassName = "text-[20px] text-primary";

export default function ProductAccordions({ html }: ProductAccordionsProps) {
  return (
    <div className="flex flex-col gap-1">
      <Accordion
        title="Description"
        className={panelClassName}
        summaryClassName="px-5 py-4"
        titleClassName={titleClassName}
        iconClassName={iconClassName}
        contentClassName="px-5 pb-5 pt-0"
      >
        <div
          className="font-body text-text-muted leading-relaxed text-base max-w-prose"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </Accordion>
      <Accordion
        title="Shipping"
        className={panelClassName}
        summaryClassName="px-5 py-4"
        titleClassName={titleClassName}
        iconClassName={iconClassName}
        contentClassName="px-5 pb-5 pt-0"
      >
        <span className="font-body text-text-muted leading-relaxed text-base max-w-prose">
          Shipping information goes here.
        </span>
      </Accordion>
    </div>
  );
}
