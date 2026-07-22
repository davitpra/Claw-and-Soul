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
  LandingRelatedProducts,
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
    a: "Yes. Turn your photo into a numbered design and download the printable PDF at no cost — no credit card needed. You only pay if you want a physical canvas, poster or paint kit.",
  },
  {
    q: "Do I need an account?",
    a: "Not for the coloring page. The paint-by-numbers studio runs right in your browser, so you can upload a photo and download your PDF without signing up. Creating an AI art style is the one step that needs a free account — you start with free credits, and you only buy more if you want to keep exploring styles.",
  },
  {
    q: "What photos work best?",
    a: "A clear, well-lit photo where your pet's face is easy to see gives the best result. Old photos, phone snapshots and even slightly blurry favorites usually work great — our AI does the heavy lifting.",
  },
  {
    q: "What happens to my pet's photo?",
    a: "If you only use the free studio, your photo never leaves your device — the whole design is built right in your browser. It's uploaded only when you ask our AI for a style or save a design to your account, so we can create and store your artwork. You can delete any artwork from your account whenever you want, and we never sell your photos or use them without asking you first.",
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
    a: "Absolutely. We print your numbered design on heavyweight matte paper or on real cotton canvas, ready for you to paint — and you can add brushes and paints to any order. Prefer it already finished? We can print the artwork itself instead.",
  },
  {
    q: "What do I need to paint it?",
    a: "Acrylics and a couple of brushes — a fine one for the small numbered areas and a wider one for the background. Ordering a printed design? You can add a full brush and paint set to any order at checkout, so everything arrives ready to go.",
  },
  {
    q: "Where do you ship, and how long does it take?",
    a: "We ship across Canada, and most orders arrive within 5 business days. You'll get a tracking link by email as soon as your order leaves our studio.",
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
        <LandingRelatedProducts />
        <LandingProducts />
        <WhyItMatters />
        <ProductFAQ faqs={LANDING_FAQS} />
        <LandingFinalCta />
      </main>

      <Footer />
    </div>
  );
}
