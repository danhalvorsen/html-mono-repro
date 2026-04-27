import { describe, it } from "vitest";
import { should } from "chai";
import { MidiMessageKinds } from "@monorepo/audio-function-midi-streamer-contracts";
import { MidiSongCatalogJsonParser } from "../src/internal/MidiSongCatalogJsonParser.js";

should();

describe("MidiSongCatalogJsonParser", () => {
  it("should parse a song catalog object", () => {
    const parser = new MidiSongCatalogJsonParser();

    const songs = parser.parse({
      songs: [
        {
          id: "london-bridge",
          title: "London Bridge",
          tempoBpm: 120,
          ticksPerQuarterNote: 480,
          events: [
            {
              tick: 0,
              message: {
                kind: MidiMessageKinds.noteOn,
                channel: 0,
                note: 67,
                velocity: 100,
              },
            },
          ],
        },
      ],
    });

    songs.should.have.length(1);
    songs[0]?.id.should.equal("london-bridge");
  });

  it("should reject invalid catalog payloads", () => {
    const parser = new MidiSongCatalogJsonParser();

    (() => parser.parse({ songs: "not-array" })).should.throw(TypeError);
  });
});