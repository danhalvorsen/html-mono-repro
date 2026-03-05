import { FsmBuilder, type IFsmDefinition } from "@monorepo/core-fsm";
import { State, InputType } from "./calculator.types.js";
import type { CalculatorInput, Operator } from "./calculator.types.js";

export type CalculatorCtx = {
  display: string;
  left: number | null;
  pendingOp: Operator | null;
};

function applyBinary(left: number, op: Operator, right: number): number {
  switch (op) {
    case "+":
      return left + right;
    case "-":
      return left - right;
    case "*":
      return left * right;
    case "/":
      return right === 0 ? Number.NaN : left / right;
  }
}

export class CalculatorFsm {
  public readonly definition: IFsmDefinition<State, CalculatorCtx, CalculatorInput, never>;

  public constructor() {
    this.definition = new FsmBuilder<State, CalculatorCtx, CalculatorInput, never>()
      .initial(State.EnteringNumber)

      .from(State.EnteringNumber)
      .on(InputType.Digit)
      .withAction(({ context, input }) => {
        const next = {
          ...context,
          display: context.display + input.payload.d,
        };
        console.debug("[CalculatorFsm] transition", {
          from: State.EnteringNumber,
          input: InputType.Digit,
          payload: input.payload,
          nextDisplay: next.display,
        });
        return next;
      })
      .to(State.EnteringNumber)

      .from(State.EnteringNumber)
      .on(InputType.Operator)
      .withAction(({ context, input }) => {
        const left = Number(context.display);
        const next = {
          ...context,
          left: Number.isNaN(left) ? null : left,
          pendingOp: input.payload.op,
        };
        console.debug("[CalculatorFsm] transition", {
          from: State.EnteringNumber,
          input: InputType.Operator,
          payload: input.payload,
          nextState: State.OperatorPressed,
          display: context.display,
          left: next.left,
          pendingOp: next.pendingOp,
        });
        return next;
      })
      .to(State.OperatorPressed)
      .from(State.EnteringNumber)
      .on(InputType.CR)
      .withAction(() => {
        console.debug("[CalculatorFsm] transition", {
          from: State.EnteringNumber,
          input: InputType.CR,
          nextState: State.EnteringNumber,
          nextDisplay: "",
        });
        return { display: "", left: null, pendingOp: null };
      })
      .to(State.EnteringNumber)

      .from(State.OperatorPressed)
      .on(InputType.Digit)
      .withAction(({ context, input }) => {
        const next = {
          ...context,
          display: input.payload.d,
        };
        console.debug("[CalculatorFsm] transition", {
          from: State.OperatorPressed,
          input: InputType.Digit,
          payload: input.payload,
          nextState: State.EnteringNumber,
          nextDisplay: next.display,
        });
        return next;
      })
      .to(State.EnteringNumber)

      .from(State.OperatorPressed)
      .on(InputType.Operator)
      .withAction(({ context, input }) => {
        console.debug("[CalculatorFsm] transition", {
          from: State.OperatorPressed,
          input: InputType.Operator,
          payload: input.payload,
          nextState: State.Error,
          display: context.display,
        });
        return context;
      })
      .to(State.Error)
      .from(State.OperatorPressed)
      .on(InputType.Equals)
      .withAction(({ context }) => {
        console.debug("[CalculatorFsm] transition", {
          from: State.OperatorPressed,
          input: InputType.Equals,
          nextState: State.Error,
          display: context.display,
        });
        return context;
      })
      .to(State.Error)
      .from(State.OperatorPressed)
      .on(InputType.CR)
      .withAction(() => {
        console.debug("[CalculatorFsm] transition", {
          from: State.OperatorPressed,
          input: InputType.CR,
          nextState: State.EnteringNumber,
          nextDisplay: "",
        });
        return { display: "", left: null, pendingOp: null };
      })
      .to(State.EnteringNumber)

      .from(State.EnteringNumber)
      .on(InputType.Equals)
      .withAction(({ context }) => {
        if (context.left === null || context.pendingOp === null) {
          console.debug("[CalculatorFsm] transition", {
            from: State.EnteringNumber,
            input: InputType.Equals,
            nextState: State.EnteringNumber,
            display: context.display,
          });
          return context;
        }

        const right = Number(context.display);
        const result = applyBinary(context.left, context.pendingOp, right);
        const next = {
          display: String(result),
          left: null,
          pendingOp: null,
        };

        console.debug("[CalculatorFsm] transition", {
          from: State.EnteringNumber,
          input: InputType.Equals,
          left: context.left,
          op: context.pendingOp,
          right,
          result: next.display,
        });
        return next;
      })
      .to(State.EnteringNumber)

      .from(State.Error)
      .on(InputType.CR)
      .withAction(() => {
        console.debug("[CalculatorFsm] transition", {
          from: State.Error,
          input: InputType.CR,
          nextState: State.EnteringNumber,
          nextDisplay: "",
        });
        return { display: "", left: null, pendingOp: null };
      })
      .to(State.EnteringNumber)

      .build();
  }
}