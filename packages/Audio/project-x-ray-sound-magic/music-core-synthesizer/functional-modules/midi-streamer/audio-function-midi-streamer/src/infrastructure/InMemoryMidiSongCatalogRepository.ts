import {
  MidiMessageKinds,
  type IMidiSongCatalogRepository,
  type MidiMessage,
  type MidiSong,
  type MidiSongId,
  type MidiTimedMessage,
} from "@monorepo/audio-function-midi-streamer-contracts";
import { MidiSongValidationError } from "../domain/MidiSongValidationError.js";
import { MidiSongValidator } from "../domain/MidiSongValidator.js";

export class InMemoryMidiSongCatalogRepository
  implements IMidiSongCatalogRepository {
  private readonly songs: readonly MidiSong[];
  private readonly songsById: ReadonlyMap<MidiSongId, MidiSong>;

  public constructor(
    songs: readonly MidiSong[],
    validator: MidiSongValidator,
  ) {
    const clonedSongs = songs.map((song) => this.cloneSong(song));
    const map = new Map<MidiSongId, MidiSong>();

    for (const song of clonedSongs) {
      validator.validate(song);

      if (map.has(song.id)) {
        throw new MidiSongValidationError(`Duplicate MIDI song id: ${song.id}.`);
      }

      map.set(song.id, song);
    }

    this.songs = Object.freeze(clonedSongs);
    this.songsById = map;
  }

  public async list(): Promise<readonly MidiSong[]> {
    return this.songs;
  }

  public async findById(songId: MidiSongId): Promise<MidiSong | null> {
    return this.songsById.get(songId) ?? null;
  }

  private cloneSong(song: MidiSong): MidiSong {
    return Object.freeze({
      id: song.id,
      title: song.title,
      tempoBpm: song.tempoBpm,
      ticksPerQuarterNote: song.ticksPerQuarterNote,
      events: Object.freeze(song.events.map((event) => this.cloneEvent(event))),
    });
  }

  private cloneEvent(event: MidiTimedMessage): MidiTimedMessage {
    return Object.freeze({
      tick: event.tick,
      message: this.cloneMessage(event.message),
    });
  }

  private cloneMessage(message: MidiMessage): MidiMessage {
    switch (message.kind) {
      case MidiMessageKinds.noteOn:
        return Object.freeze({ ...message });

      case MidiMessageKinds.noteOff:
        return Object.freeze({ ...message });

      case MidiMessageKinds.controlChange:
        return Object.freeze({ ...message });

      case MidiMessageKinds.pitchBend:
        return Object.freeze({ ...message });

      case MidiMessageKinds.systemExclusive:
        return Object.freeze({
          kind: message.kind,
          data: Object.freeze([...message.data]),
        });
    }
  }
}
