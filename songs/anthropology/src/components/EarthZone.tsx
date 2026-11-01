import React from "react";
import { staticFile } from "remotion";
import { ANGLE_TABLE } from "../angle-data";
import { EARTH, RING } from "../config";

// Interpolate config color stops into a dense SVG tableValues string.
// Two stops with nearly identical `at` values produce a sharp edge.
const NOISE_TABLE = (() => {
  const stops = EARTH.noiseColorMap;
  const n = 80;
  const r: number[] = [], g: number[] = [], b: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    let lo = stops[0], hi = stops[stops.length - 1];
    for (let j = 0; j < stops.length - 1; j++) {
      if (stops[j].at <= t && stops[j + 1].at >= t) { lo = stops[j]; hi = stops[j + 1]; break; }
    }
    const span = hi.at - lo.at;
    const f = span < 1e-9 ? 1 : (t - lo.at) / span;
    r.push(lo.r + (hi.r - lo.r) * f);
    g.push(lo.g + (hi.g - lo.g) * f);
    b.push(lo.b + (hi.b - lo.b) * f);
  }
  const fmt = (arr: number[]) => arr.map(v => v.toFixed(3)).join(" ");
  return { r: fmt(r), g: fmt(g), b: fmt(b) };
})();

const PHI = (Math.PI * RING.tiltDeg) / 180;
const COS_PHI = Math.cos(PHI);
const SIN_PHI = Math.sin(PHI);

const EARTH_DOTS: Array<{ x: number; y: number }> = (() => {
  const { cx, cy, r, dotSp } = EARTH;
  const dots: Array<{ x: number; y: number }> = [];
  const seen = new Set<string>();
  const span = r + dotSp;
  for (let gy = Math.ceil((cy - span) / dotSp) * dotSp; gy <= cy + span; gy += dotSp) {
    for (let gx = Math.ceil((cx - span) / dotSp) * dotSp; gx <= cx + span; gx += dotSp) {
      if (Math.sqrt((gx - cx) ** 2 + (gy - cy) ** 2) < r) {
        const key = `${gx},${gy}`;
        if (!seen.has(key)) { seen.add(key); dots.push({ x: gx, y: gy }); }
      }
    }
  }
  return dots;
})();

interface CatData {
  i: number;
  x: number;
  y: number;
  depth: number;
  scale: number;
  rotation: number; // degrees, tangent to the ring ellipse
}

function catAt(baseAngle: number, i: number): CatData {
  const θ = baseAngle + (Math.PI * 2 * i) / RING.nCats;
  const dx = RING.rx * Math.cos(θ);
  const dy = RING.ry * Math.sin(θ);
  const x = EARTH.cx + dx * COS_PHI - dy * SIN_PHI;
  const y = EARTH.cy + dx * SIN_PHI + dy * COS_PHI;
  const depth = Math.sin(θ);
  const t = (depth + 1) / 2;

  return { i, x, y, depth, scale: RING.scaleBack + (RING.scaleFront - RING.scaleBack) * t, rotation: RING.tiltDeg };
}

function catOpacity(depth: number): number {
  const t = (depth + 1) / 2;
  return 0.42 + 0.58 * t;
}


const CAT_SPRITE = staticFile("sprites/cat.PNG");

interface Props {
  currentSec: number;
  frame: number;
}

export const EarthZone: React.FC<Props> = ({ currentSec, frame }) => {
  const tableIdx = Math.max(0, Math.min(frame, ANGLE_TABLE.length - 1));
  const baseAngle = ANGLE_TABLE[tableIdx];
  const sec = Math.max(0, currentSec);

  const cats: CatData[] = Array.from({ length: RING.nCats }, (_, i) => catAt(baseAngle, i));
  const backCats = cats.filter((c) => c.depth < 0).sort((a, b) => a.depth - b.depth);
  const frontCats = cats.filter((c) => c.depth >= 0).sort((a, b) => a.depth - b.depth);

  const { cx: CX, cy: CY, r: ER } = EARTH;

  const BEHIND_MASK_ID = "ant-behind-mask";
  const NOISE_FILTER_ID = "ant-earth-noise";

  const noiseFreq = (EARTH.noiseFreq + EARTH.noiseFreq * 0.3 * Math.sin(sec * 0.42)).toFixed(5);
  const noiseFreqY = (EARTH.noiseFreq * 0.8 + EARTH.noiseFreq * 0.3 * Math.cos(sec * 0.35)).toFixed(5);

  return (
    <svg
      style={{ position: "absolute", inset: 0 }}
      width={1920}
      height={1080}
      viewBox="0 0 1920 1080"
      overflow="visible"
    >
      <defs>
        {/* Gradient-map Perlin noise: noise → luminance → color ramp → output onto dots */}
        <filter id={NOISE_FILTER_ID} x="-2%" y="-2%" width="104%" height="104%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency={`${noiseFreq} ${noiseFreqY}`} numOctaves={6} seed={3} result="noise" />
          <feColorMatrix
            type="matrix"
            values="0.33 0.33 0.33 0 0
                    0.33 0.33 0.33 0 0
                    0.33 0.33 0.33 0 0
                    0    0    0    1 0"
            in="noise" result="gray"
          />
          <feComponentTransfer in="gray" result="colorMapped">
            <feFuncR type="table" tableValues={NOISE_TABLE.r} />
            <feFuncG type="table" tableValues={NOISE_TABLE.g} />
            <feFuncB type="table" tableValues={NOISE_TABLE.b} />
          </feComponentTransfer>
          <feComposite in="colorMapped" in2="SourceGraphic" operator="in" />
        </filter>

        <mask id={BEHIND_MASK_ID} maskUnits="userSpaceOnUse" x="-600" y="-600" width="3200" height="2400">
          <rect x="-600" y="-600" width="3200" height="2400" fill="white" />
          <circle cx={CX} cy={CY} r={ER} fill="black" />
        </mask>
      </defs>

      {/* ── BACK LAYER: back cats, hidden behind earth ── */}
      <g mask={`url(#${BEHIND_MASK_ID})`}>
        {backCats.map((cat) => {
          const size = RING.catBaseSize * cat.scale;
          return (
            <image
              key={`bc-${cat.i}`}
              href={CAT_SPRITE}
              x={cat.x - size / 2}
              y={cat.y - size / 2}
              width={size}
              height={size}
              opacity={catOpacity(cat.depth)}
              preserveAspectRatio="xMidYMid meet"
              transform={`rotate(${cat.rotation.toFixed(2)}, ${cat.x.toFixed(2)}, ${cat.y.toFixed(2)})`}
            />
          );
        })}
      </g>

      {/* ── EARTH: gradient dots with organic noise texture ── */}
      <g filter={`url(#${NOISE_FILTER_ID})`}>
        {EARTH_DOTS.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={EARTH.dotR} fill="white" />
        ))}
      </g>

      {/* ── FRONT LAYER: front cats on top of earth ── */}
      {frontCats.map((cat) => {
        const size = RING.catBaseSize * cat.scale;
        return (
          <image
            key={`fc-${cat.i}`}
            href={CAT_SPRITE}
            x={cat.x - size / 2}
            y={cat.y - size / 2}
            width={size}
            height={size}
            opacity={catOpacity(cat.depth)}
            preserveAspectRatio="xMidYMid meet"
            transform={`rotate(${cat.rotation.toFixed(2)}, ${cat.x.toFixed(2)}, ${cat.y.toFixed(2)})`}
          />
        );
      })}
    </svg>
  );
};
