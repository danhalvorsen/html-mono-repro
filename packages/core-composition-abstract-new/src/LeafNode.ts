import { IComposite } from "./IComposite";

// ---------- Leaf Node ----------

export abstract class LeafNode implements IComposite {
  get children(): ReadonlyArray<IComposite> {
    return [];
  }
}
