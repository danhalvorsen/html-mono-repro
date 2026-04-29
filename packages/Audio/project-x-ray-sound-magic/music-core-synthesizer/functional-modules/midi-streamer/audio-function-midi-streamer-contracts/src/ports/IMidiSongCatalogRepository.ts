import type { MidiSong, MidiSongId } from "../model/MidiSong.js";

export interface IMidiSongCatalogRepository {
  list(): Promise<readonly MidiSong[]>;
  findById(songId: MidiSongId): Promise<MidiSong | null>;
}

export interface IMidiSongCatalogJsonParser {
  parse(value: unknown): readonly MidiSong[];
}
