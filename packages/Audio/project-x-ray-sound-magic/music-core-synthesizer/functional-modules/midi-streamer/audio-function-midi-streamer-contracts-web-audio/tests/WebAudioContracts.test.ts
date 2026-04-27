import { describe, it } from "vitest";
import { should } from "chai";

should();

describe("Web Audio MIDI streamer contracts", () => {
  it("should load the contract package", async () => {
    const module = await import("../src/index.js");

    Object.keys(module).should.deep.equal([]);
  });
});
