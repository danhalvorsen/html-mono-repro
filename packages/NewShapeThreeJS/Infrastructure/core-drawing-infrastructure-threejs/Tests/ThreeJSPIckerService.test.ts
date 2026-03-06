// tests/ThreeJsPickerService.test.ts

import { describe, it, expect, beforeEach } from "vitest";
import { Vector2 } from "three";
import { ThreeJsPickerServiceFixture } from "./fixtures/ThreeJsPickerServiceFixture.js";

describe("ThreeJsPickerService", () => {
  let fx: ThreeJsPickerServiceFixture;

  beforeEach(() => {
    fx = new ThreeJsPickerServiceFixture();
  });

  it("returns undefined when there are no hits", () => {
    const object = fx.createObject3D();
    const context = fx.createContext([object]);
    const resolver = fx.createResolver();
    const raycaster = fx.createRaycaster().setHits();

    const sut = fx.createSut(context, resolver, raycaster);

    const result = sut.pick(fx.createPoint());

    expect(result).toBeUndefined();
  });

  it("returns resolved shape for first hit", () => {
    const object = fx.createObject3D();
    const shape = fx.createShape("shape-1");
    const context = fx.createContext([object]);
    const resolver = fx.createResolver().register(object, shape);
    const raycaster = fx.createRaycaster().setHits(object);

    const sut = fx.createSut(context, resolver, raycaster);

    const result = sut.pick(fx.createPoint());

    expect(result).toBe(shape);
  });

  it("returns first resolvable shape when multiple hits exist", () => {
    const unresolvedObject = fx.createObject3D();
    const resolvedObject = fx.createObject3D();
    const shape = fx.createShape("shape-2");

    const context = fx.createContext([unresolvedObject, resolvedObject]);
    const resolver = fx.createResolver().register(resolvedObject, shape);
    const raycaster = fx.createRaycaster().setHits(unresolvedObject, resolvedObject);

    const sut = fx.createSut(context, resolver, raycaster);

    const result = sut.pick(fx.createPoint());

    expect(result).toBe(shape);
  });

  it("returns undefined when hits cannot be resolved to shapes", () => {
    const object = fx.createObject3D();
    const context = fx.createContext([object]);
    const resolver = fx.createResolver();
    const raycaster = fx.createRaycaster().setHits(object);

    const sut = fx.createSut(context, resolver, raycaster);

    const result = sut.pick(fx.createPoint());

    expect(result).toBeUndefined();
  });

  it("throws when viewport width is zero", () => {
    const object = fx.createObject3D();
    const context = fx.createContext([object], fx.createViewport(0, 100));
    const resolver = fx.createResolver();
    const raycaster = fx.createRaycaster();

    const sut = fx.createSut(context, resolver, raycaster);

    expect(() => sut.pick(fx.createPoint())).toThrowError(
      "Viewport width must be greater than zero."
    );
  });

  it("throws when viewport height is zero", () => {
    const object = fx.createObject3D();
    const context = fx.createContext([object], fx.createViewport(100, 0));
    const resolver = fx.createResolver();
    const raycaster = fx.createRaycaster();

    const sut = fx.createSut(context, resolver, raycaster);

    expect(() => sut.pick(fx.createPoint())).toThrowError(
      "Viewport height must be greater than zero."
    );
  });

  it("accepts arbitrary screen point input", () => {
    const object = fx.createObject3D();
    const shape = fx.createShape("shape-3");
    const context = fx.createContext([object]);
    const resolver = fx.createResolver().register(object, shape);
    const raycaster = fx.createRaycaster().setHits(object);

    const sut = fx.createSut(context, resolver, raycaster);

    const result = sut.pick(new Vector2(10, 20));

    expect(result).toBe(shape);
  });
});