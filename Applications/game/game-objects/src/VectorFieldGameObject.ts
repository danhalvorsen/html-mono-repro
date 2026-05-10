import { customElement, property } from 'lit/decorators.js';
import type { PropertyValues } from 'lit';
 
import { CurlNoiseVectorField } from './VectorField/CurlNoiseVectorField.js';
import { PerlinNoise3 } from './VectorField/PerlinNoise3.js';
import { SeedPointFactory, type SeedPoint } from './VectorField/SeedPointFactory.js';
import { StreamlinePathBuilder } from './VectorField/StreamlinePathBuilder.js';
import type { INoise3, IVectorField } from './VectorField/VectorFieldTypes.js';
import {
  DefaultVectorFieldGameObjectOptions,
  type VectorFieldGameObjectOptions,
} from './VectorFieldGameObjectOptions.js';
import { VectorFieldGameObjectShapeTemplate } from './VectorFieldGameObjectShapeTemplate.js';
import { BaseGameObject } from './BaseGameObject.js';

interface VectorFieldRuntime {
  readonly noise: INoise3;
  readonly vectorField: IVectorField;
  readonly pathBuilder: StreamlinePathBuilder;
  readonly seeds: readonly SeedPoint[];
}

@customElement('vector-field-game-object')
export class VectorFieldGameObject extends BaseGameObject {
  @property({ attribute: false })
  public vectorFieldOptions: VectorFieldGameObjectOptions =
    DefaultVectorFieldGameObjectOptions;

  readonly #seedPointFactory = new SeedPointFactory();

  #runtime: VectorFieldRuntime | null = null;
  #runtimeKey = '';
  #animationFrameId: number | null = null;
  #previousTimestamp: number | null = null;
  #timeSeconds = 0;

  public constructor() {
    super();
    this.#configureBaseGameObject(DefaultVectorFieldGameObjectOptions);
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    this.#startAnimation();
  }

  public override disconnectedCallback(): void {
    this.#stopAnimation();
    super.disconnectedCallback();
  }

  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    super.willUpdate(changedProperties);

    this.#ensureRuntime(this.vectorFieldOptions);
    this.#configureBaseGameObject(this.vectorFieldOptions);
    this.#updateShapeTemplate(this.vectorFieldOptions);
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
      this.#timeSeconds += deltaSeconds * this.vectorFieldOptions.animationSpeed;

      this.requestUpdate();
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

  #ensureRuntime(options: VectorFieldGameObjectOptions): void {
    const key = VectorFieldGameObject.createRuntimeKey(options);

    if (this.#runtime !== null && this.#runtimeKey === key) {
      return;
    }

    const noise = new PerlinNoise3(options.seed);

    const vectorField = new CurlNoiseVectorField(noise, {
      scale: options.noise.scale,
      timeScale: options.noise.timeScale,
      derivativeStep: options.noise.derivativeStep,
    });

    const pathBuilder = new StreamlinePathBuilder(vectorField, {
      stepLength: options.path.stepLength,
      steps: options.path.steps,
      bounds: options.bounds,
    });

    const seeds = this.#seedPointFactory.create({
      count: options.maxSeedCount,
      seed: options.seed,
      bounds: options.bounds,
      minStrokeWidth: options.stroke.minWidth,
      maxStrokeWidth: options.stroke.maxWidth,
    });

    this.#runtime = {
      noise,
      vectorField,
      pathBuilder,
      seeds,
    };

    this.#runtimeKey = key;
  }

  #configureBaseGameObject(options: VectorFieldGameObjectOptions): void {
    this.options = {
      ...this.options,
      width: options.bounds.width,
      height: options.bounds.height,
    };
  }

  #updateShapeTemplate(options: VectorFieldGameObjectOptions): void {
    if (this.#runtime === null) {
      throw new Error('VectorFieldGameObject runtime was not initialized.');
    }

    this.shapeTemplate = new VectorFieldGameObjectShapeTemplate({
      gameObjectOptions: options,
      seeds: this.#runtime.seeds,
      pathBuilder: this.#runtime.pathBuilder,
      timeSeconds: this.#timeSeconds,
    });
  }

  private static createRuntimeKey(options: VectorFieldGameObjectOptions): string {
    return JSON.stringify({
      bounds: options.bounds,
      seed: options.seed,
      maxSeedCount: options.maxSeedCount,
      noise: options.noise,
      path: options.path,
      strokeWidth: {
        min: options.stroke.minWidth,
        max: options.stroke.maxWidth,
      },
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vector-field-game-object': VectorFieldGameObject;
  }
}