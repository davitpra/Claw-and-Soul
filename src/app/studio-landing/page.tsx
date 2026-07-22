import type { Metadata } from "next";
import { Navbar } from "@/widgets/navbar";
import { Footer } from "@/widgets/footer";
import ProductFAQ from "@/widgets/product-faq/ui/ProductFAQ";
import {
  LandingHero,
  LandingShowcase,
  LandingStyles,
  WhyItMatters,
  LandingProducts,
  LandingReviews,
  LandingFinalCta,
} from "@/widgets/studio-landing";
import { AIProcess, type ProcessStep } from "@/widgets/ai-process";

export const metadata: Metadata = {
  title: "Free Pet Paint by Numbers from Your Photo · Claw & Soul",
  description:
    "Turn your pet's photo into a custom paint-by-numbers coloring page with AI. Preview watercolor, linocut, royal portrait and more — download your free printable PDF, or order it as a canvas, poster or complete paint kit.",
};

const LANDING_STEPS: ProcessStep[] = [
  {
    img: "/process/1. Upload Picture.png",
    alt: "Uploading a pet photo from a phone",
    title: "1. Upload a Photo",
    text: "Any clear photo of your pet works — from phone snapshots to old favorites.",
  },
  {
    img: "/process/2 approve.png",
    alt: "Choosing between AI art style previews on a screen",
    title: "2. Pick a Style",
    text: "Our AI reimagines your pet in watercolor, linocut, royal portrait and more. See it before you commit.",
  },
  {
    img: "/process/3. Final Art.png",
    alt: "Finished AI portrait of a dog framed as a poster",
    title: "3. Get Your Final Art",
    text: "Your pet's portrait is ready — keep it as is, or order it as a canvas, poster or full painting kit.",
  },
  {
    img: "/process/4. Paint your art.png",
    alt: "Painting a numbered pet portrait with a brush and palette",
    title: "4. Paint Your Art",
    text: "Turn that art into a paint-by-numbers right in the app and download your free printable PDF, ready to paint.",
  },
];

const LANDING_FAQS = [
  {
    q: "Is the coloring page really free?",
    a: "Yes. Upload a photo, preview your pet in any style, and download the printable PDF at no cost — no account or credit card needed. You only pay if you want a physical canvas, poster or paint kit.",
  },
  {
    q: "What photos work best?",
    a: "A clear, well-lit photo where your pet's face is easy to see gives the best result. Old photos, phone snapshots and even slightly blurry favorites usually work great — our AI does the heavy lifting.",
  },
  {
    q: "How does the AI styling work?",
    a: "Our AI studies your photo and redraws your pet in the art style you pick — watercolor, linocut, royal portrait and more. You see the preview before anything is printed, so there are no surprises.",
  },
  {
    q: "Can I choose the difficulty?",
    a: "Yes. Every design can be generated as Easy, Medium or Challenging — fewer, larger regions for a relaxing paint, or fine detail for experienced painters.",
  },
  {
    q: "Can I get it as a physical product?",
    a: "Absolutely. Any design can be ordered as a framed canvas, an art poster, or a complete paint-by-numbers kit with numbered canvas, brushes and paints delivered to your door.",
  },
  {
    q: "Is this a good memorial gift?",
    a: "Many of our customers paint portraits of pets who have passed away. Families tell us that painting their companion, stroke by stroke, becomes a gentle and healing way to remember them. It's one of the most meaningful gifts you can give someone who is grieving a pet.",
  },
];

export default function StudioLandingPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-clip bg-background-light">
      <Navbar />

      <main className="flex-1">
        <LandingHero />
        <AIProcess
          eyebrow="How it works"
          title="From Photo to Masterpiece in 4 Steps"
          subtitle={
            <>
              Free to try, free to download.
              <br />
              Your first coloring page is on us.
            </>
          }
          steps={LANDING_STEPS}
          background="white"
        />
        <LandingShowcase />
        <LandingStyles />
        <WhyItMatters />
        <LandingProducts />
        <LandingReviews />
        <ProductFAQ faqs={LANDING_FAQS} />
        <LandingFinalCta />
      </main>

      <Footer />
    </div>
  );
}
