// ============================================================================
// FILE: Applications/art/buildings/block-generator/vite-house/tests/tree/TreeTrunkTestFixture.ts
// ============================================================================

import * as THREE from "three";
import { describe, expect, it } from "vitest";
import {
  DefaultTreeTrunkGenerationRequest,
  DeterministicTreeNoiseSource,
  type ITreeTrunkDomainObject,
  type ITreeTrunkGenerationRequest,
  TreeTrunkGenerator,
} from "../../../../src/index.js";
import {
  IndexedTreeGeometryBuilder,
  TreeMeshFactory,
  TreeThreeRenderer,
} from "../../../../src/index.js";

export class TreeTrunkTestFixture {
  public createRequest(overrides?: Partial<ITreeTrunkGenerationRequest>): ITreeTrunkGenerationRequest {
    return {
      ...DefaultTreeTrunkGenerationRequest,
      years: 6,
      radialSampleCount: 24,
      crossSectionsPerYear: 12,
      heightPerYear: 0.65,
      baseRadius: 0.12,
      annualGrowth: 0.025,
      taperPower: 0.95,
      ellipseRatioMin: 0.72,
      ellipseRatioMax: 0.92,
      radialVarianceAmplitude: 0.03,
      harmonicCount: 4,
      ...overrides,
    };
  }

  public createTree(
    seed = "tree-seed-a",
    overrides?: Partial<ITreeTrunkGenerationRequest>,
  ): ITreeTrunkDomainObject {
    const generator = new TreeTrunkGenerator(new DeterministicTreeNoiseSource(seed));
    return generator.generate(this.createRequest(overrides));
  }

  public createGeometry(
    seed = "tree-seed-a",
    overrides?: Partial<ITreeTrunkGenerationRequest>,
  ): THREE.BufferGeometry {
    const tree = this.createTree(seed, overrides);
    const builder = new IndexedTreeGeometryBuilder();
    return builder.build(tree);
  }

  public createMesh(
    seed = "tree-seed-a",
    overrides?: Partial<ITreeTrunkGenerationRequest>,
  ): THREE.Mesh {
    const tree = this.createTree(seed, overrides);
    const meshFactory = new TreeMeshFactory(new IndexedTreeGeometryBuilder());
    return meshFactory.create(tree);
  }

  public renderToGroup(
    seed = "tree-seed-a",
    overrides?: Partial<ITreeTrunkGenerationRequest>,
  ): { readonly group: THREE.Group; readonly mesh: THREE.Mesh; readonly tree: ITreeTrunkDomainObject } {
    const tree = this.createTree(seed, overrides);
    const group = new THREE.Group();
    const renderer = new TreeThreeRenderer(
      new TreeMeshFactory(new IndexedTreeGeometryBuilder()),
    );

    const mesh = renderer.renderToGroup(group, tree);
    return { group, mesh, tree };
  }

  public getExpectedSectionCount(request: ITreeTrunkGenerationRequest): number {
    return Math.max(2, request.years * request.crossSectionsPerYear);
  }

  public getExpectedVertexCount(request: ITreeTrunkGenerationRequest): number {
    const sections = this.getExpectedSectionCount(request);
    return (sections * request.radialSampleCount) + 2;
  }

  public getExpectedTriangleCount(request: ITreeTrunkGenerationRequest): number {
    const sections = this.getExpectedSectionCount(request);
    const sideTriangles = (sections - 1) * request.radialSampleCount * 2;
    const capTriangles = request.radialSampleCount * 2;
    return sideTriangles + capTriangles;
  }

  public getSampleRadiusSeries(tree: ITreeTrunkDomainObject, sampleIndex: number): number[] {
    return tree.crossSections.map((section) => section.samples[sampleIndex].radius);
  }

  public getSectionVarianceMagnitude(tree: ITreeTrunkDomainObject, sectionIndex: number): number {
    const section = tree.crossSections[sectionIndex];
    const offsets = section.samples.map((sample) => sample.varianceOffset);
    const minimum = Math.min(...offsets);
    const maximum = Math.max(...offsets);
    return maximum - minimum;
  }

  public getSectionAverageRadius(section: ITreeTrunkDomainObject["crossSections"][number]): number {
    const sum = section.samples.reduce((accumulator, sample) => accumulator + sample.radius, 0);
    return sum / section.samples.length;
  }
}

// ============================================================================
// FILE: Applications/art/buildings/block-generator/vite-house/tests/tree/core.tree.spec.ts
// ============================================================================

describe("TreeTrunkGenerator", () => {
  const fixture = new TreeTrunkTestFixture();

  it("should generate 12 cross-sections per year, one per month", () => {
    const request = fixture.createRequest({
      years: 5,
      crossSectionsPerYear: 12,
    });

    const tree = fixture.createTree("monthly-sections", request);
    const expectedSectionCount = fixture.getExpectedSectionCount(request);

    expect(tree.years).toBe(5);
    expect(tree.crossSectionsPerYear).toBe(12);
    expect(tree.crossSections).toHaveLength(expectedSectionCount);
  });

  it("should generate the configured number of discrete radial samples for every cross-section", () => {
    const request = fixture.createRequest({
      years: 3,
      radialSampleCount: 32,
    });

    const tree = fixture.createTree("radial-samples", request);

    expect(tree.radialSampleCount).toBe(32);

    for (const section of tree.crossSections) {
      expect(section.samples).toHaveLength(32);
    }
  });

  it("should produce a trunk height derived from years multiplied by heightPerYear", () => {
    const request = fixture.createRequest({
      years: 8,
      heightPerYear: 0.75,
    });

    const tree = fixture.createTree("height-derived", request);

    expect(tree.totalHeight).toBeCloseTo(6.0, 10);
  });

  it("should place cross-sections in ascending z order from bottom to top", () => {
    const tree = fixture.createTree("z-order", {
      years: 4,
      crossSectionsPerYear: 12,
    });

    expect(tree.crossSections[0].z).toBeCloseTo(0, 10);

    for (let index = 1; index < tree.crossSections.length; index++) {
      expect(tree.crossSections[index].z).toBeGreaterThan(tree.crossSections[index - 1].z);
    }

    expect(tree.crossSections[tree.crossSections.length - 1].z).toBeCloseTo(tree.totalHeight, 10);
  });

  it("should expose yearIndex and monthIndex for each generated cross-section", () => {
    const tree = fixture.createTree("year-month-index", {
      years: 2,
      crossSectionsPerYear: 12,
    });

    expect(tree.crossSections[0].yearIndex).toBe(0);
    expect(tree.crossSections[0].monthIndex).toBe(0);

    const last = tree.crossSections[tree.crossSections.length - 1];
    expect(last.yearIndex).toBeGreaterThanOrEqual(0);
    expect(last.yearIndex).toBeLessThan(2);
    expect(last.monthIndex).toBeGreaterThanOrEqual(0);
    expect(last.monthIndex).toBeLessThan(12);
  });

  it("should generate an elliptical cross-section with unequal major and minor axes within the configured ratio range", () => {
    const tree = fixture.createTree("ellipse-shape", {
      ellipseRatioMin: 0.70,
      ellipseRatioMax: 0.90,
    });

    for (const section of tree.crossSections) {
      expect(section.majorAxisRadius).toBeGreaterThan(0);
      expect(section.minorAxisRadius).toBeGreaterThan(0);
      expect(section.minorAxisRadius).toBeLessThanOrEqual(section.majorAxisRadius);

      const ratio = section.minorAxisRadius / section.majorAxisRadius;
      expect(ratio).toBeGreaterThanOrEqual(0.70);
      expect(ratio).toBeLessThanOrEqual(0.90);
    }
  });

  it("should apply probability-driven variance to sample amplitudes so the section is not perfectly smooth", () => {
    const tree = fixture.createTree("variance-visible", {
      radialVarianceAmplitude: 0.04,
      harmonicCount: 5,
      radialSampleCount: 48,
    });

    const middleSectionIndex = Math.floor(tree.crossSections.length / 2);
    const varianceMagnitude = fixture.getSectionVarianceMagnitude(tree, middleSectionIndex);

    expect(varianceMagnitude).toBeGreaterThan(0.005);
  });

  it("should taper the trunk on average toward the top", () => {
    const tree = fixture.createTree("tapering", {
      years: 8,
      annualGrowth: 0.03,
      taperPower: 1.0,
    });

    const bottomAverageRadius = fixture.getSectionAverageRadius(tree.crossSections[0]);
    const topAverageRadius = fixture.getSectionAverageRadius(tree.crossSections[tree.crossSections.length - 1]);

    expect(bottomAverageRadius).toBeGreaterThan(topAverageRadius);
  });

  it("should be deterministic for the same seed and request", () => {
    const request = fixture.createRequest({
      years: 7,
      radialSampleCount: 24,
      radialVarianceAmplitude: 0.025,
    });

    const treeA = fixture.createTree("same-seed", request);
    const treeB = fixture.createTree("same-seed", request);

    expect(treeA.totalHeight).toBeCloseTo(treeB.totalHeight, 10);
    expect(treeA.crossSections).toHaveLength(treeB.crossSections.length);

    for (let sectionIndex = 0; sectionIndex < treeA.crossSections.length; sectionIndex++) {
      const sectionA = treeA.crossSections[sectionIndex];
      const sectionB = treeB.crossSections[sectionIndex];

      expect(sectionA.majorAxisRadius).toBeCloseTo(sectionB.majorAxisRadius, 10);
      expect(sectionA.minorAxisRadius).toBeCloseTo(sectionB.minorAxisRadius, 10);

      for (let sampleIndex = 0; sampleIndex < sectionA.samples.length; sampleIndex++) {
        expect(sectionA.samples[sampleIndex].radius).toBeCloseTo(sectionB.samples[sampleIndex].radius, 10);
        expect(sectionA.samples[sampleIndex].x).toBeCloseTo(sectionB.samples[sampleIndex].x, 10);
        expect(sectionA.samples[sampleIndex].y).toBeCloseTo(sectionB.samples[sampleIndex].y, 10);
      }
    }
  });

  it("should produce different surface amplitudes for different seeds", () => {
    const treeA = fixture.createTree("seed-a", {
      years: 6,
      radialSampleCount: 24,
    });

    const treeB = fixture.createTree("seed-b", {
      years: 6,
      radialSampleCount: 24,
    });

    const middleSectionIndex = Math.floor(treeA.crossSections.length / 2);
    const sampleIndex = 5;

    const radiusA = treeA.crossSections[middleSectionIndex].samples[sampleIndex].radius;
    const radiusB = treeB.crossSections[middleSectionIndex].samples[sampleIndex].radius;

    expect(radiusA).not.toBeCloseTo(radiusB, 10);
  });

  it("should keep all sample radii positive", () => {
    const tree = fixture.createTree("positive-radii", {
      radialVarianceAmplitude: 0.2,
      harmonicCount: 6,
      radialSampleCount: 64,
    });

    for (const section of tree.crossSections) {
      for (const sample of section.samples) {
        expect(sample.radius).toBeGreaterThan(0);
      }
    }
  });
});

// ============================================================================
// FILE: Applications/art/buildings/block-generator/vite-house/tests/tree/three.tree.renderer.spec.ts
// ============================================================================

describe("IndexedTreeGeometryBuilder", () => {
  const fixture = new TreeTrunkTestFixture();

  it("should triangulate all cross-sections into indexed buffer geometry", () => {
    const request = fixture.createRequest({
      years: 4,
      crossSectionsPerYear: 12,
      radialSampleCount: 16,
    });

    const geometry = fixture.createGeometry("triangulation", request);
    const positionAttribute = geometry.getAttribute("position");
    const index = geometry.getIndex();

    expect(positionAttribute).toBeTruthy();
    expect(index).toBeTruthy();

    const expectedVertexCount = fixture.getExpectedVertexCount(request);
    const expectedTriangleCount = fixture.getExpectedTriangleCount(request);

    expect(positionAttribute.count).toBe(expectedVertexCount);
    expect(index!.count).toBe(expectedTriangleCount * 3);
  });

  it("should generate side faces plus bottom and top caps", () => {
    const request = fixture.createRequest({
      years: 2,
      crossSectionsPerYear: 12,
      radialSampleCount: 12,
    });

    const geometry = fixture.createGeometry("capped-geometry", request);
    const index = geometry.getIndex();

    expect(index).toBeTruthy();

    const sectionCount = fixture.getExpectedSectionCount(request);
    const expectedSideTriangles = (sectionCount - 1) * request.radialSampleCount * 2;
    const expectedCapTriangles = request.radialSampleCount * 2;
    const expectedTotalTriangles = expectedSideTriangles + expectedCapTriangles;

    expect(index!.count / 3).toBe(expectedTotalTriangles);
  });

  it("should compute normals, bounding box, and bounding sphere", () => {
    const geometry = fixture.createGeometry("geometry-bounds", {
      years: 5,
      radialSampleCount: 24,
    });

    const normalAttribute = geometry.getAttribute("normal");

    expect(normalAttribute).toBeTruthy();
    expect(geometry.boundingBox).toBeTruthy();
    expect(geometry.boundingSphere).toBeTruthy();

    expect(geometry.boundingBox!.max.z).toBeGreaterThan(geometry.boundingBox!.min.z);
    expect(geometry.boundingSphere!.radius).toBeGreaterThan(0);
  });

  it("should span approximately the same height as the generated domain object", () => {
    const tree = fixture.createTree("height-match", {
      years: 5,
      heightPerYear: 0.8,
      radialSampleCount: 20,
    });

    const geometry = new IndexedTreeGeometryBuilder().build(tree);
    geometry.computeBoundingBox();

    const actualHeight = geometry.boundingBox!.max.z - geometry.boundingBox!.min.z;
    expect(actualHeight).toBeCloseTo(tree.totalHeight, 6);
  });
});

describe("TreeMeshFactory", () => {
  const fixture = new TreeTrunkTestFixture();

  it("should create a mesh with generated geometry", () => {
    const mesh = fixture.createMesh("mesh-factory", {
      years: 3,
      radialSampleCount: 18,
    });

    expect(mesh).toBeInstanceOf(THREE.Mesh);
    expect(mesh.geometry).toBeInstanceOf(THREE.BufferGeometry);
    expect(mesh.castShadow).toBe(true);
    expect(mesh.receiveShadow).toBe(true);
  });
});

describe("TreeThreeRenderer", () => {
  const fixture = new TreeTrunkTestFixture();

  it("should add the generated tree mesh to the provided group", () => {
    const result = fixture.renderToGroup("group-render", {
      years: 4,
      radialSampleCount: 16,
    });

    expect(result.group.children).toHaveLength(1);
    expect(result.group.children[0]).toBe(result.mesh);
  });
});