import {
  DelegateValueAction,
  MidiCcAction,
  type MidiCcAddress,
  type MidiCcDetail,
  type MidiCcMessage,
  type ValueActionContext,
  type ValueActionHandler,
  WheelStepPolicy,
} from "../application/value-actions.js";
import { Range } from "../domain/range.js";

export type {
  MidiCcAddress,
  MidiCcDetail,
  MidiCcMessage,
  ValueActionContext,
  ValueActionHandler as ValueAction,
};

export const actionFactory = {
  clampWheel(
    min: number,
    max: number,
    step: number,
    next: ValueActionHandler<WheelEvent>,
  ): ValueActionHandler<WheelEvent> {
    const policy = new WheelStepPolicy(step, new Range(min, max));
    const action = new DelegateValueAction(next);

    return (context) => {
      const value = policy.apply(context.value, context.event);

      // Avoid spreading event contexts in the wheel hot path.
      action.execute({
        id: context.id,
        event: context.event,
        value,
      });
    };
  },

  midiCc(address: MidiCcAddress, host: EventTarget): ValueActionHandler {
    const action = new MidiCcAction(address, host);

    return (context) => {
      action.execute(context);
    };
  },
};
