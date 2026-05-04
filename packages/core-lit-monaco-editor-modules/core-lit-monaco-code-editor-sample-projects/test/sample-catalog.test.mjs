import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  monacoCodeEditorSampleProjects,
  getMonacoCodeEditorSampleProjectByName,
} from "../dist/index.js";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const moduleRoot = resolve(testDirectory, "..");
const sourceRoot = resolve(moduleRoot, "src");

const readJson = async (path) => {
  return JSON.parse(await readFile(path, "utf8"));
};

test("sample catalog should expose unique sample names", () => {
  const names = monacoCodeEditorSampleProjects.map((sample) => sample.name);
  const uniqueNames = new Set(names);

  assert.equal(uniqueNames.size, names.length);
  assert.ok(names.length > 0);
});

test("sample descriptors should reference existing project manifests and files", async () => {
  for (const sample of monacoCodeEditorSampleProjects) {
    const manifestPath = resolve(sourceRoot, sample.manifestPath);
    const manifest = await readJson(manifestPath);

    assert.equal(manifest.name, sample.name);
    assert.ok(Array.isArray(manifest.files));

    for (const filePath of sample.files) {
      const absoluteFilePath = resolve(sourceRoot, filePath);
      const content = await readFile(absoluteFilePath, "utf8");
      assert.ok(content.length > 0, `Expected file to be non-empty: ${filePath}`);
    }
  }
});

test("getMonacoCodeEditorSampleProjectByName should return the descriptor when it exists", () => {
  const first = monacoCodeEditorSampleProjects[0];
  assert.ok(first);

  const lookup = getMonacoCodeEditorSampleProjectByName(first.name);

  assert.deepEqual(lookup, first);
});
