 import { Circle, IShapeComponent, Rectangle, ShapeCloner, ShapeComposite, TreeSearch, Triangle } from '../../src/index.js';
 export class ShapeSampleFixture {
  public createLibrary(): ShapeComposite {
    const library = new ShapeComposite("Library");

    const primitiveShapes = new ShapeComposite("PrimitiveShapes");
    primitiveShapes.add(new Circle("Circle.Small", 5));
    primitiveShapes.add(new Rectangle("Rectangle.Wall", 10, 4));
    primitiveShapes.add(new Triangle("Triangle.Roof", 8, 3));

    const templates = new ShapeComposite("Templates");

    const houseTemplate = new ShapeComposite("Template.House");
    houseTemplate.add(new Rectangle("Rectangle.HouseBody", 12, 6));
    houseTemplate.add(new Triangle("Triangle.HouseRoof", 12, 4));

    const towerTemplate = new ShapeComposite("Template.Tower");
    towerTemplate.add(new Rectangle("Rectangle.TowerBody", 6, 20));
    towerTemplate.add(new Circle("Circle.TowerWindow", 2));

    templates.add(houseTemplate);
    templates.add(towerTemplate);

    library.add(primitiveShapes);
    library.add(templates);

    return library;
  }

  public createSut(): ShapeSampleSystem {
    return new ShapeSampleSystem(this.createLibrary(), new ShapeCloner());
  }

}

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