import { LitElement, css, html, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import {
  DefaultTurtleCommandSource,
  type TurtleCommandDiagnostic,
} from "../turtle-command/TurtleCommandContracts.js";
import { TurtleSvgSceneRenderer } from "../turtle-command/TurtleSvgSceneRenderer.js";

@customElement("turtle-svg-viewer")
export class TurtleSvgViewer extends LitElement {
  private readonly sceneRenderer = new TurtleSvgSceneRenderer();

  @property({ type: String })
  public commands = DefaultTurtleCommandSource;

  @property({ type: Number })
  public width = 720;

  @property({ type: Number })
  public height = 520;

  @state()
  private diagnosticsDismissed = false;

  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has("commands")) {
      this.diagnosticsDismissed = false;
    }
  }

  protected override render() {
    const result = this.sceneRenderer.renderCommands(this.commands, {
      width: this.width,
      height: this.height,
      viewBox: `0 0 ${this.width} ${this.height}`,
    });

    return html`
      <section class="viewer-shell">
        <header>
          <div>
            <h2>SVG result</h2>
            <p>${result.primitiveCount} primitives</p>
          </div>
        </header>

        <div class="canvas-frame">
          ${unsafeSVG(result.svg)}
        </div>

        ${this.renderDiagnostics(result.diagnostics)}
      </section>
    `;
  }

  private renderDiagnostics(diagnostics: readonly TurtleCommandDiagnostic[]) {
    if (this.diagnosticsDismissed) {
      return html``;
    }

    if (diagnostics.length === 0) {
      return html`
        <div
          class="diagnostics ok"
          role="button"
          tabindex="0"
          title="Click to hide"
          @click=${this.dismissDiagnostics}
          @keydown=${this.onDiagnosticsKeyDown}
        >
          No command errors.
        </div>
      `;
    }

    return html`
      <div
        class="diagnostics error"
        role="button"
        tabindex="0"
        title="Click to hide"
        @click=${this.dismissDiagnostics}
        @keydown=${this.onDiagnosticsKeyDown}
      >
        <strong>${diagnostics.length} message(s). Click to hide.</strong>
        <ul>
          ${diagnostics.map(
            (diagnostic) => html`
              <li>
                <span>Line ${diagnostic.lineNumber}</span>
                <code>${diagnostic.source}</code>
                <p class="message">${diagnostic.message}</p>
              </li>
            `,
          )}
        </ul>
      </div>
    `;
  }

  private dismissDiagnostics(): void {
    this.diagnosticsDismissed = true;
  }

  private onDiagnosticsKeyDown(event: KeyboardEvent): void {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    this.dismissDiagnostics();
  }

  public static override styles = css`
    :host {
      display: block;
      min-width: 0;
    }

    .viewer-shell {
      display: grid;
      grid-template-rows: auto auto minmax(42px, auto);
      gap: 12px;
      height: 100%;
    }

    header {
      display: flex;
      align-items: start;
      justify-content: space-between;
      gap: 12px;
    }

    h2 {
      margin: 0;
      font-size: 18px;
      color: var(--text-strong);
    }

    p {
      margin: 4px 0 0;
      color: var(--text-muted);
      font-size: 13px;
    }

    .canvas-frame {
      overflow: auto;
      border: 1px solid var(--border);
      border-radius: 12px;
      background:
        linear-gradient(var(--grid-color) 1px, transparent 1px),
        linear-gradient(90deg, var(--grid-color) 1px, transparent 1px),
        var(--canvas-bg);
      background-size: 20px 20px;
      min-height: 520px;
      display: grid;
      place-items: center;
    }

    .canvas-frame svg {
      display: block;
      max-width: 100%;
      height: auto;
    }

    .diagnostics {
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px;
      font-size: 13px;
      text-align: left;
      cursor: pointer;
      user-select: none;
    }

    .diagnostics:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }

    .diagnostics.ok {
      color: var(--ok);
      background: var(--ok-bg);
      border-color: var(--ok-border);
    }

    .diagnostics.error {
      color: var(--error);
      background: var(--error-bg);
      border-color: var(--error-border);
    }

    ul {
      margin: 8px 0 0;
      padding-left: 18px;
    }

    li + li {
      margin-top: 8px;
    }

    code {
      display: inline-block;
      margin-left: 8px;
      color: var(--text-strong);
      font: 12px/1.4 ui-monospace, SFMono-Regular, Consolas, monospace;
    }

    li p {
      margin: 2px 0 0;
    }

    .message {
      white-space: pre-line;
      user-select: text;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "turtle-svg-viewer": TurtleSvgViewer;
  }
}