import * as THREE from "three";
import type { IFlowField } from "./FlowField.ts";

interface IStreamlineSeed {
  x: number;
  z: number;
  phase: number;
  heightOffset: number;
}

export interface IStreamlineDynamicsConfig {
  inwardBase: number;
  inwardCore: number;
  swirlBase: number;
  swirlCore: number;
  noiseStrength: number;
  liftBase: number;
  liftCore: number;
  tubeRadius: number;
  opacity: number;
  randomness: number;
  turbulenceAmplitude: number;
  turbulenceFrequency: number;
  heightScale: number;
  turbulenceByHeightEnabled: boolean;
  turbulenceByHeightMin: number;
  turbulenceByHeightMax: number;
  turbulenceByHeightExponent: number;
  turbulenceZScale: number;
  splineTension: number;
  splineSegments: number;
}

export class StreamlineSystem {
  private readonly flowField: IFlowField;
  private readonly halfSize: number;
  private readonly stepSize: number;
  private readonly segmentCount: number;
  private readonly lineCount: number;
  private readonly group: THREE.Group;
  private readonly seeds: IStreamlineSeed[];
  private readonly tubes: THREE.Mesh[];
  private readonly materials: THREE.MeshBasicMaterial[];
  private readonly controlPointCount: number;
  private readonly controlPointsByLine: THREE.Vector3[][];
  private radialSegments: number;
  private tubeRadius: number;
  private dynamics: IStreamlineDynamicsConfig;
  private palette: readonly string[];

  public constructor(
    flowField: IFlowField,
    lineCount: number,
    segmentCount: number,
    halfSize: number,
    stepSize: number,
    palette: readonly string[],
  ) {
    this.flowField = flowField;
    this.lineCount = lineCount;
    this.segmentCount = segmentCount;
    this.halfSize = halfSize;
    this.stepSize = stepSize;
    this.group = new THREE.Group();
    this.group.name = "vector-field-streamlines";
    this.controlPointCount = Math.max(6, Math.floor(this.segmentCount / 4));
    this.radialSegments = 6;
    this.tubeRadius = 0.05;
    this.palette = palette;
    this.dynamics = {
      inwardBase: 0.08,
      inwardCore: 0.18,
      swirlBase: 1.3,
      swirlCore: 2.2,
      noiseStrength: 0.65,
      liftBase: 0.18,
      liftCore: 0.95,
      tubeRadius: this.tubeRadius,
      opacity: 0.98,
      randomness: 1.0,
      turbulenceAmplitude: 0.2,
      turbulenceFrequency: 0.45,
      heightScale: 1.0,
      turbulenceByHeightEnabled: true,
      turbulenceByHeightMin: 0.02,
      turbulenceByHeightMax: 0.35,
      turbulenceByHeightExponent: 1.0,
      turbulenceZScale: 1.0,
      splineTension: 0.25,
      splineSegments: this.segmentCount,
    };

    this.seeds = this.createSeeds(lineCount, halfSize);
    this.tubes = [];
    this.materials = [];
    this.controlPointsByLine = [];

    for (let index = 0; index < lineCount; index += 1) {
      const color = palette[Math.floor(Math.random() * palette.length)] ?? "#D92243";
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: this.dynamics.opacity,
        depthTest: false,
        depthWrite: false,
      });

      const initialPoints = this.createControlPoints();
      const initialCurve = new THREE.CatmullRomCurve3(initialPoints, false, "centripetal", this.dynamics.splineTension);
      const initialGeometry = new THREE.TubeGeometry(
        initialCurve,
        this.getSplineSegments(),
        this.tubeRadius,
        this.radialSegments,
        false,
      );
      const tube = new THREE.Mesh(initialGeometry, material);
      tube.frustumCulled = false;
      tube.renderOrder = 50;

      this.materials.push(material);
      this.tubes.push(tube);
      this.controlPointsByLine.push(this.createControlPoints());
      this.group.add(tube);
    }
  }

  public object3D(): THREE.Group {
    return this.group;
  }

  public update(elapsedSeconds: number): void {
    for (let lineIndex = 0; lineIndex < this.lineCount; lineIndex += 1) {
      const seed = this.seeds[lineIndex];
      const controlPoints = this.controlPointsByLine[lineIndex];
      if (controlPoints.length < 2) {
        continue;
      }

      let px = seed.x;
      let pz = seed.z;
      let py = 0.2 + seed.heightOffset;

      const controlStep = this.stepSize * (this.segmentCount / this.controlPointCount);
      for (let controlIndex = 0; controlIndex < this.controlPointCount; controlIndex += 1) {
        const controlPoint = controlPoints[controlIndex];
        controlPoint.set(px, py, pz);

        const vector = this.flowField.sample(px, pz, elapsedSeconds + seed.phase);
        const toCenterX = -px;
        const toCenterZ = -pz;
        const radius = Math.hypot(px, pz);
        const centerBlend = Math.max(0, 1 - radius / this.halfSize);

        const tangentX = radius > 0.0001 ? -toCenterZ / radius : 0;
        const tangentZ = radius > 0.0001 ? toCenterX / radius : 0;

        const inwardStrength = this.dynamics.inwardBase + centerBlend * this.dynamics.inwardCore;
        const swirlStrength = this.dynamics.swirlBase + centerBlend * this.dynamics.swirlCore;
        const noiseStrength = this.dynamics.noiseStrength * this.dynamics.randomness;

        const vx =
          tangentX * swirlStrength +
          vector.x * noiseStrength +
          toCenterX * inwardStrength;
        const vz =
          tangentZ * swirlStrength +
          vector.z * noiseStrength +
          toCenterZ * inwardStrength;
        const vy = (this.dynamics.liftBase + centerBlend * this.dynamics.liftCore) * this.dynamics.heightScale;
        const turbulenceAmplitude = this.getTurbulenceAmplitude();
        const turbulencePhase = elapsedSeconds * this.dynamics.turbulenceFrequency + seed.phase + controlIndex * 0.17;
        const turbulenceX = Math.sin(turbulencePhase + px * 0.13) * turbulenceAmplitude;
        const turbulenceZ = Math.cos(turbulencePhase + pz * 0.11) * turbulenceAmplitude * this.dynamics.turbulenceZScale;

        px += (vx + turbulenceX) * controlStep;
        pz += (vz + turbulenceZ) * controlStep;
        py += vy * controlStep;
        py = Math.min(py, this.halfSize * 0.95);

        if (px < -this.halfSize) px += this.halfSize * 2;
        if (px > this.halfSize) px -= this.halfSize * 2;
        if (pz < -this.halfSize) pz += this.halfSize * 2;
        if (pz > this.halfSize) pz -= this.halfSize * 2;
      }

      const curve = new THREE.CatmullRomCurve3(controlPoints, false, "centripetal", this.dynamics.splineTension);
      if (!this.areControlPointsFinite(controlPoints)) {
        continue;
      }
      const nextGeometry = new THREE.TubeGeometry(
        curve,
        this.getSplineSegments(),
        this.dynamics.tubeRadius,
        this.radialSegments,
        false,
      );
      const tube = this.tubes[lineIndex];
      tube.geometry.dispose();
      tube.geometry = nextGeometry;
    }
  }

  private createSeeds(lineCount: number, halfSize: number): IStreamlineSeed[] {
    const result: IStreamlineSeed[] = [];
    for (let index = 0; index < lineCount; index += 1) {
      const angle = (index / lineCount) * Math.PI * 2 + Math.random() * 0.3;
      const ring = Math.sqrt((index + 1) / lineCount);
      const radius = ring * halfSize * 0.88;
      const jitter = (Math.random() - 0.5) * 1.4;
      const x = Math.cos(angle) * radius + jitter;
      const z = Math.sin(angle) * radius + jitter;

      result.push({
        x,
        z,
        phase: Math.random() * 100,
        heightOffset: Math.random() * 0.35,
      });
    }

    return result;
  }

  private createControlPoints(): THREE.Vector3[] {
    const points: THREE.Vector3[] = [];
    for (let index = 0; index < this.controlPointCount; index += 1) {
      points.push(new THREE.Vector3());
    }

    return points;
  }

  public setDynamics(next: Partial<IStreamlineDynamicsConfig>): void {
    this.dynamics = {
      ...this.dynamics,
      inwardBase: this.finiteOr(next.inwardBase, this.dynamics.inwardBase),
      inwardCore: this.finiteOr(next.inwardCore, this.dynamics.inwardCore),
      swirlBase: this.finiteOr(next.swirlBase, this.dynamics.swirlBase),
      swirlCore: this.finiteOr(next.swirlCore, this.dynamics.swirlCore),
      noiseStrength: this.finiteOr(next.noiseStrength, this.dynamics.noiseStrength),
      liftBase: this.finiteOr(next.liftBase, this.dynamics.liftBase),
      liftCore: this.finiteOr(next.liftCore, this.dynamics.liftCore),
      tubeRadius: this.finiteOr(next.tubeRadius, this.dynamics.tubeRadius),
      opacity: this.finiteOr(next.opacity, this.dynamics.opacity),
      randomness: this.finiteOr(next.randomness, this.dynamics.randomness),
      turbulenceAmplitude: this.finiteOr(next.turbulenceAmplitude, this.dynamics.turbulenceAmplitude),
      turbulenceFrequency: this.finiteOr(next.turbulenceFrequency, this.dynamics.turbulenceFrequency),
      heightScale: this.finiteOr(next.heightScale, this.dynamics.heightScale),
      turbulenceByHeightEnabled: typeof next.turbulenceByHeightEnabled === "boolean"
        ? next.turbulenceByHeightEnabled
        : this.dynamics.turbulenceByHeightEnabled,
      turbulenceByHeightMin: this.finiteOr(next.turbulenceByHeightMin, this.dynamics.turbulenceByHeightMin),
      turbulenceByHeightMax: this.finiteOr(next.turbulenceByHeightMax, this.dynamics.turbulenceByHeightMax),
      turbulenceByHeightExponent: this.finiteOr(next.turbulenceByHeightExponent, this.dynamics.turbulenceByHeightExponent),
      turbulenceZScale: this.finiteOr(next.turbulenceZScale, this.dynamics.turbulenceZScale),
      splineTension: this.finiteOr(next.splineTension, this.dynamics.splineTension),
      splineSegments: this.finiteOr(next.splineSegments, this.dynamics.splineSegments),
    };
    this.dynamics.splineSegments = Math.max(8, Math.floor(this.finiteOr(this.dynamics.splineSegments, this.segmentCount)));

    for (const material of this.materials) {
      material.opacity = this.dynamics.opacity;
    }
  }

  public getDynamics(): IStreamlineDynamicsConfig {
    return { ...this.dynamics };
  }

  public randomizeColors(): void {
    for (const material of this.materials) {
      const color = this.palette[Math.floor(Math.random() * this.palette.length)] ?? "#D92243";
      material.color.set(color);
    }
  }

  public dispose(): void {
    for (const tube of this.tubes) {
      tube.geometry.dispose();
    }

    for (const material of this.materials) {
      material.dispose();
    }
  }

  private getSplineSegments(): number {
    const segments = this.finiteOr(this.dynamics.splineSegments, this.segmentCount);
    return Math.max(8, Math.floor(segments));
  }

  private finiteOr(value: number | undefined, fallback: number): number {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
  }

  private areControlPointsFinite(points: readonly THREE.Vector3[]): boolean {
    for (const point of points) {
      if (!Number.isFinite(point.x) || !Number.isFinite(point.y) || !Number.isFinite(point.z)) {
        return false;
      }
    }

    return true;
  }

  private getTurbulenceAmplitude(): number {
    if (!this.dynamics.turbulenceByHeightEnabled) {
      return this.dynamics.turbulenceAmplitude;
    }

    const normalizedHeight = this.clamp01(this.dynamics.heightScale / 99);
    const shaped = Math.pow(normalizedHeight, Math.max(0.01, this.dynamics.turbulenceByHeightExponent));
    const min = Math.min(this.dynamics.turbulenceByHeightMin, this.dynamics.turbulenceByHeightMax);
    const max = Math.max(this.dynamics.turbulenceByHeightMin, this.dynamics.turbulenceByHeightMax);
    return min + (max - min) * shaped;
  }

  private clamp01(value: number): number {
    return Math.max(0, Math.min(1, value));
  }
}
