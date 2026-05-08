import { FsmBuilder, FsmEngine, type IInput } from "@monorepo/core-fsm";
import {
  DefaultVectorFieldGameObjectOptions,
  type VectorFieldGameObjectOptions,
} from "../../GameObjects/VectorFieldGameObjectOptions.js";
import { VectorFieldGameObjectColorThemeAdapter } from "../../GameObjects/VectorFieldGameObjectColorThemeAdapter.js";
import { ColorThemeFactory } from "../../ColorManagement/ColorThemeFactory.js";
import type { GameObjectColorTheme } from "../../ColorManagement/IColorManagedGameObject.js";
import {
  ColorThemePreset,
  type ColorThemePreset as ColorThemePresetValue,
} from "../../ColorManagement/ColorThemePreset.js";

export const VectorFieldViewStates = {
  Editing: "Editing",
} as const;

export type VectorFieldViewStateIdValue =
  (typeof VectorFieldViewStates)[keyof typeof VectorFieldViewStates];

export class VectorFieldTransitionType {
  public static readonly SetLineCount = "SetLineCount" as const;
  public static readonly SetAnimationSpeed = "SetAnimationSpeed" as const;
  public static readonly SetNoiseScale = "SetNoiseScale" as const;
  public static readonly SetNoiseTimeScale = "SetNoiseTimeScale" as const;
  public static readonly SetDerivativeStep = "SetDerivativeStep" as const;
  public static readonly SetPathStepLength = "SetPathStepLength" as const;
  public static readonly SetPathSteps = "SetPathSteps" as const;
  public static readonly SetMinStrokeWidth = "SetMinStrokeWidth" as const;
  public static readonly SetMaxStrokeWidth = "SetMaxStrokeWidth" as const;
  public static readonly SetBlur = "SetBlur" as const;
  public static readonly SetThemePreset = "SetThemePreset" as const;
  public static readonly RandomizeTheme = "RandomizeTheme" as const;
  public static readonly Reset = "Reset" as const;
}

type SetLineCountTransistion = IInput<typeof VectorFieldTransitionType.SetLineCount, number>;
type SetAnimationSpeedTransistion = IInput<typeof VectorFieldTransitionType.SetAnimationSpeed, number>;
type SetNoiseScaleTransistion = IInput<typeof VectorFieldTransitionType.SetNoiseScale, number>;
type SetNoiseTimeScaleTransistion = IInput<typeof VectorFieldTransitionType.SetNoiseTimeScale, number>;
type SetDerivativeStepTransistion = IInput<typeof VectorFieldTransitionType.SetDerivativeStep, number>;
type SetPathStepLengthTransistion = IInput<typeof VectorFieldTransitionType.SetPathStepLength, number>;
type SetPathStepsTransistion = IInput<typeof VectorFieldTransitionType.SetPathSteps, number>;
type SetMinStrokeWidthTransistion = IInput<typeof VectorFieldTransitionType.SetMinStrokeWidth, number>;
type SetMaxStrokeWidthTransistion = IInput<typeof VectorFieldTransitionType.SetMaxStrokeWidth, number>;
type SetBlurTransistion = IInput<typeof VectorFieldTransitionType.SetBlur, number>;
type SetThemePresetTransistion = IInput<
  typeof VectorFieldTransitionType.SetThemePreset,
  ColorThemePresetValue
>;
type RandomizeThemeTransistion = IInput<typeof VectorFieldTransitionType.RandomizeTheme, number>;
type ResetTransistion = IInput<typeof VectorFieldTransitionType.Reset, null>;

export type VectorFieldViewTransitionInput =
  | SetLineCountTransistion
  | SetAnimationSpeedTransistion
  | SetNoiseScaleTransistion
  | SetNoiseTimeScaleTransistion
  | SetDerivativeStepTransistion
  | SetPathStepLengthTransistion
  | SetPathStepsTransistion
  | SetMinStrokeWidthTransistion
  | SetMaxStrokeWidthTransistion
  | SetBlurTransistion
  | SetThemePresetTransistion
  | RandomizeThemeTransistion
  | ResetTransistion;

export type NumericTransitionType =
  | typeof VectorFieldTransitionType.SetLineCount
  | typeof VectorFieldTransitionType.SetAnimationSpeed
  | typeof VectorFieldTransitionType.SetNoiseScale
  | typeof VectorFieldTransitionType.SetNoiseTimeScale
  | typeof VectorFieldTransitionType.SetDerivativeStep
  | typeof VectorFieldTransitionType.SetPathStepLength
  | typeof VectorFieldTransitionType.SetPathSteps
  | typeof VectorFieldTransitionType.SetMinStrokeWidth
  | typeof VectorFieldTransitionType.SetMaxStrokeWidth
  | typeof VectorFieldTransitionType.SetBlur;

export interface VectorFieldRangeControlDefinition {
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly transitionType: NumericTransitionType;
}

type NumericTransistion = IInput<NumericTransitionType, number>;

interface VectorFieldNumericTransitionDefinition {
  readonly label: string;
  readonly min: number;
  readonly max: number | ((foo: VectorFieldGameObjectOptions) => number);
  readonly step: number;
  readonly transitionType: NumericTransitionType;
  readonly outputField: string;
  readonly readValue: (foo: VectorFieldGameObjectOptions) => number;
  readonly apply: (foo: VectorFieldGameObjectOptions, value: number) => VectorFieldGameObjectOptions;
}

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    throw new RangeError("Control value must be finite.");
  }

  return Math.min(max, Math.max(min, value));
}

function clampInteger(value: number, min: number, max: number): number {
  return Math.round(clampNumber(value, min, max));
}

class VectorFieldNumericTransitions {
  public static readonly All: readonly VectorFieldNumericTransitionDefinition[] = Object.freeze([
    {
      label: "Line count",
      min: 20,
      max: (foo) => foo.maxSeedCount,
      step: 1,
      transitionType: VectorFieldTransitionType.SetLineCount,
      outputField: "lineCount",
      readValue: (foo) => foo.lineCount,
      apply: (foo, value) => ({
        ...foo,
        lineCount: clampInteger(value, 20, foo.maxSeedCount),
      }),
    },
    {
      label: "Animation speed",
      min: 0,
      max: 4,
      step: 0.05,
      transitionType: VectorFieldTransitionType.SetAnimationSpeed,
      outputField: "animationSpeed",
      readValue: (foo) => foo.animationSpeed,
      apply: (foo, value) => ({
        ...foo,
        animationSpeed: clampNumber(value, 0, 4),
      }),
    },
    {
      label: "Noise scale",
      min: 0.001,
      max: 0.012,
      step: 0.0005,
      transitionType: VectorFieldTransitionType.SetNoiseScale,
      outputField: "noise.scale",
      readValue: (foo) => foo.noise.scale,
      apply: (foo, value) => ({
        ...foo,
        noise: {
          ...foo.noise,
          scale: clampNumber(value, 0.001, 0.012),
        },
      }),
    },
    {
      label: "Noise time scale",
      min: 0,
      max: 0.8,
      step: 0.01,
      transitionType: VectorFieldTransitionType.SetNoiseTimeScale,
      outputField: "noise.timeScale",
      readValue: (foo) => foo.noise.timeScale,
      apply: (foo, value) => ({
        ...foo,
        noise: {
          ...foo.noise,
          timeScale: clampNumber(value, 0, 0.8),
        },
      }),
    },
    {
      label: "Derivative step",
      min: 0.005,
      max: 0.08,
      step: 0.001,
      transitionType: VectorFieldTransitionType.SetDerivativeStep,
      outputField: "noise.derivativeStep",
      readValue: (foo) => foo.noise.derivativeStep,
      apply: (foo, value) => ({
        ...foo,
        noise: {
          ...foo.noise,
          derivativeStep: clampNumber(value, 0.005, 0.08),
        },
      }),
    },
    {
      label: "Path step length",
      min: 1,
      max: 12,
      step: 0.25,
      transitionType: VectorFieldTransitionType.SetPathStepLength,
      outputField: "path.stepLength",
      readValue: (foo) => foo.path.stepLength,
      apply: (foo, value) => ({
        ...foo,
        path: {
          ...foo.path,
          stepLength: clampNumber(value, 1, 12),
        },
      }),
    },
    {
      label: "Path steps",
      min: 10,
      max: 180,
      step: 1,
      transitionType: VectorFieldTransitionType.SetPathSteps,
      outputField: "path.steps",
      readValue: (foo) => foo.path.steps,
      apply: (foo, value) => ({
        ...foo,
        path: {
          ...foo.path,
          steps: clampInteger(value, 10, 180),
        },
      }),
    },
    {
      label: "Min stroke width",
      min: 1,
      max: 18,
      step: 0.5,
      transitionType: VectorFieldTransitionType.SetMinStrokeWidth,
      outputField: "stroke.minWidth",
      readValue: (foo) => foo.stroke.minWidth,
      apply: (foo, value) => {
        const minWidth = clampNumber(value, 1, 18);
        return {
          ...foo,
          stroke: {
            ...foo.stroke,
            minWidth,
            maxWidth: Math.max(minWidth, foo.stroke.maxWidth),
          },
        };
      },
    },
    {
      label: "Max stroke width",
      min: 2,
      max: 28,
      step: 0.5,
      transitionType: VectorFieldTransitionType.SetMaxStrokeWidth,
      outputField: "stroke.maxWidth",
      readValue: (foo) => foo.stroke.maxWidth,
      apply: (foo, value) => {
        const maxWidth = clampNumber(value, 2, 28);
        return {
          ...foo,
          stroke: {
            ...foo.stroke,
            minWidth: Math.min(foo.stroke.minWidth, maxWidth),
            maxWidth,
          },
        };
      },
    },
    {
      label: "Blur",
      min: 0,
      max: 3,
      step: 0.05,
      transitionType: VectorFieldTransitionType.SetBlur,
      outputField: "stroke.blurStdDeviation",
      readValue: (foo) => foo.stroke.blurStdDeviation,
      apply: (foo, value) => ({
        ...foo,
        stroke: {
          ...foo.stroke,
          blurStdDeviation: clampNumber(value, 0, 3),
        },
      }),
    },
  ]);
}

export function createRangeControls(
  foo: VectorFieldGameObjectOptions,
): readonly VectorFieldRangeControlDefinition[] {
  return VectorFieldNumericTransitions.All.map((definition) => ({
    label: definition.label,
    value: definition.readValue(foo),
    min: definition.min,
    max: typeof definition.max === "function" ? definition.max(foo) : definition.max,
    step: definition.step,
    transitionType: definition.transitionType,
  }));
}

export class VectorFieldFooState {
  public readonly options: VectorFieldGameObjectOptions;

  public constructor(options: VectorFieldGameObjectOptions) {
    this.options = options;
  }

  public withOptions(options: VectorFieldGameObjectOptions): VectorFieldFooState {
    return new VectorFieldFooState(options);
  }
}

export class VectorFieldBlaState {
  public readonly themePreset: ColorThemePresetValue;
  public readonly seed: number;

  public constructor(themePreset: ColorThemePresetValue, seed: number) {
    this.themePreset = themePreset;
    this.seed = seed;
  }

  public withThemePreset(themePreset: ColorThemePresetValue): VectorFieldBlaState {
    return new VectorFieldBlaState(themePreset, this.seed);
  }

  public withSeed(seed: number): VectorFieldBlaState {
    return new VectorFieldBlaState(this.themePreset, seed);
  }
}

export class VectorFieldViewContext {
  public readonly foo: VectorFieldFooState;
  public readonly bla: VectorFieldBlaState;

  public constructor(foo: VectorFieldFooState, bla: VectorFieldBlaState) {
    this.foo = foo;
    this.bla = bla;
  }

  public withFooOptions(options: VectorFieldGameObjectOptions): VectorFieldViewContext {
    return new VectorFieldViewContext(this.foo.withOptions(options), this.bla);
  }

  public withBlaState(bla: VectorFieldBlaState): VectorFieldViewContext {
    return new VectorFieldViewContext(this.foo, bla);
  }

  public static createDefault(): VectorFieldViewContext {
    return new VectorFieldViewContext(
      new VectorFieldFooState(DefaultVectorFieldGameObjectOptions),
      new VectorFieldBlaState(ColorThemePreset.aurora, 92831),
    );
  }
}

export class VectorFieldViewTransitionOutput {
  public readonly field: string;
  public readonly value: unknown;

  public constructor(field: string, value: unknown) {
    this.field = field;
    this.value = value;
  }
}

export interface IVectorFieldContextThemeApplier {
  apply(
    context: VectorFieldViewContext,
    preset: ColorThemePresetValue,
    seed: number,
  ): VectorFieldViewContext;
}

export class DefaultVectorFieldContextThemeApplier implements IVectorFieldContextThemeApplier {
  private readonly colorThemeFactory: ColorThemeFactory;
  private readonly colorThemeAdapter: VectorFieldGameObjectColorThemeAdapter;

  public constructor(
    colorThemeFactory: ColorThemeFactory = new ColorThemeFactory(),
    colorThemeAdapter: VectorFieldGameObjectColorThemeAdapter = new VectorFieldGameObjectColorThemeAdapter(),
  ) {
    this.colorThemeFactory = colorThemeFactory;
    this.colorThemeAdapter = colorThemeAdapter;
  }

  public apply(
    context: VectorFieldViewContext,
    preset: ColorThemePresetValue,
    seed: number,
  ): VectorFieldViewContext {
    const target = {
      vectorFieldOptions: context.foo.options,
      applyColorTheme(_theme: GameObjectColorTheme): void {
      },
    };
    const theme = this.colorThemeFactory.create(preset, seed);
    this.colorThemeAdapter.apply(target, theme);

    return context
      .withFooOptions(target.vectorFieldOptions)
      .withBlaState(new VectorFieldBlaState(preset, seed));
  }
}

export interface IVectorFieldViewFsmFactory {
  create(): FsmEngine<
    VectorFieldViewStateIdValue,
    VectorFieldViewContext,
    VectorFieldViewTransitionInput,
    VectorFieldViewTransitionOutput
  >;
}

export class DefaultVectorFieldViewFsmFactory implements IVectorFieldViewFsmFactory {
  private readonly themeApplier: IVectorFieldContextThemeApplier;

  public constructor(themeApplier: IVectorFieldContextThemeApplier) {
    this.themeApplier = themeApplier;
  }

  public create(): FsmEngine<
    VectorFieldViewStateIdValue,
    VectorFieldViewContext,
    VectorFieldViewTransitionInput,
    VectorFieldViewTransitionOutput
  > {
    const definition = this.createDefinitionBuilder().build();

    const initialContext = this.themeApplier.apply(
      VectorFieldViewContext.createDefault(),
      ColorThemePreset.aurora,
      92831,
    );

    return new FsmEngine({
      definition,
      context: initialContext,
    });
  }

  private createDefinitionBuilder(): FsmBuilder<
    VectorFieldViewStateIdValue,
    VectorFieldViewContext,
    VectorFieldViewTransitionInput,
    VectorFieldViewTransitionOutput
  > {
    let builder = new FsmBuilder<
      VectorFieldViewStateIdValue,
      VectorFieldViewContext,
      VectorFieldViewTransitionInput,
      VectorFieldViewTransitionOutput
    >()
      .initial(VectorFieldViewStates.Editing);

    for (const definition of VectorFieldNumericTransitions.All) {
      builder = this.registerNumericTransition(builder, definition);
    }

    return builder
      .from(VectorFieldViewStates.Editing)
      .on(VectorFieldTransitionType.SetThemePreset)
      .withAction(({ context, input }: { context: VectorFieldViewContext; input: SetThemePresetTransistion }) =>
        this.themeApplier.apply(context, input.payload, context.bla.seed))
      .withOutput(({ input }: { input: SetThemePresetTransistion }) =>
        new VectorFieldViewTransitionOutput("themePreset", input.payload))
      .to(VectorFieldViewStates.Editing)

      .from(VectorFieldViewStates.Editing)
      .on(VectorFieldTransitionType.RandomizeTheme)
      .withAction(({ context, input }: { context: VectorFieldViewContext; input: RandomizeThemeTransistion }) =>
        this.themeApplier.apply(context, context.bla.themePreset, input.payload))
      .withOutput(({ input }: { input: RandomizeThemeTransistion }) =>
        new VectorFieldViewTransitionOutput("themeSeed", input.payload))
      .to(VectorFieldViewStates.Editing)

      .from(VectorFieldViewStates.Editing)
      .on(VectorFieldTransitionType.Reset)
      .withAction(() => VectorFieldViewContext.createDefault())
      .withOutput(() => new VectorFieldViewTransitionOutput("reset", true))
      .to(VectorFieldViewStates.Editing);
  }

  private registerNumericTransition(
    builder: FsmBuilder<
      VectorFieldViewStateIdValue,
      VectorFieldViewContext,
      VectorFieldViewTransitionInput,
      VectorFieldViewTransitionOutput
    >,
    definition: VectorFieldNumericTransitionDefinition,
  ): FsmBuilder<
    VectorFieldViewStateIdValue,
    VectorFieldViewContext,
    VectorFieldViewTransitionInput,
    VectorFieldViewTransitionOutput
  > {
    return builder
      .from(VectorFieldViewStates.Editing)
      .on(definition.transitionType)
      .withAction(({ context, input }: { context: VectorFieldViewContext; input: NumericTransistion }) =>
        context.withFooOptions(definition.apply(context.foo.options, input.payload)))
      .withOutput(({ input }: { input: NumericTransistion }) =>
        new VectorFieldViewTransitionOutput(definition.outputField, input.payload))
      .to(VectorFieldViewStates.Editing);
  }
}
