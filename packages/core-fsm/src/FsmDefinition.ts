import { IFsmDefinition } from './IFsm.js';
import { ITransition } from "./ITransition.js";
import { InvalidDefinitionError } from "./Errors/InvalidDefinitionError.js";
import { InputType, StateId, IInput, OutputFactory, Guard } from './Types.js';

export class FsmDefinition<
  TState extends StateId,
  TContext,
  TInput extends IInput<InputType, any>,
  TOut
> implements IFsmDefinition<TState, TContext, TInput, TOut> {
  public readonly initial: TState;
  private readonly map: ReadonlyMap<string, ITransition<TState, TContext, TInput, TOut>>;

  public constructor(args: {
    readonly initial: TState;
    readonly transitions: readonly ITransition<TState, TContext, TInput, TOut>[];
  }) {
    this.initial = args.initial;

    const m = new Map<string, ITransition<TState, TContext, TInput, TOut>>();
    for (const t of args.transitions) {
      const k = FsmDefinition.key(t.from, t.on);
      if (m.has(k)) throw new InvalidDefinitionError(`Duplicate transition for '${k}'.`);
      m.set(k, t);
    }
    this.map = m;
  }

  public getTransition(from: TState, inputType: TInput["type"]): ITransition<TState, TContext, TInput, TOut> | undefined {
    return this.map.get(FsmDefinition.key(from, inputType));
  }

  private static key(from: StateId, on: InputType): string {
    return `${FsmDefinition.idToString(from)}::${FsmDefinition.idToString(on)}`;
  }

  private static idToString(x: string | symbol): string {
    return typeof x === "symbol" ? x.toString() : String(x);
  }
}
