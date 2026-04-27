import {
  MidiStreamerDomEvents,
  type IMidiStreamSink,
  type MidiStreamCompleted,
  type MidiStreamFailure,
  type MidiStreamMessage,
} from "@monorepo/audio-function-midi-streamer-contracts";

export interface IDomMidiStreamSinkObserver {
  onMidiStreamMessage(event: MidiStreamMessage): void;
  onMidiStreamCompleted(event: MidiStreamCompleted): void;
  onMidiStreamFailed(error: MidiStreamFailure): void;
}

export class DomMidiStreamSink implements IMidiStreamSink {
  public constructor(
    private readonly target: EventTarget,
    private readonly observer: IDomMidiStreamSinkObserver,
  ) {}

  public send(event: MidiStreamMessage): void {
    this.observer.onMidiStreamMessage(event);
    this.dispatch(MidiStreamerDomEvents.midiMessage, event);
  }

  public complete(event: MidiStreamCompleted): void {
    this.observer.onMidiStreamCompleted(event);
    this.dispatch(MidiStreamerDomEvents.streamCompleted, event);
  }

  public fail(error: MidiStreamFailure): void {
    this.observer.onMidiStreamFailed(error);
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
