import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { readCodeFromTarget, resolveEditorTarget, type EditorReadableTarget } from "./editor-target.js";
import { MonacoMenuEventNames, type MonacoCodeSaveEventDetail } from "./menu-events.js";

export type { MonacoCodeSaveEventDetail } from "./menu-events.js";

@customElement("monaco-code-save")
export class MonacoCodeSave extends LitElement {
  @property({ attribute: "target-selector" })
  public targetSelector = "code-editor";

  @property({ attribute: "file-name" })
  public fileName = "code.txt";

  @property()
  public label = "Save project";

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
  `;

  public override render() {
    return html`<button type="button" @click=${this.saveCodeFile}>${this.label}</button>`;
  }

  private readonly saveCodeFile = (): void => {
    const content = this.resolveCodeFromTarget();
    const fileName = this.fileName;
    const files = [{ path: fileName, fileName, content }] as const;

    const saveEvent = new CustomEvent<MonacoCodeSaveEventDetail>(MonacoMenuEventNames.SaveCodeFile, {
      detail: {
        fileName,
        content,
        files,
      },
      bubbles: true,
      composed: true,
      cancelable: true,
    });

    const shouldContinueDefault = this.dispatchEvent(saveEvent);

    if (!shouldContinueDefault) {
      return;
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = fileName;
    anchor.click();

    URL.revokeObjectURL(url);
  };

  private resolveTarget(): EditorReadableTarget | null {
    return resolveEditorTarget<EditorReadableTarget>(this, this.targetSelector);
  }

  private resolveCodeFromTarget(): string {
    return readCodeFromTarget(this.resolveTarget());
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "monaco-code-save": MonacoCodeSave;
  }
}
