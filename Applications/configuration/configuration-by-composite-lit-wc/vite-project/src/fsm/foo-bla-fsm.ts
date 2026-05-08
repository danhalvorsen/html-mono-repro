import { FsmBuilder, FsmEngine, type IInput } from "@monorepo/core-fsm";
import { BlaState } from "../domain/BlaState.js";
import { FooState } from "../domain/FooState.js";

export class ViewStates {
  public static readonly Editing = "Editing" as const;
}

export type ViewState = typeof ViewStates.Editing;

export class ViewModes {
  public static readonly Foo = "Foo" as const;
  public static readonly Bla = "Bla" as const;

  public static is(value: unknown): value is ViewMode {
    return value === ViewModes.Foo || value === ViewModes.Bla;
  }
}

export type ViewMode = typeof ViewModes.Foo | typeof ViewModes.Bla;

export class ViewContextFields {
  public static readonly Mode = "mode" as const;
  public static readonly FooMin = "fooMin" as const;
  public static readonly FooMax = "fooMax" as const;
  public static readonly BlaValue = "blaValue" as const;
}

export type ViewContextField =
  | typeof ViewContextFields.Mode
  | typeof ViewContextFields.FooMin
  | typeof ViewContextFields.FooMax
  | typeof ViewContextFields.BlaValue;

export class ViewTransitionTypes {
  public static readonly SetMode = "SetMode" as const;
  public static readonly SetFooMin = "SetFooMin" as const;
  public static readonly SetFooMax = "SetFooMax" as const;
  public static readonly SetBlaValue = "SetBlaValue" as const;
}

export type ViewTransitionType =
  | typeof ViewTransitionTypes.SetMode
  | typeof ViewTransitionTypes.SetFooMin
  | typeof ViewTransitionTypes.SetFooMax
  | typeof ViewTransitionTypes.SetBlaValue;

export class ViewContext {
  public readonly mode: ViewMode;
  public readonly foo: FooState;
  public readonly bla: BlaState;

  public constructor(mode: ViewMode, foo: FooState, bla: BlaState) {
    this.mode = mode;
    this.foo = foo;
    this.bla = bla;
  }

  public static createDefault(): ViewContext {
    return new ViewContext(
      ViewModes.Foo,
      FooState.createDefault(),
      BlaState.createDefault(),
    );
  }

  public get fooMin(): number | null {
    return this.foo.min;
  }

  public get fooMax(): number | null {
    return this.foo.max;
  }

  public get blaValue(): number | null {
    return this.bla.value;
  }

  public withMode(mode: ViewMode): ViewContext {
    return new ViewContext(mode, this.foo, this.bla);
  }

  public withFooMin(fooMin: number | null): ViewContext {
    return new ViewContext(this.mode, this.foo.withMin(fooMin), this.bla);
  }

  public withFooMax(fooMax: number | null): ViewContext {
    return new ViewContext(this.mode, this.foo.withMax(fooMax), this.bla);
  }

  public withBlaValue(blaValue: number | null): ViewContext {
    return new ViewContext(this.mode, this.foo, this.bla.withValue(blaValue));
  }
}

abstract class ViewTransitionInputBase<TType extends ViewTransitionType, TPayload>
  implements IInput<TType, TPayload>
{
  public readonly type: TType;
  public readonly payload: TPayload;

  public constructor(type: TType, payload: TPayload) {
    this.type = type;
    this.payload = payload;
  }
}

export class SetModeTransitionInput extends ViewTransitionInputBase<
  typeof ViewTransitionTypes.SetMode,
  ViewMode
> {
  public constructor(mode: ViewMode) {
    super(ViewTransitionTypes.SetMode, mode);
  }
}

export class SetFooMinTransitionInput extends ViewTransitionInputBase<
  typeof ViewTransitionTypes.SetFooMin,
  number | null
> {
  public constructor(value: number | null) {
    super(ViewTransitionTypes.SetFooMin, value);
  }
}

export class SetFooMaxTransitionInput extends ViewTransitionInputBase<
  typeof ViewTransitionTypes.SetFooMax,
  number | null
> {
  public constructor(value: number | null) {
    super(ViewTransitionTypes.SetFooMax, value);
  }
}

export class SetBlaValueTransitionInput extends ViewTransitionInputBase<
  typeof ViewTransitionTypes.SetBlaValue,
  number | null
> {
  public constructor(value: number | null) {
    super(ViewTransitionTypes.SetBlaValue, value);
  }
}

export type ViewTransitionInput =
  | SetModeTransitionInput
  | SetFooMinTransitionInput
  | SetFooMaxTransitionInput
  | SetBlaValueTransitionInput;

export class ViewTransitionOutput {
  public readonly field: ViewContextField;
  public readonly value: unknown;

  public constructor(field: ViewContextField, value: unknown) {
    this.field = field;
    this.value = value;
  }
}

export interface IViewFsmFactory {
  create(): FsmEngine<ViewState, ViewContext, ViewTransitionInput, ViewTransitionOutput>;
}

export class DefaultViewFsmFactory implements IViewFsmFactory {
  private readonly initialContext: ViewContext;

  public constructor(initialContext: ViewContext = ViewContext.createDefault()) {
    this.initialContext = initialContext;
  }

  public create(): FsmEngine<ViewState, ViewContext, ViewTransitionInput, ViewTransitionOutput> {
    const definition = this.createDefinitionBuilder()
      .build();

    return new FsmEngine({
      definition,
      context: this.initialContext,
    });
  }

  private createDefinitionBuilder(): FsmBuilder<
    ViewState,
    ViewContext,
    ViewTransitionInput,
    ViewTransitionOutput
  > {
    return new FsmBuilder<ViewState, ViewContext, ViewTransitionInput, ViewTransitionOutput>()
      .initial(ViewStates.Editing)

      .from(ViewStates.Editing)
      .on(ViewTransitionTypes.SetMode)
      .withAction(({ context, input }) => context.withMode(input.payload))
      .withOutput(({ input }) => new ViewTransitionOutput(ViewContextFields.Mode, input.payload))
      .to(ViewStates.Editing)

      .from(ViewStates.Editing)
      .on(ViewTransitionTypes.SetFooMin)
      .withAction(({ context, input }) => context.withFooMin(input.payload))
      .withOutput(({ input }) => new ViewTransitionOutput(ViewContextFields.FooMin, input.payload))
      .to(ViewStates.Editing)

      .from(ViewStates.Editing)
      .on(ViewTransitionTypes.SetFooMax)
      .withAction(({ context, input }) => context.withFooMax(input.payload))
      .withOutput(({ input }) => new ViewTransitionOutput(ViewContextFields.FooMax, input.payload))
      .to(ViewStates.Editing)

      .from(ViewStates.Editing)
      .on(ViewTransitionTypes.SetBlaValue)
      .withAction(({ context, input }) => context.withBlaValue(input.payload))
      .withOutput(({ input }) => new ViewTransitionOutput(ViewContextFields.BlaValue, input.payload))
      .to(ViewStates.Editing);
  }
}
