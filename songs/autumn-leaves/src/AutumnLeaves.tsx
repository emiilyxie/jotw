import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { NOTES, BPM, TOTAL_DURATION_SECONDS } from "./notes-data";

export const PADDING_SECONDS = 2;

const FALL_DURATION_SEC = 2.5;

// Ending scene: paint blobs expand to cover the full canvas
const ENDING_OFFSET_SEC = 2.0;   // seconds after last note before blobs start
const ENDING_BLOB_COUNT = 15;
const ENDING_STAGGER_SEC = 0.28; // delay between each blob appearing
const ENDING_GROW_SEC = 2.8;     // how long each blob takes to fully expand
export const OUTRO_SECONDS = ENDING_OFFSET_SEC + (ENDING_BLOB_COUNT - 1) * ENDING_STAGGER_SEC + ENDING_GROW_SEC + 2;
const REVEAL_GROW_SEC = 1.8;
const SUSTAIN_SEC = 1.0;
const REVEAL_FADE_SEC = 0.8;
const MAX_REVEAL_RADIUS = 180;
const SPLAT_SEC = 0.2;

// Tint the revealed area with the leaf's color.
// Blend modes to try: "color" | "soft-light" | "overlay" | "multiply" | "screen"
const TINT_BLEND_MODE: React.CSSProperties["mixBlendMode"] = "exclusion";
const TINT_OPACITY = 0.0; // 0 = no tint, 1 = full strength

const NOTE_NAMES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"] as const;

const MIDI_MIN = 48;
const MIDI_MAX = 84;
const COLOR_STOPS = ["#6B0F0F", "#B52020", "#C84B00", "#E07000", "#E9A800", "#F0D060"];
const BEATS_PER_MEASURE = 4;

function midiToColor(midi: number): string {
  const t = Math.max(0, Math.min(0.9999, (midi - MIDI_MIN) / (MIDI_MAX - MIDI_MIN)));
  return COLOR_STOPS[Math.floor(t * COLOR_STOPS.length)];
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// X = where the note falls within the current measure (left = beat 1, right = beat 4)
function noteToLandingX(noteTimeSec: number, width: number): number {
  const pad = 80;
  const beat = (noteTimeSec * BPM) / 60;
  const beatInMeasure = beat % BEATS_PER_MEASURE;
  return pad + (beatInMeasure / BEATS_PER_MEASURE) * (width - pad * 2);
}

// Y = pitch (high note = near top, low note = near bottom)
function midiToLandingY(midi: number, height: number): number {
  const pad = 80;
  const t = Math.max(0, Math.min(1, (midi - MIDI_MIN) / (MIDI_MAX - MIDI_MIN)));
  return (height - pad) - t * (height - pad * 2);
}

// Very aggressive initial growth so impact is immediately visible
function easeImpact(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

function easeInQuad(t: number): number {
  return t * t;
}

function darken(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const d = (v: number) => Math.max(0, Math.floor(v * (1 - amount))).toString(16).padStart(2, "0");
  return `#${d(r)}${d(g)}${d(b)}`;
}

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d !== 0) {
    if (max === r) h = (((g - b) / d) % 6 + 6) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
  }
  return [h * 60, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60)       { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) {         g = c; b = x; }
  else if (h < 240) {         g = x; b = c; }
  else if (h < 300) { r = x;         b = c; }
  else              { r = c;         b = x; }
  const hex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

function shiftHue(hex: string, degrees: number): string {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex(h + degrees, s, l);
}

function getSplatterDots(noteIndex: number, cx: number, cy: number) {
  return Array.from({ length: 7 }, (_, j) => {
    const angle   = seededRandom(noteIndex * 50 + j)      * Math.PI * 2;
    const dist    = MAX_REVEAL_RADIUS * (1.05 + seededRandom(noteIndex * 50 + j +  7) * 0.55);
    const baseR   = MAX_REVEAL_RADIUS * (0.03 + seededRandom(noteIndex * 50 + j + 14) * 0.14);
    const stretch = 0.4 + seededRandom(noteIndex * 50 + j + 28) * 1.4;  // 0.4–1.8× elongation
    const rx      = baseR;
    const ry      = baseR * stretch;
    const rot     = seededRandom(noteIndex * 50 + j + 35) * 180;
    const opa     = 0.5 + seededRandom(noteIndex * 50 + j + 21) * 0.5;
    return { x: cx + Math.cos(angle) * dist, y: cy + Math.sin(angle) * dist, rx, ry, rot, opa };
  });
}

export const AutumnLeaves: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const currentSec = frame / fps - PADDING_SECONDS;

  const noteStates = (NOTES as readonly { midi: number; time: number; duration: number }[]).map(
    (note, index) => {
      const landSec = note.time;

      // Per-leaf variation — seeded so they're consistent across frames
      const fallDuration = 1.6 + seededRandom(index * 7 + 0) * 1.6;   // 1.6 – 3.2 s
      const driftAmp    = 25  + seededRandom(index * 7 + 1) * 65;      // 25 – 90 px
      const driftFreq   = 1.6 + seededRandom(index * 7 + 2) * 1.8;    // 1.6 – 3.4 cycles
      const rotAmp      = 10  + seededRandom(index * 7 + 3) * 32;      // 10 – 42 deg
      const rotFreq     = 2.0 + seededRandom(index * 7 + 4) * 3.0;    // 2 – 5 cycles
      const rotBias     = (seededRandom(index * 7 + 5) - 0.5) * 28;   // ±14 deg tilt
      const startY      = -(50 + seededRandom(index * 7 + 6) * 60);   // -50 to -110

      const appearSec = landSec - fallDuration;
      const isFalling = currentSec >= appearSec && currentSec < landSec;
      const hasLanded = currentSec >= landSec;
      const fallProgress = isFalling ? (currentSec - appearSec) / fallDuration : 0;
      const age = hasLanded ? currentSec - landSec : 0;

      const landingX = noteToLandingX(note.time, width);
      const landingY = midiToLandingY(note.midi, height);

      // Drift zeroes out at start and end so leaf always lands at target X
      const driftX = Math.sin(fallProgress * Math.PI * driftFreq) * driftAmp * Math.sin(fallProgress * Math.PI);
      const leafX = isFalling ? landingX + driftX : landingX;
      const leafY = isFalling ? startY + easeInQuad(fallProgress) * (landingY - startY) : landingY;
      const rotation = Math.sin(fallProgress * Math.PI * rotFreq) * rotAmp + fallProgress * rotBias;

      // Splat: leaf stays fully visible during fall then splatters on impact
      const isSplatting = hasLanded && age < SPLAT_SEC;
      const splatProgress = isSplatting ? age / SPLAT_SEC : 0;
      const leafScaleX = isSplatting ? 1 + splatProgress * 0.9 : 1;
      const leafScaleY = isSplatting ? 1 - splatProgress * 0.8 : 1;
      const leafOpacity = isFalling ? 1 : isSplatting ? 1 - splatProgress : 0;


      // Ink reveal: fast initial burst then slows
      let revealRadius = 0;
      let revealOpacity = 0;
      if (hasLanded) {
        revealRadius = easeImpact(Math.min(age / REVEAL_GROW_SEC, 1)) * MAX_REVEAL_RADIUS;
        if (age <= REVEAL_GROW_SEC + SUSTAIN_SEC) {
          revealOpacity = 1;
        } else {
          revealOpacity = Math.max(0, 1 - (age - REVEAL_GROW_SEC - SUSTAIN_SEC) / REVEAL_FADE_SEC);
        }
      }

      return {
        index,
        noteName: NOTE_NAMES[note.midi % 12],
        color: midiToColor(note.midi),
        // Leaf
        isFalling,
        isSplatting,
        leafX,
        leafY,
        rotation,
        leafScaleX,
        leafScaleY,
        leafOpacity,
        // Reveal
        hasLanded,
        revealRadius,
        revealOpacity,
        landingX,
        landingY,
      };
    }
  );

  const endingStartSec = TOTAL_DURATION_SECONDS + ENDING_OFFSET_SEC;
  const isEnding = currentSec >= endingStartSec;

  // Ending blobs: many smaller blobs spread across the canvas that collectively fill it
  const endingBlobs = Array.from({ length: ENDING_BLOB_COUNT }, (_, i) => {
    const blobStartSec = endingStartSec + i * ENDING_STAGGER_SEC;
    const blobAge = currentSec - blobStartSec;
    if (blobAge <= 0) return null;
    const bx = 30 + seededRandom(i * 3 + 500) * (width - 60);
    const by = 30 + seededRandom(i * 3 + 501) * (height - 60);
    const maxRadius = 320 + seededRandom(i * 3 + 502) * 220; // 320–540px
    const radius = easeImpact(Math.min(blobAge / ENDING_GROW_SEC, 1)) * maxRadius;
    return { bx, by, radius };
  }).filter((b): b is { bx: number; by: number; radius: number } => b !== null);

  // Safety: once blobs are mostly done, fade the B&W layer entirely so no gaps remain
  const endingTotalSec = (ENDING_BLOB_COUNT - 1) * ENDING_STAGGER_SEC + ENDING_GROW_SEC;
  const endingProgress = isEnding ? (currentSec - endingStartSec) / endingTotalSec : 0;
  const bwLayerOpacity = isEnding ? Math.max(0, 1 - Math.max(0, (endingProgress - 0.85) / 0.15)) : 1;

  // No leaves during the ending scene
  const visibleLeaves = noteStates.filter((n) => n.leafOpacity > 0 && !isEnding);
  const activeReveals = noteStates.filter((n) => n.hasLanded && n.revealRadius > 1 && n.revealOpacity > 0);

  return (
    <AbsoluteFill style={{ background: "#111" }}>
      {/* Layer 1: Full-color image */}
      <Img
        src={staticFile("background.png")}
        style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }}
      />

      {/* Layer 1.5: Iridescent tint — radial gradient cycling through seeded hues, ellipse-shaped */}
      <svg
        style={{ position: "absolute", width: "100%", height: "100%", display: "block", overflow: "hidden" }}
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Turbulence warps the gradient so it looks organic rather than concentric */}
          <filter id="tint-warp" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence type="fractalNoise" baseFrequency="0.009" numOctaves="3" seed="31" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="55" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          {activeReveals.map(({ index, color }) => {
            const h0 = (seededRandom(index * 5 + 204) - 0.5) * 80; // ±40° from leaf color
            const h1 = h0 + 40  + seededRandom(index * 5 + 200) * 50;
            const h2 = h0 + 100 + seededRandom(index * 5 + 201) * 70;
            const h3 = h0 + 170 + seededRandom(index * 5 + 202) * 60;
            const h4 = h0 + 230 + seededRandom(index * 5 + 203) * 70;
            return (
              <radialGradient key={index} id={`iri-${index}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor={shiftHue(color, h0)} stopOpacity={0.7} />
                <stop offset="28%"  stopColor={shiftHue(color, h1)} stopOpacity={0.55} />
                <stop offset="55%"  stopColor={shiftHue(color, h2)} stopOpacity={0.35} />
                <stop offset="80%"  stopColor={shiftHue(color, h3)} stopOpacity={0.12} />
                <stop offset="100%" stopColor={shiftHue(color, h4)} stopOpacity={0} />
              </radialGradient>
            );
          })}
        </defs>

        {activeReveals.map(({ index, landingX, landingY: ly, revealRadius, revealOpacity, color }) => {
          const rx = revealRadius * (0.82 + seededRandom(index * 3 + 300) * 0.36);
          const ry = revealRadius * (0.82 + seededRandom(index * 3 + 301) * 0.36);
          const angle = seededRandom(index * 3 + 302) * 160;
          return (
            <ellipse
              key={index}
              cx={landingX}
              cy={ly}
              rx={rx}
              ry={ry}
              fill={`url(#iri-${index})`}
              opacity={revealOpacity * TINT_OPACITY}
              transform={`rotate(${angle}, ${landingX}, ${ly})`}
              filter="url(#tint-warp)"
              style={{ mixBlendMode: TINT_BLEND_MODE }}
            />
          );
        })}
      </svg>

      {/* Layer 2: Grayscale image with ink-splatter reveal mask */}
      <svg
        style={{ position: "absolute", width: "100%", height: "100%", display: "block", opacity: bwLayerOpacity }}
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="bw-darken">
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncR type="linear" slope="0.82" />
              <feFuncG type="linear" slope="0.82" />
              <feFuncB type="linear" slope="0.82" />
            </feComponentTransfer>
          </filter>
          {/* Watery/ink edge distortion — stronger scale for more organic shape */}
          <filter id="ink-edge" x="-60%" y="-60%" width="220%" height="220%">
            <feTurbulence type="fractalNoise" baseFrequency="0.032" numOctaves="4" seed="17" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="90" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          {/* Ending blobs: mostly solid, soft leading edge */}
          <radialGradient id="ending-grad" cx="50%" cy="50%" r="50%">
            <stop offset="85%"  stopColor="black" stopOpacity="1" />
            <stop offset="100%" stopColor="black" stopOpacity="0" />
          </radialGradient>
          {/* Per-blob soft-edge gradient: fades to transparent so border dissolves rather than cuts */}
          {activeReveals.map(({ index }) => (
            <radialGradient key={index} id={`mask-grad-${index}`} cx="50%" cy="50%" r="50%">
              <stop offset="65%"  stopColor="black" stopOpacity="1" />
              <stop offset="100%" stopColor="black" stopOpacity="0" />
            </radialGradient>
          ))}
          <mask id="bw-mask">
            <rect width={width} height={height} fill="white" />
            {endingBlobs.map(({ bx, by, radius }, i) => (
              <circle
                key={`ending-${i}`}
                cx={bx}
                cy={by}
                r={radius}
                fill="url(#ending-grad)"
                filter="url(#ink-edge)"
              />
            ))}
            {activeReveals.map(({ index, landingX, landingY: ly, revealRadius, revealOpacity }) => {
              // Same seeded shape as tint ellipse so they align perfectly
              const rx = revealRadius * (0.82 + seededRandom(index * 3 + 300) * 0.36);
              const ry = revealRadius * (0.82 + seededRandom(index * 3 + 301) * 0.36);
              const angle = seededRandom(index * 3 + 302) * 160;
              const dots = getSplatterDots(index, landingX, ly);
              return (
                <React.Fragment key={index}>
                  <ellipse
                    cx={landingX}
                    cy={ly}
                    rx={rx}
                    ry={ry}
                    fill={`url(#mask-grad-${index})`}
                    opacity={revealOpacity}
                    transform={`rotate(${angle}, ${landingX}, ${ly})`}
                    filter="url(#ink-edge)"
                  />
                  {dots.map((dot, j) => {
                    const scale = revealRadius / MAX_REVEAL_RADIUS;
                    return (
                      <ellipse
                        key={j}
                        cx={dot.x}
                        cy={dot.y}
                        rx={dot.rx * scale}
                        ry={dot.ry * scale}
                        fill="black"
                        fillOpacity={revealOpacity * dot.opa}
                        transform={`rotate(${dot.rot}, ${dot.x}, ${dot.y})`}
                      />
                    );
                  })}
                </React.Fragment>
              );
            })}
          </mask>
        </defs>
        <image
          href={staticFile("background.png")}
          x={0}
          y={0}
          width={width}
          height={height}
          preserveAspectRatio="xMidYMid slice"
          filter="url(#bw-darken)"
          mask="url(#bw-mask)"
        />
      </svg>

      {/* Layer 3: Falling leaves */}
      <svg
        style={{ position: "absolute", width: "100%", height: "100%", display: "block", overflow: "visible" }}
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {visibleLeaves.map(
          ({ index, leafX, leafY, rotation, leafOpacity, leafScaleX, leafScaleY, color, noteName }) => (
            <LeafShape
              key={index}
              index={index}
              x={leafX}
              y={leafY}
              rotation={rotation}
              opacity={leafOpacity}
              scaleX={leafScaleX}
              scaleY={leafScaleY}
              color={color}
              noteName={noteName}
            />
          )
        )}
      </svg>
    </AbsoluteFill>
  );
};

interface LeafShapeProps {
  index: number;
  x: number;
  y: number;
  rotation: number;
  opacity: number;
  scaleX: number;
  scaleY: number;
  color: string;
  noteName: string;
}

const LeafShape: React.FC<LeafShapeProps> = ({ index, x, y, rotation, opacity, scaleX, scaleY, color, noteName }) => {
  const filterId = `leaf-${index}`;
  const W = 66, H = 72;

  return (
    <g
      transform={`translate(${x},${y}) rotate(${rotation}) scale(${scaleX},${scaleY})`}
      opacity={opacity}
    >
      <defs>
        <filter id={filterId}>
          <feFlood floodColor={color} result="flood" />
          <feComposite in="flood" in2="SourceAlpha" operator="in" />
        </filter>
      </defs>

      <image
        href={staticFile("maple.png")}
        x={-W / 2}
        y={-H / 2}
        width={W}
        height={H}
        filter={`url(#${filterId})`}
      />

      <text
        x={0}
        y={10}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={13}
        fontFamily="Georgia, serif"
        fontWeight="bold"
        fill="white"
        style={{ userSelect: "none" }}
      >
        {noteName}
      </text>
    </g>
  );
};
