import type { ProcessStep } from "@/widgets/ai-process";

// Pasos del "how to use" que comparten las páginas de producto (Canvas, Digital).
// El copy es de storefront, va en inglés. Otras páginas con AIProcess (p. ej.
// /studio-landing) definen sus propios pasos porque el flujo es distinto.
export const PRODUCT_PROCESS_STEPS: ProcessStep[] = [
  {
    img: "/process/2 approve.png",
    alt: "Choose Style Illustration",
    title: "1. Choose Your Style",
    text: "Pick an art style for your pet, select size and click Personalize.",
  },
  {
    img: "/process/1. Upload Picture.png",
    alt: "Upload Illustration",
    title: "Upload Pet Photo",
    text: "Add a clear photo of your pet in JPG, PNG or WEBP format.",
  },
  {
    img: "/process/3. Final Art.png",
    alt: "Result Illustration",
    title: "Get Your Masterpiece",
    text: "Preview your masterpiece in seconds.",
  },
];
