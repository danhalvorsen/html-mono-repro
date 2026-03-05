// src/calculator/calculator.ts
import { FsmEngine, type IFsmDefinition } from "@monorepo/core-fsm";
import type { CalculatorInput, State } from "./calculator.types.js";
import type { CalculatorCtx } from "./calculator.fsm.js";

export interface ICalculator {
  dispatch(input: CalculatorInput): Promise<void>;
  readonly display: string;
  readonly state: State;
}

export class Calculator implements ICalculator {
  private readonly engine: FsmEngine<State, CalculatorCtx, CalculatorInput, never>;

  public constructor(definition: IFsmDefinition<State, CalculatorCtx, CalculatorInput, never>) {
    this.engine = new FsmEngine({
      definition,
      context: { display: "", left: null, pendingOp: null },
    });
  }

  public async dispatch(input: CalculatorInput): Promise<void> {
    await this.engine.dispatch(input);
  }

  public get display(): string {
    return this.engine.context.display;
  }

  public get state(): State {
    return this.engine.state;
  }
}