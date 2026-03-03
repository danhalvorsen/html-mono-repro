
import { InvalidDefinitionError } from '../../Errors/InvalidDefinitionError.js';
import { FsmDefinition } from '.././../FsmDefinition.js';
import { InputType, StateId, IInput } from '../../Types.js';
import { IStateBuilder } from '../State/IStateBuilder.js';
import { StateBuilderImpl } from '../State/StateBuilderImpl.js';
import { ITransition } from '../../ITransition.js'

export class FsmBuilder<
  TState extends StateId,
  TContext,
  TInput extends IInput<InputType, any>,
  TOut
> {
  private initialState?: TState;
  private readonly transitions: ITransition<TState, TContext, TInput, TOut>[] = [];

  public initial(state: TState): this {
    this.initialState = state;
    return this;
  }

  public from(state: TState): IStateBuilder<TState, TContext, TInput, TOut> {
    return new StateBuilderImpl(this, state);
  }

  public build(): FsmDefinition<TState, TContext, TInput, TOut> {
    if (this.initialState === undefined) throw new InvalidDefinitionError("Initial state not set.");
    return new FsmDefinition({ initial: this.initialState, transitions: this.transitions.slice() });
  }

  internalAdd(t: ITransition<TState, TContext, TInput, TOut>): void {
    this.transitions.push(t);
  }
}
