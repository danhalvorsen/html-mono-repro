import { Vector2 } from "@monorepo/core-math";

// ============================================================================
// VEX GEOMETRY
// ============================================================================

export class VexVertex {

  public constructor(
    private position: Vector2,
    private radius: number = 6,
    private visible: boolean = true,
    private draggable: boolean = true
  ) { }

  public getPosition(): Vector2 {
    return this.position;
  }

  public setPosition(position: Vector2): void {
    this.position = position;
  }

  public getRadius(): number {
    return this.radius;
  }

  public setRadius(radius: number): void {
    this.radius = Math.max(0, radius);
  }

  public isVisible(): boolean {
    return this.visible;
  }

  public setVisible(value: boolean): void {
    this.visible = value;
  }

  public isDraggable(): boolean {
    return this.draggable;
  }

  public setDraggable(value: boolean): void {
    this.draggable = value;
  }
}
