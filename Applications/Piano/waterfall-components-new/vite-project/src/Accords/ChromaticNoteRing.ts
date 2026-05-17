import { NoteSymbol, type NoteSymbol as NoteSymbolValue } from "@monorepo/music-core-midi";

export class ChromaticNoteRing {
  private static readonly Notes: readonly NoteSymbolValue[] = [
    NoteSymbol.C,
    NoteSymbol.CSharp,
    NoteSymbol.D,
    NoteSymbol.DSharp,
    NoteSymbol.E,
    NoteSymbol.F,
    NoteSymbol.FSharp,
    NoteSymbol.G,
    NoteSymbol.GSharp,
    NoteSymbol.A,
    NoteSymbol.ASharp,
    NoteSymbol.B,
  ];

  public getRandomRoot(): NoteSymbolValue {
    return this.getNoteAt(Math.floor(Math.random() * ChromaticNoteRing.Notes.length));
  }

  public transpose(root: NoteSymbolValue, semitones: number): NoteSymbolValue {
    const rootIndex = ChromaticNoteRing.Notes.indexOf(root);

    if (rootIndex < 0) {
      throw new Error(`Unsupported accord root: ${root}`);
    }

    return this.getNoteAt(rootIndex + semitones);
  }

  public createUniqueNotes(
    root: NoteSymbolValue,
    intervals: readonly number[],
  ): Array<NoteSymbolValue> {
    const notes: NoteSymbolValue[] = [];

    for (const interval of intervals) {
      const note = this.transpose(root, interval);

      if (!notes.includes(note)) {
        notes.push(note);
      }
    }

    return notes;
  }

  private getNoteAt(index: number): NoteSymbolValue {
    const wrappedIndex =
      ((index % ChromaticNoteRing.Notes.length) + ChromaticNoteRing.Notes.length) %
      ChromaticNoteRing.Notes.length;

    const note = ChromaticNoteRing.Notes[wrappedIndex];

    if (note === undefined) {
      throw new Error(`Invalid chromatic note index: ${index}`);
    }

    return note;
  }
}
