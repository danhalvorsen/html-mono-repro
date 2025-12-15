import { NoteLetter } from "./NoteLetter.js";
import { ParsedNote } from "./ParsedNote.1.js";

/* ============================================================
   NoteParser.ts
   ============================================================ */

export class NoteParser {
    parse(src: string): ParsedNote[] {
        const notes: ParsedNote[] = [];
        const chars = src.toLowerCase().split("");
        let i = 0;

        while (i < chars.length) {
            const ch = chars[i];

            if ("cdefgab".includes(ch)) {
                let n: ParsedNote = {
                    letter: ch as NoteLetter,
                    accidental: "",
                    octave: 4,
                    duration: 1
                };
                i++;

                if (chars[i] === "#" || chars[i] === "b") {
                    n.accidental = chars[i] as any;
                    i++;
                }
                while (chars[i] === "'") { n.octave++; i++; }
                while (chars[i] === ",") { n.octave--; i++; }
                if (chars[i] === "-") { n.duration = 2; i++; }
                if (chars[i] === "/") { n.duration = 0.5; i++; }

                notes.push(n);
                continue;
            }
            i++;
        }
        return notes;
    }
}
