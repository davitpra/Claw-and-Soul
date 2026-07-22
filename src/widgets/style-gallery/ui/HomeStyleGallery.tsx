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
      title={"Your pet.\n This poster."}
      eyebrow="Printed art"
      description="See a poster you love? We redraw it with your pet in the frame — a one-of-a-kind printed artwork made from your photo."
      ctaHref="/catalog"
      ctaLabel="Explore the collection"
    />
  );
}
