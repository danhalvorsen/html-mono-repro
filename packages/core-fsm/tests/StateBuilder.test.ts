import { expect, describe, it } from "vitest";

import { FsmDefinition } from '../src/FsmDefinition.js';

import { FsmBuilder } from '../src/Builders/Fsm/FsmBuilder.js'
import { IInput } from '../src/Types.js';

import { InvalidDefinitionError } from '../src/Errors/InvalidDefinitionError.js';

type State = "Idle" | "Running";
type Ctx = { readonly n: number };
type Out = { readonly kind: "ok"; readonly value: number };

type Start = IInput<"Start", { readonly inc: number }>;
type Stop = IInput<"Stop", {}>;
type Input = Start | Stop;

type Fx = ReturnType<typeof createFx>;

function createFx() {
  const S = { Idle: "Idle", Running: "Running" } as const;
  const E = { Start: "Start", Stop: "Stop" } as const;

  const ctx0: Ctx = { n: 0 };

  const guard = async ({ context, input }: { readonly context: Ctx; readonly input: Start }) =>
    context.n + input.payload.inc >= 0;

  const reduce = ({ context, input }: { readonly context: Ctx; readonly input: Start }): Ctx => ({
    n: context.n + input.payload.inc,
  });

  const output = ({ context }: { readonly context: Ctx }): Out => ({ kind: "ok", value: context.n });

  const builder = () => new FsmBuilder<State, Ctx, Input, Out>().initial(S.Idle);

  return { S, E, ctx0, guard, reduce, output, builder };
}

function expectTransition(def: FsmDefinition<State, Ctx, Input, Out>, from: State, on: Input["type"], to: State) {
  const t = def.getTransition(from, on);
  expect(t, `expected transition for ${from}::${String(on)}`).toBeTruthy();
  expect(t!.from).toBe(from);
  expect(t!.on).toBe(on);
  expect(t!.to).toBe(to);
  return t!;
}

describe("StateBuilderImpl / TransitionBuilderImpl (fluent builder)", () => {
  it("builds a definition with a single transition via fluent chain", () => {
    const fx: Fx = createFx();

    const def = fx.builder()
      .from(fx.S.Idle)
      .on(fx.E.Start)
      .to(fx.S.Running)
      .build();

    expect(def).toBeInstanceOf(FsmDefinition);
    expect(def.initial).toBe(fx.S.Idle);

    expectTransition(def, fx.S.Idle, fx.E.Start, fx.S.Running);
  });

  it("returns the root builder after .to(), allowing additional transitions", () => {
    const fx: Fx = createFx();

    const b = fx.builder();
    const root = b.from(fx.S.Idle).on(fx.E.Start).to(fx.S.Running);

    expect(root).toBe(b);

    const def = root.from(fx.S.Running).on(fx.E.Stop).to(fx.S.Idle).build();

    expectTransition(def, fx.S.Idle, fx.E.Start, fx.S.Running);
    expectTransition(def, fx.S.Running, fx.E.Stop, fx.S.Idle);
  });

  it("persists guard / reducer / output on the created transition", async () => {
    const fx: Fx = createFx();

    const def = fx.builder()
      .from(fx.S.Idle)
      .on(fx.E.Start)
      .withGuard(fx.guard)
      .withAction(fx.reduce)
      .withOutput(fx.output)
      .to(fx.S.Running)
      .build();

    const t = expectTransition(def, fx.S.Idle, fx.E.Start, fx.S.Running);

    // guard
    expect(await t.guard!({ context: { n: 0 }, input: { type: fx.E.Start, payload: { inc: 1 } } })).toBe(true);
    expect(await t.guard!({ context: { n: 0 }, input: { type: fx.E.Start, payload: { inc: -1 } } })).toBe(false);

    // reducer
    const c1 = await t.action!({ context: fx.ctx0, input: { type: fx.E.Start, payload: { inc: 5 } } });
    expect(c1).toEqual({ n: 5 });

    // output factory (note: output runs after reducer in engine; here we just validate it exists and works)
    const o1 = await t.output!({ context: c1, input: { type: fx.E.Start, payload: { inc: 5 } } });
    expect(o1).toEqual({ kind: "ok", value: 5 });
  });

  it("throws InvalidDefinitionError on duplicate (state,input) transitions (deterministic)", () => {
    const fx: Fx = createFx();

    expect(() => {
      fx.builder()
        .from(fx.S.Idle)
        .on(fx.E.Start)
        .to(fx.S.Running)
        .from(fx.S.Idle)
        .on(fx.E.Start)
        .to(fx.S.Idle) // duplicate key
        .build();
    }).toThrow(InvalidDefinitionError);
  });

  it("throws InvalidDefinitionError when initial state is not set", () => {
    const fx: Fx = createFx();

    expect(() => {
      // bypass helper initial() by constructing directly
      new FsmBuilder<State, Ctx, Input, Out>()
        .from(fx.S.Idle)
        .on(fx.E.Start)
        .to(fx.S.Running)
        .build();
    }).toThrow(InvalidDefinitionError);
  });
});
