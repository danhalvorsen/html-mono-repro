import type { NoteSymbol } from "@monorepo/music-core-midi";
import type { Accord } from "./Accord.js";
import type { AccordFormula } from "./AccordFormula.js";
import { AccordFormulaCatalog } from "./AccordFormulaCatalog.js";
import { ChromaticNoteRing } from "./ChromaticNoteRing.js";

export class AccordBuilder {
  private readonly formulaCatalog: AccordFormulaCatalog;
  private readonly chromaticNoteRing: ChromaticNoteRing;

  public constructor(
    formulaCatalog: AccordFormulaCatalog = new AccordFormulaCatalog(),
    chromaticNoteRing: ChromaticNoteRing = new ChromaticNoteRing(),
  ) {
    this.formulaCatalog = formulaCatalog;
    this.chromaticNoteRing = chromaticNoteRing;
  }

  public createRandomAccord(): Array<NoteSymbol> {
    return this.createRandom().notes;
  }

  public createRandom(): Accord {
    return this.create(
      this.chromaticNoteRing.getRandomRoot(),
      this.formulaCatalog.getRandom(),
    );
  }

  public create(root: NoteSymbol, formula: AccordFormula): Accord {
    return {
      root,
      formula,
      notes: this.chromaticNoteRing.createUniqueNotes(root, formula.intervals),
    };
  }
}
