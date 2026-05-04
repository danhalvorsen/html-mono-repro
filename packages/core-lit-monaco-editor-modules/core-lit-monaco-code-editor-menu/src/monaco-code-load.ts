import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { createRef, ref, type Ref } from "lit/directives/ref.js";
import { resolveEditorTarget, type EditorWritableTarget, writeCodeToTarget } from "./editor-target.js";
import {
  MonacoMenuEventNames,
  type MonacoCodeLoadEntry,
  type MonacoCodeLoadEventDetail,
} from "./menu-events.js";

export type { MonacoCodeLoadEntry, MonacoCodeLoadEventDetail } from "./menu-events.js";

@customElement("monaco-code-load")
export class MonacoCodeLoad extends LitElement {
  private readonly fileInputRef: Ref<HTMLInputElement> = createRef();

  @property({ attribute: "target-selector" })
  public targetSelector = "code-editor";

  @property({ attribute: "default-file-name" })
  public defaultFileName = "code.txt";

  @property()
  public label = "Load project";

  public static override styles = css`
    :host {
      display: inline-block;
    }

    button {
      border: 1px solid #2d426f;
      border-radius: 8px;
      background: #1e365d;
      color: #d9e2f5;
      cursor: pointer;
      padding: 0.45rem 0.7rem;
      font: inherit;
    }

    button:hover {
      background: #2a4a7d;
    }

    input[type="file"] {
      display: none;
    }
  `;

  public override render() {
    return html`
      <button type="button" @click=${this.openFilePicker}>${this.label}</button>
      <input
        ${ref(this.fileInputRef)}
        type="file"
        webkitdirectory
        directory
        multiple
        accept=".txt,.ts,.tsx,.js,.jsx,.json,.md,.html,.css,.xml,.yaml,.yml"
        @change=${this.onFolderSelected}
      />
    `;
  }

  private readonly openFilePicker = (): void => {
    const input = this.fileInputRef.value;

    if (!input) {
      return;
    }

    input.value = "";

    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }

    input.click();
  };

  private readonly onFolderSelected = async (): Promise<void> => {
    const input = this.fileInputRef.value;
    const selectedFiles = input?.files;

    if (!selectedFiles || selectedFiles.length === 0) {
      return;
    }

    const files = await this.readFolderEntries(selectedFiles);
    const primaryEntry = this.resolvePrimaryEntry(files);

    this.applyCodeToTarget(primaryEntry.content);

    this.dispatchEvent(
      new CustomEvent<MonacoCodeLoadEventDetail>(MonacoMenuEventNames.LoadCodeFile, {
        detail: {
          fileName: primaryEntry.fileName,
          content: primaryEntry.content,
          folderName: this.resolveFolderName(files, primaryEntry.fileName),
          files,
        },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private async readFolderEntries(fileList: FileList): Promise<MonacoCodeLoadEntry[]> {
    const files = Array.from(fileList);

    const entries = await Promise.all(
      files.map(async (file) => {
        const content = await file.text();
        const relativePath = this.resolveRelativePath(file);

        return {
          path: relativePath,
          fileName: file.name || this.defaultFileName,
          content,
        } satisfies MonacoCodeLoadEntry;
      }),
    );

    return entries.sort((left, right) => left.path.localeCompare(right.path));
  }

  private resolvePrimaryEntry(files: readonly MonacoCodeLoadEntry[]): MonacoCodeLoadEntry {
    const preferredFileNames = ["main.ts", "index.ts", "index.html", "styles.css"];

    for (const preferred of preferredFileNames) {
      const match = files.find((entry) => entry.fileName.toLowerCase() === preferred);
      if (match) {
        return match;
      }
    }

    return files[0] ?? {
      path: this.defaultFileName,
      fileName: this.defaultFileName,
      content: "",
    };
  }

  private resolveRelativePath(file: File): string {
    const fileWithRelativePath = file as File & { webkitRelativePath?: string };
    const relativePath = fileWithRelativePath.webkitRelativePath;

    if (relativePath && relativePath.trim().length > 0) {
      return relativePath;
    }

    return file.name || this.defaultFileName;
  }

  private resolveFolderName(files: readonly MonacoCodeLoadEntry[], fallback: string): string {
    const firstPath = files[0]?.path;

    if (!firstPath) {
      return fallback;
    }

    const [folderName] = firstPath.split("/");
    return folderName || fallback;
  }

  private resolveTarget(): EditorWritableTarget | null {
    return resolveEditorTarget<EditorWritableTarget>(this, this.targetSelector);
  }

  private applyCodeToTarget(content: string): void {
    writeCodeToTarget(this.resolveTarget(), content);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "monaco-code-load": MonacoCodeLoad;
  }
}
