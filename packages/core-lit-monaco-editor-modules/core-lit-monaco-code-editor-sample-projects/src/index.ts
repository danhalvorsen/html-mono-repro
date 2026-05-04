import type { MonacoCodeEditorProjectManifest } from "@monorepo/core-lit-monaco-code-editor-project-schema";

export interface MonacoCodeEditorSampleProjectDescriptor {
  readonly name: string;
  readonly root: string;
  readonly manifestPath: string;
  readonly files: readonly string[];
}

export const monacoCodeEditorSampleProjects: readonly MonacoCodeEditorSampleProjectDescriptor[] = [
  {
    name: "sample1-hello-lit3",
    root: "sample1",
    manifestPath: "sample1/project.json",
    files: ["sample1/main.ts", "sample1/index.html", "sample1/styles.css"],
  },
  {
    name: "sample2-counter-ui",
    root: "sample2",
    manifestPath: "sample2/project.json",
    files: ["sample2/main.ts", "sample2/index.html", "sample2/styles.css"],
  },
  {
    name: "sample3-core-pdf-reader",
    root: "sample3",
    manifestPath: "sample3/project.json",
    files: ["sample3/main.ts", "sample3/index.html", "sample3/styles.css"],
  },
  {
    name: "sample4-pdf-dbscan-writer",
    root: "sample4",
    manifestPath: "sample4/project.json",
    files: ["sample4/main.ts", "sample4/index.html", "sample4/styles.css"],
  },
];

export const getMonacoCodeEditorSampleProjectByName = (
  name: string,
): MonacoCodeEditorSampleProjectDescriptor | undefined => {
  return monacoCodeEditorSampleProjects.find((project) => project.name === name);
};

export type { MonacoCodeEditorProjectManifest };
