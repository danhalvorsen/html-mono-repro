import { MidiStringParser, type NoteSymbol } from "@monorepo/music-core-midi";
import type { Waterfall } from "../component/Waterfall.ts";

export class MidiMapper {
  private readonly waterfall: Waterfall;
  private readonly parser: MidiStringParser;

  public constructor(waterfall: Waterfall) {
    this.waterfall = waterfall;
    this.parser = new MidiStringParser();
  }

  public play(notes: Array<NoteSymbol>, heldMs: number = 0): void {
    for (const note of notes) {
      const step = this.parser.parse(`${note}4`)[0];

      if (step === undefined || step.message === null) {
        continue;
      }

      const columnIndex = step.message.note.value() % 12;

      this.waterfall.createGavityFallingObjectInColumn(columnIndex, heldMs);
      this.waterfall.completeGavityFallingObjectInColumn(columnIndex, heldMs);
    }
  }
}