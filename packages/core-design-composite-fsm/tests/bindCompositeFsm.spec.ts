import {
  bindCompositeEventsToFsm,
  mountCompositeView,
  readUiChangeValue,
  readUiCheckedValue,
} from "../src/bindCompositeFsm.js";
import type { Component } from "@monorepo/core-design-composite";
import type { IFsm } from "@monorepo/core-fsm";
import type { IDispatchResult, IInput } from "@monorepo/core-fsm";
import { vi } from "vitest";

type TestState = "Editing";
type TestContext = { readonly value: number };
type TestInput = IInput<"SetValue", number>;
type TestOutput = { readonly ok: true };

class FakeComponent implements Component {
  public readonly name = "Fake";
  public readonly children: ReadonlyArray<Component> = [];

  public createElement(): HTMLElement {
    const element = document.createElement("div");
    element.className = "fake-root";
    return element;
  }
}

class FakeFsm implements IFsm<TestState, TestContext, TestInput, TestOutput> {
  public state: TestState = "Editing";
  public context: TestContext = { value: 0 };

  public readonly dispatch = vi.fn(async (input: TestInput): Promise<IDispatchResult<TestState, TestInput, TestContext, TestOutput>> => {
    return {
      from: "Editing",
      to: "Editing",
      input,
      context: { value: input.payload },
      outputs: Object.freeze([{ ok: true }] as const),
      transitionTaken: true,
    };
  });

  public reset(): void {
    this.state = "Editing";
    this.context = { value: 0 };
  }
}

describe("mountCompositeView", () => {
  it("should mount component element and attach model reference", () => {
    const mountPoint = document.createElement("div");
    const component = new FakeComponent();

    const mounted = mountCompositeView(mountPoint, component);

    expect(mountPoint.children).toHaveLength(1);
    expect(mounted.className).toBe("fake-root");
    expect((mounted as { model?: Component }).model).toBe(component);
  });
});

describe("bindCompositeEventsToFsm", () => {
  it("should dispatch FSM input for matching selector on default ui-change event", async () => {
    const root = document.createElement("div");
    root.innerHTML = `<button class="trigger"></button>`;
    const target = root.querySelector(".trigger");
    if (!(target instanceof HTMLElement)) {
      throw new Error("Missing trigger element");
    }

    const fsm = new FakeFsm();
    const onDispatched = vi.fn();

    bindCompositeEventsToFsm(root, fsm, [
      {
        selector: ".trigger",
        toInput: () => ({ type: "SetValue", payload: 10 }),
      },
    ], { onDispatched });

    target.dispatchEvent(new CustomEvent("ui-change", { bubbles: true, composed: true }));
    await Promise.resolve();

    expect(fsm.dispatch).toHaveBeenCalledTimes(1);
    expect(fsm.dispatch).toHaveBeenCalledWith({ type: "SetValue", payload: 10 });
    expect(onDispatched).toHaveBeenCalledTimes(1);
  });

  it("should not dispatch when selector does not match", async () => {
    const root = document.createElement("div");
    root.innerHTML = `<button class="other"></button>`;
    const target = root.querySelector(".other");
    if (!(target instanceof HTMLElement)) {
      throw new Error("Missing target element");
    }

    const fsm = new FakeFsm();

    bindCompositeEventsToFsm(root, fsm, [
      {
        selector: ".trigger",
        toInput: () => ({ type: "SetValue", payload: 10 }),
      },
    ]);

    target.dispatchEvent(new CustomEvent("ui-change", { bubbles: true, composed: true }));
    await Promise.resolve();

    expect(fsm.dispatch).not.toHaveBeenCalled();
  });

  it("should support custom event name binding", async () => {
    const root = document.createElement("div");
    root.innerHTML = `<button class="trigger"></button>`;
    const target = root.querySelector(".trigger");
    if (!(target instanceof HTMLElement)) {
      throw new Error("Missing trigger element");
    }

    const fsm = new FakeFsm();

    bindCompositeEventsToFsm(root, fsm, [
      {
        selector: ".trigger",
        eventName: "custom-change",
        toInput: () => ({ type: "SetValue", payload: 7 }),
      },
    ]);

    target.dispatchEvent(new CustomEvent("custom-change", { bubbles: true, composed: true }));
    await Promise.resolve();

    expect(fsm.dispatch).toHaveBeenCalledTimes(1);
    expect(fsm.dispatch).toHaveBeenCalledWith({ type: "SetValue", payload: 7 });
  });

  it("should stop dispatching after disposer is called", async () => {
    const root = document.createElement("div");
    root.innerHTML = `<button class="trigger"></button>`;
    const target = root.querySelector(".trigger");
    if (!(target instanceof HTMLElement)) {
      throw new Error("Missing trigger element");
    }

    const fsm = new FakeFsm();

    const dispose = bindCompositeEventsToFsm(root, fsm, [
      {
        selector: ".trigger",
        toInput: () => ({ type: "SetValue", payload: 3 }),
      },
    ]);

    dispose();
    target.dispatchEvent(new CustomEvent("ui-change", { bubbles: true, composed: true }));
    await Promise.resolve();

    expect(fsm.dispatch).not.toHaveBeenCalled();
  });

  it("should invoke onDispatchError when dispatch fails", async () => {
    const root = document.createElement("div");
    root.innerHTML = `<button class="trigger"></button>`;
    const target = root.querySelector(".trigger");
    if (!(target instanceof HTMLElement)) {
      throw new Error("Missing trigger element");
    }

    const fsm = new FakeFsm();
    const expectedError = new Error("dispatch failed");
    fsm.dispatch.mockRejectedValueOnce(expectedError);

    const onDispatchError = vi.fn();

    bindCompositeEventsToFsm(root, fsm, [
      {
        selector: ".trigger",
        toInput: () => ({ type: "SetValue", payload: 1 }),
      },
    ], { onDispatchError });

    target.dispatchEvent(new CustomEvent("ui-change", { bubbles: true, composed: true }));
    await Promise.resolve();

    expect(onDispatchError).toHaveBeenCalledTimes(1);
    expect(onDispatchError).toHaveBeenCalledWith(expectedError);
  });
});

describe("event value readers", () => {
  it("should read ui change value", () => {
    const event = new CustomEvent("ui-change", { detail: { value: 42 } });
    expect(readUiChangeValue<number>(event)).toBe(42);
  });

  it("should read ui checked value", () => {
    const event = new CustomEvent("ui-change", { detail: { checked: true } });
    expect(readUiCheckedValue(event)).toBe(true);
  });
});
