import { WebAudioSignalGraphBuilder, RuntimeGraphBuilder, WebAudioPlaybackSession } from '../../src/index.js';
import { FakeAudioContext } from "./FakeAudioContext.js";
import { WebAudioTreeFixture } from './WebAudioTreeFixture.js';

export class WebAudioRuntimeFixture {
  public readonly tree = new WebAudioTreeFixture();
  public readonly context = new FakeAudioContext();
  public readonly signalGraphBuilder = new WebAudioSignalGraphBuilder();
  public readonly runtimeGraphBuilder = new RuntimeGraphBuilder(this.signalGraphBuilder);
  public readonly playbackSession = new WebAudioPlaybackSession(
    this.context as unknown as AudioContext,
    this.runtimeGraphBuilder
  );
}
