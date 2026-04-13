// ====================================================================================
// FILE: src/three/geometry/IndexedGeometryBuilder.ts
// ====================================================================================

import * as THREE from "three";

type Rectangle2D = Readonly<{
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}>;

type PendingRectangle = Readonly<{
  rectangle: Rectangle2D;
}>;

type Cell = Readonly<{
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}>;

export class IndexedGeometryBuilder {
  private readonly rectangles: Rectangle2D[] = [];
  private pendingRectangle: PendingRectangle | null = null;

  private constructor() {}

  public static create(): IndexedGeometryBuilder {
    return new IndexedGeometryBuilder();
  }

  public with(start: THREE.Vector2, end: THREE.Vector2): IndexedGeometryBuilder {
    if (this.pendingRectangle !== null) {
      throw new Error("Pending rectangle must be lofted before defining a new rectangle.");
    }

    const rectangle = this.toRectangle(start, end);

    this.pendingRectangle = { rectangle };
    return this;
  }

  public withLoft(height: number): IndexedGeometryBuilder {
    if (this.pendingRectangle === null) {
      throw new Error("A rectangle must be defined before lofting.");
    }

    if (!Number.isFinite(height) || height <= 0) {
      throw new Error("Loft height must be a finite number greater than zero.");
    }

    this.rectangles.push(this.pendingRectangle.rectangle);
    this.pendingRectangle = null;

    return this;
  }

  public build(height = 1.2): THREE.BufferGeometry {
    if (this.pendingRectangle !== null) {
      throw new Error("Pending rectangle must be lofted before build().");
    }

    if (this.rectangles.length === 0) {
      throw new Error("At least one lofted rectangle must be defined before build().");
    }

    if (!Number.isFinite(height) || height <= 0) {
      throw new Error("Build height must be a finite number greater than zero.");
    }

    const xs = this.collectSortedUnique(this.rectangles.flatMap((r) => [r.minX, r.maxX]));
    const ys = this.collectSortedUnique(this.rectangles.flatMap((r) => [r.minY, r.maxY]));

    if (xs.length < 2 || ys.length < 2) {
      throw new Error("Insufficient rectangle partitioning to build geometry.");
    }

    const occupancy = this.createOccupancyGrid(xs, ys, this.rectangles);

    const vertices: number[] = [];
    const indices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];

    const vertexMap = new Map<string, number>();

    for (let yi = 0; yi < ys.length - 1; yi++) {
      for (let xi = 0; xi < xs.length - 1; xi++) {
        if (!occupancy[yi]?.[xi]) {
          continue;
        }

        const cell: Cell = {
          x0: xs[xi]!,
          y0: ys[yi]!,
          x1: xs[xi + 1]!,
          y1: ys[yi + 1]!,
        };

        // top
        this.addQuad(
          cell,
          height,
          "top",
          vertices,
          indices,
          normals,
          uvs,
          vertexMap,
        );

        // bottom
        this.addQuad(
          cell,
          0,
          "bottom",
          vertices,
          indices,
          normals,
          uvs,
          vertexMap,
        );

        const leftEmpty = xi === 0 || !occupancy[yi]?.[xi - 1];
        const rightEmpty = xi === xs.length - 2 || !occupancy[yi]?.[xi + 1];
        const backEmpty = yi === 0 || !occupancy[yi - 1]?.[xi];
        const frontEmpty = yi === ys.length - 2 || !occupancy[yi + 1]?.[xi];

        if (leftEmpty) {
          this.addQuad(
            cell,
            height,
            "left",
            vertices,
            indices,
            normals,
            uvs,
            vertexMap,
          );
        }

        if (rightEmpty) {
          this.addQuad(
            cell,
            height,
            "right",
            vertices,
            indices,
            normals,
            uvs,
            vertexMap,
          );
        }

        if (backEmpty) {
          this.addQuad(
            cell,
            height,
            "back",
            vertices,
            indices,
            normals,
            uvs,
            vertexMap,
          );
        }

        if (frontEmpty) {
          this.addQuad(
            cell,
            height,
            "front",
            vertices,
            indices,
            normals,
            uvs,
            vertexMap,
          );
        }
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    return geometry;
  }

  private toRectangle(start: THREE.Vector2, end: THREE.Vector2): Rectangle2D {
    const minX = Math.min(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxX = Math.max(start.x, end.x);
    const maxY = Math.max(start.y, end.y);

    if (maxX <= minX || maxY <= minY) {
      throw new Error("Rectangle must have positive width and height.");
    }

    return { minX, minY, maxX, maxY };
  }

  private collectSortedUnique(values: number[]): number[] {
    const epsilon = 1e-9;

    return values
      .slice()
      .sort((a, b) => a - b)
      .filter((value, index, array) => {
        if (index === 0) {
          return true;
        }

        return Math.abs(value - array[index - 1]!) > epsilon;
      });
  }

  private createOccupancyGrid(
    xs: number[],
    ys: number[],
    rectangles: readonly Rectangle2D[],
  ): boolean[][] {
    const grid: boolean[][] = [];

    for (let yi = 0; yi < ys.length - 1; yi++) {
      const row: boolean[] = [];

      for (let xi = 0; xi < xs.length - 1; xi++) {
        const cellMinX = xs[xi]!;
        const cellMaxX = xs[xi + 1]!;
        const cellMinY = ys[yi]!;
        const cellMaxY = ys[yi + 1]!;

        const covered = rectangles.some((rectangle) => {
          return (
            cellMinX >= rectangle.minX &&
            cellMaxX <= rectangle.maxX &&
            cellMinY >= rectangle.minY &&
            cellMaxY <= rectangle.maxY
          );
        });

        row.push(covered);
      }

      grid.push(row);
    }

    return grid;
  }

  private addQuad(
    cell: Cell,
    zOrHeight: number,
    face: "top" | "bottom" | "left" | "right" | "front" | "back",
    vertices: number[],
    indices: number[],
    normals: number[],
    uvs: number[],
    vertexMap: Map<string, number>,
  ): void {
    const v = this.getFaceVertices(cell, zOrHeight, face);
    const n = this.getFaceNormal(face);
    const quadUvs: ReadonlyArray<readonly [number, number]> = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ];

    const i0 = this.addVertex(v[0]!, n, quadUvs[0]!, vertices, normals, uvs, vertexMap);
    const i1 = this.addVertex(v[1]!, n, quadUvs[1]!, vertices, normals, uvs, vertexMap);
    const i2 = this.addVertex(v[2]!, n, quadUvs[2]!, vertices, normals, uvs, vertexMap);
    const i3 = this.addVertex(v[3]!, n, quadUvs[3]!, vertices, normals, uvs, vertexMap);

    indices.push(i0, i1, i2);
    indices.push(i0, i2, i3);
  }

  private getFaceVertices(
    cell: Cell,
    zOrHeight: number,
    face: "top" | "bottom" | "left" | "right" | "front" | "back",
  ): ReadonlyArray<readonly [number, number, number]> {
    const x0 = cell.x0;
    const y0 = cell.y0;
    const x1 = cell.x1;
    const y1 = cell.y1;
    const z0 = 0;
    const z1 = zOrHeight;

    switch (face) {
      case "top":
        return [
          [x0, y0, z1],
          [x1, y0, z1],
          [x1, y1, z1],
          [x0, y1, z1],
        ];

      case "bottom":
        return [
          [x0, y1, z0],
          [x1, y1, z0],
          [x1, y0, z0],
          [x0, y0, z0],
        ];

      case "left":
        return [
          [x0, y0, z0],
          [x0, y0, z1],
          [x0, y1, z1],
          [x0, y1, z0],
        ];

      case "right":
        return [
          [x1, y1, z0],
          [x1, y1, z1],
          [x1, y0, z1],
          [x1, y0, z0],
        ];

      case "back":
        return [
          [x1, y0, z0],
          [x1, y0, z1],
          [x0, y0, z1],
          [x0, y0, z0],
        ];

      case "front":
        return [
          [x0, y1, z0],
          [x0, y1, z1],
          [x1, y1, z1],
          [x1, y1, z0],
        ];

      default:
        throw new Error(`Unknown face: ${face}`);
    }
  }

  private getFaceNormal(
    face: "top" | "bottom" | "left" | "right" | "front" | "back",
  ): readonly [number, number, number] {
    switch (face) {
      case "top":
        return [0, 0, 1];
      case "bottom":
        return [0, 0, -1];
      case "left":
        return [-1, 0, 0];
      case "right":
        return [1, 0, 0];
      case "back":
        return [0, -1, 0];
      case "front":
        return [0, 1, 0];
      default:
        throw new Error(`Unknown face: ${face}`);
    }
  }

  private addVertex(
    position: readonly [number, number, number],
    normal: readonly [number, number, number],
    uv: readonly [number, number],
    vertices: number[],
    normals: number[],
    uvs: number[],
    vertexMap: Map<string, number>,
  ): number {
    const key = [
      this.quantize(position[0]),
      this.quantize(position[1]),
      this.quantize(position[2]),
      this.quantize(normal[0]),
      this.quantize(normal[1]),
      this.quantize(normal[2]),
      this.quantize(uv[0]),
      this.quantize(uv[1]),
    ].join("|");

    const existing = vertexMap.get(key);
    if (existing !== undefined) {
      return existing;
    }

    const index = vertices.length / 3;

    vertices.push(position[0], position[1], position[2]);
    normals.push(normal[0], normal[1], normal[2]);
    uvs.push(uv[0], uv[1]);

    vertexMap.set(key, index);
    return index;
  }

  private quantize(value: number): string {
    return value.toFixed(9);
  }
}