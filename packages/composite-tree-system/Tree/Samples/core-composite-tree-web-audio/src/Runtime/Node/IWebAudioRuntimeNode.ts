export interface IWebAudioRuntimeNode {
  readonly input: AudioNode;
  readonly output: AudioNode;
  dispose(): void;
}