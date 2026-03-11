 
import type { IWebAudioRuntimeNode } from "./IWebAudioRuntimeNode.js";

export interface IStartableWebAudioRuntimeNode extends IWebAudioRuntimeNode {
  start(): void;
  stop(): void;
}