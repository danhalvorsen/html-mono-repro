 
/* =========================================
 * DOMAIN SAMPLE USING THE ABSTRACT TREE
 * ========================================= */

import { Circle } from "../Circle.js";
import { IShapeComponent } from "../IShapeComponent.js";
import { Rectangle } from "../Rectangle.js";
import { ShapeCloner } from "../ShapeCloner.js";
import { ShapeComposite } from "../ShapeComposite.js";
import { TreeSearch } from "../TreeSearch.js";
import { Triangle } from "../Triangle.js";

/* =========================================
 * SAMPLE: DOMAIN TREE
 * - reusable parts live here
 * ========================================= */

const library = new ShapeComposite("Library");

const primitiveShapes = new ShapeComposite("PrimitiveShapes");
primitiveShapes.add(new Circle("Circle.Small", 5));
primitiveShapes.add(new Rectangle("Rectangle.Wall", 10, 4));
primitiveShapes.add(new Triangle("Triangle.Roof", 8, 3));

const templates = new ShapeComposite("Templates");
const houseTemplate = new ShapeComposite("Template.House");
houseTemplate.add(new Rectangle("Rectangle.HouseBody", 12, 6));
houseTemplate.add(new Triangle("Triangle.HouseRoof", 12, 4));
templates.add(houseTemplate);

library.add(primitiveShapes);
library.add(templates);

/* =========================================
 * BUILD NEW COMPOSITES FROM THE DOMAIN TREE
 * ========================================= */

const cloner = new ShapeCloner();

const foundHouseTemplate = TreeSearch.findByName(library as IShapeComponent, "Template.House") as ShapeComposite | null;
if (!foundHouseTemplate) {
  throw new Error("Template.House not found.");
}

const block = new ShapeComposite("CityBlock");
block.add(cloner.clone(foundHouseTemplate));

const foundCircle = TreeSearch.findByName(library as IShapeComponent, "Circle.Small") as ShapeComposite | null;
if (!foundCircle) {
  throw new Error("Circle.Small not found.");
}

const plaza = new ShapeComposite("Plaza");
plaza.add(cloner.clone(foundCircle));

const composition = new ShapeComposite("Composition");
composition.add(block);
composition.add(plaza);

/* =========================================
 * PRINT
 * ========================================= */

function printTree(node: IShapeComponent, depth: number = 0): void {
  const indent = "  ".repeat(depth);
  console.log(`${indent}${node.name} | area=${node.area().toFixed(2)}`);

  for (const child of node.getChildren()) {
    printTree(child, depth + 1);
  }
}

printTree(library);
console.log("-----");
printTree(composition);