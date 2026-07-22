import Hero from "./Hero";

export default function HomeHero() {
  return (
    <Hero
      eyebrow="Custom Paint by Numbers"
      title="Paint the Portrait Only You Could Make"
      description="Upload your favorite photo, choose the style that fits their personality, and paint it with your own hands — every stroke adds a piece of you to a portrait as unique as your pet."
      primaryCta={{
        href: "/catalog",
        label: "Create Your Own Painting",
        icon: "palette",
      }}
      secondaryCta={{ href: "/studio", label: "Try the Studio Free" }}
      note="Made from your photo — no two kits are ever alike."
      media={{
        kind: "image",
        src: "/images/hero-painted.webp",
        alt: "Two happy dogs running through a sunlit field",
        width: 1127,
        height: 1395,
      }}
      frameStyle="canvas"
      badge={{
        icon: "palette",
        title: "100% Unique",
        subtitle: "Made from your photo",
      }}
    />
  );
}
