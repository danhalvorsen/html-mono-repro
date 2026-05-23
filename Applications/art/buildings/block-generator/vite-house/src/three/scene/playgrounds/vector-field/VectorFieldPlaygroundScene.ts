import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import type { IMaterialFactory } from "@monorepo/core-threejs-app-framework/src/Materials/IMaterialFactory.js";
import type { IThreeScene } from "../../IThreeScene.js";
import { PlaygroundSceneBase } from "../../common/PlaygroundSceneBase.ts";
import { type IPerlinFlowFieldConfig, PerlinFlowField } from "./FlowField.ts";
import { type IStreamlineDynamicsConfig, StreamlineSystem } from "./StreamlineSystem.ts";

export class VectorFieldPlaygroundScene extends PlaygroundSceneBase {
  private declare streamlineSystem: StreamlineSystem | null | undefined;
  private declare flowField: PerlinFlowField | null | undefined;
  private declare debugArrows: THREE.ArrowHelper[] | undefined;
  private declare fieldGlyphs: THREE.LineSegments | null | undefined;
  private declare fieldGlyphPositions: Float32Array | null | undefined;
  private declare gui: GUI | undefined;
  private declare palette: readonly string[] | undefined;
  private declare helpersRoot: THREE.Group | undefined;
  private declare showHelpers: boolean | undefined;

  public constructor(
    scene: IThreeScene,
    materialFactory: IMaterialFactory,
    viewId = "vector-field",
  ) {
    super(scene, "vector-field-root", materialFactory, viewId);
  }

  protected override createDefaultGround(): void {
    super.createDefaultGround(120, 1, 120);
    this.makeGroundTransparent();
  }

  protected override createContent(): void {
    const basePalette = ["#D92243", "#F69D39", "#E0C375", "#FFF5E5"] as const;
    this.palette = this.interpolatePalette(basePalette, 12);

    this.flowField = new PerlinFlowField(918273, 0.05, 0.1, 4, 0.55, 2.0);
    this.streamlineSystem = new StreamlineSystem(this.flowField, 140, 36, 58, 0.55, this.palette);
    this.helpersRoot = new THREE.Group();
    this.helpersRoot.name = "vector-field-helpers";
    this.showHelpers = true;

    this.addToRoot(this.streamlineSystem.object3D());
    this.addToRoot(this.helpersRoot);
    this.createDebugArrows();
    this.createFieldGlyphs();
    this.streamlineSystem.update(0);
    this.updateDebugArrows(0);
    this.updateFieldGlyphs(0);
    this.addReferenceSpline();
    this.createGui();

    this.helpersRoot.add(new THREE.AxesHelper(8));
  }

  protected override onUpdate(_deltaSeconds: number, elapsedSeconds: number): void {
    this.streamlineSystem?.update(elapsedSeconds);
    this.updateDebugArrows(elapsedSeconds);
    this.updateFieldGlyphs(elapsedSeconds);
  }

  private createDebugArrows(): void {
    if (this.flowField == null) {
      return;
    }

    const halfSize = 54;
    const spacing = 8;

    for (let z = -halfSize; z <= halfSize; z += spacing) {
      for (let x = -halfSize; x <= halfSize; x += spacing) {
        const direction = this.flowField.sample(x, z, 0).normalize();
        const arrow = new THREE.ArrowHelper(direction, new THREE.Vector3(x, 0.9, z), 3.2, 0xff2d55, 1.0, 0.65);
        arrow.renderOrder = 70;
        this.getDebugArrows().push(arrow);
        this.helpersRoot?.add(arrow);
      }
    }
  }

  private updateDebugArrows(elapsedSeconds: number): void {
    const debugArrows = this.getDebugArrows();
    if (this.flowField == null || debugArrows.length === 0) {
      return;
    }

    for (const arrow of debugArrows) {
      const position = arrow.position;
      const direction = this.flowField.sample(position.x, position.z, elapsedSeconds).normalize();
      arrow.setDirection(direction);
    }
  }

  private createFieldGlyphs(): void {
    if (this.flowField == null) {
      return;
    }

    const halfSize = 54;
    const spacing = 6;
    const pointsPerGlyph = 2;
    const glyphCountPerSide = Math.floor((halfSize * 2) / spacing) + 1;
    const glyphCount = glyphCountPerSide * glyphCountPerSide;
    const positions = new Float32Array(glyphCount * pointsPerGlyph * 3);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      depthTest: false,
    });

    this.fieldGlyphPositions = positions;
    this.fieldGlyphs = new THREE.LineSegments(geometry, material);
    this.fieldGlyphs.position.y = 0.85;
    this.fieldGlyphs.frustumCulled = false;
    this.fieldGlyphs.renderOrder = 60;
    this.helpersRoot?.add(this.fieldGlyphs);
  }

  private updateFieldGlyphs(elapsedSeconds: number): void {
    if (this.flowField == null || this.fieldGlyphs == null || this.fieldGlyphPositions == null) {
      return;
    }

    const halfSize = 54;
    const spacing = 6;
    const length = 2.8;
    let cursor = 0;

    for (let z = -halfSize; z <= halfSize; z += spacing) {
      for (let x = -halfSize; x <= halfSize; x += spacing) {
        const direction = this.flowField.sample(x, z, elapsedSeconds).normalize();
        const half = length * 0.5;
        const startX = x - direction.x * half;
        const startZ = z - direction.z * half;
        const endX = x + direction.x * half;
        const endZ = z + direction.z * half;

        this.fieldGlyphPositions[cursor++] = startX;
        this.fieldGlyphPositions[cursor++] = 0;
        this.fieldGlyphPositions[cursor++] = startZ;
        this.fieldGlyphPositions[cursor++] = endX;
        this.fieldGlyphPositions[cursor++] = 0;
        this.fieldGlyphPositions[cursor++] = endZ;
      }
    }

    const positionAttribute = this.fieldGlyphs.geometry.getAttribute("position") as THREE.BufferAttribute;
    positionAttribute.needsUpdate = true;
    this.fieldGlyphs.geometry.computeBoundingSphere();
  }

  private addReferenceSpline(): void {
    const points = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.35, 0.45, 0.2),
      new THREE.Vector3(0.7, 0.75, 0.65),
      new THREE.Vector3(1, 1, 1),
    ];

    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, 48, 11, 81, false);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ffcc,
      depthTest: false,
      depthWrite: false,
    });

    const spline = new THREE.Mesh(geometry, material);
    spline.position.y = 0.6;
    spline.renderOrder = 80;
    this.helpersRoot?.add(spline);
  }

  private makeGroundTransparent(): void {
    for (const child of this.getScene().children) {
      const mesh = child as THREE.Mesh;
      if (!(mesh.geometry instanceof THREE.BoxGeometry)) {
        continue;
      }

      if (mesh.position.y > -0.49 || mesh.position.y < -0.51) {
        continue;
      }

      const material = mesh.material;
      if (Array.isArray(material)) {
        for (const item of material) {
          item.transparent = true;
          item.opacity = 0.35;
        }
      } else if (material !== undefined) {
        material.transparent = true;
        material.opacity = 0.35;
      }
    }
  }

  private getDebugArrows(): THREE.ArrowHelper[] {
    if (this.debugArrows === undefined) {
      this.debugArrows = [];
    }

    return this.debugArrows;
  }

  private createGui(): void {
    if (this.flowField == null || this.streamlineSystem == null) {
      return;
    }

    const flow = this.flowField.getConfig();
    const dynamics = this.streamlineSystem.getDynamics();

    const state: IPerlinFlowFieldConfig & IStreamlineDynamicsConfig & { randomizeColors: () => void } = {
      ...flow,
      ...dynamics,
      randomizeColors: () => {
        this.streamlineSystem?.randomizeColors();
      },
    };

    const gui = new GUI({ title: "Vector Field Controls" });
    gui.domElement.style.zIndex = "1000";

    const flowFolder = gui.addFolder("Flow");
    flowFolder.add(state, "frequency", 0.005, 0.2, 0.001).onChange((value: number) => {
      this.flowField?.setConfig({ frequency: value });
    });
    flowFolder.add(state, "speed", 0.0, 1.5, 0.01).onChange((value: number) => {
      this.flowField?.setConfig({ speed: value });
    });
    flowFolder.add(state, "octaves", 1, 8, 1).onChange((value: number) => {
      this.flowField?.setConfig({ octaves: value });
    });
    flowFolder.add(state, "persistence", 0.1, 0.95, 0.01).onChange((value: number) => {
      this.flowField?.setConfig({ persistence: value });
    });
    flowFolder.add(state, "lacunarity", 1.1, 3.5, 0.01).onChange((value: number) => {
      this.flowField?.setConfig({ lacunarity: value });
    });

    const dynamicsFolder = gui.addFolder("Dynamics");
    dynamicsFolder.add(state, "swirlBase", 0, 5, 0.01).onChange((value: number) => this.streamlineSystem?.setDynamics({ swirlBase: value }));
    dynamicsFolder.add(state, "swirlCore", 0, 6, 0.01).onChange((value: number) => this.streamlineSystem?.setDynamics({ swirlCore: value }));
    dynamicsFolder.add(state, "inwardBase", 0, 1, 0.005).onChange((value: number) => this.streamlineSystem?.setDynamics({ inwardBase: value }));
    dynamicsFolder.add(state, "inwardCore", 0, 1.5, 0.005).onChange((value: number) => this.streamlineSystem?.setDynamics({ inwardCore: value }));
    dynamicsFolder.add(state, "liftBase", 0, 1.2, 0.005).onChange((value: number) => this.streamlineSystem?.setDynamics({ liftBase: value }));
    dynamicsFolder.add(state, "liftCore", 0, 2.5, 0.01).onChange((value: number) => this.streamlineSystem?.setDynamics({ liftCore: value }));
    dynamicsFolder.add(state, "noiseStrength", 0, 2, 0.01).onChange((value: number) => this.streamlineSystem?.setDynamics({ noiseStrength: value }));
    dynamicsFolder.add(state, "randomness", 0, 2, 0.01).onChange((value: number) => this.streamlineSystem?.setDynamics({ randomness: value }));
    dynamicsFolder
      .add(state, "heightScale", 0, 999, 0.01)
      .onChange((value: number) => this.streamlineSystem?.setDynamics({ heightScale: value }));
    dynamicsFolder
      .add(state, "turbulenceByHeightEnabled")
      .name("noiseByHeight")
      .onChange((value: boolean) => this.streamlineSystem?.setDynamics({ turbulenceByHeightEnabled: value }));
    dynamicsFolder.add(state, "turbulenceAmplitude", 0, 1.2, 0.01).onChange((value: number) => this.streamlineSystem?.setDynamics({ turbulenceAmplitude: value }));
    dynamicsFolder.add(state, "turbulenceFrequency", 0, 2.5, 0.01).onChange((value: number) => this.streamlineSystem?.setDynamics({ turbulenceFrequency: value }));
    dynamicsFolder.add(state, "turbulenceByHeightMin", 0, 1, 0.01).onChange((value: number) => this.streamlineSystem?.setDynamics({ turbulenceByHeightMin: value }));
    dynamicsFolder.add(state, "turbulenceByHeightMax", 0, 1.5, 0.01).onChange((value: number) => this.streamlineSystem?.setDynamics({ turbulenceByHeightMax: value }));
    dynamicsFolder.add(state, "turbulenceByHeightExponent", 0.1, 4, 0.01).onChange((value: number) => this.streamlineSystem?.setDynamics({ turbulenceByHeightExponent: value }));
    dynamicsFolder.add(state, "turbulenceZScale", 0, 5, 0.01).onChange((value: number) => this.streamlineSystem?.setDynamics({ turbulenceZScale: value }));
    dynamicsFolder.add(state, "splineTension", 0, 1, 0.01).onChange((value: number) => this.streamlineSystem?.setDynamics({ splineTension: value }));
    dynamicsFolder.add(state, "splineSegments", 8, 96, 1).onChange((value: number) => this.streamlineSystem?.setDynamics({ splineSegments: value }));
    dynamicsFolder.add(state, "tubeRadius", 0.005, 0.2, 0.001).onChange((value: number) => this.streamlineSystem?.setDynamics({ tubeRadius: value }));
    dynamicsFolder.add(state, "opacity", 0.1, 1, 0.01).onChange((value: number) => this.streamlineSystem?.setDynamics({ opacity: value }));
    gui.add({ showHelpers: true }, "showHelpers").name("Show Vectors/Helpers").onChange((value: boolean) => {
      this.showHelpers = value;
      if (this.helpersRoot !== undefined) {
        this.helpersRoot.visible = value;
      }
    });
    gui.add(state, "randomizeColors");

    this.gui = gui;
  }

  private interpolatePalette(colors: readonly string[], targetCount: number): readonly string[] {
    if (colors.length === 0) {
      return [];
    }
    if (colors.length === 1 || targetCount <= 1) {
      return [colors[0]];
    }

    const result: string[] = [];
    const segments = colors.length - 1;
    const start = new THREE.Color();
    const end = new THREE.Color();
    const mixed = new THREE.Color();

    for (let index = 0; index < targetCount; index += 1) {
      const t = targetCount === 1 ? 0 : index / (targetCount - 1);
      const scaled = t * segments;
      const segmentIndex = Math.min(segments - 1, Math.floor(scaled));
      const localT = scaled - segmentIndex;

      start.set(colors[segmentIndex]);
      end.set(colors[segmentIndex + 1]);
      mixed.copy(start).lerp(end, localT);
      result.push(`#${mixed.getHexString()}`);
    }

    return result;
  }

  public override dispose(): void {
    this.gui?.destroy();
    this.streamlineSystem?.dispose();
    super.dispose();
  }
}
