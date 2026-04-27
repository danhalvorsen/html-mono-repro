# Audio-function-midi-streamer 
- Should have 4 npm modules:
- audio-function-midi-streamer-constracts

- audio-function-midi-streamer
- audio-function-midi-streamer-web-audio 
- audio-function-midi-streamer-ui 

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

- Is a Lit3 component that streams MIDI data to Lit3 component that is a <slot> for MIDI data from this component. The can be many other web component that listen to the stream of MIDI from this component
- The component that in songs as prop (input) to the MIDI Streamer 
- The component should have a dropdown down with songs 
- modules-basic-tester applicaiton should have a  json file with songs and their MIDI data. The MIDI Streamer should read the json file and populate the dropdown with the songs. When a song is selected, the MIDI Streamer should stream the MIDI data to the <slot> for MIDI data from this component.           

ANd: <!-- FILE: src/specification.for.ai.md -->

# specification.for.ai.md

## Purpose

This document defines the mandatory engineering standards for all generated or modified code in this codebase.

Any AI-assisted contribution must treat this file as the primary implementation contract unless the task explicitly overrides a rule in writing.

## 1. Core Delivery Expectations

All delivered code must be:
- production-grade
- deterministic
- testable
- maintainable
- cohesive
- extension-friendly
- minimal in public surface area

Do not generate:

- demo code
- placeholder architecture
- pseudo-implementations
- magic strings when a type-safe alternative exists
- hidden globals
- service locator usage
- framework-driven implicit behavior when explicit composition is possible

Prefer correctness and maintainability over brevity.
---

## 2. Architectural Principles

### 2.1 SOLID is mandatory

All code must follow SOLID.
#### Single Responsibility Principle
- each type must have one reason to change
- separate orchestration, domain logic, infrastructure, and mapping concerns
- avoid god objects and mixed responsibilities

#### Open/Closed Principle
- extend behavior through:
  - new implementations
  - strategies
  - policies
  - factories
  - decorators
  - composition
- do not extend behavior by editing stable core logic unless unavoidable
#### Liskov Substitution Principle
- derived or implementing types must honor the contract
- do not weaken preconditions
- do not strengthen postconditions unexpectedly
- avoid inheritance when substitution is questionable

#### Interface Segregation Principle
- prefer small, role-focused interfaces
- do not create wide interfaces that force irrelevant members on consumers

#### Dependency Inversion Principle
- depend on abstractions
- wire dependencies in an explicit composition root
- keep domain and application logic independent from infrastructure details

---

## 3. Clean Architecture Requirements

Use a layered design with clear dependency direction.

### Preferred layers
- Domain
- Application
- Infrastructure
- Presentation / Host / Adapter

### Rules
- Domain must not depend on infrastructure
- Application coordinates use cases through abstractions
- Infrastructure implements abstractions
- Composition root assembles the object graph
- Dependencies must point inward toward policy, not outward toward tooling

---

## 4. Design Requirements

### 4.1 Interface-first design
- define contracts before implementations when appropriate
- public collaboration points should be expressed as interfaces
- concrete types should be replaceable without changing consumers

### 4.2 Composition over inheritance
- prefer composition for behavior assembly
- use inheritance only where there is a real and stable is-a relationship

### 4.3 Encapsulation
- default to internal visibility
- expose only intentionally designed public APIs
- hide implementation details
- preserve invariants inside the owning type

### 4.4 Naming
- use domain language
- use precise and stable names
- avoid vague names such as:
  - Helper
  - Utils
  - Manager
  - BaseThing
  - Misc
- type names must reflect responsibility

### 4.5 No magic strings
Use one of these instead:
- enums
- readonly constants
- discriminated unions
- typed identifiers
- value objects

### 4.6 Determinism
- do not hide randomness, time, or environment access
- abstract system clock, random source, IO, and external dependencies
- inject dependencies explicitly

---

## 5. Preferred Patterns

Use only when justified by the problem.

### Allowed and preferred patterns
- Strategy
- Factory / Abstract Factory
- Builder
- Composite
- Decorator
- Adapter
- Specification
- Policy
- Command / Query
- Mediator
- Repository
- Value Object
- Domain Service
- Result / Error object pattern

### Pattern guidance
- patterns must reduce coupling or improve extension
- do not add patterns as ceremony
- avoid over-engineering for trivial logic

---

## 6. Dependency Injection Rules

- use constructor injection
- use explicit composition root
- avoid service locator
- avoid static mutable state
- no hidden container access from domain types
- object creation responsibilities must be visible and testable

---

## 7. Code Style Requirements

### General
- keep methods short and focused
- avoid deep nesting
- prefer guard clauses
- keep side effects explicit
- keep data flow readable
- do not mix orchestration with business rules

### Type design
- prefer immutable value objects where possible
- validate invariants at boundaries
- use readonly when possible
- avoid primitive obsession where domain meaning matters

### Error handling
- fail clearly
- use typed results or explicit exceptions consistently
- do not swallow exceptions
- do not return ambiguous null/undefined values without clear contract semantics

---

## 8. TypeScript-Specific Rules

### Compiler and typing
- strict mode expected
- avoid `any`
- prefer `unknown` over `any` where uncertainty exists
- narrow types explicitly
- use discriminated unions where useful
- keep exported surface intentional
- prefer interfaeces vs types based on use case (interfaces for contracts, types for unions and mapped types)
### Modules
- keep files cohesive
- export only what is required
- prefer barrel files only when they improve clarity and are controlled

### API design
- prefer interfaces for contracts
- prefer readonly arrays and readonly properties for query-style APIs
- use branded or domain-specific types when identity matters

---

## 9. C#-Specific Rules

When delivering C#:

- use clean namespaces by domain/capability
- default to `internal`
- expose only intentional `public` APIs
- use constructor injection
- use records/value objects where appropriate
- use interfaces for stable collaboration points
- avoid static service access
- avoid anemic abstractions and oversized services

---

## 10. Testing Standard

All code deliveries must include tests unless the task explicitly states otherwise.

### Required testing style
BDD-style tests are expected.

Examples:
- `describe`, `it`, `should`
- scenario-oriented naming
- behavior-focused assertions

### Test expectations
- test public behavior, not private implementation
- cover success paths
- cover failure paths
- cover edge cases
- use shared fixtures to reduce duplication
- keep fixtures deterministic and explicit
- avoid brittle mocks
- mock only true boundaries

### Unit test rules
- one logical behavior per test
- arrange/act/assert structure should be clear
- no hidden test setup magic
- names should describe observable behavior

### Integration tests
Use where composition or infrastructure contracts matter.

---
## 10. Task Interpretation Rules
If the task is ambiguous, prefer the simplest interpretation that satisfies the requirements.

Do not assume missing context—ask for clarification instead of guessing.

Do not infer domain concepts not explicitly stated.

Do not generate examples unless explicitly requested.

## 11. BDD Test Conventions

When generating tests, prefer behavior phrasing such as:

- should create a valid result when input is valid
- should reject invalid state transitions
- should delegate to the configured strategy
- should preserve invariant X when operation Y occurs
- should return deterministic output for known input
- should throw when required dependency is missing

### Fixture guidance
- create reusable fixture builders for repeated setup
- fixtures must stay explicit
- fixtures must not hide important test intent
- sample data must be realistic and named

---

## 12. Output Format for AI Code Delivery

When generating code for this repository, use this output structure:

1. Code first
2. Minimal technical explanation after code
3. Keep explanation short and implementation-focused
4. Do not add unnecessary narrative

### Delivery expectations
- provide complete snippets, not partial fragments, unless explicitly requested
- preserve folder intent when file structure is relevant
- do not invent extra modules unless justified
- prefer a single coherent solution over many alternatives unless asked

---

## 13. Change Rules for Existing Code

When modifying existing code:

- preserve established architecture unless change is required
- do not widen public APIs without reason
- do not break contracts silently
- prefer extension over intrusive rewrite
- remove duplication when safe
- keep behavior backward compatible unless instructed otherwise

If a tradeoff is required, prefer:
1. correctness
2. maintainability
3. extensibility
4. performance
5. brevity

---

## 14. Non-Negotiable Prohibitions

Do not generate:

- service locator patterns
- hidden singleton dependencies
- magic strings for core domain decisions
- mixed infrastructure/domain logic
- large multipurpose classes
- fragile inheritance hierarchies
- speculative abstractions with no consumer
- test code without assertions
- random examples without domain relevance

I want C:\Users\danha\source\repos\HTML\MonoRepro\packages\Audio\project-x-ray-sound-magic\music-core-synthesizer\functional-modules\midi-streamer 
[text](audio-function-midi-streamer) [text](audio-function-midi-streamer-contracts) [text](audio-function-midi-streamer-contracts-web-audio) [text](audio-function-midi-streamer-ui) to be puplulated with module as npm modules equal to  the other modules I have been making (under:C:\Users\danha\source\repos\HTML\MonoRepro\packages\Audio\project-x-ray-sound-magic\music-core-synthesizer\modules )

Make  a powershell script that does the job of creating the 4 npm modules for the MIDI Streamer feature under the specified path, following the same structure as the other modules. The script should create the necessary folder structure and initialize each module with a basic `package.json` file.

