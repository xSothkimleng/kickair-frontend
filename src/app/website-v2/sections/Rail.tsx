"use client";

import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { css, cx } from "styled-system/css";
import { palette, text } from "../design";
import { Avatar, Button } from "../ui";

/**
 * A dragged rail, hand-rolled against the skill's gesture chapters rather than
 * handed to a library's built-in momentum — because the specific behaviours it
 * asks for are not what a generic drag gives you:
 *
 *   §2  1:1 tracking with pointer capture, respecting the grab offset
 *   §5  the release velocity is handed to the spring, so there is no seam
 *       between dragging and animating
 *   §6  the landing point is *projected* from velocity, then snapped — a flick
 *       throws the rail rather than nudging it to the next card
 *   §9  rubber-banding at both ends instead of a hard stop
 *   §3  the animation is interruptible: grabbing mid-flight stops it dead and
 *       resumes from the live on-screen value
 */

/** Apple's projection function, from the Designing Fluid Interfaces sample code. */
function project(initialVelocity: number, decelerationRate = 0.998) {
  return ((initialVelocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/** The further past the bound, the less the rail follows. */
function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

const PEOPLE = [
  { name: "Sokha Chan", role: "Brand & identity design", rating: 4.9, jobs: 128, from: 120, pro: true },
  { name: "Dara Pich", role: "React & Next.js development", rating: 5.0, jobs: 94, from: 340, pro: true },
  { name: "Bopha Sok", role: "Social media & growth", rating: 4.8, jobs: 210, from: 80, pro: false },
  { name: "Rithy Nou", role: "Video editing & motion", rating: 4.9, jobs: 76, from: 150, pro: false },
  { name: "Chantrea Ly", role: "Khmer ↔ English translation", rating: 5.0, jobs: 302, from: 45, pro: true },
  { name: "Vuthy Meas", role: "Product photography", rating: 4.7, jobs: 58, from: 200, pro: false },
];

const section = css({ bg: "var(--v2-white)", py: { base: "4.5rem", md: "7rem" }, overflow: "hidden" });
const head = css({
  maxW: "78rem", mx: "auto", px: { base: "1.25rem", sm: "2rem", lg: "2.5rem" },
  display: "flex", alignItems: "flex-end", justifyContent: "space-between",
  gap: "1rem", mb: "2.25rem",
});

const viewport = css({
  maxW: "78rem", mx: "auto", px: { base: "1.25rem", sm: "2rem", lg: "2.5rem" },
  cursor: "grab",
  _active: { cursor: "grabbing" },
  // Let vertical scrolling through the rail keep working on touch.
  touchAction: "pan-y",
});

const track = css({ display: "flex", gap: "1rem", willChange: "transform" });

const personCard = css({
  flexShrink: 0,
  width: { base: "17rem", md: "19rem" },
  display: "flex",
  flexDirection: "column",
  gap: "0.875rem",
  p: "1.5rem",
  bg: "var(--v2-white)",
  borderRadius: "var(--v2-r-panel)",
  boxShadow: `inset 0 0 0 1px ${"var(--v2-hairline)"}, ${"var(--v2-sh-card)"}`,
  userSelect: "none",
});

export default function Rail() {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const viewRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const controls = useRef<{ stop: () => void } | null>(null);
  const bounds = useRef({ min: 0, max: 0, pitch: 0 });
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const drag = useRef({ active: false, moved: false, startX: 0, startTx: 0, hist: [] as { x: number; t: number }[] });

  const measure = useCallback(() => {
    const view = viewRef.current, tr = trackRef.current;
    if (!view || !tr) return;
    const first = tr.firstElementChild as HTMLElement | null;
    const pitch = first ? first.offsetWidth + 16 : 0;
    bounds.current = { min: Math.min(0, view.clientWidth - tr.scrollWidth), max: 0, pitch };
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (viewRef.current) ro.observe(viewRef.current);
    const unsub = x.on("change", (v) => {
      setAtStart(v >= bounds.current.max - 1);
      setAtEnd(v <= bounds.current.min + 1);
    });
    return () => { ro.disconnect(); unsub(); };
  }, [measure, x]);

  /** §3 — settle on a target from wherever the rail currently is, carrying velocity. */
  const settle = useCallback(
    (target: number, velocity = 0) => {
      const { min, max } = bounds.current;
      const clamped = Math.max(min, Math.min(max, target));
      controls.current?.stop();
      controls.current = animate(x, clamped, {
        type: "spring",
        // §4 — bounce only because a flick preceded it. This is the one place on
        // the site that earns overshoot.
        bounce: reduced ? 0 : 0.2,
        duration: reduced ? 0.25 : 0.45,
        velocity,
      });
    },
    [reduced, x]
  );

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    // §3 — an animation in flight is stopped, not queued behind.
    controls.current?.stop();
    measure();
    drag.current = { active: true, moved: false, startX: e.clientX, startTx: x.get(), hist: [{ x: e.clientX, t: performance.now() }] };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.active) return;
    const dx = e.clientX - d.startX;
    // §10 — ~10px of hysteresis before this counts as a drag at all.
    if (!d.moved && Math.abs(dx) < 10) return;
    d.moved = true;

    const { min, max } = bounds.current;
    const w = viewRef.current?.clientWidth ?? 1;
    let next = d.startTx + dx;
    // §9 — resist progressively past each end rather than stopping dead.
    if (next > max) next = max + rubberband(next - max, w);
    else if (next < min) next = min - rubberband(min - next, w);
    x.set(next);

    d.hist.push({ x: e.clientX, t: performance.now() });
    if (d.hist.length > 6) d.hist.shift();
  };

  const onPointerUp = () => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    if (!d.moved) return;

    // §5 — velocity from a short history, not from the last two points.
    const now = performance.now();
    const recent = d.hist.filter((p) => now - p.t < 90);
    const a = recent[0] ?? d.hist[0];
    const b = d.hist[d.hist.length - 1];
    const dt = Math.max(1, b.t - a.t);
    const velocity = ((b.x - a.x) / dt) * 1000;

    // §6 — project where the flick is going, then snap to the card nearest that
    // point. Snapping from the release point instead would make a hard flick
    // and a gentle nudge do the same thing.
    const { pitch } = bounds.current;
    const projected = x.get() + project(reduced ? 0 : velocity);
    const target = pitch > 0 ? Math.round(projected / pitch) * pitch : projected;
    settle(target, velocity);
  };

  const page = (dir: 1 | -1) => {
    const { pitch } = bounds.current;
    settle(x.get() - dir * pitch * 2);
  };

  return (
    <section id="freelancers" className={section}>
      <div className={head}>
        <div>
          <h2 className={cx(text.display, css({ color: "var(--v2-primary)" }))}>People, not profiles.</h2>
          <p className={cx(text.body, css({ color: "var(--v2-secondary)", mt: "0.75rem", maxW: "34rem" }))}>
            Every one of them ID-verified, rated by clients who actually paid.
          </p>
        </div>
        <div className={css({ display: { base: "none", md: "flex" }, gap: "0.5rem" })}>
          <Button variant="secondary" size="sm" onClick={() => page(-1)} disabled={atStart} aria-label="Previous">
            <ArrowLeft size={15} aria-hidden />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => page(1)} disabled={atEnd} aria-label="Next">
            <ArrowRight size={15} aria-hidden />
          </Button>
        </div>
      </div>

      <div
        ref={viewRef}
        className={viewport}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <motion.div ref={trackRef} className={track} style={{ x }}>
          {PEOPLE.map((p) => (
            <article key={p.name} className={personCard}>
              <div className={css({ display: "flex", alignItems: "center", gap: "0.75rem" })}>
                <Avatar name={p.name} size={44} />
                <div className={css({ minWidth: 0 })}>
                  <div className={css({ display: "flex", alignItems: "center", gap: "0.375rem" })}>
                    <span className={css({ fontSize: "0.9375rem", fontWeight: 600, letterSpacing: "-0.012em" })}>
                      {p.name}
                    </span>
                    {p.pro && (
                      <span
                        className={css({
                          px: "0.3125rem", height: "1.125rem", display: "inline-flex", alignItems: "center",
                          borderRadius: "0.3125rem", fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.04em",
                          color: "var(--v2-white)", background: "var(--v2-primary)",
                        })}
                      >
                        PRO
                      </span>
                    )}
                  </div>
                  <div className={css({ fontSize: "0.8125rem", color: "var(--v2-secondary)", mt: "0.0625rem" })}>
                    {p.role}
                  </div>
                </div>
              </div>

              <div className={css({ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", color: "var(--v2-secondary)" })}>
                <Star size={13} fill={palette.attention} color={palette.attention} aria-hidden />
                <span className={css({ fontWeight: 600, color: "var(--v2-primary)" })}>{p.rating.toFixed(1)}</span>
                <span>· {p.jobs} jobs</span>
              </div>

              <div className={css({ height: "1px", bg: "var(--v2-hairline)" })} />

              <div className={css({ display: "flex", alignItems: "baseline", justifyContent: "space-between" })}>
                <span className={css({ fontSize: "0.75rem", color: "var(--v2-tertiary)" })}>From</span>
                <span className={cx(text.money, css({ fontSize: "1.0625rem", color: "var(--v2-primary)" }))}>
                  ${p.from}
                </span>
              </div>
            </article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
