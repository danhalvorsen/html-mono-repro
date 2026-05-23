import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import type { IMaterialFactory } from "@monorepo/core-threejs-app-framework/src/Materials/IMaterialFactory.js";
import {
  GridNeighbourDetector,
  MaxEdgeResolutionNegotiator,
  ProgressiveGridBuilder,
  UniformGridPatchFactory,
  UniformSamplingPolicy,
  type IGridPatch,
  type GridPatchDefinition,
} from "@monorepo/game-progressive-grid/src/index.js";
import { ThreeGridPatchMeshFactory } from "@monorepo/game-progressive-grid-threejs/src/index.js";
import type { IThreeScene } from "../../IThreeScene.js";
import { PlaygroundSceneBase } from "../../common/PlaygroundSceneBase.ts";

const WAVE_PATCH_COLORS: readonly number[] = [
  0x2ecc71,
  0xf4a261,
  0xe76f51,
  0xa855f7,
  0xec4899,
];

type WavesDemoState = {
  width: number;
  depth: number;
  baseSamples: number;
  sampleBias: number;
  amplitude: number;
  frequency: number;
  speed: number;
  elevation: number;
  showCenterPatch: boolean;
  showGrid: boolean;
  wireframe: boolean;
  showAxes: boolean;
  rebuild: () => void;
};

type WaveVertexState = {
  readonly position: THREE.BufferAttribute;
  readonly baseX: Float32Array;
  readonly baseY: Float32Array;
};

export class WavesPlaygroundScene extends PlaygroundSceneBase {
  private gridBuilder: ProgressiveGridBuilder | undefined;
  private meshFactory: ThreeGridPatchMeshFactory | undefined;
  private state: WavesDemoState | undefined;
  private gridRoot: THREE.Group | null = null;
  private axesHelper: THREE.AxesHelper | null = null;
  private gui: GUI | null = null;
  private vertexStates: WaveVertexState[] = [];

  public constructor(
    scene: IThreeScene,
    materialFactory: IMaterialFactory,
    viewId = "waves",
  ) {
    super(scene, "waves-root", materialFactory, viewId);
  }

  protected override createContent(): void {
    this.rebuildGrid();
    this.createGui();
  }

  protected override onUpdate(_deltaSeconds: number, elapsedSeconds: number): void {
    const state = this.getState();
    const amplitude = state.amplitude;
    const frequency = state.frequency;
    const speed = state.speed;

    for (const vertexState of this.vertexStates) {
      const { position, baseX, baseY } = vertexState;

      for (let index = 0; index < position.count; index += 1) {
        const x = baseX[index];
        const y = baseY[index];
        const wave =
          Math.sin((x * frequency) + (elapsedSeconds * speed)) *
          Math.cos((y * frequency) - (elapsedSeconds * speed * 0.8));

        position.setZ(index, state.elevation + (wave * amplitude));
      }

      position.needsUpdate = true;
      position.usage = THREE.DynamicDrawUsage;
    }
  }

  public override dispose(): void {
    this.gui?.destroy();
    this.gui = null;
    this.clearGrid();
    super.dispose();
  }

  private rebuildGrid(): void {
    this.clearGrid();

    const definitions = this.createDefinitions();
    const progressiveGrid = this.getGridBuilder().build(definitions);
    const state = this.getState();

    const group = new THREE.Group();
    group.name = "waves-progressive-grid";
    const patches = progressiveGrid.getPatches();
    for (let index = 0; index < patches.length; index += 1) {
      const patch = patches[index];
      group.add(this.createPatchMesh(patch, index));
    }

    this.vertexStates = [];

    group.traverse((object: THREE.Object3D) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh) {
        return;
      }

      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const material = mesh.material;
      if (Array.isArray(material)) {
        for (const entry of material) {
          const standard = entry as THREE.MeshStandardMaterial;
          standard.wireframe = state.wireframe;
          standard.metalness = 0.1;
          standard.roughness = 0.72;
        }
      } else if (material !== undefined) {
        const standard = material as THREE.MeshStandardMaterial;
        standard.wireframe = state.wireframe;
        standard.metalness = 0.1;
        standard.roughness = 0.72;
      }

      const geometry = mesh.geometry;
      const position = geometry.getAttribute("position");
      if (!(position instanceof THREE.BufferAttribute)) {
        return;
      }

      const baseX = new Float32Array(position.count);
      const baseY = new Float32Array(position.count);

      for (let index = 0; index < position.count; index += 1) {
        baseX[index] = position.getX(index);
        baseY[index] = position.getY(index);
      }

      this.vertexStates.push({
        position,
        baseX,
        baseY,
      });
    });

    group.position.set(-(state.width / 2), 0, -(state.depth / 2));
    group.visible = state.showGrid;

    this.gridRoot = group;
    this.axesHelper = new THREE.AxesHelper(4);
    this.axesHelper.visible = state.showAxes;

    this.addToRoot(group, this.axesHelper);
  }

  private createPatchMesh(patch: IGridPatch, patchIndex: number): THREE.Mesh {
    const mesh = this.getMeshFactory().createMesh(patch, {
      material: this.createPatchMaterial(patchIndex),
      namePrefix: "wave-patch-",
    });

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.visible = patch.id !== "center" || this.getState().showCenterPatch;

    return mesh;
  }

  private createPatchMaterial(patchIndex: number): THREE.MeshStandardMaterial {
    const color = WAVE_PATCH_COLORS[patchIndex % WAVE_PATCH_COLORS.length] ?? 0xffffff;

    return new THREE.MeshStandardMaterial({
      color,
      roughness: 0.72,
      metalness: 0.1,
      wireframe: this.getState().wireframe,
      side: THREE.DoubleSide,
    });
  }

  private clearGrid(): void {
    if (this.gridRoot != null) {
      this.root.remove(this.gridRoot);
      this.disposeObjectTree(this.gridRoot);
      this.gridRoot = null;
    }

    if (this.axesHelper != null) {
      this.root.remove(this.axesHelper);
      this.axesHelper = null;
    }

    this.vertexStates = [];
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

    // This is intentionally progressive: each patch gets denser as it moves right.
    // The shared edges stay compatible because the progressive grid negotiates them.
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

  private createGui(): void {
    this.gui?.destroy();
    const state = this.getState();

    const gui = new GUI({ title: "Progressive Waves Strip" });
    gui.domElement.style.zIndex = "1000";

    const gridFolder = gui.addFolder("Grid");
    gridFolder.add(state, "width", 8, 40, 1).onFinishChange(() => this.rebuildGrid());
    gridFolder.add(state, "depth", 8, 40, 1).onFinishChange(() => this.rebuildGrid());
    gridFolder.add(state, "baseSamples", 2, 40, 1).onFinishChange(() => this.rebuildGrid());
    gridFolder.add(state, "sampleBias", 0, 12, 1).onFinishChange(() => this.rebuildGrid());

    const waveFolder = gui.addFolder("Wave");
    waveFolder.add(state, "amplitude", 0, 4, 0.01);
    waveFolder.add(state, "frequency", 0.05, 2.5, 0.01);
    waveFolder.add(state, "speed", 0, 6, 0.01);
    waveFolder.add(state, "elevation", -2, 4, 0.01);

    gui
      .add(state, "showCenterPatch")
      .name("showCenterPatch")
      .onChange((value: boolean) => this.setPatchVisibility("center", value));

    gui
      .add(state, "showGrid")
      .name("showGrid")
      .onChange((value: boolean) => {
        if (this.gridRoot !== null) {
          this.gridRoot.visible = value;
        }
      });

    gui
      .add(state, "wireframe")
      .onChange((value: boolean) => this.setWireframe(value));

    gui
      .add(state, "showAxes")
      .onChange((value: boolean) => {
        if (this.axesHelper !== null) {
          this.axesHelper.visible = value;
        }
      });

    gui.add(state, "rebuild").name("Rebuild Mesh");

    this.gui = gui;
  }

  private setWireframe(enabled: boolean): void {
    if (this.gridRoot === null) {
      return;
    }

    this.gridRoot.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh) {
        return;
      }

      const material = mesh.material;
      if (Array.isArray(material)) {
        for (const entry of material) {
          (entry as THREE.MeshStandardMaterial).wireframe = enabled;
        }
      } else if (material !== undefined) {
        (material as THREE.MeshStandardMaterial).wireframe = enabled;
      }
    });
  }

  private setPatchVisibility(patchId: string, visible: boolean): void {
    if (this.gridRoot === null) {
      return;
    }

    this.gridRoot.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh) {
        return;
      }

      if (mesh.name === `wave-patch-${patchId}`) {
        mesh.visible = visible;
      }
    });
  }

  private getMeshFactory(): ThreeGridPatchMeshFactory {
    if (this.meshFactory === undefined) {
      this.meshFactory = new ThreeGridPatchMeshFactory();
    }

    return this.meshFactory;
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

  private getState(): WavesDemoState {
    if (this.state === undefined) {
      this.state = {
        width: 30,
        depth: 12,
        baseSamples: 4,
        sampleBias: 4,
        amplitude: 1.1,
        frequency: 0.55,
        speed: 1.35,
        elevation: 1.25,
        showCenterPatch: true,
        showGrid: true,
        wireframe: false,
        showAxes: true,
        rebuild: () => {
          this.rebuildGrid();
        },
      };
    }

    return this.state;
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
