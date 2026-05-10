import {
  Color,
  HslColor,
  HslToRgbColorConverter,
  type INewColorInterpolator,
} from "@monorepo/core-math-colors";
import { LitElement, css, html, type PropertyValues, type TemplateResult } from "lit";
import {
  customElement,
  property,
  queryAssignedElements,
} from "lit/decorators.js";
import { BaseGameObject } from "../GameObjects/BaseGameObject.js";
import { ColorMangmentColorSourceFactory } from "./ColorMangmentColorSourceFactory.js";
import { ColorMangmentEventName } from "./ColorMangmentEventName.js";
import { ColorMangmentMode, type ColorMangmentModeValue } from "./ColorMangmentMode.js";
import { ColorMangmentPresetName, type ColorMangmentPresetNameValue } from "./ColorMangmentPresetName.js";
import type {
  ColorMangmentGradientStop,
  ColorMangmentScheme,
  ColorMangmentTargetElement,
} from "./ColorMangmentTypes.js";

@customElement("color-mangment")
export class ColorMangment extends LitElement {
  public static override styles = css`
    :host {
      display: block;
    }

    .slot {
      display: grid;
      gap: 14px;
    }

    ::slotted(base-game-object),
    ::slotted(color-mangment-preview-game-object),
    ::slotted(vector-field-game-object) {
      display: block;
    }
  `;

  @property({ type: String })
  public mode: ColorMangmentModeValue = ColorMangmentMode.Gradient;

  @property({ type: String })
  public preset: ColorMangmentPresetNameValue = ColorMangmentPresetName.NeonFlow;

  @property({ type: Number })
  public seed = 92831;

  @property({ type: Number })
  public paletteCount = 6;

  @property({ type: Number })
  public animationSpeed = 0;

  @queryAssignedElements({ flatten: true })
  private assignedElements!: Element[];

  readonly #sourceFactory = new ColorMangmentColorSourceFactory();
  readonly #converter = new HslToRgbColorConverter();

  #source: INewColorInterpolator<HslColor> | null = null;
  #sourceKey = "";
  #animationFrameId: number | null = null;
  #previousTimestamp: number | null = null;
  #timeSeconds = 0;

  public override connectedCallback(): void {
    super.connectedCallback();
    this.#syncAnimation();
  }

  public override disconnectedCallback(): void {
    this.#stopAnimation();
    super.disconnectedCallback();
  }

  protected override updated(changedProperties: PropertyValues<this>): void {
    super.updated(changedProperties);

    if (
      changedProperties.has("mode") ||
      changedProperties.has("preset") ||
      changedProperties.has("seed") ||
      changedProperties.has("paletteCount")
    ) {
      this.#rebuildColorSource();
    }

    this.#syncAnimation();
    this.#applyColorsToTargets();
  }

  protected override render(): TemplateResult {
    return html`
      <div class="slot">
        <slot @slotchange=${this.#onSlotChanged}></slot>
      </div>
    `;
  }

  readonly #onSlotChanged = (): void => {
    this.#applyColorsToTargets();
  };

  #applyColorsToTargets(): void {
    const source = this.#getColorSource();
    const targets = this.#getTargets();
    const count = targets.length;

    for (let index = 0; index < count; index += 1) {
      const target = targets[index];

      if (target === undefined) {
        continue;
      }

      const position = count <= 1
        ? 0
        : ColorMangment.wrap01(index / (count - 1) + this.#timeSeconds * this.animationSpeed);

      const scheme = this.#createScheme(source, position, index, count);
      this.#applyScheme(target, scheme);
    }
  }

  #getTargets(): readonly ColorMangmentTargetElement[] {
    const targets: ColorMangmentTargetElement[] = [];

    for (const assignedElement of this.assignedElements) {
      this.#collectTargets(assignedElement, targets);
    }

    return targets;
  }

  #collectTargets(
    element: Element,
    targets: ColorMangmentTargetElement[],
  ): void {
    if (element instanceof BaseGameObject) {
      targets.push(element as ColorMangmentTargetElement);
      return;
    }

    const descendants = element.querySelectorAll("*");

    for (const descendant of descendants) {
      if (descendant instanceof BaseGameObject) {
        targets.push(descendant as ColorMangmentTargetElement);
      }
    }
  }

  #applyScheme(
    target: ColorMangmentTargetElement,
    scheme: ColorMangmentScheme,
  ): void {
    target.colorMangmentScheme = scheme;

    target.style.setProperty("--color-mangment-primary", scheme.primary.toCssRgba());
    target.style.setProperty("--color-mangment-secondary", scheme.secondary.toCssRgba());
    target.style.setProperty("--color-mangment-accent", scheme.accent.toCssRgba());
    target.style.setProperty("--color-mangment-gradient-css", scheme.cssLinearGradient);

    const first = scheme.gradientStops[0];
    const second = scheme.gradientStops[1];
    const third = scheme.gradientStops[2];

    if (first !== undefined) {
      target.style.setProperty("--color-mangment-gradient-0", first.color.toCssRgba());
    }

    if (second !== undefined) {
      target.style.setProperty("--color-mangment-gradient-1", second.color.toCssRgba());
    }

    if (third !== undefined) {
      target.style.setProperty("--color-mangment-gradient-2", third.color.toCssRgba());
    }

    target.dispatchEvent(
      new CustomEvent<ColorMangmentScheme>(ColorMangmentEventName.Changed, {
        detail: scheme,
        bubbles: false,
        composed: false,
      }),
    );
  }

  #createScheme(
    source: INewColorInterpolator<HslColor>,
    position: number,
    index: number,
    count: number,
  ): ColorMangmentScheme {
    const primary = this.#toRgb(source.sample(position));
    const secondary = this.#toRgb(source.sample(ColorMangment.wrap01(position + 0.16)));
    const accent = this.#toRgb(source.sample(ColorMangment.wrap01(position + 0.5)));

    const gradientStops: readonly ColorMangmentGradientStop[] = Object.freeze([
      { position: 0, color: primary },
      { position: 0.52, color: secondary },
      { position: 1, color: accent },
    ]);

    return {
      index,
      count,
      primary,
      secondary,
      accent,
      gradientStops,
      cssLinearGradient: ColorMangment.toLinearGradient(gradientStops),
    };
  }

  #toRgb(color: HslColor): Color {
    return this.#converter.convert(color);
  }

  #getColorSource(): INewColorInterpolator<HslColor> {
    const key = this.#createSourceKey();

    if (this.#source !== null && this.#sourceKey === key) {
      return this.#source;
    }

    this.#source = this.#sourceFactory.create({
      mode: this.mode,
      preset: this.preset,
      seed: this.seed,
      paletteCount: this.paletteCount,
    });

    this.#sourceKey = key;
    return this.#source;
  }

  #rebuildColorSource(): void {
    this.#source = null;
    this.#sourceKey = "";
  }

  #createSourceKey(): string {
    return JSON.stringify({
      mode: this.mode,
      preset: this.preset,
      seed: this.seed,
      paletteCount: this.paletteCount,
    });
  }

  #syncAnimation(): void {
    if (this.animationSpeed > 0) {
      this.#startAnimation();
      return;
    }

    this.#stopAnimation();
  }

  #startAnimation(): void {
    if (this.#animationFrameId !== null) {
      return;
    }

    const tick = (timestamp: number): void => {
      if (this.#previousTimestamp === null) {
        this.#previousTimestamp = timestamp;
      }

      const deltaSeconds = Math.min((timestamp - this.#previousTimestamp) / 1000, 0.05);
      this.#previousTimestamp = timestamp;
      this.#timeSeconds += deltaSeconds;

      this.#applyColorsToTargets();
      this.#animationFrameId = requestAnimationFrame(tick);
    };

    this.#animationFrameId = requestAnimationFrame(tick);
  }

  #stopAnimation(): void {
    if (this.#animationFrameId === null) {
      return;
    }

    cancelAnimationFrame(this.#animationFrameId);
    this.#animationFrameId = null;
    this.#previousTimestamp = null;
  }

  private static toLinearGradient(
    stops: readonly ColorMangmentGradientStop[],
  ): string {
    return `linear-gradient(135deg, ${stops
      .map((stop) => `${stop.color.toCssRgba()} ${Math.round(stop.position * 100)}%`)
      .join(", ")})`;
  }

  private static wrap01(value: number): number {
    return value - Math.floor(value);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "color-mangment": ColorMangment;
  }
}