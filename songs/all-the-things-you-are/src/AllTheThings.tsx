import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CatForm } from "./components/CatForm";
import { CentralCat } from "./components/CentralCat";
import { NOTE_TO_FORM } from "./note-map";
import { NOTES } from "./notes-data";
import { POSITIONS } from "./positions";

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

export const PADDING_SECONDS = 2;

export const AllTheThings: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentSec = frame / fps - PADDING_SECONDS;

  return (
    <AbsoluteFill>
      <Img src={staticFile("clouds.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute" }} />
      <CentralCat />
      {NOTE_NAMES.map((note) => {
        const pitchClass = NOTE_NAMES.indexOf(note);

        const activeNote = NOTES.find(
          (n) => n.midi % 12 === pitchClass && currentSec >= n.time && currentSec < n.time + n.duration
        );
        const isActive = !!activeNote;
        const framesSinceOnset = isActive ? Math.round((currentSec - activeNote.time) * fps) : 0;

        const recentlyEndedNote = !isActive
          ? [...NOTES]
              .filter((n) => n.midi % 12 === pitchClass && currentSec >= n.time + n.duration)
              .sort((a, b) => b.time + b.duration - (a.time + a.duration))[0] ?? null
          : null;
        const framesSinceRelease = recentlyEndedNote
          ? Math.round((currentSec - (recentlyEndedNote.time + recentlyEndedNote.duration)) * fps)
          : null;

        return (
          <CatForm
            key={note}
            note={note}
            formName={NOTE_TO_FORM[note]}
            isActive={isActive}
            framesSinceOnset={framesSinceOnset}
            framesSinceRelease={framesSinceRelease}
            position={POSITIONS[note]}
            fps={fps}
          />
        );
      })}
    </AbsoluteFill>
  );
};
