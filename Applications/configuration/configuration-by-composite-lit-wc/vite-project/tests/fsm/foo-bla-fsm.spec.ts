import { describe, it, expect } from "vitest";
import {
  DefaultViewFsmFactory,
  SetBlaValueTransitionInput,
  SetFooMaxTransitionInput,
  SetFooMinTransitionInput,
  SetModeTransitionInput,
  ViewModes,
  ViewStates,
  type ViewTransitionOutput,
} from "../../src/fsm/foo-bla-fsm.js";
import { BlaState } from "../../src/domain/BlaState.js";
import { FooState } from "../../src/domain/FooState.js";

describe("FooState", () => {
  it("should keep immutable value semantics when updating min", () => {
    const initial = new FooState(1, 9);

    const updated = initial.withMin(3);

    expect(initial.min).toBe(1);
    expect(initial.max).toBe(9);
    expect(updated.min).toBe(3);
    expect(updated.max).toBe(9);
  });

  it("should keep immutable value semantics when updating max", () => {
    const initial = new FooState(1, 9);

    const updated = initial.withMax(12);

    expect(initial.min).toBe(1);
    expect(initial.max).toBe(9);
    expect(updated.min).toBe(1);
    expect(updated.max).toBe(12);
  });
});

describe("BlaState", () => {
  it("should keep immutable value semantics when updating value", () => {
    const initial = new BlaState(5);

    const updated = initial.withValue(8);

    expect(initial.value).toBe(5);
    expect(updated.value).toBe(8);
  });
});

describe("DefaultViewFsmFactory", () => {
  it("should start in Editing state with deterministic default context", () => {
    const fsm = new DefaultViewFsmFactory().create();

    expect(fsm.state).toBe(ViewStates.Editing);
    expect(fsm.context.mode).toBe(ViewModes.Foo);
    expect(fsm.context.fooMin).toBe(0);
    expect(fsm.context.fooMax).toBe(100);
    expect(fsm.context.blaValue).toBe(50);
  });

  it("should transition mode and emit a mode output", async () => {
    const fsm = new DefaultViewFsmFactory().create();

    const result = await fsm.dispatch(new SetModeTransitionInput(ViewModes.Bla));

    expect(result.transitionTaken).toBe(true);
    expect(fsm.context.mode).toBe(ViewModes.Bla);
    expect(result.outputs).toHaveLength(1);
    const output = result.outputs[0] as ViewTransitionOutput;
    expect(output.field).toBe("mode");
    expect(output.value).toBe(ViewModes.Bla);
  });

  it("should transition foo min and preserve other state values", async () => {
    const fsm = new DefaultViewFsmFactory().create();

    const result = await fsm.dispatch(new SetFooMinTransitionInput(10));

    expect(result.transitionTaken).toBe(true);
    expect(fsm.context.fooMin).toBe(10);
    expect(fsm.context.fooMax).toBe(100);
    expect(fsm.context.blaValue).toBe(50);
  });

  it("should transition foo max and preserve other state values", async () => {
    const fsm = new DefaultViewFsmFactory().create();

    const result = await fsm.dispatch(new SetFooMaxTransitionInput(250));

    expect(result.transitionTaken).toBe(true);
    expect(fsm.context.fooMin).toBe(0);
    expect(fsm.context.fooMax).toBe(250);
    expect(fsm.context.blaValue).toBe(50);
  });

  it("should transition bla value and preserve foo state", async () => {
    const fsm = new DefaultViewFsmFactory().create();

    const result = await fsm.dispatch(new SetBlaValueTransitionInput(33));

    expect(result.transitionTaken).toBe(true);
    expect(fsm.context.fooMin).toBe(0);
    expect(fsm.context.fooMax).toBe(100);
    expect(fsm.context.blaValue).toBe(33);
  });
});
