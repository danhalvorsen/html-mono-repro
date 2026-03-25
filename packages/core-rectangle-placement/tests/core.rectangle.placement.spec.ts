
// ============================================================================
// packages/core.rectangle.placement/tests/core.rectangle.placement.spec.ts
// ============================================================================

import { describe, expect, it } from "vitest";
import {
  PlaceholderState,
  type IPlacementCandidate,
  type IPlacementContext,
  type IPlacementQuery,
  type IPlacementZone,
  type IPlaceholder,
} from "../src/index.js";
import { RectanglePlacementFixture } from "./fixtures/RectanglePlacementFixture.js";

describe("@monorepo/core.rectangle.placement", () => {
  const fixture = new RectanglePlacementFixture();

  describe("RectanglePlacementFixture", () => {
    it("should create a deterministic placement candidate", () => {
      const candidate: IPlacementCandidate = fixture.createCandidate();

      expect(candidate.kind.value).toBe("window");
      expect(candidate.bounds.width()).toBeCloseTo(1.2);
      expect(candidate.bounds.height()).toBeCloseTo(1.2);
    });

    it("should create a deterministic placement context", () => {
      const context: IPlacementContext = fixture.createContext();

      expect(context.host.width()).toBeCloseTo(8);
      expect(context.host.height()).toBeCloseTo(3);
      expect(context.candidate.kind.value).toBe("window");
      expect(context.occupied).toHaveLength(1);
      expect(context.occupied[0].candidate.bounds.width()).toBeCloseTo(1.2);
    });

    it("should create a deterministic placement query", () => {
      const query: IPlacementQuery = fixture.createQuery();

      expect(query.kind.value).toBe("window");
      expect(query.minimumBounds.width()).toBeCloseTo(1.2);
      expect(query.minimumBounds.height()).toBeCloseTo(1.2);
    });

    it("should create a deterministic placement zone", () => {
      const zone: IPlacementZone = fixture.createZone();

      expect(zone.id.value).toBe("main-window-zone");
      expect(zone.allowedKinds).toHaveLength(1);
      expect(zone.allowedKinds[0].value).toBe("window");
      expect(zone.bounds.width()).toBeCloseTo(7);
      expect(zone.bounds.height()).toBeCloseTo(1.8);
    });

    it("should create a deterministic placeholder with visual parts", () => {
      const placeholder: IPlaceholder = fixture.createPlaceholder();

      expect(placeholder.id.value).toBe("placeholder-1");
      expect(placeholder.state).toBe(PlaceholderState.Free);
      expect(placeholder.allowedKinds).toHaveLength(1);
      expect(placeholder.allowedKinds[0].value).toBe("window");
      expect(placeholder.visualParts).toHaveLength(2);
      expect(placeholder.visualParts[0].name).toBe("bounds");
      expect(placeholder.visualParts[1].name).toBe("safe-area");
    });
  });

  describe("PlaceholderState", () => {
    it("should expose all expected placeholder states", () => {
      expect(PlaceholderState.Free).toBe("free");
      expect(PlaceholderState.Reserved).toBe("reserved");
      expect(PlaceholderState.Occupied).toBe("occupied");
      expect(PlaceholderState.Blocked).toBe("blocked");
    });
  });

  describe("contract composition", () => {
    it("should allow a placeholder to reference a zone with matching allowed kinds", () => {
      const zone = fixture.createZone();
      const placeholder = fixture.createPlaceholder();

      expect(placeholder.zone.id.value).toBe(zone.id.value);
      expect(placeholder.allowedKinds[0].value).toBe(zone.allowedKinds[0].value);
    });

    it("should support different rectangle kinds for different placement concerns", () => {
      const doorKind = fixture.createDoorKind();
      const candidate = fixture.createCandidate(doorKind);
      const zone = fixture.createZone(doorKind);
      const placeholder = fixture.createPlaceholder(PlaceholderState.Reserved, doorKind);

      expect(candidate.kind.value).toBe("door");
      expect(zone.allowedKinds[0].value).toBe("door");
      expect(placeholder.allowedKinds[0].value).toBe("door");
      expect(placeholder.state).toBe(PlaceholderState.Reserved);
    });

    it("should keep host larger than candidate in the default fixture", () => {
      const context = fixture.createContext();

      expect(context.host.width()).toBeGreaterThan(context.candidate.bounds.width());
      expect(context.host.height()).toBeGreaterThan(context.candidate.bounds.height());
    });

    it("should keep occupied placements separate from the candidate in the default fixture", () => {
      const context = fixture.createContext();

      const candidateCenter = context.candidate.bounds.center();
      const occupiedCenter = context.occupied[0].candidate.bounds.center();

      expect(candidateCenter.x).not.toBe(occupiedCenter.x);
      expect(candidateCenter.y).toBe(occupiedCenter.y);
    });

    it("should expose a valid inset contract from the fixture", () => {
      const inset = fixture.createInset();

      expect(inset.top).toBeCloseTo(0.3);
      expect(inset.bottom).toBeCloseTo(0.9);
      expect(inset.left).toBeCloseTo(0.5);
      expect(inset.right).toBeCloseTo(0.5);
    });
  });
});