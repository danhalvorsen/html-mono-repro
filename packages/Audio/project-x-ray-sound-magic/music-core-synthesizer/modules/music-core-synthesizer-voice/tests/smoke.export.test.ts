
import { should } from "chai";
import { describe, it } from "vitest";

import {
  DefaultVoiceDefinitionFactory,
  VoiceDefinitionValidator,
} from "../src/index.js";

should();

describe("music-core-synthesizer-voice module", () => {
  it("should export voice module services", () => {
    DefaultVoiceDefinitionFactory.should.not.equal(undefined);
    VoiceDefinitionValidator.should.not.equal(undefined);
  });
});