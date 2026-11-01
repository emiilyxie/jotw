import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { useThree } from "@react-three/fiber";
import { BOUNCE_EVENTS } from "../bounce-events";
import { NOTES } from "../notes-data";
import { INTRO_FRAMES, PAN_FRAMES } from "../BilliesBounce";

const FPS = 30;
const BALL_RADIUS = 0.75;
const REF_GAP_FRAMES = 30;   // 1 second gap → reference height
const REF_HEIGHT = 3.5;
const MIN_HEIGHT = 0.4;
const MAX_HEIGHT = 6.0;

const PITCH_COLORS = [
  "#ff4444", "#ff6b35", "#ffd700", "#9acd32",
  "#00bfff", "#1e90ff", "#9370db", "#ff69b4",
  "#ff1493", "#00ced1", "#32cd32", "#ff8c00",
];

type Shape = "sphere" | "cube" | "cylinder";
const PITCH_SHAPES: Shape[] = [
  "sphere", "sphere", "cube", "cube",
  "cylinder", "cylinder", "sphere", "cube",
  "cylinder", "sphere", "cube", "cylinder",
];

function getCurrentNote(frame: number) {
  const time = frame / FPS;
  let best = NOTES[0] ?? { midi: 60, time: 0, duration: 0 };
  for (let i = 0; i < NOTES.length; i++) {
    if (NOTES[i].time <= time) best = NOTES[i];
    else break;
  }
  const pc = best.midi % 12;
  return { shape: PITCH_SHAPES[pc], color: PITCH_COLORS[pc] };
}

function bounceHeight(gap: number): number {
  const h = REF_HEIGHT * (gap / REF_GAP_FRAMES);
  return Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, h));
}

function getBallPhysics(frame: number) {
  if (BOUNCE_EVENTS.length === 0) {
    const t = (frame % 45) / 45;
    return { y: REF_HEIGHT * Math.sin(Math.PI * t), scaleY: 1, scaleXZ: 1 };
  }

  let prevIdx = -1;
  for (let i = 0; i < BOUNCE_EVENTS.length; i++) {
    if (BOUNCE_EVENTS[i].frame <= frame) prevIdx = i;
    else break;
  }

  if (prevIdx === -1) return { y: 0, scaleY: 0.85, scaleXZ: 1.15 };

  const next = BOUNCE_EVENTS[prevIdx + 1];
  if (!next) return { y: 0, scaleY: 0.85, scaleXZ: 1.15 };

  const gap = next.frame - BOUNCE_EVENTS[prevIdx].frame;
  const t = (frame - BOUNCE_EVENTS[prevIdx].frame) / gap;
  const rawY = bounceHeight(gap) * 4 * t * (1 - t);

  const groundProx = Math.max(0, 1 - rawY / 0.6);
  return {
    y: rawY,
    scaleY: 1 - groundProx * 0.38,
    scaleXZ: 1 + groundProx * 0.22,
  };
}

function CameraRig() {
  const { camera } = useThree();
  const frame = useCurrentFrame();

  const panT = interpolate(
    frame,
    [INTRO_FRAMES, INTRO_FRAMES + PAN_FRAMES],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  // ease in-out quad
  const eased = panT < 0.5 ? 2 * panT * panT : -1 + (4 - 2 * panT) * panT;

  const camY = interpolate(eased, [0, 1], [14, 4]);
  const camZ = interpolate(eased, [0, 1], [3, 11]);
  const lookY = interpolate(eased, [0, 1], [0, 1]);

  camera.position.set(0, camY, camZ);
  camera.lookAt(0, lookY, 0);

  return null;
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color="#111122" roughness={0.9} />
    </mesh>
  );
}

// Precompute accumulated spin angle per bounce-frame: O(n) once, O(1) lookup per render
const SPIN_ANGLES = (() => {
  const last = BOUNCE_EVENTS.length > 0
    ? BOUNCE_EVENTS[BOUNCE_EVENTS.length - 1].frame + 300
    : 600;
  const angles = new Float32Array(last + 1);
  let angle = 0;
  let prevIdx = -1;
  for (let f = 0; f <= last; f++) {
    angles[f] = angle;
    while (prevIdx + 1 < BOUNCE_EVENTS.length && BOUNCE_EVENTS[prevIdx + 1].frame <= f) prevIdx++;
    const next = BOUNCE_EVENTS[prevIdx + 1];
    if (prevIdx === -1 || !next) {
      angle += 0.04;
    } else {
      const gap = next.frame - BOUNCE_EVENTS[prevIdx].frame;
      const t = (f - BOUNCE_EVENTS[prevIdx].frame) / gap;
      // faster near ground (|1-2t|=1), slower at apex (|1-2t|=0)
      angle += 0.08 * (0.3 + 0.7 * Math.abs(1 - 2 * t));
    }
  }
  return angles;
})();

function Ball() {
  const frame = useCurrentFrame();
  if (frame < INTRO_FRAMES + PAN_FRAMES) return null;

  const bounceFrame = frame - (INTRO_FRAMES + PAN_FRAMES);
  const { y, scaleY, scaleXZ } = getBallPhysics(bounceFrame);
  const { shape, color } = getCurrentNote(bounceFrame);

  const posY = BALL_RADIUS * scaleY + y;
  const spinY = SPIN_ANGLES[Math.min(bounceFrame, SPIN_ANGLES.length - 1)];
  const tumbleX = bounceFrame * 0.03;

  return (
    <mesh position={[0, posY, 0]} scale={[scaleXZ, scaleY, scaleXZ]} rotation={[tumbleX, spinY, 0]}>
      {shape === "sphere" && <sphereGeometry args={[BALL_RADIUS, 32, 32]} />}
      {shape === "cube" && <boxGeometry args={[BALL_RADIUS * 1.7, BALL_RADIUS * 1.7, BALL_RADIUS * 1.7]} />}
      {shape === "cylinder" && <cylinderGeometry args={[BALL_RADIUS * 0.85, BALL_RADIUS * 0.85, BALL_RADIUS * 1.9, 32]} />}
      <meshStandardMaterial
        color={color}
        roughness={0.25}
        metalness={0.15}
        emissive={color}
        emissiveIntensity={0.25}
      />
    </mesh>
  );
}

export function Scene() {
  return (
    <>
      <CameraRig />
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 10, 6]} intensity={1.4} />
      <pointLight position={[0, 6, 0]} intensity={0.5} color="#ffe8c0" />
      <Ground />
      <Ball />
    </>
  );
}
