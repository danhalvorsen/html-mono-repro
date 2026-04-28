import type {
  GraphSvgConnector,
  GraphSvgScene,
} from "@monorepo/core-graph-visualisation";

export class CenterCircleGraphConnectorGeometry {
  createEdgeConnector(
    from: GraphSvgScene["nodes"][number],
    _to: GraphSvgScene["nodes"][number],
  ): GraphSvgConnector {
    return from.center;
  }

  createStraightPath(from: GraphSvgConnector, to: GraphSvgConnector): string {
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  }

  createConnectionPointConnector(
    center: GraphSvgConnector,
    _width: number,
    _height: number,
    _role: string,
    _circleRadius?: number,
    _angleDegrees?: number,
  ): GraphSvgConnector {
    return center;
  }

  repositionConnectionPoint(
    _node: GraphSvgScene["nodes"][number],
    center: GraphSvgConnector,
    _role: GraphSvgScene["nodes"][number]["connectionPoints"][number]["role"],
    _angleDegrees?: number,
  ): GraphSvgConnector {
    return center;
  }
}