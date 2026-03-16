// src/lit3/WebComponents/Shapes/Draggable/MrDraggable.ts

import { LitElement, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import { Vector2 } from "@monorepo/core-math";

import type {
  IDraggable,
  IHitTestable,
  IPositionable,
  Point,
} from "../../IDraggable.js";
import { Shape } from "../Shape/Shape.js";

@customElement("mr-draggable")
export class MrDraggable extends LitElement implements IDraggable {
  @query("slot")
  private slotElement!: HTMLSlotElement;

  private shapeRefs: readonly Shape[] = [];

  public get shape(): Shape {
    const first = this.shapeRefs[0];

    if (first === undefined) {
      throw new Error("mr-draggable requires at least one slotted Shape.");
    }

    return first;
  }

  protected override firstUpdated(): void {
    void this.refreshShapesAsync();
  }

  public containsPoint(point: Point): boolean {
    const shapes = this.tryGetShapes();

    if (shapes.length === 0) {
      return false;
    }

    const delegated = this.tryGetDelegatedDraggable(shapes);
    if (delegated !== null) {
      return delegated.containsPoint(point);
    }

    const probe = new Vector2(point.x, point.y);

    for (const shape of [...shapes].reverse()) {
      if (this.containsShapePoint(shape, probe)) {
        return true;
      }
    }

    return false;
  }

  public getPosition(): Point {
    const shapes = this.tryGetShapes();

    if (shapes.length === 0) {
      return { x: 0, y: 0 };
    }

    const delegated = this.tryGetDelegatedDraggable(shapes);
    if (delegated !== null) {
      return delegated.getPosition();
    }

    const bounds = this.getBounds(shapes);

    return {
      x: bounds.min.x,
      y: bounds.min.y,
    };
  }

  public setPosition(position: Point): void {
    const shapes = this.tryGetShapes();

    if (shapes.length === 0) {
      return;
    }

    const delegated = this.tryGetDelegatedDraggable(shapes);
    if (delegated !== null) {
      delegated.setPosition(position);
      this.requestUpdate();
      return;
    }

    const current = this.getBounds(shapes).min;
    const next = new Vector2(position.x, position.y);
    const delta = next.subtract(current);

    if (delta.x === 0 && delta.y === 0) {
      return;
    }

    for (const shape of shapes) {
      shape.setPosistion(shape.getPosition().add(delta));
    }

    this.requestUpdate();
  }

  protected override render() {
    return html`<slot @slotchange=${this.onSlotChange}></slot>`;
  }

  private readonly onSlotChange = (): void => {
    void this.refreshShapesAsync();
  };

  private async refreshShapesAsync(): Promise<void> {
    await this.updateComplete;
    this.shapeRefs = this.resolveShapes();
  }

  private tryGetShapes(): readonly Shape[] {
    if (this.shapeRefs.length > 0) {
      return this.shapeRefs;
    }

    this.shapeRefs = this.resolveShapes();
    return this.shapeRefs;
  }

  private resolveShapes(): readonly Shape[] {
    const assigned = this.slotElement?.assignedElements({ flatten: true }) ?? [];
    const result: Shape[] = [];

    for (const element of assigned) {
      this.collectShapes(element, result);
    }

    return result;
  }

  private collectShapes(element: Element, result: Shape[]): void {
    if (element instanceof Shape) {
      result.push(element);
      return;
    }

    for (const child of Array.from(element.children)) {
      this.collectShapes(child, result);
    }

    const shadowRoot = (element as Element & { shadowRoot?: ShadowRoot | null }).shadowRoot;

    if (shadowRoot === null || shadowRoot === undefined) {
      return;
    }

    for (const child of Array.from(shadowRoot.children)) {
      this.collectShapes(child, result);
    }
  }

  private tryGetDelegatedDraggable(shapes: readonly Shape[]): IDraggable | null {
    if (shapes.length !== 1) {
      return null;
    }

    const candidate = shapes[0];
    return this.isDraggable(candidate) ? candidate : null;
  }

  private isDraggable(value: unknown): value is IDraggable {
    if (typeof value !== "object" || value === null) {
      return false;
    }

    const candidate = value as Partial<IHitTestable & IPositionable>;

    return (
      value instanceof Shape &&
      typeof candidate.getPosition === "function" &&
      typeof candidate.setPosition === "function" &&
      typeof candidate.containsPoint === "function" &&
      "shape" in (candidate as Record<string, unknown>)
    );
  }

  private containsShapePoint(shape: Shape, point: Vector2): boolean {
    const candidate = shape as unknown as {
      containsPoint?(value: Vector2): boolean;
      pointInsideShape?(value: Vector2, type: "circle" | "rectangle" | "edge"): boolean;
    };

    if (typeof candidate.containsPoint === "function") {
      return candidate.containsPoint(point);
    }

    if (typeof candidate.pointInsideShape === "function") {
      return candidate.pointInsideShape(point, "rectangle");
    }

    return false;
  }

  private getBounds(shapes: readonly Shape[]): { min: Vector2; max: Vector2 } {
    const first = shapes[0];

    if (first === undefined) {
      return {
        min: new Vector2(0, 0),
        max: new Vector2(0, 0),
      };
    }

    let minX = first.getPosition().x;
    let minY = first.getPosition().y;
    let maxX = first.getPosition().x + first.getWidth();
    let maxY = first.getPosition().y + first.getHeight();

    for (let index = 1; index < shapes.length; index++) {
      const shape = shapes[index];

      if (shape === undefined) {
        continue;
      }

      const position = shape.getPosition();
      const width = shape.getWidth();
      const height = shape.getHeight();

      minX = Math.min(minX, position.x);
      minY = Math.min(minY, position.y);
      maxX = Math.max(maxX, position.x + width);
      maxY = Math.max(maxY, position.y + height);
    }

    return {
      min: new Vector2(minX, minY),
      max: new Vector2(maxX, maxY),
    };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "mr-draggable": MrDraggable;
  }
}
