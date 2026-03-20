import { ShapeComposite, ShapeCloner, IShapeComponent, TreeSearch } from "../../src/index.js";

export class ShapeSampleSystem {
  public constructor(
    private readonly library: ShapeComposite,
    private readonly cloner: ShapeCloner
  ) {}

  public getLibrary(): ShapeComposite {
    return this.library;
  }

  public findByName(name: string): IShapeComponent | null {
    return TreeSearch.findByName(this.library, name);
  }

  public createCompositeFromLibrary(sourceName: string, targetName: string): ShapeComposite {
    const source = this.findByName(sourceName);

    if (!source) {
      throw new Error(`Shape '${sourceName}' was not found.`);
    }

    const result = new ShapeComposite(targetName);
    result.add(this.cloner.clone(source));

    return result;
  }
}