import { describe, expect, it } from "vitest";
import { RectSemantic } from "../src/RectSemantic.js";
import { SemanticSelectorRoot } from "../src/SemanticSelectorRoot.js";
import type { RectSemanticPoint } from "../src/RectSemanticPoint.js";

class HostSpy {
  public lastPoint: RectSemanticPoint | undefined;

  public addPointPlacement(point: RectSemanticPoint) {
    this.lastPoint = point;
    return {} as never;
  }
}

describe("SemanticSelectorRoot", () => {
  it("should delegate top left semantic", () => {
    const host = new HostSpy();
    const selectors = new SemanticSelectorRoot(host);

    selectors.Top.Left();
    expect(host.lastPoint).toBe(RectSemantic.Top.Left);
  });

  it("should delegate right end semantic", () => {
    const host = new HostSpy();
    const selectors = new SemanticSelectorRoot(host);

    selectors.Right.End();
    expect(host.lastPoint).toBe(RectSemantic.Right.End);
  });
});
