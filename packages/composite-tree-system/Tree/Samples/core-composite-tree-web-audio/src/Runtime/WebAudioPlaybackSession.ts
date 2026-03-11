import type { IWebAudioNode } from "../contracts.js";
import type { IWebAudioBuildResult } from "./Builder/IWebAudioBuildResult.js";
import { RuntimeGraphBuilder } from "./Builder/RuntimeGraphBuilder.js";
import type { IWebAudioRuntimeGraphBuilder } from "./Builder/WebAudioRuntimeGraphBuilder.js";

export class WebAudioPlaybackSession {
  private currentBuildResult: IWebAudioBuildResult | null = null;
  private isConnectedToDestination = false;

  public constructor(
    private readonly context: AudioContext = new AudioContext(),
    private readonly runtimeGraphBuilder: IWebAudioRuntimeGraphBuilder = new RuntimeGraphBuilder()
  ) {}

  public get audioContext(): AudioContext {
    return this.context;
  }

  public async play(root: IWebAudioNode): Promise<void> {
    this.stop();

    const buildResult = this.runtimeGraphBuilder.build(root, this.context);

    buildResult.output.connect(this.context.destination);
    this.isConnectedToDestination = true;

    if (this.context.state === "suspended") {
      await this.context.resume();
    }

    for (const startableNode of buildResult.startableNodes) {
      startableNode.start();
    }

    this.currentBuildResult = buildResult;
  }

  public stop(): void {
    if (this.currentBuildResult === null) {
      return;
    }

    for (const startableNode of this.currentBuildResult.startableNodes) {
      startableNode.stop();
    }

    if (this.isConnectedToDestination) {
      try {
        this.currentBuildResult.output.disconnect(this.context.destination);
      } catch {
        this.currentBuildResult.output.disconnect();
      }

      this.isConnectedToDestination = false;
    }

    for (const runtimeNode of this.currentBuildResult.runtimeNodes) {
      runtimeNode.dispose();
    }

    this.currentBuildResult = null;
  }

  public async dispose(): Promise<void> {
    this.stop();

    if (this.context.state !== "closed") {
      await this.context.close();
    }
  }
}