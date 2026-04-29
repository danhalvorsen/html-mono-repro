````md
<!-- FILE: modules.summary.md -->

# Synthesizer Modules Summary

## Package Pattern

Each main synthesizer feature is split into four npm packages.

```text
music-core-synthesizer-<feature>
music-core-synthesizer-<feature>-contracts
music-core-synthesizer-<feature>-ui
music-core-synthesizer-<feature>-web-audio
````

## Responsibility Split

| Package               | Responsibility                                                                                                 |
| --------------------- | -------------------------------------------------------------------------------------------------------------- |
| `<feature>-contracts` | Public abstractions, DTOs, value contracts, ports, events, and message types. No runtime implementation.       |
| `<feature>`           | Domain/application logic for the feature. Uses contracts only. No DOM, no Web Audio, no browser APIs.          |
| `<feature>-ui`        | Web Components and UI event adapters. Emits typed control events/intents. Does not directly control Web Audio. |
| `<feature>-web-audio` | Infrastructure adapter for Web Audio. Converts feature commands/intents into Web Audio nodes and automation.   |

## Dependency Rule

```text
<feature>-ui         -> <feature>-contracts
<feature>            -> <feature>-contracts
<feature>-web-audio  -> <feature>-contracts
<feature>-web-audio  -> <feature>

Application / Demo App composes all packages.
```

Forbidden:

```text
<feature>-contracts -> any implementation package
<feature>           -> UI
<feature>           -> Web Audio
<feature>-ui        -> Web Audio
```

---

# Main Modules

## Oscillators

### Packages

```text
music-core-synthesizer-oscillators
music-core-synthesizer-oscillators-contracts
music-core-synthesizer-oscillators-ui
music-core-synthesizer-oscillators-web-audio
```

### Purpose

Generates periodic waveforms used as the primary sound source.

### Core Concepts

* waveform
* frequency
* detune
* gain
* oscillator start/stop
* oscillator voice assignment

### Contracts Package

Contains:

* oscillator command contracts
* oscillator state contracts
* waveform type definitions
* oscillator control port interfaces
* oscillator event types

### Domain Package

Contains:

* oscillator model
* oscillator parameter validation
* oscillator command handling
* waveform rules
* mapping from control intent to oscillator state

### UI Package

Contains:

* `<oscillator-control>`
* waveform selector
* frequency control
* gain control
* detune control
* UI event emission

The UI emits control events. It does not create `OscillatorNode`.

### Web Audio Package

Contains:

* Web Audio oscillator adapter
* `OscillatorNode` creation
* `GainNode` routing
* frequency automation
* detune automation
* waveform mapping

---

## Envelopes

### Packages

```text
music-core-synthesizer-envelopes
music-core-synthesizer-envelopes-contracts
music-core-synthesizer-envelopes-ui
music-core-synthesizer-envelopes-web-audio
```

### Purpose

Controls how amplitude or modulation changes over time.

### Core Concepts

* attack
* decay
* sustain
* release
* gate on
* gate off
* envelope curve
* normalized envelope shape

### Contracts Package

Contains:

* ADSR value contracts
* envelope command contracts
* envelope target interfaces
* envelope event types

### Domain Package

Contains:

* ADSR validation
* envelope shape rules
* envelope lifecycle logic
* gate transition logic

### UI Package

Contains:

* `<adsr-control>`
* attack slider
* decay slider
* sustain slider
* release slider
* envelope curve visualization
* UI event emission

The UI emits envelope change events. It does not schedule Web Audio automation.

### Web Audio Package

Contains:

* Web Audio envelope adapter
* `AudioParam` automation
* gate-on scheduling
* gate-off scheduling
* ADSR-to-automation translation

---

## Filters

### Packages

```text
music-core-synthesizer-filters
music-core-synthesizer-filters-contracts
music-core-synthesizer-filters-ui
music-core-synthesizer-filters-web-audio
```

### Purpose

Shapes the frequency content of the sound.

### Core Concepts

* low-pass filter
* high-pass filter
* band-pass filter
* cutoff frequency
* resonance / Q
* filter gain
* filter bypass

### Contracts Package

Contains:

* filter type contracts
* filter parameter contracts
* filter command contracts
* filter control port interfaces

### Domain Package

Contains:

* filter parameter validation
* filter state model
* filter command handling
* filter mode rules

### UI Package

Contains:

* `<filter-control>`
* filter type selector
* cutoff control
* resonance control
* bypass toggle
* UI event emission

The UI emits filter control events. It does not create `BiquadFilterNode`.

### Web Audio Package

Contains:

* Web Audio filter adapter
* `BiquadFilterNode` creation
* cutoff automation
* resonance automation
* filter type mapping

---

## Distortion

### Packages

```text
music-core-synthesizer-distortion
music-core-synthesizer-distortion-contracts
music-core-synthesizer-distortion-ui
music-core-synthesizer-distortion-web-audio
```

### Purpose

Adds harmonic saturation, clipping, or waveshaping.

### Core Concepts

* drive
* amount
* mix
* curve
* clipping mode
* bypass

### Contracts Package

Contains:

* distortion parameter contracts
* distortion mode contracts
* distortion command contracts
* distortion control port interfaces

### Domain Package

Contains:

* distortion parameter validation
* curve configuration model
* distortion mode rules
* dry/wet mix logic

### UI Package

Contains:

* `<distortion-control>`
* drive control
* mix control
* mode selector
* bypass toggle
* UI event emission

The UI emits distortion events. It does not create `WaveShaperNode`.

### Web Audio Package

Contains:

* Web Audio distortion adapter
* `WaveShaperNode` creation
* curve generation
* dry/wet routing
* gain staging

---

## Noise

### Packages

```text
music-core-synthesizer-noise
music-core-synthesizer-noise-contracts
music-core-synthesizer-noise-ui
music-core-synthesizer-noise-web-audio
```

### Purpose

Generates noise sources for percussion, texture, and modulation.

### Core Concepts

* white noise
* pink noise
* brown noise
* level
* mix
* noise gate
* noise source lifecycle

### Contracts Package

Contains:

* noise type contracts
* noise parameter contracts
* noise command contracts
* noise source interfaces

### Domain Package

Contains:

* noise configuration model
* noise parameter validation
* noise state transitions
* noise mix rules

### UI Package

Contains:

* `<noise-control>`
* noise type selector
* level control
* mix control
* enable toggle
* UI event emission

The UI emits noise control events. It does not create audio buffers.

### Web Audio Package

Contains:

* Web Audio noise adapter
* noise buffer generation
* looping buffer source handling
* gain routing
* noise type implementation

---

## Voice

### Packages

```text
music-core-synthesizer-voice
music-core-synthesizer-voice-contracts
music-core-synthesizer-voice-ui
music-core-synthesizer-voice-web-audio
```

### Purpose

Coordinates one playable synth voice.

A voice owns the musical lifecycle of one note event.

### Core Concepts

* note on
* note off
* pitch
* velocity
* voice state
* oscillator assignment
* envelope assignment
* filter assignment
* voice output

### Contracts Package

Contains:

* voice command contracts
* voice state contracts
* voice lifecycle interfaces
* voice control port interfaces
* note event contracts

### Domain Package

Contains:

* voice model
* note lifecycle logic
* velocity mapping
* voice state transitions
* command orchestration across oscillator, envelope, filter, and output ports

### UI Package

Contains:

* `<voice-control>`
* note trigger controls
* gate controls
* velocity controls
* voice status display
* UI event emission

The UI emits note and voice control events. It does not create audio nodes.

### Web Audio Package

Contains:

* Web Audio voice adapter
* oscillator-chain composition
* envelope-chain composition
* filter-chain composition
* voice output gain
* voice start/stop scheduling

---

## MIDI

### Packages

```text
music-core-synthesizer-midi
music-core-synthesizer-midi-contracts
music-core-synthesizer-midi-ui
music-core-synthesizer-midi-web-audio
```

### Purpose

Converts MIDI messages and UI gestures into synthesizer control intents.

### Core Concepts

* Note On
* Note Off
* Control Change
* pitch bend
* modulation
* MIDI channel
* MIDI mapping
* UI event to MIDI adapter
* MIDI intent routing

### Contracts Package

Contains:

* MIDI message contracts
* MIDI control intent contracts
* MIDI mapper interfaces
* MIDI sink interfaces
* MIDI source interfaces

### Domain Package

Contains:

* MIDI message parsing
* MIDI message validation
* MIDI-to-control-intent mapping
* CC mapping rules
* note event mapping

### UI Package

Contains:

* virtual MIDI controls
* pads
* knobs
* faders
* transport controls
* XY pads
* UI event adapters

The UI package emits the same MIDI/control intents as hardware MIDI.

### Web Audio Package

Contains:

* adapter from MIDI/control intent to Web Audio-backed synth ports
* optional browser Web MIDI bridge
* MIDI output sink if needed
* MIDI feedback routing if supported

---

## Sequencer

### Packages

```text
music-core-synthesizer-sequencer
music-core-synthesizer-sequencer-contracts
music-core-synthesizer-sequencer-ui
music-core-synthesizer-sequencer-web-audio
```

### Purpose

Schedules notes and control changes over musical time.

### Core Concepts

* step
* pattern
* tempo
* beat
* bar
* transport
* playhead
* loop
* note lane
* automation lane

### Contracts Package

Contains:

* sequencer pattern contracts
* transport command contracts
* timing contracts
* scheduler interfaces
* sequencer event contracts

### Domain Package

Contains:

* pattern model
* timing model
* transport state
* step evaluation
* event scheduling rules

### UI Package

Contains:

* `<sequencer-control>`
* step grid
* play/stop controls
* BPM selector
* playhead display
* lane controls
* UI event emission

The UI emits transport and pattern events. It does not directly schedule Web Audio.

### Web Audio Package

Contains:

* Web Audio clock adapter
* scheduled note dispatch
* lookahead scheduling
* transport synchronization
* timing bridge to voice control ports

---

## Mixer

### Packages

```text
music-core-synthesizer-mixer
music-core-synthesizer-mixer-contracts
music-core-synthesizer-mixer-ui
music-core-synthesizer-mixer-web-audio
```

### Purpose

Combines multiple audio paths into one or more outputs.

### Core Concepts

* channel strip
* gain
* pan
* mute
* solo
* send
* bus
* master output

### Contracts Package

Contains:

* mixer command contracts
* channel contracts
* gain/pan contracts
* mixer port interfaces

### Domain Package

Contains:

* mixer state model
* channel routing rules
* mute/solo logic
* gain validation

### UI Package

Contains:

* `<mixer-control>`
* faders
* pan controls
* mute buttons
* solo buttons
* channel meters
* UI event emission

The UI emits mixer control events. It does not create `GainNode` or `StereoPannerNode`.

### Web Audio Package

Contains:

* Web Audio mixer adapter
* channel gain nodes
* pan nodes
* bus routing
* master output routing

---

# Common Event Flow

```text
Existing UI Control
    ↓
CustomEvent
    ↓
UI Event Adapter
    ↓
Event Handler
    ↓
Mapper / Strategy
    ↓
MIDI Message or Control Intent
    ↓
Feature Control Port
    ↓
Domain Feature
    ↓
Web Audio Adapter
```

# Example: UI Control to MIDI

```text
<oscillator-control>
    emits "oscillator-frequency-changed"
        ↓
DomUiMidiAdapter
        ↓
UiMidiEventHandler
        ↓
ScalarControlChangeMapper
        ↓
MidiControlChangeMessage
        ↓
IMidiMessageSink
```

# Encapsulation Rule

Only the package root should expose public API.

Internal classes stay internal to the package.

```text
src/
  index.ts
  contracts/
  domain/
  application/
  infrastructure/
  internal/
  composition/
```

Recommended export rule:

```text
Export:
- contracts
- public factories
- public ports
- stable DTOs

Do not export:
- DOM adapter internals
- mapper implementations unless extension requires it
- Web Audio node internals
- browser-specific event handlers
```

# Design Rule

Each feature package must be replaceable without changing the others.

Examples:

```text
Replace Web Audio with SPI hardware adapter:
  keep contracts
  keep UI
  keep domain
  replace web-audio package with hardware adapter

Replace UI with hardware MIDI controller:
  keep contracts
  keep domain
  keep web-audio
  replace ui input source

Add new control type:
  add new mapper/adapter
  do not modify existing core logic
```

```
```
