import type { IMidiEventEngine, Song } from "@monorepo/music-core-midi/accords-types";
import type { MidiLogicalEvent } from "@monorepo/music-core-midi/accords-types";
import { MidiBinaryString } from "../parser/binary-string.js";
import { StandardMidiFileParser } from "../parser/midi-file-parser.js";
import { TempoMap } from "../processor/tempo-map.js";
import { MidiLogicalEventFactory } from "../processor/logical-event-factory.js";

export class MidiEventEngine implements IMidiEventEngine {
  public play(song: Song): readonly MidiLogicalEvent[] {
    const bytes = MidiBinaryString.toBytes(song.get());
    const parser = new StandardMidiFileParser();
    const parsedFile = parser.parse(bytes);

    const tempoMap = TempoMap.create(parsedFile.header, parsedFile.events);
    const logicalEvents = MidiLogicalEventFactory.create(parsedFile.events, tempoMap);

    return Object.freeze(logicalEvents);
  }
}
