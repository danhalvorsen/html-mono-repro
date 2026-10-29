 
import * as THREE from "three";

import type { IPoint3, IRectGeometryService } from "./IRectGeometryService.js";
import type { IRectState } from "./IRectState.js";
import { RectGeometryService } from "./RectGeometryService.js";

export class ThreeRectGeometryFactory {
  private readonly geometryService: IRectGeometryService;

  public constructor(geometryService?: IRectGeometryService) {
    this.geometryService = geometryService ?? new RectGeometryService();
  }

  public create(rects: ReadonlyArray<IRectState>): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();

    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    let vertexOffset = 0;

    for (const rect of rects) {
      const vertices = this.createRectVertices(rect);

      for (const vertex of vertices) {
        positions.push(vertex.x, vertex.y, vertex.z);
      }

      uvs.push(
        0, 0,
        1, 0,
        0, 1,
        1, 1,
        0, 0,
        1, 0,
        0, 1,
        1, 1,
      );

      for (let index = 0; index < 8; index += 1) {
        normals.push(0, 0, 1);
      }

      indices.push(
        vertexOffset + 0, vertexOffset + 1, vertexOffset + 2,
        vertexOffset + 2, vertexOffset + 1, vertexOffset + 3,
        vertexOffset + 4, vertexOffset + 6, vertexOffset + 5,
        vertexOffset + 6, vertexOffset + 7, vertexOffset + 5,
        vertexOffset + 0, vertexOffset + 2, vertexOffset + 4,
        vertexOffset + 2, vertexOffset + 6, vertexOffset + 4,
        vertexOffset + 1, vertexOffset + 5, vertexOffset + 3,
        vertexOffset + 3, vertexOffset + 5, vertexOffset + 7,
        vertexOffset + 2, vertexOffset + 3, vertexOffset + 6,
        vertexOffset + 3, vertexOffset + 7, vertexOffset + 6,
        vertexOffset + 0, vertexOffset + 4, vertexOffset + 1,
        vertexOffset + 1, vertexOffset + 4, vertexOffset + 5,
      );

      vertexOffset += 8;
    }

    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
  }

  private createRectVertices(rect: IRectState): ReadonlyArray<IPoint3> {
    const halfWidth = rect.size.width / 2;
    const halfHeight = rect.size.height / 2;
    const halfDepth = rect.size.depth / 2;

    const localVertices = [
      Object.freeze({ x: -halfWidth, y: -halfHeight, z: -halfDepth }),
      Object.freeze({ x: +halfWidth, y: -halfHeight, z: -halfDepth }),
      Object.freeze({ x: -halfWidth, y: +halfHeight, z: -halfDepth }),
      Object.freeze({ x: +halfWidth, y: +halfHeight, z: -halfDepth }),
      Object.freeze({ x: -halfWidth, y: -halfHeight, z: +halfDepth }),
      Object.freeze({ x: +halfWidth, y: -halfHeight, z: +halfDepth }),
      Object.freeze({ x: -halfWidth, y: +halfHeight, z: +halfDepth }),
      Object.freeze({ x: +halfWidth, y: +halfHeight, z: +halfDepth }),
    ];

    const pivot = rect.pivot !== undefined
      ? this.geometryService.getLocalSemanticPoint(rect.size, rect.pivot)
      : Object.freeze({ x: 0, y: 0, z: 0 });

    const radians = (-rect.rotationDegrees * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    return localVertices.map((vertex) => {
      const translatedX = vertex.x - pivot.x;
      const translatedY = vertex.y - pivot.y;

      const rotatedX = (translatedX * cos) - (translatedY * sin);
      const rotatedY = (translatedX * sin) + (translatedY * cos);

      return Object.freeze({
        x: rotatedX + pivot.x + rect.centerX,
        y: rotatedY + pivot.y + rect.centerY,
        z: vertex.z + rect.centerZ,
      });
    });
  }
}
