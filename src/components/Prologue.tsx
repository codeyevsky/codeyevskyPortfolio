"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect } from "react";
import { buildPages } from "@/components/pages";
import { site } from "@/content/site";

/** How long the approach runs before the desk's own volume takes over. */
export const APPROACH = 3300;
/** And how long the library takes to dissolve off the top of it. */
export const DISSOLVE = 300;

/** Shelves in the case, and volumes standing on each. The case runs far
    wider than any window because the eye crosses it as well as descends
    it, so a shelf has to be long enough to still be full at either end. */
const ROWS = 11;
const PER_ROW = 108;
/** Which shelf the volume is found on. Six above it are what the eye comes
    down through; the four below are what it carries on past when it goes
    by - a case that stopped at this shelf would show a bare wall exactly
    when the reader is meant to be looking at the shelf below. */
const HOME = 6;

/** The cloth a binder had on the bench, and nothing brighter. */
const CLOTH = [
  "#4a2018",
  "#2d3a2c",
  "#3b2c1b",
  "#25303d",
  "#4a3a14",
  "#372023",
  "#1f2b26",
  "#44311d",
  "#2c2438",
  "#513a22",
  "#332a1c",
  "#1e2733",
];

/**
 * The same library every time.
 *
 * A shelf is not reshuffled between visits - and `Math.random` would give the
 * server one arrangement and the browser another, which React would rightly
 * call a mismatch. So the whole wall is dealt out from one fixed seed, once,
 * when the module is first read.
 */
function dealer(seed: number) {
  let s = (seed * 2654435761) >>> 0;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

/** One volume seen end-on. Every measure is in thousandths of a page height,
    so the whole library grows and shrinks with the book it belongs to. */
type Spine = {
  w: number;
  h: number;
  /** Where the two gilt bands are struck, in per cent of the spine. */
  a: number;
  b: number;
  /** Its cloth. */
  k: string;
  /** Degrees off true - most stand straight, a few have been left leaning. */
  t?: number;
};

const SHELVES: Spine[][] = (() => {
  const deal = dealer(0x5eed);
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: PER_ROW }, (): Spine => {
      const leaning = deal() < 0.055;
      const lean = leaning ? Math.round(3 + deal() * 5) * (deal() < 0.5 ? -1 : 1) : 0;
      return {
        w: 30 + Math.round(deal() * 35),
        h: 140 + Math.round(deal() * 110),
        a: 10 + Math.round(deal() * 22),
        b: 62 + Math.round(deal() * 26),
        k: CLOTH[Math.floor(deal() * CLOTH.length)],
        ...(lean ? { t: lean } : null),
      };
    }),
  );
})();

/** The front board itself, taken from the manuscript rather than redrawn -
    so what stands on the shelf and what lands on the desk are one thing. */
const COVER: ReactNode = buildPages(() => {})[0].node;

const spine = (book: Spine, i: number) => (
  <i
    key={i}
    className="spine"
    style={
      {
        "--w": book.w,
        "--h": book.h,
        "--a": book.a,
        "--b": book.b,
        "--k": book.k,
        ...(book.t ? { "--t": book.t } : null),
      } as CSSProperties
    }
  />
);

/**
 * THE APPROACH
 *
 * Where the volume comes from. A wall of shelving taken at speed, one book
 * drawn off it and turned to face the reader - and by the time it is turned
 * it is standing at exactly the size and place the desk's own volume stands,
 * so the two can be swapped without a seam.
 *
 * It knows nothing about the reading it hands over to. The geometry both
 * agree on lives in two custom properties, `--volume-w` and `--volume-h`,
 * and in nothing else.
 */
export function Prologue({ done }: { done: boolean }) {
  /* A volume that has not arrived cannot be read, and an arrow pressed at
     the shelf must not quietly turn its first leaf behind the library. The
     press is swallowed in the capture phase, before the reading's own
     listener on the same window ever sees it. Pointers are stopped by the
     library itself, which covers the screen for exactly as long as it runs. */
  useEffect(() => {
    if (done) return;
    const swallow = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      event.preventDefault();
      event.stopPropagation();
    };
    window.addEventListener("keydown", swallow, true);
    return () => window.removeEventListener("keydown", swallow, true);
  }, [done]);

  return (
    <div
      className={`prologue${done ? " is-done" : ""}`}
      style={
        {
          "--rows": ROWS,
          "--home": HOME,
          "--per-row": PER_ROW,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      {/* Case and volume ride down on one layer, not two. Given the same
          animation they travel the same distance to the last decimal - but
          two separately composited layers each round their own transform to
          the device's pixels, and the pair can sit a fraction of a pixel
          differently from one frame to the next. Across thirty pixels of
          shelved spine that reads as a book shuffling about in its gap. */}
      <div className="glide">
        <div className="shelf-wall">
          {SHELVES.map((row, r) => (
            <div className="shelf" key={r}>
              {r === HOME ? (
                /* The shelf the eye comes to rest on. Its middle column is left
                   empty and is exactly as wide as the volume is thick, so the
                   book that comes forward is the book that was standing there. */
                <div className="shelf-row is-home">
                  <div className="side">{row.slice(0, PER_ROW / 2).map(spine)}</div>
                  <div className="slot" />
                  <div className="side">{row.slice(PER_ROW / 2).map(spine)}</div>
                </div>
              ) : (
                <div className="shelf-row">{row.map(spine)}</div>
              )}
              <div className="plank" />
            </div>
          ))}
        </div>

        {/* The volume, standing in the gap left for it on the home shelf and
            carried along with it until the eye has come to rest. */}
        <div className="tome-track">
          <div className="tome">
            <div className="tome-spine">
              <span>{site.title}</span>
            </div>
            <div className="tome-face">{COVER}</div>
            <div className="tome-binding" />
          </div>
        </div>
      </div>
    </div>
  );
}
