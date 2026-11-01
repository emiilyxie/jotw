import React from "react";
import { Composition } from "remotion";
import { AllTheThings, PADDING_SECONDS } from "./AllTheThings";
import { TOTAL_DURATION_SECONDS } from "./notes-data";

const FPS = 30;

export const Root: React.FC = () => {
  const totalFrames = Math.ceil((TOTAL_DURATION_SECONDS + PADDING_SECONDS * 2) * FPS);

  return (
    <Composition
      id="AllTheThings"
      component={AllTheThings}
      durationInFrames={totalFrames}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
