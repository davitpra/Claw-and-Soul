interface Perk {
  icon: string;
  title: string;
  detail: React.ReactNode;
}

const PERKS: Perk[] = [
  {
    icon: "local_shipping",
    title: "Free Delivery",
    detail: "Enter your postal code for delivery availability.",
  },
  {
    icon: "autorenew",
    title: "Return Delivery",
    detail: "Free 30 days delivery returns.",
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
