# Songs

Each subdirectory is one song — a jazz solo transcription turned into a YouTube video.

## What lives here

```
songs/
  <song-name>/        one Remotion project per song
    *.mid             MIDI export of the transcribed solo
    src/              Remotion composition + components
    scripts/          parse-midi and other helpers
    out/              rendered video output (gitignored)
```

## Workflow

1. Transcribe the solo (external — MuseScore, etc.)
2. Export as MIDI into the song folder
3. Run `npm run parse-midi` to convert MIDI → note data
4. Build the Remotion composition in `src/` (the visual)
5. Preview with `npm run studio`, render with `npm run render`
6. Upload `out/<song>.mp4` to YouTube

## The visual

The goal is an animated visualization that plays in sync with the solo audio — showing the notes, rhythm, and structure of the improvisation in a way that's both musically informative and visually engaging. Each song may iterate on the design.
