export interface IAudioOutput {
  connect(input: AudioNode): void;
  disconnect(): void;
}
