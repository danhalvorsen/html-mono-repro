// samples/web-audio-demo/src/SampleRuntime.ts

import {
  WebAudioPlaybackSession,
  type IWebAudioNode,
} from "@monorepo/core-composite-tree-web-audio";

import { createSampleTree } from "./createSampleTree.js";

export class SampleRuntime {
  private readonly playbackSession: WebAudioPlaybackSession;

  public constructor(
    playbackSession: WebAudioPlaybackSession = new WebAudioPlaybackSession()
  ) {
    this.playbackSession = playbackSession;
  }

  public async play(): Promise<void> {
    const root: IWebAudioNode = createSampleTree();
    await this.playbackSession.play(root);
  }

  public stop(): void {
    this.playbackSession.stop();
  }

  public async dispose(): Promise<void> {
    await this.playbackSession.dispose();
  }
}