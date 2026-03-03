// tests/_fx/fsm.fixtures.ts
import { FsmBuilder } from '../../src/Builders/Fsm/FsmBuilder.js';
import { FsmDefinition } from '../../src/FsmDefinition.js';
import { IInput } from '../../src/Types.js'
import { expect } from "vitest";

export type State = "Idle" | "Running";
export type Ctx = { readonly n: number };
export type Out = { readonly kind: "ok"; readonly value: number };

export type Start = IInput<"Start", { readonly inc: number }>;
export type Stop = IInput<"Stop", {}>;
export type Input = Start | Stop;

export type Fx = ReturnType<typeof createFx>;

export function createFx() {
  const S = { Idle: "Idle", Running: "Running" } as const;
  const E = { Start: "Start", Stop: "Stop" } as const;

  const ctx0: Ctx = { n: 0 };

  const guard = async ({ context, input }: { readonly context: Ctx; readonly input: Start }) =>
    context.n + input.payload.inc >= 0;

  const action = ({ context, input }: { readonly context: Ctx; readonly input: Start }): Ctx => ({
    n: context.n + input.payload.inc,
  });

  const output = ({ context }: { readonly context: Ctx }): Out => ({
    kind: "ok",
    value: context.n,
  });

  const builder = () => new FsmBuilder<State, Ctx, Input, Out>().initial(S.Idle);

  return { S, E, ctx0, guard, action, output, builder };
}

export function expectTransition(
  def: FsmDefinition<State, Ctx, Input, Out>,
  args: { readonly from: State; readonly on: Input["type"]; readonly to: State }
) {
  const t = def.getTransition(args.from, args.on);
  expect(t, `expected transition for ${args.from}::${String(args.on)}`).toBeTruthy();
  expect(t!.from).toBe(args.from);
  expect(t!.on).toBe(args.on);
  expect(t!.to).toBe(args.to);
  return t!;
}