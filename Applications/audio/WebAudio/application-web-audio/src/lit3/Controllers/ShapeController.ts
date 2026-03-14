// Applications/audio/WebAudio/application-web-audio/src/lit3/Controllers/ShapeController.ts

import type { ReactiveController, ReactiveControllerHost } from "lit";

import { Shape } from "../WebComponents/Shapes/Shape/Shape.js";

type IShapeWrapper = {
  readonly shape: Shape;
};

export class ShapeController implements ReactiveController {
  public constructor(
    private readonly host: ReactiveControllerHost,
    private readonly getAssignedElements: () => readonly Element[],
  ) {
    this.host.addController(this);
  }

  public hostConnected(): void {
    // no-op
  }

  public getShapes(): readonly Shape[] {
    const result: Shape[] = [];

    for (const element of this.getAssignedElements()) {
      this.collectShapes(element, result);
    }

    return result;
  }

  private collectShapes(element: Element, result: Shape[]): void {
    if (element instanceof Shape) {
      result.push(element);
      return;
    }

    if (this.isShapeWrapper(element)) {
      result.push(element.shape);
      return;
    }

    for (const child of Array.from(element.children)) {
      this.collectShapes(child, result);
    }
  }

  private isShapeWrapper(value: unknown): value is IShapeWrapper {
    return (
      typeof value === "object" &&
      value !== null &&
      "shape" in (value as object) &&
      (value as { shape?: unknown }).shape instanceof Shape
    );
  }
}