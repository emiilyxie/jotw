import React from "react";
import { Composition } from "remotion";
import { Anthropology } from "./Anthropology";
import { TOTAL_DURATION_SECONDS } from "./notes-data";
import { FPS, PADDING_SECONDS } from "./angle-data";

export const Root: React.FC = () => {
  const totalFrames = Math.max(
    Math.ceil((TOTAL_DURATION_SECONDS + PADDING_SECONDS * 2) * FPS),
    90
  );

  return (
    <Composition
      id="Anthropology"
      component={Anthropology}
      durationInFrames={totalFrames}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
