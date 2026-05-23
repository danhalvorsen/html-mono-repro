import * as THREE from "three";
import { PerlinNoise2D } from "./PerlinNoise2D.ts";

export interface IFlowField {
  sample(x: number, z: number, timeSeconds: number): THREE.Vector3;
}

export interface IPerlinFlowFieldConfig {
  frequency: number;
  speed: number;
  octaves: number;
  persistence: number;
  lacunarity: number;
}

export class PerlinFlowField implements IFlowField {
  private readonly noise: PerlinNoise2D;
  private config: IPerlinFlowFieldConfig;

  public constructor(
    seed: number,
    frequency = 0.06,
    speed = 0.12,
    octaves = 4,
    persistence = 0.5,
    lacunarity = 2.0,
  ) {
    this.noise = new PerlinNoise2D(seed);
    this.config = {
      frequency,
      speed,
      octaves,
      persistence,
      lacunarity,
    };
  }

  public sample(x: number, z: number, timeSeconds: number): THREE.Vector3 {
    const n = this.fractalNoise(
      x * this.config.frequency,
      z * this.config.frequency,
      timeSeconds * this.config.speed,
    );

    const angle = n * Math.PI * 2;
    return new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
  }

  private fractalNoise(x: number, z: number, t: number): number {
    let amplitude = 1;
    let frequency = 1;
    let sum = 0;
    let amplitudeSum = 0;

    for (let octave = 0; octave < this.config.octaves; octave += 1) {
      const value = this.noise.noise(x * frequency + t, z * frequency - t);
      sum += value * amplitude;
      amplitudeSum += amplitude;

      amplitude *= this.config.persistence;
      frequency *= this.config.lacunarity;
    }

    if (amplitudeSum <= 0) {
      return 0;
    }

    return sum / amplitudeSum;
  }

  public setConfig(next: Partial<IPerlinFlowFieldConfig>): void {
    this.config = {
      ...this.config,
      ...next,
    };
  }

  public getConfig(): IPerlinFlowFieldConfig {
    return { ...this.config };
  }
}
