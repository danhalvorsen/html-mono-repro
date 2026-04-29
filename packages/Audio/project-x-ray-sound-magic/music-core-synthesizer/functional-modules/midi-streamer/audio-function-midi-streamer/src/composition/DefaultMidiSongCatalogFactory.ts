import type {
  IMidiSongCatalogJsonParser,
  IMidiSongCatalogRepository,
  MidiSong,
} from "@monorepo/audio-function-midi-streamer-contracts";

import { MidiSongValidator } from "../domain/MidiSongValidator.js";
import { InMemoryMidiSongCatalogRepository } from "../infrastructure/InMemoryMidiSongCatalogRepository.js";
import { JsonMidiSongCatalogParser } from "../infrastructure/JsonMidiSongCatalogParser.js";

export class DefaultMidiSongCatalogFactory {
  public constructor(
    private readonly parser: IMidiSongCatalogJsonParser = new JsonMidiSongCatalogParser(),
    private readonly validator: MidiSongValidator = new MidiSongValidator(),
  ) {}

  public createFromJson(value: unknown): IMidiSongCatalogRepository {
    return this.createFromSongs(this.parser.parse(value));
  }

  public createFromSongs(
    songs: readonly MidiSong[],
  ): IMidiSongCatalogRepository {
    return new InMemoryMidiSongCatalogRepository(songs, this.validator);
  }
}
