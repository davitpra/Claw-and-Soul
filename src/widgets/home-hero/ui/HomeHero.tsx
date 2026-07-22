import Hero from "./Hero";

export default function HomeHero() {
  return (
    <Hero
      eyebrow="Personalized Pet Art"
      title="Capture Their Soul in Art"
      description="Turn your favorite photo into a personalized keepsake that celebrates the unique bond with your furry friend."
      primaryCta={{ href: "/shop", label: "See our Products" }}
      secondaryCta={{ href: "/gallery", label: "View Gallery" }}
      media={{
        kind: "video",
        src: "/videos/paint transformation.mp4",
        poster: "/images/hero-painted.png",
        alt: "Two happy dogs running through a sunlit field",
        width: 1125,
        height: 1398,
      }}
      frameStyle="canvas"
      badge={{
        icon: "check_circle",
        title: "Preview Ready",
        subtitle: "See it now",
        iconClassName: "bg-green-100 text-green-600",
      }}
    />
  );
}
