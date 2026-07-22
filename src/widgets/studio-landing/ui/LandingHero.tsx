import Hero from "@/widgets/home-hero/ui/Hero";

export default function LandingHero() {
  return (
    <Hero
      eyebrow="Free AI-Powered Coloring Page"
      title="Turn Their Photo Into Art You Paint Yourself"
      description="Upload a photo of your pet, watch our AI transform it into a custom paint-by-numbers design in the style you love — and download your free printable coloring page in minutes."
      primaryCta={{
        href: "/paint-by-numbers",
        label: "Create My Free Coloring Page",
        icon: "upload",
      }}
      secondaryCta={{ href: "#styles", label: "Explore Art Styles" }}
      note="No account needed · Free PDF download"
      media={{
        kind: "image",
        src: "/landing/hero-main-v2.webp",
        alt: "A pet parent painting a paint-by-numbers portrait of their golden retriever while the dog watches",
        width: 1125,
        height: 1398,
      }}
      mediaClassName="shadow-2xl"
      badge={{
        icon: "download",
        title: "Free PDF Coloring Page",
        subtitle: "Yours in minutes",
      }}
      animateText
    />
  );
}
