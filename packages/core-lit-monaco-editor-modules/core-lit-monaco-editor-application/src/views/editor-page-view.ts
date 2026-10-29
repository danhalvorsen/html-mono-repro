import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import {
  DiagnosticCategory,
  flattenDiagnosticMessageText,
  ModuleResolutionKind,
  ModuleKind,
  ScriptTarget,
  transpileModule,
  type Diagnostic,
  type TranspileOutput,
} from "typescript";

import "@monorepo/core-lit-monaco-editor-menu/src/index.js";
import "@monorepo/core-lit-monaco-code-editor/src/index.js";
import "@monorepo/core-lit-monaco-build-product-html-viewer";
import "@monorepo/core-pdf-presenter";
import "../components/monaco-tabs.js";

import { type CodeEditorChangeEventDetail } from "@monorepo/core-lit-monaco-code-editor/src/code-editor.js";
import { type MonacoCodeBuildEventDetail } from "@monorepo/core-lit-monaco-editor-menu/src/monaco-code-build.js";
import {
  type MonacoCodeLoadEntry,
  type MonacoCodeLoadEventDetail,
} from "@monorepo/core-lit-monaco-editor-menu/src/monaco-code-load.js";
import { type MonacoCodeSaveEventDetail } from "@monorepo/core-lit-monaco-editor-menu/src/monaco-code-save.js";
import {
  MonacoCodeRun,
  type MonacoCodeRunEventDetail,
} from "@monorepo/core-lit-monaco-editor-menu/src/monaco-code-run.js";
import {
  buildExecutionProductFromSource,
  type MonacoBuildExecutionProduct,
  type IMonacoBuildProductPresenter,
} from "@monorepo/core-lit-monaco-build-product-abstract";
import { type MonacoTabChangeEventDetail, type MonacoTabItem } from "../components/monaco-tabs.js";

type EditorTabId = "ts" | "html" | "css";
type SurfaceTabId = "code-editor" | "build-result";
type BuildResultTabId = "errors" | "warnings";

const DEFAULT_HTML = `<main class="card">
  <h1>Hello, Lit3!</h1>
  <p>This preview is rendered inside build-product-html-viewer.</p>
</main>
`;

const DEFAULT_CSS = `body {
  margin: 0;
  font-family: "Segoe UI", Tahoma, sans-serif;
  background: #f5f7ff;
  color: #14213d;
}

.card {
  max-width: 760px;
  margin: 2rem auto;
  padding: 1.2rem;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #d9e2ff;
}
`;

const DEFAULT_TS = `const message: string = "Hello, Lit3!";
console.log(message);`;

const EDITOR_FILE_TABS: readonly MonacoTabItem[] = [
  { id: "ts", label: "TypeScript" },
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
];
const SURFACE_TABS: readonly MonacoTabItem[] = [
  { id: "code-editor", label: "Code Editor" },
  { id: "build-result", label: "Build Logs" },
];
const BUILD_RESULT_TABS: readonly MonacoTabItem[] = [
  { id: "errors", label: "Errors" },
  { id: "warnings", label: "Warnings" },
];

const BUILD_ERROR_HINT_PATTERN = /\b(error|throw|fail)\b/i;
const MAIN_EDITOR_ID = "main-code-editor";
const MAIN_EDITOR_SELECTOR = `#${MAIN_EDITOR_ID}`;
const RUN_BUTTON_ID = "run-code-button";
const RESULT_VIEW_ID = "build-product-html-viewer";
const DEFAULT_BUILD_FAILURE_MESSAGE =
  "Build failed. The source contains error markers (error/throw/fail).";
const DEFAULT_TRANSPILE_FAILURE_MESSAGE = "TypeScript transpile failed.";
const DEFAULT_WORKING_FOLDER = "folderName";
const CONFIGURATION_URL = new URL("../../configuration.json", import.meta.url);

@customElement("monaco-editor-page-view")
export class MonacoEditorPageView extends LitElement {
  @state()
  private activeTab: EditorTabId = "ts";

  @state()
  private htmlCode = DEFAULT_HTML;

  @state()
  private cssCode = DEFAULT_CSS;

  @state()
  private tsCode = DEFAULT_TS;

  @state()
  private changeCount = 0;

  @state()
  private editorSurfaceTab: SurfaceTabId = "code-editor";

  @state()
  private buildResultTab: BuildResultTabId = "errors";

  @state()
  private buildErrors: readonly string[] = [];

  @state()
  private buildWarnings: readonly string[] = [];

  private workingFolderName = DEFAULT_WORKING_FOLDER;

  public override connectedCallback(): void {
    super.connectedCallback();
    void this.loadConfiguration();
  }

  public static override styles = css`
    :host {
      color: #d8e1f4;
      display: block;
      height: 100dvh;
      font-family: "Segoe UI", Tahoma, sans-serif;
      background: #0f1727;
      overflow: hidden;
    }

    main {
      height: 100%;
      min-height: 0;
      display: grid;
      grid-template-rows: auto minmax(0, 1fr) auto;
      overflow: hidden;
    }

    header,
    footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      padding: 0.8rem 1rem;
      background: #17233a;
      border-color: #253558;
      border-style: solid;
    }

    header {
      border-width: 0 0 1px;
    }

    footer {
      border-width: 1px 0 0;
      color: #93a6ca;
      font-size: 0.9rem;
    }

    a {
      color: #8cc2ff;
      text-decoration: none;
    }

    .workspace {
      min-height: 0;
      height: 100%;
      padding: 0.9rem;
      box-sizing: border-box;
      overflow: auto;
    }

    .three-column {
      min-height: 0;
      height: 100%;
      display: grid;
      grid-template-columns: minmax(220px, 300px) minmax(0, 1fr) minmax(460px, 1.05fr);
      gap: 0.9rem;
    }

    .pane {
      min-height: 0;
      border: 1px solid #253558;
      border-radius: 12px;
      background: #101a2d;
      padding: 0.8rem;
      box-sizing: border-box;
      overflow: hidden;
    }

    .pane.menu {
      display: grid;
      align-content: start;
      gap: 0.8rem;
    }

    .pane.result {
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      gap: 0.55rem;
    }

    .label {
      margin: 0;
      color: #9fb4dc;
      font-size: 0.82rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    code-editor {
      --editor-height: 100%;
      height: 100%;
      min-height: 0;
      border-radius: 8px;
      overflow: hidden;
    }

    .editor-shell {
      min-height: 0;
      height: 100%;
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      gap: 0.55rem;
    }

    build-product-html-viewer {
      height: 100%;
      min-height: 0;
    }

    .panel-content {
      min-height: 0;
      height: 100%;
    }

    .code-preview {
      margin: 0;
      white-space: pre-wrap;
      font-family: Consolas, "Courier New", monospace;
      font-size: 0.86rem;
      color: #a9bcde;
    }

    @media (max-width: 1440px) {
      .three-column {
        grid-template-columns: minmax(220px, 280px) minmax(0, 1fr) minmax(380px, 1fr);
      }
    }

    @media (max-width: 1200px) {
      .three-column {
        grid-template-columns: 1fr;
        height: auto;
        min-height: 100%;
      }

      .pane {
        min-height: 340px;
        overflow: auto;
      }

      .pane.menu {
        min-height: 0;
      }
    }
  `;

  public override render() {
    return html`
      <main>
        <header>
          <a href="./editor.html">Editor</a>
          <div>Editor + Result Layout</div>
        </header>

        <section class="workspace">
          <section class="three-column">
            <aside class="pane menu">
              <p class="label">Column 1: Menu</p>
              <monaco-menu>
                <monaco-code-load
                  slot="load"
                  target-selector="#missing-editor-target"
                  default-file-name=${this.resolveFileNameForActiveTab()}
                  @load-code-file=${this.onLoadCodeFile}
                ></monaco-code-load>

                <monaco-code-save
                  slot="save"
                  target-selector=${MAIN_EDITOR_SELECTOR}
                  file-name=${this.resolveFileNameForActiveTab()}
                  @save-code-file=${this.onSaveCodeFile}
                ></monaco-code-save>

                <monaco-code-build
                  slot="build"
                  target-selector=${MAIN_EDITOR_SELECTOR}
                  @build-code=${this.onBuildCode}
                ></monaco-code-build>

                <monaco-code-run
                  id=${RUN_BUTTON_ID}
                  slot="run"
                  target-selector=${MAIN_EDITOR_SELECTOR}
                  @run-code=${this.onRunCode}
                ></monaco-code-run>
              </monaco-menu>
            </aside>

            <section class="pane">
              <p class="label">Column 2: Code Editor</p>
              <div class="editor-shell">
                <monaco-tabs
                  .items=${SURFACE_TABS}
                  .activeId=${this.editorSurfaceTab}
                  @tab-change=${this.onEditorSurfaceTabChanged}
                ></monaco-tabs>

                ${this.editorSurfaceTab === "code-editor"
                  ? html`
                      <div class="panel-content editor-shell">
                        <monaco-tabs
                          .items=${EDITOR_FILE_TABS}
                          .activeId=${this.activeTab}
                          @tab-change=${this.onEditorFileTabChanged}
                        ></monaco-tabs>
                        <code-editor
                          id=${MAIN_EDITOR_ID}
                          language=${this.resolveLanguageForActiveTab()}
                          .code=${this.resolveCodeForActiveTab()}
                          @change=${this.onEditorChange}
                        ></code-editor>
                      </div>
                    `
                  : html`
                      <div class="panel-content editor-shell">
                        <monaco-tabs
                          .items=${BUILD_RESULT_TABS}
                          .activeId=${this.buildResultTab}
                          @tab-change=${this.onBuildResultTabChanged}
                        ></monaco-tabs>
                        <pre class="code-preview">${this.buildResultTab === "errors"
                          ? this.buildErrors.length > 0
                            ? this.buildErrors.join("\n")
                            : "(no build errors)"
                          : this.buildWarnings.length > 0
                            ? this.buildWarnings.join("\n")
                            : "(no build warnings)"}</pre>
                      </div>
                    `}
              </div>
            </section>

            <section class="pane result">
              <p class="label">Column 3: Running code</p>
              <build-product-html-viewer
                id=${RESULT_VIEW_ID}
                class="build-result-presenter"
                title="Running code"
              ></build-product-html-viewer>
            </section>
          </section>
        </section>

        <footer>
          <span>Three-column editor workflow</span>
          <span>Edits: ${this.changeCount}</span>
        </footer>
      </main>
    `;
  }

  private readonly onEditorChange = (event: CustomEvent<CodeEditorChangeEventDetail>): void => {
    this.assignCodeForTab(this.activeTab, event.detail.value);
    this.changeCount += 1;
  };

  private readonly onLoadCodeFile = (event: CustomEvent<MonacoCodeLoadEventDetail>): void => {
    const { fileName, content, files, folderName } = event.detail;

    if (files.length > 0) {
      if (this.isWorkingFolderConstraintEnabled() && !this.isExpectedWorkingFolder(folderName)) {
        console.warn(
          `[core-lit-monaco-editor-application] Ignored folder "${folderName}". Expected "${this.workingFolderName}".`,
        );
        return;
      }

      this.applyLoadedFolder(files);
      this.changeCount += 1;
      return;
    }

    const tab = this.resolveTabFromFileName(fileName);
    this.assignCodeForTab(tab, content);
    this.activeTab = tab;
    this.changeCount += 1;
  };

  private applyLoadedFolder(files: readonly MonacoCodeLoadEntry[]): void {
    const tsEntry = this.findPreferredEntry(files, ["main.ts", "index.ts"], [".ts", ".tsx", ".js", ".mjs"]);
    const htmlEntry = this.findPreferredEntry(files, ["index.html"], [".html", ".htm"]);
    const cssEntry = this.findPreferredEntry(files, ["styles.css", "style.css"], [".css"]);

    // Replace all editor buffers on project load to avoid stale cross-project content.
    this.tsCode = tsEntry?.content ?? "";
    this.htmlCode = htmlEntry?.content ?? "";
    this.cssCode = cssEntry?.content ?? "";

    if (tsEntry) {
      this.activeTab = "ts";
      return;
    }

    if (htmlEntry) {
      this.activeTab = "html";
      return;
    }

    if (cssEntry) {
      this.activeTab = "css";
      return;
    }

    this.activeTab = "ts";
  }

  private readonly onBuildCode = (_event: CustomEvent<MonacoCodeBuildEventDetail>): void => {
    const transpileResult = this.transpileTypeScript(this.tsCode);
    const presenters = this.resolveBuildProductPresenters();

    this.buildErrors = [];
    this.buildWarnings = transpileResult.warnings;
    this.buildResultTab = "errors";

    if (!transpileResult.ok) {
      const message = `${DEFAULT_TRANSPILE_FAILURE_MESSAGE}\n${transpileResult.message}`;
      this.buildErrors = [message];
      presenters.forEach((presenter) => presenter.presentBuildFailure(message));
      return;
    }

    const content = this.composeBuildSource(transpileResult.outputText);
    const isHtml = this.isLikelyHtml(content);
    const hasErrorHint = BUILD_ERROR_HINT_PATTERN.test(content);

    if (!isHtml && hasErrorHint) {
      this.buildErrors = [DEFAULT_BUILD_FAILURE_MESSAGE];
      presenters.forEach((presenter) => presenter.presentBuildFailure(DEFAULT_BUILD_FAILURE_MESSAGE));
      return;
    }

    this.buildErrors = [];
    this.triggerRunButton();
  };

  private readonly onSaveCodeFile = async (
    event: CustomEvent<MonacoCodeSaveEventDetail>,
  ): Promise<void> => {
    const pickerHost = window as Window & {
      showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
    };

    if (typeof pickerHost.showDirectoryPicker !== "function") {
      return;
    }

    event.preventDefault();

    try {
      const selectedDirectory = await pickerHost.showDirectoryPicker();
      const targetDirectory = await this.resolveWorkingFolderDirectory(selectedDirectory);
      const filesToWrite: readonly MonacoCodeLoadEntry[] = [
        { path: "main.ts", fileName: "main.ts", content: this.tsCode },
        { path: "index.html", fileName: "index.html", content: this.htmlCode },
        { path: "styles.css", fileName: "styles.css", content: this.cssCode },
      ];

      for (const file of filesToWrite) {
        const fileHandle = await targetDirectory.getFileHandle(file.fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(file.content);
        await writable.close();
      }
    } catch (error) {
      const domError = error as { name?: string };
      if (domError?.name !== "AbortError") {
        throw error;
      }
    }
  };

  private async loadConfiguration(): Promise<void> {
    try {
      const response = await fetch(CONFIGURATION_URL);
      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { "working-folder"?: unknown };
      const configuredWorkingFolder = payload["working-folder"];

      if (typeof configuredWorkingFolder === "string" && configuredWorkingFolder.trim().length > 0) {
        this.workingFolderName = configuredWorkingFolder.trim();
      }
    } catch {
      // Keep default when configuration cannot be loaded.
    }
  }

  private isExpectedWorkingFolder(folderName: string): boolean {
    return this.normalizeFolderName(folderName) === this.normalizeFolderName(this.workingFolderName);
  }

  private isWorkingFolderConstraintEnabled(): boolean {
    const normalized = this.normalizeFolderName(this.workingFolderName);
    return normalized.length > 0 && normalized !== this.normalizeFolderName(DEFAULT_WORKING_FOLDER);
  }

  private normalizeFolderName(value: string): string {
    return value.trim().toLowerCase();
  }

  private async resolveWorkingFolderDirectory(
    directory: FileSystemDirectoryHandle,
  ): Promise<FileSystemDirectoryHandle> {
    if (!this.isWorkingFolderConstraintEnabled()) {
      return directory;
    }

    if (this.isExpectedWorkingFolder(directory.name)) {
      return directory;
    }

    return directory.getDirectoryHandle(this.workingFolderName, { create: true });
  }

  private readonly onRunCode = (_event: CustomEvent<MonacoCodeRunEventDetail>): void => {
    const transpileResult = this.transpileTypeScript(this.tsCode);
    const presenters = this.resolveBuildProductPresenters();

    if (presenters.length === 0) {
      return;
    }

    if (!transpileResult.ok) {
      const message = `${DEFAULT_TRANSPILE_FAILURE_MESSAGE}\n${transpileResult.message}`;
      this.buildErrors = [message];
      presenters.forEach((presenter) => presenter.presentBuildFailure(message));
      return;
    }

    const content = this.composeBuildSource(transpileResult.outputText);
    const lineCount = this.countLines(content);
    const executedAtIso = new Date().toISOString();

    const product = this.isLikelyHtml(content)
      ? this.createHtmlExecutionProduct(content, executedAtIso)
      : buildExecutionProductFromSource(content, {
          executedAtIso,
          durationMs: 0,
        });

    const consoleLines = [
      ...product.consoleLines,
      `Lines: ${lineCount}`,
      `Chars: ${content.length}`,
      `Edits: ${this.changeCount}`,
    ];

    const successfulProduct: MonacoBuildExecutionProduct = {
      ...product,
      consoleLines,
    };
    presenters.forEach((presenter) => presenter.presentExecutionProduct(successfulProduct));
  };

  private resolveBuildProductPresenters(): IMonacoBuildProductPresenter[] {
    const root = this.renderRoot as ParentNode & {
      querySelectorAll?: (selectors: string) => NodeListOf<Element>;
      querySelector?: (selectors: string) => Element | null;
    };

    if (typeof root.querySelectorAll === "function") {
      const presenters = [...root.querySelectorAll(".build-result-presenter")] as unknown as IMonacoBuildProductPresenter[];
      if (presenters.length > 0) {
        return presenters;
      }
    }

    if (typeof root.querySelector === "function") {
      const fallbackPresenter = root.querySelector(`#${RESULT_VIEW_ID}`) as IMonacoBuildProductPresenter | null;
      if (fallbackPresenter) {
        return [fallbackPresenter];
      }
    }

    return [];
  }

  private triggerRunButton(): void {
    const runButton = this.renderRoot.querySelector(`#${RUN_BUTTON_ID}`) as MonacoCodeRun | null;
    runButton?.runNow();
  }

  private readonly onEditorSurfaceTabChanged = (
    event: CustomEvent<MonacoTabChangeEventDetail>,
  ): void => {
    this.editorSurfaceTab = event.detail.id as SurfaceTabId;
  };

  private readonly onEditorFileTabChanged = (
    event: CustomEvent<MonacoTabChangeEventDetail>,
  ): void => {
    this.activeTab = event.detail.id as EditorTabId;
  };

  private readonly onBuildResultTabChanged = (
    event: CustomEvent<MonacoTabChangeEventDetail>,
  ): void => {
    this.buildResultTab = event.detail.id as BuildResultTabId;
  };

  private resolveCodeForActiveTab(): string {
    if (this.activeTab === "ts") {
      return this.tsCode;
    }

    if (this.activeTab === "css") {
      return this.cssCode;
    }

    return this.htmlCode;
  }

  private resolveLanguageForActiveTab(): string {
    if (this.activeTab === "ts") {
      return "typescript";
    }

    if (this.activeTab === "css") {
      return "css";
    }

    return "html";
  }

  private resolveFileNameForActiveTab(): string {
    if (this.activeTab === "ts") {
      return "main.ts";
    }

    if (this.activeTab === "css") {
      return "styles.css";
    }

    return "index.html";
  }

  private resolveTabFromFileName(fileName: string): EditorTabId {
    const normalized = fileName.trim().toLowerCase();

    if (normalized.endsWith(".css")) {
      return "css";
    }

    if (normalized.endsWith(".ts") || normalized.endsWith(".tsx")) {
      return "ts";
    }

    if (normalized.endsWith(".js") || normalized.endsWith(".mjs")) {
      return "ts";
    }

    return "html";
  }

  private findPreferredEntry(
    files: readonly MonacoCodeLoadEntry[],
    preferredNames: readonly string[],
    extensions: readonly string[],
  ): MonacoCodeLoadEntry | undefined {
    const lowercaseNames = preferredNames.map((name) => name.toLowerCase());

    for (const preferredName of lowercaseNames) {
      const exactMatch = files.find((entry) => entry.fileName.toLowerCase() === preferredName);
      if (exactMatch) {
        return exactMatch;
      }
    }

    return files.find((entry) => {
      const normalized = entry.fileName.toLowerCase();
      return extensions.some((extension) => normalized.endsWith(extension));
    });
  }

  private assignCodeForTab(tab: EditorTabId, value: string): void {
    if (tab === "ts") {
      this.tsCode = value;
      return;
    }

    if (tab === "css") {
      this.cssCode = value;
      return;
    }

    this.htmlCode = value;
  }

  private composeBuildSource(compiledJavaScript?: string): string {
    const htmlSource = this.htmlCode.trim();
    const cssSource = this.cssCode.trim();
    const jsSource = (compiledJavaScript ?? "").trim();

    const baseDocument =
      htmlSource.length > 0
        ? htmlSource
        : "<main><h1>Preview</h1><p>Add HTML in the html tab.</p></main>";

    if (/<html[\s>]/i.test(baseDocument) || /<!doctype html/i.test(baseDocument)) {
      return this.injectAssetsIntoHtmlDocument(baseDocument, cssSource, jsSource);
    }

    const cssBlock = cssSource ? `<style>\n${cssSource}\n</style>\n` : "";
    const jsBlock = jsSource ? `<script type="module">\n${jsSource}\n</script>\n` : "";

    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
${cssBlock ? `    ${cssBlock.replaceAll("\n", "\n    ").trimEnd()}\n` : ""}  </head>
  <body>
    ${baseDocument}
${jsBlock ? `    ${jsBlock.replaceAll("\n", "\n    ").trimEnd()}\n` : ""}  </body>
</html>`;
  }

  private injectAssetsIntoHtmlDocument(documentSource: string, cssSource: string, jsSource: string): string {
    let output = documentSource;

    if (cssSource) {
      const styleTag = `<style>\n${cssSource}\n</style>`;
      if (/<\/head>/i.test(output)) {
        output = output.replace(/<\/head>/i, `${styleTag}\n</head>`);
      } else {
        output = `${styleTag}\n${output}`;
      }
    }

    if (jsSource) {
      const scriptTag = `<script type="module">\n${jsSource}\n</script>`;
      if (/<\/body>/i.test(output)) {
        output = output.replace(/<\/body>/i, `${scriptTag}\n</body>`);
      } else {
        output = `${output}\n${scriptTag}`;
      }
    }

    return output;
  }

  private countLines(content: string): number {
    return content.length === 0 ? 0 : content.split(/\r?\n/).length;
  }

  private isLikelyHtml(content: string): boolean {
    const source = content.trim().toLowerCase();

    return (
      source.startsWith("<!doctype html") ||
      source.startsWith("<html") ||
      source.includes("<body") ||
      source.includes("<head") ||
      source.includes("<div")
    );
  }

  private createHtmlExecutionProduct(content: string, executedAtIso: string): MonacoBuildExecutionProduct {
    return {
      status: "success",
      executedAtIso,
      sourceCode: content,
      consoleLines: ["HTML preview rendered."],
      durationMs: 0,
      summary: "HTML content rendered in build product HTML viewer.",
    };
  }

  private transpileTypeScript(source: string): {
    ok: boolean;
    outputText: string;
    message: string;
    warnings: readonly string[];
  } {
    let result: TranspileOutput;

    try {
      result = transpileModule(source, {
        reportDiagnostics: true,
        compilerOptions: {
          target: ScriptTarget.ES2020,
          module: ModuleKind.ES2020,
          moduleResolution: ModuleResolutionKind.Bundler,
          sourceMap: false,
          inlineSourceMap: false,
        },
      });
    } catch (error) {
      return {
        ok: false,
        outputText: "",
        message: error instanceof Error ? error.message : String(error),
        warnings: [],
      };
    }

    const diagnostics = result.diagnostics ?? [];
    const warnings = diagnostics.filter(
      (diagnostic) => diagnostic.category === DiagnosticCategory.Warning,
    );
    const errors = diagnostics.filter(
      (diagnostic) => diagnostic.category !== DiagnosticCategory.Warning,
    );

    if (errors.length > 0) {
      return {
        ok: false,
        outputText: "",
        message: this.formatDiagnostics(errors),
        warnings: this.formatDiagnostics(warnings).split("\n").filter(Boolean),
      };
    }

    return {
      ok: true,
      outputText: result.outputText,
      message: "",
      warnings: this.formatDiagnostics(warnings).split("\n").filter(Boolean),
    };
  }

  private formatDiagnostics(diagnostics: readonly Diagnostic[]): string {
    return diagnostics
      .map((diagnostic) => {
        const flattened = typeof diagnostic.messageText === "string"
          ? diagnostic.messageText
          : flattenDiagnosticMessageText(diagnostic.messageText, "\n");

        if (!diagnostic.file || diagnostic.start === undefined) {
          return `TS${diagnostic.code}: ${flattened}`;
        }

        const position = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        return `TS${diagnostic.code} (${position.line + 1}:${position.character + 1}): ${flattened}`;
      })
      .join("\n");
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "monaco-editor-page-view": MonacoEditorPageView;
  }
}
