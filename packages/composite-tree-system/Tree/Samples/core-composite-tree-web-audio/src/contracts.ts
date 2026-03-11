
import type { INode } from "@monorepo/core-composite-tree-abstract";

export interface IWebAudioNode extends INode<IWebAudioNode> {}

export interface IAudioSourceNode extends IWebAudioNode {}

export interface IAudioProcessorNode extends IWebAudioNode {}

export interface IAudioMixerNode extends IWebAudioNode {}