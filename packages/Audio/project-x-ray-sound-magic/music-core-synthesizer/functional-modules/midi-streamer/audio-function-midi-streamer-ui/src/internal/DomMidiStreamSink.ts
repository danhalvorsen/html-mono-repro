import {
  MidiStreamerDomEvents,
  type IMidiStreamSink,
  type MidiStreamCompleted,
  type MidiStreamFailure,
  type MidiStreamMessage,
} from "@monorepo/audio-function-midi-streamer-contracts";

export class DomMidiStreamSink implements IMidiStreamSink {
  public constructor(private readonly target: EventTarget) {}

  public send(event: MidiStreamMessage): void {
    this.dispatch(MidiStreamerDomEvents.midiMessage, event);
  }

  public complete(event: MidiStreamCompleted): void {
    this.dispatch(MidiStreamerDomEvents.streamCompleted, event);
  }

  public fail(error: MidiStreamFailure): void {
    this.dispatch(MidiStreamerDomEvents.streamFailed, error);
  }

  private dispatch(eventName: string, detail: unknown): void {
    this.target.dispatchEvent(
      new CustomEvent(eventName, {
        bubbles: true,
        composed: true,
        detail,
      }),
    );
  }
}