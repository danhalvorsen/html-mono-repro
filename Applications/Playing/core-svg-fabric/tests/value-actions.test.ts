import { describe, expect, it, vi } from "vitest";
import {
  DelegateValueAction,
  MidiCcAction,
  SvgFabricEventName,
  WheelStepPolicy,
} from "../src/application/value-actions.js";
import { Range } from "../src/domain/range.js";
import {
  createWheelActionContext,
  RecordingEventTarget,
} from "./fixtures/actionFixtures.js";

describe("value actions", () => {
  it("applies wheel steps through a range", () => {
    const policy = new WheelStepPolicy(5, new Range(0, 100));

    expect(policy.apply(50, createWheelActionContext(-1).event)).toBe(55);
    expect(policy.apply(2, createWheelActionContext(1).event)).toBe(0);
  });

  it("delegates action execution to a handler", () => {
    const handler = vi.fn();
    const action = new DelegateValueAction(handler);
    const context = createWheelActionContext(-1, 60);

    action.execute(context);

    expect(handler).toHaveBeenCalledWith(context);
  });

  it("dispatches a typed MIDI CC event", () => {
    const host = new RecordingEventTarget();
    const action = new MidiCcAction({ channel: 3, controller: 10 }, host);

    action.execute({ id: "pan", event: new Event("change"), value: 12 });

    expect(host.events[0]?.type).toBe(SvgFabricEventName.MidiSend);
    expect(host.events[0]?.detail.message.status).toBe(0xb2);
  });
});
