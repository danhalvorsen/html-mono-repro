import { describe, expect, it } from "vitest";

import {
  BehaviorResultBase,
  PerformanceErr,
  PerformanceOk,
  ValidationErr,
  ValidationOk,
} from "../src/index.js";

describe("Behavior results", () => {
  it("should model validation outcomes as value objects", () => {
    const ok = new ValidationOk();
    const err = new ValidationErr("Missing name");

    expect(ok).toBeInstanceOf(BehaviorResultBase);
    expect(ok.behavior).toBe("validation");
    expect(err).toBeInstanceOf(BehaviorResultBase);
    expect(err.behavior).toBe("validation");
    expect(err.reason).toBe("Missing name");
  });

  it("should model performance outcomes as value objects", () => {
    const ok = new PerformanceOk(12);
    const err = new PerformanceErr("clock unavailable", 0);

    expect(ok).toBeInstanceOf(BehaviorResultBase);
    expect(ok.behavior).toBe("performance");
    expect(ok.ms).toBe(12);
    expect(err).toBeInstanceOf(BehaviorResultBase);
    expect(err.behavior).toBe("performance");
    expect(err.reason).toBe("clock unavailable");
    expect(err.ms).toBe(0);
  });
});
