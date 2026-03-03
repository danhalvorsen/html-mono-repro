 import { InputType, StateId, IInput, Guard, ContextReducer, OutputFactory } from '../../Types.js';
import { FsmBuilder } from '../Fsm/FsmBuilder.js';
 
export interface ITransitionBuilder<
  TState extends StateId,
  TContext,
  TInput extends IInput<InputType, any>,
  TOut,
  TSpecificInput extends TInput
> {
  withGuard(guard: Guard<TContext, TSpecificInput>): this;
  withReducer(reduce: ContextReducer<TContext, TSpecificInput>): this;
  withOutput(output: OutputFactory<TContext, TSpecificInput, TOut>): this;
  to(to: TState): FsmBuilder<TState, TContext, TInput, TOut>;
}
