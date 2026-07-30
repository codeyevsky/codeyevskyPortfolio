"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildPages } from "@/components/pages";

/**
 * The narrow-screen reading: one continuous length of parchment between two
 * dowels, scrolled under the thumb.
 *
 * A separate piece of work from the bound volume. Same words, different
 * machine: no leaves, no turning, no shared place to keep in step. Which of
 * the two is on screen is a question only the stylesheet answers.
 */
export function Roll() {
  const rootRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const [unrolled, setUnrolled] = useState(false);

  const goRef = useRef<(pageIndex: number) => void>(() => {});
  const pages = useMemo(
    () => buildPages((pageIndex) => goRef.current(pageIndex)),
    [],
  );

  /* Boards are a binding, not a text: a roll has none. */
  const sheets = useMemo(
    () =>
      pages
        .map((page, index) => ({ page, index }))
        .filter(({ page }) => !page.board),
    [pages],
  );

  /** Hidden by `display: none` means no boxes at all. */
  const onScreen = () => (rootRef.current?.getClientRects().length ?? 0) > 0;

  /* ── it opens once, then it is simply a scrolling surface ────────── */

  useEffect(() => {
    const id = window.setTimeout(() => setUnrolled(true), 120);
    return () => window.clearTimeout(id);
  }, []);

  const scrollToPage = useCallback((pageIndex: number, smooth = true) => {
    const host = windowRef.current;
    if (!host) return;
    const el = host.querySelector<HTMLElement>(`[data-page="${pageIndex}"]`);
    if (el) {
      el.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "start",
      });
    } else {
      host.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
    }
  }, []);
  goRef.current = (pageIndex: number) => scrollToPage(pageIndex);

  /** Where the reader is, so the arrows have somewhere to step from. */
  const atPage = useRef(0);

  useEffect(() => {
    const host = windowRef.current;
    if (!host) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        for (const panel of host.querySelectorAll<HTMLElement>("[data-page]")) {
          if (panel.offsetTop + panel.offsetHeight * 0.5 > host.scrollTop) {
            atPage.current = Number(panel.dataset.page);
            break;
          }
        }
      });
    };
    host.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      host.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [unrolled]);

  /* A fresh load always starts at the head of the roll. */
  useEffect(() => {
    if (!unrolled) return;
    const id = window.setTimeout(() => {
      windowRef.current?.scrollTo({ top: 0, behavior: "auto" });
    }, 40);
    return () => window.clearTimeout(id);
  }, [unrolled]);


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

  /* ── arrows step a leaf; there are none on a phone, but there are on
        a narrow desktop window, and a dead key is never right ───────── */

  const stepPanel = useCallback((delta: number) => {
    const host = windowRef.current;
    if (!host) return;
    const panels = Array.from(
      host.querySelectorAll<HTMLElement>("[data-page]"),
    );
    if (panels.length === 0) return;
    const here = panels.findIndex(
      (panel) => Number(panel.dataset.page) === atPage.current,
    );
    const next = panels[Math.max(0, Math.min(panels.length - 1, here + delta))];
    next?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!onScreen()) return;
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;

      const on = event.key === "ArrowRight" || event.key === "ArrowDown";
      const back = event.key === "ArrowLeft" || event.key === "ArrowUp";
      if (!on && !back) return;

      event.preventDefault();
      stepPanel(on ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stepPanel]);

  return (
    <div className="stage stage-roll" ref={rootRef} tabIndex={-1}>
      <div
        className={`scroll ${unrolled ? "is-open" : ""}`}
        role="group"
        aria-roledescription="scroll"
        aria-label="codeyevsky, a portfolio in four chapters"
      >
        <div className="roller" aria-hidden="true" />

        <div className="scroll-window" ref={windowRef}>
          <div className="scroll-track">
            {sheets.map(({ page, index }) => (
              <section
                key={page.id}
                data-page={index}
                data-age={index % 8}
                className="scroll-panel"
                aria-label={page.label}
              >
                {page.node}
              </section>
            ))}
          </div>
        </div>

        <div className="roller" aria-hidden="true" />
      </div>

      <p className="hint">scroll to read on</p>
    </div>
  );
}
