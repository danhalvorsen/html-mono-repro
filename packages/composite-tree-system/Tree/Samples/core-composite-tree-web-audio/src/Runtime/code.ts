// packages/composite-tree-system/Tree/Samples/core-composite-tree-web-audio/src/Runtime/code.ts

import { createSampleTree } from "../code.js";
import { WebAudioSignalGraphBuilder } from "./Builder/WebAudioSignalGraphBuilder.js";

const root = createSampleTree();
const builder = new WebAudioSignalGraphBuilder();
const result = builder.build(root);

for (const edge of result.graph.edges) {
  console.log(`${edge.source.id} -> ${edge.target.id}`);
}