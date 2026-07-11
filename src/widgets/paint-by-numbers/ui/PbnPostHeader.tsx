"use client";
import PbnPostMenu, { PbnPostMenuItem } from "./PbnPostMenu";

/**
 * Instagram-style header overlaid on the top of the result image: avatar + name
 * + timestamp on the left, a three-dots ("⋯") menu on the right. Meant to be
 * rendered as a sibling of the ImageCompareSlider inside its relative container.
 */
export default function PbnPostHeader({
  menuItems,
}: {
  menuItems: PbnPostMenuItem[];
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-end gap-2 rounded-t-xl bg-linear-to-b from-black/55 to-transparent px-3 py-2.5">
      <div className="pointer-events-auto">
        <PbnPostMenu items={menuItems} />
      </div>
    </div>
  );
}
