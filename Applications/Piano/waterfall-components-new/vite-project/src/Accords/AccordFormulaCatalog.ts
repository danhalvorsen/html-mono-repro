import type { AccordFormula } from "./AccordFormula.js";

export class AccordFormulaCatalog {
  private static readonly Formulas: readonly AccordFormula[] = [
    { id: "maj", name: "Major", category: "major", intervals: [0, 4, 7] },
    { id: "maj6", name: "Major 6", category: "major", intervals: [0, 4, 7, 9] },
    { id: "maj7", name: "Major 7", category: "major", intervals: [0, 4, 7, 11] },
    { id: "maj9", name: "Major 9", category: "extended", intervals: [0, 4, 7, 11, 14] },
    { id: "maj11", name: "Major 11", category: "extended", intervals: [0, 4, 7, 11, 14, 17] },
    { id: "maj13", name: "Major 13", category: "extended", intervals: [0, 4, 7, 11, 14, 17, 21] },

    { id: "m", name: "Minor", category: "minor", intervals: [0, 3, 7] },
    { id: "m6", name: "Minor 6", category: "minor", intervals: [0, 3, 7, 9] },
    { id: "m7", name: "Minor 7", category: "minor", intervals: [0, 3, 7, 10] },
    { id: "mMaj7", name: "Minor Major 7", category: "minor", intervals: [0, 3, 7, 11] },
    { id: "m9", name: "Minor 9", category: "extended", intervals: [0, 3, 7, 10, 14] },
    { id: "m11", name: "Minor 11", category: "extended", intervals: [0, 3, 7, 10, 14, 17] },
    { id: "m13", name: "Minor 13", category: "extended", intervals: [0, 3, 7, 10, 14, 17, 21] },

    { id: "7", name: "Dominant 7", category: "seventh", intervals: [0, 4, 7, 10] },
    { id: "9", name: "Dominant 9", category: "extended", intervals: [0, 4, 7, 10, 14] },
    { id: "11", name: "Dominant 11", category: "extended", intervals: [0, 4, 7, 10, 14, 17] },
    { id: "13", name: "Dominant 13", category: "extended", intervals: [0, 4, 7, 10, 14, 17, 21] },

    { id: "sus2", name: "Suspended 2", category: "suspended", intervals: [0, 2, 7] },
    { id: "sus4", name: "Suspended 4", category: "suspended", intervals: [0, 5, 7] },
    { id: "7sus4", name: "7 Sus 4", category: "suspended", intervals: [0, 5, 7, 10] },

    { id: "dim", name: "Diminished", category: "diminished", intervals: [0, 3, 6] },
    { id: "dim7", name: "Diminished 7", category: "diminished", intervals: [0, 3, 6, 9] },
    { id: "m7b5", name: "Half Diminished", category: "diminished", intervals: [0, 3, 6, 10] },

    { id: "aug", name: "Augmented", category: "augmented", intervals: [0, 4, 8] },
    { id: "aug7", name: "Augmented 7", category: "augmented", intervals: [0, 4, 8, 10] },
    { id: "augMaj7", name: "Augmented Major 7", category: "augmented", intervals: [0, 4, 8, 11] },

    { id: "add9", name: "Add 9", category: "added", intervals: [0, 4, 7, 14] },
    { id: "madd9", name: "Minor Add 9", category: "added", intervals: [0, 3, 7, 14] },
    { id: "6add9", name: "6 Add 9", category: "added", intervals: [0, 4, 7, 9, 14] },

    { id: "7b5", name: "7 Flat 5", category: "altered", intervals: [0, 4, 6, 10] },
    { id: "7#5", name: "7 Sharp 5", category: "altered", intervals: [0, 4, 8, 10] },
    { id: "7b9", name: "7 Flat 9", category: "altered", intervals: [0, 4, 7, 10, 13] },
    { id: "7#9", name: "7 Sharp 9", category: "altered", intervals: [0, 4, 7, 10, 15] },
    { id: "9#11", name: "9 Sharp 11", category: "altered", intervals: [0, 4, 7, 10, 14, 18] },
    { id: "13b9", name: "13 Flat 9", category: "altered", intervals: [0, 4, 7, 10, 13, 21] },
    { id: "13#11", name: "13 Sharp 11", category: "altered", intervals: [0, 4, 7, 10, 14, 18, 21] },
  ];

  public getAll(): readonly AccordFormula[] {
    return AccordFormulaCatalog.Formulas;
  }

  public getRandom(): AccordFormula {
    const formulas = this.getAll();
    const formula = formulas[Math.floor(Math.random() * formulas.length)];

    if (formula === undefined) {
      throw new Error("No accord formulas registered.");
    }

    return formula;
  }
}
