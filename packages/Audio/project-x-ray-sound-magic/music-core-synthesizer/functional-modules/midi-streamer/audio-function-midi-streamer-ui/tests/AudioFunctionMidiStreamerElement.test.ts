import { describe, it } from "vitest";
import { should } from "chai";
import {
  AudioFunctionMidiStreamerElement,
  AudioFunctionMidiStreamerElementTagName,
} from "../src/index.js";

should();

describe("AudioFunctionMidiStreamerElement", () => {
  it("should register the Lit custom element", () => {
    customElements
      .get(AudioFunctionMidiStreamerElementTagName)
      .should.equal(AudioFunctionMidiStreamerElement);
  });
});
