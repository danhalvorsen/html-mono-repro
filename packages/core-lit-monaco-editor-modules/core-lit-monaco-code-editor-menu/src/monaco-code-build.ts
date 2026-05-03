import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { countCodeLines, readCodeFromTarget, resolveEditorTarget, type EditorReadableTarget } from "./editor-target.js";
import { MonacoMenuEventNames, type MonacoCodeBuildEventDetail } from "./menu-events.js";

export type { MonacoCodeBuildEventDetail } from "./menu-events.js";

@customElement("monaco-code-build")
export class MonacoCodeBuild extends LitElement {
  @property({ attribute: "target-selector" })
  public targetSelector = "code-editor";

  @property()
  public label = "Build code";

  public static override styles = css`
    :host {
      display: inline-block;
    }

    button {
      border: 1px solid #355d2b;
      border-radius: 8px;
      background: #23461c;
      color: #d9f5d9;
      cursor: pointer;
      padding: 0.45rem 0.7rem;
      font: inherit;
    }

    button:hover {
      background: #2f5d26;
    }
  `;

  public override render() {
    return html`<button type="button" @click=${this.buildCode}>${this.label}</button>`;
  }

  private readonly buildCode = (): void => {
    const content = this.resolveCodeFromTarget();
    const lineCount = countCodeLines(content);

    this.dispatchEvent(
      new CustomEvent<MonacoCodeBuildEventDetail>(MonacoMenuEventNames.BuildCode, {
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
    "monaco-code-build": MonacoCodeBuild;
  }
}
