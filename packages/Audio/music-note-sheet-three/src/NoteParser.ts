import { NoteLetter } from "./code.js";
import { ParsedNote } from "./ParsedNote.js";

/**
 * Parser supporting:
 * ccccC#bb,,c''' /2  C###  d-  f2  G/4
 */

export class NoteParser {

  private isLetter(ch: string) {
    return "cdefgabCDEFGAB".includes(ch);
  }

  parse(src: string): ParsedNote[] {
    const notes: ParsedNote[] = [];
    const txt = src.replace(/\s+/g, "");
    let i = 0;

    while (i < txt.length) {
      const ch = txt[i];

      if (this.isLetter(ch)) {
        const original = ch;
        const letter = ch.toLowerCase() as NoteLetter;
        let octave = original === letter ? 4 : 5; // uppercase = higher octave
        i++;

        // Gather accidentals ## bb
        let accidental = "";
        while (txt[i] === "#" || txt[i] === "b") {
          accidental += txt[i];
          i++;
        }

        // Octave modifiers ' or ,
        while (txt[i] === "'") {
          octave++;
          i++;
        }
        while (txt[i] === ",") {
          octave--;
          i++;
        }

        // Duration modifiers
        let duration = 1;
        if (txt[i] === "-") {
          duration = 2;
          i++;
        }
        if (txt[i] === "/") {
          let slashCount = 0;
          while (txt[i] === "/") {
            slashCount++;
            i++;
          }
          duration = 1 / Math.pow(2, slashCount);
        }

        // Numeric duration: c2 (half), c4 (quarter), c8 (eighth)
        if (/\d/.test(txt[i])) {
          const num = parseInt(txt[i], 10);
          if (num > 0) duration = 4 / num;
          i++;
        }

        notes.push({ letter, accidental, octave, duration });
        continue;
      }

      i++; // skip unknown
    }

    return notes;
  }
}
