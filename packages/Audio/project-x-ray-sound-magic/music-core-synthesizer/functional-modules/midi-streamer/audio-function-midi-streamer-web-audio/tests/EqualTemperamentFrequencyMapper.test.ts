import { describe, it } from "vitest";
import { should } from "chai";
import { EqualTemperamentFrequencyMapper } from "../src/domain/EqualTemperamentFrequencyMapper.js";

should();

describe("EqualTemperamentFrequencyMapper", () => {
  it("should map A4 to 440Hz", () => {
    const mapper = new EqualTemperamentFrequencyMapper();

    mapper.mapMidiNoteToFrequency(69).should.equal(440);
  });

  it("should reject invalid MIDI notes", () => {
    const mapper = new EqualTemperamentFrequencyMapper();

    (() => mapper.mapMidiNoteToFrequency(128)).should.throw(RangeError);
  });
});