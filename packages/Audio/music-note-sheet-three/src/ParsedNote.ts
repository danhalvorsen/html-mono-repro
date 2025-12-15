import { NoteLetter } from "./code.js";


export interface ParsedNote {
  letter: NoteLetter;
  accidental: string; // "", "#", "##", "b", "bb"
  octave: number;
  duration: number; // 1 = quarter, 0.5 = eighth, 2 = half, etc.
}
