import * as THREE from "three";
import   { MaterialToken } from "@monorepo/core-threejs-app-framework"

export interface ISmallSkyScraperBuilder {
  build(configuration: ISmallSkyScraper): THREE.Group;
}

export interface ISmallSkyScraper {
  readonly levels: number;
  readonly width: number;
  readonly depth: number;
  readonly levelHeight: number;
  readonly position: THREE.Vector3;
  readonly facadeToken: MaterialToken;
  readonly roofBorderToken: MaterialToken;
  readonly roofTopToken: MaterialToken;
  readonly windowToken: MaterialToken;
  readonly balconyToken: MaterialToken;
}

export interface ISmallSkyScraperOptions {
  readonly position?: THREE.Vector3;
  readonly facadeToken?: MaterialToken;
  readonly roofBorderToken?: MaterialToken;
  readonly roofTopToken?: MaterialToken;
  readonly windowToken?: MaterialToken;
  readonly balconyToken?: MaterialToken;
}

export class SmallSkyScraper implements ISmallSkyScraper {
  public readonly position: THREE.Vector3;
  public readonly facadeToken: MaterialToken;
  public readonly roofBorderToken: MaterialToken;
  public readonly roofTopToken: MaterialToken;
  public readonly windowToken: MaterialToken;
  public readonly balconyToken: MaterialToken;

  public constructor(
    public readonly levels: number = 5,
    public readonly width: number = 4,
    public readonly depth: number = 3.2,
    public readonly levelHeight: number = 1.8,
    options: ISmallSkyScraperOptions = {},
  ) {
    this.ensurePositiveInteger(levels, "levels");
    this.ensurePositive(width, "width");
    this.ensurePositive(depth, "depth");
    this.ensurePositive(levelHeight, "levelHeight");

    const position = options.position ?? new THREE.Vector3(0, 0, 0);

    if (
      !Number.isFinite(position.x) ||
      !Number.isFinite(position.y) ||
      !Number.isFinite(position.z)
    ) {
      throw new Error("position must be finite");
    }

    this.position = position.clone();
    this.facadeToken = options.facadeToken ?? "building-red";
    this.roofBorderToken = options.roofBorderToken ?? "window-frame";
    this.roofTopToken = options.roofTopToken ?? "roof-accent";
    this.windowToken = options.windowToken ?? "window-glass";
    this.balconyToken = options.balconyToken ?? "building-red";

    Object.freeze(this);
  }

  private ensurePositive(value: number, name: string): void {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`${name} must be greater than zero.`);
    }
  }

  private ensurePositiveInteger(value: number, name: string): void {
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error(`${name} must be a positive integer.`);
    }
  }
}
