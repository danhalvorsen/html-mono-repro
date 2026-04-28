import type { GraphSvgConnector, GraphSvgScene } from "../GraphSvgScene.js";
import type { IGraphConnectorGeometry } from "./contracts.js";

export class GraphConnectorGeometry implements IGraphConnectorGeometry {
  createEdgeConnector(
    from: GraphSvgScene["nodes"][number],
    to: GraphSvgScene["nodes"][number],
  ): GraphSvgConnector {
    const snappedConnector = this.findNearestConnectionPointConnector(from, to);

    if (snappedConnector !== undefined) {
      return snappedConnector;
    }

    const deltaX = to.center.x - from.center.x;
    const deltaY = to.center.y - from.center.y;

    if (from.representation === "circle" && from.circle !== undefined) {
      const angle = Math.atan2(deltaY, deltaX);

      return {
        x: from.center.x + (Math.cos(angle) * from.circle.radius),
        y: from.center.y + (Math.sin(angle) * from.circle.radius),
      };
    }

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

  createStraightPath(from: GraphSvgConnector, to: GraphSvgConnector): string {
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  }

  createConnectionPointConnector(
    center: GraphSvgConnector,
    width: number,
    height: number,
    role: string,
    circleRadius?: number,
    angleDegrees?: number,
  ): GraphSvgConnector {
    if (circleRadius !== undefined) {
      const radians = ((angleDegrees ?? this.getDefaultAngleForRole(role)) * Math.PI) / 180;

      return {
        x: center.x + (Math.cos(radians) * circleRadius),
        y: center.y + (Math.sin(radians) * circleRadius),
      };
    }

    const halfWidth = width / 2;
    const halfHeight = height / 2;

    switch (role) {
      case "top":
        return { x: center.x, y: center.y - halfHeight };
      case "right":
        return { x: center.x + halfWidth, y: center.y };
      case "bottom":
        return { x: center.x, y: center.y + halfHeight };
      case "left":
        return { x: center.x - halfWidth, y: center.y };
      default:
        return center;
    }
  }

  repositionConnectionPoint(
    node: GraphSvgScene["nodes"][number],
    center: GraphSvgConnector,
    role: GraphSvgScene["nodes"][number]["connectionPoints"][number]["role"],
    angleDegrees?: number,
  ): GraphSvgConnector {
    if (node.representation === "circle" && node.circle !== undefined) {
      return this.createConnectionPointConnector(
        center,
        node.box.width,
        node.box.height,
        role,
        node.circle.radius,
        angleDegrees,
      );
    }

    const halfWidth = node.box.width / 2;
    const halfHeight = node.box.height / 2;

    switch (role) {
      case "top":
        return { x: center.x, y: center.y - halfHeight };
      case "right":
        return { x: center.x + halfWidth, y: center.y };
      case "bottom":
        return { x: center.x, y: center.y + halfHeight };
      case "left":
        return { x: center.x - halfWidth, y: center.y };
      default:
        return center;
    }
  }

  private findNearestConnectionPointConnector(
    from: GraphSvgScene["nodes"][number],
    to: GraphSvgScene["nodes"][number],
  ): GraphSvgConnector | undefined {
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

  private getDefaultAngleForRole(role: string): number {
    switch (role) {
      case "right":
        return 0;
      case "bottom":
        return 90;
      case "left":
        return 180;
      case "top":
        return 270;
      default:
        if (role.startsWith("angle-")) {
          return Number(role.slice("angle-".length)) || 0;
        }

        return 0;
    }
  }
}
