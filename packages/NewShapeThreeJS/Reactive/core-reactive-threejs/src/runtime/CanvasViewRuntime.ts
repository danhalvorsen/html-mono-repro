 import { ICanvasViewRuntime, IControllerHost, ReactiveShapeHost, IRenderer} from '@monorepo/core-reactive-abstract'
export class CanvasViewRuntime implements ICanvasViewRuntime {
  private readonly shapes = new Set<IControllerHost<ReactiveShapeHost>>();

  public constructor(private readonly renderer: IRenderer) { }

  public add(shape: IControllerHost<ReactiveShapeHost>): void {
    this.shapes.add(shape);
  }

  public remove(shape: IControllerHost<ReactiveShapeHost>): void {
    this.shapes.delete(shape);
  }

  public tick(): void {
    let anyDirty = false;

    for (const s of this.shapes) {
      if (s.updateIfNeeded()) anyDirty = true;
    }

    if (anyDirty) this.renderer.render();
  }
}
