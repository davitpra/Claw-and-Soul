interface Perk {
  icon: string;
  title: string;
  detail: React.ReactNode;
}

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
];

export default function ProductPerks() {
  return (
    <div className="rounded-xl bg-white divide-y divide-[#E0DED9]">
      {PERKS.map((perk) => (
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
