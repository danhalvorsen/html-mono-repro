import type {
  IMidiStreamScheduler,
  MidiStreamSubscription,
} from "@monorepo/audio-function-midi-streamer-contracts";

export class TimeoutMidiStreamScheduler implements IMidiStreamScheduler {
  public schedule(delayMs: number, action: () => void): MidiStreamSubscription {
    if (!Number.isFinite(delayMs) || delayMs < 0) {
      throw new RangeError("delayMs must be a non-negative finite number.");
    }

    const timeout = setTimeout(action, delayMs);

    return {
      cancel: (): void => {
        clearTimeout(timeout);
      },
    };
  }
}