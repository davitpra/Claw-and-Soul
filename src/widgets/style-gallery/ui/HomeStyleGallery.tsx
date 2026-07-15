"use client";

import { useStyleImages } from "@/hooks/useStyleImages";
import { StyleGallery } from "./StyleGallery";

// Estilo destacado en la home. Cambiar este id para mostrar otro estilo.
const HOME_GALLERY_STYLE_ID = "223b184d-086e-448c-a7aa-50f861b2bfdd";

export default function HomeStyleGallery() {
  const { images, isLoading, error } = useStyleImages(HOME_GALLERY_STYLE_ID);

  return (
    <StyleGallery
      images={images}
      isLoading={isLoading}
      error={error}
      title={"One style.\n Your pet."}
      eyebrow="Featured style"
      description="Every portrait here is the same hand-carved linocut, redrawn for a different animal. Upload a photo and yours joins them."
      ctaHref="/shop"
      ctaLabel="Explore the collection"
    />
  );
}
