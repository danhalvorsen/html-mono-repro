import { LitElement, css, html, type TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import "@monorepo/game-objects";
import {
  DefaultVectorFieldGameObjectOptions,
  type VectorFieldGameObjectOptions,
} from "@monorepo/game-objects";

interface RangeControlDefinition {
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly onInput: (value: number) => void;
  readonly formatValue?: (value: number) => string;
}

@customElement("view-vector-field-game-object-demo")
export class ViewVectorFieldGameObjectDemo extends LitElement {
  public static override styles = css`
    :host {
      display: block;
    }

    .layout {
      display: grid;
      grid-template-columns: minmax(260px, 320px) minmax(0, 1fr);
      gap: 16px;
      align-items: start;
    }

    .controls,
    .preview {
      border: 1px solid #2a3042;
      border-radius: 12px;
      background: #121523;
    }

    .controls {
      padding: 14px;
    }

    .preview {
      overflow: hidden;
      background: #000;
    }

    h2 {
      margin: 0 0 12px 0;
      font-size: 16px;
      color: #bdc8f4;
    }

    .control {
      display: grid;
      gap: 6px;
      margin-block-end: 12px;
    }

    .control-header {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      font-size: 12px;
      color: #d7ddff;
    }

    .value {
      color: #8fa2ff;
      font-variant-numeric: tabular-nums;
    }

    input[type="range"] {
      width: 100%;
    }

    button {
      width: 100%;
      border: 1px solid #3c4669;
      border-radius: 8px;
      background: #1b2136;
      color: #d7ddff;
      padding: 8px 10px;
      cursor: pointer;
    }

    button:hover {
      background: #242c48;
    }

    vector-field-game-object {
      display: block;
      width: 100%;
      min-height: 300px;
    }
  `;

  @state()
  private vectorFieldOptions: VectorFieldGameObjectOptions =
    DefaultVectorFieldGameObjectOptions;

  protected override render(): TemplateResult {
    const bounds = this.vectorFieldOptions.bounds;

    return html`
      <section class="layout">
        <aside class="controls">
          <h2>Vector Field Controls</h2>

          ${this.renderRangeControl({
            label: "Line count",
            value: this.vectorFieldOptions.lineCount,
            min: 20,
            max: this.vectorFieldOptions.maxSeedCount,
            step: 1,
            onInput: value => this.updateLineCount(value),
          })}

          ${this.renderRangeControl({
            label: "Animation speed",
            value: this.vectorFieldOptions.animationSpeed,
            min: 0,
            max: 4,
            step: 0.05,
            onInput: value => this.updateAnimationSpeed(value),
            formatValue: value => value.toFixed(2),
          })}

          ${this.renderRangeControl({
            label: "Noise scale",
            value: this.vectorFieldOptions.noise.scale,
            min: 0.001,
            max: 0.012,
            step: 0.0005,
            onInput: value => this.updateNoiseScale(value),
            formatValue: value => value.toFixed(4),
          })}

          ${this.renderRangeControl({
            label: "Noise time scale",
            value: this.vectorFieldOptions.noise.timeScale,
            min: 0,
            max: 0.8,
            step: 0.01,
            onInput: value => this.updateNoiseTimeScale(value),
            formatValue: value => value.toFixed(2),
          })}

          ${this.renderRangeControl({
            label: "Derivative step",
            value: this.vectorFieldOptions.noise.derivativeStep,
            min: 0.005,
            max: 0.08,
            step: 0.001,
            onInput: value => this.updateDerivativeStep(value),
            formatValue: value => value.toFixed(3),
          })}

          ${this.renderRangeControl({
            label: "Path step length",
            value: this.vectorFieldOptions.path.stepLength,
            min: 1,
            max: 12,
            step: 0.25,
            onInput: value => this.updatePathStepLength(value),
            formatValue: value => value.toFixed(2),
          })}

          ${this.renderRangeControl({
            label: "Path steps",
            value: this.vectorFieldOptions.path.steps,
            min: 10,
            max: 180,
            step: 1,
            onInput: value => this.updatePathSteps(value),
          })}

          ${this.renderRangeControl({
            label: "Min stroke width",
            value: this.vectorFieldOptions.stroke.minWidth,
            min: 1,
            max: 18,
            step: 0.5,
            onInput: value => this.updateMinStrokeWidth(value),
            formatValue: value => value.toFixed(1),
          })}

          ${this.renderRangeControl({
            label: "Max stroke width",
            value: this.vectorFieldOptions.stroke.maxWidth,
            min: 2,
            max: 28,
            step: 0.5,
            onInput: value => this.updateMaxStrokeWidth(value),
            formatValue: value => value.toFixed(1),
          })}

          ${this.renderRangeControl({
            label: "Blur",
            value: this.vectorFieldOptions.stroke.blurStdDeviation,
            min: 0,
            max: 3,
            step: 0.05,
            onInput: value => this.updateBlur(value),
            formatValue: value => value.toFixed(2),
          })}

          <button type="button" @click=${this.resetOptions}>Reset</button>
        </aside>

        <section class="preview">
          <vector-field-game-object
            .positionX=${bounds.width / 2}
            .positionY=${bounds.height / 2}
            .vectorFieldOptions=${this.vectorFieldOptions}
          ></vector-field-game-object>
        </section>
      </section>
    `;
  }

  private renderRangeControl(definition: RangeControlDefinition): TemplateResult {
    const valueText = definition.formatValue?.(definition.value) ?? String(definition.value);

    return html`
      <label class="control">
        <span class="control-header">
          <span>${definition.label}</span>
          <span class="value">${valueText}</span>
        </span>

        <input
          type="range"
          .value=${String(definition.value)}
          min=${definition.min}
          max=${definition.max}
          step=${definition.step}
          @input=${(event: Event) => definition.onInput(this.readRangeValue(event))}
        />
      </label>
    `;
  }

  private updateLineCount(value: number): void {
    this.updateOptions(current => ({
      ...current,
      lineCount: this.clampInteger(value, 20, current.maxSeedCount),
    }));
  }

  private updateAnimationSpeed(value: number): void {
    this.updateOptions(current => ({
      ...current,
      animationSpeed: this.clampNumber(value, 0, 4),
    }));
  }

  private updateNoiseScale(value: number): void {
    this.updateOptions(current => ({
      ...current,
      noise: {
        ...current.noise,
        scale: this.clampNumber(value, 0.001, 0.012),
      },
    }));
  }

  private updateNoiseTimeScale(value: number): void {
    this.updateOptions(current => ({
      ...current,
      noise: {
        ...current.noise,
        timeScale: this.clampNumber(value, 0, 0.8),
      },
    }));
  }

  private updateDerivativeStep(value: number): void {
    this.updateOptions(current => ({
      ...current,
      noise: {
        ...current.noise,
        derivativeStep: this.clampNumber(value, 0.005, 0.08),
      },
    }));
  }

  private updatePathStepLength(value: number): void {
    this.updateOptions(current => ({
      ...current,
      path: {
        ...current.path,
        stepLength: this.clampNumber(value, 1, 12),
      },
    }));
  }

  private updatePathSteps(value: number): void {
    this.updateOptions(current => ({
      ...current,
      path: {
        ...current.path,
        steps: this.clampInteger(value, 10, 180),
      },
    }));
  }

  private updateMinStrokeWidth(value: number): void {
    this.updateOptions(current => {
      const minWidth = this.clampNumber(value, 1, 18);

      return {
        ...current,
        stroke: {
          ...current.stroke,
          minWidth,
          maxWidth: Math.max(minWidth, current.stroke.maxWidth),
        },
      };
    });
  }

  private updateMaxStrokeWidth(value: number): void {
    this.updateOptions(current => {
      const maxWidth = this.clampNumber(value, 2, 28);

      return {
        ...current,
        stroke: {
          ...current.stroke,
          minWidth: Math.min(current.stroke.minWidth, maxWidth),
          maxWidth,
        },
      };
    });
  }

  private updateBlur(value: number): void {
    this.updateOptions(current => ({
      ...current,
      stroke: {
        ...current.stroke,
        blurStdDeviation: this.clampNumber(value, 0, 3),
      },
    }));
  }

  private readonly resetOptions = (): void => {
    this.vectorFieldOptions = DefaultVectorFieldGameObjectOptions;
  };

  private updateOptions(
    update: (current: VectorFieldGameObjectOptions) => VectorFieldGameObjectOptions,
  ): void {
    this.vectorFieldOptions = update(this.vectorFieldOptions);
  }

  private readRangeValue(event: Event): number {
    const target = event.currentTarget;

    if (!(target instanceof HTMLInputElement)) {
      throw new TypeError("Range input event did not originate from an HTMLInputElement.");
    }

    if (!Number.isFinite(target.valueAsNumber)) {
      throw new RangeError("Range input value must be finite.");
    }

    return target.valueAsNumber;
  }

  private clampInteger(value: number, min: number, max: number): number {
    return Math.round(this.clampNumber(value, min, max));
  }

  private clampNumber(value: number, min: number, max: number): number {
    if (!Number.isFinite(value)) {
      throw new RangeError("Control value must be finite.");
    }

    return Math.min(max, Math.max(min, value));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "view-vector-field-game-object-demo": ViewVectorFieldGameObjectDemo;
  }
}