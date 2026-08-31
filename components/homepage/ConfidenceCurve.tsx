"use client";

import type { Stage } from "@/data/journey/programs";

// ---------------------------------------------------------------------------
// ConfidenceCurve
//
// Reframes the problem before showing the solution: parental confidence
// follows the Dunning-Kruger shape, not a straight line. You research your
// way to a confident (if untested) peak during pregnancy, reality crashes
// that confidence right after birth, and you spend baby/toddlerhood
// rebuilding it — this time for real, though the plateau lands a little
// humbler than the naive peak you started at.
//
// This *is* the stage picker now — it replaces the old row of pill buttons.
// Each point is clickable/keyboard-focusable and drives the same `stage`
// state StageRecommender already had.
//
// Points are hand-placed (not computed from real numbers — there's no
// dataset here, just a shape everyone recognizes) and connected with a
// Catmull-Rom-style smoothed cubic-bezier path for a natural curve through
// exactly 4 points. The y-axis is labeled ("Confidence") but unticked —
// there's no real scale to put numbers on, only a direction.
//
// Labels don't sit under their own point — every label anchors to one
// shared row below the whole chart, linked back to its point by a dotted
// leader line, so label position is independent of how steep the curve is
// at that point. All labels are center-anchored on their point; the two
// edge points (pregnancy, toddler) do run slightly past the viewBox as a
// result, but the svg is overflow-visible so nothing clips.
//
// A single shared row only works because captions are pre-wrapped to <=2
// short lines (see CurvePoint.caption below) — a run-on caption like
// "Building real experience" as one line needs ~150+ units at this font
// size, wider than the ~115 units between points, which used to force an
// alternating near/far row split just to keep neighbors from colliding.
// Wrapping each caption at a natural break keeps every line short enough
// that one shared row has room for all four, on both desktop and mobile
// (the SVG scales as one unit, so this holds at any rendered width).
//
// The curve's own peak-to-valley range (and the axis/tier spacing below it)
// is stretched taller than the points' raw values might suggest at a
// glance, and stage-header text sizes up further on mobile
// (text-[17px] sm:text-[15px]) — both on purpose, so the chart reads as a
// deliberately large, prominent section rather than a compact banner sitting
// above the program list. Since it's one image scaling as a unit, "bigger"
// here means a taller viewBox and bigger font-size values in SVG units, not
// a wider container — width was never the constraint on mobile.
// ---------------------------------------------------------------------------

interface CurvePoint {
  stage: Stage;
  x: number;
  y: number;
  label: string;
  // Hand-broken into lines (1 or 2) — SVG <text> doesn't wrap on its own,
  // so the long captions are pre-split at a natural break rather than left
  // to run wide on mobile. Short captions stay a single-element array.
  caption: string[];
}

const points: CurvePoint[] = [
  {
    stage: "pregnancy",
    x: 40,
    y: 30,
    label: "Pregnancy",
    caption: ["You've done", "the research"],
  },
  {
    stage: "newborn",
    x: 155,
    y: 150,
    label: "Newborn",
    caption: ["Reality hits"],
  },
  {
    stage: "baby",
    x: 270,
    y: 95,
    label: "Baby",
    caption: ["Building real", "experience"],
  },
  {
    stage: "toddler",
    x: 385,
    y: 65,
    label: "Toddler",
    caption: ["Settling in"],
  },
];

// Smoothed path through the 4 hand-placed points above (Catmull-Rom -> cubic
// bezier conversion, computed once by hand since there are only 4 points).
// Taller peak-to-valley range than the points' raw coordinates might suggest
// at a glance — stretched vertically on purpose so the curve reads as a
// bigger, more prominent shape at the same rendered width, not just a short
// wide banner sitting above the program list.
const CURVE_PATH =
  "M 40,30 C 59.17,50 116.67,139.17 155,150 C 193.33,160.83 231.67,109.17 270,95 C 308.33,80.83 365.83,70 385,65";

const CONTENT_WIDTH = 420;
// Extra left margin so the y-axis line + rotated "Confidence" label have
// room without colliding with the curve's own leftmost point (x=40).
const AXIS_MARGIN = 34;
const AXIS_TOP = 15;
const AXIS_BOTTOM = 165;

// One shared label row — every leader line ends here regardless of the
// point's own y, and both text rows sit below it.
const LEADER_BOTTOM = 172;
const NAME_Y = 195;
const CAPTION_Y = 215;
// +15 covers the second line of a 2-line caption (see the tspan dy below),
// +10 more for a little breathing room under it.
const VIEWBOX_HEIGHT = CAPTION_Y + 15 + 10;

interface ConfidenceCurveProps {
  activeStage: Stage;
  onSelectStage: (stage: Stage) => void;
}

export default function ConfidenceCurve({
  activeStage,
  onSelectStage,
}: ConfidenceCurveProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <svg
        viewBox={`${-AXIS_MARGIN} 0 ${CONTENT_WIDTH + AXIS_MARGIN} ${VIEWBOX_HEIGHT}`}
        className="w-full h-auto overflow-visible"
        role="img"
        aria-label="A curve showing parental confidence dropping sharply after birth, then slowly rebuilding through your baby's first years"
      >
        {/* Y axis: line + up-arrow + rotated "Confidence" label. No ticks —
            this is a shape, not a measurement. */}
        <line
          x1={0}
          y1={AXIS_BOTTOM}
          x2={0}
          y2={AXIS_TOP}
          stroke="currentColor"
          className="text-brand-soft-green/40"
          strokeWidth={1.5}
        />
        <path
          d={`M ${-5},${AXIS_TOP + 8} L 0,${AXIS_TOP} L 5,${AXIS_TOP + 8}`}
          fill="none"
          stroke="currentColor"
          className="text-brand-soft-green/40"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text
          x={-11}
          y={(AXIS_TOP + AXIS_BOTTOM) / 2}
          textAnchor="middle"
          transform={`rotate(-90, -11, ${(AXIS_TOP + AXIS_BOTTOM) / 2})`}
          className="text-[13px] font-medium fill-brand-soft-green/60"
        >
          Confidence
        </text>

        <path
          d={CURVE_PATH}
          fill="none"
          stroke="currentColor"
          className="text-brand-soft-green/60"
          strokeWidth={3}
          strokeLinecap="round"
        />

        {points.map((point) => {
          const active = point.stage === activeStage;

          return (
            <g key={point.stage}>
              {/* Dotted leader from the point down to the shared label row —
                  length varies with the point's own height, but the row it
                  lands on never does. */}
              <line
                x1={point.x}
                y1={point.y}
                x2={point.x}
                y2={LEADER_BOTTOM}
                stroke="currentColor"
                className="text-brand-soft-green/25"
                strokeWidth={1}
                strokeDasharray="1.5 3"
              />

              {/* Clickable point marker */}
              <g
                role="button"
                tabIndex={0}
                aria-label={`Show programs for ${point.label}`}
                aria-pressed={active}
                onClick={() => onSelectStage(point.stage)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectStage(point.stage);
                  }
                }}
                className="cursor-pointer focus:outline-none"
              >
                {/* Larger invisible hit area for touch/click */}
                <circle cx={point.x} cy={point.y} r={20} fill="transparent" />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={active ? 9 : 7}
                  className={
                    active
                      ? "fill-brand-goldenrod"
                      : "fill-brand-white dark:fill-brand-charcoal stroke-brand-soft-green"
                  }
                  strokeWidth={active ? 0 : 2}
                />
              </g>

              {/* Stage label (header), anchored to the shared label row */}
              <text
                x={point.x}
                y={NAME_Y}
                textAnchor="middle"
                className={`text-[17px] sm:text-[15px] fill-brand-charcoal dark:fill-brand-white ${
                  active ? "font-bold" : "font-medium"
                }`}
              >
                {point.label}
              </text>

              {/* Caption (description), same row below the header */}
              <text
                x={point.x}
                y={CAPTION_Y}
                textAnchor="middle"
                className={`text-[13px] sm:text-[12px] italic ${
                  active
                    ? "font-semibold fill-brand-goldenrod"
                    : "fill-brand-soft-green/70"
                }`}
              >
                {point.caption.map((line, i) => (
                  <tspan key={line} x={point.x} dy={i === 0 ? 0 : 15}>
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
