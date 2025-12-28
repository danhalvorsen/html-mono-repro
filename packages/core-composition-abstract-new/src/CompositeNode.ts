import { IComposite } from "./IComposite";

// ---------- Base Composite Node ----------

export abstract class CompositeNode implements IComposite {
  protected readonly _children: IComposite[];

  protected constructor(children: IComposite[] = []) {
    this._children = children;
  }

  get children(): ReadonlyArray<IComposite> {
    return this._children;
  }
}
