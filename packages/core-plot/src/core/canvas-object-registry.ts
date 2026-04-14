import type { CanvasObject, HitTestContext } from "./canvas-object.js";

export class CanvasObjectRegistry {
  private readonly objects: CanvasObject[] = [];

  public register(object: CanvasObject): void {
    if (this.objects.some((candidate) => candidate.id === object.id)) {
      throw new Error(`Duplicate CanvasObject id: ${object.id}`);
    }

    this.objects.push(object);
  }

  public getAll(): readonly CanvasObject[] {
    return this.objects;
  }

  public hitTest(context: HitTestContext): readonly CanvasObject[] {
    return this.objects.filter((object) => object.hitTest(context));
  }

  public hitTestTopMost(context: HitTestContext): CanvasObject | null {
    for (let index = this.objects.length - 1; index >= 0; index -= 1) {
      const object = this.objects[index];
      if (object !== undefined && object.hitTest(context)) {
        return object;
      }
    }

    return null;
  }
}
