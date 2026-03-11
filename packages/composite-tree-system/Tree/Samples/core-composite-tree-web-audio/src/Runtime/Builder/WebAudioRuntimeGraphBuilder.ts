// Runtime/WebAudioRuntimeGraphBuilder.ts

import { IWebAudioNode } from "../../contracts.js";
import { IWebAudioBuildResult } from "./IWebAudioBuildResult.js";

export interface IWebAudioRuntimeGraphBuilder {
  build(root: IWebAudioNode, context: AudioContext): IWebAudioBuildResult;
}