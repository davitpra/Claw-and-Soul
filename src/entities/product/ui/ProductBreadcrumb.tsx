import Link from "next/link";
import { ShopifyProduct } from "@/lib/shopify";

interface ProductBreadcrumbProps {
  product: ShopifyProduct;
}

interface Crumb {
  label: string;
  href?: string;
}

export default function ProductBreadcrumb({ product }: ProductBreadcrumbProps) {
  // La primera colección con handle es la que sirve como categoría; si el
  // producto no está en ninguna, el rastro queda en Home › Catalog › título.
  const collection = product.collections?.edges?.find(
    (edge) => edge.node.handle,
  )?.node;

  const crumbs: Crumb[] = [
    { label: "Home", href: "/" },
    { label: "Catalog", href: "/catalog" },
    ...(collection
      ? [
          {
            label: collection.title,
            href: `/catalog?collection=${collection.handle}`,
          },
        ]
      : []),
    { label: product.title },
  ];

  return (
    <nav aria-label="breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 font-body text-sm">
        {crumbs.map((crumb, i) => (
          <li key={crumb.label} className="flex items-center gap-1.5">
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="text-text-muted transition-all hover:text-primary"
              >
                {crumb.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-bold text-text-main">
                {crumb.label}
              </span>
            )}
            {i < crumbs.length - 1 && (
              <span
                aria-hidden="true"
                className="material-symbols-outlined text-[16px] text-text-muted/60"
              >
                chevron_right
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
