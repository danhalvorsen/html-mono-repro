import * as THREE from "three";

export interface ISmallSkyScraperBuilder {
  withLevels(levels: number): ISmallSkyScraperBuilder;
  withWidth(width: number): ISmallSkyScraperBuilder;
  withDepth(depth: number): ISmallSkyScraperBuilder;
  withLevelHeight(levelHeight: number): ISmallSkyScraperBuilder;
  withPosition(x: number, y: number, z: number): ISmallSkyScraperBuilder;
  build(): THREE.Group;
}