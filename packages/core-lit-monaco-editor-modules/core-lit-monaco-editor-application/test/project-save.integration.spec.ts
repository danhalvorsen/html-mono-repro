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

type MockWritable = {
  write: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
};

type MockFileHandle = {
  createWritable: ReturnType<typeof vi.fn>;
};

type MockDirectoryHandle = {
  name: string;
  getFileHandle: ReturnType<typeof vi.fn>;
  getDirectoryHandle: ReturnType<typeof vi.fn>;
};

describe("MonacoEditorPageView project save integration", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    delete (window as Window & { showDirectoryPicker?: unknown }).showDirectoryPicker;
  });

  const createView = async () => {
    const { MonacoEditorPageView } = await import("../src/views/editor-page-view.js");
    return new MonacoEditorPageView() as unknown as {
      tsCode: string;
      htmlCode: string;
      cssCode: string;
      workingFolderName: string;
      onSaveCodeFile: (event: CustomEvent) => Promise<void>;
    };
  };

  const createDirectoryHandle = () => {
    const writes = new Map<string, string>();
    const files = new Map<string, MockFileHandle>();

    const directoryHandle: MockDirectoryHandle = {
      name: "selected-folder",
      getDirectoryHandle: vi.fn(async () => directoryHandle),
      getFileHandle: vi.fn(async (fileName: string) => {
        const existing = files.get(fileName);
        if (existing) {
          return existing;
        }

        const writable: MockWritable = {
          write: vi.fn(async (content: string) => {
            writes.set(fileName, content);
          }),
          close: vi.fn(async () => undefined),
        };

        const fileHandle: MockFileHandle = {
          createWritable: vi.fn(async () => writable),
        };

        files.set(fileName, fileHandle);
        return fileHandle;
      }),
    };

    return { directoryHandle, writes };
  };

  it("should save TS, HTML, and CSS files to disk", async () => {
    const view = await createView();
    view.tsCode = "const ts = 42;";
    view.htmlCode = "<main>saved html</main>";
    view.cssCode = "body { color: green; }";

    const { directoryHandle, writes } = createDirectoryHandle();

    (window as Window & { showDirectoryPicker?: () => Promise<MockDirectoryHandle> }).showDirectoryPicker =
      vi.fn(async () => directoryHandle);

    const event = new CustomEvent("save-code-file", {
      detail: {
        fileName: "main.ts",
        content: view.tsCode,
        files: [],
      },
      cancelable: true,
    });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");

    await view.onSaveCodeFile(event);

    expect(preventDefaultSpy).toHaveBeenCalledOnce();
    expect(directoryHandle.getFileHandle).toHaveBeenCalledTimes(3);
    expect(directoryHandle.getFileHandle).toHaveBeenNthCalledWith(1, "main.ts", { create: true });
    expect(directoryHandle.getFileHandle).toHaveBeenNthCalledWith(2, "index.html", { create: true });
    expect(directoryHandle.getFileHandle).toHaveBeenNthCalledWith(3, "styles.css", { create: true });

    expect(writes.get("main.ts")).toBe("const ts = 42;");
    expect(writes.get("index.html")).toBe("<main>saved html</main>");
    expect(writes.get("styles.css")).toBe("body { color: green; }");
  });

  it("should save into the configured working folder when folder constraint is enabled", async () => {
    const view = await createView();
    view.tsCode = "const x = 1;";
    view.htmlCode = "<main>x</main>";
    view.cssCode = "main { color: red; }";
    view.workingFolderName = "workspace";

    const selectedDirectoryWrites = new Map<string, string>();
    const targetDirectoryWrites = new Map<string, string>();

    const targetDirectory: MockDirectoryHandle = {
      name: "workspace",
      getDirectoryHandle: vi.fn(async () => targetDirectory),
      getFileHandle: vi.fn(async (fileName: string) => {
        const writable: MockWritable = {
          write: vi.fn(async (content: string) => {
            targetDirectoryWrites.set(fileName, content);
          }),
          close: vi.fn(async () => undefined),
        };

        return {
          createWritable: vi.fn(async () => writable),
        };
      }),
    };

    const selectedDirectory: MockDirectoryHandle = {
      name: "different-folder",
      getDirectoryHandle: vi.fn(async (name: string) => {
        expect(name).toBe("workspace");
        return targetDirectory;
      }),
      getFileHandle: vi.fn(async (fileName: string) => {
        const writable: MockWritable = {
          write: vi.fn(async (content: string) => {
            selectedDirectoryWrites.set(fileName, content);
          }),
          close: vi.fn(async () => undefined),
        };

        return {
          createWritable: vi.fn(async () => writable),
        };
      }),
    };

    (window as Window & { showDirectoryPicker?: () => Promise<MockDirectoryHandle> }).showDirectoryPicker =
      vi.fn(async () => selectedDirectory);

    const event = new CustomEvent("save-code-file", {
      detail: {
        fileName: "main.ts",
        content: view.tsCode,
        files: [],
      },
      cancelable: true,
    });

    await view.onSaveCodeFile(event);

    expect(selectedDirectory.getDirectoryHandle).toHaveBeenCalledOnce();
    expect(selectedDirectory.getFileHandle).not.toHaveBeenCalled();

    expect(targetDirectory.getFileHandle).toHaveBeenCalledTimes(3);
    expect(targetDirectoryWrites.get("main.ts")).toBe("const x = 1;");
    expect(targetDirectoryWrites.get("index.html")).toBe("<main>x</main>");
    expect(targetDirectoryWrites.get("styles.css")).toBe("main { color: red; }");

    expect(selectedDirectoryWrites.size).toBe(0);
  });
});
