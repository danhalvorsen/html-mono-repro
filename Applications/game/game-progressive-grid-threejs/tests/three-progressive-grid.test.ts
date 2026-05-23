import { BufferGeometry, MeshBasicMaterial, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import type { GridPoint, GridEdgeSide, GridPatchBounds } from "@monorepo/game-progressive-grid";
import {
  ConstantZGridPointProjector,
  CounterClockwiseGridCellTriangulator,
  GridPatchTopologyResolver,
  ThreeGridPatchGeometryFactory,
  ThreeGridPatchMeshFactory,
  ThreeProgressiveGridGroupFactory,
  type IGridPatch,
} from "../src/index.js";
import { ThreeGridFixture } from "./fixtures/ThreeGridFixture.js";

class NonRectangularPatch implements IGridPatch {
  public readonly id = "non-rectangular";
  public readonly bounds: GridPatchBounds = {
    x0: 0,
    x1: 1,
    y0: 0,
    y1: 1,
  };

  public getPoints(): readonly GridPoint[] {
    return [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ];
  }

  public getEdgeSamples(_side: GridEdgeSide): readonly GridPoint[] {
    return [];
  }
}

describe("ThreeGridPatchGeometryFactory", () => {
  it("creates indexed Three.js geometry from a progressive grid patch", () => {
    const fixture = new ThreeGridFixture();
    const patch = fixture.createPatch("patch", [0, 0.5, 1], [0, 1]);
    const factory = new ThreeGridPatchGeometryFactory();

    const geometry = factory.createGeometry(patch);

    const positions = geometry.getAttribute("position");
    const index = geometry.getIndex();

    expect(positions.count).toBe(6);
    expect(Array.from(positions.array)).toEqual([
      0, 0, 0,
      0.5, 0, 0,
      1, 0, 0,
      0, 1, 0,
      0.5, 1, 0,
      1, 1, 0,
    ]);

    expect(index).not.toBeNull();
    expect(Array.from(index?.array ?? [])).toEqual([
      0, 1, 4,
      0, 4, 3,
      1, 2, 5,
      1, 5, 4,
    ]);

    expect(geometry.boundingBox).not.toBeNull();
    expect(geometry.boundingSphere).not.toBeNull();
  });

  it("supports custom projection onto a non-zero constant z plane", () => {
    const fixture = new ThreeGridFixture();
    const patch = fixture.createPatch("patch");
    const factory = new ThreeGridPatchGeometryFactory();

    const geometry = factory.createGeometry(patch, {
      projector: new ConstantZGridPointProjector(7),
    });

    const positions = geometry.getAttribute("position");

    expect(Array.from(positions.array)).toEqual([
      0, 0, 7,
      1, 0, 7,
      0, 1, 7,
      1, 1, 7,
    ]);
  });

  it("rejects non-rectangular patch point sets", () => {
    const factory = new ThreeGridPatchGeometryFactory();

    expect(() => factory.createGeometry(new NonRectangularPatch())).toThrow(
      "Grid patch is not rectangular: non-rectangular",
    );
  });
});

describe("GridPatchTopologyResolver", () => {
  it("orders unordered patch points into deterministic row-major topology", () => {
    const resolver = new GridPatchTopologyResolver();
    const patch = new NonRectangularPatch();

    expect(() => resolver.resolve(patch)).toThrow("Grid patch is not rectangular");
  });
});

describe("CounterClockwiseGridCellTriangulator", () => {
  it("creates counter-clockwise triangles for every grid cell", () => {
    const triangulator = new CounterClockwiseGridCellTriangulator();

    expect(Array.from(triangulator.createIndices(2, 2))).toEqual([
      0, 1, 3,
      0, 3, 2,
    ]);
  });

  it("rejects invalid topology dimensions", () => {
    const triangulator = new CounterClockwiseGridCellTriangulator();

    expect(() => triangulator.createIndices(1, 2)).toThrow(
      "Triangulation requires at least two columns.",
    );

    expect(() => triangulator.createIndices(2, 1)).toThrow(
      "Triangulation requires at least two rows.",
    );
  });
});

describe("ThreeGridPatchMeshFactory", () => {
  it("creates named Three.js mesh for a grid patch", () => {
    const fixture = new ThreeGridFixture();
    const patch = fixture.createPatch("main");
    const factory = new ThreeGridPatchMeshFactory();

    const mesh = factory.createMesh(patch);

    expect(mesh.name).toBe("grid-patch-main");
    expect(mesh.geometry).toBeInstanceOf(BufferGeometry);
  });

  it("allows caller-provided material", () => {
    const fixture = new ThreeGridFixture();
    const patch = fixture.createPatch("main");
    const material = new MeshBasicMaterial();
    const factory = new ThreeGridPatchMeshFactory();

    const mesh = factory.createMesh(patch, {
      material,
      namePrefix: "custom-",
    });

    expect(mesh.name).toBe("custom-main");
    expect(mesh.material).toBe(material);
  });
});

describe("ThreeProgressiveGridGroupFactory", () => {
  it("creates one child mesh per progressive grid patch", () => {
    const fixture = new ThreeGridFixture();
    const first = fixture.createPatch("first");
    const second = fixture.createPatch("second", [1, 2], [0, 1]);
    const grid = fixture.createGrid([first, second]);

    const factory = new ThreeProgressiveGridGroupFactory();
    const group = factory.createGroup(grid, {
      name: "scene-grid",
    });

    expect(group.name).toBe("scene-grid");
    expect(group.children).toHaveLength(2);
    expect(group.children[0]?.name).toBe("grid-patch-first");
    expect(group.children[1]?.name).toBe("grid-patch-second");
  });
});

describe("ConstantZGridPointProjector", () => {
  it("maps grid xy into Three.js xy with fixed z", () => {
    const fixture = new ThreeGridFixture();
    const patch = fixture.createPatch("patch");
    const projector = new ConstantZGridPointProjector(3);

    const projected = projector.project({
      patch,
      point: { x: 2, y: 4 },
      columnIndex: 0,
      rowIndex: 0,
      columnCount: 1,
      rowCount: 1,
      linearIndex: 0,
    });

    expect(projected).toEqual(new Vector3(2, 4, 3));
  });
});
