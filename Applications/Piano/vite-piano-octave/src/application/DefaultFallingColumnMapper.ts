import { SEMITONE_BY_NOTE, isNoteSymbol } from "../domain/NoteDomain";
import type { IFallingColumnMapper } from "./IFallingColumnMapper";

export class DefaultFallingColumnMapper implements IFallingColumnMapper {
  public toColumn(note: string, octaveIndex: number): number | null {
    if (!isNoteSymbol(note)) return null;
    if (octaveIndex < 0 || !Number.isInteger(octaveIndex)) return null;
    return octaveIndex * 12 + SEMITONE_BY_NOTE[note];
  }
}
