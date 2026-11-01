// ─── Edit this file to adjust layout without touching component logic ───────

export const HEADER = {
  fontSize: 130,  // px — controls glyph size on the rasterisation canvas
  dotR: 3,      // dot radius in px
  dotSp: 6.5,      // dot grid spacing in px (smaller = denser)
  baseline: 170,  // y on the canvas where letters sit before yOff is applied
  canvasH: 230,   // canvas height — increase if tall letters get clipped
  // Per-letter layout. x = left edge of glyph on canvas.
  // yOff shifts up (negative) or down (positive) from baseline.
  // rot rotates clockwise (positive) or counter-clockwise (negative) in degrees.
  letters: [
    { char: "a", x:   48, yOff:   0, rot:  0   },
    { char: "n", x:  138, yOff: -22, rot: -3   },
    { char: "t", x:  236, yOff:  14, rot:  4   },
    { char: "h", x:  302, yOff:  -8, rot: -1.5 },
    { char: "r", x:  402, yOff:  24, rot:  5   },
    { char: "o", x:  460, yOff: -18, rot: -4   },
    { char: "p", x:  552, yOff:   6, rot:  2   },
    { char: "o", x:  644, yOff: -26, rot: -5   },
    { char: "l", x:  733, yOff:  10, rot:  3   },
    { char: "o", x:  773, yOff: -14, rot: -2   },
    { char: "g", x:  863, yOff:  18, rot:  4   },
    { char: "y", x:  956, yOff:  -8, rot: -3   },
  ],
} as const;


export const PIANO_ROLL = {
  left: 100,         // px from left edge of frame
  top: 250,         // px from top edge of frame
  width: 2000,       // px wide
  height: 200,      // px tall
  playheadX: 250,   // absolute x of the playhead line
  pxPerSec: 120,     // horizontal pixels per second of music
  showPastSec: 2.2,
  showFutureSec: 15,
  fontSize: 20,      // note label size in px
  fontFamily: '"Courier New", Courier, monospace',
} as const;

export const EARTH = {
  cx: 1630,        // x center (push right to go off-screen)
  cy: 900,         // y center (push down to go off-screen)
  r: 500,          // radius
  dotSp: 6.5,        // dot grid spacing in px (smaller = denser)
  dotR: 3,       // dot radius in px
  noiseFreq: 0.0008, // Perlin noise spatial frequency (smaller = larger blobs)
  // Gradient map color stops. Each stop: { at: 0–1, r/g/b: 0–1 }.
  // Place two stops with very close `at` values for a sharp color boundary.
  // Spread them apart for a gradual fade.
  noiseColorMap: [
    { at: 0.00, r: 0.0, g: 0.52, b: 0.18 }, // deep ocean — near black-blue
    { at: 0.34, r: 0.02, g: 0.90, b: 0.80 }, // mid ocean — gradual
    { at: 0.35, r: 0.20, g: 0.70, b: 0.90 }, // ← sharp: dark forest green (land)
    { at: 0.52, r: 0.58, g: 0.32, b: 0.82 }, // lighter grassland — gradual
    { at: 0.53, r: 0.12, g: 0.72, b: 0.50 }, // ← sharp: sandy desert / arid
    { at: 0.75, r: 0.20, g: 0.38, b: 0.50 }, // mountain gray-brown — gradual
    { at: 0.76, r: 0.12, g: 0.95, b: 1.00 }, // ← sharp: cloud / snow
    { at: 1.00, r: 0.00, g: 1.00, b: 1.00 }, // pure white
  ],
} as const;

export const ORBIT = {
  minSpeed: 0.04,  // rad/sec — idle drift during silence
  maxSpeed: 1.00,  // rad/sec — fastest during dense note runs
  decay: 3.0,      // how fast each note's contribution fades (higher = snappier)
  densityNorm: 2,  // density value that maps to maxSpeed (raise to slow response)
} as const;

export const RING = {
  rx: 700,         // horizontal semi-axis of the ring ellipse
  ry: 155,         // vertical semi-axis (smaller = flatter / more edge-on)
  tiltDeg: 15,     // tilt of ring's major axis in degrees
                   // positive = slopes upper-left to lower-right (like \)
                   // negative = slopes lower-left to upper-right (like /)
  nCats: 30,
  catBaseSize: 300, // sprite size at the front of the ring (px)
  scaleBack: 0.60,  // size multiplier at the back (creates depth illusion)
  scaleFront: 1.0,  // size multiplier at the front
} as const;
