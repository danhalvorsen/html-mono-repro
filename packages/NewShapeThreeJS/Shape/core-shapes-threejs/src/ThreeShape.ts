import {
  ControllerHostCore,
  IReactiveShapeController
} from "@monorepo/core-reactive-abstract";
import { ShapeId, ShapeType } from "@monorepo/core-shapes-abstract";
import { Object3D, Scene } from "three";
import { IThreeDrawContext } from "./IThreeDrawContext.js";
import { IThreeShape } from "./IThreeShape.js";
import { ThreeShapeOptions } from "./Types.js";

export class ThreeShape implements IThreeShape {
  private readonly core = new ControllerHostCore<IThreeShape, IReactiveShapeController<IThreeShape>>(this);
  private attachedScene?: Scene;
  private disposed = false;

  public constructor(private readonly options: ThreeShapeOptions) {}

  public get id(): ShapeId {
    return this.options.id;
  }

  public get type(): ShapeType {
    return this.options.type;
  }

  public get controllerCount(): number {
    return this.core.controllerCount;
  }

  public get isDirty(): boolean {
    return this.core.isDirty;
  }

  public getObject3D(): Object3D {
    this.throwIfDisposed();
    return this.options.object3D;
  }

  public requestUpdate(): void {
    this.throwIfDisposed();
    this.core.requestUpdate();
  }

  public addController(controller: IReactiveShapeController<IThreeShape>): void {
    this.throwIfDisposed();
    this.core.addController(controller);
  }

  public removeController(controller: IReactiveShapeController<IThreeShape>): void {
    if (this.disposed) {
      return;
    }

    this.core.removeController(controller);
  }

  public updateIfNeeded(): boolean {
    this.throwIfDisposed();
    return this.core.updateIfNeeded();
  }

  public draw(ctx: IThreeDrawContext): void {
    this.throwIfDisposed();

    if (this.attachedScene === ctx.scene) {
      return;
    }

    if (this.attachedScene) {
      this.attachedScene.remove(this.options.object3D);
    }

    ctx.scene.add(this.options.object3D);
    this.attachedScene = ctx.scene;
  }

  public dispose(): void {
    if (this.disposed) {
      return;
    }

    this.detachFromScene();
    this.disposed = true;
  }

  private detachFromScene(): void {
    this.options.object3D.removeFromParent();
    this.attachedScene = undefined;
  }

  private throwIfDisposed(): void {
    if (this.disposed) {
      throw new Error("ThreeShape is disposed.");
    }
  }
}