"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildPages } from "@/components/pages";

/** How far the hand must travel before it counts as turning a leaf. */
const DRAG_THRESHOLD = 60;

/**
 * The wide-screen reading: a bound volume, turned leaf by leaf.
 *
 * It knows nothing about the roll and shares no state with it. Whether it is
 * on screen is decided entirely by a media query in the stylesheet, and it
 * asks the only question that cannot be answered wrongly - does my own root
 * currently occupy any space? - before acting on a key.
 */
export function BoundVolume() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [delays, setDelays] = useState<number[]>([]);

  const goRef = useRef<(pageIndex: number) => void>(() => {});
  const pages = useMemo(
    () => buildPages((pageIndex) => goRef.current(pageIndex)),
    [],
  );

  const leaves = useMemo(
    () =>
      Array.from({ length: Math.ceil(pages.length / 2) }, (_, i) => ({
        front: pages[2 * i] ?? null,
        back: pages[2 * i + 1] ?? null,
      })),
    [pages],
  );
  const total = leaves.length;

  /** Hidden by `display: none` means no boxes at all. */
  const onScreen = () => (rootRef.current?.getClientRects().length ?? 0) > 0;

  /* ── turning ─────────────────────────────────────────────────────── */

  /** One leaf either way. Functional, so held keys never lose a step. */
  const step = useCallback(
    (delta: number) => {
      setDelays([]);
      setCurrent((from) => Math.max(0, Math.min(total, from + delta)));
    },
    [total],
  );

  const forward = useCallback(() => step(1), [step]);
  const back = useCallback(() => step(-1), [step]);

  const currentRef = useRef(0);
  useEffect(() => {
    currentRef.current = current;
  });

  /** A jump from the contents, riffling the leaves it passes. */
  const goToPage = useCallback(
    (pageIndex: number) => {
      const from = currentRef.current;
      const to = Math.max(0, Math.min(total, Math.ceil(pageIndex / 2)));
      if (to === from) return;

      const lo = Math.min(from, to);
      const hi = Math.max(from, to);
      setDelays(
        Array.from({ length: total }, (_, i) => {
          if (i < lo || i >= hi) return 0;
          const order = to > from ? i - lo : hi - 1 - i;
          return Math.min(order, 6) * 70;
        }),
      );
      setCurrent(to);
    },
    [total],
  );
  goRef.current = goToPage;

  /* ── the reader's hands ──────────────────────────────────────────── */

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!onScreen()) return;
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        forward();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        back();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [forward, back]);


  /* Keyboard focus is the likeliest reason an arrow does nothing: leaving a
     devtools panel or responsive-design mode can leave focus in the browser's
     own UI, where keydown never reaches the document at all. Claiming focus
     on mount, and again whenever the window is given it back, means the
     reader does not have to click the page first. */
  useEffect(() => {
    const claim = () => {
      const root = rootRef.current;
      // Only the reading that is actually on screen may hold the focus.
      if (!root || root.getClientRects().length === 0) return;
      if (document.activeElement === root) return;
      root.focus({ preventScroll: true });
    };
    /* Pointer events land before focus settles, so claim on the next frame. */
    const claimSoon = () => requestAnimationFrame(claim);

    claim();
    window.addEventListener("focus", claim);
    window.addEventListener("pageshow", claim);
    document.addEventListener("visibilitychange", claim);
    document.addEventListener("pointerdown", claimSoon);
    document.addEventListener("pointerup", claimSoon);
    document.addEventListener("click", claimSoon);
    return () => {
      window.removeEventListener("focus", claim);
      window.removeEventListener("pageshow", claim);
      document.removeEventListener("visibilitychange", claim);
      document.removeEventListener("pointerdown", claimSoon);
      document.removeEventListener("pointerup", claimSoon);
      document.removeEventListener("click", claimSoon);
    };
  }, []);

  const drag = useRef<{ x: number; y: number; id: number } | null>(null);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    drag.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = drag.current;
    drag.current = null;
    if (!start || start.id !== event.pointerId) return;

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < DRAG_THRESHOLD) return;
    if (Math.abs(dy) > Math.abs(dx)) return;

    if (dx < 0) forward();
    else back();
  };

  /* ── a leaf is a fixed height, so type that overruns is shrunk ───── */

  const fit = useCallback(() => {
    const root = rootRef.current;
    if (!root || root.getClientRects().length === 0) return;

    root.querySelectorAll<HTMLElement>(".page-body").forEach((el) => {
      el.style.fontSize = "";
      const base = parseFloat(window.getComputedStyle(el).fontSize);
      if (!base || el.clientHeight === 0) return;

      let size = base;
      let guard = 0;
      while (
        el.scrollHeight > el.clientHeight &&
        size > base * 0.45 &&
        guard < 48
      ) {
        size -= base * 0.025;
        el.style.fontSize = `${size}px`;
        guard += 1;
      }
    });
  }, []);

  useEffect(() => {
    fit();

    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) fit();
    });

    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, [fit, current]);

  const shut = current === 0;
  const shutBack = current === total;

  return (
    <div
      className="stage stage-bound"
      ref={rootRef}
      tabIndex={-1}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        drag.current = null;
      }}
      onDragStart={(event) => event.preventDefault()}
    >
      {/* Swings up off the desk on load. Must keep preserve-3d. */}
      <div className="riser">
        <div
          className={[
            "volume",
            shut ? "is-shut" : "",
            shutBack ? "is-shut-back" : "",
          ].join(" ")}
          role="group"
          aria-roledescription="book"
          aria-label="codeyevsky, a portfolio in four chapters"
        >
          <div className="block" aria-hidden="true" />

          {leaves.map((leaf, i) => {
            const turned = i < current;
            const depth = turned ? i + 1 : total - i;

            return (
              <div
                key={i}
                className="leaf"
                data-age={i % 8}
                style={{
                  transform: `translateZ(${(depth * 0.35).toFixed(
                    2,
                  )}px) rotateY(${turned ? -180 : 0}deg)`,
                  zIndex: depth,
                  transitionDelay: `${delays[i] ?? 0}ms`,
                }}
              >
                <div className="face recto" inert={i !== current}>
                  {leaf.front?.node}
                </div>
                <div className="face verso" inert={i !== current - 1}>
                  {leaf.back ? leaf.back.node : <div className="paper" />}
                </div>
              </div>
            );
          })}

          <div className="binding" aria-hidden="true" />
        </div>
      </div>

      <p className="hint">← →  ·  drag to turn</p>
    </div>
  );
}
