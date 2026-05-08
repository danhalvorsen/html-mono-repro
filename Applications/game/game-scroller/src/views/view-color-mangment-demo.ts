import { LitElement, css, html, type TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import "../ColorMangment/index.js";
import { ColorMangmentMode, type ColorMangmentModeValue } from "../ColorMangment/ColorMangmentMode.js";
import {
  ColorMangmentPresetName,
  type ColorMangmentPresetNameValue,
} from "../ColorMangment/ColorMangmentPresetName.js";

@customElement("view-color-mangment-demo")
export class ViewColorMangmentDemo extends LitElement {
  public static override styles = css`
    :host {
      display: block;
    }

    .layout {
      display: grid;
      grid-template-columns: minmax(260px, 340px) minmax(0, 1fr);
      gap: 16px;
      align-items: start;
    }

    .panel,
    .preview {
      border: 1px solid #2a3042;
      border-radius: 12px;
      background: #121523;
      padding: 14px;
    }

    .preview {
      min-height: 420px;
    }

    h2 {
      margin: 0 0 12px 0;
      font-size: 16px;
      color: #bdc8f4;
    }

    label {
      display: grid;
      gap: 6px;
      margin-block-end: 12px;
      color: #d7ddff;
      font-size: 12px;
    }

    select,
    input,
    button {
      border: 1px solid #3c4669;
      border-radius: 8px;
      background: #1b2136;
      color: #d7ddff;
      padding: 8px 10px;
    }

    input[type="range"] {
      padding: 0;
    }

    button {
      cursor: pointer;
      width: 100%;
    }

    button:hover {
      background: #242c48;
    }

    .value {
      color: #8fa2ff;
      font-variant-numeric: tabular-nums;
    }

    .preview-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(180px, 1fr));
      gap: 16px;
      align-items: center;
    }

    color-mangment-preview-game-object {
      width: 180px;
      height: 120px;
    }

    .note {
      margin: 14px 0 0 0;
      color: #a7b0d1;
      font-size: 12px;
      line-height: 1.45;
    }
  `;

  @state()
  private mode: ColorMangmentModeValue = ColorMangmentMode.Gradient;

  @state()
  private preset: ColorMangmentPresetNameValue = ColorMangmentPresetName.NeonFlow;

  @state()
  private seed = 92831;

  @state()
  private paletteCount = 6;

  @state()
  private animationSpeed = 0;

  private readonly modes: readonly ColorMangmentModeValue[] = Object.freeze([
    ColorMangmentMode.Gradient,
    ColorMangmentMode.Palette,
    ColorMangmentMode.RandomPalette,
  ]);

  private readonly presets: readonly ColorMangmentPresetNameValue[] = Object.freeze([
    ColorMangmentPresetName.NeonFlow,
    ColorMangmentPresetName.Ocean,
    ColorMangmentPresetName.Heat,
    ColorMangmentPresetName.Mono,
  ]);

  protected override render(): TemplateResult {
    return html`
      <section class="layout">
        <aside class="panel">
          <h2>Color Mangment</h2>

          <label>
            Mode
            <select @change=${this.onModeChanged}>
              ${this.modes.map(
                (mode) => html`
                  <option value=${mode} ?selected=${this.mode === mode}>${mode}</option>
                `,
              )}
            </select>
          </label>

          <label>
            Preset
            <select @change=${this.onPresetChanged}>
              ${this.presets.map(
                (preset) => html`
                  <option value=${preset} ?selected=${this.preset === preset}>${preset}</option>
                `,
              )}
            </select>
          </label>

          <label>
            Palette count <span class="value">${this.paletteCount}</span>
            <input
              type="range"
              min="2"
              max="16"
              step="1"
              .value=${String(this.paletteCount)}
              @input=${this.onPaletteCountChanged}
            />
          </label>

          <label>
            Animation speed <span class="value">${this.animationSpeed.toFixed(2)}</span>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.01"
              .value=${String(this.animationSpeed)}
              @input=${this.onAnimationSpeedChanged}
            />
          </label>

          <label>
            Seed <span class="value">${this.seed}</span>
            <input
              type="number"
              .value=${String(this.seed)}
              @input=${this.onSeedChanged}
            />
          </label>

          <button type="button" @click=${this.randomizeSeed}>Randomize colors</button>

          <p class="note">
            The manager applies CSS variables and a typed colorMangmentScheme property to each slotted BaseGameObject.
          </p>
        </aside>

        <section class="preview">
          <h2>Slotted BaseGameObject previews</h2>

          <color-mangment
            .mode=${this.mode}
            .preset=${this.preset}
            .seed=${this.seed}
            .paletteCount=${this.paletteCount}
            .animationSpeed=${this.animationSpeed}
          >
            <div class="preview-grid">
              <color-mangment-preview-game-object
                .positionX=${90}
                .positionY=${60}
              ></color-mangment-preview-game-object>

              <color-mangment-preview-game-object
                .positionX=${90}
                .positionY=${60}
              ></color-mangment-preview-game-object>

              <color-mangment-preview-game-object
                .positionX=${90}
                .positionY=${60}
              ></color-mangment-preview-game-object>
            </div>
          </color-mangment>
        </section>
      </section>
    `;
  }

  private readonly onModeChanged = (event: Event): void => {
    const value = this.readSelectValue(event);

    if (!this.isMode(value)) {
      return;
    }

    this.mode = value;
  };

  private readonly onPresetChanged = (event: Event): void => {
    const value = this.readSelectValue(event);

    if (!this.isPreset(value)) {
      return;
    }

    this.preset = value;
  };

  private readonly onPaletteCountChanged = (event: Event): void => {
    this.paletteCount = this.clampInteger(this.readInputNumber(event), 2, 16);
  };

  private readonly onAnimationSpeedChanged = (event: Event): void => {
    this.animationSpeed = this.clampNumber(this.readInputNumber(event), 0, 0.5);
  };

  private readonly onSeedChanged = (event: Event): void => {
    this.seed = this.clampInteger(this.readInputNumber(event), 0, 2147483647);
  };

  private readonly randomizeSeed = (): void => {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);

    this.seed = values[0] ?? 92831;
    this.mode = ColorMangmentMode.RandomPalette;
  };

  private readSelectValue(event: Event): string {
    const target = event.currentTarget;

    if (!(target instanceof HTMLSelectElement)) {
      throw new TypeError("Expected HTMLSelectElement.");
    }

    return target.value;
  }

  private readInputNumber(event: Event): number {
    const target = event.currentTarget;

    if (!(target instanceof HTMLInputElement)) {
      throw new TypeError("Expected HTMLInputElement.");
    }

    if (!Number.isFinite(target.valueAsNumber)) {
      throw new RangeError("Input value must be finite.");
    }

    return target.valueAsNumber;
  }

  private isMode(value: string): value is ColorMangmentModeValue {
    return this.modes.includes(value as ColorMangmentModeValue);
  }

  private isPreset(value: string): value is ColorMangmentPresetNameValue {
    return this.presets.includes(value as ColorMangmentPresetNameValue);
  }

  private clampInteger(value: number, min: number, max: number): number {
    return Math.round(this.clampNumber(value, min, max));
  }

  private clampNumber(value: number, min: number, max: number): number {
    if (!Number.isFinite(value)) {
      throw new RangeError("Value must be finite.");
    }

    return Math.min(max, Math.max(min, value));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "view-color-mangment-demo": ViewColorMangmentDemo;
  }
}