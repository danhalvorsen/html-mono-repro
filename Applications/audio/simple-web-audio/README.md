Based on the exported module code. 

````md
# Simple Web Audio

## 1. What is it?

`simple-web-audio` is a small Web Audio API playground built with Lit.

It defines a composable audio graph where:

- `OscillatorSource` is the audio source
- `FilterUnit` is an audio processing unit
- `AudioGraphBuilder` wires sources and units together
- `BuiltAudioGraph` controls graph lifecycle
- `<audio-player>` is the Lit web component that starts playback from a button

Current graph:

```text
OscillatorSource -> FilterUnit -> AudioContext.destination
````

The default player creates:

* a `sawtooth` oscillator
* frequency `440 Hz`
* a `lowpass` filter
* filter frequency `800 Hz`
* filter Q value `4`
* playback duration of `1000 ms`

---

## 2. How to use it

Import the component once:

```ts
import "./AudioPlayerElement";
```

Use the custom element in HTML:

```html
<audio-player></audio-player>
```

Clicking the button starts the audio graph:

```ts
const oscillator = new OscillatorBuilder(context)
  .type("sawtooth")
  .frequency(440)
  .build();

const filter = new FilterBuilder(context)
  .type("lowpass")
  .frequency(800)
  .q(4)
  .build();

const graph = new AudioGraphBuilder(context)
  .source(oscillator)
  .add(filter)
  .connectToDestination();

graph.start();

window.setTimeout(() => {
  graph.stop();
}, 1000);
```

The graph builder requires a source before connecting:

```ts
new AudioGraphBuilder(context)
  .source(oscillator)
  .add(filter)
  .connectToDestination();
```

If no source is configured, `connectToDestination()` throws:

```ts
throw new Error("Missing audio source.");
```

---

## 3. How to expand it

### Add a new audio unit

Create a class that implements `IAudioUnit`.

```ts
import type { IAudioUnit } from "./IAudioUnit";

export class GainUnit implements IAudioUnit {
  readonly #gain: GainNode;

  public constructor(gain: GainNode) {
    this.#gain = gain;
  }

  public get input(): AudioNode {
    return this.#gain;
  }

  public connect(input: AudioNode): void {
    this.#gain.connect(input);
  }

  public disconnect(): void {
    this.#gain.disconnect();
  }
}
```

Create a builder for it:

```ts
import { GainUnit } from "./GainUnit";

export class GainBuilder {
  readonly #context: AudioContext;
  #gain = 1;

  public constructor(context: AudioContext) {
    this.#context = context;
  }

  public gain(value: number): this {
    this.#gain = value;
    return this;
  }

  public build(): GainUnit {
    const gain = this.#context.createGain();
    gain.gain.value = this.#gain;

    return new GainUnit(gain);
  }
}
```

Use it in the graph:

```ts
const gain = new GainBuilder(context)
  .gain(0.25)
  .build();

const graph = new AudioGraphBuilder(context)
  .source(oscillator)
  .add(filter)
  .add(gain)
  .connectToDestination();
```

Result:

```text
OscillatorSource -> FilterUnit -> GainUnit -> AudioContext.destination
```

### Add more source types

The current source is `OscillatorSource`.

To support another source, create a class that implements `IAudioOutput`:

```ts
import type { IAudioOutput } from "./IAudioOutput";

export class BufferSource implements IAudioOutput {
  readonly #source: AudioBufferSourceNode;

  public constructor(source: AudioBufferSourceNode) {
    this.#source = source;
  }

  public connect(input: AudioNode): void {
    this.#source.connect(input);
  }

  public disconnect(): void {
    this.#source.disconnect();
  }

  public start(): void {
    this.#source.start();
  }

  public stop(): void {
    this.#source.stop();
    this.disconnect();
  }
}
```

### Recommended next improvements

* Rename `OscillatorSource` to a source interface-compatible abstraction, for example `IAudioSource`, because `BuiltAudioGraph` currently depends directly on `OscillatorSource`.
* Add `IAudioSource extends IAudioOutput` with `start()` and `stop()`.
* Change `AudioGraphBuilder.source()` to accept `IAudioSource`.
* Add builders for:

  * `GainNode`
  * `DelayNode`
  * `StereoPannerNode`
  * `DynamicsCompressorNode`
  * `AudioBufferSourceNode`
* Add validation for frequency, Q, gain, and duration values.
* Add tests for graph connection order and missing source behavior.

```
```
