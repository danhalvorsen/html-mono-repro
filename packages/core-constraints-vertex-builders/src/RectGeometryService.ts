import type { IRectGeometryService, IPoint3 } from "./IRectGeometryService.js";
import type { IRectSize } from "./IRectSize.js";
import type { IRectState } from "./IRectState.js";
import type { RectSemanticPoint } from "./RectSemanticPoint.js";
import { RectSemanticRegistry } from "./RectSemanticRegistry.js";

export class RectGeometryService implements IRectGeometryService {
  public getLocalSemanticPoint(size: IRectSize, point: RectSemanticPoint): IPoint3 {
    const [xFactor, yFactor] = RectSemanticRegistry.getCoordinates(point);

    return Object.freeze({
      x: (size.width / 2) * xFactor,
      y: (size.height / 2) * yFactor,
      z: 0,
    });
  }

  public getWorldSemanticPoint(rect: IRectState, point: RectSemanticPoint): IPoint3 {
    const localPoint = this.getLocalSemanticPoint(rect.size, point);
    return this.transformPoint(rect, localPoint);
  }

  public getOppositeWorldSemanticPoint(rect: IRectState, point: RectSemanticPoint): IPoint3 {
    return this.getWorldSemanticPoint(rect, RectSemanticRegistry.getOpposite(point));
  }

  private transformPoint(rect: IRectState, point: IPoint3): IPoint3 {
    const pivot = rect.pivot !== undefined
      ? this.getLocalSemanticPoint(rect.size, rect.pivot)
      : Object.freeze({ x: 0, y: 0, z: 0 });

    const radians = (-rect.rotationDegrees * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    const translatedX = point.x - pivot.x;
    const translatedY = point.y - pivot.y;

    const rotatedX = (translatedX * cos) - (translatedY * sin);
    const rotatedY = (translatedX * sin) + (translatedY * cos);

    return Object.freeze({
      x: rotatedX + pivot.x + rect.centerX,
      y: rotatedY + pivot.y + rect.centerY,
      z: point.z + rect.centerZ,
    });
  }
}
