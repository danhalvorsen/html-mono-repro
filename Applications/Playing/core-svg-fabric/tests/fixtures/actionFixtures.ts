import type {
  MidiCcDetail,
  ValueActionContext,
} from "../../src/factories/action-factory.js";

export function createWheelActionContext(
  deltaY: number,
  value = 64,
): ValueActionContext<WheelEvent> {
  return {
    id: "meter-main",
    event: { deltaY } as WheelEvent,
    value,
  };
}

export class RecordingEventTarget extends EventTarget {
  public readonly events: CustomEvent<MidiCcDetail>[] = [];

  public override dispatchEvent(event: Event): boolean {
    this.events.push(event as CustomEvent<MidiCcDetail>);
    return super.dispatchEvent(event);
  }
}
