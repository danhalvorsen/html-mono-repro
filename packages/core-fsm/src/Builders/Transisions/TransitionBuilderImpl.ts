import { InputType, StateId, IInput, Guard, TransitionAction, OutputFactory } from '../../Types.js';
import { FsmBuilder } from '../Fsm/FsmBuilder.js';
import { ITransitionBuilder } from './ITransitionBuilder.js';
 
 export class TransitionBuilderImpl<
  TState extends StateId,
  TContext,
  TInput extends IInput<InputType, any>,
  TOut,
  TSpecificInput extends TInput
> implements ITransitionBuilder<TState, TContext, TInput, TOut, TSpecificInput> {
  private guard?: Guard<TContext, TSpecificInput>;
  private action?: TransitionAction<TContext, TSpecificInput>;
  private output?: OutputFactory<TContext, TSpecificInput, TOut>;

  public constructor(
    private readonly root: FsmBuilder<TState, TContext, TInput, TOut>,
    private readonly from: TState,
    private readonly on: TSpecificInput["type"]
  ) { }

  public withGuard(guard: Guard<TContext, TSpecificInput>): this { this.guard = guard; return this; }
  public withAction(action: TransitionAction<TContext, TSpecificInput>): this { this.action = action; return this; }
  public withOutput(output: OutputFactory<TContext, TSpecificInput, TOut>): this { this.output = output; return this; }

  public to(to: TState): FsmBuilder<TState, TContext, TInput, TOut> {
    this.root.internalAdd({
      from: this.from,
      on: this.on as any,
      to,
      guard: this.guard as any,
      action: this.action as any,
      output: this.output as any,
    });
    return this.root;
  }
}
