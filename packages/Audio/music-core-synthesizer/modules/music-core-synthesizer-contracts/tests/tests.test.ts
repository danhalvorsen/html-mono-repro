import { describe, expect, it } from "vitest";
import * as contractsModule from "../src/index.js";

describe("music-core-synthesizer-contracts module", () => {
  it("loads without exports", () => {
    expect(Object.keys(contractsModule)).toEqual([]);
  });
});
