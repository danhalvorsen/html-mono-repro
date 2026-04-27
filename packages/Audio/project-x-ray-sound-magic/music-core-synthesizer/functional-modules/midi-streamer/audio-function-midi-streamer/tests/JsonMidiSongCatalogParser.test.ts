import { describe, it } from "vitest";
import { should } from "chai";
import { MidiMessageKinds } from "@monorepo/audio-function-midi-streamer-contracts";
import { JsonMidiSongCatalogParser } from "../src/infrastructure/JsonMidiSongCatalogParser.js";

should();

describe("JsonMidiSongCatalogParser", () => {
  it("should parse a MIDI song catalog object", () => {
    const parser = new JsonMidiSongCatalogParser();

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

  it("should reject invalid MIDI song catalog payloads", () => {
    const parser = new JsonMidiSongCatalogParser();

    (() => parser.parse({ songs: "not-array" })).should.throw(TypeError);
  });
});
