// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { Matrix } from "@monorepo/core-math";
import { GameCanvas } from "../../src/Game/GameCanvas.js";
import { RectangleGameObject } from "../../src/GameObjects/RectangleGameObjects.js";

type SceneNodeLike = {
  readonly world: { toFloat32Array(): Float32Array };
  getChildren(): readonly unknown[];
  setLocal(matrix: unknown): unknown;
  translate(x: number, y: number): unknown;
};

type SceneGraphLike = {
  add(child: unknown): void;
  update(): void;
};

describe("GameCanvas SceneGraph ownership", () => {
  it("hosts a single scene graph root and adds rendered RectangleGameObject nodes to it", async () => {
    const canvas = document.createElement("game-canvas") as GameCanvas;
    document.body.appendChild(canvas);
    await canvas.updateComplete;

    const sceneRoot = (
      canvas as unknown as { sceneRoot: { getChildren(): readonly unknown[] } }
    ).sceneRoot;
    const children = sceneRoot.getChildren();

    expect(children.length).toBeGreaterThan(0);
    expect(
      children.every((child) => child instanceof RectangleGameObject),
    ).toBe(true);

    const renderedRectangles = Array.from(
      canvas.renderRoot.querySelectorAll("rectangle-game-object"),
    );

    expect(children.length).toBe(renderedRectangles.length);
    expect(children).toEqual(renderedRectangles);
  });

  it("hosts a single scene graph root with 3 children when root is rotated all 3 child nodes should update their world transforms accordingly", async () => {
    const canvas = document.createElement("game-canvas") as GameCanvas;
    const scene = (canvas as unknown as { scene: SceneGraphLike }).scene;
    const sceneRoot = (canvas as unknown as { sceneRoot: SceneNodeLike }).sceneRoot;

    const childA = new RectangleGameObject();
    const childB = new RectangleGameObject();
    const childC = new RectangleGameObject();

    scene.add(childA);
    scene.add(childB);
    scene.add(childC);

    sceneRoot.setLocal(Matrix.rotation(Math.PI / 2));
    scene.update();

    expect(sceneRoot.getChildren().length).toBe(3);

    const expected = sceneRoot.world.toFloat32Array();
    for (const child of [childA, childB, childC]) {
      const world = child.world.toFloat32Array();
      expect(world[0]).toBeCloseTo(expected[0] ?? 0, 6);
      expect(world[1]).toBeCloseTo(expected[1] ?? 0, 6);
      expect(world[3]).toBeCloseTo(expected[3] ?? 0, 6);
      expect(world[4]).toBeCloseTo(expected[4] ?? 0, 6);
    }
  });

  it("hosts a single scene graph root with 3 children when root is translate all 3 child nodes should update their world transforms accordingly", async () => {
    const canvas = document.createElement("game-canvas") as GameCanvas;
    const scene = (canvas as unknown as { scene: SceneGraphLike }).scene;
    const sceneRoot = (canvas as unknown as { sceneRoot: SceneNodeLike }).sceneRoot;

    const childA = new RectangleGameObject();
    const childB = new RectangleGameObject();
    const childC = new RectangleGameObject();

    scene.add(childA);
    scene.add(childB);
    scene.add(childC);

    sceneRoot.translate(100, 200);
    scene.update();

    expect(sceneRoot.getChildren().length).toBe(3);

    const expected = sceneRoot.world.toFloat32Array();
    for (const child of [childA, childB, childC]) {
      const world = child.world.toFloat32Array();
      expect(world[2]).toBeCloseTo(expected[2] ?? 0, 6);
      expect(world[5]).toBeCloseTo(expected[5] ?? 0, 6);
    }
  });
});
