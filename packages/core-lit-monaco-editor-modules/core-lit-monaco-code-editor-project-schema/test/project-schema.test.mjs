import test from "node:test";
import assert from "node:assert/strict";

import {
  validateMonacoCodeEditorProject,
  validateMonacoCodeEditorProjectManifest,
} from "../dist/index.js";

const createValidManifest = () => ({
  name: "demo",
  version: "1.0.0",
  entry: {
    ts: "main.ts",
    html: "index.html",
    css: "styles.css",
  },
  files: [
    { path: "main.ts", language: "typescript", role: "entry" },
    { path: "index.html", language: "html", role: "entry" },
    { path: "styles.css", language: "css", role: "entry" },
  ],
  tags: ["sample"],
});

test("validateMonacoCodeEditorProjectManifest should accept a valid manifest", () => {
  const result = validateMonacoCodeEditorProjectManifest(createValidManifest());
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test("validateMonacoCodeEditorProjectManifest should reject missing entry file references", () => {
  const manifest = createValidManifest();
  manifest.entry = { ...manifest.entry, ts: "missing.ts" };

  const result = validateMonacoCodeEditorProjectManifest(manifest);

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes('Entry "ts" points to missing file "missing.ts".')));
});

test("validateMonacoCodeEditorProject should reject file without content", () => {
  const project = {
    ...createValidManifest(),
    files: [
      { path: "main.ts", language: "typescript", role: "entry", content: "" },
      { path: "index.html", language: "html", role: "entry", content: "<main></main>" },
      { path: "styles.css", language: "css", role: "entry" },
    ],
  };

  const result = validateMonacoCodeEditorProject(project);

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes('File "styles.css" is missing content.')));
});
