import type { IWebAudioNode } from "../../contracts.js";
import { GainNodeModel } from "../../Models/GainNodeModel.js";
import { MixerNodeModel } from "../../Models/MixerNodeModel.js";
import { OscillatorNodeModel } from "../../Models/OscillatorNodeModel.js";

import type { IWebAudioBuildResult } from "./IWebAudioBuildResult.js";
import type { IWebAudioRuntimeGraphBuilder } from "./WebAudioRuntimeGraphBuilder.js";
import { WebAudioSignalGraphBuilder } from "./WebAudioSignalGraphBuilder.js";

import type { IWebAudioRuntimeNode } from "../Node/IWebAudioRuntimeNode.js";
import type { IStartableWebAudioRuntimeNode } from "../Node/IStartableWebAudioRuntimeNode.js";
import { GainRuntimeNode } from "../Node/GainRuntimeNode.js";
import { MixerRuntimeNode } from "../Node/MixerRuntimeNode.js";
import { OscillatorRuntimeNode } from "../Node/OscillatorRuntimeNode.js";

export class RuntimeGraphBuilder implements IWebAudioRuntimeGraphBuilder {
  public constructor(
    private readonly signalGraphBuilder: WebAudioSignalGraphBuilder = new WebAudioSignalGraphBuilder()
  ) {}

  public build(root: IWebAudioNode, context: AudioContext): IWebAudioBuildResult {
    const signalGraph = this.signalGraphBuilder.build(root);

    const runtimeMap = new Map<IWebAudioNode, IWebAudioRuntimeNode>();
    const runtimeNodes: IWebAudioRuntimeNode[] = [];
    const startableNodes: IStartableWebAudioRuntimeNode[] = [];

    for (const modelNode of signalGraph.nodeMap.keys()) {
      const runtimeNode = this.createRuntimeNode(modelNode, context);

      runtimeMap.set(modelNode, runtimeNode);
      runtimeNodes.push(runtimeNode);

      if (this.isStartableRuntimeNode(runtimeNode)) {
        startableNodes.push(runtimeNode);
      }
    }

    for (const route of signalGraph.routes) {
      const sourceRuntimeNode = runtimeMap.get(route.item1);
      const targetRuntimeNode = runtimeMap.get(route.item2);

      if (sourceRuntimeNode === undefined) {
        throw new Error(`Missing runtime source node '${route.item1.id}'.`);
      }

      if (targetRuntimeNode === undefined) {
        throw new Error(`Missing runtime target node '${route.item2.id}'.`);
      }

      sourceRuntimeNode.output.connect(targetRuntimeNode.input);
    }

    const rootRuntimeNode = runtimeMap.get(root);

    if (rootRuntimeNode === undefined) {
      throw new Error(`Missing runtime root node '${root.id}'.`);
    }

    return {
      output: rootRuntimeNode.output,
      runtimeNodes,
      startableNodes,
    };
  }

  private createRuntimeNode(
    node: IWebAudioNode,
    context: AudioContext
  ): IWebAudioRuntimeNode {
    if (node instanceof OscillatorNodeModel) {
      return this.createOscillatorRuntimeNode(node, context);
    }

    if (node instanceof GainNodeModel) {
      return this.createGainRuntimeNode(node, context);
    }

    if (node instanceof MixerNodeModel) {
      return this.createMixerRuntimeNode(context);
    }

    throw new Error(`Unsupported runtime model node '${node.constructor.name}'.`);
  }

  private createOscillatorRuntimeNode(
    node: OscillatorNodeModel,
    context: AudioContext
  ): IWebAudioRuntimeNode {
    const oscillatorNode = context.createOscillator();

    oscillatorNode.frequency.setValueAtTime(node.frequencyHz, context.currentTime);
    oscillatorNode.detune.setValueAtTime(node.detuneCents, context.currentTime);
    oscillatorNode.type = node.waveform;

    return new OscillatorRuntimeNode(oscillatorNode);
  }

  private createGainRuntimeNode(
    node: GainNodeModel,
    context: AudioContext
  ): IWebAudioRuntimeNode {
    const gainNode = context.createGain();

    gainNode.gain.setValueAtTime(node.gain, context.currentTime);

    return new GainRuntimeNode(gainNode);
  }

  private createMixerRuntimeNode(context: AudioContext): IWebAudioRuntimeNode {
    const mixerNode = context.createGain();
    mixerNode.gain.setValueAtTime(1, context.currentTime);
    return new MixerRuntimeNode(mixerNode);
  }

  private isStartableRuntimeNode(
    node: IWebAudioRuntimeNode
  ): node is IStartableWebAudioRuntimeNode {
    return (
      typeof (node as Partial<IStartableWebAudioRuntimeNode>).start === "function" &&
      typeof (node as Partial<IStartableWebAudioRuntimeNode>).stop === "function"
    );
  }
}