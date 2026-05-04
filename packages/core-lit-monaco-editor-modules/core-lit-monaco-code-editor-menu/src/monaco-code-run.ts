import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { countCodeLines, readCodeFromTarget, resolveEditorTarget, type EditorReadableTarget } from "./editor-target.js";
import { MonacoMenuEventNames, type MonacoCodeRunEventDetail } from "./menu-events.js";

export type { MonacoCodeRunEventDetail } from "./menu-events.js";

@customElement("monaco-code-run")
export class MonacoCodeRun extends LitElement {
  @property({ attribute: "target-selector" })
  public targetSelector = "code-editor";

  @property()
  public label = "Run code";

  public static override styles = css`
    :host {
      display: inline-block;
    }

    button {
      border: 1px solid #2b5b67;
      border-radius: 8px;
      background: #1a3b43;
      color: #d9f1f5;
      cursor: pointer;
      padding: 0.45rem 0.7rem;
      font: inherit;
    }

    button:hover {
      background: #24515d;
    }
  `;

  public override render() {
    return html`<button type="button" @click=${this.runCode}>${this.label}</button>`;
  }

  public runNow(): void {
    this.runCode();
  }

  private readonly runCode = (): void => {
    const content = this.resolveCodeFromTarget();
    const lineCount = countCodeLines(content);

    this.dispatchEvent(
      new CustomEvent<MonacoCodeRunEventDetail>(MonacoMenuEventNames.RunCode, {
        detail: {
          content,
          lineCount,
        },
        bubbles: true,
        composed: true,
      }),
    );
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
    "monaco-code-run": MonacoCodeRun;
  }
}
