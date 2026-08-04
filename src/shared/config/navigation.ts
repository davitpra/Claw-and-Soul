// Fuente única de la navegación del sitio y de los datos de contacto de la marca.
// Antes vivían duplicados en `Navbar.tsx`, `Footer.tsx` y `contact/page.tsx`, y ya
// habían divergido entre sí. Solo strings: los iconos sociales siguen siendo
// componentes que se importan en el TSX (`shared/ui/SocialIcons`).

export interface NavLink {
  label: string;
  href: string;
}

export interface NavSection {
  title: string;
  links: NavLink[];
}

/** Links principales del header, en el orden en que se muestran. */
export const MAIN_NAV: NavLink[] = [
  { label: "Studio", href: "/studio" },
  { label: "Catalog", href: "/catalog" },
  { label: "Contact", href: "/contact" },
];

/**
 * Columnas del footer. Los links del catálogo llevan `intent`/`format` en la
 * query: son los mismos valores que leen `CATALOG_INTENTS` y `CATALOG_FORMATS`
 * (`widgets/catalog/model`), así que la página abre con esos chips ya marcados.
 * Los links de `/user/**` no se ocultan sin sesión: `app/user/layout.tsx`
 * redirige a `/login` por su cuenta.
 */
export const FOOTER_SECTIONS: NavSection[] = [
  {
    title: "Create",
    links: [
      { label: "Paint by Numbers Studio", href: "/studio" },
      // El generador solo se abre desde la ficha de un producto, así que el
      // link entra por el catálogo de prints.
      { label: "AI Pet Portraits", href: "/catalog?intent=print" },
      { label: "How It Works", href: "/studio-landing" },
      { label: "Buy Credits", href: "/credits" },
    ],
  },
  {
    title: "Shop",
    links: [
      // `all` en ambos ejes desmarca los chips: sin él /catalog abre con los
      // valores por defecto (Paint by numbers + Digital), que no es "todo".
      { label: "All Products", href: "/catalog?intent=all&format=all" },
      { label: "Paint by Numbers", href: "/catalog?intent=pbn" },
      { label: "Canvas Prints", href: "/catalog?intent=print&format=Canvas" },
      { label: "Posters", href: "/catalog?intent=print&format=Poster" },
      { label: "Accessories", href: "/catalog?intent=accessory" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "My Account", href: "/user" },
      { label: "My Artworks", href: "/user/generations" },
      { label: "My PBN Projects", href: "/user/pbn" },
      { label: "Orders", href: "/user/orders" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/studio-landing#faq" },
      { label: "Shipping & Returns", href: "/shipping-returns" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

/**
 * Datos de contacto de la marca.
 * TODO: `facebookUrl` e `instagramUrl` son placeholders — reemplazar por los
 * perfiles reales antes de producción.
 */
export const BRAND = {
  name: "Claw & Soul",
  email: "hello@clawandsoul.com",
  facebookUrl: "#",
  instagramUrl: "#",
} as const;
