// packages/core-scene-graph/src/SceneNode.ts

import { Composite } from "@monorepo/core-design-pattern-composite-tree";
import { Matrix } from "@monorepo/core-math";
import type { IMatrix } from "@monorepo/core-math";
import type { ISceneNode } from "./ISceneNode.js";

export class SceneNode extends Composite<ISceneNode> implements ISceneNode {
  private _local: IMatrix = Matrix.identity(3);
  private _world: IMatrix = Matrix.identity(3);
  private _dirty = true;

  public constructor(public override readonly name: string) {
    super(name);
  }

  public get local(): IMatrix {
    return this._local;
  }

  public get world(): IMatrix {
    return this._world;
  }

  public setLocal(matrix: IMatrix): this {
    this._local = matrix.clone();
    this._dirty = true;
    return this;
  }

  public translate(x: number, y: number): this {
    this._local = Matrix.translation(x, y).multiply(this._local);
    this._dirty = true;
    return this;
  }

  public rotate(rad: number): this {
    this._local = Matrix.rotation(rad).multiply(this._local);
    this._dirty = true;
    return this;
  }

  public scale(sx: number, sy: number): this {
    this._local = Matrix.scaling(sx, sy).multiply(this._local);
    this._dirty = true;
    return this;
  }

  public isDirty(): boolean {
    return this._dirty;
  }

  public updateSelfWorld(parent: IMatrix = Matrix.identity(3), parentChanged: boolean = false): boolean {
    if (!this._dirty && !parentChanged) {
      return false;
    }

    const nextWorld = parent.multiply(this._local);
    const worldChanged = !this._world.equals(nextWorld);
    this._world = nextWorld;
    this._dirty = false;
    return worldChanged;
  }

  public updateWorld(parent: IMatrix = Matrix.identity(3)): void {
    this._world = parent.multiply(this._local);
    this._dirty = false;

    for (const child of this.getChildren()) {
      child.updateWorld(this._world);
    }
  }

  public override operation(): void {
    this.updateWorld();
  }
}
