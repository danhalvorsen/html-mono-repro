import { should } from "chai";
import { describe, it } from "vitest";

import type { IVoiceDefinition } from "../src/index.js";

should();

describe("IVoiceDefinition", () => {
  it("should support an immutable voice definition shape", () => {
    const definition: IVoiceDefinition = {
      layers: [],
      outputGain: 0.75,
    };

    definition.layers.length.should.equal(0);
    definition.outputGain.should.equal(0.75);
  });
});
