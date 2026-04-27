export interface MidiStreamSubscription {
  cancel(): void;
}

export interface IMidiStreamScheduler {
  schedule(delayMs: number, action: () => void): MidiStreamSubscription;
}
