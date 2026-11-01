import React from "react";
import { Composition } from "remotion";
import { AutumnLeaves, PADDING_SECONDS, OUTRO_SECONDS } from "./AutumnLeaves";
import { TOTAL_DURATION_SECONDS } from "./notes-data";

const FPS = 30;

export const Root: React.FC = () => {
  const totalFrames = Math.ceil((TOTAL_DURATION_SECONDS + PADDING_SECONDS + OUTRO_SECONDS) * FPS);

  return (
    <Composition
      id="AutumnLeaves"
      component={AutumnLeaves}
      durationInFrames={totalFrames}
      fps={FPS}
      width={1440}
      height={1080}
    />
  );
};
