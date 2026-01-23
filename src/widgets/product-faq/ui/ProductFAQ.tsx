"use client";

interface FAQItem {
  q: string;
  a: string;
}

interface ProductFAQProps {
  faqs: FAQItem[];
}

export default function ProductFAQ({ faqs }: ProductFAQProps) {
  return (
    <div className="py-12 border-t border-text-main/10">
      <div className="bg-[#FAF9F6] rounded-3xl p-6 md:p-12">
        <h2 className="text-3xl font-bold text-text-main text-center mb-8 font-display">
          Frequently Asked Questions
        </h2>
        <div className="flex flex-col gap-4 max-w-3xl mx-auto">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="group bg-white rounded-xl shadow-sm cursor-pointer"
            >
              <summary className="flex w-full items-center justify-between p-5 list-none">
                <span className="font-bold text-text-main text-lg">
                  {faq.q}
                </span>
                <span className="material-symbols-outlined text-text-main transition-transform duration-300 group-open:rotate-180">
                  expand_more
                </span>
              </summary>
              <div className="px-5 pb-5 pt-0 text-text-main/80 leading-relaxed font-body">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
