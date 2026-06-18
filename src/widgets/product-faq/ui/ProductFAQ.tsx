"use client";

import Accordion from "@/shared/ui/Accordion";

interface FAQItem {
  q: string;
  a: string;
}

interface ProductFAQProps {
  faqs: FAQItem[];
}

export default function ProductFAQ({ faqs }: ProductFAQProps) {
  return (
    <div className="bg-[#FAF9F6] p-6 md:p-12">
      <h2 className="font-display text-3xl font-black text-slate-dark md:text-4xl text-center mb-16">
        Frequently Asked Questions
      </h2>
      <div className="flex flex-col gap-4 max-w-3xl mx-auto">
        {faqs.map((faq, i) => (
          <Accordion
            key={i}
            title={faq.q}
            className="bg-white rounded-xl shadow-sm"
            summaryClassName="w-full p-5"
            titleClassName="font-bold text-text-main text-lg"
            iconClassName="text-text-main"
            contentClassName="px-5 pb-5 pt-0 text-text-main/80 leading-relaxed font-body"
          >
            {faq.a}
          </Accordion>
        ))}
      </div>
    </div>
  );
}
