import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("voice-pipeline-json")
export class VoicePipelineJson extends LitElement {
  @property({ attribute: false })
  public data: unknown = {};

  @property({ type: Boolean })
  public open = false;

  protected render() {
    return html`
      <details .open=${this.open}>
        <summary>Voice Pipeline JSON</summary>
        <pre>${this.toPlainText(this.data)}</pre>
      </details>
    `;
  }

  private toPlainText(input: unknown): string {
    const lines: string[] = [];
    this.walk(input, [], lines);
    return lines.join("\n");
  }

  private walk(value: unknown, path: string[], lines: string[]): void {
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        this.walk(item, [...path, String(index)], lines);
      });
      return;
    }

    if (value !== null && typeof value === "object") {
      for (const [key, nested] of Object.entries(value)) {
        this.walk(nested, [...path, key], lines);
      }
      return;
    }

    const key = path.join(" ");
    const text = String(value ?? "").replace(/[^a-zA-Z0-9 _.-]/g, " ");
    lines.push(`${key} ${text}`.trim());
  }

  static styles = css`
    :host {
      display: block;
    }
    details {
      border: 1px solid #d4def3;
      border-radius: 8px;
      background: #fff;
      padding: 8px;
    }
    summary {
      cursor: pointer;
      font-weight: 600;
      font-size: 13px;
      color: #1c2a4a;
    }
    pre {
      margin: 10px 0 0 0;
      padding: 10px;
      background: #eef3ff;
      border: 1px solid #d4def3;
      border-radius: 8px;
      font-size: 12px;
      white-space: pre-wrap;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "voice-pipeline-json": VoicePipelineJson;
  }
}
