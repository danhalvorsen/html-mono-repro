import { assertPositive } from "../domain/number-guards.js";
import { Range } from "../domain/range.js";

export interface ValueActionContext<TEvent extends Event = Event> {
  readonly id: string;
  readonly event: TEvent;
  readonly value: number;
}

export interface IValueAction<TEvent extends Event = Event> {
  execute(context: ValueActionContext<TEvent>): void;
}

export type ValueActionHandler<TEvent extends Event = Event> = (
  context: ValueActionContext<TEvent>,
) => void;

export interface ValueInputPolicy<TEvent extends Event = Event> {
  apply(current: number, event: TEvent): number;
}

export class WheelStepPolicy implements ValueInputPolicy<WheelEvent> {
  public constructor(
    private readonly step: number,
    private readonly range: Range,
  ) {
    assertPositive(step, "step");
  }

  public apply(current: number, event: WheelEvent): number {
    const delta = event.deltaY < 0 ? this.step : -this.step;
    return this.range.clamp(current + delta);
  }
}

export interface MidiCcAddress {
  readonly channel: number;
  readonly controller: number;
}

export interface MidiCcMessage {
  readonly status: number;
  readonly data1: number;
  readonly data2: number;
}

export interface MidiCcDetail {
  readonly address: MidiCcAddress;
  readonly value: number;
  readonly message: MidiCcMessage;
}

export const SvgFabricEventNames = Object.freeze({
  MidiSend: "midi-send",
} as const);

export const SvgFabricEventName = SvgFabricEventNames;

export class MidiCcAction implements IValueAction {
  // MIDI values always use the same 7-bit range; keep it shared and immutable.
  private static readonly midiRange = new Range(0, 127);

  public constructor(
    private readonly address: MidiCcAddress,
    private readonly host: EventTarget,
  ) {
    this.assertAddress(address);
  }

  public execute(context: ValueActionContext): void {
    const value = MidiCcAction.midiRange.clamp(Math.round(context.value));

    this.host.dispatchEvent(
      new CustomEvent<MidiCcDetail>(SvgFabricEventNames.MidiSend, {
        detail: {
          address: this.address,
          value,
          message: {
            status: 0xb0 | (this.address.channel - 1),
            data1: this.address.controller,
            data2: value,
          },
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private assertAddress(address: MidiCcAddress): void {
    // MIDI address validation lives here so dispatch sites cannot drift.
    if (!Number.isInteger(address.channel) || address.channel < 1 || address.channel > 16) {
      throw new Error("MIDI channel must be an integer between 1 and 16");
    }

    if (
      !Number.isInteger(address.controller) ||
      address.controller < 0 ||
      address.controller > 127
    ) {
      throw new Error("MIDI controller must be an integer between 0 and 127");
    }
  }
}

export class DelegateValueAction<TEvent extends Event = Event>
  implements IValueAction<TEvent>
{
  public constructor(private readonly handler: ValueActionHandler<TEvent>) {}

  public execute(context: ValueActionContext<TEvent>): void {
    this.handler(context);
  }
}
