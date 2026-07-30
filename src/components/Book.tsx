import { BoundVolume } from "@/components/BoundVolume";
import { Roll } from "@/components/Roll";

/**
 * Two separate readings of the same manuscript, both always in the document.
 * Which one the reader gets is decided by a media query in the stylesheet and
 * by nothing else - no width in React state, no listener that has to fire, no
 * value left over from a layout that has already been left behind.
 *
 * The words live once, in src/content/site.ts. Only the machinery is doubled.
 */
export function Book() {
  return (
    <>
      <BoundVolume />
      <Roll />
    </>
  );
}
