# FILE: create-color-management.ps1
# RUN FROM:
# C:\Users\danha\source\repos\HTML\MonoRepro\Applications\game\game-scroller

param(
    [switch] $Build
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$moduleRoot = (Get-Location).Path

if (-not (Test-Path (Join-Path $moduleRoot "package.json"))) {
    throw "Run this script from the module root."
}

function Write-SourceFile {
    param(
        [Parameter(Mandatory = $true)]
        [string] $RelativePath,

        [Parameter(Mandatory = $true)]
        [string] $Content
    )

    $path = Join-Path $moduleRoot $RelativePath
    $directory = Split-Path -Parent $path

    New-Item -ItemType Directory -Force -Path $directory | Out-Null

    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($path, $Content, $utf8NoBom)

    Write-Host "Wrote: $RelativePath"
}

Write-SourceFile "src/ColorManagement/IColorManagedGameObject.ts" @'
export interface GameObjectColorStop {
  readonly position: number;
  readonly colorCss: string;
}

export interface GameObjectColorTheme {
  readonly name: string;
  readonly backgroundCss: string;
  readonly foregroundCss: string;
  readonly accentCss: string;
  readonly shadowCss: string;
  readonly opacity: number;
  readonly gradientStops: readonly GameObjectColorStop[];
  readonly paletteCss: readonly string[];
}

export interface IColorManagedGameObject {
  applyColorTheme(theme: GameObjectColorTheme): void;
}
'@

Write-SourceFile "src/ColorManagement/ColorThemePreset.ts" @'
export const ColorThemePreset = {
  aurora: "aurora",
  ember: "ember",
  ocean: "ocean",
  mono: "mono",
  random: "random",
} as const;

export type ColorThemePreset = typeof ColorThemePreset[keyof typeof ColorThemePreset];
'@

Write-SourceFile "src/ColorManagement/ColorThemeFactory.ts" @'
import { Color, HslColor } from "@monorepo/core-math-colors";
import { HslToRgbColorConverter } from "@monorepo/core-math-colors";
import type { GameObjectColorStop, GameObjectColorTheme } from "./IColorManagedGameObject.js";
import type { ColorThemePreset } from "./ColorThemePreset.js";

export interface IColorThemeFactory {
  create(preset: ColorThemePreset, seed: number): GameObjectColorTheme;
}

export class ColorThemeFactory implements IColorThemeFactory {
  readonly #converter = new HslToRgbColorConverter();

  public create(preset: ColorThemePreset, seed: number): GameObjectColorTheme {
    switch (preset) {
      case "aurora":
        return this.createFixed(
          "aurora",
          "#06131A",
          [
            this.stop(0.00, 0.53, 0.90, 0.62),
            this.stop(0.35, 0.61, 0.88, 0.60),
            this.stop(0.70, 0.78, 0.86, 0.62),
            this.stop(1.00, 0.92, 0.92, 0.64),
          ],
          0.95,
        );

      case "ember":
        return this.createFixed(
          "ember",
          "#120909",
          [
            this.stop(0.00, 0.02, 0.92, 0.56),
            this.stop(0.40, 0.08, 0.95, 0.56),
            this.stop(0.75, 0.13, 0.96, 0.62),
            this.stop(1.00, 0.18, 1.00, 0.72),
          ],
          0.96,
        );

      case "ocean":
        return this.createFixed(
          "ocean",
          "#071018",
          [
            this.stop(0.00, 0.50, 0.88, 0.54),
            this.stop(0.30, 0.57, 0.86, 0.52),
            this.stop(0.65, 0.63, 0.84, 0.56),
            this.stop(1.00, 0.71, 0.82, 0.60),
          ],
          0.94,
        );

      case "mono":
        return this.createFixed(
          "mono",
          "#000000",
          [
            this.stop(0.00, 0.00, 0.00, 0.10),
            this.stop(0.20, 0.00, 0.00, 0.28),
            this.stop(0.75, 0.00, 0.00, 0.85),
            this.stop(1.00, 0.00, 0.00, 1.00),
          ],
          0.96,
        );

      case "random":
        return this.createRandom(seed);
    }
  }

  private createFixed(
    name: string,
    backgroundCss: string,
    stops: readonly GameObjectColorStop[],
    opacity: number,
  ): GameObjectColorTheme {
    const paletteCss = stops.map(stop => stop.colorCss);
    const foregroundCss = paletteCss[paletteCss.length - 1] ?? "#ffffff";
    const accentCss = paletteCss[Math.floor(paletteCss.length / 2)] ?? foregroundCss;
    const shadowCss = Color.fromHex(backgroundCss).toCssRgba();

    return {
      name,
      backgroundCss,
      foregroundCss,
      accentCss,
      shadowCss,
      opacity,
      gradientStops: stops,
      paletteCss,
    };
  }

  private createRandom(seed: number): GameObjectColorTheme {
    let state = seed >>> 0;

    const random = (): number => {
      state = (1664525 * state + 1013904223) >>> 0;
      return state / 0x100000000;
    };

    const baseHue = random();
    const hueStep = 0.12 + (random() * 0.16);

    const stops = [
      this.stop(0.00, baseHue, 0.85, 0.45 + random() * 0.12),
      this.stop(0.33, (baseHue + hueStep) % 1, 0.88, 0.50 + random() * 0.12),
      this.stop(0.66, (baseHue + (hueStep * 2)) % 1, 0.90, 0.58 + random() * 0.10),
      this.stop(1.00, (baseHue + (hueStep * 3)) % 1, 0.92, 0.66 + random() * 0.08),
    ] as const;

    const background = this.#converter
      .convert(HslColor.fromNormalized(baseHue, 0.45, 0.08, 1))
      .toHexRgb();

    return this.createFixed("random", background, stops, 0.95);
  }

  private stop(position: number, hue: number, saturation: number, lightness: number): GameObjectColorStop {
    const colorCss = this.#converter
      .convert(HslColor.fromNormalized(hue, saturation, lightness, 1))
      .toCssRgba();

    return {
      position,
      colorCss,
    };
  }
}
'@

Write-SourceFile "src/ColorManagement/SlotColorDistributor.ts" @'
import type { GameObjectColorTheme, IColorManagedGameObject } from "./IColorManagedGameObject.js";

export interface ISlotColorDistributor {
  apply(host: HTMLElement, theme: GameObjectColorTheme): void;
}

function isColorManagedGameObject(value: Element): value is Element & IColorManagedGameObject {
  const candidate = value as Partial<IColorManagedGameObject>;
  return typeof candidate.applyColorTheme === "function";
}

export class SlotColorDistributor implements ISlotColorDistributor {
  public apply(host: HTMLElement, theme: GameObjectColorTheme): void {
    const slot = host.shadowRoot?.querySelector("slot");

    if (!(slot instanceof HTMLSlotElement)) {
      return;
    }

    const elements = slot.assignedElements({ flatten: true });

    for (const element of elements) {
      if (!isColorManagedGameObject(element)) {
        continue;
      }

      element.applyColorTheme(theme);
    }
  }
}
'@

Write-SourceFile "src/ColorManagement/ColorManagement.ts" @'
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
'@

Write-SourceFile "src/ColorManagement/index.ts" @'
export * from "./IColorManagedGameObject.js";
export * from "./ColorThemePreset.js";
export * from "./ColorThemeFactory.js";
export * from "./SlotColorDistributor.js";
export * from "./ColorManagement.js";
'@

Write-SourceFile "src/GameObjects/VectorFieldGameObjectColorThemeAdapter.ts" @'
import type { GameObjectColorTheme, IColorManagedGameObject } from "../ColorManagement/IColorManagedGameObject.js";
import type { VectorFieldGameObjectOptions } from "./VectorFieldGameObjectOptions.js";

export interface IVectorFieldColorThemeTarget extends IColorManagedGameObject {
  vectorFieldOptions: VectorFieldGameObjectOptions;
}

export class VectorFieldGameObjectColorThemeAdapter {
  public apply(target: IVectorFieldColorThemeTarget, theme: GameObjectColorTheme): void {
    const palette = theme.paletteCss;
    const foreground = palette[palette.length - 1] ?? theme.foregroundCss;
    const shadow = palette[0] ?? theme.shadowCss;

    target.vectorFieldOptions = {
      ...target.vectorFieldOptions,
      stroke: {
        ...target.vectorFieldOptions.stroke,
        background: theme.backgroundCss,
        foreground,
        shadow,
        foregroundOpacity: theme.opacity,
        shadowOpacity: Math.max(0, theme.opacity - 0.1),
      },
    };
  }
}
'@

Write-SourceFile "src/views/view-color-management-demo.ts" @'
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import "../ColorManagement/ColorManagement.js";
import "../GameObjects/VectorFieldGameObject.js";

@customElement("view-color-management-demo")
export class ViewColorManagementDemo extends LitElement {
  protected override render() {
    return html`
      <color-management preset="aurora">
        <vector-field-game-object
          .positionX=${750}
          .positionY=${150}
        ></vector-field-game-object>
      </color-management>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "view-color-management-demo": ViewColorManagementDemo;
  }
}
'@

if ($Build.IsPresent) {
    pnpm build
}