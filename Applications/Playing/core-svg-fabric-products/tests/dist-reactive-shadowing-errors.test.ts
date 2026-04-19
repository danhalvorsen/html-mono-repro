import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

interface DistTarget {
  readonly filePath: string;
  readonly className: string;
  readonly reactiveProperties: ReadonlyArray<string>;
}

const DIST_TARGETS: ReadonlyArray<DistTarget> = [
  {
    filePath: "../dist/components/product-shape-element/product-shape-element.js",
    className: "ProductShapeElement",
    reactiveProperties: ["token", "fill", "stroke", "strokeWidth"],
  },
  {
    filePath: "../dist/components/svg-fabric-circle/svg-fabric-circle.js",
    className: "SvgFabricCircleElement",
    reactiveProperties: ["token", "radius"],
  },
  {
    filePath: "../dist/components/svg-fabric-box/svg-fabric-box.js",
    className: "SvgFabricBoxElement",
    reactiveProperties: ["token", "width", "height"],
  },
  {
    filePath: "../dist/components/svg-fabric-triangle/svg-fabric-triangle.js",
    className: "SvgFabricTriangleElement",
    reactiveProperties: ["token", "side"],
  },
  {
    filePath: "../dist/components/svg-fabric-box-triangle/svg-fabric-box-triangle.js",
    className: "SvgFabricBoxTriangleElement",
    reactiveProperties: ["token", "boxWidth", "boxHeight", "triangleSide", "gap"],
  },
];

function getTarget(className: string): DistTarget {
  const target = DIST_TARGETS.find((item) => item.className === className);

  if (target === undefined) {
    throw new Error(`Missing dist target for ${className}`);
  }

  return target;
}

function collectInitializedReactiveProperties(
  fileText: string,
  target: DistTarget,
): string[] {
  const sourceFile = ts.createSourceFile(
    target.filePath,
    fileText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );

  const classDeclaration = sourceFile.statements.find(
    (statement): statement is ts.ClassDeclaration =>
      ts.isClassDeclaration(statement) && statement.name?.text === target.className,
  );

  if (classDeclaration === undefined) {
    return ["<class-not-found>"];
  }

  const reactiveSet = new Set(target.reactiveProperties);

  return classDeclaration.members
    .filter((member): member is ts.PropertyDeclaration => ts.isPropertyDeclaration(member))
    .filter((member) => member.initializer !== undefined)
    .map((member) => {
      if (ts.isIdentifier(member.name)) {
        return member.name.text;
      }
      return "<non-identifier>";
    })
    .filter((name) => reactiveSet.has(name));
}

function expectNoDistShadowing(target: DistTarget): void {
  const absolutePath = resolve(import.meta.dirname, target.filePath);
  const fileText = readFileSync(absolutePath, "utf-8");
  const initialized = collectInitializedReactiveProperties(fileText, target);

  expect(
    initialized,
    `${target.className} in dist has shadowed reactive properties`,
  ).toEqual([]);
}

describe("dist reactive shadowing errors", () => {
  it("detects product-shape-element runtime-shadowing problem in dist", () => {
    expectNoDistShadowing(getTarget("ProductShapeElement"));
  });

  it("detects circle runtime-shadowing problem in dist", () => {
    expectNoDistShadowing(getTarget("SvgFabricCircleElement"));
  });

  it("detects box runtime-shadowing problem in dist", () => {
    expectNoDistShadowing(getTarget("SvgFabricBoxElement"));
  });

  it("detects triangle runtime-shadowing problem in dist", () => {
    expectNoDistShadowing(getTarget("SvgFabricTriangleElement"));
  });

  it("detects box-triangle runtime-shadowing problem in dist", () => {
    expectNoDistShadowing(getTarget("SvgFabricBoxTriangleElement"));
  });
});
