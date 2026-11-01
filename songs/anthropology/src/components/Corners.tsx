import React from "react";

const C = "#1C1C1C";
const DOT_R = 3.5;
const SP = 18; // spacing between elements

// A single + shape centered at (cx, cy)
function Plus({ cx, cy, arm = 10, sw = 2.5 }: { cx: number; cy: number; arm?: number; sw?: number }) {
  return (
    <g stroke={C} strokeWidth={sw} strokeLinecap="round">
      <line x1={cx - arm} y1={cy} x2={cx + arm} y2={cy} />
      <line x1={cx} y1={cy - arm} x2={cx} y2={cy + arm} />
    </g>
  );
}

// An × shape centered at (cx, cy)
function Cross({ cx, cy, arm = 8, sw = 2.5 }: { cx: number; cy: number; arm?: number; sw?: number }) {
  const d = arm / Math.SQRT2;
  return (
    <g stroke={C} strokeWidth={sw} strokeLinecap="round">
      <line x1={cx - d} y1={cy - d} x2={cx + d} y2={cy + d} />
      <line x1={cx + d} y1={cy - d} x2={cx - d} y2={cy + d} />
    </g>
  );
}

function Dot({ cx, cy, r = DOT_R }: { cx: number; cy: number; r?: number }) {
  return <circle cx={cx} cy={cy} r={r} fill={C} />;
}

// Top-right corner decoration
function TopRight() {
  const right = 1870;
  const top = 60;

  return (
    <g>
      {/* Horizontal row of dots */}
      {[0, 1, 2, 3, 4].map(i => (
        <Dot key={`tr-d${i}`} cx={right - i * SP} cy={top} />
      ))}
      {/* Vertical column of dots below */}
      {[1, 2, 3].map(i => (
        <Dot key={`tr-dv${i}`} cx={right} cy={top + i * SP} />
      ))}
      {/* Plus signs scattered nearby */}
      <Plus cx={right - 2 * SP} cy={top + 2 * SP} arm={9} />
      <Plus cx={right - 4 * SP} cy={top + SP} arm={7} sw={2} />
      {/* Cross */}
      <Cross cx={right - SP} cy={top + 3 * SP} arm={7} />
      {/* Small dot cluster */}
      <Dot cx={right - 3 * SP} cy={top + 3 * SP} r={2.5} />
      <Dot cx={right - 5 * SP} cy={top + 2 * SP} r={2} />
      <Dot cx={right - 5 * SP} cy={top} r={2} />
      {/* Diagonal dotted line (top-left to bottom-right) */}
      {[0, 1, 2].map(i => (
        <Dot key={`tr-diag${i}`} cx={right - 6 * SP - i * SP} cy={top + i * SP} r={2} />
      ))}
    </g>
  );
}

// Bottom-left corner decoration
function BottomLeft() {
  const left = 60;
  const bottom = 1010;

  return (
    <g>
      {/* Horizontal row of dots */}
      {[0, 1, 2, 3, 4].map(i => (
        <Dot key={`bl-d${i}`} cx={left + i * SP} cy={bottom} />
      ))}
      {/* Vertical column going up */}
      {[1, 2, 3].map(i => (
        <Dot key={`bl-dv${i}`} cx={left} cy={bottom - i * SP} />
      ))}
      {/* Plus signs */}
      <Plus cx={left + 2 * SP} cy={bottom - 2 * SP} arm={9} />
      <Plus cx={left + 4 * SP} cy={bottom - SP} arm={7} sw={2} />
      {/* Cross */}
      <Cross cx={left + SP} cy={bottom - 3 * SP} arm={7} />
      {/* Small dot cluster */}
      <Dot cx={left + 3 * SP} cy={bottom - 3 * SP} r={2.5} />
      <Dot cx={left + 5 * SP} cy={bottom - 2 * SP} r={2} />
      <Dot cx={left + 5 * SP} cy={bottom} r={2} />
      {/* Diagonal dotted line */}
      {[0, 1, 2].map(i => (
        <Dot key={`bl-diag${i}`} cx={left + 6 * SP + i * SP} cy={bottom - i * SP} r={2} />
      ))}
    </g>
  );
}

export const Corners: React.FC = () => (
  <svg
    style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    width={1920}
    height={1080}
    viewBox="0 0 1920 1080"
  >
    <TopRight />
    <BottomLeft />
  </svg>
);
