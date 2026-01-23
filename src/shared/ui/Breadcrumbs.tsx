import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex flex-wrap gap-2 items-center text-sm">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.href ? (
            <Link
              className="text-text-main/60 hover:text-primary transition-colors"
              href={item.href}
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-text-main font-semibold">{item.label}</span>
          )}
          {index < items.length - 1 && (
            <span className="material-symbols-outlined text-[16px] text-text-main/40">
              chevron_right
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

import React from "react";
