interface Perk {
  icon: string;
  title: string;
  detail: React.ReactNode;
}

// Perks para productos físicos (Canvas, Poster…): envío, hecho a pedido y
// créditos, que se ganan solo cuando el pedido tiene un costo de producción.
const PERKS: Perk[] = [
  {
    icon: "local_shipping",
    title: "Free Delivery",
    detail: "Ships in 5–7 business days. Availability varies by country.",
  },
  {
    icon: "visibility",
    title: "Free Preview",
    detail: "See your artwork before you buy — no surprises.",
  },
  {
    icon: "palette",
    title: "Made to Order",
    detail: "Each piece is printed just for you, so all sales are final.",
  },
  {
    icon: "redeem",
    title: "Earn 3 Credits",
    detail:
      "Every piece you order adds 3 studio credits to your account for more AI art.",
  },
];

// El formato Digital es un archivo descargable: no hay envío ni producción a
// pedido, y no otorga créditos (no tiene costo de producción). Se descarga pero
// a un tamaño ya definido, no en cualquier medida.
const DIGITAL_PERKS: Perk[] = [
  {
    icon: "download",
    title: "Instant Download",
    detail: "Get your printable file right after checkout — no shipping.",
  },
  {
    icon: "visibility",
    title: "Free Preview",
    detail: "See your artwork before you buy — no surprises.",
  },
  {
    icon: "print",
    title: "Ready to Print",
    detail: "ready to print at home.",
  },
];

interface ProductPerksProps {
  /** Formato de entrega normalizado (Digital | Canvas | Poster…). */
  template?: string;
}

export default function ProductPerks({ template }: ProductPerksProps) {
  const perks = template === "Digital" ? DIGITAL_PERKS : PERKS;

  return (
    <div className="rounded-xl bg-white divide-y divide-[#E0DED9]">
      {perks.map((perk) => (
        <div key={perk.title} className="flex items-center gap-5 px-6 py-4">
          <span className="material-symbols-outlined text-[28px] text-primary">
            {perk.icon}
          </span>
          <div className="flex flex-col gap-0.5">
            <p className="font-display font-black text-text-main">
              {perk.title}
            </p>
            <p className="font-body text-sm text-text-muted">{perk.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
