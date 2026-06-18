import { Container } from "@/shared/ui/Container";

interface Feature {
  icon: string;
  title: string;
  text: string;
}

const features: Feature[] = [
  {
    icon: "favorite",
    title: "Made with Love",
    text: "Every piece is crafted with care to honor your beloved pet.",
  },
  {
    icon: "workspace_premium",
    title: "Premium Quality",
    text: "Museum-grade materials and archival inks that last a lifetime.",
  },
  {
    icon: "local_shipping",
    title: "Fast Shipping",
    text: "Carefully packaged and delivered right to your doorstep.",
  },
  {
    icon: "verified",
    title: "Satisfaction Guaranteed",
    text: "Love it or we'll make it right — your happiness comes first.",
  },
];

export function TrustFeatures() {
  return (
    <section className="bg-cream py-14">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-black text-text-main sm:text-3xl">
            We&apos;re here for you and your pet.
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col items-center text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[28px]">
                  {feature.icon}
                </span>
              </span>
              <h3 className="font-display mt-4 text-lg font-black text-text-main">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-text-muted">{feature.text}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
