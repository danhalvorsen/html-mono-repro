import { MidiStringParser, NoteSymbol } from "@monorepo/music-core-midi";
import type { Waterfall } from "../component/Waterfall.ts";

export class MidiMapper {
  private readonly waterfall: Waterfall;
  private readonly parser: MidiStringParser;

  public constructor(waterfall: Waterfall) {
    this.waterfall = waterfall;
    this.parser = new MidiStringParser();
  }

  public play(notes: Array<NoteSymbol>): void {
    for (const note of notes) {
      const step = this.parser.parse(`${note}4`)[0];

      if (step?.message === null || step === undefined) {
        continue;
      }

      this.waterfall.createGavityFallingObjectInColumn(
        step.message.note.value() % 12,
      );
    }
  }
}