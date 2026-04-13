import type { IGraph } from "@monorepo/core-graph";
import {
  SceneGraph,
  SceneNode,
  SceneProjector,
  ShapeNode,
  type ISceneNode,
  type ISceneProjector,
} from "@monorepo/core-scene-graph";

import type { SvgPoint } from "./CoordinateMapper.js";
import type { GraphSvgEdgeShapeObject } from "./features/edge/EdgeSvgShape.js";
import type {
  GraphNodeVisualRepresentation,
  GraphSvgCircleConnectorDefinition,
  GraphSvgConnectionPointShape,
  GraphSvgNodeBoxShape,
  GraphSvgNodeCircleShape,
  GraphSvgNodeShapeObject,
  GraphSvgNodeVisualDefinition,
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
  readonly nodeRepresentation?: GraphNodeVisualRepresentation;
  readonly circleConnectors?: GraphSvgCircleConnectorDefinition;
}

export interface IGraphSvgSceneFactory {
  createScene(graph: IGraph, options: GraphSceneOptions): GraphSvgScene;
}

type GraphSvgNodeScenePayload = Readonly<{
  anchor: GraphNodeAnchor;
  visual: GraphSvgNodeVisualDefinition;
}>;

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
    const nodeShapes = this.createNodeShapes(constraints, mapper, options);
    const nodeLookup = new Map<string, GraphSvgNodeShapeObject>(
      nodeShapes.map((nodeShape) => [nodeShape.id, nodeShape]),
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

        const start = this.createConnector(
          sourceNode,
          targetNode,
          this.readSelectedConnectionPointRole(sourceNode.payload),
        );
        const end = this.createConnector(
          targetNode,
          sourceNode,
          this.readSelectedConnectionPointRole(targetNode.payload),
        );

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

  private createNodeShapes(
    constraints: GraphConstraintModel,
    mapper: SvgCartesianCoordinateMapper,
    options: GraphSceneOptions,
  ): readonly GraphSvgNodeShapeObject[] {
    const root = new SceneNode("graph-root");

    for (const nodeAnchor of constraints.nodeAnchors) {
      const center = mapper.toSvg({
        x: nodeAnchor.centerX,
        y: nodeAnchor.centerY,
      });
      const visual = this.resolveNodeVisualDefinition(nodeAnchor.payload, options);
      const sceneNode = new ShapeNode<GraphSvgNodeScenePayload>(
        nodeAnchor.id,
        {
          anchor: nodeAnchor,
          visual,
        },
      );

      sceneNode.translate(center.x, center.y);
      root.add(sceneNode);
    }

    const sceneGraph = new SceneGraph(root);
    sceneGraph.update();

    const nodeProjector: ISceneProjector<GraphSvgNodeShapeObject> = {
      project: (node: ISceneNode): readonly GraphSvgNodeShapeObject[] => {
        if (!(node instanceof ShapeNode)) {
          return [];
        }

        const shapeNode = node as ShapeNode<GraphSvgNodeScenePayload>;
        const world = shapeNode.world.toFloat32Array();
        const center = {
          x: world[2] ?? 0,
          y: world[5] ?? 0,
        };
        const representation = shapeNode.payload.visual.representation ?? "box";
        const circle = representation === "circle"
          ? { radius: Math.min(constraints.box.width, constraints.box.height) / 2 }
          : undefined;

        return [
          {
            id: shapeNode.payload.anchor.id,
            label: shapeNode.payload.anchor.id,
            payload: shapeNode.payload.anchor.payload,
            center,
            representation,
            box: {
              topLeft: {
                x: center.x - (constraints.box.width / 2),
                y: center.y - (constraints.box.height / 2),
              },
              width: constraints.box.width,
              height: constraints.box.height,
            },
            circle,
            connectionPoints: this.createConnectionPoints(
              shapeNode.payload.anchor.id,
              center,
              constraints.box,
              representation,
              circle,
              shapeNode.payload.visual.circleConnectors,
            ),
          },
        ];
      },
    };

    return new SceneProjector(nodeProjector).project(sceneGraph);
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
    preferredRole?: string,
  ): SvgPoint {
    if (preferredRole !== undefined) {
      const connectorByRole = from.connectionPoints.find((point) => point.role === preferredRole)?.connector;

      if (connectorByRole !== undefined) {
        return connectorByRole;
      }
    }

    const snappedConnector = this.findNearestConnectionPointConnector(from, to);

    if (snappedConnector !== undefined) {
      return snappedConnector;
    }

    if (from.representation === "circle" && from.circle !== undefined) {
      const angle = Math.atan2(to.center.y - from.center.y, to.center.x - from.center.x);

      return {
        x: from.center.x + (Math.cos(angle) * from.circle.radius),
        y: from.center.y + (Math.sin(angle) * from.circle.radius),
      };
    }

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

  private findNearestConnectionPointConnector(
    from: GraphSvgNodeShapeObject,
    to: GraphSvgNodeShapeObject,
  ): SvgPoint | undefined {
    if (from.connectionPoints.length === 0) {
      return undefined;
    }

    let nearest = from.connectionPoints[0]?.connector;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const connectionPoint of from.connectionPoints) {
      const deltaX = to.center.x - connectionPoint.connector.x;
      const deltaY = to.center.y - connectionPoint.connector.y;
      const distanceSquared = (deltaX * deltaX) + (deltaY * deltaY);

      if (distanceSquared < nearestDistance) {
        nearestDistance = distanceSquared;
        nearest = connectionPoint.connector;
      }
    }

    return nearest;
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
    representation: GraphNodeVisualRepresentation,
    circle: GraphSvgNodeCircleShape | undefined,
    circleConnectors: GraphSvgCircleConnectorDefinition | undefined,
  ): readonly GraphSvgConnectionPointShape[] {
    if (representation === "circle" && circle !== undefined) {
      return this.resolveCircleConnectorAngles(circleConnectors).map((angleDegrees) => {
        const radians = (angleDegrees * Math.PI) / 180;
        const role = this.resolveCircleConnectorRole(angleDegrees, circleConnectors);

        return {
          id: `${nodeId}-angle-${angleDegrees}`,
          role,
          angleDegrees,
          connector: {
            x: center.x + (Math.cos(radians) * circle.radius),
            y: center.y + (Math.sin(radians) * circle.radius),
          },
        };
      });
    }

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

  private resolveNodeVisualDefinition(
    payload: unknown,
    options: GraphSceneOptions,
  ): GraphSvgNodeVisualDefinition {
    const payloadVisual = this.readNodeVisualDefinition(payload);

    return {
      representation: payloadVisual.representation ?? options.nodeRepresentation ?? "box",
      circleConnectors: payloadVisual.circleConnectors ?? options.circleConnectors,
    };
  }

  private readNodeVisualDefinition(payload: unknown): GraphSvgNodeVisualDefinition {
    if (payload === null || typeof payload !== "object") {
      return {};
    }

    const visual = (payload as Record<string, unknown>).visual;
    if (visual === null || typeof visual !== "object") {
      return {};
    }

    const record = visual as Record<string, unknown>;
    const representation = record.representation === "circle" || record.representation === "box"
      ? record.representation
      : undefined;
    const circleConnectors = this.readCircleConnectorDefinition(record.circleConnectors);

    return {
      representation,
      circleConnectors,
    };
  }

  private readSelectedConnectionPointRole(payload: unknown): string | undefined {
    if (payload === null || typeof payload !== "object") {
      return undefined;
    }

    const interaction = (payload as Record<string, unknown>).interaction;

    if (interaction === null || typeof interaction !== "object") {
      return undefined;
    }

    const selectedConnectionPointRole = (interaction as Record<string, unknown>).selectedConnectionPointRole;

    return typeof selectedConnectionPointRole === "string" ? selectedConnectionPointRole : undefined;
  }

  private readCircleConnectorDefinition(value: unknown): GraphSvgCircleConnectorDefinition | undefined {
    if (value === null || typeof value !== "object") {
      return undefined;
    }

    const record = value as Record<string, unknown>;
    const mode = record.mode === "fixed" || record.mode === "equal" ? record.mode : undefined;
    const angles = Array.isArray(record.angles)
      ? record.angles.filter((candidate): candidate is number => typeof candidate === "number")
      : undefined;
    const count = typeof record.count === "number" && Number.isFinite(record.count)
      ? Math.max(1, Math.round(record.count))
      : undefined;

    return {
      mode,
      angles,
      count,
    };
  }

  private resolveCircleConnectorAngles(
    definition: GraphSvgCircleConnectorDefinition | undefined,
  ): readonly number[] {
    if (definition?.angles !== undefined && definition.angles.length > 0) {
      return definition.angles;
    }

    if (definition === undefined) {
      return [270, 0, 90, 180];
    }

    const count = definition?.count ?? 4;
    const safeCount = Math.max(1, count);

    return Array.from({ length: safeCount }, (_value, index) => Math.round((360 / safeCount) * index));
  }

  private resolveCircleConnectorRole(
    angleDegrees: number,
    definition: GraphSvgCircleConnectorDefinition | undefined,
  ): string {
    if (definition?.mode === "fixed" || (definition?.angles !== undefined && definition.angles.length > 0)) {
      return `angle-${angleDegrees}`;
    }

    const normalized = ((Math.round(angleDegrees) % 360) + 360) % 360;

    switch (normalized) {
      case 0:
        return "right";
      case 90:
        return "bottom";
      case 180:
        return "left";
      case 270:
        return "top";
      default:
        return `angle-${angleDegrees}`;
    }
  }
}

export * from "./features/node/NodeSvgShape.js";
export * from "./features/edge/EdgeSvgShape.js";
export type { GraphSvgConnector } from "./layout/GraphGeometry.js";
