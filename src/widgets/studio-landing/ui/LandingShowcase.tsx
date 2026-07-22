import StudioShowcase, {
  type ShowcaseFeature,
} from "@/widgets/studio-showcase/ui/StudioShowcase";

const PROOF_POINTS: ShowcaseFeature[] = [
  { icon: "gesture", text: "AI-traced from your exact photo" },
  { icon: "palette", text: "Numbered colors matched to real paint" },
  { icon: "print", text: "Ready to print at home" },
];

export default function LandingShowcase() {
  return (
    <StudioShowcase
      eyebrow="Before & After"
      title="See the Magic for Yourself"
      description="Drag the slider to watch a real photo become a numbered canvas — every whisker traced, every color mapped, ready for your brush."
      features={PROOF_POINTS}
      image={{
        beforeSrc: "/studio/bengal-art.webp",
        afterSrc: "/studio/bengal-pbn.webp",
        beforeLabel: "Their Photo",
        afterLabel: "Your Canvas",
        width: 928,
        height: 1152,
        alt: "A Bengal cat portrait transformed into a numbered paint-by-numbers canvas",
      }}
      primaryCta={null}
      secondaryCta={null}
    />
  );
}
