import { describe, expect, it } from "vitest";
import { AstarPathfinder } from "../src/index.js";
import { AstarFixture } from "./fixtures/AstarFixture.js";

describe("feature: cancellation and iteration budget", () => {
  it("supports maxIterations and abortSignal", () => {
    const fixture = new AstarFixture();
    const pathfinder = new AstarPathfinder();

    const result = pathfinder.findPath({
      ...fixture.createRequest(),
      maxIterations: 1,
      abortSignal: new AbortController().signal,
    } as never) as Record<string, unknown>;

    expect(result.kind).toBe("no-path");
    expect(result.reason).toBe("iteration-limit");
  });
});
