import { describe, expect, it } from "vitest";
import * as contractsModule from "../src/code.js";

describe("music-core-synthesizer-contracts module", () => {
  it("loads without exports", () => {
    expect(Object.keys(contractsModule)).toEqual([]);
  });
});
