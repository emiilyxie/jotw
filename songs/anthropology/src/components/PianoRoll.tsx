import React from "react";
import { NOTES } from "../notes-data";
import { PIANO_ROLL as PR } from "../config";

const MIDI_MIN = 43;
const MIDI_MAX = 73;

// Jazz-standard flat names for black keys
const NOTE_NAMES = ["c", "db", "d", "eb", "e", "f", "gb", "g", "ab", "a", "bb", "b"] as const;

function midiToName(midi: number): string {
  return NOTE_NAMES[midi % 12];
}

function midiToY(midi: number): number {
  const t = (midi - MIDI_MIN) / (MIDI_MAX - MIDI_MIN);
  // Higher pitch → higher on screen (lower y)
  return PR.top + PR.height * (1 - t);
}

interface Props {
  currentSec: number;
}

export const PianoRoll: React.FC<Props> = ({ currentSec }) => {
  const playheadInRoll = PR.playheadX - PR.left;

  const visible = (NOTES as ReadonlyArray<{ midi: number; time: number; duration: number }>).filter(
    (n) =>
      n.time + n.duration >= currentSec - PR.showPastSec &&
      n.time <= currentSec + PR.showFutureSec
  );

  return (
    <div
      style={{
        position: "absolute",
        left: PR.left,
        top: PR.top,
        width: PR.width,
        height: PR.height,
        overflow: "hidden",
      }}
    >
      {visible.map((note, idx) => {
        const noteX = playheadInRoll + (note.time - currentSec) * PR.pxPerSec;
        const noteY = midiToY(note.midi) - PR.top;

        const isPlaying = note.time <= currentSec && currentSec < note.time + note.duration;
        const isPast = currentSec >= note.time + note.duration;

        return (
          <div
            key={idx}
            style={{
              position: "absolute",
              left: noteX,
              top: noteY - PR.fontSize * 0.55,
              fontSize: PR.fontSize,
              fontFamily: PR.fontFamily,
              fontWeight: isPlaying ? 800 : isPast ? 400 : 600,
              color: isPlaying ? "#111" : isPast ? "#C8C8C8" : "#888",
              lineHeight: 1,
              whiteSpace: "nowrap",
              userSelect: "none",
            }}
          >
            {midiToName(note.midi)}
          </div>
        );
      })}

      {/* Playhead */}
      <div
        style={{
          position: "absolute",
          left: playheadInRoll,
          top: 0,
          width: 2.5,
          height: PR.height,
          background: "#1A1A1A",
          opacity: 0.4,
        }}
      />
    </div>
  );
};
