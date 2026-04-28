import type { IGraph } from "@monorepo/core-graph";
import type { GraphSvgScene } from "../GraphSvgScene.js";

export interface GraphSceneOptions {
  readonly width: number;
  readonly height: number;
  readonly padding: number;
  readonly boxWidth: number;
  readonly boxHeight: number;
}

export interface IGraphSceneFactory {
  createScene(graph: IGraph, options: GraphSceneOptions): GraphSvgScene;
}
