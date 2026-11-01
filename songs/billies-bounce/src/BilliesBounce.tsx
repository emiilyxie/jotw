import React from "react";
import { useCurrentFrame, useVideoConfig, AbsoluteFill, interpolate } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Scene } from "./components/Scene";

export const INTRO_FRAMES = 60;
export const PAN_FRAMES = 60;

export const BilliesBounce: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const titleOpacity = interpolate(
    frame,
    [0, 20, INTRO_FRAMES - 15, INTRO_FRAMES],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ background: "#0a0a14" }}>
      <ThreeCanvas width={width} height={height}>
        <Scene />
      </ThreeCanvas>
      {frame < INTRO_FRAMES + 5 && (
        <AbsoluteFill
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            opacity: titleOpacity,
          }}
        >
          <div
            style={{
              fontSize: 110,
              fontWeight: "900",
              color: "#ffffff",
              fontFamily: "Georgia, 'Times New Roman', serif",
              letterSpacing: "0.04em",
              textShadow:
                "0 0 80px rgba(255, 200, 80, 0.9), 0 0 30px rgba(255, 180, 60, 0.6)",
            }}
          >
            Billie's Bounce
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
