import { InputType, StateId, IInput } from '../../Types.js';
import { FsmBuilder } from '../Fsm/FsmBuilder.js';
import { ITransitionBuilder } from '../Transisions/ITransitionBuilder.js';
import { TransitionBuilderImpl } from '../Transisions/TransitionBuilderImpl.js';
import { IStateBuilder } from './IStateBuilder.js';

 export class StateBuilderImpl<
  TState extends StateId,
  TContext,
  TInput extends IInput<InputType, any>,
  TOut
> implements IStateBuilder<TState, TContext, TInput, TOut> {
  public constructor(
    private readonly root: FsmBuilder<TState, TContext, TInput, TOut>,
    private readonly from: TState
  ) { }

  public on<TType extends TInput["type"]>(
    inputType: TType
  ): ITransitionBuilder<TState, TContext, TInput, TOut, Extract<TInput, { type: TType; }>> {
    type Specific = Extract<TInput, { type: TType; }>;
    return new TransitionBuilderImpl<TState, TContext, TInput, TOut, Specific>(this.root, this.from, inputType);
  }
}
