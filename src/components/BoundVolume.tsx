"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildPages } from "@/components/pages";

/** Under this much travel the hand is still clicking, not turning. */
const SLOP = 5;
/** Let go past the halfway point and the leaf falls the rest of the way over. */
const COMMIT = 0.5;
/** Or let go moving this fast - px per ms - and it goes as it was thrown. */
const FLICK = 0.45;
/** What a released leaf takes to fall a whole turn under its own weight. */
const FALL = 700;
/** And the least a reader may leave between one turn and the next.

   A leaf takes a second to go over, so an arrow leant on - or hammered -
   used to put four of them in the air at once, each dragging its own bowed
   run of panels through a second of animation. Taps that land while one is
   still going over are let go of rather than queued: a book is turned page
   by page, not scrubbed, and two in the air at a time is as much as the
   reading is asked to carry. */
const TAP = 500;
/** Nobody gets to take hold of a leaf right on its own hinge. */
const MIN_REACH = 0.22;
/** How a leaf falls once it has been let go of. */
const EASE = "cubic-bezier(0.25, 0.62, 0.3, 1)";
/** How many panels a leaf is dealt into.

   A leaf turning as one flat rectangle is a plate of sheet metal on a
   hinge, and no amount of shading talks the eye out of it: paper bends.
   So it is dealt into panels hinged end to end, each carrying its own
   slice of the same page, and the run bows as it turns. Four is as few as
   will pass for a curve once each panel is shaded by its own angle.

   How far it bows, and how it shades, are both worked out in the
   stylesheet - see `--turn` in globals.css for why they have to be. */
const PANELS = 4;
/** How far the run bows at its widest, and how far a sheet shears when it
    is dragged out of true, both in degrees.

    These two are read by the stylesheet as well - `--curl` and the `skewY`
    on `.leaf` - and the hand has to solve for the same shape the eye is
    being shown, so the two sides must be told the same numbers. There is
    no way to hand a value from a stylesheet to a program, so they are
    written twice and marked at both ends. */
const CURL = 34;
const TWIST = 10;

/** Where a point `r` out along the sheet stands, measured out from the
    gutter on the screen, once the sheet has been carried `turn` of the way
    over and has taken up the bow that goes with it.

    A flat sheet would put it at r·cos - but a bowed one lays each of its
    panels down at a slightly different angle, and the point ends up as
    much as a twentieth of a leaf from where the flat answer says. That is
    the difference between the paper staying under the hand and sliding
    out from under it. */
const alongAt = (r: number, turn: number, width: number) => {
  const step = (-CURL * Math.sin(Math.PI * turn)) / PANELS;
  const lead = -180 * turn - (step * (PANELS - 1)) / 2;
  const panel = width / PANELS;
  let x = 0;
  let left = r;
  for (let k = 0; k < PANELS && left > 0; k += 1) {
    const run = Math.min(panel, left);
    x += run * Math.cos(((lead + k * step) * Math.PI) / 180);
    left -= run;
  }
  return x;
};

/** And the turn at which that point stands where the hand now is. Bisected:
    a bowed sheet has no closed form, and eighteen halvings of an interval
    that starts one wide is finer than a pixel. */
const turnAt = (x: number, r: number, width: number) => {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 18; i += 1) {
    const mid = (lo + hi) / 2;
    if (alongAt(r, mid, width) > x) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
};

/** The back of the last leaf, which has no page of its own. Made once, so
    that React sees the same element every render and leaves the whole
    subtree alone instead of rebuilding it under a moving hand. */
const BLANK = <div className="paper" />;

/**
 * A leaf, dealt into its run of panels.
 *
 * Each panel hangs off the end of the one before it and carries its own
 * slice of the same two pages, at full size and slid across, so that the
 * page's container units still measure a whole page. Built from the
 * fore-edge inwards, because the run is nested: the panel at the gutter is
 * the one holding all the rest.
 *
 * `front` and `back` are handed in rather than made here so that they are
 * the same two elements on every panel and on every render. React walks
 * straight past a child it has seen before, which is what keeps four
 * copies of a page from being four times the work under a moving hand.
 */
function run(front: ReactNode, back: ReactNode): ReactNode {
  let panel: ReactNode = null;
  for (let k = PANELS - 1; k >= 0; k -= 1) {
    const gutter = k === 0;
    panel = (
      <div
        key={k}
        className={gutter ? "panel panel-root" : "panel"}
        style={{ "--i": k } as React.CSSProperties}
        /* Drawn, and nothing else. The run is one page said four times
           over; said four times to a reader it would be four pages. Both
           of these carry down the whole run from the gutter panel. */
        inert={gutter}
        aria-hidden={gutter || undefined}
      >
        <div className="pane recto">
          <div
            className="pane-in"
            style={{ "--slice": k } as React.CSSProperties}
          >
            {front}
          </div>
        </div>
        {/* The same sheet seen from behind runs the other way about. */}
        <div className="pane verso">
          <div
            className="pane-in"
            style={{ "--slice": PANELS - 1 - k } as React.CSSProperties}
          >
            {back}
          </div>
        </div>
        {panel}
      </div>
    );
  }
  return panel;
}

const clamp = (value: number, low: number, high: number) =>
  Math.min(high, Math.max(low, value));

/** The hand on a leaf. None of this is drawn, so none of it is state. */
type Grip = {
  pointerId: number;
  /** The leaf that was taken hold of. */
  leaf: number;
  /** +1 carrying it over to the left, -1 bringing it back to the right. */
  dir: 1 | -1;
  /** Where the hinge stands on the screen, and how far out the hand took hold. */
  gutter: number;
  reach: number;
  x0: number;
  y0: number;
  /** How far out of true the sheet is being pulled, -1 to +1. */
  drift: number;
  /** The leaf's width on screen, which the bow is worked out across. */
  width: number;
  /** Far enough from where it went down to be a turn and not a click. */
  live: boolean;
  /** How far over the leaf has been carried, 0 to 1. */
  turn: number;
  lastX: number;
  lastT: number;
  /** px per ms, signed, at the moment of letting go. */
  speed: number;
};

/** The leaf under the hand, as the volume has to draw it. */
type Held = {
  leaf: number;
  turn: number;
  /** 0 while the hand is still on it; otherwise the fall left to run, in ms. */
  fall: number;
  /** Which corner it is being pulled by, -1 head to +1 tail. */
  tilt: number;
};

/** How far out of true the hand is pulling the sheet. */
const lean = (hand: Grip) => clamp(hand.drift, -1, 1);

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
  const volumeRef = useRef<HTMLDivElement>(null);
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

  /** When the last turn was set going, so the next one can be made to wait. */
  const tapped = useRef(0);

  /** Whether a turn may be started at all yet. */
  const ready = () => {
    const now = performance.now();
    if (now - tapped.current < TAP) return false;
    tapped.current = now;
    return true;
  };

  /** One leaf either way, and no faster than a leaf actually goes over. */
  const step = useCallback(
    (delta: number) => {
      if (!ready()) return;
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
      /* A jump riffles every leaf it passes at once, which is the heaviest
         thing the reading ever does - so it waits its turn like the rest. */
      if (!ready()) return;

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

  /* ── the leaf in the hand ────────────────────────────────────────── */

  /* A page turn is not an animation that gets played at the reader. The
     leaf hangs off the hand for as long as the hand is on it, at whatever
     angle the hand's own position says, and is only let fall when it is
     let go of. */

  const grip = useRef<Grip | null>(null);
  const [held, setHeld] = useState<Held | null>(null);
  const paint = useRef(0);
  const landing = useRef(0);

  useEffect(
    () => () => {
      cancelAnimationFrame(paint.current);
      window.clearTimeout(landing.current);
    },
    [],
  );

  /** At most one repaint a frame, however fast the pointer reports. */
  const draw = () => {
    if (paint.current) return;
    paint.current = requestAnimationFrame(() => {
      paint.current = 0;
      const hand = grip.current;
      if (!hand || !hand.live) return;
      setHeld({ leaf: hand.leaf, turn: hand.turn, fall: 0, tilt: lean(hand) });
    });
  };

  /** A hand that has been dragging was not clicking whatever it let go over. */
  const swallowClick = () => {
    const stop = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
    };
    window.addEventListener("click", stop, { capture: true, once: true });
    window.setTimeout(
      () => window.removeEventListener("click", stop, true),
      320,
    );
  };

  const takeHold = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;

    const volume = volumeRef.current;
    if (!volume) return;
    const box = volume.getBoundingClientRect();
    if (box.width === 0) return;

    /* Which side of the hinge the hand came down on decides which leaf it
       has hold of: the one lying on the right, or the last one turned. */
    const gutter = box.left + box.width / 2;
    const dir: 1 | -1 = event.clientX >= gutter ? 1 : -1;
    const leaf = dir === 1 ? current : current - 1;
    if (leaf < 0 || leaf >= total) return;

    /* Whatever the last hand left falling has landed, as far as this one
       is concerned. */
    window.clearTimeout(landing.current);
    cancelAnimationFrame(paint.current);
    paint.current = 0;
    setHeld(null);

    grip.current = {
      pointerId: event.pointerId,
      leaf,
      dir,
      gutter,
      reach: Math.max(
        Math.abs(event.clientX - gutter),
        (box.width / 2) * MIN_REACH,
      ),
      x0: event.clientX,
      y0: event.clientY,
      drift: 0,
      width: Math.max(1, box.width / 2),
      live: false,
      turn: dir === 1 ? 0 : 1,
      lastX: event.clientX,
      lastT: event.timeStamp,
      speed: 0,
    };
  };

  const carry = (event: React.PointerEvent<HTMLDivElement>) => {
    const hand = grip.current;
    if (!hand || hand.pointerId !== event.pointerId) return;

    if (!hand.live) {
      /* A button released off-window never came back as a pointerup. */
      if (event.pointerType === "mouse" && event.buttons === 0) {
        grip.current = null;
        return;
      }
      const dx = event.clientX - hand.x0;
      const dy = event.clientY - hand.y0;
      if (Math.abs(dx) < SLOP) return;
      /* Straight up or down is not a page turn. */
      if (Math.abs(dy) > Math.abs(dx)) {
        grip.current = null;
        return;
      }
      /* Only now, so that a plain click still reaches the link under it. */
      event.currentTarget.setPointerCapture(hand.pointerId);
      hand.live = true;
    }

    const elapsed = event.timeStamp - hand.lastT;
    if (elapsed > 0) hand.speed = (event.clientX - hand.lastX) / elapsed;
    hand.lastX = event.clientX;
    hand.lastT = event.timeStamp;

    /* A leaf is a sheet hinged at the gutter, and it bows as it goes over.
       So the turn that keeps the paper under the hand is not an arc cosine
       of what is left of the reach - that is the answer for a flat plate -
       but whichever turn puts the point that was taken hold of exactly
       where the hand has carried it to. Take hold at the fore-edge and the
       leaf follows the hand; take hold near the hinge and a small movement
       swings it a long way, which is what a real sheet does too. */
    hand.turn = turnAt(event.clientX - hand.gutter, hand.reach, hand.width);

    /* And up and down is the same question asked of the shear. A sheet
       shears about its sewn edge, so the point `reach` out from it rises by
       reach · tan(shear) - and the shear that puts it back under the hand
       is the arc tangent of however far the hand has carried it. A sheet
       lying flat on the pile has nothing to shear against, which is what
       the bow term says and why the tracking comes in as the leaf lifts. */
    const bow = Math.sin(Math.PI * hand.turn) * TWIST;
    hand.drift =
      bow > 0.01
        ? clamp(
            (Math.atan2(event.clientY - hand.y0, hand.reach) * 180) /
              Math.PI /
              bow,
            -1,
            1,
          )
        : 0;
    draw();
  };

  const letGo = (event: React.PointerEvent<HTMLDivElement>) => {
    const hand = grip.current;
    if (!hand || hand.pointerId !== event.pointerId) return;
    grip.current = null;
    cancelAnimationFrame(paint.current);
    paint.current = 0;

    if (event.currentTarget.hasPointerCapture(hand.pointerId)) {
      event.currentTarget.releasePointerCapture(hand.pointerId);
    }
    if (!hand.live) return; // it was a click after all

    swallowClick();

    /* Thrown hard enough, the leaf goes the way it was thrown from wherever
       it had got to. Otherwise it falls to whichever side it is nearer. */
    const thrown =
      Math.abs(hand.speed) > FLICK
        ? hand.dir === 1
          ? hand.speed < 0
          : hand.speed > 0
        : null;
    const over =
      thrown ??
      (hand.dir === 1 ? hand.turn > COMMIT : hand.turn < 1 - COMMIT);

    const to = hand.dir === 1 ? (over ? 1 : 0) : over ? 0 : 1;
    const fall = Math.max(150, Math.round(FALL * Math.abs(to - hand.turn)));

    setDelays([]);
    setHeld({ leaf: hand.leaf, turn: to, fall, tilt: lean(hand) });
    if (over) setCurrent(hand.dir === 1 ? hand.leaf + 1 : hand.leaf);
    landing.current = window.setTimeout(() => setHeld(null), fall + 60);
  };

  /* ── a leaf is a fixed height, so type that overruns is shrunk ───── */

  const fit = useCallback(() => {
    const root = rootRef.current;
    if (!root || root.getClientRects().length === 0) return;

    /* Only the one flat sheet under each leaf is ever measured. The panels
       above it hold the same page over again at the same size, so they
       would all shrink to the same answer - at four times the layout, and
       the shrinking is a loop of forced reflows. What the sheet settles on
       is published to the leaf instead, and the panels read it off. */
    root.querySelectorAll<HTMLElement>(".reach").forEach((sheet) => {
      const leaf = sheet.parentElement;
      const el = sheet.querySelector<HTMLElement>(".page-body");
      const side = sheet.classList.contains("verso")
        ? "--fit-verso"
        : "--fit-recto";
      if (!leaf) return;

      leaf.style.removeProperty(side);
      if (!el) return;

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
      leaf.style.setProperty(side, `${size}px`);
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
  const gripping = held !== null && held.fall === 0;

  /* How many leaves are lying turned, counting the one in the hand for the
     fraction of itself it has been carried over. Shut, the volume stands
     half a width to the left so the one visible board is centred on the
     desk - and while a hand is opening it, it slides across as the board
     comes up rather than waiting for it to land. */
  const carried = held ? held.leaf + held.turn : current;
  const shift =
    carried <= 1
      ? -25 * (1 - carried)
      : carried >= total - 1
        ? 25 * (carried - (total - 1))
        : 0;

  return (
    <div
      className={`stage stage-bound${gripping ? " is-gripping" : ""}`}
      ref={rootRef}
      tabIndex={-1}
      onPointerDown={takeHold}
      onPointerMove={carry}
      onPointerUp={letGo}
      onPointerCancel={letGo}
      onDragStart={(event) => event.preventDefault()}
    >
      {/* Swings up off the desk on load. Must keep preserve-3d. */}
      <div className="riser">
        <div
          ref={volumeRef}
          className={[
            "volume",
            shut ? "is-shut" : "",
            shutBack ? "is-shut-back" : "",
          ].join(" ")}
          style={
            held
              ? {
                  transform: `translateX(${shift.toFixed(3)}%)`,
                  transition: held.fall
                    ? `transform ${held.fall}ms ${EASE}`
                    : "none",
                }
              : undefined
          }
          role="group"
          aria-roledescription="book"
          aria-label="codeyevsky, a portfolio in four chapters"
        >
          <div className="block" aria-hidden="true" />

          {leaves.map((leaf, i) => {
            const inHand = held?.leaf === i;
            const turn = inHand ? held.turn : i < current ? 1 : 0;

            /* Nothing about the sheet is written as a finished transform
               any more - only how far over it has been carried, how it is
               being held, and how thick the pile under it is. The swing,
               the bow and the shading are all read off those. */
            const style: React.CSSProperties & Record<string, string | number> =
              {
                "--turn": turn.toFixed(4),
                "--lean": inHand ? held.tilt.toFixed(3) : 0,
                /* How deep in each pile this leaf lies - lying on the right,
                   and lying turned on the left. Which of the two is in force
                   is not decided here: see `--depth` in globals.css. */
                "--front": total - i,
                "--back": i + 1,
                transitionDelay: inHand ? "0ms" : `${delays[i] ?? 0}ms`,
              };
            if (inHand) {
              /* No transition at all while the hand is on it: the angle is
                 not something being animated towards, it is where the hand
                 is holding the paper. */
              style.transition = held.fall
                ? `--turn ${held.fall}ms ${EASE}`
                : "none";
            }

            const front = leaf.front?.node ?? null;
            const back = leaf.back ? leaf.back.node : BLANK;

            return (
              <div
                key={i}
                className={`leaf${inHand ? " in-hand" : ""}`}
                data-age={i % 8}
                style={style}
              >
                {run(front, back)}

                {/* The same page again, whole and flat and invisible: what
                    is drawn is the run of panels above, and a link sliced
                    across four clipped windows is not a link. This is the
                    sheet that is reached for, read out, and measured. */}
                <div className="reach recto" inert={i !== current}>
                  {front}
                </div>
                <div className="reach verso" inert={i !== current - 1}>
                  {back}
                </div>
              </div>
            );
          })}

          <div className="binding" aria-hidden="true" />
        </div>
      </div>

      <p className="hint">← →  ·  take hold of a leaf</p>
    </div>
  );
}
