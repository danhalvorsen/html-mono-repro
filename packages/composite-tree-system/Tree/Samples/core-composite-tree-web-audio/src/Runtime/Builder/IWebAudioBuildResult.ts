import type { IWebAudioRuntimeNode } from "../Node/IWebAudioRuntimeNode.js";
import type { IStartableWebAudioRuntimeNode } from "../Node/IStartableWebAudioRuntimeNode.js";

export interface IWebAudioBuildResult {
  readonly output: AudioNode;
  readonly runtimeNodes: readonly IWebAudioRuntimeNode[];
  readonly startableNodes: readonly IStartableWebAudioRuntimeNode[];
}