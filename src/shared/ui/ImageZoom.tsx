"use client";

import {
  CSSProperties,
  ReactElement,
  ReactNode,
  cloneElement,
  isValidElement,
} from "react";
import Zoom from "react-medium-image-zoom";
import type { UncontrolledProps } from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

/** Presentation applied to the product image. Mirrors ProductGallery's FrameStyle. */
type FrameStyle = "canvas" | "poster" | "art" | "accessory" | "credits";

interface ImageZoomProps {
  children: ReactNode;
  /** Full-resolution source used only while zoomed in. */
  zoomSrc?: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  /** Frame effect to also apply to the zoomed (modal) image. */
  frameStyle?: FrameStyle;
}

const dialogClassName = [
  "[&_[data-rmiz-modal-overlay]]:bg-[#f0eee9]/95",
  "[&_[data-rmiz-modal-overlay]]:backdrop-blur-sm",
  "[&_[data-rmiz-btn-unzoom]]:bg-white",
  "[&_[data-rmiz-btn-unzoom]]:text-[#448da6]",
  "[&_[data-rmiz-btn-unzoom]]:shadow-[0_8px_20px_-8px_rgba(16,54,66,0.45)]",
].join(" ");

// Same wrapped-canvas darkening used inline in ProductGallery: darker toward the
// left, right and bottom edges (the canvas sides in shadow), none at the top.
const CANVAS_EDGE_BACKGROUND = [
  "linear-gradient(to right, rgba(0,0,0,0.34), rgba(0,0,0,0) 2%, rgba(0,0,0,0) 98%, rgba(0,0,0,0.34))",
  "linear-gradient(to top, rgba(0,0,0,0.38), rgba(0,0,0,0) 1%)",
].join(", ");

// The top "lip" highlight, mirroring `canvasHighlightStyle`. It's a separate
// `screen` layer (screen only lightens; the edge layer above is `multiply`,
// which can't render white) so it needs its own overlay div.
const CANVAS_HIGHLIGHT_BACKGROUND =
  "linear-gradient(to bottom, rgba(255,255,255,0.81), rgba(255,255,255,0) 1%)";

// Renders the zoomed (modal) image with the same canvas/poster framing as the
// inline image. The library absolutely-positions the modal <img> via an inline
// style (top/left/width/height/transform) and animates `transform 0.3s`; for
// canvas we lay a darkening overlay that copies that positioning so it tracks
// the image during the zoom animation, for poster we add a white mat + hairline
// border directly on the <img> (Tailwind's box-sizing:border-box keeps the box
// the same size, so the mat forms inside without shifting the image).
function makeZoomContent(
  frameStyle: FrameStyle,
): UncontrolledProps["ZoomContent"] {
  return function ZoomContentFrame({ img, buttonUnzoom }) {
    if (!isValidElement(img)) {
      return <>{buttonUnzoom}</>;
    }

    const imgStyle = (img.props as { style?: CSSProperties }).style ?? {};

    if (frameStyle === "poster") {
      const framedImg = cloneElement(
        img as ReactElement<{ style?: CSSProperties }>,
        {
          style: {
            ...imgStyle,
            padding: "0.5%",
            border: "1px solid rgba(0,0,0,0.10)",
            backgroundColor: "#fff",
          },
        },
      );
      return (
        <>
          {framedImg}
          {buttonUnzoom}
        </>
      );
    }

    return (
      <>
        {img}
        {frameStyle === "canvas" && (
          <>
            <div
              aria-hidden
              style={{
                ...imgStyle,
                position: "absolute",
                transformOrigin: "top left",
                transition: "transform 0.3s",
                background: CANVAS_EDGE_BACKGROUND,
                mixBlendMode: "multiply",
                pointerEvents: "none",
              }}
            />
            <div
              aria-hidden
              style={{
                ...imgStyle,
                position: "absolute",
                transformOrigin: "top left",
                transition: "transform 0.3s",
                background: CANVAS_HIGHLIGHT_BACKGROUND,
                mixBlendMode: "screen",
                pointerEvents: "none",
              }}
            />
          </>
        )}
        {buttonUnzoom}
      </>
    );
  };
}

export function ImageZoom({
  children,
  zoomSrc,
  alt,
  className = "",
  style,
  frameStyle = "art",
}: ImageZoomProps) {
  return (
    // [data-rmiz] is the wrapper the library injects; it is inline-flex by
    // default and would collapse a percentage-width child.
    <div className={`w-full [&>[data-rmiz]]:w-full ${className}`} style={style}>
      <Zoom
        zoomMargin={32}
        classDialog={dialogClassName}
        zoomImg={zoomSrc ? { src: zoomSrc, alt: alt ?? "" } : undefined}
        a11yNameButtonZoom="Zoom image"
        a11yNameButtonUnzoom="Close zoomed image"
        ZoomContent={
          frameStyle === "canvas" || frameStyle === "poster"
            ? makeZoomContent(frameStyle)
            : undefined
        }
      >
        {children}
      </Zoom>
    </div>
  );
}

export default ImageZoom;
