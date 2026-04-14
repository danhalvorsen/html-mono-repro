import { Vector2 } from "@monorepo/core-math";

export class PlotPathBuilder {
  public buildPolylinePath(points: readonly Vector2[]): string {
    if (points.length === 0) {
      return "";
    }

    const firstPoint = points[0];
    if (firstPoint === undefined) {
      return "";
    }

    const commands = [`M ${firstPoint.x} ${firstPoint.y}`];
    for (let index = 1; index < points.length; index += 1) {
      const point = points[index];
      if (point !== undefined) {
        commands.push(`L ${point.x} ${point.y}`);
      }
    }

    return commands.join(" ");
  }
}
