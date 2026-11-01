import { NOTES, TOTAL_DURATION_SECONDS } from "./notes-data";
import { ORBIT } from "./config";

export const FPS = 30;
export const PADDING_SECONDS = 2;

function getAngularVelocity(t: number): number {
  let density = 0;
  for (const note of NOTES) {
    const dt = t - note.time;
    if (dt < 0 || dt > 4) continue;
    density += Math.exp(-ORBIT.decay * dt);
  }
  return ORBIT.minSpeed + (ORBIT.maxSpeed - ORBIT.minSpeed) * Math.min(density / ORBIT.densityNorm, 1);
}

const totalSec = TOTAL_DURATION_SECONDS + PADDING_SECONDS * 2 + 2;
const totalFrames = Math.ceil(totalSec * FPS);

// Precomputed cumulative angle for each frame — computed once at module load
export const ANGLE_TABLE: Float64Array = (() => {
  const dt = 1 / FPS;
  const table = new Float64Array(totalFrames + 2);
  for (let i = 1; i <= totalFrames + 1; i++) {
    const t = (i - 1) * dt - PADDING_SECONDS;
    table[i] = table[i - 1] + getAngularVelocity(Math.max(0, t)) * dt;
  }
  return table;
})();
