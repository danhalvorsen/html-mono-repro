import { readFile } from "node:fs/promises";
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

type MonacoCodeLoadEntry = {
  path: string;
  fileName: string;
  content: string;
};

type PresenterStub = {
  presentExecutionProduct: ReturnType<typeof vi.fn>;
  presentBuildFailure: ReturnType<typeof vi.fn>;
};

type RunButtonStub = {
  runNow: ReturnType<typeof vi.fn>;
};

type ViewForTest = {
  tsCode: string;
  htmlCode: string;
  cssCode: string;
  activeTab: string;
  onLoadCodeFile: (event: CustomEvent) => void;
  onBuildCode: (event: CustomEvent) => void;
  onRunCode: (event: CustomEvent) => void;
};

describe("MonacoEditorPageView sample1 workflow integration", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  const createView = async () => {
    const { MonacoEditorPageView } = await import("../src/views/editor-page-view.js");
    return new MonacoEditorPageView() as unknown as ViewForTest;
  };

  const readSample1Files = async (): Promise<readonly MonacoCodeLoadEntry[]> => {
    const [tsContent, htmlContent, cssContent] = await Promise.all([
      readFile(new URL("../samples/sample1/main.ts", import.meta.url), "utf8"),
      readFile(new URL("../samples/sample1/index.html", import.meta.url), "utf8"),
      readFile(new URL("../samples/sample1/styles.css", import.meta.url), "utf8"),
    ]);

    return [
      { path: "sample1/main.ts", fileName: "main.ts", content: tsContent },
      { path: "sample1/index.html", fileName: "index.html", content: htmlContent },
      { path: "sample1/styles.css", fileName: "styles.css", content: cssContent },
    ];
  };

  const attachWorkflowStubs = (view: ViewForTest) => {
    const presenter: PresenterStub = {
      presentExecutionProduct: vi.fn(),
      presentBuildFailure: vi.fn(),
    };

    const runButton: RunButtonStub = {
      runNow: vi.fn(() => {
        view.onRunCode(
          new CustomEvent("run-code", {
            detail: {
              content: view.tsCode,
              lineCount: view.tsCode.split(/\r?\n/).length,
            },
          }),
        );
      }),
    };

    Object.defineProperty(view, "renderRoot", {
      value: {
        querySelector: (selector: string) => {
          if (selector === "#run-code-button") {
            return runButton;
          }

          if (selector === "#build-product-html-viewer") {
            return presenter;
          }

          return null;
        },
      },
      configurable: true,
    });

    return { presenter, runButton };
  };

  it("loads sample1 from disk, builds, runs, and presents result", async () => {
    const view = await createView();
    const files = await readSample1Files();
    const { presenter, runButton } = attachWorkflowStubs(view);

    view.onLoadCodeFile(
      new CustomEvent("load-code-file", {
        detail: {
          fileName: "main.ts",
          content: "",
          folderName: "sample1",
          files,
        },
      }),
    );

    expect(view.tsCode).toContain("Hello from Sample 1");
    expect(view.htmlCode).toContain("Sample 1");
    expect(view.cssCode).toContain(".card");
    expect(view.activeTab).toBe("ts");

    view.onBuildCode(
      new CustomEvent("build-code", {
        detail: {
          content: view.tsCode,
          lineCount: view.tsCode.split(/\r?\n/).length,
        },
      }),
    );

    expect(presenter.presentBuildFailure).not.toHaveBeenCalled();
    expect(runButton.runNow).toHaveBeenCalledTimes(1);
    expect(presenter.presentExecutionProduct).toHaveBeenCalledTimes(1);

    const presented = presenter.presentExecutionProduct.mock.calls[0]?.[0] as {
      status: string;
      sourceCode: string;
      consoleLines: string[];
      summary: string;
    };

    expect(presented.status).toBe("success");
    expect(presented.sourceCode).toContain("Sample 1");
    expect(presented.sourceCode).toContain("Hello from Sample 1");
    expect(presented.consoleLines).toContain("HTML preview rendered.");
    expect(presented.summary).toContain("HTML content rendered");
  });
});
