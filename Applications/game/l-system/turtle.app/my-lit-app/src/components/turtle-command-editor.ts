import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  DefaultTurtleCommandSource,
  TurtleCommandEventName,
  type TurtleCommandsChangedEventDetail,
} from "../turtle-command/TurtleCommandContracts.js";

@customElement("turtle-command-editor")
export class TurtleCommandEditor extends LitElement {
  @property({ type: String })
  public value = DefaultTurtleCommandSource;

  protected override render() {
    return html`
      <section class="editor-shell">
        <header>
          <div>
            <h2>Turtle commands</h2>
            <p>One command per line. Comments start with <code>#</code>.</p>
          </div>

          <button type="button" @click=${this.resetSample}>
            Sample
          </button>
        </header>

        <textarea
          spellcheck="false"
          .value=${this.value}
          @input=${this.onInput}
          aria-label="Turtle commands"
        ></textarea>

        <footer>
          <code>forward 80</code>
          <code>left 90</code>
          <code>push</code>
          <code>pop</code>
          <code>stroke #0f172a 2</code>
        </footer>
      </section>
    `;
  }

  private onInput(event: Event): void {
    const target = event.target;

    if (!(target instanceof HTMLTextAreaElement)) {
      return;
    }

    this.value = target.value;
    this.dispatchChanged();
  }

  private resetSample(): void {
    this.value = DefaultTurtleCommandSource;
    this.dispatchChanged();
  }

  private dispatchChanged(): void {
    this.dispatchEvent(
      new CustomEvent<TurtleCommandsChangedEventDetail>(
        TurtleCommandEventName.CommandsChanged,
        {
          bubbles: true,
          composed: true,
          detail: {
            value: this.value,
          },
        },
      ),
    );
  }

  public static override styles = css`
    :host {
      display: block;
      min-width: 0;
    }

    .editor-shell {
      display: grid;
      grid-template-rows: auto minmax(360px, 1fr) auto;
      gap: 12px;
      height: 100%;
      min-height: 0;
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

    button {
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 8px 12px;
      color: var(--text-strong);
      background: var(--surface-2);
      cursor: pointer;
    }

    button:hover {
      border-color: var(--accent);
    }

    textarea {
      width: 100%;
      height: 100%;
      min-height: 360px;
      box-sizing: border-box;
      resize: vertical;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px;
      color: var(--text-strong);
      background: var(--surface-2);
      font: 14px/1.55 ui-monospace, SFMono-Regular, Consolas, monospace;
      outline: none;
    }

    textarea:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-soft);
    }

    footer {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    code {
      border-radius: 999px;
      padding: 4px 8px;
      color: var(--text-muted);
      background: var(--surface-2);
      font: 12px/1.4 ui-monospace, SFMono-Regular, Consolas, monospace;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "turtle-command-editor": TurtleCommandEditor;
  }
}