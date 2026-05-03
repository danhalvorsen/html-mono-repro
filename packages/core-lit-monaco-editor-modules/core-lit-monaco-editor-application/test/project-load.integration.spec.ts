import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@monorepo/core-lit-monaco-editor-menu/src/index.js", () => ({}));
vi.mock("@monorepo/core-lit-monaco-code-editor/src/index.js", () => ({}));
vi.mock("@monorepo/core-lit-monaco-build-product-html-viewer", () => ({}));
vi.mock("@monorepo/core-pdf-presenter", () => ({}));
vi.mock("@monorepo/core-lit-monaco-editor-menu/src/monaco-code-run.js", () => ({
  MonacoCodeRun: class MonacoCodeRun {
    public runNow(): void {
      // no-op for tests
    }
  },
}));
vi.mock("@monorepo/core-lit-monaco-build-product-abstract", () => ({
  buildExecutionProductFromSource: () => ({
    status: "success",
    executedAtIso: new Date(0).toISOString(),
    sourceCode: "",
    consoleLines: [],
    durationMs: 0,
    summary: "",
  }),
}));

describe("MonacoEditorPageView project load integration", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  const createView = async () => {
    const { MonacoEditorPageView } = await import("../src/views/editor-page-view.js");
    return new MonacoEditorPageView() as unknown as {
      tsCode: string;
      htmlCode: string;
      cssCode: string;
      activeTab: string;
      onLoadCodeFile: (event: CustomEvent) => void;
    };
  };

  it("should replace TS, HTML, and CSS content when a project folder is loaded", async () => {
    const view = await createView();

    view.tsCode = "old-ts";
    view.htmlCode = "old-html";
    view.cssCode = "old-css";

    view.onLoadCodeFile(
      new CustomEvent("load-code-file", {
        detail: {
          fileName: "main.ts",
          content: "console.log('fallback')",
          folderName: "any-project",
          files: [
            {
              path: "any-project/main.ts",
              fileName: "main.ts",
              content: "const ts = 1;",
            },
            {
              path: "any-project/index.html",
              fileName: "index.html",
              content: "<main>html</main>",
            },
            {
              path: "any-project/styles.css",
              fileName: "styles.css",
              content: "body { color: red; }",
            },
          ],
        },
      }),
    );

    expect(view.tsCode).toBe("const ts = 1;");
    expect(view.htmlCode).toBe("<main>html</main>");
    expect(view.cssCode).toBe("body { color: red; }");
    expect(view.activeTab).toBe("ts");
  });

  it("should clear missing files to avoid stale project content", async () => {
    const view = await createView();

    view.tsCode = "old-ts";
    view.htmlCode = "old-html";
    view.cssCode = "old-css";

    view.onLoadCodeFile(
      new CustomEvent("load-code-file", {
        detail: {
          fileName: "index.html",
          content: "<main>fallback</main>",
          folderName: "any-project",
          files: [
            {
              path: "any-project/index.html",
              fileName: "index.html",
              content: "<main>new html</main>",
            },
          ],
        },
      }),
    );

    expect(view.tsCode).toBe("");
    expect(view.htmlCode).toBe("<main>new html</main>");
    expect(view.cssCode).toBe("");
    expect(view.activeTab).toBe("html");
  });
});
