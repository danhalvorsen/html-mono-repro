import { isNoteSymbol } from "../domain/NoteDomain";

export interface IPianoTangentNamingPolicy {
  toTangentId(note: string, octaveIndex: number): string;
}

export class DefaultPianoTangentNamingPolicy implements IPianoTangentNamingPolicy {
  public toTangentId(note: string, octaveIndex: number): string {
    if (!isNoteSymbol(note)) {
      throw new Error(`Invalid note symbol: ${note}`);
    }

    if (!Number.isInteger(octaveIndex) || octaveIndex < 0) {
      throw new Error(`Invalid octave index: ${octaveIndex}`);
    }

    return `${note}${octaveIndex + 1}`;
  }
}