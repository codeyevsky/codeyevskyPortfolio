"use client";

import { useEffect, useState } from "react";
import { BoundVolume } from "@/components/BoundVolume";
import { APPROACH, DISSOLVE, Prologue } from "@/components/Prologue";
import { Roll } from "@/components/Roll";

/** Where the reader is in the entrance, and nothing else about it. */
type Phase =
  /** Coming down the shelving, with the volume still on it. */
  | "approach"
  /** The volume has landed; the library is dissolving off the top of it. */
  | "handoff"
  /** There is only a book on a desk. */
  | "read";

/**
 * Two separate readings of the same manuscript, both always in the document.
 * Which one the reader gets is decided by a media query in the stylesheet and
 * by nothing else - no width in React state, no listener that has to fire, no
 * value left over from a layout that has already been left behind.
 *
 * The words live once, in src/content/site.ts. Only the machinery is doubled.
 *
 * Ahead of both stands the approach: the shelf the volume is taken off. It is
 * rendered first so the stylesheet can say, with a plain sibling selector,
 * that a reading with a library still in front of it is not yet on the desk -
 * which means the reveal survives a script that never runs.
 */
export function Book() {
  const [phase, setPhase] = useState<Phase>("approach");

  useEffect(() => {
    if (phase === "read") return;
    const id = window.setTimeout(
      () => setPhase(phase === "approach" ? "handoff" : "read"),
      phase === "approach" ? APPROACH : DISSOLVE,
    );
    return () => window.clearTimeout(id);
  }, [phase]);

  return (
    <>
      {phase !== "read" && <Prologue done={phase === "handoff"} />}
      <BoundVolume />
      <Roll />
    </>
  );
}
