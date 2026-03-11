Below is the **complete README.md content** (clean markdown, no code-block wrapper so it can be pasted directly into `README.md`).

---

# core-composite-tree-web-audio

A structured approach for building **Web Audio graphs** using a **Composite Tree domain model**.

The library separates the **authoring model**, **signal routing**, and **runtime execution** into distinct layers. This architecture enables declarative audio graph construction while preserving explicit control over the Web Audio runtime.

The design is suitable for:

* modular synthesizer structures
* hierarchical audio patches
* audio graph tooling
* visual editors
* structured runtime execution of Web Audio nodes

---

# Table of Contents

* Overview
* Composite Tree Model
* Audio Node Categories
* Example Audio Tree
* Advantages of Composite Trees
* Limitations of Composite Trees
* Signal Graph Derivation
* Why a Directed Graph Is Used
* Runtime Graph Construction
* Playback Session
* Runtime Node Wrappers
* Extending the Library
* Possible Future Extensions
* Summary

---

# Overview

`core-composite-tree-web-audio` models audio structures using a **Composite Tree**, which represents the logical design of an audio system.

The architecture separates three conceptual layers:

| Layer          | Responsibility                         |
| -------------- | -------------------------------------- |
| Composite Tree | Authoring model of the audio structure |
| Signal Graph   | Routing representation                 |
| Runtime Graph  | Web Audio API execution                |

The typical execution flow is:

```
Composite Tree
      │
      ▼
Signal Graph (DAG)
      │
      ▼
Runtime Web Audio Graph
      │
      ▼
AudioContext.destination
```

This separation enables validation, transformation, and analysis before runtime execution.

---

# Composite Tree Model

The library implements the **Composite Design Pattern**.

The composite pattern allows hierarchical object structures where individual objects and compositions are treated uniformly.

Each audio node implements the interface:

```ts
export interface IWebAudioNode extends INode<IWebAudioNode> {}
```

Two base node types exist:

| Type            | Description                        |
| --------------- | ---------------------------------- |
| Composite nodes | Nodes that contain children        |
| Leaf nodes      | Nodes that cannot contain children |

---

## Composite Nodes

Composite nodes contain other nodes.

```
Mixer
 ├ Gain
 │  └ Oscillator
 └ Gain
    └ Oscillator
```

Base implementation:

```ts
export abstract class WebAudioCompositeNode
  extends CompositeNode<IWebAudioNode>
  implements IWebAudioNode
```

Examples:

* `MixerNodeModel`
* `GainNodeModel`

---

## Leaf Nodes

Leaf nodes represent signal sources.

Base implementation:

```ts
export abstract class WebAudioLeafNode
  extends LeafNode<IWebAudioNode>
  implements IWebAudioNode
```

Example:

* `OscillatorNodeModel`

---

# Audio Node Categories

The library defines three conceptual audio node roles.

| Category        | Purpose          |
| --------------- | ---------------- |
| Source nodes    | Generate signals |
| Processor nodes | Modify signals   |
| Mixer nodes     | Combine signals  |

Interfaces defining these roles:

```ts
export interface IAudioSourceNode extends IWebAudioNode {}
export interface IAudioProcessorNode extends IWebAudioNode {}
export interface IAudioMixerNode extends IWebAudioNode {}
```

Concrete implementations include:

| Class                 | Description      |
| --------------------- | ---------------- |
| `OscillatorNodeModel` | Signal source    |
| `GainNodeModel`       | Signal processor |
| `MixerNodeModel`      | Signal mixer     |

Example oscillator definition:

```ts
export class OscillatorNodeModel extends AudioSourceNodeBase {

  constructor(
    id: string,
    public readonly frequencyHz: number,
    public readonly waveform: OscillatorType = "sine",
    public readonly detuneCents: number = 0
  ) {
    super(id);
  }
}
```

---

# Example Audio Tree

Example patch definition:

```ts
export function createSampleTree(): MixerNodeModel {

  const root = new MixerNodeModel("mixer-main");

  const gainA = new GainNodeModel("gain-a", 0.25, [
    new OscillatorNodeModel("osc-a", 220, "sawtooth")
  ]);

  const gainB = new GainNodeModel("gain-b", 0.25, [
    new OscillatorNodeModel("osc-b", 330, "square")
  ]);

  root.add(gainA);
  root.add(gainB);

  return root;
}
```

Resulting structure:

```
Mixer
 ├ Gain
 │  └ Oscillator
 └ Gain
    └ Oscillator
```

The composite tree defines **logical structure**, not runtime nodes.

---

# Advantages of Composite Trees

Composite trees provide several architectural advantages.

### Declarative audio structure

Audio patches can be described independently of runtime execution.

### Structural validation

Nodes enforce topology rules.

Example:

```ts
protected override ensureCanAdd(child: IWebAudioNode): void {

  if (this.children.length >= 1) {
    throw new Error("Gain node accepts exactly one child.");
  }

}
```

### Separation of concerns

The architecture separates design from execution.

| Concern           | Layer             |
| ----------------- | ----------------- |
| Audio design      | Composite Tree    |
| Signal routing    | Graph builder     |
| Runtime execution | Web Audio runtime |

### Tooling compatibility

A tree structure supports:

* patch editors
* serialization
* validation
* transformation passes
* graph visualization

---

# Limitations of Composite Trees

Composite trees also impose structural constraints.

### Single-parent relationships

Nodes cannot have multiple parents.

This prevents certain audio routing scenarios.

Examples:

* signal buses
* sidechain routing
* send/return effects

### No direct cycles

Feedback loops cannot be represented directly in a tree structure.

### Potential node duplication

Shared signal paths may require duplication in the tree representation.

---

# Signal Graph Derivation

The composite tree is converted into a **Directed Acyclic Graph (DAG)** before runtime creation.

This step is implemented by:

```
WebAudioSignalGraphBuilder
```

The builder performs:

1. Tree traversal
2. Graph node registration
3. Signal route generation

Result interface:

```ts
export interface IWebAudioSignalGraphBuildResult {

  readonly graph: IDagGraph;

  readonly nodeMap: ReadonlyMap<IWebAudioNode, IGraphNode>;

  readonly reverseNodeMap: ReadonlyMap<IGraphNode, IWebAudioNode>;

  readonly routes: readonly Association<IWebAudioNode, IWebAudioNode>[];

}
```

Example routing:

```
osc-a → gain-a
osc-b → gain-b
gain-a → mixer-main
gain-b → mixer-main
```

---

# Why a Directed Graph Is Used

The **Web Audio API itself is graph based**.

Audio nodes connect using:

```
AudioNode.connect()
```

Example:

```
oscillator → gain → destination
```

Internally this forms a **directed signal graph**.

The library therefore performs the transformation:

```
Composite Tree
      │
      ▼
Directed Graph
      │
      ▼
Web Audio Runtime Graph
```

Advantages:

| Benefit          | Explanation                                     |
| ---------------- | ----------------------------------------------- |
| Explicit routing | Each connection is a graph edge                 |
| Validation       | Graph cycles and illegal routes can be detected |
| Analysis         | Graph algorithms can be applied                 |
| Visualization    | Graphs are easier to inspect                    |

---

# Runtime Graph Construction

The runtime graph is created by:

```
RuntimeGraphBuilder
```

Responsibilities:

* create Web Audio nodes
* map model nodes to runtime nodes
* connect signal routes
* track startable nodes

Example runtime creation:

```ts
const oscillatorNode = context.createOscillator();

oscillatorNode.frequency.setValueAtTime(node.frequencyHz, context.currentTime);
oscillatorNode.type = node.waveform;
```

Connections are derived from graph edges:

```ts
sourceRuntimeNode.output.connect(targetRuntimeNode.input);
```

---

# Playback Session

Audio execution is managed by:

```
WebAudioPlaybackSession
```

Responsibilities:

* build runtime graph
* connect graph to destination
* start oscillators
* stop nodes
* release runtime resources

Example usage:

```ts
const runtime = new SampleRuntime();

await runtime.play();

runtime.stop();
```

Lifecycle:

```
Composite Tree
      │
      ▼
Signal Graph
      │
      ▼
Runtime Graph
      │
      ▼
AudioContext.destination
```

---

# Runtime Node Wrappers

Runtime nodes encapsulate Web Audio API objects.

Example:

```
OscillatorRuntimeNode
```

Responsibilities:

* start / stop control
* lifecycle management
* cleanup

Example:

```ts
public start(): void {
  this.oscillatorNode.start();
}
```

---

# Extending the Library

The architecture allows extension by introducing new node types.

Example: **Filter node**

---

## Step 1 — Create a model node

```ts
export class FilterNodeModel extends AudioProcessorNodeBase {

  constructor(
    id: string,
    public readonly frequency: number
  ) {
    super(id);
  }

}
```

---

## Step 2 — Create runtime node

```ts
export class FilterRuntimeNode extends WebAudioRuntimeNodeBase {

  constructor(filterNode: BiquadFilterNode) {
    super(filterNode, filterNode);
  }

}
```

---

## Step 3 — Extend the runtime builder

Add creation logic mapping model nodes to runtime nodes.

```
FilterNodeModel → FilterRuntimeNode
```

---

## Step 4 — Add routing support

Update the signal graph builder to recognize the new node type.

---

# Possible Future Extensions

The architecture allows several future features.

### Additional node types

* filters
* delay
* reverb
* envelope generators
* LFOs

### Graph validation

* cycle detection
* topology checks

### Patch serialization

* JSON patch formats
* import/export of audio graphs

### Visual patch editors

Composite trees are well suited for graphical node editors.

### Graph optimizations

Possible runtime transformations:

* node merging
* dead node elimination
* route simplification

---

# Summary

`core-composite-tree-web-audio` models audio systems using a **Composite Tree architecture** that separates audio design from runtime execution.

The system consists of three main stages:

1. Composite tree authoring model
2. Directed signal graph derivation
3. Runtime Web Audio graph construction

This architecture enables:

* structured audio patch modeling
* strong validation rules
* clear execution flow
* extensibility
* compatibility with graph-based Web Audio systems

Composite trees provide a robust abstraction for representing hierarchical audio systems while maintaining compatibility with the directed graph execution model required by the Web Audio API.
