import { FsmBuilder } from "../src/Builders/Fsm/FsmBuilder.js";
import { InvalidDefinitionError } from '../src/Errors/InvalidDefinitionError.js';
import { IInput } from "../src/Types.js";
import { describe, it, expect } from "vitest";

type State = "Idle" | "Running";
type Ctx = { readonly n: number };
type Out = { readonly kind: "ok"; readonly value: number };

type Start = IInput<"Start", { readonly inc: number }>;
type Stop = IInput<"Stop", {}>;
type Input = Start | Stop;

class Fixture {
  public readonly S = { Idle: "Idle", Running: "Running" } as const;
  public readonly E = { Start: "Start", Stop: "Stop" } as const;

  public readonly ctx0: Ctx = { n: 0 };

  public readonly guard = async ({ context, input }: { readonly context: Ctx; readonly input: Start }) =>
    context.n + input.payload.inc >= 0;

  public readonly reduce = ({ context, input }: { readonly context: Ctx; readonly input: Start }): Ctx => ({
    n: context.n + input.payload.inc,
  });

  public readonly output = ({ context }: { readonly context: Ctx }): Out => ({
    kind: "ok",
    value: context.n,
  });

  public builder() {
    return new FsmBuilder<State, Ctx, Input, Out>().initial(this.S.Idle);
  }
}

describe("TransitionBuilderImpl", () => {

  it("adds transition with guard/reducer/output", () => {
    const fx = new Fixture();

    const def = fx.builder()
      .from(fx.S.Idle)
      .on(fx.E.Start)
      .withGuard(fx.guard)
      .withReducer(fx.reduce)
      .withOutput(fx.output)
      .to(fx.S.Running)
      .build();

    const t = def.getTransition(fx.S.Idle, fx.E.Start);

    expect(t).toBeTruthy();
    expect(t!.from).toBe(fx.S.Idle);
    expect(t!.to).toBe(fx.S.Running);
    expect(typeof t!.guard).toBe("function");
    expect(typeof t!.reduce).toBe("function");
    expect(typeof t!.output).toBe("function");
  });

  it("supports transition without optional behaviors", () => {
    const fx = new Fixture();

    const def = fx.builder()
      .from(fx.S.Idle)
      .on(fx.E.Stop)
      .to(fx.S.Idle)
      .build();

    const t = def.getTransition(fx.S.Idle, fx.E.Stop);

    expect(t).toBeTruthy();
    expect(t!.guard).toBeUndefined();
    expect(t!.reduce).toBeUndefined();
    expect(t!.output).toBeUndefined();
  });

  it("last writer wins semantics", async () => {
    const fx = new Fixture();

    const guardA = async () => true;
    const guardB = async () => false;

    const def = fx.builder()
      .from(fx.S.Idle)
      .on(fx.E.Start)
      .withGuard(guardA)
      .withGuard(guardB)
      .to(fx.S.Running)
      .build();

    const t = def.getTransition(fx.S.Idle, fx.E.Start)!;

    const input: Start = { type: fx.E.Start, payload: { inc: 0 } };

    const allowed = await t.guard!({ context: fx.ctx0, input });
    expect(allowed).toBe(false);
  });

  it("throws on duplicate (state,input)", () => {
    const fx = new Fixture();

    expect(() => {
      fx.builder()
        .from(fx.S.Idle)
        .on(fx.E.Start)
        .to(fx.S.Running)
        .from(fx.S.Idle)
        .on(fx.E.Start)
        .to(fx.S.Idle)
        .build();
    }).toThrow(InvalidDefinitionError);
  });

});