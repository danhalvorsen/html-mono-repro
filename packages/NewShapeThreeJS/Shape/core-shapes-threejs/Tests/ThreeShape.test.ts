// packages/NewShapeThreeJS/Shape/core-shapes-threejs/Tests/ThreeShape.test.ts

import { describe, it, expect, beforeEach } from "vitest";
import type { IDrawableShape, ShapeId, ShapeType } from "@monorepo/core-shapes-abstract";
import { ThreeShapeFixture } from "./Fixtures/ThreeShapeFixture.js";
describe("ThreeShape", () => {
  let fx: ThreeShapeFixture;

  beforeEach(() => {
    fx = new ThreeShapeFixture();
  });

  it("exposes id and type from options", () => {
    const shape = fx.createShape({
      id: "shape-42" as ShapeId,
      type: "sphere" as ShapeType
    });

    expect(shape.id).toBe("shape-42");
    expect(shape.type).toBe("sphere");
  });

  it("starts dirty", () => {
    const shape = fx.createShape();

    expect(shape.isDirty).toBe(true);
  });

  it("adds controller and notifies hostConnected", () => {
    const shape = fx.createShape();
    const controller = fx.createController();

    shape.addController(controller);

    expect(shape.controllerCount).toBe(1);
    expect(controller.connectedCount).toBe(1);
    expect(controller.connectedHost).toBe(shape);
  });

  it("does not add same controller twice", () => {
    const shape = fx.createShape();
    const controller = fx.createController();

    shape.addController(controller);
    shape.addController(controller);

    expect(shape.controllerCount).toBe(1);
    expect(controller.connectedCount).toBe(1);
  });

  it("removeController notifies hostDisconnected", () => {
    const shape = fx.createShape();
    const controller = fx.createController();

    shape.addController(controller);
    shape.removeController(controller);

    expect(shape.controllerCount).toBe(0);
    expect(controller.disconnectedCount).toBe(1);
  });

  it("updateIfNeeded invokes controller hostUpdate once when dirty", () => {
    const shape = fx.createShape();
    const controller = fx.createController();

    shape.addController(controller);
    controller.updateCount = 0;

    const updated = shape.updateIfNeeded();

    expect(updated).toBe(true);
    expect(controller.updateCount).toBe(1);
    expect(shape.isDirty).toBe(false);
  });

  it("updateIfNeeded returns false when not dirty", () => {
    const shape = fx.createShape();
    const controller = fx.createController();

    shape.addController(controller);
    shape.updateIfNeeded();
    controller.updateCount = 0;

    const updated = shape.updateIfNeeded();

    expect(updated).toBe(false);
    expect(controller.updateCount).toBe(0);
  });

  it("requestUpdate marks shape dirty again", () => {
    const shape = fx.createShape();

    shape.updateIfNeeded();

    expect(shape.isDirty).toBe(false);

    shape.requestUpdate();

    expect(shape.isDirty).toBe(true);
  });

  it("draw attaches object to scene", () => {
    const shape = fx.createShape();
    const scene = fx.createScene();

    expect(scene.children.length).toBe(0);

    shape.draw({ scene });

    expect(scene.children.length).toBe(1);
    expect(scene.children[0]).toBe(shape.getObject3D());
  });

  it("draw twice on same scene does not duplicate object", () => {
    const shape = fx.createShape();
    const scene = fx.createScene();

    shape.draw({ scene });
    shape.draw({ scene });

    expect(scene.children.length).toBe(1);
  });

  it("draw moves object from old scene to new scene", () => {
    const shape = fx.createShape();
    const scene1 = fx.createScene();
    const scene2 = fx.createScene();

    shape.draw({ scene: scene1 });
    shape.draw({ scene: scene2 });

    expect(scene1.children.length).toBe(0);
    expect(scene2.children.length).toBe(1);
    expect(scene2.children[0]).toBe(shape.getObject3D());
  });

  it("dispose detaches object from scene", () => {
    const shape = fx.createShape();
    const scene = fx.createScene();

    shape.draw({ scene });
    shape.dispose();

    expect(scene.children.length).toBe(0);
  });

  it("dispose is idempotent", () => {
    const shape = fx.createShape();

    shape.dispose();
    shape.dispose();

    expect(true).toBe(true);
  });

  it("throws when getObject3D is called after dispose", () => {
    const shape = fx.createShape();

    shape.dispose();

    expect(() => shape.getObject3D()).toThrowError("ThreeShape is disposed.");
  });

  it("throws when requestUpdate is called after dispose", () => {
    const shape = fx.createShape();

    shape.dispose();

    expect(() => shape.requestUpdate()).toThrowError("ThreeShape is disposed.");
  });

  it("throws when addController is called after dispose", () => {
    const shape = fx.createShape();
    const controller = fx.createController();

    shape.dispose();

    expect(() => shape.addController(controller)).toThrowError("ThreeShape is disposed.");
  });

  it("throws when updateIfNeeded is called after dispose", () => {
    const shape = fx.createShape();

    shape.dispose();

    expect(() => shape.updateIfNeeded()).toThrowError("ThreeShape is disposed.");
  });

  it("throws when draw is called after dispose", () => {
    const shape = fx.createShape();
    const scene = fx.createScene();

    shape.dispose();

    expect(() => shape.draw({ scene })).toThrowError("ThreeShape is disposed.");
  });

  it("removeController after dispose is ignored", () => {
    const shape = fx.createShape();
    const controller = fx.createController();

    shape.addController(controller);
    shape.dispose();

    expect(() => shape.removeController(controller)).not.toThrow();
  });

  it("removeController for unknown controller is ignored", () => {
  const shape = fx.createShape();
  const controller = fx.createController();

  expect(() => shape.removeController(controller)).not.toThrow();
  expect(shape.controllerCount).toBe(0);
});
});