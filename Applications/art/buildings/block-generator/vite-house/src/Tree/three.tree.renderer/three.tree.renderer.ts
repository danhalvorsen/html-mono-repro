
// ============================================================================
// FILE: Applications/art/buildings/block-generator/vite-house/src/Tree/three.tree.renderer/three.tree.renderer.ts
// ============================================================================

import * as THREE from "three";
import type {
  ITreeCrossSection,
  ITreeTrunkDomainObject,
} from "../core.tree/core.tree.js";

export interface IIndexedTreeGeometryBuilder {
  build(domainObject: ITreeTrunkDomainObject): THREE.BufferGeometry;
}

export interface ITreeMeshFactory {
  create(domainObject: ITreeTrunkDomainObject, material?: THREE.Material): THREE.Mesh;
}

export class IndexedTreeGeometryBuilder implements IIndexedTreeGeometryBuilder {
  public build(domainObject: ITreeTrunkDomainObject): THREE.BufferGeometry {
    this.validate(domainObject);

    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const sectionCount = domainObject.crossSections.length;
    const radialSampleCount = domainObject.radialSampleCount;

    for (let sectionIndex = 0; sectionIndex < sectionCount; sectionIndex++) {
      const crossSection = domainObject.crossSections[sectionIndex];
      const v = sectionCount === 1 ? 0 : sectionIndex / (sectionCount - 1);

      for (let sampleIndex = 0; sampleIndex < radialSampleCount; sampleIndex++) {
        const sample = crossSection.samples[sampleIndex];
        positions.push(sample.x, sample.y, sample.z);

        const u = radialSampleCount === 1 ? 0 : sampleIndex / radialSampleCount;
        uvs.push(u, v);
      }
    }

    for (let sectionIndex = 0; sectionIndex < sectionCount - 1; sectionIndex++) {
      for (let sampleIndex = 0; sampleIndex < radialSampleCount; sampleIndex++) {
        const current = this.toVertexIndex(sectionIndex, sampleIndex, radialSampleCount);
        const next = this.toVertexIndex(sectionIndex, (sampleIndex + 1) % radialSampleCount, radialSampleCount);
        const currentAbove = this.toVertexIndex(sectionIndex + 1, sampleIndex, radialSampleCount);
        const nextAbove = this.toVertexIndex(sectionIndex + 1, (sampleIndex + 1) % radialSampleCount, radialSampleCount);

        indices.push(current, nextAbove, currentAbove);
        indices.push(current, next, nextAbove);
      }
    }

    const bottomCenterIndex = positions.length / 3;
    const bottomCenter = this.calculateCenter(domainObject.crossSections[0]);
    positions.push(bottomCenter.x, bottomCenter.y, bottomCenter.z);
    uvs.push(0.5, 0.5);

    for (let sampleIndex = 0; sampleIndex < radialSampleCount; sampleIndex++) {
      const current = this.toVertexIndex(0, sampleIndex, radialSampleCount);
      const next = this.toVertexIndex(0, (sampleIndex + 1) % radialSampleCount, radialSampleCount);

      indices.push(bottomCenterIndex, next, current);
    }

    const topCenterIndex = positions.length / 3;
    const topSection = domainObject.crossSections[sectionCount - 1];
    const topCenter = this.calculateCenter(topSection);
    positions.push(topCenter.x, topCenter.y, topCenter.z);
    uvs.push(0.5, 0.5);

    for (let sampleIndex = 0; sampleIndex < radialSampleCount; sampleIndex++) {
      const current = this.toVertexIndex(sectionCount - 1, sampleIndex, radialSampleCount);
      const next = this.toVertexIndex(sectionCount - 1, (sampleIndex + 1) % radialSampleCount, radialSampleCount);

      indices.push(topCenterIndex, current, next);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    return geometry;
  }

  private validate(domainObject: ITreeTrunkDomainObject): void {
    if (domainObject.crossSections.length < 2) {
      throw new Error("Tree trunk must contain at least two cross-sections.");
    }

    for (const crossSection of domainObject.crossSections) {
      if (crossSection.samples.length !== domainObject.radialSampleCount) {
        throw new Error("All cross-sections must contain the same radial sample count.");
      }
    }
  }

  private toVertexIndex(sectionIndex: number, sampleIndex: number, radialSampleCount: number): number {
    return (sectionIndex * radialSampleCount) + sampleIndex;
  }

  private calculateCenter(crossSection: ITreeCrossSection): { readonly x: number; readonly y: number; readonly z: number } {
    let x = 0;
    let y = 0;

    for (const sample of crossSection.samples) {
      x += sample.x;
      y += sample.y;
    }

    return {
      x: x / crossSection.samples.length,
      y: y / crossSection.samples.length,
      z: crossSection.z,
    };
  }
}

 export class TreeThreeRenderer {
  private readonly meshFactory: ITreeMeshFactory;

  public constructor(meshFactory: ITreeMeshFactory) {
    this.meshFactory = meshFactory;
  }

  public renderToGroup(
    group: THREE.Group,
    domainObject: ITreeTrunkDomainObject,
    material?: THREE.Material,
  ): THREE.Mesh {
    const mesh = this.meshFactory.create(domainObject, material);
    group.add(mesh);
    return mesh;
  }
}

// ============================================================================
// OPTIONAL USAGE EXAMPLE
// ============================================================================

/*
import * as THREE from "three";
import {
  DefaultTreeTrunkGenerationRequest,
  DeterministicTreeNoiseSource,
  TreeTrunkGenerator,
} from "./core.tree/core.tree.js";
import {
  IndexedTreeGeometryBuilder,
  TreeMeshFactory,
  TreeThreeRenderer,
} from "./three.tree.renderer/three.tree.renderer.js";

const noise = new DeterministicTreeNoiseSource("oak-tree-01");
const generator = new TreeTrunkGenerator(noise);

const tree = generator.generate({
  ...DefaultTreeTrunkGenerationRequest,
  years: 18,
  radialSampleCount: 32,
  crossSectionsPerYear: 12,
  radialVarianceAmplitude: 0.045,
  annualGrowth: 0.022,
});

const geometryBuilder = new IndexedTreeGeometryBuilder();
const meshFactory = new TreeMeshFactory(geometryBuilder);
const renderer = new TreeThreeRenderer(meshFactory);

const group = new THREE.Group();
renderer.renderToGroup(
  group,
  tree,
  new THREE.MeshStandardMaterial({ roughness: 1.0, metalness: 0.0 }),
);
*/
