import { InputType, StateId, IInput } from '../../Types.js';
import { ITransitionBuilder } from '../Transisions/ITransitionBuilder.js';

export interface IStateBuilder<
  TState extends StateId,
  TContext,
  TInput extends IInput<InputType, any>,
  TOut
> {
  on<TType extends TInput["type"]>(
    inputType: TType
  ): ITransitionBuilder<TState, TContext, TInput, TOut, Extract<TInput, { type: TType; }>>;
}
