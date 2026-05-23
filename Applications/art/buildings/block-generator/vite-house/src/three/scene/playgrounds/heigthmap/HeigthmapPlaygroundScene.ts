import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import type { IMaterialFactory } from "@monorepo/core-threejs-app-framework/src/Materials/IMaterialFactory.js";
import {
  GridNeighbourDetector,
  MaxEdgeResolutionNegotiator,
  ProgressiveGridBuilder,
  UniformGridPatchFactory,
  UniformSamplingPolicy,
  type GridPatchDefinition,
} from "@monorepo/game-progressive-grid/src/index.js";
import {
  createBrowserHeightmapProgressiveGridServices,
} from "@monorepo/game-progressive-grid-heightmap-threejs";
import type { IThreeScene } from "../../IThreeScene.js";
import { PlaygroundSceneBase } from "../../common/PlaygroundSceneBase.ts";

const HEIGHTMAP_IMAGE_PATH = "/test2.png";
const READY_INSTANCES = new WeakSet<HeigthmapPlaygroundScene>();
const HEIGHTMAP_UV_ROTATION_RADIANS = 0;
const MAX_SOURCE_ADAPTED_SAMPLES = 512;

type HeigthmapState = {
  width: number;
  depth: number;
  baseSamples: number;
  sampleBias: number;
  heightScale: number;
  whitePower: number;
  blackFloor: number;
  meshOpacity: number;
  flipY: boolean;
  invertHeight: boolean;
};

export class HeigthmapPlaygroundScene extends PlaygroundSceneBase {
  private static activeGui: GUI | null = null;
  private gridBuilder: ProgressiveGridBuilder | undefined;
  private textureLoader: THREE.TextureLoader | undefined;
  private gui: GUI | null = null;
  private state: HeigthmapState | undefined;
  private surfaceRoot: THREE.Group | null = null;
  private axesHelper: THREE.AxesHelper | null = null;
  private loadRevision = 0;
  private rebuildTimerId: number | null = null;
  private rebuildInFlight = false;
  private rebuildQueued = false;

  public constructor(
    scene: IThreeScene,
    materialFactory: IMaterialFactory,
    viewId = "heigthmap",
  ) {
    super(scene, "heigthmap-root", materialFactory, viewId);
    READY_INSTANCES.add(this);
    this.createGui();
    this.rebuildScene();
  }

  protected override createDefaultGround(): void {
    // Mesh-only demo.
  }

  protected override createContent(): void {
    // PlaygroundSceneBase calls this during super(), before subclass fields
    // are fully initialized. Defer real setup until constructor completes.
    if (!READY_INSTANCES.has(this)) {
      return;
    }
    this.createGui();
    this.rebuildScene();
  }

  public override dispose(): void {
    if (this.rebuildTimerId !== null) {
      window.clearTimeout(this.rebuildTimerId);
      this.rebuildTimerId = null;
    }
    this.gui?.destroy();
    if (HeigthmapPlaygroundScene.activeGui === this.gui) {
      HeigthmapPlaygroundScene.activeGui = null;
    }
    this.gui = null;
    this.clearSceneContent();
    super.dispose();
  }

  private rebuildScene(): void {
    if (this.rebuildInFlight) {
      this.rebuildQueued = true;
      return;
    }
    this.rebuildInFlight = true;

    this.clearSceneContent();

    const nextRevision = this.loadRevision + 1;
    this.loadRevision = nextRevision;
    const revision = this.loadRevision;
    const state: HeigthmapState = { ...this.getState() };
    const whitePower = state.whitePower;
    const blackFloor = state.blackFloor;
    const meshOpacity = state.meshOpacity;
    const invertHeight = state.invertHeight;
    console.log("[Heigthmap] rebuildScene:start", {
      revision,
      state,
      image: HEIGHTMAP_IMAGE_PATH,
    });
    const services = createBrowserHeightmapProgressiveGridServices({ document });
    this.loadHeightMapDataUrl().then(({ imageUrl, imageWidth, imageHeight }) => {
      const terrain = this.fitTerrainToImageAspect(state, imageWidth, imageHeight);
      const progressiveGrid = this.getGridBuilder().build(this.createDefinitions(
        state,
        terrain,
        imageWidth,
        imageHeight,
      ));
      console.log("[Heigthmap] grid built", {
        revision,
        patchCount: progressiveGrid.getPatches().length,
        imageWidth,
        imageHeight,
        terrain,
      });

      return services.groupFactory.createGroupFromImage(progressiveGrid, imageUrl, {
      name: "heigthmap-progressive-grid-surface",
      samplerOptions: {
        converter: {
          convert: (color: { red: number; green: number; blue: number }): number => {
            const luminance = (color.red + color.green + color.blue) / (3 * 255);
            const clamped = luminance <= blackFloor
              ? 0
              : (luminance - blackFloor) / (1 - blackFloor);
            const height = Math.pow(clamped, whitePower);
            return invertHeight ? 1 - height : height;
          },
        },
        flipY: false,
      },
      patchMeshOptions: {
        material: new THREE.MeshStandardMaterial({
          color: 0x7de2d1,
          transparent: meshOpacity < 1,
          opacity: meshOpacity,
          roughness: 0.65,
          metalness: 0.05,
          side: THREE.DoubleSide,
        }),
        namePrefix: "heigthmap-patch-",
      },
      projectorOptions: {
        amplitude: state.heightScale,
        baseHeight: 0,
        heightAxis: "y",
        uvMapper: {
          map: (context) => {
            const flowUv = this.mapTerrainToImageUv(
              context.point.x / terrain.width,
              context.point.y / terrain.depth,
            );
            return this.rotateUvAroundCenter(
              flowUv.u,
              flowUv.v,
              HEIGHTMAP_UV_ROTATION_RADIANS,
            );
          },
        },
      },
      }).then((group) => ({ group, imageUrl, terrain }));
    }).then(({ group, imageUrl, terrain }: {
      group: THREE.Group;
      imageUrl: string;
      terrain: { width: number; depth: number };
    }) => {
      if (revision !== this.loadRevision) {
        console.log("[Heigthmap] stale rebuild result ignored", {
          revision,
          currentRevision: this.loadRevision,
        });
        this.disposeObjectTree(group);
        this.rebuildInFlight = false;
        if (this.rebuildQueued) {
          this.rebuildQueued = false;
          this.rebuildScene();
        }
        return;
      }
      if (this.root.parent === null) {
        console.log("[Heigthmap] load ignored: scene root detached", {
          revision,
        });
        this.disposeObjectTree(group);
        this.rebuildInFlight = false;
        return;
      }
      console.log("[Heigthmap] image projected to group", {
        revision,
        childCount: group.children.length,
      });

      const markerBox = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 2),
        new THREE.MeshBasicMaterial({
          color: 0xffaa00,
          wireframe: true,
        }),
      );
      markerBox.position.set(0, 3, 0);
      markerBox.name = "heigthmap-marker-box";
      group.add(markerBox);

      const texture = this.getTextureLoader().load(imageUrl);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.flipY = false;
      texture.center.set(0.5, 0.5);
      texture.rotation = HEIGHTMAP_UV_ROTATION_RADIANS;
      texture.needsUpdate = true;

      this.applySourceTextureToHeightPatches(group, terrain.width, terrain.depth, texture);
      const sourcePlane = this.createSourceImagePlane(terrain.width, terrain.depth, texture);
      sourcePlane.position.y = -0.05;
      group.add(sourcePlane);

      group.position.set(-(terrain.width / 2), 0, -(terrain.depth / 2));
      this.surfaceRoot = group;
      this.axesHelper = new THREE.AxesHelper(4);
      this.addToRoot(group, this.axesHelper);
      console.log("[Heigthmap] scene mounted", {
        revision,
        groupName: group.name,
      });
      this.rebuildInFlight = false;
      if (this.rebuildQueued) {
        this.rebuildQueued = false;
        this.rebuildScene();
      }
    }).catch((error: unknown) => {
      if (revision !== this.loadRevision) {
        console.log("[Heigthmap] stale rebuild error ignored", {
          revision,
          currentRevision: this.loadRevision,
        });
        this.rebuildInFlight = false;
        if (this.rebuildQueued) {
          this.rebuildQueued = false;
          this.rebuildScene();
        }
        return;
      }
      if (this.root.parent === null) {
        console.log("[Heigthmap] error ignored: scene root detached", {
          revision,
        });
        this.rebuildInFlight = false;
        return;
      }

      console.error(`Failed to load ${HEIGHTMAP_IMAGE_PATH}`, error);
      const marker = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 2),
        new THREE.MeshBasicMaterial({ color: 0xff0033, wireframe: true }),
      );
      marker.position.set(0, 4, 0);
      this.surfaceRoot = new THREE.Group();
      this.surfaceRoot.add(marker);
      this.addToRoot(this.surfaceRoot);
      this.rebuildInFlight = false;
      if (this.rebuildQueued) {
        this.rebuildQueued = false;
        this.rebuildScene();
      }
    });
  }

  private createDefinitions(
    state: HeigthmapState,
    terrain: { width: number; depth: number },
    imageWidth: number,
    imageHeight: number,
  ): readonly GridPatchDefinition[] {
    const width = terrain.width;
    const depth = terrain.depth;
    const sourceWidth = Math.max(1, imageWidth);
    const sourceHeight = Math.max(1, imageHeight);
    const longestEdge = Math.max(sourceWidth, sourceHeight);
    const fitScale = longestEdge > MAX_SOURCE_ADAPTED_SAMPLES
      ? MAX_SOURCE_ADAPTED_SAMPLES / longestEdge
      : 1;

    let xSamples = this.clampSamples(Math.round(sourceWidth * fitScale));
    let ySamples = this.clampSamples(Math.round(sourceHeight * fitScale));
    const bias = Math.floor(state.sampleBias);
    if (bias !== 0) {
      xSamples = this.clampSamples(xSamples + bias);
      ySamples = this.clampSamples(ySamples + bias);
    }

    return [
      this.patchDefinition("terrain", 0, width, 0, depth, xSamples, ySamples),
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

  private getState(): HeigthmapState {
    if (this.state === undefined) {
      this.state = {
        width: 24,
        depth: 24,
        baseSamples: 96,
        sampleBias: 0,
        heightScale: 2,
        whitePower: 1,
        blackFloor: 0.10,
        meshOpacity: 1,
        flipY: true,
        invertHeight: false,
      };
    }

    return this.state;
  }

  private createGui(): void {
    // Ensure stale UI from previous scene instances is always removed.
    if (
      HeigthmapPlaygroundScene.activeGui !== null &&
      HeigthmapPlaygroundScene.activeGui !== this.gui
    ) {
      HeigthmapPlaygroundScene.activeGui.destroy();
      HeigthmapPlaygroundScene.activeGui = null;
    }
    this.gui?.destroy();

    const state = this.getState();
    const gui = new GUI({ title: "Heigthmap Controls" });
    gui.add(state, "heightScale", 1, 120, 1).onChange(() => this.scheduleRebuild());
    this.gui = gui;
    HeigthmapPlaygroundScene.activeGui = gui;
  }

  private scheduleRebuild(): void {
    if (this.rebuildTimerId != null) {
      window.clearTimeout(this.rebuildTimerId);
    }

    this.rebuildTimerId = window.setTimeout(() => {
      this.rebuildTimerId = null;
      this.rebuildScene();
    }, 120);
  }

  private async loadHeightMapDataUrl(): Promise<{
    imageUrl: string;
    imageWidth: number;
    imageHeight: number;
  }> {
    const response = await fetch(HEIGHTMAP_IMAGE_PATH);
    if (!response.ok) {
      throw new Error(`Could not fetch heightmap image: ${HEIGHTMAP_IMAGE_PATH} (${response.status})`);
    }

    const buffer = await response.arrayBuffer();
    console.log("[Heigthmap] heightmap buffer loaded", { bytes: buffer.byteLength });
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let index = 0; index < bytes.length; index += 1) {
      binary += String.fromCharCode(bytes[index] ?? 0);
    }
    const base64 = window.btoa(binary);
    const imageUrl = `data:image/png;base64,${base64}`;
    const dimensions = await this.readImageDimensions(imageUrl);
    return {
      imageUrl,
      imageWidth: dimensions.width,
      imageHeight: dimensions.height,
    };
  }

  private applyOpacityLive(opacity: number): void {
    if (this.surfaceRoot == null) {
      return;
    }

    this.surfaceRoot.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (!mesh.isMesh || !mesh.name.startsWith("heigthmap-patch-")) {
        return;
      }

      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const material of materials) {
        const standard = material as THREE.MeshStandardMaterial;
        standard.opacity = opacity;
        standard.transparent = opacity < 1;
        standard.needsUpdate = true;
      }
    });
  }

  private createSourceImagePlane(
    width: number,
    depth: number,
    texture: THREE.Texture,
  ): THREE.Mesh {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array([
      0, 0, 0,
      0, 0, depth,
      width, 0, 0,
      width, 0, depth,
    ]), 3));
    geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array([
      0, 0,
      0, 1,
      1, 0,
      1, 1,
    ]), 2));
    geometry.setIndex([0, 1, 2, 1, 3, 2]);
    geometry.computeVertexNormals();

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = "heigthmap-source-image-plane";
    return mesh;
  }

  private applySourceTextureToHeightPatches(
    group: THREE.Group,
    terrainWidth: number,
    terrainDepth: number,
    texture: THREE.Texture,
  ): void {
    const width = Math.max(terrainWidth, Number.EPSILON);
    const depth = Math.max(terrainDepth, Number.EPSILON);

    group.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (!mesh.isMesh || !mesh.name.startsWith("heigthmap-patch-")) {
        return;
      }

      const geometry = mesh.geometry as THREE.BufferGeometry;
      const positions = geometry.getAttribute("position");
      if (positions === undefined || positions.itemSize < 3) {
        return;
      }

      const uvs = new Float32Array(positions.count * 2);
      for (let i = 0; i < positions.count; i += 1) {
        const x = positions.getX(i);
        const z = positions.getZ(i);
        const flowUv = this.mapTerrainToImageUv(x / width, z / depth);
        uvs[i * 2] = flowUv.u;
        uvs[i * 2 + 1] = flowUv.v;
      }
      geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const material of materials) {
        const standard = material as THREE.MeshStandardMaterial;
        standard.map = texture;
        standard.color.setHex(0xffffff);
        standard.needsUpdate = true;
      }
    });
  }

  private rotateUvAroundCenter(
    u: number,
    v: number,
    angleRadians: number,
  ): { u: number; v: number } {
    const centeredU = u - 0.5;
    const centeredV = v - 0.5;
    const cos = Math.cos(angleRadians);
    const sin = Math.sin(angleRadians);

    return {
      u: (centeredU * cos) - (centeredV * sin) + 0.5,
      v: (centeredU * sin) + (centeredV * cos) + 0.5,
    };
  }

  private mapTerrainToImageUv(
    normalizedX: number,
    normalizedY: number,
  ): { u: number; v: number } {
    // Top-left image origin flowing to bottom-right across +X/+Y terrain direction.
    return {
      u: normalizedX,
      v: normalizedY,
    };
  }

  private fitTerrainToImageAspect(
    state: HeigthmapState,
    imageWidth: number,
    imageHeight: number,
  ): { width: number; depth: number } {
    const safeImageWidth = Math.max(1, imageWidth);
    const safeImageHeight = Math.max(1, imageHeight);
    const aspect = safeImageWidth / safeImageHeight;
    const width = Math.max(1, state.width);
    const depth = width / aspect;

    return { width, depth };
  }

  private readImageDimensions(source: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const image = document.createElement("img");
      image.onload = () => {
        const width = image.naturalWidth || image.width;
        const height = image.naturalHeight || image.height;
        if (width < 1 || height < 1) {
          reject(new Error("Heightmap image has invalid dimensions."));
          return;
        }
        resolve({ width, height });
      };
      image.onerror = () => reject(new Error("Could not read heightmap image dimensions."));
      image.src = source;
    });
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

  private getTextureLoader(): THREE.TextureLoader {
    if (this.textureLoader === undefined) {
      this.textureLoader = new THREE.TextureLoader();
    }

    return this.textureLoader;
  }

  private clearSceneContent(): void {
    console.log("[Heigthmap] clearSceneContent", {
      hasSurfaceRoot: this.surfaceRoot != null,
      hasAxesHelper: this.axesHelper != null,
    });
    if (this.surfaceRoot != null) {
      this.root.remove(this.surfaceRoot);
      this.disposeObjectTree(this.surfaceRoot);
      this.surfaceRoot = null;
    }

    if (this.axesHelper != null) {
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
