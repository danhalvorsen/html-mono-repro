import { LitElement, css, html, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ColorThemeFactory } from "./ColorThemeFactory.js";
import { ColorThemePreset } from "./ColorThemePreset.js";
import { SlotColorDistributor } from "./SlotColorDistributor.js";
import type { GameObjectColorTheme } from "./IColorManagedGameObject.js";

@customElement("color-management")
export class ColorManagement extends LitElement {
  public static override styles = css`
    :host {
      display: block;
    }

    .layout {
      display: grid;
      gap: 12px;
    }

    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      padding: 8px;
      border: 1px solid #263149;
      border-radius: 8px;
      background: #121829;
    }

    button, select, input {
      font: inherit;
    }

    .preview {
      border-radius: 12px;
      overflow: hidden;
      background: var(--color-management-background, #000);
    }

    .swatches {
      display: flex;
      gap: 6px;
      align-items: center;
      min-height: 20px;
    }

    .swatch {
      width: 18px;
      height: 18px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.25);
      box-sizing: border-box;
    }
  `;

  @property({ type: String })
  public preset: keyof typeof ColorThemePreset = "aurora";

  @property({ type: Number })
  public seed = 92831;

  @property({ type: Boolean, attribute: "show-toolbar" })
  public showToolbar = true;

  @state()
  private theme: GameObjectColorTheme | null = null;

  readonly #factory = new ColorThemeFactory();
  readonly #distributor = new SlotColorDistributor();

  public override connectedCallback(): void {
    super.connectedCallback();
    this.#rebuildTheme();
  }

  protected override updated(): void {
    if (this.theme === null) {
      return;
    }

    this.style.setProperty("--color-management-background", this.theme.backgroundCss);
    this.#distributor.apply(this, this.theme);
  }

  protected override render(): TemplateResult {
    return html`
      <section class="layout">
        ${this.showToolbar ? this.renderToolbar() : null}

        <div class="preview">
          <slot @slotchange=${this.onSlotChange}></slot>
        </div>
      </section>
    `;
  }

  private renderToolbar(): TemplateResult {
    return html`
      <div class="toolbar">
        <label>
          Theme
          <select .value=${this.preset} @change=${this.onPresetChanged}>
            <option value="aurora">aurora</option>
            <option value="ember">ember</option>
            <option value="ocean">ocean</option>
            <option value="mono">mono</option>
            <option value="random">random</option>
          </select>
        </label>

        <label>
          Seed
          <input
            type="number"
            .value=${String(this.seed)}
            @change=${this.onSeedChanged}
          />
        </label>

        <button type="button" @click=${this.randomizeColors}>Randomize colors</button>

        <div class="swatches">
          ${this.theme?.paletteCss.map(
            color => html`<span class="swatch" style=${`background:${color}`}></span>`,
          )}
        </div>
      </div>
    `;
  }

  private readonly onSlotChange = (): void => {
    this.#applyTheme();
  };

  private readonly onPresetChanged = (event: Event): void => {
    const target = event.currentTarget;

    if (!(target instanceof HTMLSelectElement)) {
      throw new TypeError("Expected HTMLSelectElement.");
    }

    this.preset = target.value as keyof typeof ColorThemePreset;
    this.#rebuildTheme();
  };

  private readonly onSeedChanged = (event: Event): void => {
    const target = event.currentTarget;

    if (!(target instanceof HTMLInputElement)) {
      throw new TypeError("Expected HTMLInputElement.");
    }

    const value = Number(target.value);

    if (!Number.isInteger(value)) {
      throw new RangeError("Seed must be an integer.");
    }

    this.seed = value;
    this.#rebuildTheme();
  };

  private readonly randomizeColors = (): void => {
    this.preset = "random";
    this.seed = Math.floor(Math.random() * 0x7fffffff);
    this.#rebuildTheme();
  };

  #rebuildTheme(): void {
    this.theme = this.#factory.create(this.preset, this.seed);
    this.#applyTheme();
  }

  #applyTheme(): void {
    if (this.theme === null) {
      return;
    }

    this.#distributor.apply(this, this.theme);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "color-management": ColorManagement;
  }
}