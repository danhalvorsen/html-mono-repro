export type DGMLLayoutKind = "layered" | "force-directed";

export interface DGMLLayeredLayoutOptions {
  readonly kind: "layered";
  readonly maxNodesPerLayer?: number;
  readonly layerSpacing?: number;
  readonly nodeSpacing?: number;
}

export interface DGMLForceDirectedLayoutOptions {
  readonly kind: "force-directed";
  readonly iterations?: number;
  readonly repulsion?: number;
  readonly springLength?: number;
  readonly damping?: number;
}

export type DGMLLayoutOptions = DGMLLayeredLayoutOptions | DGMLForceDirectedLayoutOptions;
