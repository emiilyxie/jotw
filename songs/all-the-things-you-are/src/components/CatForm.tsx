import React from "react";
import { Img, spring, staticFile } from "remotion";

interface CatFormProps {
  note: string;
  formName: string;
  isActive: boolean;
  framesSinceOnset: number;
  framesSinceRelease: number | null;
  position: { x: number; y: number; size: number };
  fps: number;
}

export const CatForm: React.FC<CatFormProps> = ({
  note,
  formName,
  isActive,
  framesSinceOnset,
  framesSinceRelease,
  position,
  fps,
}) => {
  const scale = isActive
    ? spring({ fps, frame: framesSinceOnset, config: { damping: 10, stiffness: 100 }, from: 1, to: 1.22 })
    : framesSinceRelease !== null
      ? spring({ fps, frame: framesSinceRelease, config: { damping: 8, stiffness: 70 }, from: 1.22, to: 1 })
      : 1;

  const showSing = isActive || (framesSinceRelease !== null && framesSinceRelease < 8);
  const src = staticFile(`sprites/${formName}-${showSing ? "sing" : "idle"}.PNG`);

  return (
    <div
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        transform: `translate(-50%, -50%) scale(${scale})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        transformOrigin: "center center",
      }}
    >
      <Img
        src={src}
        width={position.size}
        height={position.size}
        style={{ objectFit: "contain", imageRendering: "pixelated", display: "block" }}
      />
      <span
        style={{
          fontFamily: "monospace",
          fontSize: 36,
          fontWeight: "bold",
          color: "#222",
          letterSpacing: 1,
          userSelect: "none",
          marginTop: -4,
        }}
      >
        {note}
      </span>
    </div>
  );
};
