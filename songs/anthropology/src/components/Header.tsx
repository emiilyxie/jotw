import React from "react";
import { HEADER as H } from "../config";

// Single-letter rasterisation canvas — wide/tall enough for any glyph
const L_W = 260;
const L_H = 260;
const L_X = 60;  // where each letter is drawn on the small canvas
const L_Y = 180; // baseline on the small canvas

// Per-letter dot arrays in LOCAL space (relative to the letter's draw origin).
// Static rot is baked into the canvas draw so the dot SHAPE is already rotated.
// The SVG group then adds only the animated delta rotation on top.
const LETTER_DOTS: Array<Array<{ lx: number; ly: number }>> = (() => {
  if (typeof document === "undefined") return H.letters.map(() => []);

  const canvas = document.createElement("canvas");
  canvas.width = L_W;
  canvas.height = L_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return H.letters.map(() => []);

  ctx.font = `700 ${H.fontSize}px Arial, "Helvetica Neue", Helvetica, sans-serif`;

  return H.letters.map(({ char, rot }) => {
    ctx.clearRect(0, 0, L_W, L_H);
    ctx.fillStyle = "black";
    ctx.save();
    ctx.translate(L_X, L_Y);
    ctx.rotate((rot * Math.PI) / 180);
    ctx.fillText(char, 0, 0);
    ctx.restore();

    const { data } = ctx.getImageData(0, 0, L_W, L_H);
    const dots: Array<{ lx: number; ly: number }> = [];

    for (let y = H.dotR; y <= L_H - H.dotR; y += H.dotSp) {
      for (let x = 0; x <= L_W - H.dotR; x += H.dotSp) {
        if (data[(Math.round(y) * L_W + Math.round(x)) * 4 + 3] >= 128) {
          dots.push({ lx: x - L_X, ly: y - L_Y });
        }
      }
    }
    return dots;
  });
})();

interface Props {
  currentSec: number;
}

export const Header: React.FC<Props> = ({ currentSec }) => (
  <svg
    style={{ position: "absolute", top: 0, left: 0 }}
    width={1920}
    height={H.canvasH}
    viewBox={`0 0 1920 ${H.canvasH}`}
    overflow="visible"
  >
    {H.letters.map(({ x, yOff, rot }, i) => {
      const phase = i * 0.72;
      const dy   = 3.5  * Math.sin(currentSec * 2.4  + phase);
      const dx   = 1.5  * Math.sin(currentSec * 1.8  + phase + 0.5);
      const drot = 1.2  * Math.sin(currentSec * 2.0  + phase + 1.3);

      return (
        <g
          key={i}
          transform={`translate(${x + dx}, ${H.baseline + yOff + dy}) rotate(${drot})`}
        >
          {LETTER_DOTS[i].map((d, j) => (
            <circle key={j} cx={d.lx} cy={d.ly} r={H.dotR} fill="#1C1C1C" />
          ))}
        </g>
      );
    })}
  </svg>
);
