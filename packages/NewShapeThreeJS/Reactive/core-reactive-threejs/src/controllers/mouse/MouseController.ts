import type { IMouseController, IMouseDragMove } from "@monorepo/core-reactive-abstract";

export class MouseController implements IMouseController {
  private readonly startHandlers = new Set<() => void>();
  private readonly moveHandlers = new Set<(move: IMouseDragMove) => void>();
  private readonly endHandlers = new Set<() => void>();

  public onStart(handler: () => void): () => void {
    this.startHandlers.add(handler);
    return () => {
      this.startHandlers.delete(handler);
    };
  }

  public onMove(handler: (move: IMouseDragMove) => void): () => void {
    this.moveHandlers.add(handler);
    return () => {
      this.moveHandlers.delete(handler);
    };
  }

  public onEnd(handler: () => void): () => void {
    this.endHandlers.add(handler);
    return () => {
      this.endHandlers.delete(handler);
    };
  }

  public emitStart(): void {
    for (const handler of this.startHandlers) {
      handler();
    }
  }

  public emitMove(move: IMouseDragMove): void {
    for (const handler of this.moveHandlers) {
      handler(move);
    }
  }

  public emitEnd(): void {
    for (const handler of this.endHandlers) {
      handler();
    }
  }

  public dispose(): void {
    this.startHandlers.clear();
    this.moveHandlers.clear();
    this.endHandlers.clear();
  }
}