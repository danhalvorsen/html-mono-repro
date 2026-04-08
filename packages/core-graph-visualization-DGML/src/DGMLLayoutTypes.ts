export type DGMLLayerDirection = "top-to-bottom" | "bottom-to-top" | "left-to-right" | "right-to-left";

export type DGMLLayoutKind =
  | "layered"
  | "layered-top-to-bottom"
  | "layered-bottom-to-top"
  | "layered-left-to-right"
  | "layered-right-to-left"
  | "clustered"
  | "force-directed";

export interface DGMLLayeredLayoutOptions {
  readonly kind: "layered";
  readonly maxNodesPerLayer?: number;
  readonly layerSpacing?: number;
  readonly nodeSpacing?: number;
  readonly direction?: DGMLLayerDirection;
  readonly clusterByWeaklyConnectedComponents?: boolean;
  readonly clusterGap?: number;
}

export interface DGMLForceDirectedLayoutOptions {
  readonly kind: "force-directed";
  readonly iterations?: number;
  readonly repulsion?: number;
  readonly springLength?: number;
  readonly damping?: number;
}

export type DGMLLayoutOptions = DGMLLayeredLayoutOptions | DGMLForceDirectedLayoutOptions;
