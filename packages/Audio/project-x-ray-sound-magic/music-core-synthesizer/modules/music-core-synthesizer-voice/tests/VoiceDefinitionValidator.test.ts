import { should } from "chai";
import { describe, it } from "vitest";

import {
  DefaultVoiceDefinitionFactory,
  VoiceDefinitionValidator,
} from "../src/index.js";

should();

describe("VoiceDefinitionValidator", () => {
  it("should accept the default two-layer voice", () => {
    const validator = new VoiceDefinitionValidator();

    validator.validate(DefaultVoiceDefinitionFactory.createTwoLayerDefault());
  });

  it("should reject invalid output gain", () => {
    const validator = new VoiceDefinitionValidator();
    const definition = {
      ...DefaultVoiceDefinitionFactory.createTwoLayerDefault(),
      outputGain: 2,
    };

    (() => validator.validate(definition)).should.throw("outputGain must be between 0 and 1");
  });
});
