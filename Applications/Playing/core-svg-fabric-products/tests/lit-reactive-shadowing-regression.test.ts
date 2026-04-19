import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

interface ShadowingTarget {
  readonly filePath: string;
  readonly className: string;
  readonly reactiveProperties: ReadonlyArray<string>;
}

const TARGETS: ReadonlyArray<ShadowingTarget> = [
  {
    filePath: "../src/components/product-shape-element/product-shape-element.ts",
    className: "ProductShapeElement",
    reactiveProperties: ["token", "fill", "stroke", "strokeWidth"],
  },
  {
    filePath: "../src/components/svg-fabric-circle/svg-fabric-circle.ts",
    className: "SvgFabricCircleElement",
    reactiveProperties: ["token", "radius"],
  },
  {
    filePath: "../src/components/svg-fabric-box/svg-fabric-box.ts",
    className: "SvgFabricBoxElement",
    reactiveProperties: ["token", "width", "height"],
  },
  {
    filePath: "../src/components/svg-fabric-triangle/svg-fabric-triangle.ts",
    className: "SvgFabricTriangleElement",
    reactiveProperties: ["token", "side"],
  },
  {
    filePath: "../src/components/svg-fabric-box-triangle/svg-fabric-box-triangle.ts",
    className: "SvgFabricBoxTriangleElement",
    reactiveProperties: [
      "token",
      "boxWidth",
      "boxHeight",
      "triangleSide",
      "gap",
    ],
  },
];

function getTarget(className: string): ShadowingTarget {
  const target = TARGETS.find((item) => item.className === className);

  if (target === undefined) {
    throw new Error(`Missing shadowing target for ${className}`);
  }

  return target;
}

function collectInitializedReactiveProperties(
  fileText: string,
  target: ShadowingTarget,
): string[] {
  const sourceFile = ts.createSourceFile(
    target.filePath,
    fileText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  const classDeclaration = sourceFile.statements.find(
    (statement): statement is ts.ClassDeclaration =>
      ts.isClassDeclaration(statement) && statement.name?.text === target.className,
  );

  if (classDeclaration === undefined) {
    return ["<class-not-found>"];
  }

  const reactiveSet = new Set(target.reactiveProperties);
  const initialized = classDeclaration.members
    .filter((member): member is ts.PropertyDeclaration => ts.isPropertyDeclaration(member))
    .filter((member) => member.initializer !== undefined)
    .map((member) => {
      if (ts.isIdentifier(member.name)) {
        return member.name.text;
      }
      return "<non-identifier>";
    })
    .filter((name) => reactiveSet.has(name));

  return initialized;
}

describe("lit reactive property shadowing regression", () => {
  function expectNoShadowing(target: ShadowingTarget): void {
    const absolutePath = resolve(import.meta.dirname, target.filePath);
    const fileText = readFileSync(absolutePath, "utf-8");
    const initialized = collectInitializedReactiveProperties(fileText, target);

    expect(initialized, `${target.className} has shadowed reactive properties`).toEqual(
      [],
    );
  }

  it("guards circle shadowing error: token/fill/stroke/strokeWidth/radius", () => {
    expectNoShadowing(getTarget("ProductShapeElement"));
    expectNoShadowing(getTarget("SvgFabricCircleElement"));
  });

  it("guards box shadowing error: token/fill/stroke/strokeWidth/width/height", () => {
    expectNoShadowing(getTarget("ProductShapeElement"));
    expectNoShadowing(getTarget("SvgFabricBoxElement"));
  });

  it("guards triangle shadowing error: token/fill/stroke/strokeWidth/side", () => {
    expectNoShadowing(getTarget("ProductShapeElement"));
    expectNoShadowing(getTarget("SvgFabricTriangleElement"));
  });

  it("guards box-triangle shadowing error: token/fill/stroke/strokeWidth/boxWidth/boxHeight/triangleSide/gap", () => {
    expectNoShadowing(getTarget("ProductShapeElement"));
    expectNoShadowing(getTarget("SvgFabricBoxTriangleElement"));
  });
});
