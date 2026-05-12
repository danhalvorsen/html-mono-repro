// Applications/audio/simple-web-audio/vite-project/src/UI/Slider/SliderElement.ts

import {
  Specification,
  ValidationResult,
  type ISpecification,
  type IValidator,
} from "@monorepo/core-specifications";
import { css, html, LitElement, type CSSResultGroup } from "lit";
import { customElement, property } from "lit/decorators.js";

export const SliderEventName = {
  Changed: "slider-changed",
} as const;

export type SliderChangedEvent = CustomEvent<{
  readonly id: string;
  readonly value: number;
}>;

type SliderComponentId = Readonly<{
  readonly id: string;
  readonly label: string;
}>;

type SliderInterval = Readonly<{
  readonly min: number;
  readonly max: number;
}>;

type SliderDefinition = Readonly<{
  readonly componentId: SliderComponentId;
  readonly interval: SliderInterval;
  readonly step: number;
  readonly value: number;
}>;

class NonEmptyStringSpecification extends Specification<string> {
  public override isSatisfiedBy(candidate: string): boolean {
    return candidate.trim().length > 0;
  }
}

class FiniteNumberSpecification extends Specification<number> {
  public override isSatisfiedBy(candidate: number): boolean {
    return Number.isFinite(candidate);
  }
}

class PositiveNumberSpecification extends Specification<number> {
  public override isSatisfiedBy(candidate: number): boolean {
    return Number.isFinite(candidate) && candidate > 0;
  }
}

class ValidIntervalSpecification extends Specification<SliderInterval> {
  public override isSatisfiedBy(candidate: SliderInterval): boolean {
    return (
      Number.isFinite(candidate.min) &&
      Number.isFinite(candidate.max) &&
      candidate.min < candidate.max
    );
  }
}

class ValueInsideIntervalSpecification extends Specification<SliderDefinition> {
  public override isSatisfiedBy(candidate: SliderDefinition): boolean {
    return (
      candidate.value >= candidate.interval.min &&
      candidate.value <= candidate.interval.max
    );
  }
}

class SliderDefinitionValidator implements IValidator<SliderDefinition> {
  readonly #nonEmptyString: ISpecification<string>;
  readonly #finiteNumber: ISpecification<number>;
  readonly #positiveNumber: ISpecification<number>;
  readonly #validInterval: ISpecification<SliderInterval>;
  readonly #valueInsideInterval: ISpecification<SliderDefinition>;

  public constructor(
    nonEmptyString: ISpecification<string> = new NonEmptyStringSpecification(),
    finiteNumber: ISpecification<number> = new FiniteNumberSpecification(),
    positiveNumber: ISpecification<number> = new PositiveNumberSpecification(),
    validInterval: ISpecification<SliderInterval> = new ValidIntervalSpecification(),
    valueInsideInterval: ISpecification<SliderDefinition> = new ValueInsideIntervalSpecification(),
  ) {
    this.#nonEmptyString = nonEmptyString;
    this.#finiteNumber = finiteNumber;
    this.#positiveNumber = positiveNumber;
    this.#validInterval = validInterval;
    this.#valueInsideInterval = valueInsideInterval;
  }

  public validate(model: SliderDefinition): ValidationResult {
    return ValidationResult.ok()
      .merge(this.#check(this.#nonEmptyString, model.componentId.id, "Slider id is required."))
      .merge(this.#check(this.#nonEmptyString, model.componentId.label, "Slider label is required."))
      .merge(this.#check(this.#validInterval, model.interval, "Slider interval is invalid."))
      .merge(this.#check(this.#positiveNumber, model.step, "Slider step must be greater than 0."))
      .merge(this.#check(this.#finiteNumber, model.value, "Slider value must be finite."))
      .merge(this.#check(this.#valueInsideInterval, model, "Slider value must be within interval."));
  }

  #check<T>(
    specification: ISpecification<T>,
    candidate: T,
    error: string,
  ): ValidationResult {
    return specification.isSatisfiedBy(candidate)
      ? ValidationResult.ok()
      : ValidationResult.fail(error);
  }
}

class SliderModel {
  public static readonly Default: SliderDefinition = {
    componentId: {
      id: "slider.default",
      label: "Slider",
    },
    interval: {
      min: 0,
      max: 1,
    },
    step: 0.01,
    value: 0,
  };

  readonly #definition: SliderDefinition;
  readonly #validator: IValidator<SliderDefinition>;

  public constructor(
    definition: SliderDefinition,
    validator: IValidator<SliderDefinition> = new SliderDefinitionValidator(),
  ) {
    this.#validator = validator;
    this.#throwIfInvalid(definition);
    this.#definition = definition;
  }

  public get definition(): SliderDefinition {
    return this.#definition;
  }

  public withValue(value: number): SliderModel {
    return new SliderModel(
      {
        ...this.#definition,
        value,
      },
      this.#validator,
    );
  }

  #throwIfInvalid(definition: SliderDefinition): void {
    const result = this.#validator.validate(definition);

    if (!result.isSuccess) {
      throw new Error(result.errors.join(" "));
    }
  }
}

class SliderChangedEventFactory {
  public create(definition: SliderDefinition): SliderChangedEvent {
    return new CustomEvent(SliderEventName.Changed, {
      detail: {
        id: definition.componentId.id,
        value: definition.value,
      },
      bubbles: true,
      composed: true,
    });
  }
}

@customElement("range-slider")
export class SliderElement extends LitElement {
  public static override readonly styles: CSSResultGroup = css`
    :host {
      display: block;
      font-family: system-ui, sans-serif;
    }

    label {
      display: grid;
      gap: 0.35rem;
    }

    .header {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      font-size: 0.875rem;
    }

    input {
      width: 100%;
    }

    output {
      font-variant-numeric: tabular-nums;
    }
  `;

  readonly #eventFactory = new SliderChangedEventFactory();

  @property({ type: String, attribute: "component-id" })
  public componentId: string = SliderModel.Default.componentId.id;

  @property({ type: String })
  public label: string = SliderModel.Default.componentId.label;

  @property({ type: Number })
  public min: number = SliderModel.Default.interval.min;

  @property({ type: Number })
  public max: number = SliderModel.Default.interval.max;

  @property({ type: Number })
  public step: number = SliderModel.Default.step;

  @property({ type: Number })
  public value: number = SliderModel.Default.value;

  @property({ type: Object })
  public definition: SliderDefinition = SliderModel.Default;

  protected override render() {
    const slider = new SliderModel(this.#resolveDefinition());
    const definition = slider.definition;

    return html`
      <label>
        <span class="header">
          <span>${definition.componentId.label}</span>
          <output>${definition.value}</output>
        </span>

        <input
          type="range"
          .value=${String(definition.value)}
          min=${definition.interval.min}
          max=${definition.interval.max}
          step=${definition.step}
          @input=${this.#onInput}
        />
      </label>
    `;
  }

  #onInput(event: Event): void {
    const input = event.currentTarget;

    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    const slider = new SliderModel(this.#resolveDefinition()).withValue(Number(input.value));
    const definition = slider.definition;

    if (this.#usesAttributeProps()) {
      this.value = definition.value;
    } else {
      this.definition = definition;
    }

    this.dispatchEvent(this.#eventFactory.create(definition));
  }

  #resolveDefinition(): SliderDefinition {
    if (!this.#usesAttributeProps()) {
      return this.definition;
    }

    return {
      componentId: {
        id: this.componentId,
        label: this.label,
      },
      interval: {
        min: this.min,
        max: this.max,
      },
      step: this.step,
      value: this.value,
    };
  }

  #usesAttributeProps(): boolean {
    return (
      this.hasAttribute("component-id") ||
      this.hasAttribute("label") ||
      this.hasAttribute("min") ||
      this.hasAttribute("max") ||
      this.hasAttribute("step") ||
      this.hasAttribute("value")
    );
  }
}