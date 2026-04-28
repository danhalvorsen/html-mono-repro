import type { IGraph } from "@monorepo/core-graph";
import type {
  GraphSceneOptions,
  GraphSvgScene,
  IGraphSvgSceneFactory,
} from "@monorepo/core-graph-visualisation";

export interface CenterCircleSceneFactoryOptions {
  readonly radius?: number;
}

const DEFAULT_RADIUS = 32;

export class CenterCircleSceneFactory implements IGraphSvgSceneFactory {
  private readonly radius: number;

  constructor(
    private readonly innerFactory: IGraphSvgSceneFactory,
    options: CenterCircleSceneFactoryOptions = {},
  ) {
    this.radius = options.radius ?? DEFAULT_RADIUS;
  }

  createScene(graph: IGraph, options: GraphSceneOptions): GraphSvgScene {
    const scene = this.innerFactory.createScene(graph, {
      ...options,
      nodeRepresentation: "circle",
      boxWidth: this.radius * 2,
      boxHeight: this.radius * 2,
    });

    const nodes = scene.nodes.map((node) => {
      const radius = this.radius;

      return {
        ...node,
        representation: "circle" as const,
        box: {
          ...node.box,
          topLeft: {
            x: node.center.x - radius,
            y: node.center.y - radius,
          },
          width: radius * 2,
          height: radius * 2,
        },
        circle: {
          radius,
        },
        connectionPoints: [],
      };
    });

    const nodeById = new Map(nodes.map((node) => [node.id, node] as const));

    const edges = scene.edges.map((edge) => {
      const source = nodeById.get(edge.start.nodeId);
      const target = nodeById.get(edge.end.nodeId);

      if (source === undefined || target === undefined) {
        return edge;
      }

      const start = source.center;
      const end = target.center;

      return {
        ...edge,
        start: {
          ...edge.start,
          connector: start,
        },
        edge: {
          ...edge.edge,
          path: `M ${start.x} ${start.y} L ${end.x} ${end.y}`,
        },
        end: {
          ...edge.end,
          connector: end,
        },
      };
    });

    return {
      ...scene,
      nodes,
      edges,
    };
  }
}