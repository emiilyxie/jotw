// Map each pitch class to a form name.
// Form names determine which sprite files are loaded:
//   public/sprites/{form}-idle.png  (default)
//   public/sprites/{form}-sing.png  (when note is active)
export const NOTE_TO_FORM: Record<string, string> = {
  C:    "crayon",
  "C#": "teapot",
  D:    "duck",
  "D#": "saxophone",
  E:    "email",
  F:    "finance",
  "F#": "phone",
  G:    "geometry",
  "G#": "toaster",
  A:    "airplane",
  "A#": "pea-shooter",
  B:    "basketball",
};
