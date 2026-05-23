import * as THREE from "three";
import type { IMaterialFactory } from "@monorepo/core-threejs-app-framework/src/Materials/IMaterialFactory.js";
import {
  GridNeighbourDetector,
  MaxEdgeResolutionNegotiator,
  ProgressiveGridBuilder,
  UniformGridPatchFactory,
  UniformSamplingPolicy,
  type GridPatchDefinition,
  type IGridPatch,
} from "@monorepo/game-progressive-grid/src/index.js";
import { ThreeGridPatchMeshFactory } from "@monorepo/game-progressive-grid-threejs/src/index.js";
import type { IThreeScene } from "../../IThreeScene.js";
import { PlaygroundSceneBase } from "../../common/PlaygroundSceneBase.ts";

type HeightMapState = {
  width: number;
  depth: number;
  baseSamples: number;
  sampleBias: number;
  heightScale: number;
};

type HeightMapPixels = {
  width: number;
  height: number;
  data: Uint8ClampedArray;
  minLuma: number;
  maxLuma: number;
};

export class HeightMapProgressiveGridPlaygroundScene extends PlaygroundSceneBase {
  private gridBuilder: ProgressiveGridBuilder | undefined;
  private meshFactory: ThreeGridPatchMeshFactory | undefined;
  private imageLoader: THREE.ImageLoader | undefined;
  private state: HeightMapState | undefined;
  private surfaceRoot: THREE.Group | null = null;
  private axesHelper: THREE.AxesHelper | null = null;
  private loadRevision = 0;

  public constructor(
    scene: IThreeScene,
    materialFactory: IMaterialFactory,
    viewId = "height-map-progressive-grid",
  ) {
    super(scene, "height-map-progressive-grid-root", materialFactory, viewId);
  }

  protected override createDefaultGround(): void {
    // Mesh-only demo.
  }

  protected override createContent(): void {
    this.rebuildScene();
  }

  public override dispose(): void {
    this.clearSceneContent();
    super.dispose();
  }

  private rebuildScene(): void {
    this.clearSceneContent();

    const revision = ++this.loadRevision;
    const state = this.getState();

    this.getImageLoader().load(
      "/heigth-map.png",
      (image: HTMLImageElement | ImageBitmap) => {
        if (revision !== this.loadRevision) {
          return;
        }

        const heightMap = this.readHeightMapPixels(image);
        const grid = this.getGridBuilder().build(this.createDefinitions());
        const patches = grid.getPatches();

        const root = new THREE.Group();
        root.name = "height-map-progressive-grid-surface";

        for (let i = 0; i < patches.length; i += 1) {
          const mesh = this.createPatchMesh(patches[i]);
          this.applyHeightMap(mesh, heightMap, state);
          root.add(mesh);
        }

        // Match known-good scene orientation used by waves demo.
        root.position.set(-(state.width / 2), 0, -(state.depth / 2));

        this.surfaceRoot = root;
        this.addToRoot(root);
      },
      undefined,
      (error: unknown) => {
        if (revision !== this.loadRevision) {
          return;
        }

        console.error("Failed to load /heigth-map.png", error);
        const marker = new THREE.Mesh(
          new THREE.BoxGeometry(2, 2, 2),
          new THREE.MeshBasicMaterial({ color: 0xff0033, wireframe: true }),
        );
        marker.position.set(0, 4, 0);
        this.surfaceRoot = new THREE.Group();
        this.surfaceRoot.add(marker);
        this.addToRoot(this.surfaceRoot);
      },
    );
  }

  private createPatchMesh(patch: IGridPatch): THREE.Mesh {
    const mesh = this.getMeshFactory().createMesh(patch, {
      material: new THREE.MeshBasicMaterial({
        color: 0x00ffcc,
        wireframe: true,
      }),
      namePrefix: "height-map-patch-",
    });

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  private applyHeightMap(
    mesh: THREE.Mesh,
    heightMap: HeightMapPixels,
    state: HeightMapState,
  ): void {
    const geometry = mesh.geometry;
    const position = geometry.getAttribute("position");
    if (!(position instanceof THREE.BufferAttribute)) {
      return;
    }

    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i);
      const y = position.getY(i);
      const h = this.sampleHeight(heightMap, x / state.width, y / state.depth);
      position.setZ(i, h * state.heightScale);
    }
    position.needsUpdate = true;
    geometry.computeVertexNormals();
  }

  private sampleHeight(heightMap: HeightMapPixels, u: number, v: number): number {
    const x = Math.min(heightMap.width - 1, Math.max(0, Math.floor(u * (heightMap.width - 1))));
    const y = Math.min(heightMap.height - 1, Math.max(0, Math.floor(v * (heightMap.height - 1))));
    const offset = (y * heightMap.width + x) * 4;
    const r = heightMap.data[offset] ?? 0;
    const g = heightMap.data[offset + 1] ?? 0;
    const b = heightMap.data[offset + 2] ?? 0;

    const luma = (r + g + b) / (3 * 255);
    const span = Math.max(0.0001, heightMap.maxLuma - heightMap.minLuma);
    return Math.min(1, Math.max(0, (luma - heightMap.minLuma) / span));
  }

  private readHeightMapPixels(image: HTMLImageElement | ImageBitmap): HeightMapPixels {
    const canvas = document.createElement("canvas");
    const width = "naturalWidth" in image ? image.naturalWidth : image.width;
    const height = "naturalHeight" in image ? image.naturalHeight : image.height;
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (context === null) {
      throw new Error("2D canvas context is unavailable.");
    }

    context.drawImage(image, 0, 0);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    let minLuma = Number.POSITIVE_INFINITY;
    let maxLuma = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i] ?? 0;
      const g = imageData.data[i + 1] ?? 0;
      const b = imageData.data[i + 2] ?? 0;
      const luma = (r + g + b) / (3 * 255);
      if (luma < minLuma) {
        minLuma = luma;
      }
      if (luma > maxLuma) {
        maxLuma = luma;
      }
    }

    return {
      width: canvas.width,
      height: canvas.height,
      data: imageData.data,
      minLuma: Number.isFinite(minLuma) ? minLuma : 0,
      maxLuma: Number.isFinite(maxLuma) ? maxLuma : 1,
    };
  }

  private createDefinitions(): readonly GridPatchDefinition[] {
    const state = this.getState();
    const width = state.width;
    const depth = state.depth;

    const x0 = 0;
    const x1 = width * 0.10;
    const x2 = width * 0.24;
    const x3 = width * 0.43;
    const x4 = width * 0.67;
    const x5 = width;

    const s0 = this.clampSamples(state.baseSamples + (state.sampleBias * 0));
    const s1 = this.clampSamples(state.baseSamples + (state.sampleBias * 1));
    const s2 = this.clampSamples(state.baseSamples + (state.sampleBias * 2));
    const s3 = this.clampSamples(state.baseSamples + (state.sampleBias * 3));
    const s4 = this.clampSamples(state.baseSamples + (state.sampleBias * 4));

    return [
      this.patchDefinition("left", x0, x1, 0, depth, s0, s2),
      this.patchDefinition("left-mid", x1, x2, 0, depth, s1, s2),
      this.patchDefinition("center", x2, x3, 0, depth, s2, s2),
      this.patchDefinition("right-mid", x3, x4, 0, depth, s3, s2),
      this.patchDefinition("right", x4, x5, 0, depth, s4, s2),
    ];
  }

  private patchDefinition(
    id: string,
    x0: number,
    x1: number,
    y0: number,
    y1: number,
    xSamples: number,
    ySamples: number,
  ): GridPatchDefinition {
    return {
      id,
      bounds: { x0, x1, y0, y1 },
      resolution: {
        xSamples: this.clampSamples(xSamples),
        ySamples: this.clampSamples(ySamples),
      },
    };
  }

  private clampSamples(value: number): number {
    return Math.max(2, Math.floor(value));
  }

  private getState(): HeightMapState {
    if (this.state === undefined) {
      this.state = {
        width: 24,
        depth: 24,
        baseSamples: 20,
        sampleBias: 12,
        heightScale: 30,
      };
    }

    return this.state;
  }

  private getImageLoader(): THREE.ImageLoader {
    if (this.imageLoader === undefined) {
      this.imageLoader = new THREE.ImageLoader();
    }

    return this.imageLoader;
  }

  private getGridBuilder(): ProgressiveGridBuilder {
    if (this.gridBuilder === undefined) {
      this.gridBuilder = new ProgressiveGridBuilder(
        new GridNeighbourDetector(),
        new MaxEdgeResolutionNegotiator(),
        new UniformGridPatchFactory(new UniformSamplingPolicy()),
      );
    }

    return this.gridBuilder;
  }

  private getMeshFactory(): ThreeGridPatchMeshFactory {
    if (this.meshFactory === undefined) {
      this.meshFactory = new ThreeGridPatchMeshFactory();
    }

    return this.meshFactory;
  }

  private clearSceneContent(): void {
    if (this.surfaceRoot !== null) {
      this.root.remove(this.surfaceRoot);
      this.disposeObjectTree(this.surfaceRoot);
      this.surfaceRoot = null;
    }

    if (this.axesHelper !== null) {
      this.root.remove(this.axesHelper);
      this.axesHelper = null;
    }
  }

  private disposeObjectTree(root: THREE.Object3D | null | undefined): void {
    if (root == null) {
      return;
    }

    root.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (!mesh.isMesh) {
        return;
      }

      mesh.geometry.dispose();

      if (Array.isArray(mesh.material)) {
        for (const material of mesh.material) {
          material.dispose();
        }
      } else {
        mesh.material.dispose();
      }
    });
  }
}
