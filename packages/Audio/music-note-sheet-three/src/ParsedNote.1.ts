import { NoteLetter } from "./NoteLetter.js";


export interface ParsedNote {
    letter: NoteLetter;
    accidental: "" | "#" | "b";
    octave: number;
    duration: number;
}
