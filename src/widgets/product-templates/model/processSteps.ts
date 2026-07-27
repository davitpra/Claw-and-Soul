import type { ProcessStep } from "@/widgets/ai-process";

// Pasos del "how to use" que comparten las páginas de producto (Canvas, Digital).
// El copy es de storefront, va en inglés. Otras páginas con AIProcess (p. ej.
// /studio-landing) definen sus propios pasos porque el flujo es distinto.
export const PRODUCT_PROCESS_STEPS: ProcessStep[] = [
  {
    img: "/process/2 approve.png",
    alt: "Choose Style Illustration",
    title: "1. Choose Your Style",
    text: "Pick an art style for your pet, select the size and click Create.",
  },
  {
    img: "/process/1. Upload Picture.png",
    alt: "Upload Illustration",
    title: "Upload Pet Photo",
    text: "Add clear photos of your pet in JPG, PNG or WEBP format.",
  },
  {
    img: "/process/3. Final Art.png",
    alt: "Result Illustration",
    title: "Get Your Masterpiece",
    text: "Preview your masterpiece in seconds. We'll ship it to your door. ",
  },
];

export const PRODUCT_PBN_PROCESS_STEPS: ProcessStep[] = [
  {
    img: "/process/2 approve.png",
    alt: "Choose Style Illustration",
    title: "1. Choose Your Style",
    text: "Pick an art style for your pet, select the size and click Create.",
  },
  {
    img: "/process/1. Upload Picture.png",
    alt: "Upload Illustration",
    title: "Upload Pet Photo",
    text: "Add clear photos of your pet in JPG, PNG or WEBP format.",
  },
  {
    img: "/process/3. Final Art.png",
    alt: "Result Illustration",
    title: "Get Your Masterpiece",
    text: "Preview your masterpiece in seconds.",
  },
  {
    img: "/process/4. Paint your art.png",
    alt: "Painting a numbered pet portrait with a brush and palette",
    title: "4. Paint Your Art",
    text: "We turn your art into a paint-by-numbers and ship it to your door",
  },
];

export const DIGITAL_PROCESS_STEPS: ProcessStep[] = [
  {
    img: "/process/2 approve.png",
    alt: "Choose Style Illustration",
    title: "1. Choose Your Style",
    text: "Pick an art style for your pet and click Create.",
  },
  {
    img: "/process/1. Upload Picture.png",
    alt: "Upload Illustration",
    title: "Upload Pet Photo",
    text: "Add clear photos of your pet in JPG, PNG or WEBP format.",
  },
  {
    img: "/process/3. Final Art.png",
    alt: "Result Illustration",
    title: "Get Your Masterpiece",
    text: "Preview your masterpiece in seconds.",
  },
  {
    img: "/process/4. Paint your art.png",
    alt: "Painting a numbered pet portrait with a brush and palette",
    title: "4. Paint Your Art",
    text: "Turn your art into a PBN and download a free printable PDF.",
  },
];
