import { LitElement, css, html, type TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import "@monorepo/core-design-composite";
import "@monorepo/game-objects";
import {
  ColorThemePreset,
  type ColorThemePreset as ColorThemePresetValue,
} from "../../ColorManagement/ColorThemePreset.js";
import {
  createRangeControls,
  DefaultVectorFieldContextThemeApplier,
  DefaultVectorFieldViewFsmFactory,
  type NumericTransitionType,
  type VectorFieldRangeControlDefinition,
  type VectorFieldViewContext,
  type VectorFieldViewTransitionInput,
  type VectorFieldViewTransitionOutput,
  VectorFieldTransitionType,
} from "./vector-field-game-object-demo-fsm-model.js";

interface UIInputRangeChangeDetail {
  readonly value: number;
}

interface UIInputSelectChangeDetail {
  readonly value: string | null;
}

@customElement("view-vector-field-game-object-demo-fsm")
export class ViewVectorFieldGameObjectDemoFsm extends LitElement {
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
      margin-block-end: 12px;
    }

    .control ui-input-range {
      --ui-text-1: #d7ddff;
      --ui-text-2: #8fa2ff;
      --ui-border-strong: #3c4669;
      --ui-bg-surface: #1b2136;
    }

    .theme-row {
      display: grid;
      gap: 8px;
      margin-block-end: 12px;
    }

    .theme-row ui-input-select {
      --ui-border-strong: #3c4669;
      --ui-bg-surface: #1b2136;
      --ui-text-1: #d7ddff;
    }

    .button {
      display: block;
      width: 100%;
      margin-block-end: 8px;
      --ui-primary: #1d2740;
      --ui-border-strong: #3c4669;
      --ui-text-1: #d7ddff;
      --ui-bg-elevated: #1b2136;
    }

    vector-field-game-object {
      display: block;
      width: 100%;
      min-height: 300px;
    }

    .snapshot {
      margin: 8px 0 0 0;
      border-radius: 8px;
      padding: 10px;
      background: #0b1020;
      color: #bfd0ff;
      font: 12px/1.45 ui-monospace, SFMono-Regular, Consolas, monospace;
      overflow: auto;
    }
  `;

  private readonly fsm = new DefaultVectorFieldViewFsmFactory(
    new DefaultVectorFieldContextThemeApplier(),
  ).create();

  @state()
  private context: VectorFieldViewContext = this.fsm.context;

  @state()
  private lastOutput: VectorFieldViewTransitionOutput | null = null;

  private readonly themePresets: readonly ColorThemePresetValue[] = Object.freeze([
    ColorThemePreset.aurora,
    ColorThemePreset.ember,
    ColorThemePreset.ocean,
    ColorThemePreset.mono,
    ColorThemePreset.random,
  ]);

  protected override render(): TemplateResult {
    const fooState = this.context.foo;
    const foo = fooState.options;
    const bounds = foo.bounds;
    const controls = createRangeControls(foo);

    return html`
      <section class="layout">
        <aside class="controls">
          <h2>Vector Field (Foo/Bla + FSM)</h2>

          <div class="theme-row">
            <ui-label>Theme preset (Bla)</ui-label>
            <ui-input-select
              .options=${[...this.themePresets]}
              .value=${this.context.bla.themePreset}
              @ui-change=${this.onThemePresetChanged}
            ></ui-input-select>
          </div>

          <ui-button class="button" variant="secondary" @ui-click=${this.randomizeTheme}>
            Randomize theme seed
          </ui-button>

          ${controls.map((control) => this.renderRangeControl(control))}

          <ui-button class="button" variant="secondary" @ui-click=${this.reset}>
            Reset
          </ui-button>

          <pre class="snapshot">${JSON.stringify(this.createSnapshot(), null, 2)}</pre>
        </aside>

        <section class="preview">
          <vector-field-game-object
            .positionX=${bounds.width / 2}
            .positionY=${bounds.height / 2}
            .vectorFieldOptions=${foo}
          ></vector-field-game-object>
        </section>
      </section>
    `;
  }

  private renderRangeControl(definition: VectorFieldRangeControlDefinition): TemplateResult {
    return html`
      <div class="control">
        <ui-input-range
          data-transition-type=${definition.transitionType}
          .label=${definition.label}
          .min=${definition.min}
          .max=${definition.max}
          .step=${definition.step}
          .value=${definition.value}
          @ui-change=${this.onRangeChanged}
        ></ui-input-range>
      </div>
    `;
  }

  private readonly onRangeChanged = (event: Event): void => {
    const source = event.currentTarget;

    if (!(source instanceof HTMLElement)) {
      throw new TypeError("Range event source must be an HTMLElement.");
    }

    const transitionType = source.dataset.transitionType as NumericTransitionType | undefined;
    if (transitionType === undefined) {
      return;
    }

    const customEvent = event as CustomEvent<UIInputRangeChangeDetail>;
    const value = customEvent.detail?.value;

    if (!Number.isFinite(value)) {
      return;
    }

    void this.dispatch({
      type: transitionType,
      payload: value,
    });
  };

  private readonly onThemePresetChanged = (event: Event): void => {
    const customEvent = event as CustomEvent<UIInputSelectChangeDetail>;
    const value = customEvent.detail?.value as ColorThemePresetValue | null;

    if (value === null) {
      return;
    }

    if (!this.themePresets.includes(value)) {
      return;
    }

    void this.dispatch({
      type: VectorFieldTransitionType.SetThemePreset,
      payload: value,
    });
  };

  private readonly randomizeTheme = (): void => {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    const seed = values[0] ?? 0;

    void this.dispatch({
      type: VectorFieldTransitionType.RandomizeTheme,
      payload: seed,
    });
  };

  private readonly reset = (): void => {
    void this.dispatch({
      type: VectorFieldTransitionType.Reset,
      payload: null,
    });
  };

  private async dispatch(input: VectorFieldViewTransitionInput): Promise<void> {
    const result = await this.fsm.dispatch(input);
    this.context = this.fsm.context;
    this.lastOutput = result.outputs[0] ?? null;
  }

  private createSnapshot(): Readonly<Record<string, unknown>> {
    return {
      state: this.fsm.state,
      themePreset: this.context.bla.themePreset,
      themeSeed: this.context.bla.seed,
      lineCount: this.context.foo.options.lineCount,
      lastOutput: this.lastOutput,
    };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "view-vector-field-game-object-demo-fsm": ViewVectorFieldGameObjectDemoFsm;
  }
}
