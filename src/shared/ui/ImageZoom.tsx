"use client";

import { CSSProperties, ReactNode } from "react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

interface ImageZoomProps {
  children: ReactNode;
  /** Full-resolution source used only while zoomed in. */
  zoomSrc?: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
}

const dialogClassName = [
  "[&_[data-rmiz-modal-overlay]]:bg-[#f0eee9]/95",
  "[&_[data-rmiz-modal-overlay]]:backdrop-blur-sm",
  "[&_[data-rmiz-btn-unzoom]]:bg-white",
  "[&_[data-rmiz-btn-unzoom]]:text-[#448da6]",
  "[&_[data-rmiz-btn-unzoom]]:shadow-[0_8px_20px_-8px_rgba(16,54,66,0.45)]",
].join(" ");

export function ImageZoom({
  children,
  zoomSrc,
  alt,
  className = "",
  style,
}: ImageZoomProps) {
  return (
    // [data-rmiz] is the wrapper the library injects; it is inline-flex by
    // default and would collapse a percentage-width child.
    <div
      className={`w-full [&>[data-rmiz]]:w-full ${className}`}
      style={style}
    >
      <Zoom
        zoomMargin={32}
        classDialog={dialogClassName}
        zoomImg={zoomSrc ? { src: zoomSrc, alt: alt ?? "" } : undefined}
        a11yNameButtonZoom="Zoom image"
        a11yNameButtonUnzoom="Close zoomed image"
      >
        {children}
      </Zoom>
    </div>
  );
}

export default ImageZoom;
