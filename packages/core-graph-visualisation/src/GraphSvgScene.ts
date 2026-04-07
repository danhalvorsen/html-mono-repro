import type { IGraph } from "@monorepo/core-graph";

import type { SvgPoint } from "./CoordinateMapper.js";
import type { GraphSvgEdgeShapeObject } from "./features/edge/EdgeSvgShape.js";
import type {
  GraphSvgConnectionPointShape,
  GraphSvgNodeBoxShape,
  GraphSvgNodeShapeObject,
} from "./features/node/NodeSvgShape.js";
import type { GraphSvgConnector } from "./layout/GraphGeometry.js";
import { SvgCartesianCoordinateMapper } from "./CoordinateMapper.js";
import type {
  BoxConstraints,
  GraphCanvasConstraints,
  GraphConstraintModel,
  GraphNodeAnchor,
  IGraphConstraintEngine,
} from "./GraphConstraints.js";

export interface GraphSvgScene {
  readonly width: number;
  readonly height: number;
  readonly boundary: GraphSvgNodeBoxShape;
  readonly nodes: readonly GraphSvgNodeShapeObject[];
  readonly edges: readonly GraphSvgEdgeShapeObject[];
}

export interface GraphSceneOptions {
  readonly width: number;
  readonly height: number;
  readonly padding: number;
  readonly boxWidth: number;
  readonly boxHeight: number;
}

export interface IGraphSvgSceneFactory {
  createScene(graph: IGraph, options: GraphSceneOptions): GraphSvgScene;
}

export class GraphSvgSceneFactory implements IGraphSvgSceneFactory {
  constructor(private readonly constraintEngine: IGraphConstraintEngine) {}

  createScene(graph: IGraph, options: GraphSceneOptions): GraphSvgScene {
    const canvas: GraphCanvasConstraints = {
      width: options.width,
      height: options.height,
      padding: options.padding,
    };
    const box: BoxConstraints = {
      width: options.boxWidth,
      height: options.boxHeight,
    };
    const constraints = this.constraintEngine.createConstraints(graph, canvas, box);
    const mapper = new SvgCartesianCoordinateMapper({
      width: constraints.canvas.width,
      height: constraints.canvas.height,
    });
    const nodeLookup = new Map<string, GraphSvgNodeShapeObject>(
      constraints.nodeAnchors.map((nodeAnchor) => {
        const nodeShape = this.createNodeShape(nodeAnchor, constraints, mapper);
        return [nodeShape.id, nodeShape];
      }),
    );

    return {
      width: options.width,
      height: options.height,
      boundary: this.createBoundaryBox(constraints.canvas, mapper),
      nodes: Array.from(nodeLookup.values()),
      edges: constraints.edgeConstraints.map((edgeConstraint, index) => {
        const sourceNode = nodeLookup.get(edgeConstraint.sourceNodeId);
        const targetNode = nodeLookup.get(edgeConstraint.targetNodeId);

        if (sourceNode === undefined) {
          throw new Error(`Missing source node '${edgeConstraint.sourceNodeId}' in graph constraints.`);
        }

        if (targetNode === undefined) {
          throw new Error(`Missing target node '${edgeConstraint.targetNodeId}' in graph constraints.`);
        }

        const start = this.createConnector(sourceNode, targetNode);
        const end = this.createConnector(targetNode, sourceNode);

        return {
          id: `edge-${index}-${edgeConstraint.sourceNodeId}-${edgeConstraint.targetNodeId}`,
          start: {
            nodeId: edgeConstraint.sourceNodeId,
            connector: start,
          },
          edge: {
            path: this.createStraightPath(start, end),
          },
          end: {
            nodeId: edgeConstraint.targetNodeId,
            connector: end,
          },
        };
      }),
    };
  }

  private createNodeShape(
    nodeAnchor: GraphNodeAnchor,
    constraints: GraphConstraintModel,
    mapper: SvgCartesianCoordinateMapper,
  ): GraphSvgNodeShapeObject {
    const center = mapper.toSvg({
      x: nodeAnchor.centerX,
      y: nodeAnchor.centerY,
    });

    return {
      id: nodeAnchor.id,
      label: nodeAnchor.id,
      payload: nodeAnchor.payload,
      center,
      box: {
        topLeft: {
          x: center.x - (constraints.box.width / 2),
          y: center.y - (constraints.box.height / 2),
        },
        width: constraints.box.width,
        height: constraints.box.height,
      },
      connectionPoints: this.createConnectionPoints(nodeAnchor.id, center, constraints.box),
    };
  }

  private createBoundaryBox(
    canvas: GraphCanvasConstraints,
    mapper: SvgCartesianCoordinateMapper,
  ): GraphSvgNodeBoxShape {
    mapper.toSvg({ x: 0, y: 0 });
    return {
      topLeft: {
        x: 0,
        y: 0,
      },
      width: canvas.width,
      height: canvas.height,
    };
  }

  private createConnector(
    from: GraphSvgNodeShapeObject,
    to: GraphSvgNodeShapeObject,
  ): SvgPoint {
    const deltaX = to.center.x - from.center.x;
    const deltaY = to.center.y - from.center.y;
    const halfWidth = from.box.width / 2;
    const halfHeight = from.box.height / 2;

    if (Math.abs(deltaX) >= Math.abs(deltaY)) {
      return {
        x: from.center.x + (deltaX >= 0 ? halfWidth : -halfWidth),
        y: from.center.y,
      };
    }

    return {
      x: from.center.x,
      y: from.center.y + (deltaY >= 0 ? halfHeight : -halfHeight),
    };
  }

  private createStraightPath(
    from: GraphSvgConnector,
    to: GraphSvgConnector,
  ): string {
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  }

  private createConnectionPoints(
    nodeId: string,
    center: GraphSvgConnector,
    box: BoxConstraints,
  ): readonly GraphSvgConnectionPointShape[] {
    const halfWidth = box.width / 2;
    const halfHeight = box.height / 2;

    return [
      {
        id: `${nodeId}-top`,
        role: "top",
        connector: { x: center.x, y: center.y - halfHeight },
      },
      {
        id: `${nodeId}-right`,
        role: "right",
        connector: { x: center.x + halfWidth, y: center.y },
      },
      {
        id: `${nodeId}-bottom`,
        role: "bottom",
        connector: { x: center.x, y: center.y + halfHeight },
      },
      {
        id: `${nodeId}-left`,
        role: "left",
        connector: { x: center.x - halfWidth, y: center.y },
      },
    ];
  }
}

export * from "./features/node/NodeSvgShape.js";
export * from "./features/edge/EdgeSvgShape.js";
export type { GraphSvgConnector } from "./layout/GraphGeometry.js";
