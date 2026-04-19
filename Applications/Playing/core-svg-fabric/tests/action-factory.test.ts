import { describe, expect, it, vi } from "vitest";
import { actionFactory } from "../src/factories/action-factory.js";
import {
  createWheelActionContext,
  RecordingEventTarget,
} from "./fixtures/actionFixtures.js";

describe("actionFactory", () => {
  describe("clampWheel", () => {
    it("increments on upward wheel movement", () => {
      const next = vi.fn();
      const action = actionFactory.clampWheel(0, 100, 5, next);

      action(createWheelActionContext(-1, 60));

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "meter-main",
          value: 65,
        }),
      );
    });

    it("decrements on downward wheel movement and clamps at minimum", () => {
      const next = vi.fn();
      const action = actionFactory.clampWheel(0, 100, 5, next);

      action(createWheelActionContext(1, 3));

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          value: 0,
        }),
      );
    });

    it("rejects an invalid range", () => {
      expect(() => actionFactory.clampWheel(10, 0, 1, vi.fn())).toThrow(
        /max must be > min/i,
      );
    });
  });

  describe("midiCc", () => {
    it("dispatches a MIDI CC event with status and data bytes", () => {
      const host = new RecordingEventTarget();
      const action = actionFactory.midiCc({ channel: 2, controller: 74 }, host);

      action({ id: "filter-cutoff", event: new Event("change"), value: 96 });

      expect(host.events).toHaveLength(1);
      expect(host.events[0]?.type).toBe("midi-send");
      expect(host.events[0]?.detail).toEqual({
        address: {
          channel: 2,
          controller: 74,
        },
        value: 96,
        message: {
          status: 0xb1,
          data1: 74,
          data2: 96,
        },
      });
    });

    it("rounds and clamps outgoing MIDI values", () => {
      const host = new RecordingEventTarget();
      const action = actionFactory.midiCc({ channel: 1, controller: 7 }, host);

      action({ id: "volume", event: new Event("change"), value: 200.7 });

      expect(host.events[0]?.detail.value).toBe(127);
      expect(host.events[0]?.detail.message.data2).toBe(127);
    });

    it("rejects invalid MIDI addresses", () => {
      expect(() =>
        actionFactory.midiCc({ channel: 17, controller: 1 }, new EventTarget()),
      ).toThrow(/channel/i);

      expect(() =>
        actionFactory.midiCc({ channel: 1, controller: 128 }, new EventTarget()),
      ).toThrow(/controller/i);
    });
  });
});
