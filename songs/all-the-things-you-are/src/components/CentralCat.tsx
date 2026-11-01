import React from "react";
import { Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BPM } from "../notes-data";
import { PADDING_SECONDS } from "../AllTheThings";
import { POSITIONS } from "../positions";

export const CentralCat: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentSec = Math.max(0, frame / fps - PADDING_SECONDS);
  const beatNum = Math.floor(currentSec * BPM / 60);
  const src = staticFile(`sprites/${beatNum % 2 === 0 ? "cat1" : "cat2"}.PNG`);
  const { x, y, size } = POSITIONS["cat"];

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
      }}
    >
      <Img
        src={src}
        width={size}
        height={size}
        style={{ objectFit: "contain", imageRendering: "pixelated", display: "block" }}
      />
    </div>
  );
};
