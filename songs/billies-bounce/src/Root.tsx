import React from "react";
import { Composition } from "remotion";
import { BilliesBounce, INTRO_FRAMES, PAN_FRAMES } from "./BilliesBounce";
import { TOTAL_DURATION_SECONDS } from "./notes-data";

const FPS = 30;
const TAIL_SECONDS = 2;

export const Root: React.FC = () => {
  const bouncingFrames = Math.ceil(TOTAL_DURATION_SECONDS * FPS) || 300;
  const totalFrames = INTRO_FRAMES + PAN_FRAMES + bouncingFrames + TAIL_SECONDS * FPS;

  return (
    <Composition
      id="BilliesBounce"
      component={BilliesBounce}
      durationInFrames={totalFrames}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
