import { describe, expect, it } from "vitest";
import * as astarModule from "../src/index.js";

describe("feature: session model", () => {
  it("exports createSession with mutating methods", () => {
    const api = astarModule as Record<string, unknown>;
    expect(typeof api.createSession).toBe("function");

    const session = (api.createSession as () => unknown)();
    const record = session as Record<string, unknown>;

    expect(typeof record.setStart).toBe("function");
    expect(typeof record.setGoal).toBe("function");
    expect(typeof record.setBlocked).toBe("function");
    expect(typeof record.search).toBe("function");
  });
});
