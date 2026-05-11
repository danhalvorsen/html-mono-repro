import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import "./svg-shape-list.js";
import "./turtle-command-editor.js";
import "./turtle-svg-viewer.js";
import {
  DefaultTurtleCommandSource,
  TurtleCommandEventName,
  type TurtleCommandsChangedEventDetail,
} from "../turtle-command/TurtleCommandContracts.js";

@customElement("turtle-workbench")
export class TurtleWorkbench extends LitElement {
  @state()
  private commands = DefaultTurtleCommandSource;

  protected override render() {
    return html`
      <main class="workbench">
        <header class="app-header">
          <div>
            <p class="eyebrow">L-system turtle graphics</p>
            <h1>Turtle SVG Workbench</h1>
          </div>

          <p class="summary">
            Write deterministic turtle commands and render abstract turtle
            primitives as SVG.
          </p>
        </header>

        <section
          class="workspace"
          @turtle-commands-changed=${this.onCommandsChanged}
        >
          <svg-shape-list></svg-shape-list>

          <turtle-command-editor
            .value=${this.commands}
          ></turtle-command-editor>
          <turtle-svg-viewer
            .commands=${this.commands}
          ></turtle-svg-viewer>
        </section>
      </main>
    `;
  }

  private onCommandsChanged(
    event: CustomEvent<TurtleCommandsChangedEventDetail>,
  ): void {
    this.commands = event.detail.value;
  }

  public static override styles = css`
    :host {
      --bg: #f8fafc;
      --surface: #ffffff;
      --surface-2: #f1f5f9;
      --canvas-bg: #ffffff;
      --grid-color: rgba(15, 23, 42, 0.07);
      --border: #dbe3ef;
      --text: #334155;
      --text-muted: #64748b;
      --text-strong: #0f172a;
      --accent: #2563eb;
      --accent-soft: rgba(37, 99, 235, 0.14);
      --ok: #166534;
      --ok-bg: #f0fdf4;
      --ok-border: #bbf7d0;
      --error: #991b1b;
      --error-bg: #fef2f2;
      --error-border: #fecaca;

      display: block;
      min-height: 100svh;
      color: var(--text);
      background: var(--bg);
      font: 15px/1.5 system-ui, "Segoe UI", Roboto, sans-serif;
    }

    @media (prefers-color-scheme: dark) {
      :host {
        --bg: #0f1117;
        --surface: #151823;
        --surface-2: #1d2230;
        --canvas-bg: #0b1020;
        --grid-color: rgba(226, 232, 240, 0.08);
        --border: #2b3242;
        --text: #cbd5e1;
        --text-muted: #94a3b8;
        --text-strong: #f8fafc;
        --accent: #60a5fa;
        --accent-soft: rgba(96, 165, 250, 0.18);
        --ok: #86efac;
        --ok-bg: rgba(22, 101, 52, 0.16);
        --ok-border: rgba(134, 239, 172, 0.35);
        --error: #fca5a5;
        --error-bg: rgba(127, 29, 29, 0.2);
        --error-border: rgba(252, 165, 165, 0.35);
      }
    }

    .workbench {
      width: min(1440px, calc(100vw - 32px));
      margin: 0 auto;
      padding: 24px 0;
      box-sizing: border-box;
    }

    .app-header {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 24px;
      margin-bottom: 18px;
      padding: 20px;
      border: 1px solid var(--border);
      border-radius: 16px;
      background: var(--surface);
    }

    .eyebrow {
      margin: 0 0 4px;
      color: var(--accent);
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    h1 {
      margin: 0;
      color: var(--text-strong);
      font-size: clamp(28px, 4vw, 44px);
      line-height: 1;
      letter-spacing: -0.04em;
    }

    .summary {
      max-width: 520px;
      margin: 0;
      color: var(--text-muted);
      text-align: right;
    }

    .workspace {
      display: grid;
      grid-template-columns:
        minmax(280px, 0.7fr)
        minmax(360px, 0.8fr)
        minmax(520px, 1.2fr);
      gap: 18px;
      align-items: stretch;
      padding: 20px;
      border: 1px solid var(--border);
      border-radius: 16px;
      background: var(--surface);
      box-sizing: border-box;
    }

    @media (max-width: 1040px) {
      .workbench {
        width: min(100vw - 20px, 760px);
        padding: 10px 0;
      }

      .app-header {
        align-items: start;
        flex-direction: column;
      }

      .summary {
        text-align: left;
      }

      .workspace {
        grid-template-columns: 1fr;
        padding: 14px;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "turtle-workbench": TurtleWorkbench;
  }
}