// ====================================================================================
// FILE: tests/specifications/PlacementSpecifications.test.ts
// ====================================================================================

import { describe, expect, it } from "vitest";
import {
  FitsWithinTargetSpecification,
  SafeAreaFitsWithinTargetSpecification,
} from "../src/index.js";
 
import { PlacementFixture } from "./fixture/PlacementFixture.js";
import { PlacementWithSafeAreaFixture } from "./fixture/PlacementWithSafeAreaFixture.js";

describe("Rules for placing a rectangular object inside a rectangular area", () => {
  const placementFixture = new PlacementFixture();
  const safeAreaFixture = new PlacementWithSafeAreaFixture();

  describe("FitsWithinTargetSpecification", () => {
    const sut = new FitsWithinTargetSpecification();

    describe("given a rectangular target area", () => {
      it("when the object is completely inside the area, then placement is valid", () => {
        const source = placementFixture.createSource(1, 1, 3, 3);
        const target = placementFixture.createTarget(0, 0, 10, 10);

        const context = placementFixture.createContext(source, target);

        expect(sut.isSatisfiedBy(context)).toBe(true);
      });

      it("when the object extends outside the area, then placement is invalid", () => {
        const source = placementFixture.createSource(9, 9, 12, 12);
        const target = placementFixture.createTarget(0, 0, 10, 10);

        const context = placementFixture.createContext(source, target);

        expect(sut.isSatisfiedBy(context)).toBe(false);
      });

      it("when the object exactly matches the area, then placement is valid", () => {
        const source = placementFixture.createSource(0, 0, 10, 10);
        const target = placementFixture.createTarget(0, 0, 10, 10);

        const context = placementFixture.createContext(source, target);

        expect(sut.isSatisfiedBy(context)).toBe(true);
      });
    });
  });

  describe("SafeAreaFitsWithinTargetSpecification", () => {
    const sut = new SafeAreaFitsWithinTargetSpecification();

    describe("given a required safety margin around the object", () => {
      it("when the safety margin is fully inside the area, then placement is valid", () => {
        const source = placementFixture.createSource(2, 2, 4, 4);
        const target = placementFixture.createTarget(0, 0, 10, 10);

        const context = safeAreaFixture.createContext(source, target, 1);

        expect(sut.isSatisfiedBy(context)).toBe(true);
      });

      it("when the safety margin exceeds the area, then placement is invalid", () => {
        const source = placementFixture.createSource(1, 1, 3, 3);
        const target = placementFixture.createTarget(0, 0, 4, 4);

        const context = safeAreaFixture.createContext(source, target, 2);

        expect(sut.isSatisfiedBy(context)).toBe(false);
      });

      it("when the safety margin exactly fits the area, then placement is valid", () => {
        const source = placementFixture.createSource(1, 1, 3, 3);
        const target = placementFixture.createTarget(0, 0, 5, 5);

        const context = safeAreaFixture.createContext(source, target, 1);

        expect(sut.isSatisfiedBy(context)).toBe(true);
      });
    });
  });
});