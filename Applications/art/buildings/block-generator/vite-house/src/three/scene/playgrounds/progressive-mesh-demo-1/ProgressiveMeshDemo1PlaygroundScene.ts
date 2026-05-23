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

const PATCH_COLORS: readonly number[] = [
  0x2dd4bf,
  0xf59e0b,
  0xef4444,
  0xa855f7,
  0x22c55e,
];

type ProgressiveMeshDemoState = {
  width: number;
  depth: number;
  baseSamples: number;
  sampleBias: number;
};

export class ProgressiveMeshDemo1PlaygroundScene extends PlaygroundSceneBase {
  private gridBuilder: ProgressiveGridBuilder | undefined;
  private meshFactory: ThreeGridPatchMeshFactory | undefined;
  private state: ProgressiveMeshDemoState | undefined;
  private surfaceRoot: THREE.Group | null = null;

  public constructor(
    scene: IThreeScene,
    materialFactory: IMaterialFactory,
    viewId = "progressive-mesh-demo-1",
  ) {
    super(scene, "progressive-mesh-demo-1-root", materialFactory, viewId);
  }

  protected override createDefaultGround(): void {
    // Mesh-only demo: no ground plane.
  }

  protected override createContent(): void {
    this.rebuildScene();
  }

  public override dispose(): void {
    this.clearSceneContent();
    super.dispose();
  }

  protected override onUpdate(_deltaSeconds: number, _elapsedSeconds: number): void {
    // Static demo by design.
  }

  private rebuildScene(): void {
    this.clearSceneContent();

    const state = this.getState();
    const progressiveGrid = this.getGridBuilder().build(this.createDefinitions());
    const patches = progressiveGrid.getPatches();

    const surfaceRoot = new THREE.Group();
    surfaceRoot.name = "progressive-mesh-demo-surface";

    for (let index = 0; index < patches.length; index += 1) {
      const patch = patches[index];
      const mesh = this.createPatchMesh(patch, index);
      surfaceRoot.add(mesh);
    }

    surfaceRoot.rotation.x = -Math.PI / 2;
    surfaceRoot.position.set(-(state.width * 0.5), 0.2, state.depth * 0.5);
    surfaceRoot.visible = true;

    this.surfaceRoot = surfaceRoot;
    this.addToRoot(surfaceRoot);
  }

  private clearSceneContent(): void {
    if (this.surfaceRoot !== null) {
      this.root.remove(this.surfaceRoot);
      this.disposeObjectTree(this.surfaceRoot);
      this.surfaceRoot = null;
    }
  }

  private createPatchMesh(patch: IGridPatch, patchIndex: number): THREE.Mesh {
    const mesh = this.getMeshFactory().createMesh(patch, {
      material: new THREE.MeshStandardMaterial({
        color: PATCH_COLORS[patchIndex % PATCH_COLORS.length] ?? 0xffffff,
        roughness: 0.66,
        metalness: 0.08,
        wireframe: true,
        side: THREE.DoubleSide,
      }),
      namePrefix: "progressive-mesh-patch-",
    });

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  }

  private createDefinitions(): readonly GridPatchDefinition[] {
    const state = this.getState();
    const width = state.width;
    const depth = state.depth;
    const leftX0 = 0;
    const leftX1 = width * 0.4;
    const rightX0 = width * 0.6;
    const rightX1 = width;
    const midY = depth * 0.5;

    const lowSamples = this.clampSamples(state.baseSamples);
    const mediumSamples = this.clampSamples(state.baseSamples + state.sampleBias);
    const highSamples = this.clampSamples(state.baseSamples + (state.sampleBias * 2));
    const veryHighSamples = this.clampSamples(state.baseSamples + (state.sampleBias * 4));

    // Two disconnected clusters keep the grid progressive without flattening everything to one density.
    return [
      this.patchDefinition("left-bottom", leftX0, leftX1, 0, midY, lowSamples, lowSamples),
      this.patchDefinition("left-top", leftX0, leftX1, midY, depth, lowSamples, highSamples),
      this.patchDefinition("right-bottom", rightX0, rightX1, 0, midY, highSamples, mediumSamples),
      this.patchDefinition("right-top", rightX0, rightX1, midY, depth, highSamples, veryHighSamples),
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

  private getState(): ProgressiveMeshDemoState {
    if (this.state === undefined) {
      this.state = {
        width: 18,
        depth: 12,
        baseSamples: 2,
        sampleBias: 4,
      };
    }

    return this.state;
  }

  private disposeObjectTree(root: THREE.Object3D | null | undefined): void {
    if (root == null) {
      return;
    }

    root.traverse((node) => {
      const disposable = node as THREE.Object3D & {
        geometry?: THREE.BufferGeometry;
        material?: THREE.Material | THREE.Material[];
      };

      if (disposable.geometry !== undefined) {
        disposable.geometry.dispose();
      }

      const material = disposable.material;
      const materials = Array.isArray(material) ? material : material !== undefined ? [material] : [];
      for (const entry of materials) {
        const texture = (entry as THREE.Material & { map?: THREE.Texture | null }).map;
        if (texture instanceof THREE.Texture) {
          texture.dispose();
        }

        entry.dispose();
      }
    });
  }
}
