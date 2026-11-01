import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, Img, staticFile } from "remotion";
import { Header } from "./components/Header";
import { PianoRoll } from "./components/PianoRoll";
import { EarthZone } from "./components/EarthZone";
import { Corners } from "./components/Corners";
import { PADDING_SECONDS } from "./angle-data";

export const Anthropology: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentSec = frame / fps - PADDING_SECONDS;

  return (
    <AbsoluteFill style={{ background: "#FFFFFF" }}>
      {/* Preload cat sprite — Remotion waits for <Img> before capturing each frame */}
      <Img
        src={staticFile("sprites/cat.PNG")}
        style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
        from={-6} />
      <Header currentSec={currentSec} />
      <PianoRoll currentSec={currentSec} />
      <EarthZone currentSec={currentSec} frame={frame} />
      <Corners />
    </AbsoluteFill>
  );
};
