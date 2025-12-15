#!/usr/bin/env node
import * as ts from "typescript";
import path from "path";
import { Path, File } from "@my-graphics/core-filesystem";

const [, , targetArg] = process.argv;

if (!targetArg) {
  console.error("Usage: node scripts/split-ts-file.mjs <path-to-ts-file>");
  process.exit(1);
}

const sourcePath = Path.from(process.cwd(), targetArg);
const targetFile = new File(sourcePath);

if (!targetFile.exists()) {
  console.error(`File not found: ${sourcePath.full}`);
  process.exit(1);
}

const original = targetFile.read();
const sourceTs = ts.createSourceFile(
  sourcePath.full,
  original,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TS
);

const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

const allowedKinds = new Set([
  ts.SyntaxKind.ClassDeclaration,
  ts.SyntaxKind.InterfaceDeclaration,
  ts.SyntaxKind.TypeAliasDeclaration,
  ts.SyntaxKind.EnumDeclaration,
  ts.SyntaxKind.ModuleDeclaration,
  ts.SyntaxKind.FunctionDeclaration
]);

const exports = [];

for (const stmt of sourceTs.statements) {
  const isExported =
    stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false;

  if (!isExported || !allowedKinds.has(stmt.kind)) continue;

  const nameNode = stmt.name;
  const name = nameNode && nameNode.getText(sourceTs);
  if (!name) continue;

  const contents = printer
    .printNode(ts.EmitHint.Unspecified, stmt, sourceTs)
    .trimEnd();

  const outPath = sourcePath.parent.join(`${name}.ts`);
  new File(outPath).write(`${contents}\n`);
  exports.push({ name, rel: `./${name}` });
}

if (exports.length === 0) {
  console.warn("No exported class/interface/type/etc. declarations found.");
  process.exit(0);
}

const backupPath = sourcePath.parent.join(`${sourcePath.basename}.bak`);
new File(backupPath).write(original);

const barrel = exports.map(({ rel }) => `export * from '${rel}';`).join("\n");
targetFile.write(`${barrel}\n`);

console.log(
  `Split ${exports.length} declarations from ${path.relative(
    process.cwd(),
    sourcePath.full
  )}`
);
console.log(`Backup saved to: ${path.relative(process.cwd(), backupPath.full)}`);
