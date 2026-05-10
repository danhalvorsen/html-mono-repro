import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { Converter, abcFromEvents$ } from "@monorepo/hello-notes-deterministic-adapters";
import { from, firstValueFrom } from "rxjs";
import * as abcjs from "abcjs";

@customElement("view-midi-converter")
export class ViewMidiConverter extends LitElement {
  @state()
  private midiInput = "C4-h500-v92-ch1 C4-h500-v92-ch1 G4-h500-v92-ch1 G4-h500-v92-ch1 A4-h500-v92-ch1 A4-h500-v92-ch1 G4-h1000-v92-ch1 F4-h500-v88-ch1 F4-h500-v88-ch1 E4-h500-v88-ch1 E4-h500-v88-ch1 D4-h500-v88-ch1 D4-h500-v88-ch1 C4-h1000-v88-ch1";

  @state()
  private abcInput = "";

  @state()
  private errorText = "";

  private readonly converter = new Converter();

  protected render() {
    return html`
      <main>
        <h1>MIDI Text to ABCJS</h1>
        <p>Paste MIDI note text and press Enter to convert and render.</p>

        <label for="midi-input">MIDI input text</label>
        <textarea
          id="midi-input"
          .value=${this.midiInput}
          @input=${this.onInput}
          @keydown=${this.onKeyDown}
          placeholder="Example: C4-h500-v92-ch1 D4-h500-v92-ch1 E4-h1000-v92-ch1"
          rows="4"
        ></textarea>

        <small>Press Enter to convert. Use Shift+Enter for newline.</small>

        ${this.errorText ? html`<pre class="error">${this.errorText}</pre>` : html``}

        <section>
          <h2>ABC notation input</h2>
          <textarea
            id="abc-input"
            .value=${this.abcInput}
            @input=${this.onAbcInput}
            @keydown=${this.onAbcKeyDown}
            placeholder="Paste ABC notation here and press Enter to render"
            rows="8"
          ></textarea>
          <small>Press Enter to render ABC. Use Shift+Enter for newline.</small>
        </section>

        <section>
          <h2>Rendered score</h2>
          <div id="abc-output" aria-live="polite"></div>
        </section>
      </main>
    `;
  }

  private onInput = (event: Event): void => {
    const target = event.target as HTMLTextAreaElement;
    this.midiInput = target.value;
  };

  private onKeyDown = async (event: KeyboardEvent): Promise<void> => {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }
    event.preventDefault();
    await this.convertAndRender();
  };

  private onAbcInput = (event: Event): void => {
    const target = event.target as HTMLTextAreaElement;
    this.abcInput = target.value;
  };

  private onAbcKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }
    event.preventDefault();
    this.renderAbcInput();
  };

  private async convertAndRender(): Promise<void> {
    const input = this.midiInput.trim();
    if (input.length === 0) {
      this.errorText = "Input is empty. Paste MIDI note text first.";
      this.abcInput = "";
      this.clearScore();
      return;
    }

    try {
      this.errorText = "";
      const songLike = { get: () => input };
      const events = this.converter.convert(songLike);
      const abc = await firstValueFrom(abcFromEvents$(from(events)));
      this.abcInput = abc;
      this.renderScore(abc);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.errorText = `Conversion failed: ${message}`;
      this.abcInput = "";
      this.clearScore();
    }
  }

  private renderAbcInput(): void {
    const abc = this.abcInput.trim();
    if (abc.length === 0) {
      this.errorText = "ABC input is empty. Paste ABC notation first.";
      this.clearScore();
      return;
    }

    try {
      this.errorText = "";
      this.renderScore(abc);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.errorText = `ABC render failed: ${message}`;
      this.clearScore();
    }
  }

  private renderScore(abc: string): void {
    const mount = this.renderRoot.querySelector("#abc-output") as HTMLElement | null;
    if (mount === null) {
      return;
    }
    mount.replaceChildren();
    abcjs.renderAbc(mount, abc, {
      responsive: "resize",
      add_classes: true
    });
  }

  private clearScore(): void {
    const mount = this.renderRoot.querySelector("#abc-output") as HTMLElement | null;
    if (mount !== null) {
      mount.replaceChildren();
    }
  }

  static styles = css`
    :host {
      display: block;
      color: #111111;
    }

    main {
      max-width: 980px;
    }

    h1 {
      margin: 0 0 0.5rem;
      font-size: 1.8rem;
      color: #111111;
    }

    h2 {
      margin: 1.5rem 0 0.5rem;
      font-size: 1.05rem;
      color: #111111;
    }

    p {
      margin: 0 0 1rem;
      color: #374151;
    }

    label {
      display: block;
      font-weight: 600;
      margin-bottom: 0.4rem;
      color: #111111;
    }

    textarea {
      width: 100%;
      box-sizing: border-box;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 0.75rem;
      background: #ffffff;
      color: #111111;
      font: 14px/1.5 Consolas, Menlo, Monaco, monospace;
    }

    small {
      display: block;
      margin-top: 0.5rem;
      color: #4b5563;
    }

    pre {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-word;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 0.75rem;
      background: #ffffff;
      color: #111111;
      font: 13px/1.5 Consolas, Menlo, Monaco, monospace;
    }

    .error {
      margin-top: 1rem;
      border-color: #7f1d1d;
      background: #fef2f2;
      color: #991b1b;
    }

    #abc-output {
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 0.5rem;
      overflow-x: auto;
      background: #ffffff;
      min-height: 100px;
    }

    #abc-output svg {
      background: #ffffff;
    }

    #abc-output :is(path, line, text, .abcjs-note, .abcjs-staff, .abcjs-bar) {
      stroke: #111111;
      fill: #111111;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "view-midi-converter": ViewMidiConverter;
  }
}
