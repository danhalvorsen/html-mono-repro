import type { NoteSymbol } from "@monorepo/music-core-midi";
import type { AccordFormula } from "./AccordFormula.js";

export type Accord = Readonly<{
  readonly root: NoteSymbol;
  readonly formula: AccordFormula;
  readonly notes: Array<NoteSymbol>;
}>;
