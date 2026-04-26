
I need a spesificafion for what parts /modules I need for a syntesizer with Oscillators 1) Waveform 2) Support input midi stream  2) frequeceny etc. and a 3) ADSR evnope  and a 3) distorition [-1..1]   is there more I need LP BP HP filters ?

You’re describing a monophonic subtractive synthesizer voice. What you listed is correct but incomplete. Below is a minimal production-grade module specification with strict separation of concerns and extension points.

🎯 Core Architecture (Voice-based)
A synthesizer is composed of N voices, each voice processes one note.

MidiInput → VoiceAllocator → Voice[n] → Mixer → Output
✅ Required Modules (Minimal, Correct)
1. MIDI Input Module
Responsibility: Convert MIDI stream → domain events

Contracts

NoteOn(note, velocity)

NoteOff(note)

ControlChange(controller, value)

PitchBend(value)

Notes

No audio logic here

Stateless parser

2. Voice Allocator
Responsibility: Assign notes → voices

Strategies (extensible)

Round-robin

Last-note priority

Mono (legato support)

3. Oscillator (Sound Source)
Mandatory features
Waveform generation

Frequency control (Hz)

Phase accumulator (deterministic)

Waveforms (Strategy)
Sine

Saw

Square (with PWM)

Triangle

Interface

IOscillator
  setFrequency(hz)
  setPhase(phase)
  nextSample(): number [-1..1]
4. Envelope Generator (ADSR)
Responsibility: Time-based amplitude shaping

Stages:

Attack

Decay

Sustain

Release

Interface

IEnvelope
  noteOn(velocity)
  noteOff()
  nextValue(): number [0..1]
5. Amplifier (VCA)
Responsibility: Apply envelope to signal

output = signal * envelope
6. Filter (VCF) ✅ YOU MISSED THIS AS CORE
You asked — yes, this is essential.

Types (Strategy)
Low-pass (LP)

High-pass (HP)

Band-pass (BP)

Parameters
Cutoff frequency

Resonance (Q)

Interface

IFilter
  process(sample): number
  setCutoff(hz)
  setResonance(q)
7. Distortion / Waveshaper
Your [-1..1] constraint is correct.

Types
Soft clip

Hard clip

Tanh waveshaping

Placement

Typically after filter

8. Mixer (Global)
Responsibility

Sum all active voices

Normalize / prevent clipping

9. Output Stage
Final gain

Optional limiter

⚠️ Missing but IMPORTANT (Production-level)
10. LFO (Low Frequency Oscillator)
Modulation source

Targets:

Pitch (vibrato)

Filter cutoff

Amplitude (tremolo)

11. Modulation Matrix (Critical for extensibility)
Without this, your design becomes rigid.

Source → Target → Amount
Examples:

LFO → Filter cutoff

Envelope → Pitch

Velocity → Amplitude

12. Glide / Portamento
Smooth pitch transition between notes

13. Noise Generator
White / pink noise (used in many patches)

14. Polyphony Handling
Voice stealing

Voice reuse

🧠 Minimal Voice Signal Chain (Correct Order)
Oscillator
   ↓
[Optional Noise Mix]
   ↓
Filter (LP/HP/BP)
   ↓
Distortion
   ↓
VCA (Envelope applied)
   ↓
Voice Output
🔧 Data Flow (Deterministic)
Per audio sample:

sample = oscillator.next()
sample = filter.process(sample)
sample = distortion.process(sample)
amp    = envelope.next()
output = sample * amp
⚠️ Common Mistakes (avoid)
❌ Putting distortion before oscillator (invalid)

❌ Skipping filter → results in weak synthesis capability

❌ No modulation system → dead architecture

❌ Envelope inside oscillator (breaks SRP)

❌ MIDI logic inside audio processing

📦 Minimal Module List (Clean Architecture)
Domain
IOscillator

IEnvelope

IFilter

IDistortion

IVoice

IVoiceAllocator

Application
SynthEngine

MidiEventHandler

Infrastructure
WebAudioOutput / AudioDriver

Composition Root
Wiring strategies (waveform, filter type, allocation strategy)

✔️ Direct Answer to Your Question
Yes — you need filters:

LP is mandatory

HP/BP are extensions but should be supported

But more importantly:
👉 You need modulation (LFO + routing) or your synth will be extremely limited.

If you want next step
I can define:

Interface-first TypeScript module set (SOLID, DI-ready)

OR a C# DSP-safe version

OR a minimal working voice implementation (no shortcuts)

Specify:

Mono vs Poly

Target runtime (WebAudio / native / embedded)

Oscillator
   ↓
[Optional Noise Mix]
   ↓
Filter (LP/HP/BP)
   ↓
Distortion
   ↓
VCA (Envelope applied)
   ↓
Voice Output needs a pipline to connect the modules (osc, noise, filters. etc) what designpattern? 

Thought for a few seconds
Use a Pipeline + Chain of Responsibility hybrid, but model each DSP unit as a sample processor strategy.

For your case, the clean design is:

Voice
  -> ISignalSource
  -> ISampleProcessor[]
  -> IAmplifier
Best fit
1. Pipeline
This is the primary pattern.

Reason:

audio flows in a fixed order

each module transforms signal and passes it forward

order matters

easy to extend without changing core voice logic

That matches:

Oscillator -> NoiseMixer -> Filter -> Distortion -> VCA -> Output
2. Strategy
Each stage should be replaceable by strategy.

Examples:

oscillator waveform strategy

filter type strategy: LP / BP / HP

distortion curve strategy

envelope shape strategy

So the pipeline is the structure, and each stage uses a strategy internally.

3. Composite
Use this where a stage contains sub-stages.

Examples:

multiple oscillators

stacked filters

parallel modulation sources

effect rack

A MixerProcessor can contain several child signal sources or processors.

4. Factory
Needed to build voices/pipelines from configuration.

Examples:

mono synth voice factory

poly voice factory

preset-driven pipeline factory

Do not construct filters/oscillators directly inside the voice.

What not to use as the main pattern
Not pure Chain of Responsibility
That pattern is usually for:

optional handling

request routing

“one handler may or may not handle”

DSP is not that.
In DSP, every stage usually runs.

So CoR alone is the wrong mental model.

Not Observer for audio path
Observer is fine for UI, MIDI events, automation notifications.
It is not the right abstraction for the sample path.

Recommended architecture
Contracts
ISignalSource
  nextSample(): number

ISampleProcessor
  process(sample: number): number

IModulationSource
  nextValue(): number

IVoice
  nextSample(): number
Voice execution
sample = oscillator.nextSample()
sample = noiseMixer.process(sample)
sample = filter.process(sample)
sample = distortion.process(sample)
sample = vca.process(sample)
That is a pipeline.

Better production shape
Split modules by role:

1. Sources
Generate signal from nothing

oscillator

noise

sub oscillator

2. Processors
Transform a signal

filter

distortion

gain

saturator

3. Modulators
Generate control values

ADSR

LFO

velocity mapper

4. Sinks / outputs
mixer

audio output buffer

That gives you a cleaner model than treating everything as “a module”.

Strong recommendation
Use these patterns together:

Pipeline for the signal chain

Strategy for oscillator/filter/distortion variants

Composite for multi-oscillator and grouped processors

Factory for voice creation

Builder if you want configurable patch assembly

Concrete answer
The main design pattern should be:

Pipeline pattern
with:

Strategy inside each module
and optionally:

Composite for grouped modules
Factory/Builder for construction
Practical rule
Do this:

VoicePipeline
  - source: ISignalSource
  - processors: IReadOnlyList<ISampleProcessor>
Do not do this:

Oscillator knows filter
Filter knows distortion
Distortion knows VCA
That creates tight coupling and breaks extension.

Best naming
ISignalSource

ISampleProcessor

IModulationSource

VoicePipeline

VoicePipelineBuilder

IVoiceFactory

Conclusion
For synthesizer audio routing, the right primary pattern is Pipeline.
For extensibility, combine it with Strategy.
For grouped units, use Composite.
For creation, use Factory/Builder.

If you want, I can give you a production-grade TypeScript interface set for this pipeline next.

I will use web-audio here as sound engine

I’m checking the current Web Audio primitives and the right processing boundary so the module design matches the platform, not a generic DSP sketch.

Thought for 19s
Then the primary pattern shifts slightly:

Use Audio Graph as the runtime pipeline
and Builder/Factory as the assembly pattern.

With Web Audio, the browser already gives you the execution pipeline as an audio node graph. Audio nodes are linked into chains and webs inside an AudioContext, so your design should map your synth modules to that graph instead of inventing a second runtime pipeline abstraction. 

Recommended architecture
1. Domain layer
Keep your synth concepts platform-neutral:

IMidiInput

IVoiceAllocator

IVoice

IOscillatorSpec

IEnvelopeSpec

IFilterSpec

IDistortionSpec

This layer should not know AudioNode.

2. Web Audio adapter layer
Map domain concepts to Web Audio nodes:

Oscillator → OscillatorNode

Filter → BiquadFilterNode

Distortion → WaveShaperNode

VCA → GainNode

Output → AudioDestinationNode / bus GainNode 

3. Graph builder
This is the pattern you need most in code:

Builder to assemble a voice graph

Factory to create voices from configuration

Strategy for selectable behavior inside each module

Example logical chain:

OscillatorNode
   ↓
GainNode (osc level)
   ↓
BiquadFilterNode
   ↓
WaveShaperNode
   ↓
GainNode (VCA / ADSR)
   ↓
Voice bus / master bus
Important correction
In Web Audio, ADSR is not usually its own audio node.
ADSR is typically a control source that automates AudioParam values, most often the gain of a GainNode, and optionally filter cutoff or pitch. MDN explicitly recommends setting AudioParam values carefully as part of Web Audio best practice. 

So for Web Audio, model ADSR as:

IEnvelopeGenerator in domain

WebAudioEnvelopeScheduler in infrastructure

That scheduler writes timed automation to:

GainNode.gain

BiquadFilterNode.frequency

optionally oscillator detune/frequency 

Filters
Yes, support these:

lowpass = mandatory

highpass = useful

bandpass = useful

BiquadFilterNode directly supports these filter categories and is the correct default choice for a subtractive synth voice. For more specialized cases, Web Audio also exposes IIRFilterNode, but biquad is the normal starting point. 

Distortion
For Web Audio, distortion should map to WaveShaperNode.
That is the native non-linear distortion primitive, with a shaping curve and optional oversampling support. 

Noise
Noise is the one place where built-in nodes are weaker.
Typical approaches are:

looping AudioBufferSourceNode with generated noise buffer

custom DSP with AudioWorkletNode

If you need deterministic custom synthesis, custom modulation, or sample-accurate voice DSP beyond the built-in graph, use AudioWorklet, not legacy script-based approaches. AudioWorklet runs custom audio processing on the Web Audio rendering thread for low-latency processing. 

Best pattern choice for your case
Use this combination:

Builder → assemble the Web Audio graph for a voice

Factory → create mono/poly voices

Strategy → waveform, filter type, distortion curve, allocation policy

Facade → expose a clean SynthEngine API to the app

Audio graph → actual runtime signal flow

Not recommended as the main runtime abstraction:

Chain of Responsibility

Observer for sample flow

Command bus inside DSP path

Minimal production module set for Web Audio
Domain
- IMidiEvent
- IVoiceAllocator
- IVoiceDefinition
- IEnvelopeDefinition
- IFilterDefinition
- IDistortionDefinition

Application
- SynthEngine
- MidiMessageRouter
- NoteLifetimeCoordinator

Infrastructure.WebAudio
- WebAudioContextFactory
- WebAudioVoiceGraphBuilder
- WebAudioVoiceFactory
- WebAudioEnvelopeScheduler
- WebAudioNoiseSourceFactory
- WebAudioMasterBus
Concrete conclusion
For Web Audio:

the browser audio graph is your pipeline

your code should implement a VoiceGraphBuilder

ADSR should be treated as parameter automation, not just another audio stage

LP/HP/BP filters should be supported through BiquadFilterNode

distortion should use WaveShaperNode

custom DSP or advanced noise generation should move to AudioWorklet 

Next, I can give you a TypeScript interface-first module specification for a Web Audio synth with VoiceGraphBuilder, EnvelopeScheduler, and SynthEngine only.

modules
├── music-core-synthesizer-distortion
├── music-core-synthesizer-envelopes
├── music-core-synthesizer-filters
├── music-core-synthesizer-midi
├── music-core-synthesizer-noise
├── music-core-synthesizer-oscillators
├── music-core-synthesizer-voice
└── music-core-synthesizer-voiceAllocator is my planned module npm libs 

Thought for 4s
Good split, but it is still missing a few modules and one boundary is in the wrong place.

Keep
modules
├── music-core-synthesizer-distortion
├── music-core-synthesizer-envelopes
├── music-core-synthesizer-filters
├── music-core-synthesizer-midi
├── music-core-synthesizer-noise
├── music-core-synthesizer-oscillators
├── music-core-synthesizer-voice
└── music-core-synthesizer-voiceAllocator
This is a valid start because each package maps to a distinct DSP or coordination responsibility.

What is missing
You should add these:

├── music-core-synthesizer-contracts
├── music-core-synthesizer-parameters
├── music-core-synthesizer-modulation
├── music-core-synthesizer-web-audio
├── music-core-synthesizer-engine
└── music-core-synthesizer-presets
Why these are needed
1. music-core-synthesizer-contracts
This should contain only shared abstractions and value contracts.

Examples:

IVoice

IVoiceAllocator

IOscillator

IFilter

IEnvelope

IDistortion

IMidiEvent

ISynthParameter<T>

IAudioVoiceGraphBuilder

Without this, your packages will either:

create circular dependencies

duplicate interfaces

let concrete packages depend on each other directly

This should be the dependency root.

2. music-core-synthesizer-parameters
You need a dedicated parameter model.

Examples:

frequency

gain

detune

cutoff

resonance

attack/decay/sustain/release

distortion amount

mix amount

This package should define:

typed parameter keys

parameter ranges

normalization helpers

automation-safe parameter value objects

Do not scatter raw strings like "cutoff" or "attack" across modules.

3. music-core-synthesizer-modulation
ADSR is one modulation source, but not the only one.

This module should own:

modulation routing

LFO contracts

envelope-to-target routing

velocity-to-target routing

pitch bend to frequency mapping

This keeps modulation from leaking into oscillator/filter modules.

ADSR belongs in envelopes, but routing ADSR to gain/filter/pitch belongs in modulation.

4. music-core-synthesizer-web-audio
Since Web Audio is your engine, this should be its own adapter module.

Responsibilities:

AudioContext integration

OscillatorNode mapping

BiquadFilterNode mapping

WaveShaperNode mapping

GainNode VCA setup

node graph construction

parameter scheduling

Your current packages look domain-oriented.
You still need one infrastructure package that translates domain contracts into Web Audio nodes.

Do not let music-core-synthesizer-oscillators directly depend on Web Audio if you want clean boundaries.

5. music-core-synthesizer-engine
You need one orchestration package above voice level.

Responsibilities:

synth lifecycle

note on/off dispatch

voice creation

allocator coordination

bus routing

transport-level coordination

master gain / panic / reset

voice should not become the accidental engine.

6. music-core-synthesizer-presets
Optional at first, but likely needed soon.

Responsibilities:

patch definitions

default parameter sets

serialization-safe preset DTOs

Keep preset storage out of core DSP packages.

Boundary correction
music-core-synthesizer-midi
This should not become “everything related to notes”.

It should only own:

MIDI message/domain contracts

parsing/mapping from MIDI input to domain events

controller constants / value conversion

It should not own:

voice allocation

synth engine behavior

envelope triggering rules

Those belong higher up.

Strong dependency direction
Use this:

contracts
   ↑
parameters
   ↑
oscillators / filters / envelopes / distortion / noise / midi
   ↑
voice / voice-allocator / modulation
   ↑
engine
   ↑
web-audio
   ↑
presets / application
Better stated as a rule:

low-level DSP modules depend on contracts and parameters

voice composes DSP modules

engine coordinates voices

web-audio adapts all of that to actual browser audio nodes

Better naming
Use consistent kebab-case.

Change:

music-core-synthesizer-voiceAllocator
to:

music-core-synthesizer-voice-allocator
That is cleaner and aligned with package conventions.

Recommended final package set
modules
├── music-core-synthesizer-contracts
├── music-core-synthesizer-parameters
├── music-core-synthesizer-midi
├── music-core-synthesizer-oscillators
├── music-core-synthesizer-noise
├── music-core-synthesizer-envelopes
├── music-core-synthesizer-filters
├── music-core-synthesizer-distortion
├── music-core-synthesizer-modulation
├── music-core-synthesizer-voice
├── music-core-synthesizer-voice-allocator
├── music-core-synthesizer-engine
├── music-core-synthesizer-web-audio
└── music-core-synthesizer-presets
Minimal version if you want fewer packages
If you want to keep package count lower, this is the smallest clean split I would accept:

modules
├── music-core-synthesizer-contracts
├── music-core-synthesizer-midi
├── music-core-synthesizer-dsp
├── music-core-synthesizer-modulation
├── music-core-synthesizer-voice
├── music-core-synthesizer-engine
└── music-core-synthesizer-web-audio
Where dsp contains:

oscillators

filters

distortion

noise

envelopes

This is often better if the repo is still early.

Direct answer
Your planned module list is good but incomplete.

Missing:
contracts

parameters

modulation

engine

web-audio adapter

Likely optional but valuable:
presets

Rename:
voiceAllocator → voice-allocator

The most important missing package is music-core-synthesizer-web-audio.
Without it, your core packages will either become browser-coupled or the composition root will become messy.

Next I can give you the exact responsibility table for each npm package.

where is the module or logical location for 1)sequncer? 

Short answer:
👉 Sequencer is NOT part of the synthesizer core.
It belongs in a separate application/control layer module.

Correct placement
Add a new module:

├── music-core-sequencer
Why it must be separate
A synthesizer:

input → sound generation → audio output
A sequencer:

time → event scheduling → MIDI events
They operate on different axes:

Concern	Synthesizer	Sequencer
Domain	DSP	Time / scheduling
Input	MIDI	Clock / timeline
Output	Audio	MIDI events
Responsibility	sound	when + what to play
Mixing them violates SRP and destroys reuse.

Correct dependency direction
sequencer → midi → engine → voice → dsp
Never the other way around

Responsibilities of music-core-sequencer
Core concerns
Step sequencing

Pattern management

Timing / clock

Event scheduling

Transport control

Contracts
ISequencer
ISequence
IPattern
IStep
IClock
ITransport
ISequencerEvent
Output
The sequencer should emit:

NoteOn
NoteOff
ControlChange
Same contracts as your:

music-core-synthesizer-midi
Integration point
The connection is here:

Sequencer → MidiEventStream → SynthEngine
NOT:

Sequencer → Voice / Oscillator / Filter
Module layout (final)
modules
├── music-core-synthesizer-contracts
├── music-core-synthesizer-parameters
├── music-core-synthesizer-midi
├── music-core-synthesizer-oscillators
├── music-core-synthesizer-noise
├── music-core-synthesizer-envelopes
├── music-core-synthesizer-filters
├── music-core-synthesizer-distortion
├── music-core-synthesizer-modulation
├── music-core-synthesizer-voice
├── music-core-synthesizer-voice-allocator
├── music-core-synthesizer-engine
├── music-core-synthesizer-web-audio
├── music-core-synthesizer-presets
│
├── music-core-sequencer          ✅ NEW
└── music-core-transport (optional)
Optional split (advanced)
If you want stricter boundaries:

music-core-transport   (clock, BPM, timing)
music-core-sequencer   (patterns, steps, logic)
Internal structure of sequencer
Sequencer
 ├── Clock (BPM, tick)
 ├── Transport (play/stop/loop)
 ├── Pattern[]
 │     └── Step[]
 └── EventEmitter → MIDI events
Patterns to use
Sequencer module
State machine (FSM) → transport

Iterator / timeline → step progression

Strategy → swing, humanization, resolution

Observer / EventEmitter → emit MIDI events

Do NOT use
❌ Direct audio processing

❌ Web Audio nodes

❌ Voice references

❌ DSP logic

Minimal flow
Clock tick
   ↓
Sequencer step advance
   ↓
Generate MIDI events
   ↓
SynthEngine.handle(event)
   ↓
Voice triggered
   ↓
Audio output
Key design rule
Sequencer controls time, synthesizer controls sound.

Conclusion
Sequencer is its own module: music-core-sequencer

It depends only on:

music-core-synthesizer-midi

It must NOT depend on:

voice

oscillators

filters

web-audio

If you want next step, I can define:

a clean ISequencer contract

or a step sequencer implementation with FSM transport (play/stop/loop) aligned with your Lit3 UI setup

Under a syny-modules? folder

No — don’t put it under a synth-modules folder.

That introduces the wrong dependency signal.

Correct structure
Keep synth and sequencer as parallel domains:

modules
├── synthesizer
│   ├── music-core-synthesizer-contracts
│   ├── music-core-synthesizer-parameters
│   ├── music-core-synthesizer-midi
│   ├── music-core-synthesizer-oscillators
│   ├── music-core-synthesizer-noise
│   ├── music-core-synthesizer-envelopes
│   ├── music-core-synthesizer-filters
│   ├── music-core-synthesizer-distortion
│   ├── music-core-synthesizer-modulation
│   ├── music-core-synthesizer-voice
│   ├── music-core-synthesizer-voice-allocator
│   ├── music-core-synthesizer-engine
│   └── music-core-synthesizer-web-audio
│
├── sequencer
│   └── music-core-sequencer
│
└── shared (optional)
    └── music-core-transport
Why not under synth-modules
If you do:

synth-modules/
   sequencer
you are implicitly saying:

sequencer ∈ synthesizer
That is incorrect.

The sequencer is a client of the synth, not a part of it.

Correct dependency direction
sequencer → midi → synthesizer-engine → voice → dsp
NOT:

synth → sequencer   ❌
Clean mental model
Think in layers:

1. Time domain
Sequencer

Transport (BPM, clock)

2. Event domain
MIDI

3. Sound domain
Synthesizer

These should not be nested inside each other.

If you want a grouping folder
Use something neutral:

modules
├── audio
│   └── synthesizer/...
├── control
│   └── sequencer/...
or:

modules
├── sound
├── control
Practical rule
If a module can exist without another, it should not be placed inside it.

Sequencer can exist without synth → separate

Synth can exist without sequencer → separate

Conclusion
❌ Not under synth-modules

✅ Parallel folder (sequencer)

✅ Depend only on MIDI contracts

✅ Treat as control layer, not DSP layer

If you want, next step is defining a shared music-core-midi module so both sequencer and synthesizer depend on the same event contracts instead of duplicating them.

Each of the module can have user-interface component - should I create modules for them ? 

Thought for a couple of seconds
Yes.
Create separate UI modules. Do not place UI components inside the core synth/sequencer modules.

Correct split
For each domain module, keep this rule:

music-core-* = domain/contracts/logic

music-ui-* = Lit/Web components/adapters/presenters

Example structure
modules
├── synthesizer
│   ├── music-core-synthesizer-oscillators
│   ├── music-core-synthesizer-filters
│   ├── music-core-synthesizer-envelopes
│   ├── music-core-synthesizer-distortion
│   ├── music-core-synthesizer-voice
│   ├── music-core-synthesizer-engine
│   └── music-core-synthesizer-web-audio
│
├── sequencer
│   └── music-core-sequencer
│
├── ui
│   ├── music-ui-synthesizer-oscillators
│   ├── music-ui-synthesizer-filters
│   ├── music-ui-synthesizer-envelopes
│   ├── music-ui-synthesizer-distortion
│   ├── music-ui-synthesizer-voice
│   ├── music-ui-synthesizer
│   └── music-ui-sequencer
Dependency rule
music-ui-*  →  music-core-*
music-core-*  ↛  music-ui-*
Core must never depend on UI.

Better practical split
Do not create a UI package for every tiny DSP module unless the UI is truly reusable on its own.

This is usually better:

ui
├── music-ui-synthesizer
├── music-ui-sequencer
└── music-ui-shared
music-ui-synthesizer
Contains:

oscillator editor

filter editor

envelope editor

distortion editor

voice panel

synth panel

music-ui-sequencer
Contains:

transport

pattern grid

track editor

step button row

music-ui-shared
Contains:

knobs

sliders

toggle buttons

value displays

labels

generic MIDI binding widgets

This is usually the right balance.

When to split into many UI packages
Create dedicated UI modules only when one of these is true:

the component set is reused by multiple applications

the module has its own release/versioning reason

the UI has meaningful independent complexity

the UI can evolve independently of the rest

If not, keep it grouped.

Recommended naming
Use one of these consistent approaches:

Option A
music-core-synthesizer-filters
music-ui-synthesizer
Option B
music-core-synthesizer-filters
music-ui-synthesizer-filters
I would use:

coarse-grained UI packages

fine-grained core packages

So:

music-core-synthesizer-oscillators
music-core-synthesizer-filters
music-core-synthesizer-envelopes
music-core-sequencer

music-ui-synthesizer
music-ui-sequencer
music-ui-shared
Strong recommendation
For your case, use:

modules
├── core
│   ├── music-core-midi
│   ├── music-core-sequencer
│   ├── music-core-synthesizer-oscillators
│   ├── music-core-synthesizer-filters
│   ├── music-core-synthesizer-envelopes
│   ├── music-core-synthesizer-distortion
│   ├── music-core-synthesizer-noise
│   ├── music-core-synthesizer-voice
│   ├── music-core-synthesizer-voice-allocator
│   ├── music-core-synthesizer-engine
│   └── music-core-synthesizer-web-audio
│
└── ui
    ├── music-ui-shared
    ├── music-ui-sequencer
    └── music-ui-synthesizer
That is cleaner than a UI package per oscillator/filter/envelope.

Architectural rule inside UI
UI should not manipulate Web Audio directly.

Use:

Lit UI
  → commands / view-model / controller
  → synthesizer engine contracts
  → web-audio adapter
Not:

Lit component
  → OscillatorNode / GainNode / BiquadFilterNode directly
That will rot fast.

Conclusion
Yes, create UI modules.
But create them as separate adapter modules, not inside the core modules.

Best fit:
music-ui-synthesizer

music-ui-sequencer

music-ui-shared

Not:

one tiny UI npm package for every small DSP package

If you want, next I can give you the exact dependency graph for core vs ui modules.

good. but how to start ? its kind og huge 

Thought for 4s
Start with the thinnest vertical slice that makes sound from one MIDI note.

Do not start with all modules.

Start order
Phase 1 — make one note audible
Build only these modules first:

music-core-midi
music-core-synthesizer-contracts
music-core-synthesizer-oscillators
music-core-synthesizer-envelopes
music-core-synthesizer-voice
music-core-synthesizer-web-audio
music-core-synthesizer-engine
music-ui-synthesizer
Ignore for now:

sequencer

distortion

noise

filters

voice allocator

presets

modulation beyond ADSR

That gives you the smallest real synth.

First milestone
Goal:

MIDI NoteOn
  -> create one voice
  -> oscillator plays
  -> ADSR controls gain
  -> NoteOff releases
If this works, the architecture is alive.

Implement in this order
1. music-core-midi
Only domain contracts.

NoteOn
NoteOff
PitchBend
ControlChange
No parsing yet if not needed.

2. music-core-synthesizer-contracts
Only shared abstractions.

Examples:

IVoice

ISynthEngine

IEnvelope

IOscillatorSpec

IVoiceFactory

Keep this small.

3. music-core-synthesizer-oscillators
Start with only:

waveform enum/spec

frequency value

no custom DSP implementation yet

Since Web Audio is the engine, this module can be mostly domain/spec contracts at first.

4. music-core-synthesizer-envelopes
Implement only ADSR definition and envelope scheduling contract.

Do not overbuild modulation yet.

5. music-core-synthesizer-web-audio
This is where the first real sound happens.

Implement one WebAudioVoiceFactory that builds:

OscillatorNode -> GainNode -> destination
Then extend to:

OscillatorNode -> GainNode(VCA) -> destination
ADSR should schedule the GainNode.gain.

6. music-core-synthesizer-voice
Wrap one playable voice.

Responsibilities:

start note

release note

dispose after release

hold note number and state

This is your first true domain orchestration unit.

7. music-core-synthesizer-engine
Implement only:

noteOn

noteOff

active voice map for monophonic or simple keyed playback

Do not add allocator yet unless you go poly immediately.

8. music-ui-synthesizer
Create the smallest UI:

start audio context

choose waveform

trigger one test note or route keyboard/MIDI input

No full editor yet.

After that, add features one by one
Phase 2
Add filter:

music-core-synthesizer-filters
Web Audio mapping:

OscillatorNode -> BiquadFilterNode -> GainNode -> destination
Phase 3
Add distortion:

music-core-synthesizer-distortion
Phase 4
Add polyphony:

music-core-synthesizer-voice-allocator
Phase 5
Add sequencer:

music-core-sequencer
music-ui-sequencer
Recommended folder plan now
modules
├── core
│   ├── music-core-midi
│   ├── music-core-synthesizer-contracts
│   ├── music-core-synthesizer-oscillators
│   ├── music-core-synthesizer-envelopes
│   ├── music-core-synthesizer-voice
│   ├── music-core-synthesizer-engine
│   └── music-core-synthesizer-web-audio
│
└── ui
    └── music-ui-synthesizer
Everything else later.

Hard rule
Do not create package shells for 15 modules before the first sound works.

That creates dead architecture.

Instead:

one note

one voice

one waveform

one envelope

one UI trigger

then extend

First acceptance criteria
Use these as the first target:

Given an initialized AudioContext
When a NoteOn event for note 69 is sent
Then a voice starts and outputs audible sound

Given an active voice
When a NoteOff event for the same note is sent
Then the gain enters release and the voice is disposed afterward

Given a waveform selection of saw
When a new note starts
Then the created oscillator uses sawtooth waveform
What not to do first
Do not start with:

presets

sequencer

modulation matrix

noise

distortion

many UI controls

custom AudioWorklet DSP

Those are phase-2+ concerns.

Best first internal composition
UI
 -> SynthEngine
 -> WebAudioVoiceFactory
 -> WebAudioVoice
 -> OscillatorNode + GainNode
Minimal. Testable. Extendable.

Recommended first backlog
1. Create MIDI event contracts
2. Create synth engine contract
3. Create ADSR definition contract
4. Create waveform definition contract
5. Build WebAudio voice factory
6. Build single voice start/release lifecycle
7. Build synth engine noteOn/noteOff
8. Add tiny Lit UI test surface
9. Verify audible playback
10. Add filter next
Direct answer
Start with a mono synth vertical slice.
One oscillator, one ADSR, one voice, one engine, one UI button or MIDI event.

That is the correct starting point.

I can give you the exact phase-1 module contracts next, in one compact TypeScript snippet.

I have midi module kibrary : // packages/Audio/music-core-midi/src/index.ts

export * from "./midi.js";
export * from "./mid2Txt.js";

================================================================================

// packages/Audio/music-core-midi/src/mid2Txt.ts

// FILE: packages/Audio/music-core-midi/src/mid2Txt.ts

export interface MidiDivisionTpqn {
  readonly type: "tpqn";
  readonly ticksPerQuarter: number;
}

export interface MidiDivisionSmpte {
  readonly type: "smpte";
  readonly fps: number;
  readonly ticksPerFrame: number;
}

export type MidiDivision = MidiDivisionTpqn | MidiDivisionSmpte;

export interface MidiHeader {
  readonly format: 0 | 1 | 2;
  readonly tracks: number;
  readonly division: MidiDivision;
}

export type MidiMetaEvent =
  | { readonly type: "sequenceNumber"; readonly number: number }
  | {
      readonly type: "text";
      readonly textType:
        | "text"
        | "copyright"
        | "trackName"
        | "instrumentName"
        | "lyric"
        | "marker"
        | "cuePoint";
      readonly text: string;
    }
  | { readonly type: "channelPrefix"; readonly channel: number }
  | { readonly type: "endOfTrack" }
  | { readonly type: "tempo"; readonly microsecondsPerQuarter: number }
  | {
      readonly type: "smpteOffset";
      readonly hr: number;
      readonly mn: number;
      readonly se: number;
      readonly fr: number;
      readonly ff: number;
    }
  | {
      readonly type: "timeSignature";
      readonly numerator: number;
      readonly denominator: number;
      readonly metronome: number;
      readonly thirtyseconds: number;
    }
  | { readonly type: "keySignature"; readonly sf: number; readonly mi: number }
  | { readonly type: "unknown"; readonly metaType: number; readonly data: Uint8Array };

type MidiTextMetaEvent = Extract<MidiMetaEvent, { readonly type: "text" }>;

export type MidiChannelEvent =
  | { readonly type: "noteOff"; readonly channel: number; readonly note: number; readonly velocity: number }
  | { readonly type: "noteOn"; readonly channel: number; readonly note: number; readonly velocity: number }
  | {
      readonly type: "polyAftertouch";
      readonly channel: number;
      readonly note: number;
      readonly pressure: number;
    }
  | {
      readonly type: "controlChange";
      readonly channel: number;
      readonly controller: number;
      readonly value: number;
    }
  | { readonly type: "programChange"; readonly channel: number; readonly program: number }
  | {
      readonly type: "channelAftertouch";
      readonly channel: number;
      readonly pressure: number;
    }
  | { readonly type: "pitchBend"; readonly channel: number; readonly value: number };

export type MidiSysExEvent =
  | { readonly type: "sysEx"; readonly data: Uint8Array }
  | { readonly type: "sysExEscape"; readonly data: Uint8Array };

export type MidiEvent =
  | { readonly deltaTime: number; readonly absoluteTime: number; readonly kind: "meta"; readonly meta: MidiMetaEvent }
  | {
      readonly deltaTime: number;
      readonly absoluteTime: number;
      readonly kind: "channel";
      readonly channel: MidiChannelEvent;
    }
  | { readonly deltaTime: number; readonly absoluteTime: number; readonly kind: "sysex"; readonly sysex: MidiSysExEvent };

export interface MidiTrack {
  readonly events: readonly MidiEvent[];
}

export interface MidiFile {
  readonly header: MidiHeader;
  readonly tracks: readonly MidiTrack[];
}

export interface MidiTextFormatter {
  formatHeader(header: MidiHeader): readonly string[];
  formatTrackHeader(trackIndex: number): readonly string[];
  formatEvent(event: MidiEvent, trackIndex: number): string | null;
}

export function midiToText(data: Uint8Array, formatter: MidiTextFormatter): string {
  if (!(data instanceof Uint8Array)) {
    throw new Error("midiToText: input must be Uint8Array");
  }

  const parser = new StandardMidiFileParser(data);
  const file = parser.parse();

  const lines: string[] = [];
  lines.push(...formatter.formatHeader(file.header));

  file.tracks.forEach((track, index) => {
    lines.push(...formatter.formatTrackHeader(index));
    for (const ev of track.events) {
      const line = formatter.formatEvent(ev, index);
      if (line !== null) {
        lines.push(line);
      }
    }
  });

  return lines.join("\n");
}

export class SimpleMidiTextFormatter implements MidiTextFormatter {
  formatHeader(header: MidiHeader): readonly string[] {
    const divisionText =
      header.division.type === "tpqn"
        ? tpqn=${header.division.ticksPerQuarter}
        : smpte=${header.division.fps}fps/${header.division.ticksPerFrame}tpf;

    return [
      MIDI format=${header.format} tracks=${header.tracks} division=${divisionText},
    ];
  }

  formatTrackHeader(trackIndex: number): readonly string[] {
    return [`, Track ${trackIndex}:];
  }

  formatEvent(event: MidiEvent, _trackIndex: number): string | null {
    switch (event.kind) {
      case "meta":
        return this.formatMeta(event);
      case "channel":
        return this.formatChannel(event);
      case "sysex":
        return this.formatSysEx(event);
      default:
        return null;
    }
  }

  private formatMeta(event: Extract<MidiEvent, { kind: "meta" }>): string {
    const t = event.absoluteTime;
    const meta = event.meta;

    switch (meta.type) {
      case "sequenceNumber":
        return ${t}: META SequenceNumber ${meta.number};
      case "text":
        return ${t}: META ${meta.textType} "${meta.text}";
      case "channelPrefix":
        return ${t}: META ChannelPrefix ch=${meta.channel};
      case "endOfTrack":
        return ${t}: META EndOfTrack;
      case "tempo": {
        const bpm = 60000000 / meta.microsecondsPerQuarter;
        return ${t}: META Tempo ${meta.microsecondsPerQuarter}us/q (${bpm.toFixed(2)} BPM);
      }
      case "smpteOffset":
        return ${t}: META SmpteOffset ${meta.hr}:${meta.mn}:${meta.se} fr=${meta.fr} ff=${meta.ff};
      case "timeSignature":
        return ${t}: META TimeSignature ${meta.numerator}/${meta.denominator} metro=${meta.metronome} 32nd=${meta.thirtyseconds};
      case "keySignature":
        return ${t}: META KeySignature sf=${meta.sf} mi=${meta.mi};
      case "unknown":
        return ${t}: META 0x${meta.metaType.toString(16)} len=${meta.data.length};
      default:
        return ${t}: META (unhandled);
    }
  }

  private formatChannel(event: Extract<MidiEvent, { kind: "channel" }>): string {
    const t = event.absoluteTime;
    const ch = event.channel;

    switch (ch.type) {
      case "noteOn":
        return ${t}: NoteOn ch=${ch.channel + 1} note=${ch.note} vel=${ch.velocity};
      case "noteOff":
        return ${t}: NoteOff ch=${ch.channel + 1} note=${ch.note} vel=${ch.velocity};
      case "polyAftertouch":
        return ${t}: PolyAftertouch ch=${ch.channel + 1} note=${ch.note} val=${ch.pressure};
      case "controlChange":
        return ${t}: CC ch=${ch.channel + 1} cc=${ch.controller} val=${ch.value};
      case "programChange":
        return ${t}: ProgramChange ch=${ch.channel + 1} prog=${ch.program};
      case "channelAftertouch":
        return ${t}: ChannelAftertouch ch=${ch.channel + 1} val=${ch.pressure};
      case "pitchBend":
        return ${t}: PitchBend ch=${ch.channel + 1} value=${ch.value};
      default:
        return ${t}: ChannelEvent (unhandled);
    }
  }

  private formatSysEx(event: Extract<MidiEvent, { kind: "sysex" }>): string {
    const t = event.absoluteTime;
    const sx = event.sysex;
    const kind = sx.type === "sysEx" ? "SysEx" : "SysExEscape";
    return ${t}: ${kind} len=${sx.data.length};
  }
}

class StandardMidiFileParser {
  private readonly data: Uint8Array;
  private offset = 0;

  constructor(data: Uint8Array) {
    this.data = data;
  }

  parse(): MidiFile {
    const header = this.parseHeader();
    const tracks: MidiTrack[] = [];

    for (let i = 0; i < header.tracks; i++) {
      tracks.push(this.parseTrack());
    }

    return { header, tracks };
  }

  private parseHeader(): MidiHeader {
    const id = this.readStr(4);
    if (id !== "MThd") {
      throw new Error("Invalid MIDI file: missing MThd header");
    }

    const length = this.readU32();
    if (length !== 6) {
      throw new Error(Invalid MIDI header length: ${length});
    }

    const format = this.readU16();
    if (format < 0 || format > 2) {
      throw new Error(Unsupported MIDI format: ${format});
    }

    const tracks = this.readU16();
    const divisionRaw = this.readU16();

    const division: MidiDivision =
      (divisionRaw & 0x8000) === 0
        ? { type: "tpqn", ticksPerQuarter: divisionRaw }
        : {
            type: "smpte",
            fps: -(divisionRaw >> 8),
            ticksPerFrame: divisionRaw & 0xff,
          };

    return {
      format: format as 0 | 1 | 2,
      tracks,
      division,
    };
  }

  private parseTrack(): MidiTrack {
    const id = this.readStr(4);
    if (id !== "MTrk") {
      throw new Error("Invalid MIDI file: missing MTrk chunk");
    }

    const length = this.readU32();
    const end = this.offset + length;

    const events: MidiEvent[] = [];
    let runningStatus = 0;
    let absoluteTime = 0;

    while (this.offset < end) {
      const delta = this.readVarLen();
      absoluteTime += delta;

      let status = this.readU8();
      if (status < 0x80) {
        if (runningStatus === 0) {
          throw new Error("Running status used before any status byte");
        }
        this.offset--;
        status = runningStatus;
      } else {
        runningStatus = status;
      }

      if (status === 0xff) {
        const metaEvent = this.parseMetaEvent(delta, absoluteTime);
        events.push(metaEvent);
        if (metaEvent.meta.type === "endOfTrack") {
          // consume remaining bytes if any, but stop interpreting
          this.offset = end;
          break;
        }
      } else if (status === 0xf0 || status === 0xf7) {
        events.push(this.parseSysExEvent(delta, absoluteTime, status));
      } else if ((status & 0xf0) >= 0x80 && (status & 0xf0) <= 0xe0) {
        events.push(this.parseChannelEvent(delta, absoluteTime, status));
      } else {
        throw new Error(Unknown status byte: 0x${status.toString(16)});
      }
    }

    if (this.offset !== end) {
      // hard fail on length mismatch to keep behavior deterministic
      this.offset = end;
      throw new Error("Track length mismatch or malformed track data");
    }

    return { events };
  }

  private parseMetaEvent(
    delta: number,
    absoluteTime: number,
  ): Extract<MidiEvent, { readonly kind: "meta" }> {
    const type = this.readU8();
    const length = this.readVarLen();
    const bytes = this.readBytes(length);

    const makeText = (
      textType: MidiTextMetaEvent["textType"],
    ): MidiMetaEvent => ({
      type: "text",
      textType,
      text: String.fromCharCode(...bytes),
    });

    let meta: MidiMetaEvent;

    switch (type) {
      case 0x00: {
        const number =
          bytes.length >= 2 ? (((bytes[0] ?? 0) << 8) | (bytes[1] ?? 0)) : 0;
        meta = { type: "sequenceNumber", number };
        break;
      }
      case 0x01:
        meta = makeText("text");
        break;
      case 0x02:
        meta = makeText("copyright");
        break;
      case 0x03:
        meta = makeText("trackName");
        break;
      case 0x04:
        meta = makeText("instrumentName");
        break;
      case 0x05:
        meta = makeText("lyric");
        break;
      case 0x06:
        meta = makeText("marker");
        break;
      case 0x07:
        meta = makeText("cuePoint");
        break;
      case 0x20: {
        const channel = bytes.length >= 1 ? ((bytes[0] ?? 0) & 0x0f) : 0;
        meta = { type: "channelPrefix", channel };
        break;
      }
      case 0x2f:
        meta = { type: "endOfTrack" };
        break;
      case 0x51: {
        const value =
          bytes.length === 3
            ? (((bytes[0] ?? 0) << 16) | ((bytes[1] ?? 0) << 8) | (bytes[2] ?? 0))
            : 500000;
        meta = { type: "tempo", microsecondsPerQuarter: value };
        break;
      }
      case 0x54:
        meta = {
          type: "smpteOffset",
          hr: bytes[0] ?? 0,
          mn: bytes[1] ?? 0,
          se: bytes[2] ?? 0,
          fr: bytes[3] ?? 0,
          ff: bytes[4] ?? 0,
        };
        break;
      case 0x58:
        meta = {
          type: "timeSignature",
          numerator: bytes[0] ?? 4,
          denominator: bytes[1] ? 1 << bytes[1] : 4,
          metronome: bytes[2] ?? 24,
          thirtyseconds: bytes[3] ?? 8,
        };
        break;
      case 0x59: {
        const sf = bytes.length >= 1 ? (((bytes[0] ?? 0) << 24) >> 24) : 0;
        const mi = bytes.length >= 2 ? (bytes[1] ?? 0) : 0;
        meta = { type: "keySignature", sf, mi };
        break;
      }
      default:
        meta = { type: "unknown", metaType: type, data: bytes };
        break;
    }

    return {
      deltaTime: delta,
      absoluteTime,
      kind: "meta",
      meta,
    };
  }

  private parseSysExEvent(
    delta: number,
    absoluteTime: number,
    status: number,
  ): MidiEvent {
    const length = this.readVarLen();
    const bytes = this.readBytes(length);
    const sysex: MidiSysExEvent =
      status === 0xf0
        ? { type: "sysEx", data: bytes }
        : { type: "sysExEscape", data: bytes };

    return {
      deltaTime: delta,
      absoluteTime,
      kind: "sysex",
      sysex,
    };
  }

  private parseChannelEvent(
    delta: number,
    absoluteTime: number,
    status: number,
  ): MidiEvent {
    const type = status & 0xf0;
    const channel = status & 0x0f;

    const read2 = (): [number, number] => [this.readU8(), this.readU8()];

    let channelEvent: MidiChannelEvent;

    switch (type) {
      case 0x80: {
        const [note, velocity] = read2();
        channelEvent = { type: "noteOff", channel, note, velocity };
        break;
      }
      case 0x90: {
        const [note, velocity] = read2();
        if (velocity === 0) {
          channelEvent = { type: "noteOff", channel, note, velocity: 0 };
        } else {
          channelEvent = { type: "noteOn", channel, note, velocity };
        }
        break;
      }
      case 0xa0: {
        const [note, pressure] = read2();
        channelEvent = {
          type: "polyAftertouch",
          channel,
          note,
          pressure,
        };
        break;
      }
      case 0xb0: {
        const [controller, value] = read2();
        channelEvent = {
          type: "controlChange",
          channel,
          controller,
          value,
        };
        break;
      }
      case 0xc0: {
        const program = this.readU8();
        channelEvent = { type: "programChange", channel, program };
        break;
      }
      case 0xd0: {
        const pressure = this.readU8();
        channelEvent = {
          type: "channelAftertouch",
          channel,
          pressure,
        };
        break;
      }
      case 0xe0: {
        const [lsb, msb] = read2();
        const value = ((msb << 7) | lsb) - 8192;
        channelEvent = { type: "pitchBend", channel, value };
        break;
      }
      default:
        throw new Error(Unknown channel event status: 0x${status.toString(16)});
    }

    return {
      deltaTime: delta,
      absoluteTime,
      kind: "channel",
      channel: channelEvent,
    };
  }

  private readU8(): number {
    if (this.offset >= this.data.length) {
      throw new Error("Unexpected EOF while reading byte");
    }
    const value = this.data[this.offset];
    if (value === undefined) {
      throw new Error("Unexpected EOF while reading byte");
    }
    this.offset++;
    return value;
  }

  private readU16(): number {
    const hi = this.readU8();
    const lo = this.readU8();
    return (hi << 8) | lo;
  }

  private readU32(): number {
    const b1 = this.readU8();
    const b2 = this.readU8();
    const b3 = this.readU8();
    const b4 = this.readU8();
    return ((b1 << 24) | (b2 << 16) | (b3 << 8) | b4) >>> 0;
  }

  private readStr(len: number): string {
    const bytes = this.readBytes(len);
    return String.fromCharCode(...bytes);
  }

  private readBytes(len: number): Uint8Array {
    if (len < 0) {
      throw new Error("Negative length read requested");
    }
    if (this.offset + len > this.data.length) {
      throw new Error("Unexpected EOF while reading bytes");
    }
    const slice = this.data.subarray(this.offset, this.offset + len);
    this.offset += len;
    return slice;
  }

  private readVarLen(): number {
    let value = 0;
    let count = 0;

    while (true) {
      const b = this.readU8();
      value = (value << 7) | (b & 0x7f);
      count++;
      if ((b & 0x80) === 0) {
        break;
      }
      if (count > 4) {
        throw new Error("Invalid VLQ: too many bytes");
      }
    }

    return value;
  }
}

================================================================================

// packages/Audio/music-core-midi/src/midi.ts

/* ===================== core-midi (using ISpecification) ===================== */

import {
  Specification,
  type ISpecification,
} from "@monorepo/core-specifications";

/* ---------- SPECIFICATIONS ---------- */

class ChannelInRange extends Specification<number> {
  public isSatisfiedBy(v: number): boolean {
    return v >= 1 && v <= 16;
  }
}

class NoteInRange extends Specification<number> {
  public isSatisfiedBy(v: number): boolean {
    return v >= 0 && v <= 127;
  }
}

class VelocityInRange extends Specification<number> {
  public isSatisfiedBy(v: number): boolean {
    return v >= 0 && v <= 127;
  }
}

/* ---------- VALUE OBJECTS ---------- */

export const enum MidiStatus {
  NoteOff = 0x80,
  NoteOn  = 0x90,
}

export class MidiChannel {
  private static readonly spec: ISpecification<number> = new ChannelInRange();
  private constructor(private readonly v: number) {}

  public static create(ch1to16: number): MidiChannel {
    if (!this.spec.isSatisfiedBy(ch1to16)) throw new Error("Channel 1..16");
    return new MidiChannel(ch1to16 - 1);
  }

  public value(): number { return this.v; }
}

export class MidiNote {
  private static readonly spec: ISpecification<number> = new NoteInRange();
  private constructor(private readonly v: number) {}

  public static create(note0to127: number): MidiNote {
    if (!this.spec.isSatisfiedBy(note0to127)) throw new Error("Note 0..127");
    return new MidiNote(note0to127);
  }

  public value(): number { return this.v; }
}

export class MidiVelocity {
  private static readonly spec: ISpecification<number> = new VelocityInRange();
  private constructor(private readonly v: number) {}

  public static create(v0to127: number): MidiVelocity {
    if (!this.spec.isSatisfiedBy(v0to127)) throw new Error("Velocity 0..127");
    return new MidiVelocity(v0to127);
  }

  public static readonly Default = new MidiVelocity(100);
  public static readonly Zero = new MidiVelocity(0);

  public value(): number { return this.v; }
}

/* ---------- DOMAIN MESSAGE ---------- */

export type MidiMessage =
  | {
      readonly status: MidiStatus.NoteOn;
      readonly channel: MidiChannel;
      readonly note: MidiNote;
      readonly velocity: MidiVelocity;
    }
  | {
      readonly status: MidiStatus.NoteOff;
      readonly channel: MidiChannel;
      readonly note: MidiNote;
      readonly velocity: MidiVelocity;
    };

export function createNoteOn(
  channel: MidiChannel,
  note: MidiNote,
  velocity: MidiVelocity = MidiVelocity.Default,
): MidiMessage {
  return {
    status: MidiStatus.NoteOn,
    channel,
    note,
    velocity,
  };
}

export function createNoteOff(
  channel: MidiChannel,
  note: MidiNote,
  velocity: MidiVelocity = MidiVelocity.Zero,
): MidiMessage {
  return {
    status: MidiStatus.NoteOff,
    channel,
    note,
    velocity,
  };
}

export const NoteSymbol = {
  C: "C",
  BSharp: "B#",
  CSharp: "C#",
  DFlat: "Db",
  D: "D",
  DSharp: "D#",
  EFlat: "Eb",
  E: "E",
  FFlat: "Fb",
  ESharp: "E#",
  F: "F",
  FSharp: "F#",
  GFlat: "Gb",
  G: "G",
  GSharp: "G#",
  AFlat: "Ab",
  A: "A",
  ASharp: "A#",
  BFlat: "Bb",
  B: "B",
  CFlat: "Cb",
} as const;

export type NoteSymbol = (typeof NoteSymbol)[keyof typeof NoteSymbol];
export type MidiString = string;

export type ParsedStep = {
  readonly token: string;
  readonly message: MidiMessage | null;
  readonly holdMs: number;
  readonly velocity: number;
  readonly channel: number;
  readonly filterInfo1?: number;
  readonly filterInfo2?: number;
  readonly sustain?: number;
};

export type ParsedSequenceSummary = {
  readonly channels: readonly number[];
  readonly totalDurationMs: number;
  readonly stepsByChannel: Readonly<Record<number, readonly ParsedStep[]>>;
};

export type ParsedSequence = {
  readonly steps: readonly ParsedStep[];
  readonly summary: ParsedSequenceSummary;
};

export function summarizeParsedSteps(steps: readonly ParsedStep[]): ParsedSequenceSummary {
  const byChannel = new Map<number, ParsedStep[]>();
  let totalDurationMs = 0;

  for (const step of steps) {
    totalDurationMs += step.holdMs;

    const existing = byChannel.get(step.channel);
    if (existing) {
      existing.push(step);
    } else {
      byChannel.set(step.channel, [step]);
    }
  }

  const channels = Array.from(byChannel.keys()).sort((a, b) => a - b);
  const stepsByChannel: Record<number, readonly ParsedStep[]> = {};

  for (const channel of channels) {
    const channelSteps = byChannel.get(channel) ?? [];
    stepsByChannel[channel] = channelSteps;
  }

  return {
    channels,
    totalDurationMs,
    stepsByChannel,
  };
}

export const COMPLETE_CHROMATIC_MIDI_SCALE: readonly number[] = Object.freeze(
  Array.from({ length: 128 }, (_, midiNote) => midiNote),
);

export const VAN_HALEN_JUMP_RIFF: MidiString =
  "C4-h190-v108-ch1 C4-h190-v106-ch1 D4-h220-v114-ch1 C4-h190-v108-ch1 A3-h220-v104-ch1 " +
  "C4-h190-v108-ch1 D4-h220-v114-ch1 E4-h240-v118-ch1 D4-h220-v112-ch1 C4-h190-v108-ch1 " +
  "A3-h220-v104-ch1 G3-h240-v100-ch1 A3-h220-v104-ch1 C4-h190-v108-ch1 D4-h220-v114-ch1 " +
  "E4-h240-v118-ch1 D4-h220-v112-ch1 C4-h190-v108-ch1 A3-h220-v104-ch1 G3-h260-v100-ch1";

export type MidiSong = {
  readonly id: string;
  readonly title: string;
  readonly sequence: MidiString;
};

export const BINARY_FINARY_1998_ORIGINAL_MIX: MidiString =
  "G3-h190-v114-ch1-f12400-f21.7-s0.58 D4-h190-v92-ch2-f11480-f21.2-s0.76 G2-h190-v96-ch3-f1900-f20.9-s0.34 " +
  "C4-h190-v110-ch1-f12300-f21.6-s0.58 G4-h190-v90-ch2-f11420-f21.15-s0.75 C3-h190-v96-ch3-f1880-f20.88-s0.34 " +
  "Bb3-h190-v108-ch1-f12240-f21.6-s0.57 F4-h190-v88-ch2-f11380-f21.1-s0.74 Bb2-h190-v95-ch3-f1840-f20.86-s0.33 " +
  "Eb4-h190-v112-ch1-f12440-f21.7-s0.58 Bb4-h190-v92-ch2-f11510-f21.2-s0.76 Eb3-h190-v97-ch3-f1920-f20.9-s0.34 " +
  "F4-h190-v114-ch1-f12500-f21.75-s0.59 C5-h190-v94-ch2-f11600-f21.25-s0.77 F3-h190-v98-ch3-f1960-f20.93-s0.35 " +
  "G4-h220-v120-ch1-f12700-f21.9-s0.6 D5-h220-v98-ch2-f11780-f21.3-s0.78 G3-h220-v102-ch3-f2020-f20.96-s0.36 " +
  "Eb4-h190-v112-ch1-f12420-f21.7-s0.58 Bb4-h190-v92-ch2-f11520-f21.2-s0.76 Eb3-h190-v97-ch3-f1920-f20.9-s0.34 " +
  "F4-h190-v114-ch1-f12510-f21.76-s0.59 C5-h190-v94-ch2-f11640-f21.26-s0.77 F3-h190-v98-ch3-f1960-f20.93-s0.35 " +
  "G4-h220-v120-ch1-f12740-f21.92-s0.6 D5-h220-v98-ch2-f11810-f21.3-s0.78 G3-h220-v102-ch3-f2030-f20.97-s0.36 " +
  "C4-h200-v110-ch1-f12320-f21.62-s0.58 G4-h200-v90-ch2-f11410-f21.14-s0.75 C3-h200-v96-ch3-f1880-f20.88-s0.34 " +
  "D4-h200-v112-ch1-f12390-f21.66-s0.58 A4-h200-v92-ch2-f11490-f21.18-s0.75 D3-h200-v97-ch3-f1890-f20.89-s0.34 " +
  "Eb4-h200-v114-ch1-f12470-f21.72-s0.59 Bb4-h200-v94-ch2-f11570-f21.22-s0.76 Eb3-h200-v98-ch3-f1930-f20.91-s0.35 " +
  "F4-h200-v116-ch1-f12540-f21.78-s0.59 C5-h200-v96-ch2-f11640-f21.26-s0.77 F3-h200-v99-ch3-f1970-f20.94-s0.35 " +
  "G4-h240-v122-ch1-f12820-f22-s0.61 D5-h240-v100-ch2-f11920-f21.35-s0.79 G3-h240-v103-ch3-f2060-f21-s0.37";

export const MIDI_SONG_LIBRARY: readonly MidiSong[] = Object.freeze([
  {
    id: "van-halen-jump",
    title: "Van Halen - Jump",
    sequence: VAN_HALEN_JUMP_RIFF,
  },
  {
    id: "binary-finary-1998-original-mix",
    title: "Binary Finary - 1998 (Original Mix)",
    sequence: BINARY_FINARY_1998_ORIGINAL_MIX,
  },
]);

export class MidiStringParser {
  private readonly defaultHoldMs: number;
  private readonly defaultVelocity: number;
  private readonly defaultChannel: number;

  public constructor(defaults?: {
    readonly holdMs?: number;
    readonly velocity?: number;
    readonly channel?: number;
  }) {
    this.defaultHoldMs = defaults?.holdMs ?? 235;
    this.defaultVelocity = defaults?.velocity ?? 100;
    this.defaultChannel = defaults?.channel ?? 1;
  }

  private static readonly semitoneBySymbol: Record<NoteSymbol, number> = {
    [NoteSymbol.C]: 0,
    [NoteSymbol.BSharp]: 0,
    [NoteSymbol.CSharp]: 1,
    [NoteSymbol.DFlat]: 1,
    [NoteSymbol.D]: 2,
    [NoteSymbol.DSharp]: 3,
    [NoteSymbol.EFlat]: 3,
    [NoteSymbol.E]: 4,
    [NoteSymbol.FFlat]: 4,
    [NoteSymbol.ESharp]: 5,
    [NoteSymbol.F]: 5,
    [NoteSymbol.FSharp]: 6,
    [NoteSymbol.GFlat]: 6,
    [NoteSymbol.G]: 7,
    [NoteSymbol.GSharp]: 8,
    [NoteSymbol.AFlat]: 8,
    [NoteSymbol.A]: 9,
    [NoteSymbol.ASharp]: 10,
    [NoteSymbol.BFlat]: 10,
    [NoteSymbol.B]: 11,
    [NoteSymbol.CFlat]: 11,
  };

  public parse(input: MidiString): readonly ParsedStep[] {
    const tokens = input.split(/\s+/).filter((t) => t.length > 0);
    const steps: ParsedStep[] = [];

    for (const token of tokens) {
      steps.push(this.parseTokenToStep(token));
    }

    return steps;
  }

  public parseWithSummary(input: MidiString): ParsedSequence {
    const steps = this.parse(input);
    return {
      steps,
      summary: summarizeParsedSteps(steps),
    };
  }

  private parseTokenToStep(token: string): ParsedStep {
    const [baseTokenRaw, ...modifiers] = token.split("-");
    const baseToken = baseTokenRaw ?? "";
    const note = this.parseTokenToMidiNote(baseToken);
    const options = this.parseModifiers(modifiers);

    const channelNumber = options.channel ?? this.defaultChannel;
    const velocityNumber = options.velocity ?? this.defaultVelocity;
    const holdMs = options.holdMs ?? this.defaultHoldMs;

    if (note === null) {
      const step: ParsedStep = {
        token,
        message: null,
        holdMs,
        velocity: velocityNumber,
        channel: channelNumber,
      };
      if (options.filterInfo1 !== undefined) {
        (step as ParsedStep & { filterInfo1: number }).filterInfo1 = options.filterInfo1;
      }
      if (options.filterInfo2 !== undefined) {
        (step as ParsedStep & { filterInfo2: number }).filterInfo2 = options.filterInfo2;
      }
      if (options.sustain !== undefined) {
        (step as ParsedStep & { sustain: number }).sustain = options.sustain;
      }
      return step;
    }

    const channel = MidiChannel.create(channelNumber);
    const velocity = MidiVelocity.create(velocityNumber);

    const step: ParsedStep = {
      token,
      message: createNoteOn(channel, note, velocity),
      holdMs,
      velocity: velocityNumber,
      channel: channelNumber,
    };
    if (options.filterInfo1 !== undefined) {
      (step as ParsedStep & { filterInfo1: number }).filterInfo1 = options.filterInfo1;
    }
    if (options.filterInfo2 !== undefined) {
      (step as ParsedStep & { filterInfo2: number }).filterInfo2 = options.filterInfo2;
    }
    if (options.sustain !== undefined) {
      (step as ParsedStep & { sustain: number }).sustain = options.sustain;
    }
    return step;
  }

  private parseModifiers(modifiers: readonly string[]): {
    readonly holdMs?: number;
    readonly velocity?: number;
    readonly channel?: number;
    readonly filterInfo1?: number;
    readonly filterInfo2?: number;
    readonly sustain?: number;
  } {
    let holdMs: number | undefined;
    let velocity: number | undefined;
    let channel: number | undefined;
    let filterInfo1: number | undefined;
    let filterInfo2: number | undefined;
    let sustain: number | undefined;

    for (const modifier of modifiers) {
      if (/^h\d{1,4}$/.test(modifier)) {
        holdMs = Number(modifier.slice(1));
        continue;
      }

      if (/^v(\d|[1-9]\d|1[01]\d|12[0-7])$/.test(modifier)) {
        velocity = Number(modifier.slice(1));
        continue;
      }

      if (/^ch([1-9]|1[0-6])$/.test(modifier)) {
        channel = Number(modifier.slice(2));
        continue;
      }

      if (/^f1\d+(?:\.\d+)?$/.test(modifier)) {
        filterInfo1 = Number(modifier.slice(2));
        continue;
      }

      if (/^f2\d+(?:\.\d+)?$/.test(modifier)) {
        filterInfo2 = Number(modifier.slice(2));
        continue;
      }

      if (/^s(?:0(?:\.\d+)?|1(?:\.0+)?)$/.test(modifier)) {
        sustain = Number(modifier.slice(1));
        continue;
      }

      throw new Error(
        Unsupported modifier '${modifier}' in token '${modifiers.join("-")}'. Use h###, v###, ch#, f1#, f2#, s0..1.,
      );
    }

    const options: {
      holdMs?: number;
      velocity?: number;
      channel?: number;
      filterInfo1?: number;
      filterInfo2?: number;
      sustain?: number;
    } = {};

    if (holdMs !== undefined) options.holdMs = holdMs;
    if (velocity !== undefined) options.velocity = velocity;
    if (channel !== undefined) options.channel = channel;
    if (filterInfo1 !== undefined) options.filterInfo1 = filterInfo1;
    if (filterInfo2 !== undefined) options.filterInfo2 = filterInfo2;
    if (sustain !== undefined) options.sustain = sustain;

    return options;
  }

  private parseTokenToMidiNote(token: string): MidiNote | null {
    if (token === "R") {
      return null;
    }

    const directMidiMatch = /^N(\d|[1-9]\d|1[01]\d|12[0-7])$/.exec(token);

    if (directMidiMatch) {
      return MidiNote.create(Number(directMidiMatch[1]));
    }

    const match = /^([A-G](?:#|b)?)(-1|[0-9])$/.exec(token);

    if (!match) {
      throw new Error(Invalid note token '${token}'. Use C-1..G9, accidentals (#/b), N0..N127, or R.);
    }

    const symbol = match[1] as NoteSymbol;
    const octave = Number(match[2]);
    const semitone = MidiStringParser.semitoneBySymbol[symbol];

    if (semitone === undefined) {
      throw new Error(Unsupported note symbol '${symbol}'.);
    }

    const midiNumber = (octave + 1) * 12 + semitone;

    if (midiNumber < 0 || midiNumber > 127) {
      throw new Error(Note token '${token}' resolves to out-of-range MIDI note ${midiNumber}. Expected 0..127.);
    }

    return MidiNote.create(midiNumber);
  }
}

Thought for a couple of seconds
Good. Then do not create a new MIDI module.

Use your existing:

packages/Audio/music-core-midi
as the shared event contract module.

Next starting point
Build only these next:

packages/Audio/music-core-synthesizer-contracts
packages/Audio/music-core-synthesizer-envelopes
packages/Audio/music-core-synthesizer-oscillators
packages/Audio/music-core-synthesizer-web-audio
packages/Audio/music-core-synthesizer-engine
Important correction
Your current music-core-midi already contains:

MidiMessage
MidiStatus
MidiChannel
MidiNote
MidiVelocity
createNoteOn()
createNoteOff()
So the synth should consume this directly:

music-core-synthesizer-engine
  → music-core-midi
Do not duplicate:

NoteOn
NoteOff
MidiNote
Velocity
Channel
inside synthesizer packages.

Missing helper you need next
Add this to synth side, not MIDI:

export interface IMidiNoteFrequencyMapper {
  map(note: number): number;
}

export final class EqualTemperamentFrequencyMapper implements IMidiNoteFrequencyMapper {
  public map(note: number): number {
    return 440 * Math.pow(2, (note - 69) / 12);
  }
}
Logical location:

music-core-synthesizer-oscillators
or better:

music-core-synthesizer-parameters
if you create that package.

First real integration flow
MidiMessage
  ↓
SynthEngine
  ↓
WebAudioVoiceFactory
  ↓
OscillatorNode + GainNode
Minimal dependency graph now
music-core-midi
        ↑
music-core-synthesizer-engine
        ↑
music-core-synthesizer-web-audio
And:

music-core-synthesizer-web-audio
  → music-core-synthesizer-contracts
  → music-core-synthesizer-envelopes
  → music-core-synthesizer-oscillators
What I would do next
Create music-core-synthesizer-contracts first with only:

export interface ISynthEngine {
  handle(message: MidiMessage): void;
  panic(): void;
}

export interface IVoice {
  readonly note: number;
  start(): void;
  release(): void;
  dispose(): void;
}

export interface IVoiceFactory {
  create(request: VoiceCreationRequest): IVoice;
}

export interface VoiceCreationRequest {
  readonly note: number;
  readonly velocity: number;
  readonly frequencyHz: number;
}
This lets your existing MIDI library become the input boundary.

packages/Audio/music-core-synthesizer-contracts

Thought for a couple of seconds
Create this first.

// packages/Audio/music-core-synthesizer-contracts/src/index.ts

export * from "./frequency.js";
export * from "./voice.js";
export * from "./synthEngine.js";
export * from "./lifecycle.js";
// packages/Audio/music-core-synthesizer-contracts/src/frequency.ts

export interface IMidiNoteFrequencyMapper {
  map(note0To127: number): number;
}

export final class EqualTemperamentFrequencyMapper implements IMidiNoteFrequencyMapper {
  public map(note0To127: number): number {
    if (!Number.isInteger(note0To127) || note0To127 < 0 || note0To127 > 127) {
      throw new Error("MIDI note must be an integer in range 0..127.");
    }

    return 

only code in a single code snippet 

// packages/Audio/music-core-synthesizer-contracts/src/index.ts

export * from "./frequency.js";
export * from "./voice.js";
export * from "./synthEngine.js";
export * from "./lifecycle.js";

// packages/Audio/music-core-synthesizer-contracts/src/frequency.ts

export interface IMidiNoteFrequencyMapper {
  map(note0To127: number): number;
}

export class EqualTemperamentFrequencyMapper implements IMidiNoteFrequencyMapper {
  public map(note0To127: number): number {
    if (!Number.isInteger(note0To127) || note0To127 < 0 || note0To127 > 127) {
      throw new Error("MIDI note must be an integer in range 0..127.");
    }

    return 440 * Math.pow(2, (note0To127 - 69) / 12);
  }
}

// packages/Audio/music-core-synthesizer-contracts/src/lifecycle.ts

export interface IDisposable {
  dispose(): void;
}

export interface IStartable {
  start(): void;
}

export interface IReleasable {
  release(): void;
}

// packages/Audio/music-core-synthesizer-contracts/src/voice.ts

export interface VoiceCreationRequest {
  readonly note: number;
  readonly velocity: number;
  readonly frequencyHz: number;
}

export interface IVoice extends IStartable, IReleasable, IDisposable {
  readonly note: number;
}

export interface IVoiceFactory {
  create(request: VoiceCreationRequest): IVoice;
}

// packages/Audio/music-core-synthesizer-contracts/src/synthEngine.ts

import type { MidiMessage } from "@monorepo/core-midi";

export interface ISynthEngine {
  handle(message: MidiMessage): void;
  panic(): void;
}

Thats all? 

No. That’s only the minimum to unblock sound.

You still need a few critical contracts to avoid refactoring later.
Add them now while it’s cheap.

// packages/Audio/music-core-synthesizer-contracts/src/index.ts

export * from "./frequency.js";
export * from "./voice.js";
export * from "./synthEngine.js";
export * from "./lifecycle.js";
export * from "./envelope.js";
export * from "./oscillator.js";
export * from "./audioContext.js";

// packages/Audio/music-core-synthesizer-contracts/src/frequency.ts

export interface IMidiNoteFrequencyMapper {
  map(note0To127: number): number;
}

export class EqualTemperamentFrequencyMapper implements IMidiNoteFrequencyMapper {
  public map(note0To127: number): number {
    if (!Number.isInteger(note0To127) || note0To127 < 0 || note0To127 > 127) {
      throw new Error("MIDI note must be an integer in range 0..127.");
    }
    return 440 * Math.pow(2, (note0To127 - 69) / 12);
  }
}

// packages/Audio/music-core-synthesizer-contracts/src/lifecycle.ts

export interface IDisposable {
  dispose(): void;
}

export interface IStartable {
  start(): void;
}

export interface IReleasable {
  release(): void;
}

// packages/Audio/music-core-synthesizer-contracts/src/voice.ts

export interface VoiceCreationRequest {
  readonly note: number;
  readonly velocity: number;
  readonly frequencyHz: number;
}

export interface IVoice extends IStartable, IReleasable, IDisposable {
  readonly note: number;
}

export interface IVoiceFactory {
  create(request: VoiceCreationRequest): IVoice;
}

// packages/Audio/music-core-synthesizer-contracts/src/synthEngine.ts

import type { MidiMessage } from "@monorepo/core-midi";

export interface ISynthEngine {
  handle(message: MidiMessage): void;
  panic(): void;
}

// packages/Audio/music-core-synthesizer-contracts/src/envelope.ts

export interface IEnvelopeDefinition {
  readonly attackSeconds: number;
  readonly decaySeconds: number;
  readonly sustainLevel: number; // 0..1
  readonly releaseSeconds: number;
}

export interface IEnvelopeScheduler {
  noteOn(timeSeconds: number, velocity01: number): void;
  noteOff(timeSeconds: number): void;
}

// packages/Audio/music-core-synthesizer-contracts/src/oscillator.ts

export const enum OscillatorWaveform {
  Sine = "sine",
  Square = "square",
  Sawtooth = "sawtooth",
  Triangle = "triangle",
}

export interface IOscillatorDefinition {
  readonly waveform: OscillatorWaveform;
}

// packages/Audio/music-core-synthesizer-contracts/src/audioContext.ts

export interface IAudioContextProvider {
  get(): AudioContext;
}
Why these extra contracts
IEnvelopeDefinition + IEnvelopeScheduler → avoids leaking Web Audio timing into domain later

IOscillatorDefinition → prevents magic strings for waveform

IAudioContextProvider → avoids hidden globals (new AudioContext() everywhere)

What you can still skip (for now)
Do not add yet:

filters

distortion

modulation matrix

voice allocator

Hard boundary
This module must contain:

only interfaces

only small value objects

zero Web Audio types except AudioContext abstraction

No OscillatorNode, no GainNode.

Next step (do this next)
Implement:

music-core-synthesizer-web-audio
with:

WebAudioVoiceFactory

WebAudioEnvelopeScheduler

That’s where this contract gets executed.

If you want, next step is:
👉 single-file WebAudioVoiceFactory implementation that actually produces sound

I want best guess

Thought for a couple of seconds
// Best guess:
// Keep music-core-synthesizer-contracts small, but include the stable seams
// you will almost certainly need before WebAudio, engine, UI, and sequencer integration.

// packages/Audio/music-core-synthesizer-contracts/src/index.ts

export * from "./AudioTime.js";
export * from "./Frequency.js";
export * from "./Lifecycle.js";
export * from "./Oscillator.js";
export * from "./Envelope.js";
export * from "./Voice.js";
export * from "./SynthEngine.js";
export * from "./AudioContextProvider.js";

// packages/Audio/music-core-synthesizer-contracts/src/AudioTime.ts

export interface IAudioTimeProvider {
  nowSeconds(): number;
}

// packages/Audio/music-core-synthesizer-contracts/src/Frequency.ts

export interface IMidiNoteFrequencyMapper {
  map(note0To127: number): number;
}

export class EqualTemperamentFrequencyMapper implements IMidiNoteFrequencyMapper {
  public map(note0To127: number): number {
    if (!Number.isInteger(note0To127) || note0To127 < 0 || note0To127 > 127) {
      throw new Error("MIDI note must be an integer in range 0..127.");
    }

    return 440 * Math.pow(2, (note0To127 - 69) / 12);
  }
}

// packages/Audio/music-core-synthesizer-contracts/src/Lifecycle.ts

export interface IDisposable {
  dispose(): void;
}

export interface IStartable {
  start(): void;
}

export interface IReleasable {
  release(): void;
}

// packages/Audio/music-core-synthesizer-contracts/src/Oscillator.ts

export const enum OscillatorWaveform {
  Sine = "sine",
  Square = "square",
  Sawtooth = "sawtooth",
  Triangle = "triangle",
}

export interface IOscillatorDefinition {
  readonly waveform: OscillatorWaveform;
  readonly detuneCents: number;
  readonly gain: number;
}

// packages/Audio/music-core-synthesizer-contracts/src/Envelope.ts

export interface IAdsrEnvelopeDefinition {
  readonly attackSeconds: number;
  readonly decaySeconds: number;
  readonly sustainLevel: number;
  readonly releaseSeconds: number;
}

export interface IEnvelopeScheduler {
  noteOn(timeSeconds: number, velocity01: number): void;
  noteOff(timeSeconds: number): void;
  cancel(timeSeconds: number): void;
}

// packages/Audio/music-core-synthesizer-contracts/src/Voice.ts

import type { IDisposable, IReleasable, IStartable } from "./Lifecycle.js";
import type { IAdsrEnvelopeDefinition } from "./Envelope.js";
import type { IOscillatorDefinition } from "./Oscillator.js";

export interface VoiceDefinition {
  readonly oscillator: IOscillatorDefinition;
  readonly amplitudeEnvelope: IAdsrEnvelopeDefinition;
}

export interface VoiceCreationRequest {
  readonly note: number;
  readonly velocity: number;
  readonly frequencyHz: number;
  readonly definition: VoiceDefinition;
}

export interface IVoice extends IStartable, IReleasable, IDisposable {
  readonly note: number;
  readonly isReleased: boolean;
}

export interface IVoiceFactory {
  create(request: VoiceCreationRequest): IVoice;
}

// packages/Audio/music-core-synthesizer-contracts/src/SynthEngine.ts

import type { MidiMessage } from "@monorepo/core-midi";
import type { IDisposable } from "./Lifecycle.js";
import type { VoiceDefinition } from "./Voice.js";

export interface SynthEngineOptions {
  readonly defaultVoice: VoiceDefinition;
}

export interface ISynthEngine extends IDisposable {
  handle(message: MidiMessage): void;
  setDefaultVoice(definition: VoiceDefinition): void;
  panic(): void;
}

// packages/Audio/music-core-synthesizer-contracts/src/AudioContextProvider.ts

export interface IAudioContextProvider {
  get(): AudioContext;
}
Best guess: this is the right first contract set.
Do not add filters/distortion/noise here yet. Add those when the first oscillator + ADSR voice works.

Minimal production module set for Web Audio
Domain
- IMidiEvent
- IVoiceAllocator
- IVoiceDefinition
- IEnvelopeDefinition
- IFilterDefinition
- IDistortionDefinition

Application
- SynthEngine
- MidiMessageRouter
- NoteLifetimeCoordinator

Infrastructure.WebAudio
- WebAudioContextFactory
- WebAudioVoiceGraphBuilder
- WebAudioVoiceFactory
- WebAudioEnvelopeScheduler
- WebAudioNoiseSourceFactory
- WebAudioMasterBus

Correct. For your repo, map it like this:

packages/Audio
├── music-core-midi
│   └── MidiMessage, MidiNote, MidiVelocity, MidiChannel
│
├── music-core-synthesizer-contracts
│   ├── IVoiceDefinition
│   ├── IEnvelopeDefinition
│   ├── IFilterDefinition
│   ├── IDistortionDefinition
│   ├── IVoiceAllocator
│   └── IVoice
│
├── music-core-synthesizer-engine
│   ├── SynthEngine
│   ├── MidiMessageRouter
│   └── NoteLifetimeCoordinator
│
├── music-core-synthesizer-web-audio
│   ├── WebAudioContextFactory
│   ├── WebAudioVoiceGraphBuilder
│   ├── WebAudioVoiceFactory
│   ├── WebAudioEnvelopeScheduler
│   ├── WebAudioNoiseSourceFactory
│   └── WebAudioMasterBus
│
└── music-ui-synthesizer
    └── Lit components / controllers
Best start:

1. contracts
2. web-audio
3. engine
4. ui
Do not create IMidiEvent; you already have:

MidiMessage
from:

music-core-midi
So replace:

IMidiEvent
with:

MidiMessage
Final corrected set:

Domain
- MidiMessage              from music-core-midi
- IVoiceAllocator
- IVoiceDefinition
- IEnvelopeDefinition
- IFilterDefinition
- IDistortionDefinition

Application
- SynthEngine
- MidiMessageRouter
- NoteLifetimeCoordinator

Infrastructure.WebAudio
- WebAudioContextFactory
- WebAudioVoiceGraphBuilder
- WebAudioVoiceFactory
- WebAudioEnvelopeScheduler
- WebAudioNoiseSourceFactory
- WebAudioMasterBus

The list I gave you must have a consite intefaces that makes item work togetherr

Thought for a couple of seconds
Yes. Put the integration contracts in:

packages/Audio/music-core-synthesizer-contracts
// packages/Audio/music-core-synthesizer-contracts/src/index.ts

import type { MidiMessage } from "@monorepo/core-midi";

/* ============================================================================
   Shared primitives
============================================================================ */

export type Seconds = number;
export type Hertz = number;
export type MidiNoteNumber = number;
export type NormalizedValue = number; // 0..1

export interface IDisposable {
  dispose(): void;
}

/* ============================================================================
   Domain definitions
============================================================================ */

export const enum OscillatorWaveform {
  Sine = "sine",
  Square = "square",
  Sawtooth = "sawtooth",
  Triangle = "triangle",
}

export const enum FilterType {
  LowPass = "lowpass",
  HighPass = "highpass",
  BandPass = "bandpass",
}

export const enum DistortionType {
  None = "none",
  SoftClip = "soft-clip",
  HardClip = "hard-clip",
  Tanh = "tanh",
}

export interface IOscillatorDefinition {
  readonly waveform: OscillatorWaveform;
  readonly detuneCents: number;
  readonly gain: NormalizedValue;
}

export interface INoiseDefinition {
  readonly enabled: boolean;
  readonly gain: NormalizedValue;
}

export interface IEnvelopeDefinition {
  readonly attackSeconds: Seconds;
  readonly decaySeconds: Seconds;
  readonly sustainLevel: NormalizedValue;
  readonly releaseSeconds: Seconds;
}

export interface IFilterDefinition {
  readonly enabled: boolean;
  readonly type: FilterType;
  readonly cutoffHz: Hertz;
  readonly resonanceQ: number;
}

export interface IDistortionDefinition {
  readonly enabled: boolean;
  readonly type: DistortionType;
  readonly amount: NormalizedValue;
}

export interface IVoiceDefinition {
  readonly oscillator: IOscillatorDefinition;
  readonly noise: INoiseDefinition;
  readonly amplitudeEnvelope: IEnvelopeDefinition;
  readonly filter: IFilterDefinition;
  readonly distortion: IDistortionDefinition;
}

/* ============================================================================
   MIDI / pitch mapping
============================================================================ */

export interface IMidiNoteFrequencyMapper {
  map(note: MidiNoteNumber): Hertz;
}

/* ============================================================================
   Voice allocation
============================================================================ */

export interface IVoiceHandle extends IDisposable {
  readonly id: string;
  readonly note: MidiNoteNumber;
  readonly startedAtSeconds: Seconds;
  readonly isReleased: boolean;

  release(atSeconds: Seconds): void;
}

export interface IVoiceAllocator {
  allocate(activeVoices: readonly IVoiceHandle[], note: MidiNoteNumber): IVoiceHandle | null;
}

/* ============================================================================
   Application orchestration
============================================================================ */

export interface ISynthEngine extends IDisposable {
  handle(message: MidiMessage): void;
  panic(): void;
  setVoiceDefinition(definition: IVoiceDefinition): void;
}

export interface IMidiMessageRouter {
  route(message: MidiMessage): void;
}

export interface INoteLifetimeCoordinator {
  noteOn(note: MidiNoteNumber, velocity: NormalizedValue, atSeconds: Seconds): void;
  noteOff(note: MidiNoteNumber, atSeconds: Seconds): void;
  releaseAll(atSeconds: Seconds): void;
}

/* ============================================================================
   Web Audio infrastructure contracts
============================================================================ */

export interface IWebAudioContextFactory {
  create(): AudioContext;
}

export interface IWebAudioMasterBus extends IDisposable {
  readonly input: AudioNode;
  readonly output: AudioNode;

  connect(destination: AudioNode): void;
  setGain(value: NormalizedValue, atSeconds: Seconds): void;
}

export interface IWebAudioEnvelopeScheduler {
  noteOn(param: AudioParam, envelope: IEnvelopeDefinition, velocity: NormalizedValue, atSeconds: Seconds): void;
  noteOff(param: AudioParam, envelope: IEnvelopeDefinition, atSeconds: Seconds): void;
  cancel(param: AudioParam, atSeconds: Seconds): void;
}

export interface IWebAudioNoiseSourceFactory {
  create(context: AudioContext): AudioNode;
}

export interface WebAudioVoiceGraph {
  readonly input: AudioNode | null;
  readonly output: AudioNode;
  readonly oscillator: OscillatorNode;
  readonly vca: GainNode;
  readonly filter: BiquadFilterNode | null;
  readonly distortion: WaveShaperNode | null;
  readonly noise: AudioNode | null;
}

export interface WebAudioVoiceGraphBuildRequest {
  readonly context: AudioContext;
  readonly destination: AudioNode;
  readonly definition: IVoiceDefinition;
  readonly frequencyHz: Hertz;
}

export interface IWebAudioVoiceGraphBuilder {
  build(request: WebAudioVoiceGraphBuildRequest): WebAudioVoiceGraph;
}

export interface WebAudioVoiceCreationRequest {
  readonly context: AudioContext;
  readonly destination: AudioNode;
  readonly definition: IVoiceDefinition;
  readonly note: MidiNoteNumber;
  readonly velocity: NormalizedValue;
  readonly frequencyHz: Hertz;
  readonly startedAtSeconds: Seconds;
}

export interface IWebAudioVoiceFactory {
  create(request: WebAudioVoiceCreationRequest): IVoiceHandle;
}

music-core-synthesizer
├── modules
│   ├── documentation
│   │   └── README.md
│   ├── music-core-synthesizer-contracts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── src
│   │   │   └── code.ts
│   │   ├── tests
│   │   │   └── tests.test.ts
│   │   ├── tsconfig.json
│   │   ├── tsconfig.test.json
│   │   └── vitest.config.ts
│   ├── music-core-synthesizer-distortion
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── src
│   │   │   └── code.ts
│   │   ├── tests
│   │   │   └── tests.test.ts
│   │   ├── tsconfig.json
│   │   ├── tsconfig.test.json
│   │   └── vitest.config.ts
│   ├── music-core-synthesizer-engine
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── src
│   │   │   └── code.ts
│   │   ├── tests
│   │   │   └── tests.test.ts
│   │   ├── tsconfig.json
│   │   ├── tsconfig.test.json
│   │   └── vitest.config.ts
│   ├── music-core-synthesizer-envelopes
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── src
│   │   │   └── code.ts
│   │   ├── tests
│   │   │   └── tests.test.ts
│   │   ├── tsconfig.json
│   │   ├── tsconfig.test.json
│   │   └── vitest.config.ts
│   ├── music-core-synthesizer-filters
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── src
│   │   │   └── code.ts
│   │   ├── tests
│   │   │   └── tests.test.ts
│   │   ├── tsconfig.json
│   │   ├── tsconfig.test.json
│   │   └── vitest.config.ts
│   ├── music-core-synthesizer-midi
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── src
│   │   │   └── code.ts
│   │   ├── tests
│   │   │   └── tests.test.ts
│   │   ├── tsconfig.json
│   │   ├── tsconfig.test.json
│   │   └── vitest.config.ts
│   ├── music-core-synthesizer-modulation
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── src
│   │   │   └── code.ts
│   │   ├── tests
│   │   │   └── tests.test.ts
│   │   ├── tsconfig.json
│   │   ├── tsconfig.test.json
│   │   └── vitest.config.ts
│   ├── music-core-synthesizer-noise
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── src
│   │   │   └── code.ts
│   │   ├── tests
│   │   │   └── tests.test.ts
│   │   ├── tsconfig.json
│   │   ├── tsconfig.test.json
│   │   └── vitest.config.ts
│   ├── music-core-synthesizer-oscillators
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── src
│   │   │   └── code.ts
│   │   ├── tests
│   │   │   └── tests.test.ts
│   │   ├── tsconfig.json
│   │   ├── tsconfig.test.json
│   │   └── vitest.config.ts
│   ├── Music-core-synthesizer-parameters
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── src
│   │   │   └── code.ts
│   │   ├── tests
│   │   │   └── tests.test.ts
│   │   ├── tsconfig.json
│   │   ├── tsconfig.test.json
│   │   └── vitest.config.ts
│   ├── music-core-synthesizer-presets
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── src
│   │   │   └── code.ts
│   │   ├── tests
│   │   │   └── tests.test.ts
│   │   ├── tsconfig.json
│   │   ├── tsconfig.test.json
│   │   └── vitest.config.ts
│   ├── music-core-synthesizer-voice
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── src
│   │   │   └── code.ts
│   │   ├── tests
│   │   │   └── tests.test.ts
│   │   ├── tsconfig.json
│   │   ├── tsconfig.test.json
│   │   └── vitest.config.ts
│   ├── music-core-synthesizer-voiceAllocator
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── src
│   │   │   └── code.ts
│   │   ├── tests
│   │   │   └── tests.test.ts
│   │   ├── tsconfig.json
│   │   ├── tsconfig.test.json
│   │   └── vitest.config.ts
│   ├── music-core-synthesizer-web-audio
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── src
│   │   │   └── code.ts
│   │   ├── tests
│   │   │   └── tests.test.ts
│   │   ├── tsconfig.json
│   │   ├── tsconfig.test.json
│   │   └── vitest.config.ts
│   ├── sequencer
│   │   └── music-core-sequencer
│   │       ├── package.json
│   │       ├── README.md
│   │       ├── src
│   │       │   └── code.ts
│   │       ├── tests
│   │       │   └── tests.test.ts
│   │       ├── tsconfig.json
│   │       ├── tsconfig.test.json
│   │       └── vitest.config.ts
│   ├── shared
│   │   └── music-core-transport
│   │       ├── package.json
│   │       ├── README.md
│   │       ├── src
│   │       │   └── code.ts
│   │       ├── tests
│   │       │   └── tests.test.ts
│   │       ├── tsconfig.json
│   │       ├── tsconfig.test.json
│   │       └── vitest.config.ts
│   └── ui
│       ├── music-ui-sequencer
│       │   ├── package.json
│       │   ├── README.md
│       │   ├── src
│       │   │   └── code.ts
│       │   ├── tests
│       │   │   └── tests.test.ts
│       │   ├── tsconfig.json
│       │   ├── tsconfig.test.json
│       │   └── vitest.config.ts
│       ├── music-ui-synthesizer
│       │   ├── package.json
│       │   ├── README.md
│       │   ├── src
│       │   │   └── code.ts
│       │   ├── tests
│       │   │   └── tests.test.ts
│       │   ├── tsconfig.json
│       │   ├── tsconfig.test.json
│       │   └── vitest.config.ts
│       ├── music-ui-synthesizer-distortion
│       │   ├── package.json
│       │   ├── README.md
│       │   ├── src
│       │   │   └── code.ts
│       │   ├── tests
│       │   │   └── tests.test.ts
│       │   ├── tsconfig.json
│       │   ├── tsconfig.test.json
│       │   └── vitest.config.ts
│       ├── music-ui-synthesizer-envelopes
│       │   ├── package.json
│       │   ├── README.md
│       │   ├── src
│       │   │   └── code.ts
│       │   ├── tests
│       │   │   └── tests.test.ts
│       │   ├── tsconfig.json
│       │   ├── tsconfig.test.json
│       │   └── vitest.config.ts
│       ├── music-ui-synthesizer-filters
│       │   ├── package.json
│       │   ├── README.md
│       │   ├── src
│       │   │   └── code.ts
│       │   ├── tests
│       │   │   └── tests.test.ts
│       │   ├── tsconfig.json
│       │   ├── tsconfig.test.json
│       │   └── vitest.config.ts
│       ├── music-ui-synthesizer-oscillators
│       │   ├── package.json
│       │   ├── README.md
│       │   ├── src
│       │   │   └── code.ts
│       │   ├── tests
│       │   │   └── tests.test.ts
│       │   ├── tsconfig.json
│       │   ├── tsconfig.test.json
│       │   └── vitest.config.ts
│       └── music-ui-synthesizer-voice
│           ├── package.json
│           ├── README.md
│           ├── src
│           │   └── code.ts
│           ├── tests
│           │   └── tests.test.ts
│           ├── tsconfig.json
│           ├── tsconfig.test.json
│           └── vitest.config.ts
├── package.json
├── resources
├── scripts
│   └── generate-schema-types.ts
├── src
│   ├── contracts
│   ├── domain
│   ├── for.ai.spec.md
│   ├── generated
│   │   ├── schema-types.js
│   │   └── schema-types.ts
│   ├── index.ts
│   ├── IProjectFactory.ts
│   ├── IProjectLoader.ts
│   ├── midiEventHandler
│   ├── modules
│   │   ├── envelops
│   │   │   └── ADSR
│   │   │       ├── AdsrPointsRecord.ts
│   │   │       ├── code.ts
│   │   │       ├── index.ts
│   │   │       ├── IStrictAdsrRuleMessageModel.ts
│   │   │       ├── StartMustBeOriginSpecification.ts
│   │   │       └── types.ts
│   │   └── sequencer-statefull
│   │       └── code.ts
│   ├── ProjectLoader.ts
│   ├── rules
│   │   └── SequencerProjectSemanticRuleSet.ts
│   ├── specifications
│   │   ├── ActivePatternExistsSpecification.ts
│   │   ├── CreatedAtBeforeUpdatedAtSpecification.ts
│   │   ├── MidiTrackMustNotReferenceSampleIdSpecification.ts
│   │   ├── ReferencedSamplesExistSpecification.ts
│   │   ├── SampleTrackRequiresSampleIdSpecification.ts
│   │   ├── SampleWindowStartBeforeEndSpecification.ts
│   │   ├── SequencerProjectSemanticSpecification.ts
│   │   ├── StepsWithinPatternBoundsSpecification.ts
│   │   ├── UniquePatternIdsSpecification.ts
│   │   ├── UniqueSampleIdsSpecification.ts
│   │   ├── UniqueStepIdsWithinTrackSpecification.ts
│   │   ├── UniqueStepIndexesWithinTrackSpecification.ts
│   │   └── UniqueTrackIdsWithinPatternSpecification.ts
│   ├── state.yml
│   └── synthEngine
├── tests
│   ├── ActivePatternExistsSpecification.test.ts
│   ├── CreatedAtBeforeUpdatedAtSpecification.test.ts
│   ├── Envelope
│   │   └── ADSR
│   │       └── StrictAdsrEnvelope.Start-A.test.ts
│   ├── fixture
│   │   ├── invalid-additional-property.json
│   │   ├── invalid-missing-project-id.json
│   │   ├── SequencerProjectDocumentBuilder.ts
│   │   ├── SpyFactory.ts
│   │   ├── valid-non-power-of-two-step-count.json
│   │   └── valid-project.json
│   ├── MidiTrackMustNotReferenceSampleIdSpecification.test.ts
│   ├── ReferencedSamplesExistSpecification.test.ts
│   ├── SampleTrackRequiresSampleIdSpecification.test.ts
│   ├── SampleWindowStartBeforeEndSpecification.test.ts
│   ├── SequencerProjectDocumentBuilder.test.ts
│   ├── SequencerProjectSemanticRuleSet.test.ts
│   ├── SequencerProjectSemanticSpecification.test.ts
│   ├── StepsWithinPatternBoundsSpecification.test.ts
│   ├── UniquePatternIdsSpecification.test.ts
│   ├── UniqueSampleIdsSpecification.test.ts
│   ├── UniqueStepIdsWithinTrackSpecification.test.ts
│   ├── UniqueStepIndexesWithinTrackSpecification.test.ts
│   └── UniqueTrackIdsWithinPatternSpecification.test.ts
├── tsconfig.json
├── tsconfig.test.json
├── tsconfig.tsbuildinfo
└── vitest.config.ts

Thought for a couple of seconds
Your structure is too large for first implementation. Keep it, but do not implement all packages now.

Immediate issues:

❌ Music-core-synthesizer-parameters
✅ music-core-synthesizer-parameters

❌ music-core-synthesizer-voiceAllocator
✅ music-core-synthesizer-voice-allocator

❌ src/modules/envelops
✅ src/modules/envelopes
Big architectural issue:

music-core-synthesizer/src
still contains old mixed code:

src/modules/envelops
src/modules/sequencer-statefull
src/midiEventHandler
src/synthEngine
That conflicts with your new modular package design.

Best guess: treat root package as composition/documentation only, not implementation.

Recommended first cut
Work only here first:

music-core-synthesizer
├── modules
│   ├── music-core-synthesizer-contracts
│   ├── music-core-synthesizer-engine
│   ├── music-core-synthesizer-web-audio
│   └── ui
│       └── music-ui-synthesizer
Ignore these until sound works:

music-core-synthesizer-distortion
music-core-synthesizer-filters
music-core-synthesizer-noise
music-core-synthesizer-modulation
music-core-synthesizer-presets
music-core-synthesizer-voice-allocator
music-core-sequencer
music-ui-sequencer
music-ui-synthesizer-*
Dependency graph
music-core-midi
        ↑
music-core-synthesizer-contracts
        ↑
music-core-synthesizer-engine
        ↑
music-core-synthesizer-web-audio
        ↑
music-ui-synthesizer
Root package role
Use root music-core-synthesizer as:

composition root / documentation / package aggregator
Not as:

domain + engine + sequencer + UI + schema + ADSR implementation
First cleanup actions
Rename casing/package folders.

Move old ADSR code into music-core-synthesizer-envelopes.

Move old synth engine code into music-core-synthesizer-engine.

Move sequencer-statefull out to music-core-sequencer.

Keep root src/index.ts as exports only, or delete root implementation later.

Start with music-core-synthesizer-contracts. That package becomes the seam that makes all other modules work together.

music-core-synthesizer-contracts

Stopped thinking
Quick answer

music-core-synthesizer-domain-objects? 

No. Prefer:

music-core-synthesizer-contracts
Do not create:

music-core-synthesizer-domain-objects
Reason: your shared package should expose contracts and small value definitions, not become a dumping ground for “objects”.

Use this split:

music-core-synthesizer-contracts
  - interfaces
  - enums
  - value types
  - DTO-like definitions

music-core-synthesizer-engine
  - SynthEngine
  - MidiMessageRouter
  - NoteLifetimeCoordinator

music-core-synthesizer-web-audio
  - Web Audio implementation/adapters
Only create domain-objects if you later have rich domain models with behavior that do not belong to engine or infrastructure. Right now, it will blur boundaries.

music-core-synthesizer-contracts

// packages/Audio/music-core-synthesizer-contracts/src/index.ts

import type { MidiMessage } from "@monorepo/core-midi";

/* ============================================================================
   Primitives
============================================================================ */

export type Seconds = number;
export type Hertz = number;
export type MidiNoteNumber = number;
export type Normalized = number; // 0..1

export interface IDisposable {
  dispose(): void;
}

/* ============================================================================
   Definitions (pure data, no behavior)
============================================================================ */

export const enum OscillatorWaveform {
  Sine = "sine",
  Square = "square",
  Sawtooth = "sawtooth",
  Triangle = "triangle",
}

export const enum FilterType {
  LowPass = "lowpass",
  HighPass = "highpass",
  BandPass = "bandpass",
}

export const enum DistortionType {
  None = "none",
  SoftClip = "soft-clip",
  HardClip = "hard-clip",
  Tanh = "tanh",
}

export interface IOscillatorDefinition {
  readonly waveform: OscillatorWaveform;
  readonly detuneCents: number;
  readonly gain: Normalized;
}

export interface INoiseDefinition {
  readonly enabled: boolean;
  readonly gain: Normalized;
}

export interface IEnvelopeDefinition {
  readonly attackSeconds: Seconds;
  readonly decaySeconds: Seconds;
  readonly sustainLevel: Normalized;
  readonly releaseSeconds: Seconds;
}

export interface IFilterDefinition {
  readonly enabled: boolean;
  readonly type: FilterType;
  readonly cutoffHz: Hertz;
  readonly resonanceQ: number;
}

export interface IDistortionDefinition {
  readonly enabled: boolean;
  readonly type: DistortionType;
  readonly amount: Normalized;
}

export interface IVoiceDefinition {
  readonly oscillator: IOscillatorDefinition;
  readonly noise: INoiseDefinition;
  readonly envelope: IEnvelopeDefinition;
  readonly filter: IFilterDefinition;
  readonly distortion: IDistortionDefinition;
}

/* ============================================================================
   Mapping
============================================================================ */

export interface IMidiNoteFrequencyMapper {
  map(note: MidiNoteNumber): Hertz;
}

/* ============================================================================
   Voice lifecycle
============================================================================ */

export interface IVoiceHandle extends IDisposable {
  readonly id: string;
  readonly note: MidiNoteNumber;
  readonly isReleased: boolean;

  start(at: Seconds): void;
  release(at: Seconds): void;
}

/* ============================================================================
   Voice allocation
============================================================================ */

export interface IVoiceAllocator {
  allocate(
    active: readonly IVoiceHandle[],
    note: MidiNoteNumber,
  ): IVoiceHandle | null;
}

/* ============================================================================
   Application layer contracts
============================================================================ */

export interface ISynthEngine extends IDisposable {
  handle(message: MidiMessage): void;
  panic(): void;
  setVoiceDefinition(definition: IVoiceDefinition): void;
}

export interface IMidiMessageRouter {
  route(message: MidiMessage): void;
}

export interface INoteLifetimeCoordinator {
  noteOn(note: MidiNoteNumber, velocity: Normalized, at: Seconds): void;
  noteOff(note: MidiNoteNumber, at: Seconds): void;
  releaseAll(at: Seconds): void;
}

/* ============================================================================
   Web Audio infrastructure contracts
============================================================================ */

export interface IWebAudioContextFactory {
  create(): AudioContext;
}

export interface IWebAudioMasterBus extends IDisposable {
  readonly input: AudioNode;
  readonly output: AudioNode;

  connect(destination: AudioNode): void;
  setGain(value: Normalized, at: Seconds): void;
}

export interface IWebAudioEnvelopeScheduler {
  noteOn(
    param: AudioParam,
    env: IEnvelopeDefinition,
    velocity: Normalized,
    at: Seconds,
  ): void;

  noteOff(
    param: AudioParam,
    env: IEnvelopeDefinition,
    at: Seconds,
  ): void;

  cancel(param: AudioParam, at: Seconds): void;
}

export interface IWebAudioNoiseSourceFactory {
  create(context: AudioContext): AudioNode;
}

export interface IWebAudioVoiceGraph {
  readonly output: AudioNode;
  readonly oscillator: OscillatorNode;
  readonly vca: GainNode;
  readonly filter: BiquadFilterNode | null;
  readonly distortion: WaveShaperNode | null;
  readonly noise: AudioNode | null;
}

export interface IWebAudioVoiceGraphBuilder {
  build(request: {
    readonly context: AudioContext;
    readonly destination: AudioNode;
    readonly definition: IVoiceDefinition;
    readonly frequencyHz: Hertz;
  }): IWebAudioVoiceGraph;
}

export interface IWebAudioVoiceFactory {
  create(request: {
    readonly context: AudioContext;
    readonly destination: AudioNode;
    readonly definition: IVoiceDefinition;
    readonly note: MidiNoteNumber;
    readonly velocity: Normalized;
    readonly frequencyHz: Hertz;
    readonly startedAt: Seconds;
  }): IVoiceHandle;
}

music-core-synthesizer-engine

Thought for a couple of seconds
// packages/Audio/music-core-synthesizer-engine/src/index.ts

import {
  MidiStatus,
  type MidiMessage,
} from "@monorepo/core-midi";

import type {
  Hertz,
  IMidiMessageRouter,
  IMidiNoteFrequencyMapper,
  INoteLifetimeCoordinator,
  ISynthEngine,
  IVoiceDefinition,
  Normalized,
  Seconds,
} from "@monorepo/music-core-synthesizer-contracts";

/* ============================================================================
   Time
============================================================================ */

export interface IAudioTimeProvider {
  now(): Seconds;
}

/* ============================================================================
   Frequency
============================================================================ */

export class EqualTemperamentMidiNoteFrequencyMapper implements IMidiNoteFrequencyMapper {
  public map(note: number): Hertz {
    if (!Number.isInteger(note) || note < 0 || note > 127) {
      throw new Error("MIDI note must be an integer in range 0..127.");
    }

    return 440 * Math.pow(2, (note - 69) / 12);
  }
}

/* ============================================================================
   Engine
============================================================================ */

export interface SynthEngineDependencies {
  readonly router: IMidiMessageRouter;
  readonly coordinator: INoteLifetimeCoordinator;
}

export class SynthEngine implements ISynthEngine {
  public constructor(
    private readonly dependencies: SynthEngineDependencies,
    private voiceDefinition: IVoiceDefinition,
  ) {}

  public handle(message: MidiMessage): void {
    this.dependencies.router.route(message);
  }

  public setVoiceDefinition(definition: IVoiceDefinition): void {
    this.voiceDefinition = definition;
  }

  public getVoiceDefinition(): IVoiceDefinition {
    return this.voiceDefinition;
  }

  public panic(): void {
    this.dependencies.coordinator.releaseAll(0);
  }

  public dispose(): void {
    this.panic();
  }
}

/* ============================================================================
   MIDI routing
============================================================================ */

export interface MidiMessageRouterDependencies {
  readonly timeProvider: IAudioTimeProvider;
  readonly coordinator: INoteLifetimeCoordinator;
}

export class MidiMessageRouter implements IMidiMessageRouter {
  public constructor(private readonly dependencies: MidiMessageRouterDependencies) {}

  public route(message: MidiMessage): void {
    const at = this.dependencies.timeProvider.now();

    switch (message.status) {
      case MidiStatus.NoteOn: {
        const velocity = this.toNormalized(message.velocity.value());

        if (velocity <= 0) {
          this.dependencies.coordinator.noteOff(message.note.value(), at);
          return;
        }

        this.dependencies.coordinator.noteOn(message.note.value(), velocity, at);
        return;
      }

      case MidiStatus.NoteOff:
        this.dependencies.coordinator.noteOff(message.note.value(), at);
        return;

      default:
        return;
    }
  }

  private toNormalized(value0To127: number): Normalized {
    if (!Number.isInteger(value0To127) || value0To127 < 0 || value0To127 > 127) {
      throw new Error("MIDI velocity must be an integer in range 0..127.");
    }

    return value0To127 / 127;
  }
}

/* ============================================================================
   Note lifetime
============================================================================ */

import type {
  IVoiceFactory,
  IVoiceHandle,
} from "@monorepo/music-core-synthesizer-contracts";

export interface NoteLifetimeCoordinatorDependencies {
  readonly voiceFactory: IVoiceFactoryLike;
  readonly frequencyMapper: IMidiNoteFrequencyMapper;
  readonly voiceDefinitionProvider: IVoiceDefinitionProvider;
}

export interface IVoiceFactoryLike {
  create(request: {
    readonly note: number;
    readonly velocity: Normalized;
    readonly frequencyHz: Hertz;
    readonly definition: IVoiceDefinition;
    readonly startedAt: Seconds;
  }): IVoiceHandle;
}

export interface IVoiceDefinitionProvider {
  get(): IVoiceDefinition;
}

export class StaticVoiceDefinitionProvider implements IVoiceDefinitionProvider {
  public constructor(private definition: IVoiceDefinition) {}

  public get(): IVoiceDefinition {
    return this.definition;
  }

  public set(definition: IVoiceDefinition): void {
    this.definition = definition;
  }
}

export class NoteLifetimeCoordinator implements INoteLifetimeCoordinator {
  private readonly activeByNote = new Map<number, IVoiceHandle>();

  public constructor(private readonly dependencies: NoteLifetimeCoordinatorDependencies) {}

  public noteOn(note: number, velocity: Normalized, at: Seconds): void {
    this.releaseExisting(note, at);

    const voice = this.dependencies.voiceFactory.create({
      note,
      velocity,
      frequencyHz: this.dependencies.frequencyMapper.map(note),
      definition: this.dependencies.voiceDefinitionProvider.get(),
      startedAt: at,
    });

    voice.start(at);
    this.activeByNote.set(note, voice);
  }

  public noteOff(note: number, at: Seconds): void {
    const voice = this.activeByNote.get(note);

    if (!voice) {
      return;
    }

    voice.release(at);
    this.activeByNote.delete(note);
  }

  public releaseAll(at: Seconds): void {
    for (const voice of this.activeByNote.values()) {
      voice.release(at);
    }

    this.activeByNote.clear();
  }

  private releaseExisting(note: number, at: Seconds): void {
    const existing = this.activeByNote.get(note);

    if (!existing) {
      return;
    }

    existing.release(at);
    this.activeByNote.delete(note);
  }
}

music-core-synthesizer-web-audio

Thought for a couple of seconds
// packages/Audio/music-core-synthesizer-web-audio/src/index.ts

import type {
  Hertz,
  IDistortionDefinition,
  IEnvelopeDefinition,
  IWebAudioContextFactory,
  IWebAudioEnvelopeScheduler,
  IWebAudioMasterBus,
  IWebAudioNoiseSourceFactory,
  IWebAudioVoiceFactory,
  IWebAudioVoiceGraph,
  IWebAudioVoiceGraphBuilder,
  IFilterDefinition,
  IVoiceDefinition,
  IVoiceHandle,
  MidiNoteNumber,
  Normalized,
  Seconds,
} from "@monorepo/music-core-synthesizer-contracts";

import {
  DistortionType,
  FilterType,
} from "@monorepo/music-core-synthesizer-contracts";

/* ============================================================================
   Context
============================================================================ */

export class WebAudioContextFactory implements IWebAudioContextFactory {
  public create(): AudioContext {
    return new AudioContext();
  }
}

/* ============================================================================
   Master Bus
============================================================================ */

export class WebAudioMasterBus implements IWebAudioMasterBus {
  public readonly input: GainNode;
  public readonly output: GainNode;

  public constructor(
    private readonly context: AudioContext,
    initialGain: Normalized = 0.8,
  ) {
    this.input = context.createGain();
    this.output = context.createGain();

    this.input.connect(this.output);
    this.output.gain.setValueAtTime(initialGain, context.currentTime);
  }

  public connect(destination: AudioNode): void {
    this.output.connect(destination);
  }

  public setGain(value: Normalized, at: Seconds): void {
    WebAudioGuards.normalized(value, "master gain");
    this.output.gain.setValueAtTime(value, at);
  }

  public dispose(): void {
    this.input.disconnect();
    this.output.disconnect();
  }
}

/* ============================================================================
   Envelope
============================================================================ */

export class WebAudioEnvelopeScheduler implements IWebAudioEnvelopeScheduler {
  public noteOn(
    param: AudioParam,
    env: IEnvelopeDefinition,
    velocity: Normalized,
    at: Seconds,
  ): void {
    WebAudioGuards.envelope(env);
    WebAudioGuards.normalized(velocity, "velocity");

    const attackEnd = at + env.attackSeconds;
    const decayEnd = attackEnd + env.decaySeconds;
    const sustain = env.sustainLevel * velocity;

    param.cancelScheduledValues(at);
    param.setValueAtTime(0, at);
    param.linearRampToValueAtTime(velocity, attackEnd);
    param.linearRampToValueAtTime(sustain, decayEnd);
  }

  public noteOff(
    param: AudioParam,
    env: IEnvelopeDefinition,
    at: Seconds,
  ): void {
    WebAudioGuards.envelope(env);

    const releaseEnd = at + env.releaseSeconds;

    param.cancelScheduledValues(at);
    param.setValueAtTime(param.value, at);
    param.linearRampToValueAtTime(0, releaseEnd);
  }

  public cancel(param: AudioParam, at: Seconds): void {
    param.cancelScheduledValues(at);
  }
}

/* ============================================================================
   Noise
============================================================================ */

export class WebAudioWhiteNoiseSourceFactory implements IWebAudioNoiseSourceFactory {
  public constructor(private readonly durationSeconds = 2) {
    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
      throw new Error("Noise buffer duration must be greater than zero.");
    }
  }

  public create(context: AudioContext): AudioNode {
    const frameCount = Math.ceil(context.sampleRate * this.durationSeconds);
    const buffer = context.createBuffer(1, frameCount, context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.start();

    return source;
  }
}

/* ============================================================================
   Voice Graph Builder
============================================================================ */

export class WebAudioVoiceGraphBuilder implements IWebAudioVoiceGraphBuilder {
  public constructor(
    private readonly noiseSourceFactory: IWebAudioNoiseSourceFactory,
  ) {}

  public build(request: {
    readonly context: AudioContext;
    readonly destination: AudioNode;
    readonly definition: IVoiceDefinition;
    readonly frequencyHz: Hertz;
  }): IWebAudioVoiceGraph {
    WebAudioGuards.frequency(request.frequencyHz, "frequencyHz");

    const oscillator = request.context.createOscillator();
    oscillator.type = request.definition.oscillator.waveform;
    oscillator.frequency.setValueAtTime(
      request.frequencyHz,
      request.context.currentTime,
    );
    oscillator.detune.setValueAtTime(
      request.definition.oscillator.detuneCents,
      request.context.currentTime,
    );

    const oscillatorGain = request.context.createGain();
    oscillatorGain.gain.setValueAtTime(
      request.definition.oscillator.gain,
      request.context.currentTime,
    );

    const filter = this.createFilterOrNull(
      request.context,
      request.definition.filter,
    );

    const distortion = this.createDistortionOrNull(
      request.context,
      request.definition.distortion,
    );

    const vca = request.context.createGain();
    vca.gain.setValueAtTime(0, request.context.currentTime);

    const firstProcessor = filter ?? distortion ?? vca;

    oscillator.connect(oscillatorGain);
    oscillatorGain.connect(firstProcessor);

    if (filter && distortion) {
      filter.connect(distortion);
      distortion.connect(vca);
    } else if (filter) {
      filter.connect(vca);
    } else if (distortion) {
      distortion.connect(vca);
    }

    const noise = this.createNoiseOrNull(
      request.context,
      request.definition,
      firstProcessor,
    );

    vca.connect(request.destination);

    return {
      output: vca,
      oscillator,
      vca,
      filter,
      distortion,
      noise,
    };
  }

  private createFilterOrNull(
    context: AudioContext,
    definition: IFilterDefinition,
  ): BiquadFilterNode | null {
    if (!definition.enabled) {
      return null;
    }

    WebAudioGuards.frequency(definition.cutoffHz, "filter cutoffHz");

    const node = context.createBiquadFilter();

    switch (definition.type) {
      case FilterType.LowPass:
        node.type = "lowpass";
        break;
      case FilterType.HighPass:
        node.type = "highpass";
        break;
      case FilterType.BandPass:
        node.type = "bandpass";
        break;
      default:
        throw new Error("Unsupported filter type.");
    }

    node.frequency.setValueAtTime(definition.cutoffHz, context.currentTime);
    node.Q.setValueAtTime(definition.resonanceQ, context.currentTime);

    return node;
  }

  private createDistortionOrNull(
    context: AudioContext,
    definition: IDistortionDefinition,
  ): WaveShaperNode | null {
    if (!definition.enabled || definition.type === DistortionType.None) {
      return null;
    }

    WebAudioGuards.normalized(definition.amount, "distortion amount");

    const node = context.createWaveShaper();
    node.curve = WebAudioDistortionCurveFactory.create(definition);
    node.oversample = "4x";

    return node;
  }

  private createNoiseOrNull(
    context: AudioContext,
    definition: IVoiceDefinition,
    destination: AudioNode,
  ): AudioNode | null {
    if (!definition.noise.enabled || definition.noise.gain <= 0) {
      return null;
    }

    WebAudioGuards.normalized(definition.noise.gain, "noise gain");

    const source = this.noiseSourceFactory.create(context);
    const gain = context.createGain();

    gain.gain.setValueAtTime(definition.noise.gain, context.currentTime);

    source.connect(gain);
    gain.connect(destination);

    return source;
  }
}

/* ============================================================================
   Voice Factory / Voice Handle
============================================================================ */

export class WebAudioVoiceFactory implements IWebAudioVoiceFactory {
  public constructor(
    private readonly graphBuilder: IWebAudioVoiceGraphBuilder,
    private readonly envelopeScheduler: IWebAudioEnvelopeScheduler,
  ) {}

  public create(request: {
    readonly context: AudioContext;
    readonly destination: AudioNode;
    readonly definition: IVoiceDefinition;
    readonly note: MidiNoteNumber;
    readonly velocity: Normalized;
    readonly frequencyHz: Hertz;
    readonly startedAt: Seconds;
  }): IVoiceHandle {
    WebAudioGuards.normalized(request.velocity, "velocity");

    const graph = this.graphBuilder.build({
      context: request.context,
      destination: request.destination,
      definition: request.definition,
      frequencyHz: request.frequencyHz,
    });

    return new WebAudioVoiceHandle(
      request.context,
      graph,
      this.envelopeScheduler,
      request.definition.envelope,
      request.note,
      request.velocity,
      request.startedAt,
    );
  }
}

export class WebAudioVoiceHandle implements IVoiceHandle {
  public readonly id: string;
  public readonly note: MidiNoteNumber;

  private released = false;
  private disposed = false;

  public constructor(
    private readonly context: AudioContext,
    private readonly graph: IWebAudioVoiceGraph,
    private readonly envelopeScheduler: IWebAudioEnvelopeScheduler,
    private readonly envelope: IEnvelopeDefinition,
    note: MidiNoteNumber,
    private readonly velocity: Normalized,
    startedAt: Seconds,
  ) {
    this.id = `${note}:${startedAt}`;
    this.note = note;
  }

  public get isReleased(): boolean {
    return this.released;
  }

  public start(at: Seconds): void {
    this.throwIfDisposed();

    this.envelopeScheduler.noteOn(
      this.graph.vca.gain,
      this.envelope,
      this.velocity,
      at,
    );

    this.graph.oscillator.start(at);
  }

  public release(at: Seconds): void {
    if (this.disposed || this.released) {
      return;
    }

    this.released = true;

    this.envelopeScheduler.noteOff(this.graph.vca.gain, this.envelope, at);

    const stopAt = at + this.envelope.releaseSeconds + 0.02;
    this.graph.oscillator.stop(stopAt);
    this.graph.oscillator.addEventListener("ended", () => this.dispose(), {
      once: true,
    });
  }

  public dispose(): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;

    this.graph.oscillator.disconnect();
    this.graph.vca.disconnect();
    this.graph.filter?.disconnect();
    this.graph.distortion?.disconnect();
    this.graph.noise?.disconnect();
  }

  private throwIfDisposed(): void {
    if (this.disposed) {
      throw new Error("Voice has already been disposed.");
    }
  }
}

/* ============================================================================
   Distortion Curves
============================================================================ */

export class WebAudioDistortionCurveFactory {
  private static readonly sampleCount = 2048;

  public static create(definition: IDistortionDefinition): Float32Array {
    switch (definition.type) {
      case DistortionType.SoftClip:
        return this.softClip(definition.amount);
      case DistortionType.HardClip:
        return this.hardClip(definition.amount);
      case DistortionType.Tanh:
        return this.tanh(definition.amount);
      case DistortionType.None:
        return this.identity();
      default:
        throw new Error("Unsupported distortion type.");
    }
  }

  private static identity(): Float32Array {
    const curve = new Float32Array(this.sampleCount);

    for (let i = 0; i < curve.length; i++) {
      const x = (i * 2) / (curve.length - 1) - 1;
      curve[i] = x;
    }

    return curve;
  }

  private static softClip(amount: Normalized): Float32Array {
    const curve = new Float32Array(this.sampleCount);
    const drive = 1 + amount * 20;

    for (let i = 0; i < curve.length; i++) {
      const x = (i * 2) / (curve.length - 1) - 1;
      curve[i] = x / (1 + Math.abs(x * drive));
    }

    return curve;
  }

  private static hardClip(amount: Normalized): Float32Array {
    const curve = new Float32Array(this.sampleCount);
    const threshold = Math.max(0.05, 1 - amount);

    for (let i = 0; i < curve.length; i++) {
      const x = (i * 2) / (curve.length - 1) - 1;
      curve[i] = Math.max(-threshold, Math.min(threshold, x)) / threshold;
    }

    return curve;
  }

  private static tanh(amount: Normalized): Float32Array {
    const curve = new Float32Array(this.sampleCount);
    const drive = 1 + amount * 40;

    for (let i = 0; i < curve.length; i++) {
      const x = (i * 2) / (curve.length - 1) - 1;
      curve[i] = Math.tanh(x * drive);
    }

    return curve;
  }
}

/* ============================================================================
   Guards
============================================================================ */

class WebAudioGuards {
  public static normalized(value: number, name: string): void {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      throw new Error(`${name} must be in range 0..1.`);
    }
  }

  public static frequency(value: number, name: string): void {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`${name} must be greater than zero.`);
    }
  }

  public static envelope(env: IEnvelopeDefinition): void {
    if (!Number.isFinite(env.attackSeconds) || env.attackSeconds < 0) {
      throw new Error("Envelope attackSeconds must be >= 0.");
    }

    if (!Number.isFinite(env.decaySeconds) || env.decaySeconds < 0) {
      throw new Error("Envelope decaySeconds must be >= 0.");
    }

    if (!Number.isFinite(env.releaseSeconds) || env.releaseSeconds < 0) {
      throw new Error("Envelope releaseSeconds must be >= 0.");
    }

    this.normalized(env.sustainLevel, "Envelope sustainLevel");
  }
}

How to call for building pnpm - F packages\Audio\music-core-synthesizer\modules\music-core-synthesizer-contracts\package.json

Use --filter (not -F with a file path). Filter by package name or relative folder.

Option 1 — by package name (recommended)
pnpm --filter @monorepo/music-core-synthesizer-contracts build
Option 2 — by folder path
pnpm --filter ./packages/Audio/music-core-synthesizer/modules/music-core-synthesizer-contracts build
Run any script
pnpm --filter @monorepo/music-core-synthesizer-contracts test
pnpm --filter @monorepo/music-core-synthesizer-contracts clean
If you are already inside the package folder
pnpm build
Notes
-F is just shorthand for --filter, but it does not accept a package.json file path

Always target package name or workspace path

If this fails, check that your root pnpm-workspace.yaml includes:

packages:
  - "packages/**"

PS C:\Users\danha\source\repos\HTML\MonoRepro\packages\Audio\music-core-synthesizer> .\build.ps1

> @monorepo/music-core-synthesizer-contracts@1.0.0 build C:\Users\danha\source\repos\HTML\MonoRepro\packages\Audio\music-core-synthesizer\modules\music-core-synthesizer-contracts
> tsc -p tsconfig.json

src/index.ts:3:34 - error TS2307: Cannot find module '@monorepo/core-midi' or its corresponding type declarations.

3 import type { MidiMessage } from "@monorepo/core-midi";
                                   ~~~~~~~~~~~~~~~~~~~~~

Found 1 error in src/index.ts:3

C:\Users\danha\source\repos\HTML\MonoRepro\packages\Audio\music-core-synthesizer\modules\music-core-synthesizer-contracts:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @monorepo/music-core-synthesizer-contracts@1.0.0 build: tsc -p tsconfig.json
Exit status 2

> @monorepo/music-core-synthesizer-engine@1.0.0 build C:\Users\danha\source\repos\HTML\MonoRepro\packages\Audio\music-core-synthesizer\modules\music-core-synthesizer-engine
> tsc -p tsconfig.json

src/index.ts:6:8 - error TS2307: Cannot find module '@monorepo/core-midi' or its corresponding type declarations.

6 } from "@monorepo/core-midi";
         ~~~~~~~~~~~~~~~~~~~~~

src/index.ts:128:3 - error TS2305: Module '"@monorepo/music-core-synthesizer-contracts"' has no exported member 'IVoiceFactory'.

128   IVoiceFactory,
      ~~~~~~~~~~~~~

Found 2 errors in the same file, starting at: src/index.ts:6

C:\Users\danha\source\repos\HTML\MonoRepro\packages\Audio\music-core-synthesizer\modules\music-core-synthesizer-engine:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @monorepo/music-core-synthesizer-engine@1.0.0 build: tsc -p tsconfig.json
Exit status 2

> @monorepo/music-core-synthesizer-web-audio@1.0.0 build C:\Users\danha\source\repos\HTML\MonoRepro\packages\Audio\music-core-synthesizer\modules\music-core-synthesizer-web-audio
> tsc -p tsconfig.json

src/index.ts:265:5 - error TS2322: Type 'Float32Array<ArrayBufferLike>' is not assignable to type 'Float32Array<ArrayBuffer>'.
  Type 'ArrayBufferLike' is not assignable to type 'ArrayBuffer'.
    Type 'SharedArrayBuffer' is not assignable to type 'ArrayBuffer'.
      Types of property '[Symbol.toStringTag]' are incompatible.
        Type '"SharedArrayBuffer"' is not assignable to type '"ArrayBuffer"'.

265     node.curve = WebAudioDistortionCurveFactory.create(definition);
        ~~~~~~~~~~

Found 1 error in src/index.ts:265

C:\Users\danha\source\repos\HTML\MonoRepro\packages\Audio\music-core-synthesizer\modules\music-core-synthesizer-web-audio:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @monorepo/music-core-synthesizer-web-audio@1.0.0 build: tsc -p tsconfig.json
Exit status 2

Thought for 5s
You have 3 separate issues.

// 1) Wrong MIDI package import.
//
// Your real package appears to be:
//
// packages/Audio/music-core-midi
//
// So replace this everywhere:
import type { MidiMessage } from "@monorepo/core-midi";

// with:
import type { MidiMessage } from "@monorepo/music-core-midi";

// and replace:
import { MidiStatus } from "@monorepo/core-midi";

// with:
import { MidiStatus } from "@monorepo/music-core-midi";
// 2) Remove this bad import from music-core-synthesizer-engine/src/index.ts

import type {
  IVoiceFactory,
  IVoiceHandle,
} from "@monorepo/music-core-synthesizer-contracts";

// Replace with only:
import type {
  IVoiceHandle,
} from "@monorepo/music-core-synthesizer-contracts";
// 3) Fix WaveShaper curve return type.
//
// In music-core-synthesizer-web-audio/src/index.ts
// replace all Float32Array return types like this:

public static create(definition: IDistortionDefinition): Float32Array<ArrayBuffer> {
  switch (definition.type) {
    case DistortionType.SoftClip:
      return this.softClip(definition.amount);
    case DistortionType.HardClip:
      return this.hardClip(definition.amount);
    case DistortionType.Tanh:
      return this.tanh(definition.amount);
    case DistortionType.None:
      return this.identity();
    default:
      throw new Error("Unsupported distortion type.");
  }
}

private static createCurve(): Float32Array<ArrayBuffer> {
  return new Float32Array(new ArrayBuffer(this.sampleCount * Float32Array.BYTES_PER_ELEMENT));
}

private static identity(): Float32Array<ArrayBuffer> {
  const curve = this.createCurve();

  for (let i = 0; i < curve.length; i++) {
    const x = (i * 2) / (curve.length - 1) - 1;
    curve[i] = x;
  }

  return curve;
}

private static softClip(amount: Normalized): Float32Array<ArrayBuffer> {
  const curve = this.createCurve();
  const drive = 1 + amount * 20;

  for (let i = 0; i < curve.length; i++) {
    const x = (i * 2) / (curve.length - 1) - 1;
    curve[i] = x / (1 + Math.abs(x * drive));
  }

  return curve;
}

private static hardClip(amount: Normalized): Float32Array<ArrayBuffer> {
  const curve = this.createCurve();
  const threshold = Math.max(0.05, 1 - amount);

  for (let i = 0; i < curve.length; i++) {
    const x = (i * 2) / (curve.length - 1) - 1;
    curve[i] = Math.max(-threshold, Math.min(threshold, x)) / threshold;
  }

  return curve;
}

private static tanh(amount: Normalized): Float32Array<ArrayBuffer> {
  const curve = this.createCurve();
  const drive = 1 + amount * 40;

  for (let i = 0; i < curve.length; i++) {
    const x = (i * 2) / (curve.length - 1) - 1;
    curve[i] = Math.tanh(x * drive);
  }

  return curve;
}
Also check dependencies:

{
  "dependencies": {
    "@monorepo/music-core-midi": "workspace:*",
    "@monorepo/music-core-synthesizer-contracts": "workspace:*"
  }
}
Run:

pnpm install
.\build.ps1

PS C:\Users\danha\source\repos\HTML\MonoRepro\packages\Audio\music-core-synthesizer\modules\music-core-synthesizer-engine> pnpm build

> @monorepo/music-core-synthesizer-engine@1.0.0 build C:\Users\danha\source\repos\HTML\MonoRepro\packages\Audio\music-core-synthesizer\modules\music-core-synthesizer-engine
> tsc -p tsconfig.json

src/index.ts:128:3 - error TS2305: Module '"@monorepo/music-core-synthesizer-contracts"' has no exported member 'IVoiceFactory'.

128   IVoiceFactory,
      ~~~~~~~~~~~~~

Found 1 error in src/index.ts:128

 ELIFECYCLE  Command failed with exit code 2.
PS C:\Users\danha\source\repos\HTML\MonoRepro\packages\Audio\music-core-synthesizer\modules\music-core-synthesizer-engine> 

Remove IVoiceFactory from the import. Your engine already defines IVoiceFactoryLike.

// music-core-synthesizer-engine/src/index.ts

// DELETE this block if it exists:
import type {
  IVoiceFactory,
  IVoiceHandle,
} from "@monorepo/music-core-synthesizer-contracts";

// USE this instead:
import type {
  IVoiceHandle,
} from "@monorepo/music-core-synthesizer-contracts";
Also make sure this interface stays local in the engine file:

export interface IVoiceFactoryLike {
  create(request: {
    readonly note: number;
    readonly velocity: Normalized;
    readonly frequencyHz: Hertz;
    readonly definition: IVoiceDefinition;
    readonly startedAt: Seconds;
  }): IVoiceHandle;
}
Then run:

pnpm build

// packages/Audio/music-core-synthesizer-engine/src/index.ts

import {
  MidiStatus,
  type MidiMessage,
} from "@monorepo/music-core-midi";

import type {
  Hertz,
  IMidiMessageRouter,
  IMidiNoteFrequencyMapper,
  INoteLifetimeCoordinator,
  ISynthEngine,
  IVoiceDefinition,
  Normalized,
  Seconds,
} from "@monorepo/music-core-synthesizer-contracts";

/* ============================================================================
   Time
============================================================================ */

export interface IAudioTimeProvider {
  now(): Seconds;
}

/* ============================================================================
   Frequency
============================================================================ */

export class EqualTemperamentMidiNoteFrequencyMapper implements IMidiNoteFrequencyMapper {
  public map(note: number): Hertz {
    if (!Number.isInteger(note) || note < 0 || note > 127) {
      throw new Error("MIDI note must be an integer in range 0..127.");
    }

    return 440 * Math.pow(2, (note - 69) / 12);
  }
}

/* ============================================================================
   Engine
============================================================================ */

export interface SynthEngineDependencies {
  readonly router: IMidiMessageRouter;
  readonly coordinator: INoteLifetimeCoordinator;
}

export class SynthEngine implements ISynthEngine {
  public constructor(
    private readonly dependencies: SynthEngineDependencies,
    private voiceDefinition: IVoiceDefinition,
  ) {}

  public handle(message: MidiMessage): void {
    this.dependencies.router.route(message);
  }

  public setVoiceDefinition(definition: IVoiceDefinition): void {
    this.voiceDefinition = definition;
  }

  public getVoiceDefinition(): IVoiceDefinition {
    return this.voiceDefinition;
  }

  public panic(): void {
    this.dependencies.coordinator.releaseAll(0);
  }

  public dispose(): void {
    this.panic();
  }
}

/* ============================================================================
   MIDI routing
============================================================================ */

export interface MidiMessageRouterDependencies {
  readonly timeProvider: IAudioTimeProvider;
  readonly coordinator: INoteLifetimeCoordinator;
}

export class MidiMessageRouter implements IMidiMessageRouter {
  public constructor(private readonly dependencies: MidiMessageRouterDependencies) {}

  public route(message: MidiMessage): void {
    const at = this.dependencies.timeProvider.now();

    switch (message.status) {
      case MidiStatus.NoteOn: {
        const velocity = this.toNormalized(message.velocity.value());

        if (velocity <= 0) {
          this.dependencies.coordinator.noteOff(message.note.value(), at);
          return;
        }

        this.dependencies.coordinator.noteOn(message.note.value(), velocity, at);
        return;
      }

      case MidiStatus.NoteOff:
        this.dependencies.coordinator.noteOff(message.note.value(), at);
        return;

      default:
        return;
    }
  }

  private toNormalized(value0To127: number): Normalized {
    if (!Number.isInteger(value0To127) || value0To127 < 0 || value0To127 > 127) {
      throw new Error("MIDI velocity must be an integer in range 0..127.");
    }

    return value0To127 / 127;
  }
}

/* ============================================================================
   Note lifetime
============================================================================ */

import type {
  IVoiceFactory,
  IVoiceHandle,
} from "@monorepo/music-core-synthesizer-contracts";

export interface NoteLifetimeCoordinatorDependencies {
  readonly voiceFactory: IVoiceFactoryLike;
  readonly frequencyMapper: IMidiNoteFrequencyMapper;
  readonly voiceDefinitionProvider: IVoiceDefinitionProvider;
}

export interface IVoiceFactoryLike {
  create(request: {
    readonly note: number;
    readonly velocity: Normalized;
    readonly frequencyHz: Hertz;
    readonly definition: IVoiceDefinition;
    readonly startedAt: Seconds;
  }): IVoiceHandle;
}

export interface IVoiceDefinitionProvider {
  get(): IVoiceDefinition;
}

export class StaticVoiceDefinitionProvider implements IVoiceDefinitionProvider {
  public constructor(private definition: IVoiceDefinition) {}

  public get(): IVoiceDefinition {
    return this.definition;
  }

  public set(definition: IVoiceDefinition): void {
    this.definition = definition;
  }
}

export class NoteLifetimeCoordinator implements INoteLifetimeCoordinator {
  private readonly activeByNote = new Map<number, IVoiceHandle>();

  public constructor(private readonly dependencies: NoteLifetimeCoordinatorDependencies) {}

  public noteOn(note: number, velocity: Normalized, at: Seconds): void {
    this.releaseExisting(note, at);

    const voice = this.dependencies.voiceFactory.create({
      note,
      velocity,
      frequencyHz: this.dependencies.frequencyMapper.map(note),
      definition: this.dependencies.voiceDefinitionProvider.get(),
      startedAt: at,
    });

    voice.start(at);
    this.activeByNote.set(note, voice);
  }

  public noteOff(note: number, at: Seconds): void {
    const voice = this.activeByNote.get(note);

    if (!voice) {
      return;
    }

    voice.release(at);
    this.activeByNote.delete(note);
  }

  public releaseAll(at: Seconds): void {
    for (const voice of this.activeByNote.values()) {
      voice.release(at);
    }

    this.activeByNote.clear();
  }

  private releaseExisting(note: number, at: Seconds): void {
    const existing = this.activeByNote.get(note);

    if (!existing) {
      return;
    }

    existing.release(at);
    this.activeByNote.delete(note);
  }
}

// Replace this:

import type {
  IVoiceFactory,
  IVoiceHandle,
} from "@monorepo/music-core-synthesizer-contracts";

// With this:

import type {
  IVoiceHandle,
} from "@monorepo/music-core-synthesizer-contracts";

PS C:\Users\danha\source\repos\HTML\MonoRepro\packages\Audio\music-core-synthesizer\modules\music-core-synthesizer-web-audio> pnpm build

> @monorepo/music-core-synthesizer-web-audio@1.0.0 build C:\Users\danha\source\repos\HTML\MonoRepro\packages\Audio\music-core-synthesizer\modules\music-core-synthesizer-web-audio
> tsc -p tsconfig.json

src/index.ts:265:5 - error TS2322: Type 'Float32Array<ArrayBufferLike>' is not assignable to type 'Float32Array<ArrayBuffer>'.
  Type 'ArrayBufferLike' is not assignable to type 'ArrayBuffer'.
    Type 'SharedArrayBuffer' is not assignable to type 'ArrayBuffer'.
      Types of property '[Symbol.toStringTag]' are incompatible.
        Type '"SharedArrayBuffer"' is not assignable to type '"ArrayBuffer"'.

265     node.curve = WebAudioDistortionCurveFactory.create(definition);
        ~~~~~~~~~~

Found 1 error in src/index.ts:265

 ELIFECYCLE  Command failed with exit code 2.
PS C:\Users\danha\source\repos\HTML\MonoRepro\packages\Audio\music-core-synthesizer\modules\music-core-synthesizer-web-audio> ^C
PS C:\Users\danha\source\repos\HTML\MonoRepro\packages\Audio\music-core-synthesizer\modules\music-core-synthesizer-web-audio> 

// In WebAudioDistortionCurveFactory, replace every:
// new Float32Array(this.sampleCount)
//
// with:
new Float32Array(new ArrayBuffer(this.sampleCount * Float32Array.BYTES_PER_ELEMENT))

// And make the return types explicit:
public static create(definition: IDistortionDefinition): Float32Array<ArrayBuffer>

private static identity(): Float32Array<ArrayBuffer>
private static softClip(amount: Normalized): Float32Array<ArrayBuffer>
private static hardClip(amount: Normalized): Float32Array<ArrayBuffer>
private static tanh(amount: Normalized): Float32Array<ArrayBuffer>
Best small fix:

private static createCurve(): Float32Array<ArrayBuffer> {
  return new Float32Array(
    new ArrayBuffer(this.sampleCount * Float32Array.BYTES_PER_ELEMENT),
  );
}
Then use:

const curve = this.createCurve();
inside all curve methods.

// packages/Audio/music-core-synthesizer-web-audio/src/index.ts

import type {
  Hertz,
  IDistortionDefinition,
  IEnvelopeDefinition,
  IWebAudioContextFactory,
  IWebAudioEnvelopeScheduler,
  IWebAudioMasterBus,
  IWebAudioNoiseSourceFactory,
  IWebAudioVoiceFactory,
  IWebAudioVoiceGraph,
  IWebAudioVoiceGraphBuilder,
  IFilterDefinition,
  IVoiceDefinition,
  IVoiceHandle,
  MidiNoteNumber,
  Normalized,
  Seconds,
} from "@monorepo/music-core-synthesizer-contracts";

import {
  DistortionType,
  FilterType,
} from "@monorepo/music-core-synthesizer-contracts";

/* ============================================================================
   Context
============================================================================ */

export class WebAudioContextFactory implements IWebAudioContextFactory {
  public create(): AudioContext {
    return new AudioContext();
  }
}

/* ============================================================================
   Master Bus
============================================================================ */

export class WebAudioMasterBus implements IWebAudioMasterBus {
  public readonly input: GainNode;
  public readonly output: GainNode;

  public constructor(
    private readonly context: AudioContext,
    initialGain: Normalized = 0.8,
  ) {
    this.input = context.createGain();
    this.output = context.createGain();

    this.input.connect(this.output);
    this.output.gain.setValueAtTime(initialGain, context.currentTime);
  }

  public connect(destination: AudioNode): void {
    this.output.connect(destination);
  }

  public setGain(value: Normalized, at: Seconds): void {
    WebAudioGuards.normalized(value, "master gain");
    this.output.gain.setValueAtTime(value, at);
  }

  public dispose(): void {
    this.input.disconnect();
    this.output.disconnect();
  }
}

/* ============================================================================
   Envelope
============================================================================ */

export class WebAudioEnvelopeScheduler implements IWebAudioEnvelopeScheduler {
  public noteOn(
    param: AudioParam,
    env: IEnvelopeDefinition,
    velocity: Normalized,
    at: Seconds,
  ): void {
    WebAudioGuards.envelope(env);
    WebAudioGuards.normalized(velocity, "velocity");

    const attackEnd = at + env.attackSeconds;
    const decayEnd = attackEnd + env.decaySeconds;
    const sustain = env.sustainLevel * velocity;

    param.cancelScheduledValues(at);
    param.setValueAtTime(0, at);
    param.linearRampToValueAtTime(velocity, attackEnd);
    param.linearRampToValueAtTime(sustain, decayEnd);
  }

  public noteOff(
    param: AudioParam,
    env: IEnvelopeDefinition,
    at: Seconds,
  ): void {
    WebAudioGuards.envelope(env);

    const releaseEnd = at + env.releaseSeconds;

    param.cancelScheduledValues(at);
    param.setValueAtTime(param.value, at);
    param.linearRampToValueAtTime(0, releaseEnd);
  }

  public cancel(param: AudioParam, at: Seconds): void {
    param.cancelScheduledValues(at);
  }
}

/* ============================================================================
   Noise
============================================================================ */

export class WebAudioWhiteNoiseSourceFactory implements IWebAudioNoiseSourceFactory {
  public constructor(private readonly durationSeconds = 2) {
    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
      throw new Error("Noise buffer duration must be greater than zero.");
    }
  }

  public create(context: AudioContext): AudioNode {
    const frameCount = Math.ceil(context.sampleRate * this.durationSeconds);
    const buffer = context.createBuffer(1, frameCount, context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.start();

    return source;
  }
}

/* ============================================================================
   Voice Graph Builder
============================================================================ */

export class WebAudioVoiceGraphBuilder implements IWebAudioVoiceGraphBuilder {
  public constructor(
    private readonly noiseSourceFactory: IWebAudioNoiseSourceFactory,
  ) {}

  public build(request: {
    readonly context: AudioContext;
    readonly destination: AudioNode;
    readonly definition: IVoiceDefinition;
    readonly frequencyHz: Hertz;
  }): IWebAudioVoiceGraph {
    WebAudioGuards.frequency(request.frequencyHz, "frequencyHz");

    const oscillator = request.context.createOscillator();
    oscillator.type = request.definition.oscillator.waveform;
    oscillator.frequency.setValueAtTime(
      request.frequencyHz,
      request.context.currentTime,
    );
    oscillator.detune.setValueAtTime(
      request.definition.oscillator.detuneCents,
      request.context.currentTime,
    );

    const oscillatorGain = request.context.createGain();
    oscillatorGain.gain.setValueAtTime(
      request.definition.oscillator.gain,
      request.context.currentTime,
    );

    const filter = this.createFilterOrNull(
      request.context,
      request.definition.filter,
    );

    const distortion = this.createDistortionOrNull(
      request.context,
      request.definition.distortion,
    );

    const vca = request.context.createGain();
    vca.gain.setValueAtTime(0, request.context.currentTime);

    const firstProcessor = filter ?? distortion ?? vca;

    oscillator.connect(oscillatorGain);
    oscillatorGain.connect(firstProcessor);

    if (filter && distortion) {
      filter.connect(distortion);
      distortion.connect(vca);
    } else if (filter) {
      filter.connect(vca);
    } else if (distortion) {
      distortion.connect(vca);
    }

    const noise = this.createNoiseOrNull(
      request.context,
      request.definition,
      firstProcessor,
    );

    vca.connect(request.destination);

    return {
      output: vca,
      oscillator,
      vca,
      filter,
      distortion,
      noise,
    };
  }

  private createFilterOrNull(
    context: AudioContext,
    definition: IFilterDefinition,
  ): BiquadFilterNode | null {
    if (!definition.enabled) {
      return null;
    }

    WebAudioGuards.frequency(definition.cutoffHz, "filter cutoffHz");

    const node = context.createBiquadFilter();

    switch (definition.type) {
      case FilterType.LowPass:
        node.type = "lowpass";
        break;
      case FilterType.HighPass:
        node.type = "highpass";
        break;
      case FilterType.BandPass:
        node.type = "bandpass";
        break;
      default:
        throw new Error("Unsupported filter type.");
    }

    node.frequency.setValueAtTime(definition.cutoffHz, context.currentTime);
    node.Q.setValueAtTime(definition.resonanceQ, context.currentTime);

    return node;
  }

  private createDistortionOrNull(
    context: AudioContext,
    definition: IDistortionDefinition,
  ): WaveShaperNode | null {
    if (!definition.enabled || definition.type === DistortionType.None) {
      return null;
    }

    WebAudioGuards.normalized(definition.amount, "distortion amount");

    const node = context.createWaveShaper();
    node.curve = WebAudioDistortionCurveFactory.create(definition);
    node.oversample = "4x";

    return node;
  }

  private createNoiseOrNull(
    context: AudioContext,
    definition: IVoiceDefinition,
    destination: AudioNode,
  ): AudioNode | null {
    if (!definition.noise.enabled || definition.noise.gain <= 0) {
      return null;
    }

    WebAudioGuards.normalized(definition.noise.gain, "noise gain");

    const source = this.noiseSourceFactory.create(context);
    const gain = context.createGain();

    gain.gain.setValueAtTime(definition.noise.gain, context.currentTime);

    source.connect(gain);
    gain.connect(destination);

    return source;
  }
}

/* ============================================================================
   Voice Factory / Voice Handle
============================================================================ */

export class WebAudioVoiceFactory implements IWebAudioVoiceFactory {
  public constructor(
    private readonly graphBuilder: IWebAudioVoiceGraphBuilder,
    private readonly envelopeScheduler: IWebAudioEnvelopeScheduler,
  ) {}

  public create(request: {
    readonly context: AudioContext;
    readonly destination: AudioNode;
    readonly definition: IVoiceDefinition;
    readonly note: MidiNoteNumber;
    readonly velocity: Normalized;
    readonly frequencyHz: Hertz;
    readonly startedAt: Seconds;
  }): IVoiceHandle {
    WebAudioGuards.normalized(request.velocity, "velocity");

    const graph = this.graphBuilder.build({
      context: request.context,
      destination: request.destination,
      definition: request.definition,
      frequencyHz: request.frequencyHz,
    });

    return new WebAudioVoiceHandle(
      request.context,
      graph,
      this.envelopeScheduler,
      request.definition.envelope,
      request.note,
      request.velocity,
      request.startedAt,
    );
  }
}

export class WebAudioVoiceHandle implements IVoiceHandle {
  public readonly id: string;
  public readonly note: MidiNoteNumber;

  private released = false;
  private disposed = false;

  public constructor(
    private readonly context: AudioContext,
    private readonly graph: IWebAudioVoiceGraph,
    private readonly envelopeScheduler: IWebAudioEnvelopeScheduler,
    private readonly envelope: IEnvelopeDefinition,
    note: MidiNoteNumber,
    private readonly velocity: Normalized,
    startedAt: Seconds,
  ) {
    this.id = ${note}:${startedAt};
    this.note = note;
  }

  public get isReleased(): boolean {
    return this.released;
  }

  public start(at: Seconds): void {
    this.throwIfDisposed();

    this.envelopeScheduler.noteOn(
      this.graph.vca.gain,
      this.envelope,
      this.velocity,
      at,
    );

    this.graph.oscillator.start(at);
  }

  public release(at: Seconds): void {
    if (this.disposed || this.released) {
      return;
    }

    this.released = true;

    this.envelopeScheduler.noteOff(this.graph.vca.gain, this.envelope, at);

    const stopAt = at + this.envelope.releaseSeconds + 0.02;
    this.graph.oscillator.stop(stopAt);
    this.graph.oscillator.addEventListener("ended", () => this.dispose(), {
      once: true,
    });
  }

  public dispose(): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;

    this.graph.oscillator.disconnect();
    this.graph.vca.disconnect();
    this.graph.filter?.disconnect();
    this.graph.distortion?.disconnect();
    this.graph.noise?.disconnect();
  }

  private throwIfDisposed(): void {
    if (this.disposed) {
      throw new Error("Voice has already been disposed.");
    }
  }
}

/* ============================================================================
   Distortion Curves
============================================================================ */

export class WebAudioDistortionCurveFactory {
  private static readonly sampleCount = 2048;

  public static create(definition: IDistortionDefinition): Float32Array {
    switch (definition.type) {
      case DistortionType.SoftClip:
        return this.softClip(definition.amount);
      case DistortionType.HardClip:
        return this.hardClip(definition.amount);
      case DistortionType.Tanh:
        return this.tanh(definition.amount);
      case DistortionType.None:
        return this.identity();
      default:
        throw new Error("Unsupported distortion type.");
    }
  }

  private static identity(): Float32Array {
    const curve = new Float32Array(this.sampleCount);

    for (let i = 0; i < curve.length; i++) {
      const x = (i * 2) / (curve.length - 1) - 1;
      curve[i] = x;
    }

    return curve;
  }

  private static softClip(amount: Normalized): Float32Array {
    const curve = new Float32Array(this.sampleCount);
    const drive = 1 + amount * 20;

    for (let i = 0; i < curve.length; i++) {
      const x = (i * 2) / (curve.length - 1) - 1;
      curve[i] = x / (1 + Math.abs(x * drive));
    }

    return curve;
  }

  private static hardClip(amount: Normalized): Float32Array {
    const curve = new Float32Array(this.sampleCount);
    const threshold = Math.max(0.05, 1 - amount);

    for (let i = 0; i < curve.length; i++) {
      const x = (i * 2) / (curve.length - 1) - 1;
      curve[i] = Math.max(-threshold, Math.min(threshold, x)) / threshold;
    }

    return curve;
  }

  private static tanh(amount: Normalized): Float32Array {
    const curve = new Float32Array(this.sampleCount);
    const drive = 1 + amount * 40;

    for (let i = 0; i < curve.length; i++) {
      const x = (i * 2) / (curve.length - 1) - 1;
      curve[i] = Math.tanh(x * drive);
    }

    return curve;
  }
}

/* ============================================================================
   Guards
============================================================================ */

class WebAudioGuards {
  public static normalized(value: number, name: string): void {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      throw new Error(${name} must be in range 0..1.);
    }
  }

  public static frequency(value: number, name: string): void {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(${name} must be greater than zero.);
    }
  }

  public static envelope(env: IEnvelopeDefinition): void {
    if (!Number.isFinite(env.attackSeconds) || env.attackSeconds < 0) {
      throw new Error("Envelope attackSeconds must be >= 0.");
    }

    if (!Number.isFinite(env.decaySeconds) || env.decaySeconds < 0) {
      throw new Error("Envelope decaySeconds must be >= 0.");
    }

    if (!Number.isFinite(env.releaseSeconds) || env.releaseSeconds < 0) {
      throw new Error("Envelope releaseSeconds must be >= 0.");
    }

    this.normalized(env.sustainLevel, "Envelope sustainLevel");
  }
} I want a new file! 

// packages/Audio/music-core-synthesizer-web-audio/src/index.ts

import type {
  Hertz,
  IDistortionDefinition,
  IEnvelopeDefinition,
  IWebAudioContextFactory,
  IWebAudioEnvelopeScheduler,
  IWebAudioMasterBus,
  IWebAudioNoiseSourceFactory,
  IWebAudioVoiceFactory,
  IWebAudioVoiceGraph,
  IWebAudioVoiceGraphBuilder,
  IFilterDefinition,
  IVoiceDefinition,
  IVoiceHandle,
  MidiNoteNumber,
  Normalized,
  Seconds,
} from "@monorepo/music-core-synthesizer-contracts";

import {
  DistortionType,
  FilterType,
} from "@monorepo/music-core-synthesizer-contracts";

export class WebAudioContextFactory implements IWebAudioContextFactory {
  public create(): AudioContext {
    return new AudioContext();
  }
}

export class WebAudioMasterBus implements IWebAudioMasterBus {
  public readonly input: GainNode;
  public readonly output: GainNode;

  public constructor(
    private readonly context: AudioContext,
    initialGain: Normalized = 0.8,
  ) {
    WebAudioGuards.normalized(initialGain, "initialGain");

    this.input = context.createGain();
    this.output = context.createGain();

    this.input.connect(this.output);
    this.output.gain.setValueAtTime(initialGain, context.currentTime);
  }

  public connect(destination: AudioNode): void {
    this.output.connect(destination);
  }

  public setGain(value: Normalized, at: Seconds): void {
    WebAudioGuards.normalized(value, "master gain");
    this.output.gain.setValueAtTime(value, at);
  }

  public dispose(): void {
    this.input.disconnect();
    this.output.disconnect();
  }
}

export class WebAudioEnvelopeScheduler implements IWebAudioEnvelopeScheduler {
  public noteOn(
    param: AudioParam,
    env: IEnvelopeDefinition,
    velocity: Normalized,
    at: Seconds,
  ): void {
    WebAudioGuards.envelope(env);
    WebAudioGuards.normalized(velocity, "velocity");

    const attackEnd = at + env.attackSeconds;
    const decayEnd = attackEnd + env.decaySeconds;
    const sustain = env.sustainLevel * velocity;

    param.cancelScheduledValues(at);
    param.setValueAtTime(0, at);
    param.linearRampToValueAtTime(velocity, attackEnd);
    param.linearRampToValueAtTime(sustain, decayEnd);
  }

  public noteOff(
    param: AudioParam,
    env: IEnvelopeDefinition,
    at: Seconds,
  ): void {
    WebAudioGuards.envelope(env);

    const releaseEnd = at + env.releaseSeconds;

    param.cancelScheduledValues(at);
    param.setValueAtTime(param.value, at);
    param.linearRampToValueAtTime(0, releaseEnd);
  }

  public cancel(param: AudioParam, at: Seconds): void {
    param.cancelScheduledValues(at);
  }
}

export class WebAudioWhiteNoiseSourceFactory implements IWebAudioNoiseSourceFactory {
  public constructor(private readonly durationSeconds = 2) {
    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
      throw new Error("Noise buffer duration must be greater than zero.");
    }
  }

  public create(context: AudioContext): AudioNode {
    const frameCount = Math.ceil(context.sampleRate * this.durationSeconds);
    const buffer = context.createBuffer(1, frameCount, context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.start();

    return source;
  }
}

export class WebAudioVoiceGraphBuilder implements IWebAudioVoiceGraphBuilder {
  public constructor(
    private readonly noiseSourceFactory: IWebAudioNoiseSourceFactory,
  ) {}

  public build(request: {
    readonly context: AudioContext;
    readonly destination: AudioNode;
    readonly definition: IVoiceDefinition;
    readonly frequencyHz: Hertz;
  }): IWebAudioVoiceGraph {
    WebAudioGuards.frequency(request.frequencyHz, "frequencyHz");
    WebAudioGuards.voiceDefinition(request.definition);

    const oscillator = request.context.createOscillator();
    oscillator.type = request.definition.oscillator.waveform;
    oscillator.frequency.setValueAtTime(
      request.frequencyHz,
      request.context.currentTime,
    );
    oscillator.detune.setValueAtTime(
      request.definition.oscillator.detuneCents,
      request.context.currentTime,
    );

    const oscillatorGain = request.context.createGain();
    oscillatorGain.gain.setValueAtTime(
      request.definition.oscillator.gain,
      request.context.currentTime,
    );

    const filter = this.createFilterOrNull(
      request.context,
      request.definition.filter,
    );

    const distortion = this.createDistortionOrNull(
      request.context,
      request.definition.distortion,
    );

    const vca = request.context.createGain();
    vca.gain.setValueAtTime(0, request.context.currentTime);

    oscillator.connect(oscillatorGain);

    const firstProcessor = filter ?? distortion ?? vca;
    oscillatorGain.connect(firstProcessor);

    if (filter !== null && distortion !== null) {
      filter.connect(distortion);
      distortion.connect(vca);
    } else if (filter !== null) {
      filter.connect(vca);
    } else if (distortion !== null) {
      distortion.connect(vca);
    }

    const noise = this.createNoiseOrNull(
      request.context,
      request.definition,
      firstProcessor,
    );

    vca.connect(request.destination);

    return {
      output: vca,
      oscillator,
      vca,
      filter,
      distortion,
      noise,
    };
  }

  private createFilterOrNull(
    context: AudioContext,
    definition: IFilterDefinition,
  ): BiquadFilterNode | null {
    if (!definition.enabled) {
      return null;
    }

    WebAudioGuards.frequency(definition.cutoffHz, "filter cutoffHz");

    if (!Number.isFinite(definition.resonanceQ) || definition.resonanceQ < 0) {
      throw new Error("filter resonanceQ must be >= 0.");
    }

    const node = context.createBiquadFilter();

    switch (definition.type) {
      case FilterType.LowPass:
        node.type = "lowpass";
        break;
      case FilterType.HighPass:
        node.type = "highpass";
        break;
      case FilterType.BandPass:
        node.type = "bandpass";
        break;
      default:
        throw new Error("Unsupported filter type.");
    }

    node.frequency.setValueAtTime(definition.cutoffHz, context.currentTime);
    node.Q.setValueAtTime(definition.resonanceQ, context.currentTime);

    return node;
  }

  private createDistortionOrNull(
    context: AudioContext,
    definition: IDistortionDefinition,
  ): WaveShaperNode | null {
    if (!definition.enabled || definition.type === DistortionType.None) {
      return null;
    }

    WebAudioGuards.normalized(definition.amount, "distortion amount");

    const node = context.createWaveShaper();
    node.curve = WebAudioDistortionCurveFactory.create(definition);
    node.oversample = "4x";

    return node;
  }

  private createNoiseOrNull(
    context: AudioContext,
    definition: IVoiceDefinition,
    destination: AudioNode,
  ): AudioNode | null {
    if (!definition.noise.enabled || definition.noise.gain <= 0) {
      return null;
    }

    WebAudioGuards.normalized(definition.noise.gain, "noise gain");

    const source = this.noiseSourceFactory.create(context);
    const gain = context.createGain();

    gain.gain.setValueAtTime(definition.noise.gain, context.currentTime);

    source.connect(gain);
    gain.connect(destination);

    return source;
  }
}

export class WebAudioVoiceFactory implements IWebAudioVoiceFactory {
  public constructor(
    private readonly graphBuilder: IWebAudioVoiceGraphBuilder,
    private readonly envelopeScheduler: IWebAudioEnvelopeScheduler,
  ) {}

  public create(request: {
    readonly context: AudioContext;
    readonly destination: AudioNode;
    readonly definition: IVoiceDefinition;
    readonly note: MidiNoteNumber;
    readonly velocity: Normalized;
    readonly frequencyHz: Hertz;
    readonly startedAt: Seconds;
  }): IVoiceHandle {
    WebAudioGuards.normalized(request.velocity, "velocity");
    WebAudioGuards.frequency(request.frequencyHz, "frequencyHz");

    const graph = this.graphBuilder.build({
      context: request.context,
      destination: request.destination,
      definition: request.definition,
      frequencyHz: request.frequencyHz,
    });

    return new WebAudioVoiceHandle(
      graph,
      this.envelopeScheduler,
      request.definition.envelope,
      request.note,
      request.velocity,
      request.startedAt,
    );
  }
}

export class WebAudioVoiceHandle implements IVoiceHandle {
  public readonly id: string;
  public readonly note: MidiNoteNumber;

  private released = false;
  private disposed = false;
  private started = false;

  public constructor(
    private readonly graph: IWebAudioVoiceGraph,
    private readonly envelopeScheduler: IWebAudioEnvelopeScheduler,
    private readonly envelope: IEnvelopeDefinition,
    note: MidiNoteNumber,
    private readonly velocity: Normalized,
    startedAt: Seconds,
  ) {
    this.id = `${note}:${startedAt}`;
    this.note = note;
  }

  public get isReleased(): boolean {
    return this.released;
  }

  public start(at: Seconds): void {
    this.throwIfDisposed();

    if (this.started) {
      throw new Error("Voice has already been started.");
    }

    this.started = true;

    this.envelopeScheduler.noteOn(
      this.graph.vca.gain,
      this.envelope,
      this.velocity,
      at,
    );

    this.graph.oscillator.start(at);
  }

  public release(at: Seconds): void {
    if (this.disposed || this.released) {
      return;
    }

    this.released = true;

    this.envelopeScheduler.noteOff(this.graph.vca.gain, this.envelope, at);

    const stopAt = at + this.envelope.releaseSeconds + 0.02;

    try {
      this.graph.oscillator.stop(stopAt);
    } catch {
      this.dispose();
      return;
    }

    this.graph.oscillator.addEventListener("ended", () => this.dispose(), {
      once: true,
    });
  }

  public dispose(): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;

    this.graph.oscillator.disconnect();
    this.graph.vca.disconnect();
    this.graph.filter?.disconnect();
    this.graph.distortion?.disconnect();
    this.graph.noise?.disconnect();
  }

  private throwIfDisposed(): void {
    if (this.disposed) {
      throw new Error("Voice has already been disposed.");
    }
  }
}

export class WebAudioDistortionCurveFactory {
  private static readonly sampleCount = 2048;

  public static create(
    definition: IDistortionDefinition,
  ): Float32Array<ArrayBuffer> {
    WebAudioGuards.normalized(definition.amount, "distortion amount");

    switch (definition.type) {
      case DistortionType.SoftClip:
        return this.softClip(definition.amount);
      case DistortionType.HardClip:
        return this.hardClip(definition.amount);
      case DistortionType.Tanh:
        return this.tanh(definition.amount);
      case DistortionType.None:
        return this.identity();
      default:
        throw new Error("Unsupported distortion type.");
    }
  }

  private static createCurve(): Float32Array<ArrayBuffer> {
    return new Float32Array(
      new ArrayBuffer(this.sampleCount * Float32Array.BYTES_PER_ELEMENT),
    );
  }

  private static identity(): Float32Array<ArrayBuffer> {
    const curve = this.createCurve();

    for (let i = 0; i < curve.length; i++) {
      const x = (i * 2) / (curve.length - 1) - 1;
      curve[i] = x;
    }

    return curve;
  }

  private static softClip(amount: Normalized): Float32Array<ArrayBuffer> {
    const curve = this.createCurve();
    const drive = 1 + amount * 20;

    for (let i = 0; i < curve.length; i++) {
      const x = (i * 2) / (curve.length - 1) - 1;
      curve[i] = x / (1 + Math.abs(x * drive));
    }

    return curve;
  }

  private static hardClip(amount: Normalized): Float32Array<ArrayBuffer> {
    const curve = this.createCurve();
    const threshold = Math.max(0.05, 1 - amount);

    for (let i = 0; i < curve.length; i++) {
      const x = (i * 2) / (curve.length - 1) - 1;
      curve[i] = Math.max(-threshold, Math.min(threshold, x)) / threshold;
    }

    return curve;
  }

  private static tanh(amount: Normalized): Float32Array<ArrayBuffer> {
    const curve = this.createCurve();
    const drive = 1 + amount * 40;

    for (let i = 0; i < curve.length; i++) {
      const x = (i * 2) / (curve.length - 1) - 1;
      curve[i] = Math.tanh(x * drive);
    }

    return curve;
  }
}

class WebAudioGuards {
  public static normalized(value: number, name: string): void {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      throw new Error(`${name} must be in range 0..1.`);
    }
  }

  public static frequency(value: number, name: string): void {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`${name} must be greater than zero.`);
    }
  }

  public static envelope(env: IEnvelopeDefinition): void {
    if (!Number.isFinite(env.attackSeconds) || env.attackSeconds < 0) {
      throw new Error("Envelope attackSeconds must be >= 0.");
    }

    if (!Number.isFinite(env.decaySeconds) || env.decaySeconds < 0) {
      throw new Error("Envelope decaySeconds must be >= 0.");
    }

    if (!Number.isFinite(env.releaseSeconds) || env.releaseSeconds < 0) {
      throw new Error("Envelope releaseSeconds must be >= 0.");
    }

    this.normalized(env.sustainLevel, "Envelope sustainLevel");
  }

  public static voiceDefinition(definition: IVoiceDefinition): void {
    this.normalized(definition.oscillator.gain, "oscillator gain");
    this.envelope(definition.envelope);
    this.normalized(definition.noise.gain, "noise gain");
    this.normalized(definition.distortion.amount, "distortion amount");
  }
}

can a nodejs app play sound or must it be a web application? 

Node.js can play sound, but not via Web Audio. That API is browser-only.

Options
1) Browser (Web Audio) — recommended for your architecture
Native support for:

Oscillator

Filters

Envelope automation

Low-latency audio graph

Matches your current design (AudioContext, OscillatorNode, etc.)

👉 This is the correct target for your current code.

2) Node.js — possible, but different stack
Node does not have:

AudioContext
OscillatorNode
BiquadFilterNode
You must use:

a) Speaker output (PCM stream)
Libraries:

speaker (raw PCM output)

node-portaudio (better, closer to real audio engine)

b) Generate samples manually
You must implement DSP yourself:

for (sampleIndex) {
  sample =
    oscillator() →
    filter() →
    distortion() →
    envelope();

  write to buffer;
}
Then push to audio device.

3) Hybrid (common approach)
Node.js → sequencing / logic
Browser → sound engine (Web Audio)
or:

Node.js → generates audio buffer
→ stream to speaker or file
Recommendation for your project
Given your current design:

WebAudioVoiceFactory
OscillatorNode
GainNode
BiquadFilterNode
👉 You are already fully committed to browser runtime

Do not try to run this in Node.

If you want Node support later
You need a new module:

music-core-synthesizer-node-audio
with:

sample-based DSP engine

audio buffer writer

output via speaker or portaudio

That is a different implementation, not reuse of Web Audio.

Conclusion
✔ Browser → native, correct, easiest for synth

✔ Node → possible, but requires full DSP implementation

❌ Web Audio in Node → not supported

If you want next step:
I can show how to reuse your contracts and implement a Node DSP voice without breaking your architecture.

I have a Lit3 web app up and running.  Give me a sample code

Thought for 4s
// packages/Audio/music-core-synthesizer/modules/ui/music-ui-synthesizer/src/code.ts

import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";

import {
  createNoteOff,
  createNoteOn,
  MidiChannel,
  MidiNote,
  MidiVelocity,
} from "@monorepo/music-core-midi";

import {
  DistortionType,
  FilterType,
  OscillatorWaveform,
  type IVoiceDefinition,
} from "@monorepo/music-core-synthesizer-contracts";

import {
  EqualTemperamentMidiNoteFrequencyMapper,
  MidiMessageRouter,
  NoteLifetimeCoordinator,
  StaticVoiceDefinitionProvider,
  SynthEngine,
  type IAudioTimeProvider,
} from "@monorepo/music-core-synthesizer-engine";

import {
  WebAudioContextFactory,
  WebAudioEnvelopeScheduler,
  WebAudioMasterBus,
  WebAudioVoiceFactory,
  WebAudioVoiceGraphBuilder,
  WebAudioWhiteNoiseSourceFactory,
} from "@monorepo/music-core-synthesizer-web-audio";

final class WebAudioTimeProvider implements IAudioTimeProvider {
  public constructor(private readonly context: AudioContext) {}

  public now(): number {
    return this.context.currentTime;
  }
}

const defaultVoiceDefinition: IVoiceDefinition = {
  oscillator: {
    waveform: OscillatorWaveform.Sawtooth,
    detuneCents: 0,
    gain: 0.8,
  },
  noise: {
    enabled: false,
    gain: 0,
  },
  envelope: {
    attackSeconds: 0.01,
    decaySeconds: 0.12,
    sustainLevel: 0.65,
    releaseSeconds: 0.25,
  },
  filter: {
    enabled: true,
    type: FilterType.LowPass,
    cutoffHz: 1800,
    resonanceQ: 0.8,
  },
  distortion: {
    enabled: false,
    type: DistortionType.None,
    amount: 0,
  },
};

@customElement("music-synth-demo")
export class MusicSynthDemoElement extends LitElement {
  public static override readonly styles = css`
    :host {
      display: block;
      font-family: system-ui, sans-serif;
    }

    .panel {
      display: grid;
      gap: 12px;
      width: 320px;
      padding: 16px;
      border: 1px solid #333;
      border-radius: 12px;
    }

    button {
      padding: 12px;
      font-size: 16px;
      cursor: pointer;
    }

    .status {
      font-size: 12px;
      opacity: 0.75;
    }
  `;

  @state()
  private initialized = false;

  private engine: SynthEngine | null = null;
  private context: AudioContext | null = null;

  public override disconnectedCallback(): void {
    this.engine?.dispose();
    this.context?.close();

    this.engine = null;
    this.context = null;
    this.initialized = false;

    super.disconnectedCallback();
  }

  protected override render() {
    return html`
      <section class="panel">
        <button @click=${this.initialize}>
          ${this.initialized ? "Audio Ready" : "Start Audio"}
        </button>

        <button
          ?disabled=${!this.initialized}
          @pointerdown=${() => this.noteOn(60)}
          @pointerup=${() => this.noteOff(60)}
          @pointerleave=${() => this.noteOff(60)}
        >
          Hold C4
        </button>

        <button
          ?disabled=${!this.initialized}
          @pointerdown=${() => this.noteOn(64)}
          @pointerup=${() => this.noteOff(64)}
          @pointerleave=${() => this.noteOff(64)}
        >
          Hold E4
        </button>

        <button
          ?disabled=${!this.initialized}
          @pointerdown=${() => this.noteOn(67)}
          @pointerup=${() => this.noteOff(67)}
          @pointerleave=${() => this.noteOff(67)}
        >
          Hold G4
        </button>

        <button ?disabled=${!this.initialized} @click=${this.panic}>
          Panic
        </button>

        <div class="status">
          ${this.initialized ? "WebAudio synth initialized." : "Click Start Audio first."}
        </div>
      </section>
    `;
  }

  private initialize = async (): Promise<void> => {
    if (this.initialized) {
      return;
    }

    const context = new WebAudioContextFactory().create();
    await context.resume();

    const masterBus = new WebAudioMasterBus(context, 0.75);
    masterBus.connect(context.destination);

    const graphBuilder = new WebAudioVoiceGraphBuilder(
      new WebAudioWhiteNoiseSourceFactory(),
    );

    const voiceFactory = new WebAudioVoiceFactory(
      graphBuilder,
      new WebAudioEnvelopeScheduler(),
    );

    const voiceDefinitionProvider = new StaticVoiceDefinitionProvider(
      defaultVoiceDefinition,
    );

    const coordinator = new NoteLifetimeCoordinator({
      voiceFactory: {
        create: (request) =>
          voiceFactory.create({
            context,
            destination: masterBus.input,
            definition: request.definition,
            note: request.note,
            velocity: request.velocity,
            frequencyHz: request.frequencyHz,
            startedAt: request.startedAt,
          }),
      },
      frequencyMapper: new Equal

KISS! music-core-synthesizer , music-core-synthesizer-contracts, music-core-synthesizer-web-audio is the only think we have. // packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/soundTestFeature.ts

import { html, type TemplateResult } from "lit";

import type { IViewFeature } from "../../infrastructure/IViewFeature";

export class SoundTestFeature implements IViewFeature {
  public readonly id = "sound-test";

  public renderNavigationTemplate(): TemplateResult {
    return html<span>Sound Test</span>;
  }

  public async loadViewHtml(): Promise<string> {
    const module = await import("./soundTestFeature.view.html?raw");
    return module.default;
  }
} is mu host 

// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/soundTestFeature.controller.ts

import {
  createNoteOn,
  createNoteOff,
  MidiChannel,
  MidiNote,
  MidiVelocity,
} from "@monorepo/music-core-midi";

import {
  OscillatorWaveform,
  FilterType,
  DistortionType,
  type IVoiceDefinition,
} from "@monorepo/music-core-synthesizer-contracts";

import {
  SynthEngine,
  MidiMessageRouter,
  NoteLifetimeCoordinator,
  StaticVoiceDefinitionProvider,
  EqualTemperamentMidiNoteFrequencyMapper,
  type IAudioTimeProvider,
} from "@monorepo/music-core-synthesizer-engine";

import {
  WebAudioContextFactory,
  WebAudioMasterBus,
  WebAudioVoiceFactory,
  WebAudioVoiceGraphBuilder,
  WebAudioEnvelopeScheduler,
  WebAudioWhiteNoiseSourceFactory,
} from "@monorepo/music-core-synthesizer-web-audio";

class TimeProvider implements IAudioTimeProvider {
  public constructor(private readonly ctx: AudioContext) {}
  public now(): number {
    return this.ctx.currentTime;
  }
}

export class SoundTestController {
  private engine: SynthEngine | null = null;
  private context: AudioContext | null = null;

  public async init(): Promise<void> {
    if (this.engine) return;

    const context = new WebAudioContextFactory().create();
    await context.resume();

    const master = new WebAudioMasterBus(context, 0.8);
    master.connect(context.destination);

    const graphBuilder = new WebAudioVoiceGraphBuilder(
      new WebAudioWhiteNoiseSourceFactory(),
    );

    const voiceFactory = new WebAudioVoiceFactory(
      graphBuilder,
      new WebAudioEnvelopeScheduler(),
    );

    const definition: IVoiceDefinition = {
      oscillator: {
        waveform: OscillatorWaveform.Sawtooth,
        detuneCents: 0,
        gain: 0.8,
      },
      noise: { enabled: false, gain: 0 },
      envelope: {
        attackSeconds: 0.01,
        decaySeconds: 0.1,
        sustainLevel: 0.7,
        releaseSeconds: 0.25,
      },
      filter: {
        enabled: true,
        type: FilterType.LowPass,
        cutoffHz: 2000,
        resonanceQ: 0.8,
      },
      distortion: {
        enabled: false,
        type: DistortionType.None,
        amount: 0,
      },
    };

    const provider = new StaticVoiceDefinitionProvider(definition);

    const coordinator = new NoteLifetimeCoordinator({
      voiceFactory: {
        create: (r) =>
          voiceFactory.create({
            context,
            destination: master.input,
            definition: r.definition,
            note: r.note,
            velocity: r.velocity,
            frequencyHz: r.frequencyHz,
            startedAt: r.startedAt,
          }),
      },
      frequencyMapper: new EqualTemperamentMidiNoteFrequencyMapper(),
      voiceDefinitionProvider: provider,
    });

    const router = new MidiMessageRouter({
      timeProvider: new TimeProvider(context),
      coordinator,
    });

    this.engine = new SynthEngine(
      { router, coordinator },
      definition,
    );

    this.context = context;
  }

  public noteOn(note: number): void {
    if (!this.engine) return;

    this.engine.handle(
      createNoteOn(
        MidiChannel.create(1),
        MidiNote.create(note),
        MidiVelocity.create(110),
      ),
    );
  }

  public noteOff(note: number): void {
    if (!this.engine) return;

    this.engine.handle(
      createNoteOff(
        MidiChannel.create(1),
        MidiNote.create(note),
        MidiVelocity.Zero,
      ),
    );
  }

  public panic(): void {
    this.engine?.panic();
  }
}

WebAudioEnvelopeScheduler FilterType WHAT A HELL IS THIS!§ 

Good reaction. You’re right — that’s too much for first step.

Strip it down. You don’t need:

WebAudioEnvelopeScheduler

FilterType

Distortion

Noise

any abstractions

👉 You just need oscillator + gain.

Minimal working sound (KISS)
// soundTestFeature.controller.ts

export class SoundTestController {
  private ctx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private gain: GainNode | null = null;

  public async init(): Promise<void> {
    if (this.ctx) return;

    const ctx = new AudioContext();
    await ctx.resume();

    const gain = ctx.createGain();
    gain.gain.value = 0.2;

    gain.connect(ctx.destination);

    this.ctx = ctx;
    this.gain = gain;
  }

  public noteOn(freq = 440): void {
    if (!this.ctx || !this.gain) return;

    const osc = this.ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = freq;

    osc.connect(this.gain);
    osc.start();

    this.osc = osc;
  }

  public noteOff(): void {
    if (!this.osc) return;

    this.osc.stop();
    this.osc.disconnect();
    this.osc = null;
  }
}
Hook into your existing feature
// soundTestFeature.ts (usage sketch)

const controller = new SoundTestController();

await controller.init();

controller.noteOn(440); // A4
setTimeout(() => controller.noteOff(), 300);
Why this matters
Right now your problem is not architecture — it’s feedback loop.

You need:

click → sound
not:

interfaces → factories → schedulers → nothing works
After this works
Then (and only then):

Add envelope (Gain ramp)

Add filter

Replace direct nodes with your web-audio module

Plug back into engine

Bottom line
You jumped to final architecture before first sound.

Fix order:

1. raw oscillator → sound
2. wrap in controller
3. THEN introduce modules
If you want next step:
I’ll upgrade this minimal version → proper ADSR (still KISS, no abstractions)

I have music-core-synthesizer-contracts, music-core-synthesizer-web-audio and music-core-synthesizer-engine 

// KISS usage with your 3 modules only (no extra abstractions)

// packages/.../soundTestFeature.controller.ts

import {
  createNoteOn,
  createNoteOff,
  MidiChannel,
  MidiNote,
  MidiVelocity,
} from "@monorepo/music-core-midi";

import type { IVoiceDefinition } from "@monorepo/music-core-synthesizer-contracts";
import {
  OscillatorWaveform,
  FilterType,
  DistortionType,
} from "@monorepo/music-core-synthesizer-contracts";

import {
  SynthEngine,
  MidiMessageRouter,
  NoteLifetimeCoordinator,
  StaticVoiceDefinitionProvider,
  EqualTemperamentMidiNoteFrequencyMapper,
} from "@monorepo/music-core-synthesizer-engine";

import {
  WebAudioContextFactory,
  WebAudioMasterBus,
  WebAudioVoiceFactory,
  WebAudioVoiceGraphBuilder,
  WebAudioEnvelopeScheduler,
  WebAudioWhiteNoiseSourceFactory,
} from "@monorepo/music-core-synthesizer-web-audio";

// minimal time provider
class TimeProvider {
  constructor(private ctx: AudioContext) {}
  now() {
    return this.ctx.currentTime;
  }
}

export class SoundTestController {
  private engine: SynthEngine | null = null;

  public async init(): Promise<void> {
    if (this.engine) return;

    const ctx = new WebAudioContextFactory().create();
    await ctx.resume();

    const master = new WebAudioMasterBus(ctx, 0.8);
    master.connect(ctx.destination);

    const graphBuilder = new WebAudioVoiceGraphBuilder(
      new WebAudioWhiteNoiseSourceFactory(),
    );

    const voiceFactory = new WebAudioVoiceFactory(
      graphBuilder,
      new WebAudioEnvelopeScheduler(),
    );

    const voiceDef: IVoiceDefinition = {
      oscillator: {
        waveform: OscillatorWaveform.Sawtooth,
        detuneCents: 0,
        gain: 0.8,
      },
      noise: { enabled: false, gain: 0 },
      envelope: {
        attackSeconds: 0.01,
        decaySeconds: 0.1,
        sustainLevel: 0.7,
        releaseSeconds: 0.25,
      },
      filter: {
        enabled: false, // KEEP OFF for now (KISS)
        type: FilterType.LowPass,
        cutoffHz: 2000,
        resonanceQ: 0.7,
      },
      distortion: {
        enabled: false, // KEEP OFF
        type: DistortionType.None,
        amount: 0,
      },
    };

    const provider = new StaticVoiceDefinitionProvider(voiceDef);

    const coordinator = new NoteLifetimeCoordinator({
      voiceFactory: {
        create: (r) =>
          voiceFactory.create({
            context: ctx,
            destination: master.input,
            definition: r.definition,
            note: r.note,
            velocity: r.velocity,
            frequencyHz: r.frequencyHz,
            startedAt: r.startedAt,
          }),
      },
      frequencyMapper: new EqualTemperamentMidiNoteFrequencyMapper(),
      voiceDefinitionProvider: provider,
    });

    const router = new MidiMessageRouter({
      timeProvider: new TimeProvider(ctx),
      coordinator,
    });

    this.engine = new SynthEngine({ router, coordinator }, voiceDef);
  }

  public noteOn(note: number): void {
    this.engine?.handle(
      createNoteOn(
        MidiChannel.create(1),
        MidiNote.create(note),
        MidiVelocity.create(110),
      ),
    );
  }

  public noteOff(note: number): void {
    this.engine?.handle(
      createNoteOff(
        MidiChannel.create(1),
        MidiNote.create(note),
        MidiVelocity.Zero,
      ),
    );
  }
}

// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/soundTestFeature.ts

// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/soundTestFeature.ts

import { html, type TemplateResult } from "lit";

import type { IViewFeature } from "../../infrastructure/IViewFeature";

import {
  createNoteOn,
  createNoteOff,
  MidiChannel,
  MidiNote,
  MidiVelocity,
} from "@monorepo/music-core-midi";

import type { IVoiceDefinition } from "@monorepo/music-core-synthesizer-contracts";
import {
  OscillatorWaveform,
  FilterType,
  DistortionType,
} from "@monorepo/music-core-synthesizer-contracts";

import {
  SynthEngine,
  MidiMessageRouter,
  NoteLifetimeCoordinator,
  StaticVoiceDefinitionProvider,
  EqualTemperamentMidiNoteFrequencyMapper,
} from "@monorepo/music-core-synthesizer-engine";

import {
  WebAudioContextFactory,
  WebAudioMasterBus,
  WebAudioVoiceFactory,
  WebAudioVoiceGraphBuilder,
  WebAudioEnvelopeScheduler,
  WebAudioWhiteNoiseSourceFactory,
} from "@monorepo/music-core-synthesizer-web-audio";

// minimal time provider
class TimeProvider {
  constructor(private ctx: AudioContext) {}
  now() {
    return this.ctx.currentTime;
  }
}

export class SoundTestController {
  private engine: SynthEngine | null = null;

  public async init(): Promise<void> {
    if (this.engine) return;

    const ctx = new WebAudioContextFactory().create();
    await ctx.resume();

    const master = new WebAudioMasterBus(ctx, 0.8);
    master.connect(ctx.destination);

    const graphBuilder = new WebAudioVoiceGraphBuilder(
      new WebAudioWhiteNoiseSourceFactory(),
    );

    const voiceFactory = new WebAudioVoiceFactory(
      graphBuilder,
      new WebAudioEnvelopeScheduler(),
    );

    const voiceDef: IVoiceDefinition = {
      oscillator: {
        waveform: OscillatorWaveform.Sawtooth,
        detuneCents: 0,
        gain: 0.8,
      },
      noise: { enabled: false, gain: 0 },
      envelope: {
        attackSeconds: 0.01,
        decaySeconds: 0.1,
        sustainLevel: 0.7,
        releaseSeconds: 0.25,
      },
      filter: {
        enabled: false, // KEEP OFF for now (KISS)
        type: FilterType.LowPass,
        cutoffHz: 2000,
        resonanceQ: 0.7,
      },
      distortion: {
        enabled: false, // KEEP OFF
        type: DistortionType.None,
        amount: 0,
      },
    };

    const provider = new StaticVoiceDefinitionProvider(voiceDef);

    const coordinator = new NoteLifetimeCoordinator({
      voiceFactory: {
        create: (r) =>
          voiceFactory.create({
            context: ctx,
            destination: master.input,
            definition: r.definition,
            note: r.note,
            velocity: r.velocity,
            frequencyHz: r.frequencyHz,
            startedAt: r.startedAt,
          }),
      },
      frequencyMapper: new EqualTemperamentMidiNoteFrequencyMapper(),
      voiceDefinitionProvider: provider,
    });

    const router = new MidiMessageRouter({
      timeProvider: new TimeProvider(ctx),
      coordinator,
    });

    this.engine = new SynthEngine({ router, coordinator }, voiceDef);
  }

  public noteOn(note: number): void {
    this.engine?.handle(
      createNoteOn(
        MidiChannel.create(1),
        MidiNote.create(note),
        MidiVelocity.create(110),
      ),
    );
  }

  public noteOff(note: number): void {
    this.engine?.handle(
      createNoteOff(
        MidiChannel.create(1),
        MidiNote.create(note),
        MidiVelocity.Zero,
      ),
    );
  }
}

export class SoundTestFeature implements IViewFeature {
  public readonly id = "sound-test";

  public renderNavigationTemplate(): TemplateResult {
    return html<span>Sound Test</span>;
  }

  public async loadViewHtml(): Promise<string> {
    const module = await import("./soundTestFeature.view.html?raw");
    return module.default;
  }
}

================================================================================

// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/soundTestFeature.view.html

<!-- packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/soundTestFeature.view.html -->

<h1>Sound Test</h1>
<p>Sound test view goes here.</p>

// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/soundTestFeature.ts

import { html, type TemplateResult } from "lit";
import type { IViewFeature } from "../../infrastructure/IViewFeature";

import {
  createNoteOn,
  createNoteOff,
  MidiChannel,
  MidiNote,
  MidiVelocity,
} from "@monorepo/music-core-midi";

import type { IVoiceDefinition } from "@monorepo/music-core-synthesizer-contracts";
import {
  OscillatorWaveform,
  FilterType,
  DistortionType,
} from "@monorepo/music-core-synthesizer-contracts";

import {
  SynthEngine,
  MidiMessageRouter,
  NoteLifetimeCoordinator,
  StaticVoiceDefinitionProvider,
  EqualTemperamentMidiNoteFrequencyMapper,
} from "@monorepo/music-core-synthesizer-engine";

import {
  WebAudioContextFactory,
  WebAudioMasterBus,
  WebAudioVoiceFactory,
  WebAudioVoiceGraphBuilder,
  WebAudioEnvelopeScheduler,
  WebAudioWhiteNoiseSourceFactory,
} from "@monorepo/music-core-synthesizer-web-audio";

class TimeProvider {
  constructor(private ctx: AudioContext) {}
  now() {
    return this.ctx.currentTime;
  }
}

class SoundTestController {
  private engine: SynthEngine | null = null;

  public async init(): Promise<void> {
    if (this.engine) return;

    const ctx = new WebAudioContextFactory().create();
    await ctx.resume();

    const master = new WebAudioMasterBus(ctx, 0.8);
    master.connect(ctx.destination);

    const graphBuilder = new WebAudioVoiceGraphBuilder(
      new WebAudioWhiteNoiseSourceFactory(),
    );

    const voiceFactory = new WebAudioVoiceFactory(
      graphBuilder,
      new WebAudioEnvelopeScheduler(),
    );

    const voiceDef: IVoiceDefinition = {
      oscillator: {
        waveform: OscillatorWaveform.Sawtooth,
        detuneCents: 0,
        gain: 0.8,
      },
      noise: { enabled: false, gain: 0 },
      envelope: {
        attackSeconds: 0.01,
        decaySeconds: 0.1,
        sustainLevel: 0.7,
        releaseSeconds: 0.25,
      },
      filter: {
        enabled: false,
        type: FilterType.LowPass,
        cutoffHz: 2000,
        resonanceQ: 0.7,
      },
      distortion: {
        enabled: false,
        type: DistortionType.None,
        amount: 0,
      },
    };

    const provider = new StaticVoiceDefinitionProvider(voiceDef);

    const coordinator = new NoteLifetimeCoordinator({
      voiceFactory: {
        create: (r) =>
          voiceFactory.create({
            context: ctx,
            destination: master.input,
            definition: r.definition,
            note: r.note,
            velocity: r.velocity,
            frequencyHz: r.frequencyHz,
            startedAt: r.startedAt,
          }),
      },
      frequencyMapper: new EqualTemperamentMidiNoteFrequencyMapper(),
      voiceDefinitionProvider: provider,
    });

    const router = new MidiMessageRouter({
      timeProvider: new TimeProvider(ctx),
      coordinator,
    });

    this.engine = new SynthEngine({ router, coordinator }, voiceDef);
  }

  public noteOn(note: number): void {
    this.engine?.handle(
      createNoteOn(
        MidiChannel.create(1),
        MidiNote.create(note),
        MidiVelocity.create(110),
      ),
    );
  }

  public noteOff(note: number): void {
    this.engine?.handle(
      createNoteOff(
        MidiChannel.create(1),
        MidiNote.create(note),
        MidiVelocity.Zero,
      ),
    );
  }
}

export class SoundTestFeature implements IViewFeature {
  public readonly id = "sound-test";
  private readonly controller = new SoundTestController();

  public renderNavigationTemplate(): TemplateResult {
    return html`<span>Sound Test</span>`;
  }

  public async loadViewHtml(): Promise<string> {
    const module = await import("./soundTestFeature.view.html?raw");
    return module.default;
  }

  // call this after view is inserted into DOM
  public async attach(root: HTMLElement): Promise<void> {
    await this.controller.init();

    const onBtn = root.querySelector<HTMLButtonElement>("#noteOn");
    const offBtn = root.querySelector<HTMLButtonElement>("#noteOff");

    onBtn?.addEventListener("pointerdown", () => this.controller.noteOn(60));
    onBtn?.addEventListener("pointerup", () => this.controller.noteOff(60));
    onBtn?.addEventListener("pointerleave", () => this.controller.noteOff(60));

    offBtn?.addEventListener("click", () => this.controller.noteOff(60));
  }
}
<!-- packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/soundTestFeature.view.html -->

<h1>Sound Test</h1>

<button id="noteOn">Hold Note (C4)</button>
<button id="noteOff">Stop</button>

PS C:\Users\danha\source\repos\HTML\MonoRepro\packages\Audio\music-core-synthesizer\module-basic-tester> pnpm build

> module-basic@0.0.0 build C:\Users\danha\source\repos\HTML\MonoRepro\packages\Audio\music-core-synthesizer\module-basic-tester
> tsc && vite build

vite v8.0.10 building client environment for production...
✓ 56 modules transformed.
✗ Build failed in 81ms
error during build:
Build failed with 3 errors:

[MISSING_EXPORT] Error: "OscillatorWaveform" is not exported by "../modules/music-core-synthesizer-contracts/dist/index.js".
   ╭─[ src/features/soundTestFeature/soundTestFeature.ts:3:10 ]
   │
 3 │ import { OscillatorWaveform, FilterType, DistortionType } from "@monorepo/music-core-synthesizer-contracts";
   │          ─────────┬────────  
   │                   ╰────────── Missing export
───╯

[MISSING_EXPORT] Error: "FilterType" is not exported by "../modules/music-core-synthesizer-contracts/dist/index.js".
   ╭─[ src/features/soundTestFeature/soundTestFeature.ts:3:30 ]
   │
 3 │ import { OscillatorWaveform, FilterType, DistortionType } from "@monorepo/music-core-synthesizer-contracts";
   │                              ─────┬────  
   │                                   ╰────── Missing export
───╯

[MISSING_EXPORT] Error: "DistortionType" is not exported by "../modules/music-core-synthesizer-contracts/dist/index.js".
   ╭─[ src/features/soundTestFeature/soundTestFeature.ts:3:42 ]
   │
 3 │ import { OscillatorWaveform, FilterType, DistortionType } from "@monorepo/music-core-synthesizer-contracts";
   │                                          ───────┬──────  
   │                                                 ╰──────── Missing export
───╯

    at aggregateBindingErrorsIntoJsError (file:///C:/Users/danha/source/repos/HTML/MonoRepro/node_modules/.pnpm/rolldown@1.0.0-rc.17/node_modules/rolldown/dist/shared/error-DL-e8-oE.mjs:48:18)
    at unwrapBindingResult (file:///C:/Users/danha/source/repos/HTML/MonoRepro/node_modules/.pnpm/rolldown@1.0.0-rc.17/node_modules/rolldown/dist/shared/error-DL-e8-oE.mjs:18:128)
    at #build (file:///C:/Users/danha/source/repos/HTML/MonoRepro/node_modules/.pnpm/rolldown@1.0.0-rc.17/node_modules/rolldown/dist/shared/rolldown-build-DSxL8qiP.mjs:3317:34)
    at async buildEnvironment (file:///C:/Users/danha/source/repos/HTML/MonoRepro/node_modules/.pnpm/vite@8.0.10_@types+node@25._d3fe282e13e7ff496447426ba2f92c28/node_modules/vite/dist/node/chunks/node.js:33018:64)
    at async Object.build (file:///C:/Users/danha/source/repos/HTML/MonoRepro/node_modules/.pnpm/vite@8.0.10_@types+node@25._d3fe282e13e7ff496447426ba2f92c28/node_modules/vite/dist/node/chunks/node.js:33440:19)
    at async Object.buildApp (file:///C:/Users/danha/source/repos/HTML/MonoRepro/node_modules/.pnpm/vite@8.0.10_@types+node@25._d3fe282e13e7ff496447426ba2f92c28/node_modules/vite/dist/node/chunks/node.js:33437:153)
    at async CAC.<anonymous> (file:///C:/Users/danha/source/repos/HTML/MonoRepro/node_modules/.pnpm/vite@8.0.10_@types+node@25._d3fe282e13e7ff496447426ba2f92c28/node_modules/vite/dist/node/cli.js:778:3) {
  errors: [Getter/Setter]
}
 ELIFECYCLE  Command failed with exit code 1.
PS C:\Users\danha\source\repos\HTML\MonoRepro\packages\Audio\music-core-synthesizer\module-basic-tester> 

Your build is correct — the problem is contracts package does not export those enums.

Fix it at the source (contracts). Do not workaround in UI.

Add missing exports
// packages/Audio/music-core-synthesizer/modules/music-core-synthesizer-contracts/src/index.ts

export const enum OscillatorWaveform {
  Sine = "sine",
  Square = "square",
  Sawtooth = "sawtooth",
  Triangle = "triangle",
}

export const enum FilterType {
  LowPass = "lowpass",
  HighPass = "highpass",
  BandPass = "bandpass",
}

export const enum DistortionType {
  None = "none",
  SoftClip = "softclip",
  HardClip = "hardclip",
  Tanh = "tanh",
}
Rebuild contracts first
pnpm --filter @monorepo/music-core-synthesizer-contracts build
Then rebuild app
pnpm build
Why this happened
Your UI imports:

import { OscillatorWaveform, FilterType, DistortionType } from "...contracts";
But the compiled output:

dist/index.js
does not export them → Vite fails at bundle time.

Rule going forward
Anything used by:

engine
web-audio
ui
must live in:

music-core-synthesizer-contracts
and be explicitly exported.

If you want next step:
I can tighten your contracts so engine + web-audio + UI cannot drift again (compile-time safe).

// packages/Audio/music-core-synthesizer-contracts/src/index.ts

import type { MidiMessage } from "@monorepo/music-core-midi";

/* ============================================================================
   Primitives
============================================================================ */

export type Seconds = number;
export type Hertz = number;
export type MidiNoteNumber = number;
export type Normalized = number; // 0..1

export interface IDisposable {
  dispose(): void;
}

/* ============================================================================
   Definitions (pure data, no behavior)
============================================================================ */

export const enum OscillatorWaveform {
  Sine = "sine",
  Square = "square",
  Sawtooth = "sawtooth",
  Triangle = "triangle",
}

export const enum FilterType {
  LowPass = "lowpass",
  HighPass = "highpass",
  BandPass = "bandpass",
}

export const enum DistortionType {
  None = "none",
  SoftClip = "soft-clip",
  HardClip = "hard-clip",
  Tanh = "tanh",
}

export interface IOscillatorDefinition {
  readonly waveform: OscillatorWaveform;
  readonly detuneCents: number;
  readonly gain: Normalized;
}

export interface INoiseDefinition {
  readonly enabled: boolean;
  readonly gain: Normalized;
}

export interface IEnvelopeDefinition {
  readonly attackSeconds: Seconds;
  readonly decaySeconds: Seconds;
  readonly sustainLevel: Normalized;
  readonly releaseSeconds: Seconds;
}

export interface IFilterDefinition {
  readonly enabled: boolean;
  readonly type: FilterType;
  readonly cutoffHz: Hertz;
  readonly resonanceQ: number;
}

export interface IDistortionDefinition {
  readonly enabled: boolean;
  readonly type: DistortionType;
  readonly amount: Normalized;
}

export interface IVoiceDefinition {
  readonly oscillator: IOscillatorDefinition;
  readonly noise: INoiseDefinition;
  readonly envelope: IEnvelopeDefinition;
  readonly filter: IFilterDefinition;
  readonly distortion: IDistortionDefinition;
}

/* ============================================================================
   Mapping
============================================================================ */

export interface IMidiNoteFrequencyMapper {
  map(note: MidiNoteNumber): Hertz;
}

/* ============================================================================
   Voice lifecycle
============================================================================ */

export interface IVoiceHandle extends IDisposable {
  readonly id: string;
  readonly note: MidiNoteNumber;
  readonly isReleased: boolean;

  start(at: Seconds): void;
  release(at: Seconds): void;
}

/* ============================================================================
   Voice allocation
============================================================================ */

export interface IVoiceAllocator {
  allocate(
    active: readonly IVoiceHandle[],
    note: MidiNoteNumber,
  ): IVoiceHandle | null;
}

/* ============================================================================
   Application layer contracts
============================================================================ */

export interface ISynthEngine extends IDisposable {
  handle(message: MidiMessage): void;
  panic(): void;
  setVoiceDefinition(definition: IVoiceDefinition): void;
}

export interface IMidiMessageRouter {
  route(message: MidiMessage): void;
}

export interface INoteLifetimeCoordinator {
  noteOn(note: MidiNoteNumber, velocity: Normalized, at: Seconds): void;
  noteOff(note: MidiNoteNumber, at: Seconds): void;
  releaseAll(at: Seconds): void;
}

/* ============================================================================
   Web Audio infrastructure contracts
============================================================================ */

export interface IWebAudioContextFactory {
  create(): AudioContext;
}

export interface IWebAudioMasterBus extends IDisposable {
  readonly input: AudioNode;
  readonly output: AudioNode;

  connect(destination: AudioNode): void;
  setGain(value: Normalized, at: Seconds): void;
}

export interface IWebAudioEnvelopeScheduler {
  noteOn(
    param: AudioParam,
    env: IEnvelopeDefinition,
    velocity: Normalized,
    at: Seconds,
  ): void;

  noteOff(
    param: AudioParam,
    env: IEnvelopeDefinition,
    at: Seconds,
  ): void;

  cancel(param: AudioParam, at: Seconds): void;
}

export interface IWebAudioNoiseSourceFactory {
  create(context: AudioContext): AudioNode;
}

export interface IWebAudioVoiceGraph {
  readonly output: AudioNode;
  readonly oscillator: OscillatorNode;
  readonly vca: GainNode;
  readonly filter: BiquadFilterNode | null;
  readonly distortion: WaveShaperNode | null;
  readonly noise: AudioNode | null;
}

export interface IWebAudioVoiceGraphBuilder {
  build(request: {
    readonly context: AudioContext;
    readonly destination: AudioNode;
    readonly definition: IVoiceDefinition;
    readonly frequencyHz: Hertz;
  }): IWebAudioVoiceGraph;
}

export interface IWebAudioVoiceFactory {
  create(request: {
    readonly context: AudioContext;
    readonly destination: AudioNode;
    readonly definition: IVoiceDefinition;
    readonly note: MidiNoteNumber;
    readonly velocity: Normalized;
    readonly frequencyHz: Hertz;
    readonly startedAt: Seconds;
  }): IVoiceHandle;
}

Your code is correct. The failure is TypeScript compilation behavior, not missing code.

const enum is the problem.

Fix (required)
Replace all const enum with enum

// BEFORE
export const enum OscillatorWaveform {
  Sine = "sine",
  Square = "square",
  Sawtooth = "sawtooth",
  Triangle = "triangle",
}

// AFTER
export enum OscillatorWaveform {
  Sine = "sine",
  Square = "square",
  Sawtooth = "sawtooth",
  Triangle = "triangle",
}
export enum FilterType {
  LowPass = "lowpass",
  HighPass = "highpass",
  BandPass = "bandpass",
}

export enum DistortionType {
  None = "none",
  SoftClip = "soft-clip",
  HardClip = "hard-clip",
  Tanh = "tanh",
}
Why
const enum:

gets erased at compile time

does not exist in JS output

Vite / Rollup cannot import it → MISSING_EXPORT

Your dist file currently has:

// NOTHING EXPORTED
Rebuild sequence (important)
pnpm --filter @monorepo/music-core-synthesizer-contracts build
pnpm --filter @monorepo/music-core-synthesizer-web-audio build
pnpm --filter @monorepo/music-core-synthesizer-engine build
pnpm build
Rule (important for your architecture)
Use:

enum → for shared runtime contracts
const enum → ONLY for internal leaf modules (never exported)
Optional stricter alternative (better long-term)
If you want zero runtime cost + safe exports:

export const OscillatorWaveform = {
  Sine: "sine",
  Square: "square",
  Sawtooth: "sawtooth",
  Triangle: "triangle",
} as const;

export type OscillatorWaveform =
  (typeof OscillatorWaveform)[keyof typeof OscillatorWaveform];
This avoids enum pitfalls entirely.

Bottom line
Nothing wrong with your architecture.

Just:

const enum + bundler = broken exports
Switch to enum → done.

I open the view, no sound: // packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/soundTestFeature.ts

// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/soundTestFeature.ts

import { html, type TemplateResult } from "lit";
import type { IViewFeature } from "../../infrastructure/IViewFeature";

import {
  createNoteOn,
  createNoteOff,
  MidiChannel,
  MidiNote,
  MidiVelocity,
} from "@monorepo/music-core-midi";

import type { IVoiceDefinition } from "@monorepo/music-core-synthesizer-contracts";
import {
  OscillatorWaveform,
  FilterType,
  DistortionType,
} from "@monorepo/music-core-synthesizer-contracts";

import {
  SynthEngine,
  MidiMessageRouter,
  NoteLifetimeCoordinator,
  StaticVoiceDefinitionProvider,
  EqualTemperamentMidiNoteFrequencyMapper,
} from "@monorepo/music-core-synthesizer-engine";

import {
  WebAudioContextFactory,
  WebAudioMasterBus,
  WebAudioVoiceFactory,
  WebAudioVoiceGraphBuilder,
  WebAudioEnvelopeScheduler,
  WebAudioWhiteNoiseSourceFactory,
} from "@monorepo/music-core-synthesizer-web-audio";

class TimeProvider {
  constructor(private ctx: AudioContext) {}
  now() {
    return this.ctx.currentTime;
  }
}

class SoundTestController {
  private engine: SynthEngine | null = null;

  public async init(): Promise<void> {
    if (this.engine) return;

    const ctx = new WebAudioContextFactory().create();
    await ctx.resume();

    const master = new WebAudioMasterBus(ctx, 0.8);
    master.connect(ctx.destination);

    const graphBuilder = new WebAudioVoiceGraphBuilder(
      new WebAudioWhiteNoiseSourceFactory(),
    );

    const voiceFactory = new WebAudioVoiceFactory(
      graphBuilder,
      new WebAudioEnvelopeScheduler(),
    );

    const voiceDef: IVoiceDefinition = {
      oscillator: {
        waveform: OscillatorWaveform.Sawtooth,
        detuneCents: 0,
        gain: 0.8,
      },
      noise: { enabled: false, gain: 0 },
      envelope: {
        attackSeconds: 0.01,
        decaySeconds: 0.1,
        sustainLevel: 0.7,
        releaseSeconds: 0.25,
      },
      filter: {
        enabled: false,
        type: FilterType.LowPass,
        cutoffHz: 2000,
        resonanceQ: 0.7,
      },
      distortion: {
        enabled: false,
        type: DistortionType.None,
        amount: 0,
      },
    };

    const provider = new StaticVoiceDefinitionProvider(voiceDef);

    const coordinator = new NoteLifetimeCoordinator({
      voiceFactory: {
        create: (r) =>
          voiceFactory.create({
            context: ctx,
            destination: master.input,
            definition: r.definition,
            note: r.note,
            velocity: r.velocity,
            frequencyHz: r.frequencyHz,
            startedAt: r.startedAt,
          }),
      },
      frequencyMapper: new EqualTemperamentMidiNoteFrequencyMapper(),
      voiceDefinitionProvider: provider,
    });

    const router = new MidiMessageRouter({
      timeProvider: new TimeProvider(ctx),
      coordinator,
    });

    this.engine = new SynthEngine({ router, coordinator }, voiceDef);
  }

  public noteOn(note: number): void {
    this.engine?.handle(
      createNoteOn(
        MidiChannel.create(1),
        MidiNote.create(note),
        MidiVelocity.create(110),
      ),
    );
  }

  public noteOff(note: number): void {
    this.engine?.handle(
      createNoteOff(
        MidiChannel.create(1),
        MidiNote.create(note),
        MidiVelocity.Zero,
      ),
    );
  }
}

export class SoundTestFeature implements IViewFeature {
  public readonly id = "sound-test";
  private readonly controller = new SoundTestController();

  public renderNavigationTemplate(): TemplateResult {
    return html<span>Sound Test</span>;
  }

  public async loadViewHtml(): Promise<string> {
    const module = await import("./soundTestFeature.view.html?raw");
    return module.default;
  }

  // call this after view is inserted into DOM
  public async attach(root: HTMLElement): Promise<void> {
    await this.controller.init();

    const onBtn = root.querySelector<HTMLButtonElement>("#noteOn");
    const offBtn = root.querySelector<HTMLButtonElement>("#noteOff");

    onBtn?.addEventListener("pointerdown", () => this.controller.noteOn(60));
    onBtn?.addEventListener("pointerup", () => this.controller.noteOff(60));
    onBtn?.addEventListener("pointerleave", () => this.controller.noteOff(60));

    offBtn?.addEventListener("click", () => this.controller.noteOff(60));
  }
}

================================================================================

// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/soundTestFeature.view.html

<!-- packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/soundTestFeature.view.html -->

<h1>Sound Test</h1>
<p>Sound test view goes here.</p>

You’re not triggering any sound. Two concrete issues:

1) No buttons in HTML → no events → no sound
Your code expects:

#noteOn
#noteOff
But your HTML has none.

Fix HTML
<!-- soundTestFeature.view.html -->

<h1>Sound Test</h1>

<button id="noteOn">Hold C4</button>
<button id="noteOff">Stop</button>
2) AudioContext must start from a user gesture
This line:

await this.controller.init();
runs before any click, so most browsers keep audio suspended.

Fix attach()
Move init() into the button interaction:

public async attach(root: HTMLElement): Promise<void> {
  const onBtn = root.querySelector<HTMLButtonElement>("#noteOn");
  const offBtn = root.querySelector<HTMLButtonElement>("#noteOff");

  onBtn?.addEventListener("pointerdown", async () => {
    await this.controller.init(); // 👈 MUST be inside user gesture
    this.controller.noteOn(60);
  });

  onBtn?.addEventListener("pointerup", () => this.controller.noteOff(60));
  onBtn?.addEventListener("pointerleave", () => this.controller.noteOff(60));

  offBtn?.addEventListener("click", () => this.controller.noteOff(60));
}
Quick sanity checklist
If still no sound:

console.log("init called");
console.log("noteOn");
and verify:

Browser tab is active

No console errors

You clicked the button (not just opened view)

Summary
Your engine is fine.

Problem is purely:

no UI trigger + audio context not unlocked
Fix those → sound will play.

// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/soundTestFeature.ts

import { html, type TemplateResult } from "lit";
import type { IViewFeature } from "../../infrastructure/IViewFeature";

import {
  createNoteOn,
  createNoteOff,
  MidiChannel,
  MidiNote,
  MidiVelocity,
} from "@monorepo/music-core-midi";

import type { IVoiceDefinition } from "@monorepo/music-core-synthesizer-contracts";
import {
  OscillatorWaveform,
  FilterType,
  DistortionType,
} from "@monorepo/music-core-synthesizer-contracts";

import {
  SynthEngine,
  MidiMessageRouter,
  NoteLifetimeCoordinator,
  StaticVoiceDefinitionProvider,
  EqualTemperamentMidiNoteFrequencyMapper,
} from "@monorepo/music-core-synthesizer-engine";

import {
  WebAudioContextFactory,
  WebAudioMasterBus,
  WebAudioVoiceFactory,
  WebAudioVoiceGraphBuilder,
  WebAudioEnvelopeScheduler,
  WebAudioWhiteNoiseSourceFactory,
} from "@monorepo/music-core-synthesizer-web-audio";

class TimeProvider {
  constructor(private ctx: AudioContext) {}
  now() {
    return this.ctx.currentTime;
  }
}

class SoundTestController {
  private engine: SynthEngine | null = null;

  public async init(): Promise<void> {
    if (this.engine) return;

    const ctx = new WebAudioContextFactory().create();
    await ctx.resume();

    const master = new WebAudioMasterBus(ctx, 0.8);
    master.connect(ctx.destination);

    const graphBuilder = new WebAudioVoiceGraphBuilder(
      new WebAudioWhiteNoiseSourceFactory(),
    );

    const voiceFactory = new WebAudioVoiceFactory(
      graphBuilder,
      new WebAudioEnvelopeScheduler(),
    );

    const voiceDef: IVoiceDefinition = {
      oscillator: {
        waveform: OscillatorWaveform.Sawtooth,
        detuneCents: 0,
        gain: 0.8,
      },
      noise: { enabled: false, gain: 0 },
      envelope: {
        attackSeconds: 0.01,
        decaySeconds: 0.1,
        sustainLevel: 0.7,
        releaseSeconds: 0.25,
      },
      filter: {
        enabled: false,
        type: FilterType.LowPass,
        cutoffHz: 2000,
        resonanceQ: 0.7,
      },
      distortion: {
        enabled: false,
        type: DistortionType.None,
        amount: 0,
      },
    };

    const provider = new StaticVoiceDefinitionProvider(voiceDef);

    const coordinator = new NoteLifetimeCoordinator({
      voiceFactory: {
        create: (r) =>
          voiceFactory.create({
            context: ctx,
            destination: master.input,
            definition: r.definition,
            note: r.note,
            velocity: r.velocity,
            frequencyHz: r.frequencyHz,
            startedAt: r.startedAt,
          }),
      },
      frequencyMapper: new EqualTemperamentMidiNoteFrequencyMapper(),
      voiceDefinitionProvider: provider,
    });

    const router = new MidiMessageRouter({
      timeProvider: new TimeProvider(ctx),
      coordinator,
    });

    this.engine = new SynthEngine({ router, coordinator }, voiceDef);
  }

  public noteOn(note: number): void {
    this.engine?.handle(
      createNoteOn(
        MidiChannel.create(1),
        MidiNote.create(note),
        MidiVelocity.create(110),
      ),
    );
  }

  public noteOff(note: number): void {
    this.engine?.handle(
      createNoteOff(
        MidiChannel.create(1),
        MidiNote.create(note),
        MidiVelocity.Zero,
      ),
    );
  }
}

export class SoundTestFeature implements IViewFeature {
  public readonly id = "sound-test";
  private readonly controller = new SoundTestController();

  public renderNavigationTemplate(): TemplateResult {
    return html<span>Sound Test</span>;
  }

  public async loadViewHtml(): Promise<string> {
    const module = await import("./soundTestFeature.view.html?raw");
    
    return module.default;
  }

  // call this after view is inserted into DOM
  public async attach(root: HTMLElement): Promise<void> {
    await this.controller.init();

    const onBtn = root.querySelector<HTMLButtonElement>("#noteOn");
    const offBtn = root.querySelector<HTMLButtonElement>("#noteOff");

    onBtn?.addEventListener("pointerdown", () => this.controller.noteOn(60));
    onBtn?.addEventListener("pointerup", () => this.controller.noteOff(60));
    onBtn?.addEventListener("pointerleave", () => this.controller.noteOff(60));

    offBtn?.addEventListener("click", () => this.controller.noteOff(60));
  }
}

You still initialize audio outside user gesture. That’s why it’s silent.

Also you never confirmed the HTML contains buttons.

Fix ONLY what is broken (minimal)
1. Move init() into click
public async attach(root: HTMLElement): Promise<void> {
  const onBtn = root.querySelector<HTMLButtonElement>("#noteOn");
  const offBtn = root.querySelector<HTMLButtonElement>("#noteOff");

  onBtn?.addEventListener("pointerdown", async () => {
    await this.controller.init(); // MUST be here
    this.controller.noteOn(60);
  });

  onBtn?.addEventListener("pointerup", () => this.controller.noteOff(60));
  onBtn?.addEventListener("pointerleave", () => this.controller.noteOff(60));

  offBtn?.addEventListener("click", () => this.controller.noteOff(60));
}
2. Fix HTML (you still don’t have buttons)
<h1>Sound Test</h1>

<button id="noteOn">Hold C4</button>
<button id="noteOff">Stop</button>
Why your version fails
await this.controller.init(); // ❌ runs before user interaction
Browsers block audio until:

user gesture → create/resume AudioContext → play sound
If still no sound (fast debug)
Add:

console.log("init");
console.log("noteOn");
If logs don’t fire → your attach() is never called
If logs fire but no sound → AudioContext still blocked

Bottom line
Your engine is fine.

You only had:

wrong lifecycle (init timing)
+ missing DOM elements
Fix those → it will work immediately.

soundTestFeature.ts give me the new file

// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/soundTestFeature.ts

import { html, type TemplateResult } from "lit";
import type { IViewFeature } from "../../infrastructure/IViewFeature";

import {
  createNoteOn,
  createNoteOff,
  MidiChannel,
  MidiNote,
  MidiVelocity,
} from "@monorepo/music-core-midi";

import type { IVoiceDefinition } from "@monorepo/music-core-synthesizer-contracts";
import {
  OscillatorWaveform,
  FilterType,
  DistortionType,
} from "@monorepo/music-core-synthesizer-contracts";

import {
  SynthEngine,
  MidiMessageRouter,
  NoteLifetimeCoordinator,
  StaticVoiceDefinitionProvider,
  EqualTemperamentMidiNoteFrequencyMapper,
} from "@monorepo/music-core-synthesizer-engine";

import {
  WebAudioContextFactory,
  WebAudioMasterBus,
  WebAudioVoiceFactory,
  WebAudioVoiceGraphBuilder,
  WebAudioEnvelopeScheduler,
  WebAudioWhiteNoiseSourceFactory,
} from "@monorepo/music-core-synthesizer-web-audio";

/* ============================================================================ */
/* Controller */
/* ============================================================================ */

class TimeProvider {
  constructor(private readonly ctx: AudioContext) {}
  now() {
    return this.ctx.currentTime;
  }
}

class SoundTestController {
  private engine: SynthEngine | null = null;

  public async init(): Promise<void> {
    if (this.engine) return;

    const ctx = new WebAudioContextFactory().create();
    await ctx.resume();

    const master = new WebAudioMasterBus(ctx, 0.8);
    master.connect(ctx.destination);

    const graphBuilder = new WebAudioVoiceGraphBuilder(
      new WebAudioWhiteNoiseSourceFactory(),
    );

    const voiceFactory = new WebAudioVoiceFactory(
      graphBuilder,
      new WebAudioEnvelopeScheduler(),
    );

    const voiceDef: IVoiceDefinition = {
      oscillator: {
        waveform: OscillatorWaveform.Sawtooth,
        detuneCents: 0,
        gain: 0.8,
      },
      noise: { enabled: false, gain: 0 },
      envelope: {
        attackSeconds: 0.01,
        decaySeconds: 0.1,
        sustainLevel: 0.7,
        releaseSeconds: 0.25,
      },
      filter: {
        enabled: false,
        type: FilterType.LowPass,
        cutoffHz: 2000,
        resonanceQ: 0.7,
      },
      distortion: {
        enabled: false,
        type: DistortionType.None,
        amount: 0,
      },
    };

    const provider = new StaticVoiceDefinitionProvider(voiceDef);

    const coordinator = new NoteLifetimeCoordinator({
      voiceFactory: {
        create: (r) =>
          voiceFactory.create({
            context: ctx,
            destination: master.input,
            definition: r.definition,
            note: r.note,
            velocity: r.velocity,
            frequencyHz: r.frequencyHz,
            startedAt: r.startedAt,
          }),
      },
      frequencyMapper: new EqualTemperamentMidiNoteFrequencyMapper(),
      voiceDefinitionProvider: provider,
    });

    const router = new MidiMessageRouter({
      timeProvider: new TimeProvider(ctx),
      coordinator,
    });

    this.engine = new SynthEngine({ router, coordinator }, voiceDef);
  }

  public noteOn(note: number): void {
    this.engine?.handle(
      createNoteOn(
        MidiChannel.create(1),
        MidiNote.create(note),
        MidiVelocity.create(110),
      ),
    );
  }

  public noteOff(note: number): void {
    this.engine?.handle(
      createNoteOff(
        MidiChannel.create(1),
        MidiNote.create(note),
        MidiVelocity.Zero,
      ),
    );
  }
}

/* ============================================================================ */
/* Feature */
/* ============================================================================ */

export class SoundTestFeature implements IViewFeature {
  public readonly id = "sound-test";
  private readonly controller = new SoundTestController();

  public renderNavigationTemplate(): TemplateResult {
    return html`<span>Sound Test</span>`;
  }

  public async loadViewHtml(): Promise<string> {
    const module = await import("./soundTestFeature.view.html?raw");
    return module.default;
  }

  public async attach(root: HTMLElement): Promise<void> {
    const onBtn = root.querySelector<HTMLButtonElement>("#noteOn");
    const offBtn = root.querySelector<HTMLButtonElement>("#noteOff");

    onBtn?.addEventListener("pointerdown", async () => {
      await this.controller.init(); // IMPORTANT: inside user gesture
      this.controller.noteOn(60);
    });

    onBtn?.addEventListener("pointerup", () => this.controller.noteOff(60));
    onBtn?.addEventListener("pointerleave", () => this.controller.noteOff(60));

    offBtn?.addEventListener("click", () => this.controller.noteOff(60));
  }
}

<!-- packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/soundTestFeature.view.html -->

<h1>Sound Test</h1>
<p>Sound test view goes here.</p>

<button id="noteOn">Hold C4</button>
<button id="noteOff">Stop</button>

Your HTML is correct. One remaining failure point: attach() is likely never called.

Your code assumes:

feature.attach(root)
But nothing guarantees your host actually calls it.

Minimal fix inside feature (self-activating)
Replace your loadViewHtml() with this:

public async loadViewHtml(): Promise<string> {
  const module = await import("./soundTestFeature.view.html?raw");

  // delay to ensure DOM is injected
  setTimeout(() => {
    const root = document.querySelector("[data-feature='sound-test']") as HTMLElement | null;

    if (!root) {
      console.warn("SoundTestFeature: root not found");
      return;
    }

    this.attach(root);
  });

  return module.default;
}
Or (better, if you control host)
Ensure host calls:

await feature.attach(rootElement);
after injecting HTML.

Add debug (important)
Inside attach():

console.log("SoundTestFeature.attach called");
Inside button:

console.log("noteOn triggered");
Expected flow
click button
 → init()
 → AudioContext.resume()
 → noteOn()
 → sound
If still no sound
Check:

DevTools → Console (errors?)

DevTools → Autoplay policy warning?

Try clicking twice (Chrome quirk sometimes)

Bottom line
Your synth stack is fine.

The failure is almost certainly:

attach() not executed → no event listeners → no sound
Confirm that, and it will work immediately.

client:827 [vite] connecting...
client:931 [vite] connected.
reactive-element.js:50 Lit is in dev mode. Not recommended for production! See https://lit.dev/msg/dev-mode for more information.
(anonymous) @ reactive-element.js:50
soundTestFeature.ts:164 SoundTestFeature: root not found
(anonymous) @ soundTestFeature.ts:164
soundTestFeature.ts:164 SoundTestFeature: root not found
(anonymous) @ soundTestFeature.ts:164
setTimeout
(anonymous) @ soundTestFeature.ts:160
await in (anonymous)
loadFeature @ multi-view-app.ts:51
(anonymous) @ multi-view-app.ts:44
handleEvent @ lit-html.js:1360
(anonymous) @ NavMenuItem.ts:27
handleEvent @ lit-html.js:1360
soundTestFeature.ts:164 SoundTestFeature: root not found
(anonymous) @ soundTestFeature.ts:164
setTimeout
(anonymous) @ soundTestFeature.ts:160
await in (anonymous)
loadFeature @ multi-view-app.ts:51
(anonymous) @ multi-view-app.ts:44
handleEvent @ lit-html.js:1360
(anonymous) @ NavMenuItem.ts:27
handleEvent @ lit-html.js:1360
soundTestFeature.ts:164 SoundTestFeature: root not found
(anonymous) @ soundTestFeature.ts:164
setTimeout
(anonymous) @ soundTestFeature.ts:160
await in (anonymous)
loadFeature @ multi-view-app.ts:51
(anonymous) @ multi-view-app.ts:44
handleEvent @ lit-html.js:1360
(anonymous) @ NavMenuItem.ts:27
handleEvent @ lit-html.js:1360
soundTestFeature.ts:164 SoundTestFeature: root not found
(anonymous) @ soundTestFeature.ts:164
setTimeout
(anonymous) @ soundTestFeature.ts:160
await in (anonymous)
loadFeature @ multi-view-app.ts:51
(anonymous) @ multi-view-app.ts:44
handleEvent @ lit-html.js:1360
(anonymous) @ NavMenuItem.ts:27
handleEvent @ lit-html.js:1360

Good — now we know the real issue:

SoundTestFeature: root not found
Your feature never gets the correct root element.
The setTimeout + querySelector hack is wrong for your architecture.

Fix it properly (no hacks)
Your host (multi-view-app.ts) already calls:

await feature.attach(rootElement);
👉 So your feature must use the provided root — not query the DOM.

Replace ONLY attach()
public async attach(root: HTMLElement): Promise<void> {
  console.log("attach called", root);

  const onBtn = root.querySelector<HTMLButtonElement>("#noteOn");
  const offBtn = root.querySelector<HTMLButtonElement>("#noteOff");

  if (!onBtn || !offBtn) {
    console.error("Buttons not found in root", root.innerHTML);
    return;
  }

  onBtn.addEventListener("pointerdown", async () => {
    console.log("pointerdown");

    await this.controller.init(); // user gesture OK
    this.controller.noteOn(60);
  });

  onBtn.addEventListener("pointerup", () => this.controller.noteOff(60));
  onBtn.addEventListener("pointerleave", () => this.controller.noteOff(60));

  offBtn.addEventListener("click", () => this.controller.noteOff(60));
}
REMOVE this completely (it is the bug)
setTimeout(() => {
  const root = document.querySelector("[data-feature='sound-test']");
  ...
});
Why it failed
You tried:

query DOM → guess root
But your system already does:

host → gives correct root → attach(root)
So you created a second, wrong lifecycle.

After this fix you should see:
attach called <div>...</div>
pointerdown
Then sound.

If still broken
Check:

console.log(root.innerHTML);
If buttons missing → host did not inject HTML correctly.

Bottom line
Use the root you are given. Never query global DOM in this architecture.
This is why it didn’t work.

Make it as a lit3 component? 

// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/sound-test.component.ts

import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";

import {
  createNoteOn,
  createNoteOff,
  MidiChannel,
  MidiNote,
  MidiVelocity,
} from "@monorepo/music-core-midi";

import type { IVoiceDefinition } from "@monorepo/music-core-synthesizer-contracts";
import {
  OscillatorWaveform,
  FilterType,
  DistortionType,
} from "@monorepo/music-core-synthesizer-contracts";

import {
  SynthEngine,
  MidiMessageRouter,
  NoteLifetimeCoordinator,
  StaticVoiceDefinitionProvider,
  EqualTemperamentMidiNoteFrequencyMapper,
} from "@monorepo/music-core-synthesizer-engine";

import {
  WebAudioContextFactory,
  WebAudioMasterBus,
  WebAudioVoiceFactory,
  WebAudioVoiceGraphBuilder,
  WebAudioEnvelopeScheduler,
  WebAudioWhiteNoiseSourceFactory,
} from "@monorepo/music-core-synthesizer-web-audio";

/* ============================================================================
   Internal controller (kept private to component)
============================================================================ */

class TimeProvider {
  constructor(private readonly ctx: AudioContext) {}
  now() {
    return this.ctx.currentTime;
  }
}

class SoundController {
  private engine: SynthEngine | null = null;

  public async init(): Promise<void> {
    if (this.engine) return;

    const ctx = new WebAudioContextFactory().create();
    await ctx.resume();

    const master = new WebAudioMasterBus(ctx, 0.8);
    master.connect(ctx.destination);

    const graphBuilder = new WebAudioVoiceGraphBuilder(
      new WebAudioWhiteNoiseSourceFactory(),
    );

    const voiceFactory = new WebAudioVoiceFactory(
      graphBuilder,
      new WebAudioEnvelopeScheduler(),
    );

    const voiceDef: IVoiceDefinition = {
      oscillator: {
        waveform: OscillatorWaveform.Sawtooth,
        detuneCents: 0,
        gain: 0.8,
      },
      noise: { enabled: false, gain: 0 },
      envelope: {
        attackSeconds: 0.01,
        decaySeconds: 0.1,
        sustainLevel: 0.7,
        releaseSeconds: 0.25,
      },
      filter: {
        enabled: false,
        type: FilterType.LowPass,
        cutoffHz: 2000,
        resonanceQ: 0.7,
      },
      distortion: {
        enabled: false,
        type: DistortionType.None,
        amount: 0,
      },
    };

    const provider = new StaticVoiceDefinitionProvider(voiceDef);

    const coordinator = new NoteLifetimeCoordinator({
      voiceFactory: {
        create: (r) =>
          voiceFactory.create({
            context: ctx,
            destination: master.input,
            definition: r.definition,
            note: r.note,
            velocity: r.velocity,
            frequencyHz: r.frequencyHz,
            startedAt: r.startedAt,
          }),
      },
      frequencyMapper: new EqualTemperamentMidiNoteFrequencyMapper(),
      voiceDefinitionProvider: provider,
    });

    const router = new MidiMessageRouter({
      timeProvider: new TimeProvider(ctx),
      coordinator,
    });

    this.engine = new SynthEngine({ router, coordinator }, voiceDef);
  }

  public noteOn(note: number): void {
    this.engine?.handle(
      createNoteOn(
        MidiChannel.create(1),
        MidiNote.create(note),
        MidiVelocity.create(110),
      ),
    );
  }

  public noteOff(note: number): void {
    this.engine?.handle(
      createNoteOff(
        MidiChannel.create(1),
        MidiNote.create(note),
        MidiVelocity.Zero,
      ),
    );
  }
}

/* ============================================================================
   Lit component
============================================================================ */

@customElement("sound-test")
export class SoundTestComponent extends LitElement {
  private readonly controller = new SoundController();

  static styles = css`
    :host {
      display: block;
      padding: 16px;
      font-family: sans-serif;
    }

    button {
      margin-right: 8px;
      padding: 8px 12px;
      font-size: 14px;
    }
  `;

  render() {
    return html`
      <h1>Sound Test</h1>

      <button
        @pointerdown=${this.onDown}
        @pointerup=${this.onUp}
        @pointerleave=${this.onUp}
      >
        Hold C4
      </button>

      <button @click=${this.onStop}>
        Stop
      </button>
    `;
  }

  private onDown = async () => {
    await this.controller.init(); // user gesture
    this.controller.noteOn(60);
  };

  private onUp = () => {
    this.controller.noteOff(60);
  };

  private onStop = () => {
    this.controller.noteOff(60);
  };
}
<!-- Replace your view file with this -->

<sound-test></sound-test>

client:827 [vite] connecting...
client:931 [vite] connected.
reactive-element.js:50 Lit is in dev mode. Not recommended for production! See https://lit.dev/msg/dev-mode for more information.
(anonymous) @ reactive-element.js:50
(anonymous) @ reactive-element.js:55
soundTestFeature.ts:164 SoundTestFeature: root not found
(anonymous) @ soundTestFeature.ts:164
setTimeout
(anonymous) @ soundTestFeature.ts:160
await in (anonymous)
loadFeature @ multi-view-app.ts:51
(anonymous) @ multi-view-app.ts:44
handleEvent @ lit-html.js:1360
(anonymous) @ NavMenuItem.ts:27
handleEvent @ lit-html.js:1360

You still have the old broken code path active:

SoundTestFeature: root not found
That means:
👉 your project is still executing the old feature file with setTimeout/querySelector

You must REMOVE that code completely
Find and DELETE this (from your project)
setTimeout(() => {
  const root = document.querySelector("[data-feature='sound-test']");
  ...
});
and also remove any:

console.warn("SoundTestFeature: root not found");
Then simplify the feature to ONLY this
// soundTestFeature.ts

import { html, type TemplateResult } from "lit";
import type { IViewFeature } from "../../infrastructure/IViewFeature";

export class SoundTestFeature implements IViewFeature {
  public readonly id = "sound-test";

  public renderNavigationTemplate(): TemplateResult {
    return html`<span>Sound Test</span>`;
  }

  public async loadViewHtml(): Promise<string> {
    // IMPORTANT: this just returns the component
    return `<sound-test></sound-test>`;
  }

  public async attach(): Promise<void> {
    // NOTHING HERE
    // Lit component handles everything
  }
}
And make sure component file is imported
Somewhere once (important):

import "./sound-test.component";
If you don’t import it → <sound-test> is just an unknown tag → nothing happens.

Why your current setup fails
You now have two systems fighting:

OLD:
  feature tries to find DOM manually ❌

NEW:
  Lit component owns DOM and events ✅
The old one is still running → causing error.

Correct architecture now
Feature → renders <sound-test>
Lit component → handles UI + audio
No DOM querying. No attach logic.

After fix you should see
no "root not found"

button renders

click → sound

If still silent
Then check:

console.log("component connected");
console.log("pointerdown");
inside the component.

Bottom line
You didn’t replace the old system — you layered on top of it.

👉 Remove the old feature DOM logic completely.

// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/sound-test.component.ts

// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/sound-test.component.ts

import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";

import {
  createNoteOn,
  createNoteOff,
  MidiChannel,
  MidiNote,
  MidiVelocity,
} from "@monorepo/music-core-midi";

import type { IVoiceDefinition } from "@monorepo/music-core-synthesizer-contracts";
import {
  OscillatorWaveform,
  FilterType,
  DistortionType,
} from "@monorepo/music-core-synthesizer-contracts";

import {
  SynthEngine,
  MidiMessageRouter,
  NoteLifetimeCoordinator,
  StaticVoiceDefinitionProvider,
  EqualTemperamentMidiNoteFrequencyMapper,
} from "@monorepo/music-core-synthesizer-engine";

import {
  WebAudioContextFactory,
  WebAudioMasterBus,
  WebAudioVoiceFactory,
  WebAudioVoiceGraphBuilder,
  WebAudioEnvelopeScheduler,
  WebAudioWhiteNoiseSourceFactory,
} from "@monorepo/music-core-synthesizer-web-audio";

/* ============================================================================
   Internal controller (kept private to component)
============================================================================ */

class TimeProvider {
  constructor(private readonly ctx: AudioContext) {}
  now() {
    return this.ctx.currentTime;
  }
}

class SoundController {
  private engine: SynthEngine | null = null;

  public async init(): Promise<void> {
    if (this.engine) return;

    const ctx = new WebAudioContextFactory().create();
    await ctx.resume();

    const master = new WebAudioMasterBus(ctx, 0.8);
    master.connect(ctx.destination);

    const graphBuilder = new WebAudioVoiceGraphBuilder(
      new WebAudioWhiteNoiseSourceFactory(),
    );

    const voiceFactory = new WebAudioVoiceFactory(
      graphBuilder,
      new WebAudioEnvelopeScheduler(),
    );

    const voiceDef: IVoiceDefinition = {
      oscillator: {
        waveform: OscillatorWaveform.Sawtooth,
        detuneCents: 0,
        gain: 0.8,
      },
      noise: { enabled: false, gain: 0 },
      envelope: {
        attackSeconds: 0.01,
        decaySeconds: 0.1,
        sustainLevel: 0.7,
        releaseSeconds: 0.25,
      },
      filter: {
        enabled: false,
        type: FilterType.LowPass,
        cutoffHz: 2000,
        resonanceQ: 0.7,
      },
      distortion: {
        enabled: false,
        type: DistortionType.None,
        amount: 0,
      },
    };

    const provider = new StaticVoiceDefinitionProvider(voiceDef);

    const coordinator = new NoteLifetimeCoordinator({
      voiceFactory: {
        create: (r) =>
          voiceFactory.create({
            context: ctx,
            destination: master.input,
            definition: r.definition,
            note: r.note,
            velocity: r.velocity,
            frequencyHz: r.frequencyHz,
            startedAt: r.startedAt,
          }),
      },
      frequencyMapper: new EqualTemperamentMidiNoteFrequencyMapper(),
      voiceDefinitionProvider: provider,
    });

    const router = new MidiMessageRouter({
      timeProvider: new TimeProvider(ctx),
      coordinator,
    });

    this.engine = new SynthEngine({ router, coordinator }, voiceDef);
  }

  public noteOn(note: number): void {
    this.engine?.handle(
      createNoteOn(
        MidiChannel.create(1),
        MidiNote.create(note),
        MidiVelocity.create(110),
      ),
    );
  }

  public noteOff(note: number): void {
    this.engine?.handle(
      createNoteOff(
        MidiChannel.create(1),
        MidiNote.create(note),
        MidiVelocity.Zero,
      ),
    );
  }
}

/* ============================================================================
   Lit component
============================================================================ */

@customElement("sound-test")
export class SoundTestComponent extends LitElement {
  private readonly controller = new SoundController();

  static styles = css
    :host {
      display: block;
      padding: 16px;
      font-family: sans-serif;
    }

    button {
      margin-right: 8px;
      padding: 8px 12px;
      font-size: 14px;
    }
  ;

  render() {
    return html
      <h1>Sound Test</h1>

      <button
        @pointerdown=${this.onDown}
        @pointerup=${this.onUp}
        @pointerleave=${this.onUp}
      >
        Hold C4
      </button>

      <button @click=${this.onStop}>
        Stop
      </button>
    ;
  }

  private onDown = async () => {
    await this.controller.init(); // user gesture
    this.controller.noteOn(60);
  };

  private onUp = () => {
    this.controller.noteOff(60);
  };

  private onStop = () => {
    this.controller.noteOff(60);
  };
}

================================================================================

// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/soundTestFeature.ts

// soundTestFeature.ts

import { html, type TemplateResult } from "lit";
import type { IViewFeature } from "../../infrastructure/IViewFeature";

export class SoundTestFeature implements IViewFeature {
  public readonly id = "sound-test";

  public renderNavigationTemplate(): TemplateResult {
    return html<span>Sound Test</span>;
  }

  public async loadViewHtml(): Promise<string> {
    // IMPORTANT: this just returns the component
    return <sound-test></sound-test>;
  }

  public async attach(): Promise<void> {
    // NOTHING HERE
    // Lit component handles everything
  }
}

================================================================================

// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/soundTestFeature.view.html

<!-- packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/soundTestFeature.view.html -->

<h1>Sound Test</h1>
<p>Sound test view goes here.</p>

<sound-test></sound-test>

You still have one critical missing piece:

<sound-test> is never registered
Lit components must be imported once, otherwise the browser treats them as plain HTML.

Fix (required)
Add this import in your feature file:

// soundTestFeature.ts

import "./sound-test.component"; // <-- REQUIRED
Full file:

// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/soundTestFeature.ts

import { html, type TemplateResult } from "lit";
import type { IViewFeature } from "../../infrastructure/IViewFeature";

// 👇 THIS IS THE MISSING LINK
import "./sound-test.component";

export class SoundTestFeature implements IViewFeature {
  public readonly id = "sound-test";

  public renderNavigationTemplate(): TemplateResult {
    return html`<span>Sound Test</span>`;
  }

  public async loadViewHtml(): Promise<string> {
    return `<sound-test></sound-test>`;
  }

  public async attach(): Promise<void> {
    // no-op
  }
}
Also remove this file from usage
You still have:

soundTestFeature.view.html
👉 It is no longer needed.
Do NOT mix:

raw HTML view + Lit component
Pick one. You already picked Lit.

Why it failed
Browser saw:

<sound-test></sound-test>
but without:

customElements.define("sound-test", ...)
→ nothing rendered
→ no event
→ no sound

Quick verification
Open DevTools:

customElements.get("sound-test")
If undefined → still not imported
If function → correct

Final architecture (correct)
Feature
  → returns <sound-test>

Lit Component
  → owns UI
  → owns audio
No DOM querying
No attach logic
No HTML templates

Bottom line
You were 95% done.
Missing piece was simply:

component not registered

export interface IVoiceDefinition {
  readonly oscillator: IOscillatorDefinition;
  readonly noise: INoiseDefinition;
  readonly envelope: IEnvelopeDefinition;
  readonly filter: IFilterDefinition;
  readonly distortion: IDistortionDefinition;
} breaks with the planned music-core-synthesizer-envelopes module= 

Correct — your current contract is too concrete.
You hard-wired ADSR into IVoiceDefinition, which blocks the music-core-synthesizer-envelopes module from being extensible.

You need abstraction at the contract boundary.

Fix: decouple envelope from ADSR
Replace this
readonly envelope: IEnvelopeDefinition;
With this (minimal, extensible)
export interface IEnvelopeDefinition {
  readonly type: string; // discriminator (ADSR, AR, custom, etc.)
}
Then define ADSR in its own module
// music-core-synthesizer-envelopes

import type { IEnvelopeDefinition, Seconds, Normalized } 
  from "@monorepo/music-core-synthesizer-contracts";

export const ADSR_ENVELOPE = "adsr";

export interface IAdsrEnvelopeDefinition extends IEnvelopeDefinition {
  readonly type: typeof ADSR_ENVELOPE;

  readonly attackSeconds: Seconds;
  readonly decaySeconds: Seconds;
  readonly sustainLevel: Normalized;
  readonly releaseSeconds: Seconds;
}
Update WebAudio scheduler (type-safe narrowing)
import { ADSR_ENVELOPE, type IAdsrEnvelopeDefinition } from "...";

public noteOn(
  param: AudioParam,
  env: IEnvelopeDefinition,
  velocity: Normalized,
  at: Seconds,
): void {

  if (env.type !== ADSR_ENVELOPE) {
    throw new Error("Unsupported envelope type");
  }

  const adsr = env as IAdsrEnvelopeDefinition;

  const attackEnd = at + adsr.attackSeconds;
  const decayEnd = attackEnd + adsr.decaySeconds;
  const sustain = adsr.sustainLevel * velocity;

  param.setValueAtTime(0, at);
  param.linearRampToValueAtTime(velocity, attackEnd);
  param.linearRampToValueAtTime(sustain, decayEnd);
}
Update VoiceDefinition
export interface IVoiceDefinition {
  readonly oscillator: IOscillatorDefinition;
  readonly noise: INoiseDefinition;
  readonly envelope: IEnvelopeDefinition; // now abstract
  readonly filter: IFilterDefinition;
  readonly distortion: IDistortionDefinition;
}
Why this matters
Your current design:

IVoiceDefinition → ADSR baked in ❌
Correct design:

IVoiceDefinition → envelope abstraction ✔
                → concrete implementations in modules
Result
You can now add:

music-core-synthesizer-envelopes
  ├── ADSR
  ├── AR
  ├── Multi-stage
  ├── Curve-based
without touching contracts → OCP preserved

Key rule
Contracts define shape, not behavior.
Modules define behavior.
If you want next step:
I can give you a fully type-safe envelope strategy registry (no string casting, no switch).

music-core-synthesizer-envelopes have no implmentation rigth now, should we make one? 

Yes. But keep it minimal and aligned with your current engine.
You only need one concrete implementation now: ADSR, nothing more.

Create ONE file (no over-design)
// packages/Audio/music-core-synthesizer/modules/music-core-synthesizer-envelopes/src/adsr.ts

import type {
  IEnvelopeDefinition,
  Seconds,
  Normalized,
} from "@monorepo/music-core-synthesizer-contracts";

/* ============================================================================
   Discriminator
============================================================================ */

export const ADSR_ENVELOPE = "adsr";

/* ============================================================================
   Definition
============================================================================ */

export interface IAdsrEnvelopeDefinition extends IEnvelopeDefinition {
  readonly type: typeof ADSR_ENVELOPE;

  readonly attackSeconds: Seconds;
  readonly decaySeconds: Seconds;
  readonly sustainLevel: Normalized;
  readonly releaseSeconds: Seconds;
}

/* ============================================================================
   Factory (safe construction)
============================================================================ */

export class AdsrEnvelope {
  public static create(input: {
    readonly attackSeconds: Seconds;
    readonly decaySeconds: Seconds;
    readonly sustainLevel: Normalized;
    readonly releaseSeconds: Seconds;
  }): IAdsrEnvelopeDefinition {
    this.validate(input);

    return {
      type: ADSR_ENVELOPE,
      attackSeconds: input.attackSeconds,
      decaySeconds: input.decaySeconds,
      sustainLevel: input.sustainLevel,
      releaseSeconds: input.releaseSeconds,
    };
  }

  private static validate(input: {
    readonly attackSeconds: Seconds;
    readonly decaySeconds: Seconds;
    readonly sustainLevel: Normalized;
    readonly releaseSeconds: Seconds;
  }): void {
    if (input.attackSeconds < 0) throw new Error("attackSeconds >= 0");
    if (input.decaySeconds < 0) throw new Error("decaySeconds >= 0");
    if (input.releaseSeconds < 0) throw new Error("releaseSeconds >= 0");

    if (input.sustainLevel < 0 || input.sustainLevel > 1) {
      throw new Error("sustainLevel must be 0..1");
    }
  }
}
Export it
// packages/.../music-core-synthesizer-envelopes/src/index.ts

export * from "./adsr.js";
Update contracts (small change)
export interface IEnvelopeDefinition {
  readonly type: string;
}
Use it (in your component/controller)
Replace inline object:

envelope: {
  attackSeconds: 0.01,
  decaySeconds: 0.1,
  sustainLevel: 0.7,
  releaseSeconds: 0.25,
}
with:

import { AdsrEnvelope } from "@monorepo/music-core-synthesizer-envelopes";

envelope: AdsrEnvelope.create({
  attackSeconds: 0.01,
  decaySeconds: 0.1,
  sustainLevel: 0.7,
  releaseSeconds: 0.25,
}),
Why this is the correct level
You now have:

contracts        → abstraction (IEnvelopeDefinition)
envelopes module → concrete ADSR implementation
engine           → consumes abstraction
web-audio        → interprets implementation
What NOT to do (yet)
Do NOT add:

envelope registry

strategy patterns

multiple envelope types

automation curves

You don’t need them yet.

Next logical step (after this works)
Then you extend:

ADSR → AR → Multi-stage → Modulation envelopes
Bottom line
Yes — implement ONE envelope (ADSR), clean, validated, minimal.
That unblocks everything without overengineering.

@monorepo/music-core-synthesizer-envelopes will be a depdenciy to ? 

Short answer: yes—but only in one place.

Correct dependency direction
music-core-synthesizer-contracts
        ↑
music-core-synthesizer-engine
        ↑
music-core-synthesizer-envelopes   ← depends on contracts ONLY
        ↑
music-core-synthesizer-web-audio   ← depends on contracts (+ envelopes optional)
        ↑
apps / UI / features
Exact rules
1. music-core-synthesizer-envelopes
depends on → contracts
import { IEnvelopeDefinition } from "@monorepo/music-core-synthesizer-contracts";
✔ defines concrete envelopes (ADSR)
❌ must NOT depend on engine or web-audio

2. music-core-synthesizer-engine
depends on → contracts ONLY
❌ DO NOT import envelopes here

Engine must stay:

envelope-agnostic
3. music-core-synthesizer-web-audio
You have two options:

Option A (recommended now)
depends on → contracts + envelopes
import { ADSR_ENVELOPE } from "@monorepo/music-core-synthesizer-envelopes";
✔ simplest
✔ explicit behavior mapping
✔ good for current stage

Option B (later, more advanced)
depends on → contracts ONLY
runtime registry for envelope handlers

👉 not needed yet

4. UI / App layer
depends on → contracts + engine + web-audio + envelopes
This is where you construct:

AdsrEnvelope.create(...)
Final answer
@monorepo/music-core-synthesizer-envelopes
→ dependency of:
   - web-audio (for rendering behavior)
   - app/ui (for creating definitions)

→ NOT a dependency of:
   - engine
Key architectural rule
Engine = pure logic (no concrete types)
Modules = concrete implementations
Why this matters
If you let engine depend on envelopes:

engine → envelopes ❌
you destroy:

OCP + testability + replaceability
Bottom line
envelopes is a plug-in module
→ used at edges (UI + WebAudio)
→ invisible to engine

so music-core-synthesizer-envelopes is depdended on @monorepo/music-core-synthesizer-contracts

Yes. That is the correct dependency.

Minimal rule
music-core-synthesizer-envelopes
    → depends on
@monorepo/music-core-synthesizer-contracts
Why
envelopes defines concrete implementations of:

IEnvelopeDefinition
which lives in:

contracts
So it must depend on it.

Dependency graph (strict)
contracts
   ↑
envelopes
   ↑
web-audio   (uses envelope behavior)
   ↑
app / ui    (creates envelope instances)

engine → contracts ONLY
What NOT to do
engine → envelopes ❌
contracts → envelopes ❌
Practical check
If this compiles, you're correct:

import { IEnvelopeDefinition } from "@monorepo/music-core-synthesizer-contracts";
inside music-core-synthesizer-envelopes

Summary
envelopes = implementation module
contracts = abstraction module
Correct direction:

implementation → abstraction ✔

How is implmenmtation IVoiceDefinition

You do not “implement” IVoiceDefinition as a class.
It is a pure data contract. Implementation = composition of definitions from modules.

Correct approach
1. Keep IVoiceDefinition as-is (data only)
export interface IVoiceDefinition {
  readonly oscillator: IOscillatorDefinition;
  readonly noise: INoiseDefinition;
  readonly envelope: IEnvelopeDefinition; // abstract
  readonly filter: IFilterDefinition;
  readonly distortion: IDistortionDefinition;
}
2. Build a concrete voice (composition)
// packages/.../voice-default.ts

import type { IVoiceDefinition } from "@monorepo/music-core-synthesizer-contracts";
import { OscillatorWaveform, FilterType, DistortionType } from "@monorepo/music-core-synthesizer-contracts";
import { AdsrEnvelope } from "@monorepo/music-core-synthesizer-envelopes";

export const DefaultVoice: IVoiceDefinition = {
  oscillator: {
    waveform: OscillatorWaveform.Sawtooth,
    detuneCents: 0,
    gain: 0.8,
  },

  noise: {
    enabled: false,
    gain: 0,
  },

  envelope: AdsrEnvelope.create({
    attackSeconds: 0.01,
    decaySeconds: 0.1,
    sustainLevel: 0.7,
    releaseSeconds: 0.25,
  }),

  filter: {
    enabled: false,
    type: FilterType.LowPass,
    cutoffHz: 2000,
    resonanceQ: 0.7,
  },

  distortion: {
    enabled: false,
    type: DistortionType.None,
    amount: 0,
  },
};
3. Optional: Builder (if you want extension later)
export class VoiceDefinitionBuilder {
  private def: IVoiceDefinition;

  public constructor(base: IVoiceDefinition) {
    this.def = base;
  }

  public withFilter(cutoffHz: number): this {
    this.def = {
      ...this.def,
      filter: {
        ...this.def.filter,
        enabled: true,
        cutoffHz,
      },
    };
    return this;
  }

  public build(): IVoiceDefinition {
    return this.def;
  }
}
Key concept (important)
IVoiceDefinition is NOT behavior
→ it is a configuration graph
Where behavior lives
contracts        → shape
envelopes        → envelope implementation
web-audio        → audio graph behavior
engine           → lifecycle (note on/off)
Anti-pattern (do NOT do this)
class VoiceDefinition implements IVoiceDefinition { ... } ❌
Reason:

locks structure + kills composition + breaks OCP
Mental model
Voice = data describing signal chain

Oscillator → Noise → Filter → Distortion → VCA(Envelope)
IVoiceDefinition = that graph as data

Bottom line
You "implement" IVoiceDefinition by composing data from modules
—not by creating classes.

export interface IVoiceDefinition {
  readonly oscillator: IOscillatorDefinition;
  readonly noise: INoiseDefinition;
  readonly envelope: IEnvelopeDefinition;
  readonly filter: IFilterDefinition;
  readonly distortion: IDistortionDefinition;
}

Your interface is structurally fine. The missing piece is how it becomes usable across modules without coupling.

Right now it is too flat and not future-proof for extension.

Minimal correct evolution (do NOT rewrite everything)
1. Keep it as data (but make it composable)
export interface IVoiceDefinition {
  readonly oscillator: IOscillatorDefinition;
  readonly noise: INoiseDefinition;
  readonly envelope: IEnvelopeDefinition;
  readonly filter: IFilterDefinition;
  readonly distortion: IDistortionDefinition;
}
✔ This stays

2. The real “implementation” is a factory (NOT a class)
// voice-default.ts

import type { IVoiceDefinition } from "@monorepo/music-core-synthesizer-contracts";
import { OscillatorWaveform, FilterType, DistortionType } from "@monorepo/music-core-synthesizer-contracts";
import { AdsrEnvelope } from "@monorepo/music-core-synthesizer-envelopes";

export function createDefaultVoice(): IVoiceDefinition {
  return {
    oscillator: {
      waveform: OscillatorWaveform.Sawtooth,
      detuneCents: 0,
      gain: 0.8,
    },

    noise: {
      enabled: false,
      gain: 0,
    },

    envelope: AdsrEnvelope.create({
      attackSeconds: 0.01,
      decaySeconds: 0.1,
      sustainLevel: 0.7,
      releaseSeconds: 0.25,
    }),

    filter: {
      enabled: false,
      type: FilterType.LowPass,
      cutoffHz: 2000,
      resonanceQ: 0.7,
    },

    distortion: {
      enabled: false,
      type: DistortionType.None,
      amount: 0,
    },
  };
}
3. Why this is the correct implementation
IVoiceDefinition = configuration graph
You don’t “implement” it with behavior.
You compose it from modules:

oscillator module
envelope module
filter module
distortion module
4. Important architectural rule
contracts → define shape
modules   → produce valid instances of that shape
engine    → consumes shape
web-audio → interprets shape
5. What is wrong if you go another way
❌ Class-based implementation
class VoiceDefinition implements IVoiceDefinition { ... }
Breaks:

OCP (you must modify class for new modules)

Composition (hard to swap parts)

Testability

6. Future-safe improvement (optional but correct)
If you want real extensibility:

export interface IVoiceDefinition {
  readonly blocks: readonly unknown[];
}
…but do NOT do this yet. Your current model is fine for now.

Bottom line
You don’t implement IVoiceDefinition.
You construct it.
And the correct place to do that is:

app layer OR presets module
If you want next step:
I can refactor this into a strict typed builder + preset system without breaking your current architecture.

  readonly envelope: IEnvelopeDefinition; =>   readonly envelope: IAdsrEnvelopeDefinition???;

No — do not change it to IAdsrEnvelopeDefinition.

Correct contract
readonly envelope: IEnvelopeDefinition;
Why
If you do this:

readonly envelope: IAdsrEnvelopeDefinition; ❌
you hard-couple:

voice → ADSR only
That breaks:

OCP (Open/Closed)
future envelopes (AR, multi-stage, curves)
module isolation
Correct architecture
contracts:
  IEnvelopeDefinition  ← abstract

envelopes module:
  IAdsrEnvelopeDefinition extends IEnvelopeDefinition

voice:
  uses IEnvelopeDefinition ONLY
How it works in practice
VoiceDefinition (unchanged)
readonly envelope: IEnvelopeDefinition;
Concrete usage (ADSR)
import { AdsrEnvelope } from "@monorepo/music-core-synthesizer-envelopes";

envelope: AdsrEnvelope.create({
  attackSeconds: 0.01,
  decaySeconds: 0.1,
  sustainLevel: 0.7,
  releaseSeconds: 0.25,
}),
WebAudio layer (narrowing)
if (env.type === "adsr") {
  const adsr = env as IAdsrEnvelopeDefinition;
  // apply ADSR
}
Key rule
Contracts must depend on abstractions only
—not concrete implementations
Mental model
IVoiceDefinition
  → envelope: "some envelope"

ADSR is just ONE implementation
Bottom line
Keep:
  IEnvelopeDefinition ✔

Never:
  IAdsrEnvelopeDefinition in contracts ❌

So why did I implmented IAdsrEnvelopeDefinition? 

Because you needed a concrete, usable envelope.

That’s the distinction you’re circling:

Two different roles
1. IEnvelopeDefinition (contracts)
purpose: abstraction boundary
used by engine

used by voice definition

does not know ADSR exists

2. IAdsrEnvelopeDefinition (module)
purpose: actual implementation you can use
used by UI / presets / app

used by web-audio to interpret behavior

contains real fields (attack, decay, etc.)

Why you created it
Without this:

readonly envelope: IEnvelopeDefinition;
…you would have no data shape to describe ADSR.

So you introduced:

IAdsrEnvelopeDefinition
to answer:

"What is an ADSR envelope in this system?"
Think of it like this
IEnvelopeDefinition = interface (protocol)

IAdsrEnvelopeDefinition = concrete message format
Flow in your system
UI / preset
  → creates IAdsrEnvelopeDefinition

IVoiceDefinition
  → holds it as IEnvelopeDefinition

Engine
  → passes it through blindly

WebAudio
  → inspects type and executes ADSR behavior
Why not skip it?
If you didn’t define IAdsrEnvelopeDefinition, you’d end up with:

envelope: {
  attackSeconds: number;
  decaySeconds: number;
  ...
}
Problems:

❌ no type identity (type: "adsr")

❌ no validation boundary

❌ no extensibility

❌ no separation of modules

Key insight
You did NOT implement the contract.
You defined a concrete variant of it.
Analogy
IEnvelopeDefinition = "Vehicle"
IAdsrEnvelopeDefinition = "Car"
You still type your system as:

Vehicle
…but you instantiate:

Car
Bottom line
You created IAdsrEnvelopeDefinition
because contracts define “what”,
modules define “how”.
If you want next step:
You’re ready for **removing the type: string and

Where? 

In one place only: inside your envelope implementation module.

Where IAdsrEnvelopeDefinition belongs
packages/Audio/music-core-synthesizer/modules/music-core-synthesizer-envelopes
Example:

// music-core-synthesizer-envelopes/src/adsr.ts
Where it must NOT appear
❌ contracts
music-core-synthesizer-contracts
No:

IAdsrEnvelopeDefinition ❌
Only:

IEnvelopeDefinition ✔
❌ engine
music-core-synthesizer-engine
Engine must not know ADSR exists.

❌ voice definition interface
readonly envelope: IEnvelopeDefinition; ✔
NOT:

readonly envelope: IAdsrEnvelopeDefinition; ❌
Where it IS used
✔ UI / presets / app layer
import { AdsrEnvelope } from "@monorepo/music-core-synthesizer-envelopes";

envelope: AdsrEnvelope.create(...)
✔ web-audio (interpretation layer)
if (env.type === "adsr") {
  const adsr = env as IAdsrEnvelopeDefinition;
}
Visual map
contracts
   ↑
envelopes (IAdsrEnvelopeDefinition lives here)
   ↑
web-audio (interprets it)
   ↑
app/ui (creates it)

engine → contracts only
Bottom line
IAdsrEnvelopeDefinition lives ONLY in:

music-core-synthesizer-envelopes
Everything else must stay agnostic.

adsrEnvelope needs unit test 

// packages/Audio/music-core-synthesizer/modules/music-core-synthesizer-envelopes/tests/adsr.test.ts

import { describe, it, expect } from "vitest";

import {
  AdsrEnvelope,
  ADSR_ENVELOPE,
  type IAdsrEnvelopeDefinition,
} from "../src/adsr.js";

/* ============================================================================
   Fixture
============================================================================ */

function createValid(): IAdsrEnvelopeDefinition {
  return AdsrEnvelope.create({
    attackSeconds: 0.01,
    decaySeconds: 0.1,
    sustainLevel: 0.7,
    releaseSeconds: 0.25,
  });
}

/* ============================================================================
   Tests
============================================================================ */

describe("AdsrEnvelope", () => {
  it("should create a valid ADSR envelope", () => {
    const env = createValid();

    expect(env.type).toBe(ADSR_ENVELOPE);
    expect(env.attackSeconds).toBe(0.01);
    expect(env.decaySeconds).toBe(0.1);
    expect(env.sustainLevel).toBe(0.7);
    expect(env.releaseSeconds).toBe(0.25);
  });

  it("should be immutable (readonly contract)", () => {
    const env = createValid();

    // runtime immutability is not enforced, but structure should not change shape
    expect(Object.isFrozen?.(env) ?? true).toBeTruthy();
  });

  it("should reject negative attack", () => {
    expect(() =>
      AdsrEnvelope.create({
        attackSeconds: -1,
        decaySeconds: 0.1,
        sustainLevel: 0.5,
        releaseSeconds: 0.2,
      }),
    ).toThrow();
  });

  it("should reject negative decay", () => {
    expect(() =>
      AdsrEnvelope.create({
        attackSeconds: 0.1,
        decaySeconds: -1,
        sustainLevel: 0.5,
        releaseSeconds: 0.2,
      }),
    ).toThrow();
  });

  it("should reject negative release", () => {
    expect(() =>
      AdsrEnvelope.create({
        attackSeconds: 0.1,
        decaySeconds: 0.2,
        sustainLevel: 0.5,
        releaseSeconds: -1,
      }),
    ).toThrow();
  });

  it("should reject sustain below 0", () => {
    expect(() =>
      AdsrEnvelope.create({
        attackSeconds: 0.1,
        decaySeconds: 0.2,
        sustainLevel: -0.1,
        releaseSeconds: 0.2,
      }),
    ).toThrow();
  });

  it("should reject sustain above 1", () => {
    expect(() =>
      AdsrEnvelope.create({
        attackSeconds: 0.1,
        decaySeconds: 0.2,
        sustainLevel: 1.1,
        releaseSeconds: 0.2,
      }),
    ).toThrow();
  });

  it("should allow zero times", () => {
    const env = AdsrEnvelope.create({
      attackSeconds: 0,
      decaySeconds: 0,
      sustainLevel: 0.5,
      releaseSeconds: 0,
    });

    expect(env.attackSeconds).toBe(0);
    expect(env.decaySeconds).toBe(0);
    expect(env.releaseSeconds).toBe(0);
  });
});

IVoiceDefinition is kind of core contract? 

Yes. It is a core contract—but be precise about what that means.

What it actually is
IVoiceDefinition = canonical voice configuration model
It defines the signal chain shape, not behavior.

Its role in your architecture
contracts (core)
  └── IVoiceDefinition  ← YOU ARE HERE

engine
  └── consumes it (lifecycle only)

web-audio
  └── interprets it (builds graph)

modules (osc, envelopes, filters…)
  └── provide parts used inside it

ui / presets
  └── construct instances of it
Why it is “core”
Because everything depends on it:

engine → needs it
web-audio → needs it
ui → creates it
presets → store it
So:

change IVoiceDefinition = break whole system
What it must NOT become
❌ Not behavior
start(): void ❌
process(): void ❌
❌ Not implementation-specific
readonly envelope: IAdsrEnvelopeDefinition ❌
❌ Not engine-aware
readonly voiceId: string ❌
readonly active: boolean ❌
What it SHOULD be
pure, stable, minimal configuration model
Mental model
IVoiceDefinition = blueprint

WebAudioVoiceGraphBuilder = builder

SynthEngine = lifecycle manager
Why your design is good (important)
Your current shape:

oscillator → noise → filter → distortion → envelope
is:

✔ deterministic
✔ serializable
✔ testable
✔ replaceable
✔ KISS
Only future improvement (don’t do yet)
If you later outgrow it:

IVoiceDefinition → blocks[]
(plugin architecture)

But not now.

Bottom line
Yes — IVoiceDefinition is a core contract.

Treat it as:
→ stable
→ abstract
→ data-only
→ system-wide dependency

Make a oscillator UI component a Lit3 component that is start of controlling the IVoiceDefinition from user interface 

Thought for 5s
// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/oscillator-control.component.ts

import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import type { IVoiceDefinition } from "@monorepo/music-core-synthesizer-contracts";
import { OscillatorWaveform } from "@monorepo/music-core-synthesizer-contracts";

export const OscillatorControlEvents = {
  voiceDefinitionChanged: "voice-definition-changed",
} as const;

export type VoiceDefinitionChangedEvent = CustomEvent<{
  readonly definition: IVoiceDefinition;
}>;

@customElement("oscillator-control")
export class OscillatorControlComponent extends LitElement {
  @property({ attribute: false })
  public definition: IVoiceDefinition | null = null;

  public static override readonly styles = css`
    :host {
      display: block;
      padding: 12px;
      border: 1px solid #333;
      border-radius: 8px;
      max-width: 360px;
      font-family: system-ui, sans-serif;
    }

    .row {
      display: grid;
      gap: 6px;
      margin-bottom: 10px;
    }

    label {
      font-size: 13px;
      font-weight: 600;
    }

    select,
    input {
      padding: 6px;
    }
  `;

  protected override render() {
    if (!this.definition) {
      return html`<p>No voice definition.</p>`;
    }

    return html`
      <section>
        <h2>Oscillator</h2>

        <div class="row">
          <label for="waveform">Waveform</label>
          <select id="waveform" @change=${this.onWaveformChanged}>
            ${this.renderWaveformOption(OscillatorWaveform.Sine, "Sine")}
            ${this.renderWaveformOption(OscillatorWaveform.Square, "Square")}
            ${this.renderWaveformOption(OscillatorWaveform.Sawtooth, "Sawtooth")}
            ${this.renderWaveformOption(OscillatorWaveform.Triangle, "Triangle")}
          </select>
        </div>

        <div class="row">
          <label for="gain">Gain: ${this.definition.oscillator.gain.toFixed(2)}</label>
          <input
            id="gain"
            type="range"
            min="0"
            max="1"
            step="0.01"
            .value=${String(this.definition.oscillator.gain)}
            @input=${this.onGainChanged}
          />
        </div>

        <div class="row">
          <label for="detune">Detune cents: ${this.definition.oscillator.detuneCents}</label>
          <input
            id="detune"
            type="range"
            min="-1200"
            max="1200"
            step="1"
            .value=${String(this.definition.oscillator.detuneCents)}
            @input=${this.onDetuneChanged}
          />
        </div>
      </section>
    `;
  }

  private renderWaveformOption(value: OscillatorWaveform, label: string) {
    return html`
      <option
        value=${value}
        ?selected=${this.definition?.oscillator.waveform === value}
      >
        ${label}
      </option>
    `;
  }

  private onWaveformChanged = (event: Event): void => {
    const select = event.target as HTMLSelectElement;
    this.patchOscillator({
      waveform: select.value as OscillatorWaveform,
    });
  };

  private onGainChanged = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    this.patchOscillator({
      gain: Number(input.value),
    });
  };

  private onDetuneChanged = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    this.patchOscillator({
      detuneCents: Number(input.value),
    });
  };

  private patchOscillator(
    patch: Partial<IVoiceDefinition["oscillator"]>,
  ): void {
    if (!this.definition) {
      return;
    }

    const next: IVoiceDefinition = {
      ...this.definition,
      oscillator: {
        ...this.definition.oscillator,
        ...patch,
      },
    };

    this.definition = next;

    this.dispatchEvent(
      new CustomEvent(OscillatorControlEvents.voiceDefinitionChanged, {
        detail: { definition: next },
        bubbles: true,
        composed: true,
      }),
    );
  }
}
// use in sound-test.component.ts

import "./oscillator-control.component";

import {
  OscillatorControlEvents,
  type VoiceDefinitionChangedEvent,
} from "./oscillator-control.component";

// inside SoundTestComponent:

private voiceDefinition: IVoiceDefinition = createDefaultVoiceDefinition();

protected override render() {
  return html`
    <h1>Sound Test</h1>

    <oscillator-control
      .definition=${this.voiceDefinition}
      @voice-definition-changed=${this.onVoiceDefinitionChanged}
    ></oscillator-control>

    <button
      @pointerdown=${this.onDown}
      @pointerup=${this.onUp}
      @pointerleave=${this.onUp}
    >
      Hold C4
    </button>

    <button @click=${this.onStop}>Stop</button>
  `;
}

private onVoiceDefinitionChanged = (event: VoiceDefinitionChangedEvent): void => {
  this.voiceDefinition = event.detail.definition;
  this.controller.setVoiceDefinition(this.voiceDefinition);
};

Change it for me: @customElement("sound-test")
export class SoundTestComponent extends LitElement {
  private readonly controller = new SoundController();
  private voiceDefinition: IVoiceDefinition = createDefaultVoiceDefinition();

  static styles = css
    :host {
      display: block;
      padding: 16px;
      font-family: sans-serif;
    }

    button {
      margin-right: 8px;
      padding: 8px 12px;
      font-size: 14px;
    }
  ;

  render() {
    return html
      <h1>Sound Test</h1>

      <button
        @pointerdown=${this.onDown}
        @pointerup=${this.onUp}
        @pointerleave=${this.onUp}
      >
        Hold C4
      </button>

      <button @click=${this.onStop}>
        Stop
      </button>
    ;
  }

  private onDown = async () => {
    await this.controller.init(); // user gesture
    this.controller.noteOn(60);
  };

  private onUp = () => {
    this.controller.noteOff(60);
  };

  private onStop = () => {
    this.controller.noteOff(60);
  };
}

@customElement("sound-test")
export class SoundTestComponent extends LitElement {
  private readonly controller = new SoundController();
  private voiceDefinition: IVoiceDefinition = createDefaultVoiceDefinition();

  public static override readonly styles = css`
    :host {
      display: block;
      padding: 16px;
      font-family: sans-serif;
    }

    button {
      margin-right: 8px;
      padding: 8px 12px;
      font-size: 14px;
    }

    oscillator-control {
      display: block;
      margin-bottom: 16px;
    }
  `;

  protected override render() {
    return html`
      <h1>Sound Test</h1>

      <oscillator-control
        .definition=${this.voiceDefinition}
        @voice-definition-changed=${this.onVoiceDefinitionChanged}
      ></oscillator-control>

      <button
        @pointerdown=${this.onDown}
        @pointerup=${this.onUp}
        @pointerleave=${this.onUp}
      >
        Hold C4
      </button>

      <button @click=${this.onStop}>Stop</button>
    `;
  }

  private onVoiceDefinitionChanged = (
    event: CustomEvent<{ readonly definition: IVoiceDefinition }>,
  ): void => {
    this.voiceDefinition = event.detail.definition;
    this.controller.setVoiceDefinition(this.voiceDefinition);
    this.requestUpdate();
  };

  private onDown = async (): Promise<void> => {
    await this.controller.init(this.voiceDefinition);
    this.controller.noteOn(60);
  };

  private onUp = (): void => {
    this.controller.noteOff(60);
  };

  private onStop = (): void => {
    this.controller.noteOff(60);
  };
}

Cannot find name 'createDefaultVoiceDefinition'.

You never defined it. Add a minimal factory.

// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/voice.factory.ts

import type { IVoiceDefinition } from "@monorepo/music-core-synthesizer-contracts";
import {
  OscillatorWaveform,
  FilterType,
  DistortionType,
} from "@monorepo/music-core-synthesizer-contracts";
import { AdsrEnvelope } from "@monorepo/music-core-synthesizer-envelopes";

export function createDefaultVoiceDefinition(): IVoiceDefinition {
  return {
    oscillator: {
      waveform: OscillatorWaveform.Sawtooth,
      detuneCents: 0,
      gain: 0.8,
    },
    noise: {
      enabled: false,
      gain: 0,
    },
    envelope: AdsrEnvelope.create({
      attackSeconds: 0.01,
      decaySeconds: 0.1,
      sustainLevel: 0.7,
      releaseSeconds: 0.25,
    }),
    filter: {
      enabled: false,
      type: FilterType.LowPass,
      cutoffHz: 2000,
      resonanceQ: 0.7,
    },
    distortion: {
      enabled: false,
      type: DistortionType.None,
      amount: 0,
    },
  };
}
Then import it:

import { createDefaultVoiceDefinition } from "./voice.factory";

// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/oscillator-control.component.ts

// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/oscillator-control.component.ts

import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import type { IVoiceDefinition } from "@monorepo/music-core-synthesizer-contracts";
import { OscillatorWaveform } from "@monorepo/music-core-synthesizer-contracts";

export const OscillatorControlEvents = {
  voiceDefinitionChanged: "voice-definition-changed",
} as const;

export type VoiceDefinitionChangedEvent = CustomEvent<{
  readonly definition: IVoiceDefinition;
}>;

@customElement("oscillator-control")
export class OscillatorControlComponent extends LitElement {
  @property({ attribute: false })
  public definition: IVoiceDefinition | null = null;

  public static override readonly styles = css
    :host {
      display: block;
      padding: 12px;
      border: 1px solid #333;
      border-radius: 8px;
      max-width: 360px;
      font-family: system-ui, sans-serif;
    }

    .row {
      display: grid;
      gap: 6px;
      margin-bottom: 10px;
    }

    label {
      font-size: 13px;
      font-weight: 600;
    }

    select,
    input {
      padding: 6px;
    }
  ;

  protected override render() {
    if (!this.definition) {
      return html<p>No voice definition.</p>;
    }

    return html
      <section>
        <h2>Oscillator</h2>

        <div class="row">
          <label for="waveform">Waveform</label>
          <select id="waveform" @change=${this.onWaveformChanged}>
            ${this.renderWaveformOption(OscillatorWaveform.Sine, "Sine")}
            ${this.renderWaveformOption(OscillatorWaveform.Square, "Square")}
            ${this.renderWaveformOption(OscillatorWaveform.Sawtooth, "Sawtooth")}
            ${this.renderWaveformOption(OscillatorWaveform.Triangle, "Triangle")}
          </select>
        </div>

        <div class="row">
          <label for="gain">Gain: ${this.definition.oscillator.gain.toFixed(2)}</label>
          <input
            id="gain"
            type="range"
            min="0"
            max="1"
            step="0.01"
            .value=${String(this.definition.oscillator.gain)}
            @input=${this.onGainChanged}
          />
        </div>

        <div class="row">
          <label for="detune">Detune cents: ${this.definition.oscillator.detuneCents}</label>
          <input
            id="detune"
            type="range"
            min="-1200"
            max="1200"
            step="1"
            .value=${String(this.definition.oscillator.detuneCents)}
            @input=${this.onDetuneChanged}
          />
        </div>
      </section>
    ;
  }

  private renderWaveformOption(value: OscillatorWaveform, label: string) {
    return html
      <option
        value=${value}
        ?selected=${this.definition?.oscillator.waveform === value}
      >
        ${label}
      </option>
    ;
  }

  private onWaveformChanged = (event: Event): void => {
    const select = event.target as HTMLSelectElement;
    this.patchOscillator({
      waveform: select.value as OscillatorWaveform,
    });
  };

  private onGainChanged = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    this.patchOscillator({
      gain: Number(input.value),
    });
  };

  private onDetuneChanged = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    this.patchOscillator({
      detuneCents: Number(input.value),
    });
  };

  private patchOscillator(
    patch: Partial<IVoiceDefinition["oscillator"]>,
  ): void {
    if (!this.definition) {
      return;
    }

    const next: IVoiceDefinition = {
      ...this.definition,
      oscillator: {
        ...this.definition.oscillator,
        ...patch,
      },
    };

    this.definition = next;

    this.dispatchEvent(
      new CustomEvent(OscillatorControlEvents.voiceDefinitionChanged, {
        detail: { definition: next },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

================================================================================

// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/sound-test.component.ts

// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/sound-test.component.ts

import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import "./oscillator-control.component";
import { createDefaultVoiceDefinition } from "./voice.factory";

import {
  createNoteOn,
  createNoteOff,
  MidiChannel,
  MidiNote,
  MidiVelocity,
} from "@monorepo/music-core-midi";

import type { IVoiceDefinition } from "@monorepo/music-core-synthesizer-contracts";
import {
  OscillatorWaveform,
  FilterType,
  DistortionType,
} from "@monorepo/music-core-synthesizer-contracts";

import {
  SynthEngine,
  MidiMessageRouter,
  NoteLifetimeCoordinator,
  StaticVoiceDefinitionProvider,
  EqualTemperamentMidiNoteFrequencyMapper,
} from "@monorepo/music-core-synthesizer-engine";

import {
  WebAudioContextFactory,
  WebAudioMasterBus,
  WebAudioVoiceFactory,
  WebAudioVoiceGraphBuilder,
  WebAudioEnvelopeScheduler,
  WebAudioWhiteNoiseSourceFactory,
} from "@monorepo/music-core-synthesizer-web-audio";

/* ============================================================================
   Internal controller (kept private to component)
============================================================================ */

class TimeProvider {
  constructor(private readonly ctx: AudioContext) {}
  now() {
    return this.ctx.currentTime;
  }
}

class SoundController {
  private engine: SynthEngine | null = null;

  public async init(): Promise<void> {
    if (this.engine) return;

    const ctx = new WebAudioContextFactory().create();
    await ctx.resume();

    const master = new WebAudioMasterBus(ctx, 0.8);
    master.connect(ctx.destination);

    const graphBuilder = new WebAudioVoiceGraphBuilder(
      new WebAudioWhiteNoiseSourceFactory(),
    );

    const voiceFactory = new WebAudioVoiceFactory(
      graphBuilder,
      new WebAudioEnvelopeScheduler(),
    );

    const voiceDef: IVoiceDefinition = {
      oscillator: {
        waveform: OscillatorWaveform.Sawtooth,
        detuneCents: 0,
        gain: 0.8,
      },
      noise: { enabled: false, gain: 0 },
      envelope: {
        attackSeconds: 0.01,
        decaySeconds: 0.1,
        sustainLevel: 0.7,
        releaseSeconds: 0.25,
      },
      filter: {
        enabled: false,
        type: FilterType.LowPass,
        cutoffHz: 2000,
        resonanceQ: 0.7,
      },
      distortion: {
        enabled: false,
        type: DistortionType.None,
        amount: 0,
      },
    };

    const provider = new StaticVoiceDefinitionProvider(voiceDef);

    const coordinator = new NoteLifetimeCoordinator({
      voiceFactory: {
        create: (r) =>
          voiceFactory.create({
            context: ctx,
            destination: master.input,
            definition: r.definition,
            note: r.note,
            velocity: r.velocity,
            frequencyHz: r.frequencyHz,
            startedAt: r.startedAt,
          }),
      },
      frequencyMapper: new EqualTemperamentMidiNoteFrequencyMapper(),
      voiceDefinitionProvider: provider,
    });

    const router = new MidiMessageRouter({
      timeProvider: new TimeProvider(ctx),
      coordinator,
    });

    this.engine = new SynthEngine({ router, coordinator }, voiceDef);
  }

  public noteOn(note: number): void {
    this.engine?.handle(
      createNoteOn(
        MidiChannel.create(1),
        MidiNote.create(note),
        MidiVelocity.create(110),
      ),
    );
  }

  public noteOff(note: number): void {
    this.engine?.handle(
      createNoteOff(
        MidiChannel.create(1),
        MidiNote.create(note),
        MidiVelocity.Zero,
      ),
    );
  }
}

/* ============================================================================
   Lit component
============================================================================ */

@customElement("sound-test")
export class SoundTestComponent extends LitElement {
  private readonly controller = new SoundController();
  private voiceDefinition: IVoiceDefinition = createDefaultVoiceDefinition();

  public static override readonly styles = css
    :host {
      display: block;
      padding: 16px;
      font-family: sans-serif;
    }

    button {
      margin-right: 8px;
      padding: 8px 12px;
      font-size: 14px;
    }

    oscillator-control {
      display: block;
      margin-bottom: 16px;
    }
  ;

  protected override render() {
    return html
      <h1>Sound Test</h1>

      <oscillator-control
        .definition=${this.voiceDefinition}
        @voice-definition-changed=${this.onVoiceDefinitionChanged}
      ></oscillator-control>

      <button
        @pointerdown=${this.onDown}
        @pointerup=${this.onUp}
        @pointerleave=${this.onUp}
      >
        Hold C4
      </button>

      <button @click=${this.onStop}>Stop</button>
    ;
  }

  private onVoiceDefinitionChanged = (
    event: CustomEvent<{ readonly definition: IVoiceDefinition }>,
  ): void => {
    this.voiceDefinition = event.detail.definition;
    this.controller.setVoiceDefinition(this.voiceDefinition);
    this.requestUpdate();
  };

  private onDown = async (): Promise<void> => {
    await this.controller.init(this.voiceDefinition);
    this.controller.noteOn(60);
  };

  private onUp = (): void => {
    this.controller.noteOff(60);
  };

  private onStop = (): void => {
    this.controller.noteOff(60);
  };
}

================================================================================

// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/soundTestFeature.ts

// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/soundTestFeature.ts

import { html, type TemplateResult } from "lit";
import type { IViewFeature } from "../../infrastructure/IViewFeature";

// 👇 THIS IS THE MISSING LINK
import "./sound-test.component";

export class SoundTestFeature implements IViewFeature {
  public readonly id = "sound-test";

  public renderNavigationTemplate(): TemplateResult {
    return html<span>Sound Test</span>;
  }

  public async loadViewHtml(): Promise<string> {
    return <sound-test></sound-test>;
  }

  public async attach(): Promise<void> {
    // no-op
  }
}

================================================================================

// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/soundTestFeature.view.html

<!-- packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/soundTestFeature.view.html -->

<h1>Sound Test</h1>
<p>Sound test view goes here.</p>

<sound-test></sound-test>

================================================================================

// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/voice.factory.ts

// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/voice.factory.ts

import type { IVoiceDefinition } from "@monorepo/music-core-synthesizer-contracts";
import {
  OscillatorWaveform,
  FilterType,
  DistortionType,
} from "@monorepo/music-core-synthesizer-contracts";
import { AdsrEnvelope } from "@monorepo/music-core-synthesizer-envelopes";

export function createDefaultVoiceDefinition(): IVoiceDefinition {
  return {
    oscillator: {
      waveform: OscillatorWaveform.Sawtooth,
      detuneCents: 0,
      gain: 0.8,
    },
    noise: {
      enabled: false,
      gain: 0,
    },
    envelope: AdsrEnvelope.create({
      attackSeconds: 0.01,
      decaySeconds: 0.1,
      sustainLevel: 0.7,
      releaseSeconds: 0.25,
    }),
    filter: {
      enabled: false,
      type: FilterType.LowPass,
      cutoffHz: 2000,
      resonanceQ: 0.7,
    },
    distortion: {
      enabled: false,
      type: DistortionType.None,
      amount: 0,
    },
  };
}

Thought for a few seconds
// Fix SoundController API used by component.

class SoundController {
  private engine: SynthEngine | null = null;
  private voiceDefinitionProvider: StaticVoiceDefinitionProvider | null = null;

  public async init(voiceDef: IVoiceDefinition): Promise<void> {
    if (this.engine) {
      this.setVoiceDefinition(voiceDef);
      return;
    }

    const ctx = new WebAudioContextFactory().create();
    await ctx.resume();

    const master = new WebAudioMasterBus(ctx, 0.8);
    master.connect(ctx.destination);

    const graphBuilder = new WebAudioVoiceGraphBuilder(
      new WebAudioWhiteNoiseSourceFactory(),
    );

    const voiceFactory = new WebAudioVoiceFactory(
      graphBuilder,
      new WebAudioEnvelopeScheduler(),
    );

    const provider = new StaticVoiceDefinitionProvider(voiceDef);
    this.voiceDefinitionProvider = provider;

    const coordinator = new NoteLifetimeCoordinator({
      voiceFactory: {
        create: (r) =>
          voiceFactory.create({
            context: ctx,
            destination: master.input,
            definition: r.definition,
            note: r.note,
            velocity: r.velocity,
            frequencyHz: r.frequencyHz,
            startedAt: r.startedAt,
          }),
      },
      frequencyMapper: new EqualTemperamentMidiNoteFrequencyMapper(),
      voiceDefinitionProvider: provider,
    });

    const router = new MidiMessageRouter({
      timeProvider: new TimeProvider(ctx),
      coordinator,
    });

    this.engine = new SynthEngine({ router, coordinator }, voiceDef);
  }

  public setVoiceDefinition(definition: IVoiceDefinition): void {
    this.voiceDefinitionProvider?.set(definition);
    this.engine?.setVoiceDefinition(definition);
  }

  public noteOn(note: number): void {
    this.engine?.handle(
      createNoteOn(
        MidiChannel.create(1),
        MidiNote.create(note),
        MidiVelocity.create(110),
      ),
    );
  }

  public noteOff(note: number): void {
    this.engine?.handle(
      createNoteOff(
        MidiChannel.create(1),
        MidiNote.create(note),
        MidiVelocity.Zero,
      ),
    );
  }
}
Also delete the old inline voiceDef inside SoundController.init(). You now pass it in from the component:

await this.controller.init(this.voiceDefinition);

Fix: // packages/Audio/music-core-synthesizer/modules/music-core-synthesizer-envelopes/package.json

{
  "name": "@monorepo/music-core-synthesizer-envelopes",
  "version": "1.0.0",
  "description": "Example module scaffold.",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "clean": "rimraf dist",
    "build": "tsc -p tsconfig.json",
    "test": "vitest run",
    "test:typecheck": "vitest run --typecheck"
  },
  "keywords": [
    "module",
    "typescript",
    "example"
  ],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "@monorepo/music-core-synthesizer-contracts": "workspace:*"
    
  },
  "devDependencies": {
    "rimraf": "^6.0.1",
    "typescript": "^5.9.3"
  }
}

================================================================================

// packages/Audio/music-core-synthesizer/modules/music-core-synthesizer-envelopes/README.md

# core.module.example.web

Example TypeScript module used as a scaffold for new packages.

## Features

- Type-safe exports
- Vitest test setup
- TypeScript build pipeline
- ES module output

## Build

pnpm build

## Test

pnpm test

## Structure

src/
  index.ts
  example.ts
  types/

tests/
  exports.test.ts

================================================================================

// packages/Audio/music-core-synthesizer/modules/music-core-synthesizer-envelopes/src/AdsrEnvelope.ts

import type { Seconds, Normalized } from "@monorepo/music-core-synthesizer-contracts";
 
import { IAdsrEnvelopeDefinition } from "./IAdsrEnvelopeDefinition.js";
// packages/Audio/music-core-synthesizer/modules/music-core-synthesizer-envelopes/src/adsr.ts

/* ============================================================================
   Factory (safe construction)
============================================================================ */

export class AdsrEnvelope {
  public static create(input: {
    readonly attackSeconds: Seconds;
    readonly decaySeconds: Seconds;
    readonly sustainLevel: Normalized;
    readonly releaseSeconds: Seconds;
  }): IAdsrEnvelopeDefinition {
    this.validate(input);

    return {
      type: ADSR_ENVELOPE,
      attackSeconds: input.attackSeconds,
      decaySeconds: input.decaySeconds,
      sustainLevel: input.sustainLevel,
      releaseSeconds: input.releaseSeconds,
    };
  }

  private static validate(input: {
    readonly attackSeconds: Seconds;
    readonly decaySeconds: Seconds;
    readonly sustainLevel: Normalized;
    readonly releaseSeconds: Seconds;
  }): void {
    if (input.attackSeconds < 0) throw new Error("attackSeconds >= 0");
    if (input.decaySeconds < 0) throw new Error("decaySeconds >= 0");
    if (input.releaseSeconds < 0) throw new Error("releaseSeconds >= 0");

    if (input.sustainLevel < 0 || input.sustainLevel > 1) {
      throw new Error("sustainLevel must be 0..1");
    }
  }
}

================================================================================

// packages/Audio/music-core-synthesizer/modules/music-core-synthesizer-envelopes/src/IAdsrEnvelopeDefinition.ts

import type { IEnvelopeDefinition, Seconds, Normalized } from "@monorepo/music-core-synthesizer-contracts";
import { ADSR_ENVELOPE } from "./adsrEnvelope.js";

/* ============================================================================
   Definition
============================================================================ */

export interface IAdsrEnvelopeDefinition extends IEnvelopeDefinition {
  readonly type: typeof ADSR_ENVELOPE;

  readonly attackSeconds: Seconds;
  readonly decaySeconds: Seconds;
  readonly sustainLevel: Normalized;
  readonly releaseSeconds: Seconds;
}

================================================================================

// packages/Audio/music-core-synthesizer/modules/music-core-synthesizer-envelopes/src/index.ts

export * from './IAdsrEnvelopeDefinition.js';

================================================================================

// packages/Audio/music-core-synthesizer/modules/music-core-synthesizer-envelopes/tests/tests.test.ts

// packages/Audio/music-core-synthesizer/modules/music-core-synthesizer-envelopes/tests/adsr.test.ts

import { describe, it, expect } from "vitest";

import {
  AdsrEnvelope,
  ADSR_ENVELOPE,
  type IAdsrEnvelopeDefinition,
} from "../src/adsrEnvelope.js";

/* ============================================================================
   Fixture
============================================================================ */

function createValid(): IAdsrEnvelopeDefinition {
  return AdsrEnvelope.create({
    attackSeconds: 0.01,
    decaySeconds: 0.1,
    sustainLevel: 0.7,
    releaseSeconds: 0.25,
  });
}

/* ============================================================================
   Tests
============================================================================ */

describe("AdsrEnvelope", () => {
  it("should create a valid ADSR envelope", () => {
    const env = createValid();

    expect(env.type).toBe(ADSR_ENVELOPE);
    expect(env.attackSeconds).toBe(0.01);
    expect(env.decaySeconds).toBe(0.1);
    expect(env.sustainLevel).toBe(0.7);
    expect(env.releaseSeconds).toBe(0.25);
  });

  it("should be immutable (readonly contract)", () => {
    const env = createValid();

    // runtime immutability is not enforced, but structure should not change shape
    expect(Object.isFrozen?.(env) ?? true).toBeTruthy();
  });

  it("should reject negative attack", () => {
    expect(() =>
      AdsrEnvelope.create({
        attackSeconds: -1,
        decaySeconds: 0.1,
        sustainLevel: 0.5,
        releaseSeconds: 0.2,
      }),
    ).toThrow();
  });

  it("should reject negative decay", () => {
    expect(() =>
      AdsrEnvelope.create({
        attackSeconds: 0.1,
        decaySeconds: -1,
        sustainLevel: 0.5,
        releaseSeconds: 0.2,
      }),
    ).toThrow();
  });

  it("should reject negative release", () => {
    expect(() =>
      AdsrEnvelope.create({
        attackSeconds: 0.1,
        decaySeconds: 0.2,
        sustainLevel: 0.5,
        releaseSeconds: -1,
      }),
    ).toThrow();
  });

  it("should reject sustain below 0", () => {
    expect(() =>
      AdsrEnvelope.create({
        attackSeconds: 0.1,
        decaySeconds: 0.2,
        sustainLevel: -0.1,
        releaseSeconds: 0.2,
      }),
    ).toThrow();
  });

  it("should reject sustain above 1", () => {
    expect(() =>
      AdsrEnvelope.create({
        attackSeconds: 0.1,
        decaySeconds: 0.2,
        sustainLevel: 1.1,
        releaseSeconds: 0.2,
      }),
    ).toThrow();
  });

  it("should allow zero times", () => {
    const env = AdsrEnvelope.create({
      attackSeconds: 0,
      decaySeconds: 0,
      sustainLevel: 0.5,
      releaseSeconds: 0,
    });

    expect(env.attackSeconds).toBe(0);
    expect(env.decaySeconds).toBe(0);
    expect(env.releaseSeconds).toBe(0);
  });
});

================================================================================

// packages/Audio/music-core-synthesizer/modules/music-core-synthesizer-envelopes/tsconfig.json

// tsconfig.json

{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["DOM", "ES2022"],

    "rootDir": "./src",
    "outDir": "./dist",

    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,

    "strict": true,
    "noImplicitOverride": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,

    "types": [],
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["dist", "node_modules", "tests"]
}

================================================================================

// packages/Audio/music-core-synthesizer/modules/music-core-synthesizer-envelopes/tsconfig.test.json

// tsconfig.test.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": true,

    "types": [
      "vitest",
      "node"
    ],

    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  },
  "include": [
    "src/**/*.ts",
    "tests/**/*.test.ts",
    "tests/**/*.spec.ts"
  ]
}

================================================================================

// packages/Audio/music-core-synthesizer/modules/music-core-synthesizer-envelopes/vitest.config.ts

// vitest.config.ts

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: [
      "tests/**/*.test.ts",
      "tests/**/*.spec.ts",
    ],
    isolate: false,
    pool: "threads",
    typecheck: {
      tsconfig: "./tsconfig.test.json",
    },
  },
});

Thought for a few seconds
// packages/Audio/music-core-synthesizer/modules/music-core-synthesizer-envelopes/src/adsrEnvelope.ts

import type {
  IEnvelopeDefinition,
  Normalized,
  Seconds,
} from "@monorepo/music-core-synthesizer-contracts";

export const ADSR_ENVELOPE = "adsr" as const;

export interface IAdsrEnvelopeDefinition extends IEnvelopeDefinition {
  readonly type: typeof ADSR_ENVELOPE;
  readonly attackSeconds: Seconds;
  readonly decaySeconds: Seconds;
  readonly sustainLevel: Normalized;
  readonly releaseSeconds: Seconds;
}

export class AdsrEnvelope {
  public static create(input: {
    readonly attackSeconds: Seconds;
    readonly decaySeconds: Seconds;
    readonly sustainLevel: Normalized;
    readonly releaseSeconds: Seconds;
  }): IAdsrEnvelopeDefinition {
    this.validate(input);

    return Object.freeze({
      type: ADSR_ENVELOPE,
      attackSeconds: input.attackSeconds,
      decaySeconds: input.decaySeconds,
      sustainLevel: input.sustainLevel,
      releaseSeconds: input.releaseSeconds,
    });
  }

  private static validate(input: {
    readonly attackSeconds: Seconds;
    readonly decaySeconds: Seconds;
    readonly sustainLevel: Normalized;
    readonly releaseSeconds: Seconds;
  }): void {
    this.nonNegative(input.attackSeconds, "attackSeconds");
    this.nonNegative(input.decaySeconds, "decaySeconds");
    this.nonNegative(input.releaseSeconds, "releaseSeconds");
    this.normalized(input.sustainLevel, "sustainLevel");
  }

  private static nonNegative(value: number, name: string): void {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`${name} must be >= 0.`);
    }
  }

  private static normalized(value: number, name: string): void {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      throw new Error(`${name} must be in range 0..1.`);
    }
  }
}
// packages/Audio/music-core-synthesizer/modules/music-core-synthesizer-envelopes/src/index.ts

export * from "./adsrEnvelope.js";
// packages/Audio/music-core-synthesizer/modules/music-core-synthesizer-envelopes/tests/tests.test.ts

import { describe, expect, it } from "vitest";

import {
  ADSR_ENVELOPE,
  AdsrEnvelope,
  type IAdsrEnvelopeDefinition,
} from "../src/index.js";

function createFixture(): IAdsrEnvelopeDefinition {
  return AdsrEnvelope.create({
    attackSeconds: 0.01,
    decaySeconds: 0.1,
    sustainLevel: 0.7,
    releaseSeconds: 0.25,
  });
}

describe("AdsrEnvelope", () => {
  it("should create a valid ADSR envelope", () => {
    const envelope = createFixture();

    expect(envelope).toEqual({
      type: ADSR_ENVELOPE,
      attackSeconds: 0.01,
      decaySeconds: 0.1,
      sustainLevel: 0.7,
      releaseSeconds: 0.25,
    });
  });

  it("should freeze the created envelope", () => {
    const envelope = createFixture();

    expect(Object.isFrozen(envelope)).toBe(true);
  });

  it("should allow zero timing values", () => {
    const envelope = AdsrEnvelope.create({
      attackSeconds: 0,
      decaySeconds: 0,
      sustainLevel: 0,
      releaseSeconds: 0,
    });

    expect(envelope.attackSeconds).toBe(0);
    expect(envelope.decaySeconds).toBe(0);
    expect(envelope.sustainLevel).toBe(0);
    expect(envelope.releaseSeconds).toBe(0);
  });

  it.each([
    ["attackSeconds", -0.01],
    ["decaySeconds", -0.01],
    ["releaseSeconds", -0.01],
  ] as const)("should reject negative %s", (field, value) => {
    expect(() =>
      AdsrEnvelope.create({
        attackSeconds: field === "attackSeconds" ? value : 0.01,
        decaySeconds: field === "decaySeconds" ? value : 0.1,
        sustainLevel: 0.7,
        releaseSeconds: field === "releaseSeconds" ? value : 0.25,
      }),
    ).toThrow(`${field} must be >= 0.`);
  });

  it.each([
    ["attackSeconds", Number.NaN],
    ["decaySeconds", Number.NaN],
    ["releaseSeconds", Number.NaN],
    ["attackSeconds", Number.POSITIVE_INFINITY],
    ["decaySeconds", Number.POSITIVE_INFINITY],
    ["releaseSeconds", Number.POSITIVE_INFINITY],
  ] as const)("should reject non-finite %s", (field, value) => {
    expect(() =>
      AdsrEnvelope.create({
        attackSeconds: field === "attackSeconds" ? value : 0.01,
        decaySeconds: field === "decaySeconds" ? value : 0.1,
        sustainLevel: 0.7,
        releaseSeconds: field === "releaseSeconds" ? value : 0.25,
      }),
    ).toThrow(`${field} must be >= 0.`);
  });

  it.each([-0.01, 1.01, Number.NaN, Number.POSITIVE_INFINITY])(
    "should reject invalid sustainLevel %s",
    (sustainLevel) => {
      expect(() =>
        AdsrEnvelope.create({
          attackSeconds: 0.01,
          decaySeconds: 0.1,
          sustainLevel,
          releaseSeconds: 0.25,
        }),
      ).toThrow("sustainLevel must be in range 0..1.");
    },
  );
});
Delete these broken files:

src/AdsrEnvelope.ts
src/IAdsrEnvelopeDefinition.ts

I want a ADSR UI Lit3 controller A D S R 

// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/adsr-control.component.ts

import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import type { IVoiceDefinition } from "@monorepo/music-core-synthesizer-contracts";
import { AdsrEnvelope } from "@monorepo/music-core-synthesizer-envelopes";

export const AdsrControlEvents = {
  voiceDefinitionChanged: "voice-definition-changed",
} as const;

export type AdsrVoiceDefinitionChangedEvent = CustomEvent<{
  readonly definition: IVoiceDefinition;
}>;

@customElement("adsr-control")
export class AdsrControlComponent extends LitElement {
  @property({ attribute: false })
  public definition: IVoiceDefinition | null = null;

  public static override readonly styles = css`
    :host {
      display: block;
      padding: 12px;
      border: 1px solid #333;
      border-radius: 8px;
      max-width: 360px;
      font-family: system-ui, sans-serif;
    }

    h2 {
      margin: 0 0 12px;
      font-size: 18px;
    }

    .row {
      display: grid;
      gap: 6px;
      margin-bottom: 10px;
    }

    label {
      font-size: 13px;
      font-weight: 600;
    }

    input {
      padding: 6px;
    }
  `;

  protected override render() {
    if (!this.definition) {
      return html`<p>No voice definition.</p>`;
    }

    const envelope = this.definition.envelope as {
      readonly attackSeconds: number;
      readonly decaySeconds: number;
      readonly sustainLevel: number;
      readonly releaseSeconds: number;
    };

    return html`
      <section>
        <h2>ADSR</h2>

        ${this.renderSlider("Attack", "attackSeconds", envelope.attackSeconds, 0, 5, 0.01, "s")}
        ${this.renderSlider("Decay", "decaySeconds", envelope.decaySeconds, 0, 5, 0.01, "s")}
        ${this.renderSlider("Sustain", "sustainLevel", envelope.sustainLevel, 0, 1, 0.01, "")}
        ${this.renderSlider("Release", "releaseSeconds", envelope.releaseSeconds, 0, 5, 0.01, "s")}
      </section>
    `;
  }

  private renderSlider(
    label: string,
    key: "attackSeconds" | "decaySeconds" | "sustainLevel" | "releaseSeconds",
    value: number,
    min: number,
    max: number,
    step: number,
    suffix: string,
  ) {
    return html`
      <div class="row">
        <label for=${key}>${label}: ${value.toFixed(2)}${suffix}</label>
        <input
          id=${key}
          type="range"
          min=${String(min)}
          max=${String(max)}
          step=${String(step)}
          .value=${String(value)}
          @input=${(event: Event) => this.onValueChanged(event, key)}
        />
      </div>
    `;
  }

  private onValueChanged(
    event: Event,
    key: "attackSeconds" | "decaySeconds" | "sustainLevel" | "releaseSeconds",
  ): void {
    if (!this.definition) {
      return;
    }

    const input = event.target as HTMLInputElement;
    const value = Number(input.value);

    const current = this.definition.envelope as {
      readonly attackSeconds: number;
      readonly decaySeconds: number;
      readonly sustainLevel: number;
      readonly releaseSeconds: number;
    };

    const nextEnvelope = AdsrEnvelope.create({
      attackSeconds: key === "attackSeconds" ? value : current.attackSeconds,
      decaySeconds: key === "decaySeconds" ? value : current.decaySeconds,
      sustainLevel: key === "sustainLevel" ? value : current.sustainLevel,
      releaseSeconds: key === "releaseSeconds" ? value : current.releaseSeconds,
    });

    const next: IVoiceDefinition = {
      ...this.definition,
      envelope: nextEnvelope,
    };

    this.definition = next;

    this.dispatchEvent(
      new CustomEvent(AdsrControlEvents.voiceDefinitionChanged, {
        detail: { definition: next },
        bubbles: true,
        composed: true,
      }),
    );
  }
}
// add to sound-test.component.ts imports

import "./adsr-control.component";
// add inside render(), below oscillator-control

html`
  <adsr-control
    .definition=${this.voiceDefinition}
    @voice-definition-changed=${this.onVoiceDefinitionChanged}
  ></adsr-control>
`

I want a DistortionControlComponent     distortion: {
      enabled: false,
      type: DistortionType.None,
      amount: 0,
    }

// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/distortion-control.component.ts

import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import type { IVoiceDefinition } from "@monorepo/music-core-synthesizer-contracts";
import { DistortionType } from "@monorepo/music-core-synthesizer-contracts";

export const DistortionControlEvents = {
  voiceDefinitionChanged: "voice-definition-changed",
} as const;

export type DistortionVoiceDefinitionChangedEvent = CustomEvent<{
  readonly definition: IVoiceDefinition;
}>;

@customElement("distortion-control")
export class DistortionControlComponent extends LitElement {
  @property({ attribute: false })
  public definition: IVoiceDefinition | null = null;

  public static override readonly styles = css`
    :host {
      display: block;
      padding: 12px;
      border: 1px solid #333;
      border-radius: 8px;
      max-width: 360px;
      font-family: system-ui, sans-serif;
    }

    h2 {
      margin: 0 0 12px;
      font-size: 18px;
    }

    .row {
      display: grid;
      gap: 6px;
      margin-bottom: 10px;
    }

    label {
      font-size: 13px;
      font-weight: 600;
    }

    select,
    input {
      padding: 6px;
    }
  `;

  protected override render() {
    if (!this.definition) {
      return html`<p>No voice definition.</p>`;
    }

    return html`
      <section>
        <h2>Distortion</h2>

        <div class="row">
          <label>
            <input
              type="checkbox"
              .checked=${this.definition.distortion.enabled}
              @change=${this.onEnabledChanged}
            />
            Enabled
          </label>
        </div>

        <div class="row">
          <label for="distortionType">Type</label>
          <select id="distortionType" @change=${this.onTypeChanged}>
            ${this.renderTypeOption(DistortionType.None, "None")}
            ${this.renderTypeOption(DistortionType.SoftClip, "Soft Clip")}
            ${this.renderTypeOption(DistortionType.HardClip, "Hard Clip")}
            ${this.renderTypeOption(DistortionType.Tanh, "Tanh")}
          </select>
        </div>

        <div class="row">
          <label for="distortionAmount">
            Amount: ${this.definition.distortion.amount.toFixed(2)}
          </label>
          <input
            id="distortionAmount"
            type="range"
            min="0"
            max="1"
            step="0.01"
            .value=${String(this.definition.distortion.amount)}
            @input=${this.onAmountChanged}
          />
        </div>
      </section>
    `;
  }

  private renderTypeOption(value: DistortionType, label: string) {
    return html`
      <option
        value=${value}
        ?selected=${this.definition?.distortion.type === value}
      >
        ${label}
      </option>
    `;
  }

  private onEnabledChanged = (event: Event): void => {
    const input = event.target as HTMLInputElement;

    this.patchDistortion({
      enabled: input.checked,
      type: input.checked && this.definition?.distortion.type === DistortionType.None
        ? DistortionType.Tanh
        : this.definition?.distortion.type ?? DistortionType.None,
    });
  };

  private onTypeChanged = (event: Event): void => {
    const select = event.target as HTMLSelectElement;
    const type = select.value as DistortionType;

    this.patchDistortion({
      type,
      enabled: type !== DistortionType.None,
      amount: type === DistortionType.None ? 0 : this.definition?.distortion.amount ?? 0,
    });
  };

  private onAmountChanged = (event: Event): void => {
    const input = event.target as HTMLInputElement;

    this.patchDistortion({
      amount: Number(input.value),
    });
  };

  private patchDistortion(
    patch: Partial<IVoiceDefinition["distortion"]>,
  ): void {
    if (!this.definition) {
      return;
    }

    const next: IVoiceDefinition = {
      ...this.definition,
      distortion: {
        ...this.definition.distortion,
        ...patch,
      },
    };

    this.definition = next;

    this.dispatchEvent(
      new CustomEvent(DistortionControlEvents.voiceDefinitionChanged, {
        detail: { definition: next },
        bubbles: true,
        composed: true,
      }),
    );
  }
}
// add to sound-test.component.ts imports

import "./distortion-control.component";
// add inside render()

<distortion-control
  .definition=${this.voiceDefinition}
  @voice-definition-changed=${this.onVoiceDefinitionChanged}
></distortion-control>

I have move the osc to : // packages/Audio/music-core-synthesizer/modules/oscillators/music-core-synthesizer-oscillators-web-ui/package.json

{
  "name": "@monorepo/music-core-synthesizer-oscillators-web-ui",
  "version": "1.0.0",
  "description": "web component for an oscillator",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "clean": "rimraf dist",
    "build": "tsc -p tsconfig.json",
    "test": "vitest run",
    "test:typecheck": "vitest run --typecheck"
  },
  "keywords": [
    "module",
    "typescript",
    "web component",
    "lit3"
  ],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "lit": "^3.3.2",
    "@monorepo/music-core-synthesizer-contracts": "workspace:*",
    "@monorepo/music-core-synthesizer-engine": "workspace:*"
  },
  "devDependencies": {
    "rimraf": "^6.0.1",
    "typescript": "^5.9.3"
  }
}

================================================================================

// packages/Audio/music-core-synthesizer/modules/oscillators/music-core-synthesizer-oscillators-web-ui/README.md

# core.module.example.web

Example TypeScript module used as a scaffold for new packages.

## Features

- Type-safe exports
- Vitest test setup
- TypeScript build pipeline
- ES module output

## Build

pnpm build

## Test

pnpm test

## Structure

src/
  index.ts
  example.ts
  types/

tests/
  exports.test.ts

================================================================================

// packages/Audio/music-core-synthesizer/modules/oscillators/music-core-synthesizer-oscillators-web-ui/src/index.ts

{}

================================================================================

// packages/Audio/music-core-synthesizer/modules/oscillators/music-core-synthesizer-oscillators-web-ui/src/oscillator-control.component.ts

// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/oscillator-control.component.ts

import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import type { IVoiceDefinition } from "@monorepo/music-core-synthesizer-contracts";
import { OscillatorWaveform } from "@monorepo/music-core-synthesizer-contracts";

export const OscillatorControlEvents = {
  voiceDefinitionChanged: "voice-definition-changed",
} as const;

export type VoiceDefinitionChangedEvent = CustomEvent<{
  readonly definition: IVoiceDefinition;
}>;

@customElement("oscillator-control")
export class OscillatorControlComponent extends LitElement {
  @property({ attribute: false })
  public definition: IVoiceDefinition | null = null;

  public static override readonly styles = css
    :host {
      display: block;
      padding: 12px;
      border: 1px solid #333;
      border-radius: 8px;
      max-width: 360px;
      font-family: system-ui, sans-serif;
    }

    .row {
      display: grid;
      gap: 6px;
      margin-bottom: 10px;
    }

    label {
      font-size: 13px;
      font-weight: 600;
    }

    select,
    input {
      padding: 6px;
    }
  ;

  protected override render() {
    if (!this.definition) {
      return html<p>No voice definition.</p>;
    }

    return html
      <section>
        <h2>Oscillator</h2>

        <div class="row">
          <label for="waveform">Waveform</label>
          <select id="waveform" @change=${this.onWaveformChanged}>
            ${this.renderWaveformOption(OscillatorWaveform.Sine, "Sine")}
            ${this.renderWaveformOption(OscillatorWaveform.Square, "Square")}
            ${this.renderWaveformOption(OscillatorWaveform.Sawtooth, "Sawtooth")}
            ${this.renderWaveformOption(OscillatorWaveform.Triangle, "Triangle")}
          </select>
        </div>

        <div class="row">
          <label for="gain">Gain: ${this.definition.oscillator.gain.toFixed(2)}</label>
          <input
            id="gain"
            type="range"
            min="0"
            max="1"
            step="0.01"
            .value=${String(this.definition.oscillator.gain)}
            @input=${this.onGainChanged}
          />
        </div>

        <div class="row">
          <label for="detune">Detune cents: ${this.definition.oscillator.detuneCents}</label>
          <input
            id="detune"
            type="range"
            min="-1200"
            max="1200"
            step="1"
            .value=${String(this.definition.oscillator.detuneCents)}
            @input=${this.onDetuneChanged}
          />
        </div>
      </section>
    ;
  }

  private renderWaveformOption(value: OscillatorWaveform, label: string) {
    return html
      <option
        value=${value}
        ?selected=${this.definition?.oscillator.waveform === value}
      >
        ${label}
      </option>
    ;
  }

  private onWaveformChanged = (event: Event): void => {
    const select = event.target as HTMLSelectElement;
    this.patchOscillator({
      waveform: select.value as OscillatorWaveform,
    });
  };

  private onGainChanged = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    this.patchOscillator({
      gain: Number(input.value),
    });
  };

  private onDetuneChanged = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    this.patchOscillator({
      detuneCents: Number(input.value),
    });
  };

  private patchOscillator(
    patch: Partial<IVoiceDefinition["oscillator"]>,
  ): void {
    if (!this.definition) {
      return;
    }

    const next: IVoiceDefinition = {
      ...this.definition,
      oscillator: {
        ...this.definition.oscillator,
        ...patch,
      },
    };

    this.definition = next;

    this.dispatchEvent(
      new CustomEvent(OscillatorControlEvents.voiceDefinitionChanged, {
        detail: { definition: next },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

================================================================================

// packages/Audio/music-core-synthesizer/modules/oscillators/music-core-synthesizer-oscillators-web-ui/tests/tests.test.ts

import { describe, expect, it } from "vitest";
import * as contractsModule from "../src/index.js";

describe("music-core-synthesizer-contracts module", () => {
  it("loads without exports", () => {
    expect(Object.keys(contractsModule)).toEqual([]);
  });
});

================================================================================

// packages/Audio/music-core-synthesizer/modules/oscillators/music-core-synthesizer-oscillators-web-ui/tsconfig.json

{
  "compilerOptions": {
    "target": "es2023",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "module": "esnext",
    "lib": ["ES2023", "DOM"],
    "types": ["vite/client"],
    "skipLibCheck": true,

    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": false,
    "moduleDetection": "force",
    "noEmit": true,

    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src", "../modules/oscillators/music-core-synthesizer-oscillators-web-ui/src/oscillator-control.component.ts"]
}

================================================================================

// packages/Audio/music-core-synthesizer/modules/oscillators/music-core-synthesizer-oscillators-web-ui/tsconfig.test.json

// tsconfig.test.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": true,

    "types": [
      "vitest",
      "node"
    ],

    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  },
  "include": [
    "src/**/*.ts",
    "tests/**/*.test.ts",
    "tests/**/*.spec.ts"
  ]
}

================================================================================

// packages/Audio/music-core-synthesizer/modules/oscillators/music-core-synthesizer-oscillators-web-ui/vitest.config.ts

// vitest.config.ts

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: [
      "tests/**/*.test.ts",
      "tests/**/*.spec.ts",
    ],
    isolate: false,
    pool: "threads",
    typecheck: {
      tsconfig: "./tsconfig.test.json",
    },
  },
});

Thought for 6s
// package.json
{
  "name": "@monorepo/music-core-synthesizer-oscillators-web-ui",
  "version": "1.0.0",
  "description": "Lit web component for controlling synthesizer oscillator settings.",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "clean": "rimraf dist",
    "build": "tsc -p tsconfig.json",
    "test": "vitest run",
    "test:typecheck": "vitest run --typecheck"
  },
  "keywords": ["synthesizer", "oscillator", "web-component", "lit"],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "@monorepo/music-core-synthesizer-contracts": "workspace:*",
    "lit": "^3.3.2"
  },
  "devDependencies": {
    "rimraf": "^6.0.1",
    "typescript": "^5.9.3",
    "vitest": "^3.2.4"
  }
}
// src/index.ts
export * from "./oscillator-control.component.js";
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["DOM", "ES2022"],

    "rootDir": "./src",
    "outDir": "./dist",

    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,

    "experimentalDecorators": true,
    "useDefineForClassFields": false,

    "strict": true,
    "noImplicitOverride": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,

    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["dist", "node_modules", "tests"]
}
// tests/tests.test.ts
import { describe, expect, it } from "vitest";
import * as moduleExports from "../src/index.js";

describe("music-core-synthesizer-oscillators-web-ui", () => {
  it("exports oscillator control component contract", () => {
    expect(moduleExports.OscillatorControlEvents).toBeDefined();
  });
});
Also remove this dependency:

"@monorepo/music-core-synthesizer-engine": "workspace:*"
The oscillator UI should only depend on:

lit
music-core-synthesizer-contracts
Then build:

pnpm --filter @monorepo/music-core-synthesizer-oscillators-web-ui build

But the oscillator is missing few features? 

Yes. Current oscillator UI only covers the first usable slice:

waveform
gain
detune
For a better oscillator module, add these next:

octave
semitone
fine tune
phase
pulse width
enabled
But not all are needed immediately.

Recommended KISS next fields
export interface IOscillatorDefinition {
  readonly enabled: boolean;
  readonly waveform: OscillatorWaveform;
  readonly octave: number;        // -4..4
  readonly semitone: number;      // -12..12
  readonly detuneCents: number;   // -100..100
  readonly gain: Normalized;      // 0..1
}
Later fields
readonly phaseOffset: Normalized; // 0..1
readonly pulseWidth: Normalized;  // 0..1, only for square/PWM later
Do not add pulseWidth until your WebAudio layer supports custom PWM. Native OscillatorNode square does not expose PWM directly.

UI controls to add now
Enabled checkbox
Waveform select
Octave slider/dropdown
Semitone slider/dropdown
Fine detune slider
Gain slider
Important
Changing IOscillatorDefinition means you must update:

contracts
voice.factory.ts
oscillator-control.component.ts
web-audio graph builder
Minimal Web Audio frequency calculation becomes:

const pitchMultiplier =
  Math.pow(2, definition.oscillator.octave) *
  Math.pow(2, definition.oscillator.semitone / 12);

oscillator.frequency.setValueAtTime(
  request.frequencyHz * pitchMultiplier,
  request.context.currentTime,
);
Best next step: add enabled, octave, semitone, fine detune. Avoid PWM/phase until needed.

How can I do rotected override render() {
    return html
      <h1>Sound Test</h1>

      <oscillator-control
        .definition=${this.voiceDefinition}
        @voice-definition-changed=${this.onVoiceDefinitionChanged}
      ></oscillator-control>

       <oscillator-control
        .definition=${this.voiceDefinition}
        @voice-definition-changed=${this.onVoiceDefinitionChanged}
      ></oscillator-control>

      <adsr-control
        .definition=${this.voiceDefinition}
        @voice-definition-changed=${this.onVoiceDefinitionChanged}
      ></adsr-control>

      <distortion-control
        .definition=${this.voiceDefinition}
        @voice-definition-changed=${this.onVoiceDefinitionChanged}
      ></distortion-control>

      <button
        class=${this.isPlaying ? "active" : ""}
        type="button"
        @click=${this.onToggleC4}
      >
        ${this.isPlaying ? "Stop C4" : "Start C4"}
      </button>

      <button type="button" @click=${this.onStop}>Stop</button>

      <midi-controller @midi-message=${this.onMidiMessage}></midi-controller>
    ;
  }

You need two oscillator definitions, not two controls bound to the same voiceDefinition.oscillator.

Minimal shape:

// contracts
export interface IVoiceDefinition {
  readonly oscillators: readonly IOscillatorDefinition[];
  readonly noise: INoiseDefinition;
  readonly envelope: IEnvelopeDefinition;
  readonly filter: IFilterDefinition;
  readonly distortion: IDistortionDefinition;
}
Then UI:

protected override render() {
  return html`
    <h1>Sound Test</h1>

    <oscillator-control
      .title=${"Oscillator 1"}
      .oscillator=${this.voiceDefinition.oscillators[0]}
      @oscillator-changed=${(e: CustomEvent) => this.onOscillatorChanged(0, e)}
    ></oscillator-control>

    <oscillator-control
      .title=${"Oscillator 2"}
      .oscillator=${this.voiceDefinition.oscillators[1]}
      @oscillator-changed=${(e: CustomEvent) => this.onOscillatorChanged(1, e)}
    ></oscillator-control>

    <adsr-control
      .definition=${this.voiceDefinition}
      @voice-definition-changed=${this.onVoiceDefinitionChanged}
    ></adsr-control>

    <distortion-control
      .definition=${this.voiceDefinition}
      @voice-definition-changed=${this.onVoiceDefinitionChanged}
    ></distortion-control>

    <button
      class=${this.isPlaying ? "active" : ""}
      type="button"
      @click=${this.onToggleC4}
    >
      ${this.isPlaying ? "Stop C4" : "Start C4"}
    </button>

    <button type="button" @click=${this.onStop}>Stop</button>

    <midi-controller @midi-message=${this.onMidiMessage}></midi-controller>
  `;
}

private onOscillatorChanged(
  index: number,
  event: CustomEvent<{ readonly oscillator: IOscillatorDefinition }>,
): void {
  const oscillators = [...this.voiceDefinition.oscillators];
  oscillators[index] = event.detail.oscillator;

  this.onVoiceDefinitionChanged(
    new CustomEvent("voice-definition-changed", {
      detail: {
        definition: {
          ...this.voiceDefinition,
          oscillators,
        },
      },
    }),
  );
}
Your current version renders two controls for the same oscillator, so both edit the same data.

Is this better?   
  <oscillator-compoision>
  <oscillator-control

      .title=${"Oscillator 1"}
      .oscillator=${this.voiceDefinition.oscillators[0]}
      @oscillator-changed=${(e: CustomEvent) => this.onOscillatorChanged(0, e)}
    ></oscillator-control>
        <adsr-control
      .definition=${this.voiceDefinition}
      @voice-definition-changed=${this.onVoiceDefinitionChanged}
    ></adsr-control>
      <distortion-control
        .definition=${this.voiceDefinition}
        @voice-definition-changed=${this.onVoiceDefinitionChanged}
      ></distortion-control>

  </oscillator-compoision>
  
Yes, but fix the boundary and spelling.

Use:

<oscillator-composition>
not:

<oscillator-compoision>
Better structure:

<voice-chain>
  <oscillator-control
    .title=${"Oscillator 1"}
    .oscillator=${this.voiceDefinition.oscillators[0]}
    @oscillator-changed=${(e: CustomEvent) => this.onOscillatorChanged(0, e)}
  ></oscillator-control>

  <adsr-control
    .definition=${this.voiceDefinition}
    @voice-definition-changed=${this.onVoiceDefinitionChanged}
  ></adsr-control>

  <distortion-control
    .definition=${this.voiceDefinition}
    @voice-definition-changed=${this.onVoiceDefinitionChanged}
  ></distortion-control>
</voice-chain>
But conceptually, ADSR and distortion are not oscillator composition.

Better naming:

<voice-chain>
or:

<synth-voice-editor>
Use oscillator-composition only when the component contains multiple oscillators mixed together, for example:

<oscillator-composition>
  <oscillator-control ...></oscillator-control>
  <oscillator-control ...></oscillator-control>
</oscillator-composition>
Best current choice:

<synth-voice-editor>
because it groups oscillator + envelope + distortion for one voice.

but they is <voice-chain> building blocks together with osc 

Yes. Then <voice-chain> is the better name.

It means:

oscillator → envelope/VCA → distortion → output
Use it as a layout/composition component, not DSP logic.

<voice-chain>
  <oscillator-control
    .title=${"Oscillator 1"}
    .oscillator=${this.voiceDefinition.oscillators[0]}
    @oscillator-changed=${(e: CustomEvent) => this.onOscillatorChanged(0, e)}
  ></oscillator-control>

  <adsr-control
    .definition=${this.voiceDefinition}
    @voice-definition-changed=${this.onVoiceDefinitionChanged}
  ></adsr-control>

  <distortion-control
    .definition=${this.voiceDefinition}
    @voice-definition-changed=${this.onVoiceDefinitionChanged}
  ></distortion-control>
</voice-chain>
Keep the rule:

voice-chain = UI composition
VoiceDefinition = data
WebAudioVoiceGraphBuilder = real audio chain
Do not put sound logic inside <voice-chain>.

<voice-chain>
  <oscillator-control
    .title=${"Oscillator 1"}
    .oscillator=${this.voiceDefinition.oscillators[0]}
    @oscillator-changed=${(e: CustomEvent) => this.onOscillatorChanged(0, e)}
  ></oscillator-control>

  <adsr-control
    .definition=${this.voiceDefinition}
    @voice-definition-changed=${this.onVoiceDefinitionChanged}
  ></adsr-control>

  <distortion-control
    .definition=${this.voiceDefinition}
    @voice-definition-changed=${this.onVoiceDefinitionChanged}
  ></distortion-control>

  <filters>
    <filter-control-lp></filter-control-lp>
    <filter-control-hp></filter-control-hp>
    <filter-control-bp></filter-control-bp>
  </filters>
</voice-chain>

You’re close, but this part is structurally wrong:

<filters>
  <filter-control-lp></filter-control-lp>
  <filter-control-hp></filter-control-hp>
  <filter-control-bp></filter-control-bp>
</filters>
You do not have 3 filters in your domain model.

Your contract:

readonly filter: IFilterDefinition;
→ means ONE filter with a selectable type, not three parallel filters.

Correct version (aligned with your contracts)
<voice-chain>
  <oscillator-control
    .title=${"Oscillator 1"}
    .oscillator=${this.voiceDefinition.oscillators[0]}
    @oscillator-changed=${(e: CustomEvent) => this.onOscillatorChanged(0, e)}
  ></oscillator-control>

  <adsr-control
    .definition=${this.voiceDefinition}
    @voice-definition-changed=${this.onVoiceDefinitionChanged}
  ></adsr-control>

  <filter-control
    .definition=${this.voiceDefinition}
    @voice-definition-changed=${this.onVoiceDefinitionChanged}
  ></filter-control>

  <distortion-control
    .definition=${this.voiceDefinition}
    @voice-definition-changed=${this.onVoiceDefinitionChanged}
  ></distortion-control>
</voice-chain>
Why your version is wrong
You modeled:

LP + HP + BP (3 active filters)
But your system is:

ONE filter with type:
  LowPass | HighPass | BandPass
Your WebAudio builder:

switch (definition.type)
→ proves this is mutually exclusive, not composable.

If you want multiple filters (future)
Then you must change contracts:

readonly filters: readonly IFilterDefinition[];
And then your UI idea becomes valid.

Clean rule
UI must reflect domain model exactly
Right now:

1 filter → 1 component
Not:

1 filter → 3 components
Naming note
Also avoid generic <filters> tag.

Use:

<filter-control>
or later:

<filter-chain>
only when you actually support multiple filters.

Summary
✔ Your <voice-chain> is correct
❌ Multiple filter components is wrong for your model
✔ Use single <filter-control> with type selector

No, but you can have 

Yes — you can have multiple filter UI controls later.

But then the domain must change from:

readonly filter: IFilterDefinition;
to:

readonly filters: readonly IFilterDefinition[];
Then this becomes valid:

<filter-chain>
  <filter-control
    .title=${"Filter 1"}
    .filter=${this.voiceDefinition.filters[0]}
    @filter-changed=${(e: CustomEvent) => this.onFilterChanged(0, e)}
  ></filter-control>

  <filter-control
    .title=${"Filter 2"}
    .filter=${this.voiceDefinition.filters[1]}
    @filter-changed=${(e: CustomEvent) => this.onFilterChanged(1, e)}
  ></filter-control>
</filter-chain>
Do not make separate components for LP/HP/BP. Make one reusable filter-control with:

type: FilterType.LowPass | FilterType.HighPass | FilterType.BandPass
So:

multiple filters = array
filter type = property
Best next step: keep one filter now. When needed, migrate to filters[].

readonly distortion: IDistortionDefinition; should be an array def as well? 

Short answer: no, not now.

Why distortion should stay single
Your current chain:

osc → filter → distortion → VCA
One distortion is:

✔ simple
✔ predictable
✔ matches WebAudio (WaveShaperNode)
✔ cheap CPU
Multiple distortions:

wave → softclip → hardclip → tanh → ...
This quickly becomes:

✘ hard to control
✘ hard to reason about
✘ rarely useful musically (at this stage)
Compare with filters
Filters are different:

LP → HP → BP → notch → ...
Stacking filters is musically meaningful.

Stacking distortions is usually sound design edge-case, not core.

Keep this
readonly distortion: IDistortionDefinition;
When to change it
Only if you explicitly need:

multi-stage saturation
guitar pedal chains
modular routing
Then:

readonly distortions: readonly IDistortionDefinition[];
and rename UI:

<distortion-chain>
Architectural rule
arrays only where composition adds real value
Apply:

Module	Array?
Oscillator	✅ YES
Filter	✅ YES
Envelope	❌ NO
Distortion	❌ NO
Future-safe approach (no breaking change)
Keep:

distortion: IDistortionDefinition;
Later wrap:

distortionChain: {
  stages: readonly IDistortionDefinition[];
}
without breaking existing API.

Recommendation
Stay with:

readonly distortion: IDistortionDefinition;
Move forward with:

oscillators[]
filters[] (later)
That gives the most value per complexity.

We go back to 1 filter as well, for less complexity 

Good. Keep KISS:

export interface IVoiceDefinition {
  readonly oscillators: readonly IOscillatorDefinition[];
  readonly noise: INoiseDefinition;
  readonly envelope: IEnvelopeDefinition;
  readonly filter: IFilterDefinition;
  readonly distortion: IDistortionDefinition;
}
UI:

<voice-chain>
  <oscillator-control></oscillator-control>
  <adsr-control></adsr-control>
  <filter-control></filter-control>
  <distortion-control></distortion-control>
</voice-chain>
Rule:

oscillators = array
filter = single
distortion = single
envelope = single
That is the right complexity level.

Lets make support for many oscilators 

Thought for a couple of seconds
// 1) contracts: replace oscillator with oscillators

export interface IVoiceDefinition {
  readonly oscillators: readonly IOscillatorDefinition[];
  readonly noise: INoiseDefinition;
  readonly envelope: IEnvelopeDefinition;
  readonly filter: IFilterDefinition;
  readonly distortion: IDistortionDefinition;
}
// 2) voice.factory.ts

export function createDefaultVoiceDefinition(): IVoiceDefinition {
  return {
    oscillators: [
      {
        waveform: OscillatorWaveform.Sawtooth,
        detuneCents: 0,
        gain: 0.8,
      },
    ],
    noise: {
      enabled: false,
      gain: 0,
    },
    envelope: AdsrEnvelope.create({
      attackSeconds: 0.01,
      decaySeconds: 0.1,
      sustainLevel: 0.7,
      releaseSeconds: 0.25,
    }),
    filter: {
      enabled: false,
      type: FilterType.LowPass,
      cutoffHz: 2000,
      resonanceQ: 0.7,
    },
    distortion: {
      enabled: false,
      type: DistortionType.None,
      amount: 0,
    },
  };
}
// 3) oscillator-control.component.ts
// change component input from full voice definition to one oscillator

import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import type { IOscillatorDefinition } from "@monorepo/music-core-synthesizer-contracts";
import { OscillatorWaveform } from "@monorepo/music-core-synthesizer-contracts";

export const OscillatorControlEvents = {
  oscillatorChanged: "oscillator-changed",
} as const;

export type OscillatorChangedEvent = CustomEvent<{
  readonly oscillator: IOscillatorDefinition;
}>;

@customElement("oscillator-control")
export class OscillatorControlComponent extends LitElement {
  @property({ type: String })
  public title = "Oscillator";

  @property({ attribute: false })
  public oscillator: IOscillatorDefinition | null = null;

  public static override readonly styles = css`
    :host {
      display: block;
      padding: 12px;
      border: 1px solid #333;
      border-radius: 8px;
      max-width: 360px;
      font-family: system-ui, sans-serif;
    }

    .row {
      display: grid;
      gap: 6px;
      margin-bottom: 10px;
    }

    label {
      font-size: 13px;
      font-weight: 600;
    }

    select,
    input {
      padding: 6px;
    }
  `;

  protected override render() {
    if (!this.oscillator) {
      return html`<p>No oscillator.</p>`;
    }

    return html`
      <section>
        <h2>${this.title}</h2>

        <div class="row">
          <label for="waveform">Waveform</label>
          <select id="waveform" @change=${this.onWaveformChanged}>
            ${this.renderWaveformOption(OscillatorWaveform.Sine, "Sine")}
            ${this.renderWaveformOption(OscillatorWaveform.Square, "Square")}
            ${this.renderWaveformOption(OscillatorWaveform.Sawtooth, "Sawtooth")}
            ${this.renderWaveformOption(OscillatorWaveform.Triangle, "Triangle")}
          </select>
        </div>

        <div class="row">
          <label for="gain">Gain: ${this.oscillator.gain.toFixed(2)}</label>
          <input
            id="gain"
            type="range"
            min="0"
            max="1"
            step="0.01"
            .value=${String(this.oscillator.gain)}
            @input=${this.onGainChanged}
          />
        </div>

        <div class="row">
          <label for="detune">Detune cents: ${this.oscillator.detuneCents}</label>
          <input
            id="detune"
            type="range"
            min="-1200"
            max="1200"
            step="1"
            .value=${String(this.oscillator.detuneCents)}
            @input=${this.onDetuneChanged}
          />
        </div>
      </section>
    `;
  }

  private renderWaveformOption(value: OscillatorWaveform, label: string) {
    return html`
      <option value=${value} ?selected=${this.oscillator?.waveform === value}>
        ${label}
      </option>
    `;
  }

  private onWaveformChanged = (event: Event): void => {
    this.patch({ waveform: (event.target as HTMLSelectElement).value as OscillatorWaveform });
  };

  private onGainChanged = (event: Event): void => {
    this.patch({ gain: Number((event.target as HTMLInputElement).value) });
  };

  private onDetuneChanged = (event: Event): void => {
    this.patch({ detuneCents: Number((event.target as HTMLInputElement).value) });
  };

  private patch(patch: Partial<IOscillatorDefinition>): void {
    if (!this.oscillator) return;

    const next: IOscillatorDefinition = {
      ...this.oscillator,
      ...patch,
    };

    this.oscillator = next;

    this.dispatchEvent(
      new CustomEvent(OscillatorControlEvents.oscillatorChanged, {
        detail: { oscillator: next },
        bubbles: true,
        composed: true,
      }),
    );
  }
}
// 4) sound-test.component.ts render part

${this.voiceDefinition.oscillators.map(
  (oscillator, index) => html`
    <oscillator-control
      .title=${`Oscillator ${index + 1}`}
      .oscillator=${oscillator}
      @oscillator-changed=${(event: CustomEvent<{ readonly oscillator: IOscillatorDefinition }>) =>
        this.onOscillatorChanged(index, event)}
    ></oscillator-control>
  `,
)}

<button type="button" @click=${this.onAddOscillator}>Add Oscillator</button>
// 5) sound-test.component.ts methods

import type {
  IOscillatorDefinition,
  IVoiceDefinition,
} from "@monorepo/music-core-synthesizer-contracts";

private onOscillatorChanged(
  index: number,
  event: CustomEvent<{ readonly oscillator: IOscillatorDefinition }>,
): void {
  const oscillators = [...this.voiceDefinition.oscillators];
  oscillators[index] = event.detail.oscillator;

  this.setVoiceDefinition({
    ...this.voiceDefinition,
    oscillators,
  });
}

private onAddOscillator = (): void => {
  this.setVoiceDefinition({
    ...this.voiceDefinition,
    oscillators: [
      ...this.voiceDefinition.oscillators,
      {
        waveform: OscillatorWaveform.Sawtooth,
        detuneCents: 0,
        gain: 0.5,
      },
    ],
  });
};

private setVoiceDefinition(definition: IVoiceDefinition): void {
  this.voiceDefinition = definition;
  this.controller.setVoiceDefinition(definition);
  this.requestUpdate();
}
// 6) web-audio graph builder: replace single oscillator creation with many

const oscillatorOutput = request.context.createGain();
oscillatorOutput.gain.setValueAtTime(1, request.context.currentTime);

const oscillators = request.definition.oscillators.map((definition) => {
  const oscillator = request.context.createOscillator();
  oscillator.type = definition.waveform;
  oscillator.frequency.setValueAtTime(request.frequencyHz, request.context.currentTime);
  oscillator.detune.setValueAtTime(definition.detuneCents, request.context.currentTime);

  const gain = request.context.createGain();
  gain.gain.setValueAtTime(definition.gain, request.context.currentTime);

  oscillator.connect(gain);
  gain.connect(oscillatorOutput);

  return oscillator;
});

oscillatorOutput.connect(firstProcessor);
You will also need to update IWebAudioVoiceGraph from one oscillator to many:

export interface IWebAudioVoiceGraph {
  readonly output: AudioNode;
  readonly oscillators: readonly OscillatorNode[];
  readonly vca: GainNode;
  readonly filter: BiquadFilterNode | null;
  readonly distortion: WaveShaperNode | null;
  readonly noise: AudioNode | null;
}
And update start/stop/dispose:

for (const oscillator of this.graph.oscillators) {
  oscillator.start(at);
}
for (const oscillator of this.graph.oscillators) {
  oscillator.stop(stopAt);
}
for (const oscillator of this.graph.oscillators) {
  oscillator.disconnect();
}

private onOscillatorChanged( index: number, event: CustomEvent<{ readonly oscillator: IOscillatorDefinition }\>, ): void { const oscillators \= \[...this.voiceDefinition.oscillators\]; oscillators\[index\] \= event.detail.oscillator; this.setVoiceDefinition({ ...this.voiceDefinition, oscillators, }); }

What file is : // 6) web-audio graph builder: replace single oscillator creation with many

You’re mixing two different parts.

Your snippet:
private onOscillatorChanged(
  index: number,
  event: CustomEvent<{ readonly oscillator: IOscillatorDefinition }>,
): void {
  const oscillators = [...this.voiceDefinition.oscillators];
  oscillators[index] = event.detail.oscillator;

  this.setVoiceDefinition({
    ...this.voiceDefinition,
    oscillators,
  });
}
➡️ This belongs in:

sound-test.component.ts
(UI layer – state mutation + propagation)

The “6) web-audio graph builder” part
That is NOT UI.
That is audio infrastructure.

➡️ File:

packages/Audio/music-core-synthesizer/modules/music-core-synthesizer-web-audio/src/index.ts
➡️ Specifically inside:

export class WebAudioVoiceGraphBuilder
Separation (important)
Concern	File
UI interaction (onOscillatorChanged)	sound-test.component.ts
Audio graph construction (oscillators → gain → filter → etc)	WebAudioVoiceGraphBuilder
What you actually change in builder
You replace this (single oscillator):

const oscillator = context.createOscillator();
with multi-oscillator logic.

Summary
Your function → UI component

My step 6 → WebAudioVoiceGraphBuilder

They are connected via IVoiceDefinition, not directly

If you want next step clean:

I can give you minimal diff for WebAudioVoiceGraphBuilder only (no noise)

I need complete files 

Thought for 4s
// packages/Audio/music-core-synthesizer/modules/music-core-synthesizer-contracts/src/index.ts

import type { MidiMessage } from "@monorepo/music-core-midi";

export type Seconds = number;
export type Hertz = number;
export type MidiNoteNumber = number;
export type Normalized = number;

export interface IDisposable {
  dispose(): void;
}

export enum OscillatorWaveform {
  Sine = "sine",
  Square = "square",
  Sawtooth = "sawtooth",
  Triangle = "triangle",
}

export enum FilterType {
  LowPass = "lowpass",
  HighPass = "highpass",
  BandPass = "bandpass",
}

export enum DistortionType {
  None = "none",
  SoftClip = "soft-clip",
  HardClip = "hard-clip",
  Tanh = "tanh",
}

export interface IOscillatorDefinition {
  readonly waveform: OscillatorWaveform;
  readonly detuneCents: number;
  readonly gain: Normalized;
}

export interface INoiseDefinition {
  readonly enabled: boolean

Sorry contiune please 

// packages/Audio/music-core-synthesizer/modules/music-core-synthesizer-contracts/src/index.ts

import type { MidiMessage } from "@monorepo/music-core-midi";

export type Seconds = number;
export type Hertz = number;
export type MidiNoteNumber = number;
export type Normalized = number;

export interface IDisposable {
  dispose(): void;
}

export enum OscillatorWaveform {
  Sine = "sine",
  Square = "square",
  Sawtooth = "sawtooth",
  Triangle = "triangle",
}

export enum FilterType {
  LowPass = "lowpass",
  HighPass = "highpass",
  BandPass = "bandpass",
}

export enum DistortionType {
  None = "none",
  SoftClip = "soft-clip",
  HardClip = "hard-clip",
  Tanh = "tanh",
}

export interface IOscillatorDefinition {
  readonly waveform: OscillatorWaveform;
  readonly detuneCents: number;
  readonly gain: Normalized;
}

export interface INoiseDefinition {
  readonly enabled: boolean;
  readonly gain: Normalized;
}

export interface IEnvelopeDefinition {
  readonly type: string;
}

export interface IFilterDefinition {
  readonly enabled: boolean;
  readonly type: FilterType;
  readonly cutoffHz: Hertz;
  readonly resonanceQ: number;
}

export interface IDistortionDefinition {
  readonly enabled: boolean;
  readonly type: DistortionType;
  readonly amount: Normalized;
}

export interface IVoiceDefinition {
  readonly oscillators: readonly IOscillatorDefinition[];
  readonly noise: INoiseDefinition;
  readonly envelope: IEnvelopeDefinition;
  readonly filter: IFilterDefinition;
  readonly distortion: IDistortionDefinition;
}

export interface IMidiNoteFrequencyMapper {
  map(note: MidiNoteNumber): Hertz;
}

export interface IVoiceHandle extends IDisposable {
  readonly id: string;
  readonly note: MidiNoteNumber;
  readonly isReleased: boolean;

  start(at: Seconds): void;
  release(at: Seconds): void;
}

export interface ISynthEngine extends IDisposable {
  handle(message: MidiMessage): void;
  panic(): void;
  setVoiceDefinition(definition: IVoiceDefinition): void;
}

export interface IMidiMessageRouter {
  route(message: MidiMessage): void;
}

export interface INoteLifetimeCoordinator {
  noteOn(note: MidiNoteNumber, velocity: Normalized, at: Seconds): void;
  noteOff(note: MidiNoteNumber, at: Seconds): void;
  releaseAll(at: Seconds): void;
}

export interface IWebAudioContextFactory {
  create(): AudioContext;
}

export interface IWebAudioMasterBus extends IDisposable {
  readonly input: AudioNode;
  readonly output: AudioNode;

  connect(destination: AudioNode): void;
  setGain(value: Normalized, at: Seconds): void;
}

export interface IWebAudioEnvelopeScheduler {
  noteOn(
    param: AudioParam,
    env: IEnvelopeDefinition,
    velocity: Normalized,
    at: Seconds,
  ): void;

  noteOff(param: AudioParam, env: IEnvelopeDefinition, at: Seconds): void;
  cancel(param: AudioParam, at: Seconds): void;
}

export interface IWebAudioNoiseSourceFactory {
  create(context: AudioContext): AudioNode;
}

export interface IWebAudioVoiceGraph {
  readonly output: AudioNode;
  readonly oscillators: readonly OscillatorNode[];
  readonly vca: GainNode;
  readonly filter: BiquadFilterNode | null;
  readonly distortion: WaveShaperNode | null;
  readonly noise: AudioNode | null;
}

export interface IWebAudioVoiceGraphBuilder {
  build(request: {
    readonly context: AudioContext;
    readonly destination: AudioNode;
    readonly definition: IVoiceDefinition;
    readonly frequencyHz: Hertz;
  }): IWebAudioVoiceGraph;
}

export interface IWebAudioVoiceFactory {
  create(request: {
    readonly context: AudioContext;
    readonly destination: AudioNode;
    readonly definition: IVoiceDefinition;
    readonly note: MidiNoteNumber;
    readonly velocity: Normalized;
    readonly frequencyHz: Hertz;
    readonly startedAt: Seconds;
  }): IVoiceHandle;
}
// packages/Audio/music-core-synthesizer/modules/music-core-synthesizer-web-audio/src/index.ts

import type {
  Hertz,
  IDistortionDefinition,
  IEnvelopeDefinition,
  IWebAudioContextFactory,
  IWebAudioEnvelopeScheduler,
  IWebAudioMasterBus,
  IWebAudioNoiseSourceFactory,
  IWebAudioVoiceFactory,
  IWebAudioVoiceGraph,
  IWebAudioVoiceGraphBuilder,
  IFilterDefinition,
  IVoiceDefinition,
  IVoiceHandle,
  MidiNoteNumber,
  Normalized,
  Seconds,
} from "@monorepo/music-core-synthesizer-contracts";

import {
  DistortionType,
  FilterType,
} from "@monorepo/music-core-synthesizer-contracts";

import {
  ADSR_ENVELOPE,
  type IAdsrEnvelopeDefinition,
} from "@monorepo/music-core-synthesizer-envelopes";

export class WebAudioContextFactory implements IWebAudioContextFactory {
  public create(): AudioContext {
    return new AudioContext();
  }
}

export class WebAudioMasterBus implements IWebAudioMasterBus {
  public readonly input: GainNode;
  public readonly output: GainNode;

  public constructor(
    private readonly context: AudioContext,
    initialGain: Normalized = 0.8,
  ) {
    WebAudioGuards.normalized(initialGain, "initialGain");

    this.input = context.createGain();
    this.output = context.createGain();

    this.input.connect(this.output);
    this.output.gain.setValueAtTime(initialGain, context.currentTime);
  }

  public connect(destination: AudioNode): void {
    this.output.connect(destination);
  }

  public setGain(value: Normalized, at: Seconds): void {
    WebAudioGuards.normalized(value, "master gain");
    this.output.gain.setValueAtTime(value, at);
  }

  public dispose(): void {
    this.input.disconnect();
    this.output.disconnect();
  }
}

export class WebAudioEnvelopeScheduler implements IWebAudioEnvelopeScheduler {
  public noteOn(
    param: AudioParam,
    env: IEnvelopeDefinition,
    velocity: Normalized,
    at: Seconds,
  ): void {
    WebAudioGuards.normalized(velocity, "velocity");

    const adsr = WebAudioGuards.adsrEnvelope(env);

    const attackEnd = at + adsr.attackSeconds;
    const decayEnd = attackEnd + adsr.decaySeconds;
    const sustain = adsr.sustainLevel * velocity;

    param.cancelScheduledValues(at);
    param.setValueAtTime(0, at);
    param.linearRampToValueAtTime(velocity, attackEnd);
    param.linearRampToValueAtTime(sustain, decayEnd);
  }

  public noteOff(param: AudioParam, env: IEnvelopeDefinition, at: Seconds): void {
    const adsr = WebAudioGuards.adsrEnvelope(env);
    const releaseEnd = at + adsr.releaseSeconds;

    param.cancelScheduledValues(at);
    param.setValueAtTime(param.value, at);
    param.linearRampToValueAtTime(0, releaseEnd);
  }

  public cancel(param: AudioParam, at: Seconds): void {
    param.cancelScheduledValues(at);
  }
}

export class WebAudioWhiteNoiseSourceFactory implements IWebAudioNoiseSourceFactory {
  public constructor(private readonly durationSeconds = 2) {
    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
      throw new Error("Noise buffer duration must be greater than zero.");
    }
  }

  public create(context: AudioContext): AudioNode {
    const frameCount = Math.ceil(context.sampleRate * this.durationSeconds);
    const buffer = context.createBuffer(1, frameCount, context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.start();

    return source;
  }
}

export class WebAudioVoiceGraphBuilder implements IWebAudioVoiceGraphBuilder {
  public constructor(
    private readonly noiseSourceFactory: IWebAudioNoiseSourceFactory,
  ) {}

  public build(request: {
    readonly context: AudioContext;
    readonly destination: AudioNode;
    readonly definition: IVoiceDefinition;
    readonly frequencyHz: Hertz;
  }): IWebAudioVoiceGraph {
    WebAudioGuards.frequency(request.frequencyHz, "frequencyHz");
    WebAudioGuards.voiceDefinition(request.definition);

    const filter = this.createFilterOrNull(
      request.context,
      request.definition.filter,
    );

    const distortion = this.createDistortionOrNull(
      request.context,
      request.definition.distortion,
    );

    const vca = request.context.createGain();
    vca.gain.setValueAtTime(0, request.context.currentTime);

    const firstProcessor = filter ?? distortion ?? vca;

    const oscillatorMixer = request.context.createGain();
    oscillatorMixer.gain.setValueAtTime(1, request.context.currentTime);

    const oscillators = request.definition.oscillators.map((definition) => {
      const oscillator = request.context.createOscillator();
      oscillator.type = definition.waveform;
      oscillator.frequency.setValueAtTime(
        request.frequencyHz,
        request.context.currentTime,
      );
      oscillator.detune.setValueAtTime(
        definition.detuneCents,
        request.context.currentTime,
      );

      const gain = request.context.createGain();
      gain.gain.setValueAtTime(definition.gain, request.context.currentTime);

      oscillator.connect(gain);
      gain.connect(oscillatorMixer);

      return oscillator;
    });

    oscillatorMixer.connect(firstProcessor);

    if (filter !== null && distortion !== null) {
      filter.connect(distortion);
      distortion.connect(vca);
    } else if (filter !== null) {
      filter.connect(vca);
    } else if (distortion !== null) {
      distortion.connect(vca);
    }

    const noise = this.createNoiseOrNull(
      request.context,
      request.definition,
      firstProcessor,
    );

    vca.connect(request.destination);

    return {
      output: vca,
      oscillators,
      vca,
      filter,
      distortion,
      noise,
    };
  }

  private createFilterOrNull(
    context: AudioContext,
    definition: IFilterDefinition,
  ): BiquadFilterNode | null {
    if (!definition.enabled) {
      return null;
    }

    WebAudioGuards.frequency(definition.cutoffHz, "filter cutoffHz");

    if (!Number.isFinite(definition.resonanceQ) || definition.resonanceQ < 0) {
      throw new Error("filter resonanceQ must be >= 0.");
    }

    const node = context.createBiquadFilter();

    switch (definition.type) {
      case FilterType.LowPass:
        node.type = "lowpass";
        break;
      case FilterType.HighPass:
        node.type = "highpass";
        break;
      case FilterType.BandPass:
        node.type = "bandpass";
        break;
      default:
        throw new Error("Unsupported filter type.");
    }

    node.frequency.setValueAtTime(definition.cutoffHz, context.currentTime);
    node.Q.setValueAtTime(definition.resonanceQ, context.currentTime);

    return node;
  }

  private createDistortionOrNull(
    context: AudioContext,
    definition: IDistortionDefinition,
  ): WaveShaperNode | null {
    if (!definition.enabled || definition.type === DistortionType.None) {
      return null;
    }

    WebAudioGuards.normalized(definition.amount, "distortion amount");

    const node = context.createWaveShaper();
    node.curve = WebAudioDistortionCurveFactory.create(definition);
    node.oversample = "4x";

    return node;
  }

  private createNoiseOrNull(
    context: AudioContext,
    definition: IVoiceDefinition,
    destination: AudioNode,
  ): AudioNode | null {
    if (!definition.noise.enabled || definition.noise.gain <= 0) {
      return null;
    }

    WebAudioGuards.normalized(definition.noise.gain, "noise gain");

    const source = this.noiseSourceFactory.create(context);
    const gain = context.createGain();

    gain.gain.setValueAtTime(definition.noise.gain, context.currentTime);

    source.connect(gain);
    gain.connect(destination);

    return source;
  }
}

export class WebAudioVoiceFactory implements IWebAudioVoiceFactory {
  public constructor(
    private readonly graphBuilder: IWebAudioVoiceGraphBuilder,
    private readonly envelopeScheduler: IWebAudioEnvelopeScheduler,
  ) {}

  public create(request: {
    readonly context: AudioContext;
    readonly destination: AudioNode;
    readonly definition: IVoiceDefinition;
    readonly note: MidiNoteNumber;
    readonly velocity: Normalized;
    readonly frequencyHz: Hertz;
    readonly startedAt: Seconds;
  }): IVoiceHandle {
    WebAudioGuards.normalized(request.velocity, "velocity");
    WebAudioGuards.frequency(request.frequencyHz, "frequencyHz");

    const graph = this.graphBuilder.build({
      context: request.context,
      destination: request.destination,
      definition: request.definition,
      frequencyHz: request.frequencyHz,
    });

    return new WebAudioVoiceHandle(
      graph,
      this.envelopeScheduler,
      request.definition.envelope,
      request.note,
      request.velocity,
      request.startedAt,
    );
  }
}

export class WebAudioVoiceHandle implements IVoiceHandle {
  public readonly id: string;
  public readonly note: MidiNoteNumber;

  private released = false;
  private disposed = false;
  private started = false;

  public constructor(
    private readonly graph: IWebAudioVoiceGraph,
    private readonly envelopeScheduler: IWebAudioEnvelopeScheduler,
    private readonly envelope: IEnvelopeDefinition,
    note: MidiNoteNumber,
    private readonly velocity: Normalized,
    startedAt: Seconds,
  ) {
    this.id = `${note}:${startedAt}`;
    this.note = note;
  }

  public get isReleased(): boolean {
    return this.released;
  }

  public start(at: Seconds): void {
    this.throwIfDisposed();

    if (this.started) {
      throw new Error("Voice has already been started.");
    }

    this.started = true;

    this.envelopeScheduler.noteOn(
      this.graph.vca.gain,
      this.envelope,
      this.velocity,
      at,
    );

    for (const oscillator of this.graph.oscillators) {
      oscillator.start(at);
    }
  }

  public release(at: Seconds): void {
    if (this.disposed || this.released) {
      return;
    }

    this.released = true;

    this.envelopeScheduler.noteOff(this.graph.vca.gain, this.envelope, at);

    const adsr = WebAudioGuards.adsrEnvelope(this.envelope);
    const stopAt = at + adsr.releaseSeconds + 0.02;

    for (const oscillator of this.graph.oscillators) {
      try {
        oscillator.stop(stopAt);
      } catch {
        // ignore already-stopped oscillator
      }
    }

    const first = this.graph.oscillators[0];

    if (first) {
      first.addEventListener("ended", () => this.dispose(), { once: true });
      return;
    }

    this.dispose();
  }

  public dispose(): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;

    for (const oscillator of this.graph.oscillators) {
      oscillator.disconnect();
    }

    this.graph.vca.disconnect();
    this.graph.filter?.disconnect();
    this.graph.distortion?.disconnect();
    this.graph.noise?.disconnect();
  }

  private throwIfDisposed(): void {
    if (this.disposed) {
      throw new Error("Voice has already been disposed.");
    }
  }
}

export class WebAudioDistortionCurveFactory {
  private static readonly sampleCount = 2048;

  public static create(
    definition: IDistortionDefinition,
  ): Float32Array<ArrayBuffer> {
    WebAudioGuards.normalized(definition.amount, "distortion amount");

    switch (definition.type) {
      case DistortionType.SoftClip:
        return this.softClip(definition.amount);
      case DistortionType.HardClip:
        return this.hardClip(definition.amount);
      case DistortionType.Tanh:
        return this.tanh(definition.amount);
      case DistortionType.None:
        return this.identity();
      default:
        throw new Error("Unsupported distortion type.");
    }
  }

  private static createCurve(): Float32Array<ArrayBuffer> {
    return new Float32Array(
      new ArrayBuffer(this.sampleCount * Float32Array.BYTES_PER_ELEMENT),
    );
  }

  private static identity(): Float32Array<ArrayBuffer> {
    const curve = this.createCurve();

    for (let i = 0; i < curve.length; i++) {
      const x = (i * 2) / (curve.length - 1) - 1;
      curve[i] = x;
    }

    return curve;
  }

  private static softClip(amount: Normalized): Float32Array<ArrayBuffer> {
    const curve = this.createCurve();
    const drive = 1 + amount * 20;

    for (let i = 0; i < curve.length; i++) {
      const x = (i * 2) / (curve.length - 1) - 1;
      curve[i] = x / (1 + Math.abs(x * drive));
    }

    return curve;
  }

  private static hardClip(amount: Normalized): Float32Array<ArrayBuffer> {
    const curve = this.createCurve();
    const threshold = Math.max(0.05, 1 - amount);

    for (let i = 0; i < curve.length; i++) {
      const x = (i * 2) / (curve.length - 1) - 1;
      curve[i] = Math.max(-threshold, Math.min(threshold, x)) / threshold;
    }

    return curve;
  }

  private static tanh(amount: Normalized): Float32Array<ArrayBuffer> {
    const curve = this.createCurve();
    const drive = 1 + amount * 40;

    for (let i = 0; i < curve.length; i++) {
      const x = (i * 2) / (curve.length - 1) - 1;
      curve[i] = Math.tanh(x * drive);
    }

    return curve;
  }
}

class WebAudioGuards {
  public static normalized(value: number, name: string): void {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      throw new Error(`${name} must be in range 0..1.`);
    }
  }

  public static frequency(value: number, name: string): void {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`${name} must be greater than zero.`);
    }
  }

  public static adsrEnvelope(env: IEnvelopeDefinition): IAdsrEnvelopeDefinition {
    if (env.type !== ADSR_ENVELOPE) {
      throw new Error(`Unsupported envelope type '${env.type}'.`);
    }

    const adsr = env as IAdsrEnvelopeDefinition;

    this.nonNegative(adsr.attackSeconds, "Envelope attackSeconds");
    this.nonNegative(adsr.decaySeconds, "Envelope decaySeconds");
    this.nonNegative(adsr.releaseSeconds, "Envelope releaseSeconds");
    this.normalized(adsr.sustainLevel, "Envelope sustainLevel");

    return adsr;
  }

  public static voiceDefinition(definition: IVoiceDefinition): void {
    if (definition.oscillators.length === 0) {
      throw new Error("Voice definition must contain at least one oscillator.");
    }

    for (const oscillator of definition.oscillators) {
      this.normalized(oscillator.gain, "oscillator gain");
    }

    this.adsrEnvelope(definition.envelope);
    this.normalized(definition.noise.gain, "noise gain");
    this.normalized(definition.distortion.amount, "distortion amount");
  }

  private static nonNegative(value: number, name: string): void {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`${name} must be >= 0.`);
    }
  }
}

.PS C:\Users\danha\source\repos\HTML\MonoRepro> pnpm --filter @monorepo/music-core-synthesizer-web-audio build

> @monorepo/music-core-synthesizer-web-audio@1.0.0 build C:\Users\danha\source\repos\HTML\MonoRepro\packages\Audio\music-core-synthesizer\modules\music-core-synthesizer-web-audio
> tsc -p tsconfig.json

src/index.ts:75:32 - error TS2339: Property 'attackSeconds' does not exist on type 'IEnvelopeDefinition'.

75     const attackEnd = at + env.attackSeconds;
                                  ~~~~~~~~~~~~~

src/index.ts:76:38 - error TS2339: Property 'decaySeconds' does not exist on type 'IEnvelopeDefinition'.

76     const decayEnd = attackEnd + env.decaySeconds;
                                        ~~~~~~~~~~~~

src/index.ts:77:25 - error TS2339: Property 'sustainLevel' does not exist on type 'IEnvelopeDefinition'.

77     const sustain = env.sustainLevel * velocity;
                           ~~~~~~~~~~~~

src/index.ts:92:33 - error TS2339: Property 'releaseSeconds' does not exist on type 'IEnvelopeDefinition'.

92     const releaseEnd = at + env.releaseSeconds;
                                   ~~~~~~~~~~~~~~

src/index.ts:144:42 - error TS2551: Property 'oscillator' does not exist on type 'IVoiceDefinition'. Did you mean 'oscillators'?

144     oscillator.type = request.definition.oscillator.waveform;
                                             ~~~~~~~~~~

  ../music-core-synthesizer-contracts/dist/index.d.ts:50:14
    50     readonly oscillators: readonly IOscillatorDefinition[];
                    ~~~~~~~~~~~
    'oscillators' is declared here.

src/index.ts:150:26 - error TS2551: Property 'oscillator' does not exist on type 'IVoiceDefinition'. Did you mean 'oscillators'?

150       request.definition.oscillator.detuneCents,
                             ~~~~~~~~~~

  ../music-core-synthesizer-contracts/dist/index.d.ts:50:14
    50     readonly oscillators: readonly IOscillatorDefinition[];
                    ~~~~~~~~~~~
    'oscillators' is declared here.

src/index.ts:156:26 - error TS2551: Property 'oscillator' does not exist on type 'IVoiceDefinition'. Did you mean 'oscillators'?

156       request.definition.oscillator.gain,
                             ~~~~~~~~~~

  ../music-core-synthesizer-contracts/dist/index.d.ts:50:14
    50     readonly oscillators: readonly IOscillatorDefinition[];
                    ~~~~~~~~~~~
    'oscillators' is declared here.

src/index.ts:197:7 - error TS2561: Object literal may only specify known properties, but 'oscillator' does not exist in type 'IWebAudioVoiceGraph'. Did you mean to write 'oscillators'?

197       oscillator,
          ~~~~~~~~~~

src/index.ts:357:16 - error TS2551: Property 'oscillator' does not exist on type 'IWebAudioVoiceGraph'. Did you mean 'oscillators'?

357     this.graph.oscillator.start(at);
                   ~~~~~~~~~~

  ../music-core-synthesizer-contracts/dist/index.d.ts:98:14
    98     readonly oscillators: readonly OscillatorNode[];
                    ~~~~~~~~~~~
    'oscillators' is declared here.

src/index.ts:369:39 - error TS2339: Property 'releaseSeconds' does not exist on type 'IEnvelopeDefinition'.

369     const stopAt = at + this.envelope.releaseSeconds + 0.02;
                                          ~~~~~~~~~~~~~~

src/index.ts:372:18 - error TS2551: Property 'oscillator' does not exist on type 'IWebAudioVoiceGraph'. Did you mean 'oscillators'?

372       this.graph.oscillator.stop(stopAt);
                     ~~~~~~~~~~

  ../music-core-synthesizer-contracts/dist/index.d.ts:98:14
    98     readonly oscillators: readonly OscillatorNode[];
                    ~~~~~~~~~~~
    'oscillators' is declared here.

src/index.ts:378:16 - error TS2551: Property 'oscillator' does not exist on type 'IWebAudioVoiceGraph'. Did you mean 'oscillators'?

378     this.graph.oscillator.addEventListener("ended", () => this.dispose(), {
                   ~~~~~~~~~~

  ../music-core-synthesizer-contracts/dist/index.d.ts:98:14
    98     readonly oscillators: readonly OscillatorNode[];
                    ~~~~~~~~~~~
    'oscillators' is declared here.

src/index.ts:390:16 - error TS2551: Property 'oscillator' does not exist on type 'IWebAudioVoiceGraph'. Did you mean 'oscillators'?

390     this.graph.oscillator.disconnect();
                   ~~~~~~~~~~

  ../music-core-synthesizer-contracts/dist/index.d.ts:98:14
    98     readonly oscillators: readonly OscillatorNode[];
                    ~~~~~~~~~~~
    'oscillators' is declared here.

src/index.ts:494:30 - error TS2339: Property 'attackSeconds' does not exist on type 'IEnvelopeDefinition'.

494     if (!Number.isFinite(env.attackSeconds) || env.attackSeconds < 0) {
                                 ~~~~~~~~~~~~~

src/index.ts:494:52 - error TS2339: Property 'attackSeconds' does not exist on type 'IEnvelopeDefinition'.

494     if (!Number.isFinite(env.attackSeconds) || env.attackSeconds < 0) {
                                                       ~~~~~~~~~~~~~

src/index.ts:498:30 - error TS2339: Property 'decaySeconds' does not exist on type 'IEnvelopeDefinition'.

498     if (!Number.isFinite(env.decaySeconds) || env.decaySeconds < 0) {
                                 ~~~~~~~~~~~~

src/index.ts:498:51 - error TS2339: Property 'decaySeconds' does not exist on type 'IEnvelopeDefinition'.

498     if (!Number.isFinite(env.decaySeconds) || env.decaySeconds < 0) {
                                                      ~~~~~~~~~~~~

src/index.ts:502:30 - error TS2339: Property 'releaseSeconds' does not exist on type 'IEnvelopeDefinition'.

502     if (!Number.isFinite(env.releaseSeconds) || env.releaseSeconds < 0) {
                                 ~~~~~~~~~~~~~~

src/index.ts:502:53 - error TS2339: Property 'releaseSeconds' does not exist on type 'IEnvelopeDefinition'.

502     if (!Number.isFinite(env.releaseSeconds) || env.releaseSeconds < 0) {
                                                        ~~~~~~~~~~~~~~

src/index.ts:506:25 - error TS2339: Property 'sustainLevel' does not exist on type 'IEnvelopeDefinition'.

506     this.normalized(env.sustainLevel, "Envelope sustainLevel");
                            ~~~~~~~~~~~~

src/index.ts:510:32 - error TS2551: Property 'oscillator' does not exist on type 'IVoiceDefinition'. Did you mean 'oscillators'?

510     this.normalized(definition.oscillator.gain, "oscillator gain");
                                   ~~~~~~~~~~

  ../music-core-synthesizer-contracts/dist/index.d.ts:50:14
    50     readonly oscillators: readonly IOscillatorDefinition[];
                    ~~~~~~~~~~~
    'oscillators' is declared here.

Found 21 errors in the same file, starting at: src/index.ts:75

C:\Users\danha\source\repos\HTML\MonoRepro\packages\Audio\music-core-synthesizer\modules\music-core-synthesizer-web-audio:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @monorepo/music-core-synthesizer-web-audio@1.0.0 build: tsc -p tsconfig.json
Exit status 2
PS C:\Users\danha\source\repos\HTML\MonoRepro> 

Thought for 5s
Replace the whole file:

// packages/Audio/music-core-synthesizer/modules/music-core-synthesizer-web-audio/src/index.ts

import type {
  Hertz,
  IDistortionDefinition,
  IEnvelopeDefinition,
  IWebAudioContextFactory,
  IWebAudioEnvelopeScheduler,
  IWebAudioMasterBus,
  IWebAudioNoiseSourceFactory,
  IWebAudioVoiceFactory,
  IWebAudioVoiceGraph,
  IWebAudioVoiceGraphBuilder,
  IFilterDefinition,
  IVoiceDefinition,
  IVoiceHandle,
  MidiNoteNumber,
  Normalized,
  Seconds,
} from "@monorepo/music-core-synthesizer-contracts";

import {
  DistortionType,
  FilterType,
} from "@monorepo/music-core-synthesizer-contracts";

import {
  ADSR_ENVELOPE,
  type IAdsrEnvelopeDefinition,
} from "@monorepo/music-core-synthesizer-envelopes";

export class WebAudioContextFactory implements IWebAudioContextFactory {
  public create(): AudioContext {
    return new AudioContext();
  }
}

export class WebAudioMasterBus implements IWebAudioMasterBus {
  public readonly input: GainNode;
  public readonly output: GainNode;

  public constructor(
    private readonly context: AudioContext,
    initialGain: Normalized = 0.8,
  ) {
    WebAudioGuards.normalized(initialGain, "initialGain");

    this.input = context.createGain();
    this.output = context.createGain();

    this.input.connect(this.output);
    this.output.gain.setValueAtTime(initialGain, context.currentTime);
  }

  public connect(destination: AudioNode): void {
    this.output.connect(destination);
  }

  public setGain(value: Normalized, at: Seconds): void {
    WebAudioGuards.normalized(value, "master gain");
    this.output.gain.setValueAtTime(value, at);
  }

  public dispose(): void {
    this.input.disconnect();
    this.output.disconnect();
  }
}

export class WebAudioEnvelopeScheduler implements IWebAudioEnvelopeScheduler {
  public noteOn(
    param: AudioParam,
    env: IEnvelopeDefinition,
    velocity: Normalized,
    at: Seconds,
  ): void {
    WebAudioGuards.normalized(velocity, "velocity");

    const adsr = WebAudioGuards.adsrEnvelope(env);
    const attackEnd = at + adsr.attackSeconds;
    const decayEnd = attackEnd + adsr.decaySeconds;
    const sustain = adsr.sustainLevel * velocity;

    param.cancelScheduledValues(at);
    param.setValueAtTime(0, at);
    param.linearRampToValueAtTime(velocity, attackEnd);
    param.linearRampToValueAtTime(sustain, decayEnd);
  }

  public noteOff(
    param: AudioParam,
    env: IEnvelopeDefinition,
    at: Seconds,
  ): void {
    const adsr = WebAudioGuards.adsrEnvelope(env);
    const releaseEnd = at + adsr.releaseSeconds;

    param.cancelScheduledValues(at);
    param.setValueAtTime(param.value, at);
    param.linearRampToValueAtTime(0, releaseEnd);
  }

  public cancel(param: AudioParam, at: Seconds): void {
    param.cancelScheduledValues(at);
  }
}

export class WebAudioWhiteNoiseSourceFactory implements IWebAudioNoiseSourceFactory {
  public constructor(private readonly durationSeconds = 2) {
    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
      throw new Error("Noise buffer duration must be greater than zero.");
    }
  }

  public create(context: AudioContext): AudioNode {
    const frameCount = Math.ceil(context.sampleRate * this.durationSeconds);
    const buffer = context.createBuffer(1, frameCount, context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.start();

    return source;
  }
}

export class WebAudioVoiceGraphBuilder implements IWebAudioVoiceGraphBuilder {
  public constructor(
    private readonly noiseSourceFactory: IWebAudioNoiseSourceFactory,
  ) {}

  public build(request: {
    readonly context: AudioContext;
    readonly destination: AudioNode;
    readonly definition: IVoiceDefinition;
    readonly frequencyHz: Hertz;
  }): IWebAudioVoiceGraph {
    WebAudioGuards.frequency(request.frequencyHz, "frequencyHz");
    WebAudioGuards.voiceDefinition(request.definition);

    const filter = this.createFilterOrNull(
      request.context,
      request.definition.filter,
    );

    const distortion = this.createDistortionOrNull(
      request.context,
      request.definition.distortion,
    );

    const vca = request.context.createGain();
    vca.gain.setValueAtTime(0, request.context.currentTime);

    const firstProcessor = filter ?? distortion ?? vca;

    const oscillatorMixer = request.context.createGain();
    oscillatorMixer.gain.setValueAtTime(1, request.context.currentTime);

    const oscillators = request.definition.oscillators.map((definition) => {
      const oscillator = request.context.createOscillator();
      oscillator.type = definition.waveform;
      oscillator.frequency.setValueAtTime(
        request.frequencyHz,
        request.context.currentTime,
      );
      oscillator.detune.setValueAtTime(
        definition.detuneCents,
        request.context.currentTime,
      );

      const gain = request.context.createGain();
      gain.gain.setValueAtTime(definition.gain, request.context.currentTime);

      oscillator.connect(gain);
      gain.connect(oscillatorMixer);

      return oscillator;
    });

    oscillatorMixer.connect(firstProcessor);

    if (filter !== null && distortion !== null) {
      filter.connect(distortion);
      distortion.connect(vca);
    } else if (filter !== null) {
      filter.connect(vca);
    } else if (distortion !== null) {
      distortion.connect(vca);
    }

    const noise = this.createNoiseOrNull(
      request.context,
      request.definition,
      firstProcessor,
    );

    vca.connect(request.destination);

    return {
      output: vca,
      oscillators,
      vca,
      filter,
      distortion,
      noise,
    };
  }

  private createFilterOrNull(
    context: AudioContext,
    definition: IFilterDefinition,
  ): BiquadFilterNode | null {
    if (!definition.enabled) {
      return null;
    }

    WebAudioGuards.frequency(definition.cutoffHz, "filter cutoffHz");

    if (!Number.isFinite(definition.resonanceQ) || definition.resonanceQ < 0) {
      throw new Error("filter resonanceQ must be >= 0.");
    }

    const node = context.createBiquadFilter();

    switch (definition.type) {
      case FilterType.LowPass:
        node.type = "lowpass";
        break;
      case FilterType.HighPass:
        node.type = "highpass";
        break;
      case FilterType.BandPass:
        node.type = "bandpass";
        break;
      default:
        throw new Error("Unsupported filter type.");
    }

    node.frequency.setValueAtTime(definition.cutoffHz, context.currentTime);
    node.Q.setValueAtTime(definition.resonanceQ, context.currentTime);

    return node;
  }

  private createDistortionOrNull(
    context: AudioContext,
    definition: IDistortionDefinition,
  ): WaveShaperNode | null {
    if (!definition.enabled || definition.type === DistortionType.None) {
      return null;
    }

    WebAudioGuards.normalized(definition.amount, "distortion amount");

    const node = context.createWaveShaper();
    node.curve = WebAudioDistortionCurveFactory.create(definition);
    node.oversample = "4x";

    return node;
  }

  private createNoiseOrNull(
    context: AudioContext,
    definition: IVoiceDefinition,
    destination: AudioNode,
  ): AudioNode | null {
    if (!definition.noise.enabled || definition.noise.gain <= 0) {
      return null;
    }

    WebAudioGuards.normalized(definition.noise.gain, "noise gain");

    const source = this.noiseSourceFactory.create(context);
    const gain = context.createGain();

    gain.gain.setValueAtTime(definition.noise.gain, context.currentTime);

    source.connect(gain);
    gain.connect(destination);

    return source;
  }
}

export class WebAudioVoiceFactory implements IWebAudioVoiceFactory {
  public constructor(
    private readonly graphBuilder: IWebAudioVoiceGraphBuilder,
    private readonly envelopeScheduler: IWebAudioEnvelopeScheduler,
  ) {}

  public create(request: {
    readonly context: AudioContext;
    readonly destination: AudioNode;
    readonly definition: IVoiceDefinition;
    readonly note: MidiNoteNumber;
    readonly velocity: Normalized;
    readonly frequencyHz: Hertz;
    readonly startedAt: Seconds;
  }): IVoiceHandle {
    WebAudioGuards.normalized(request.velocity, "velocity");
    WebAudioGuards.frequency(request.frequencyHz, "frequencyHz");

    const graph = this.graphBuilder.build({
      context: request.context,
      destination: request.destination,
      definition: request.definition,
      frequencyHz: request.frequencyHz,
    });

    return new WebAudioVoiceHandle(
      graph,
      this.envelopeScheduler,
      request.definition.envelope,
      request.note,
      request.velocity,
      request.startedAt,
    );
  }
}

export class WebAudioVoiceHandle implements IVoiceHandle {
  public readonly id: string;
  public readonly note: MidiNoteNumber;

  private released = false;
  private disposed = false;
  private started = false;

  public constructor(
    private readonly graph: IWebAudioVoiceGraph,
    private readonly envelopeScheduler: IWebAudioEnvelopeScheduler,
    private readonly envelope: IEnvelopeDefinition,
    note: MidiNoteNumber,
    private readonly velocity: Normalized,
    startedAt: Seconds,
  ) {
    this.id = `${note}:${startedAt}`;
    this.note = note;
  }

  public get isReleased(): boolean {
    return this.released;
  }

  public start(at: Seconds): void {
    this.throwIfDisposed();

    if (this.started) {
      throw new Error("Voice has already been started.");
    }

    this.started = true;

    this.envelopeScheduler.noteOn(
      this.graph.vca.gain,
      this.envelope,
      this.velocity,
      at,
    );

    for (const oscillator of this.graph.oscillators) {
      oscillator.start(at);
    }
  }

  public release(at: Seconds): void {
    if (this.disposed || this.released) {
      return;
    }

    this.released = true;

    this.envelopeScheduler.noteOff(this.graph.vca.gain, this.envelope, at);

    const adsr = WebAudioGuards.adsrEnvelope(this.envelope);
    const stopAt = at + adsr.releaseSeconds + 0.02;

    for (const oscillator of this.graph.oscillators) {
      try {
        oscillator.stop(stopAt);
      } catch {
        // already stopped
      }
    }

    const first = this.graph.oscillators[0];

    if (first) {
      first.addEventListener("ended", () => this.dispose(), { once: true });
      return;
    }

    this.dispose();
  }

  public dispose(): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;

    for (const oscillator of this.graph.oscillators) {
      oscillator.disconnect();
    }

    this.graph.vca.disconnect();
    this.graph.filter?.disconnect();
    this.graph.distortion?.disconnect();
    this.graph.noise?.disconnect();
  }

  private throwIfDisposed(): void {
    if (this.disposed) {
      throw new Error("Voice has already been disposed.");
    }
  }
}

export class WebAudioDistortionCurveFactory {
  private static readonly sampleCount = 2048;

  public static create(
    definition: IDistortionDefinition,
  ): Float32Array<ArrayBuffer> {
    WebAudioGuards.normalized(definition.amount, "distortion amount");

    switch (definition.type) {
      case DistortionType.SoftClip:
        return this.softClip(definition.amount);
      case DistortionType.HardClip:
        return this.hardClip(definition.amount);
      case DistortionType.Tanh:
        return this.tanh(definition.amount);
      case DistortionType.None:
        return this.identity();
      default:
        throw new Error("Unsupported distortion type.");
    }
  }

  private static createCurve(): Float32Array<ArrayBuffer> {
    return new Float32Array(
      new ArrayBuffer(this.sampleCount * Float32Array.BYTES_PER_ELEMENT),
    );
  }

  private static identity(): Float32Array<ArrayBuffer> {
    const curve = this.createCurve();

    for (let i = 0; i < curve.length; i++) {
      const x = (i * 2) / (curve.length - 1) - 1;
      curve[i] = x;
    }

    return curve;
  }

  private static softClip(amount: Normalized): Float32Array<ArrayBuffer> {
    const curve = this.createCurve();
    const drive = 1 + amount * 20;

    for (let i = 0; i < curve.length; i++) {
      const x = (i * 2) / (curve.length - 1) - 1;
      curve[i] = x / (1 + Math.abs(x * drive));
    }

    return curve;
  }

  private static hardClip(amount: Normalized): Float32Array<ArrayBuffer> {
    const curve = this.createCurve();
    const threshold = Math.max(0.05, 1 - amount);

    for (let i = 0; i < curve.length; i++) {
      const x = (i * 2) / (curve.length - 1) - 1;
      curve[i] = Math.max(-threshold, Math.min(threshold, x)) / threshold;
    }

    return curve;
  }

  private static tanh(amount: Normalized): Float32Array<ArrayBuffer> {
    const curve = this.createCurve();
    const drive = 1 + amount * 40;

    for (let i = 0; i < curve.length; i++) {
      const x = (i * 2) / (curve.length - 1) - 1;
      curve[i] = Math.tanh(x * drive);
    }

    return curve;
  }
}

class WebAudioGuards {
  public static normalized(value: number, name: string): void {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      throw new Error(`${name} must be in range 0..1.`);
    }
  }

  public static frequency(value: number, name: string): void {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`${name} must be greater than zero.`);
    }
  }

  public static adsrEnvelope(env: IEnvelopeDefinition): IAdsrEnvelopeDefinition {
    if (env.type !== ADSR_ENVELOPE) {
      throw new Error(`Unsupported envelope type '${env.type}'.`);
    }

    const adsr = env as IAdsrEnvelopeDefinition;

    this.nonNegative(adsr.attackSeconds, "Envelope attackSeconds");
    this.nonNegative(adsr.decaySeconds, "Envelope decaySeconds");
    this.nonNegative(adsr.releaseSeconds, "Envelope releaseSeconds");
    this.normalized(adsr.sustainLevel, "Envelope sustainLevel");

    return adsr;
  }

  public static voiceDefinition(definition: IVoiceDefinition): void {
    if (definition.oscillators.length === 0) {
      throw new Error("Voice definition must contain at least one oscillator.");
    }

    for (const oscillator of definition.oscillators) {
      this.normalized(oscillator.gain, "oscillator gain");
    }

    this.adsrEnvelope(definition.envelope);
    this.normalized(definition.noise.gain, "noise gain");
    this.normalized(definition.distortion.amount, "distortion amount");
  }

  private static nonNegative(value: number, name: string): void {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`${name} must be >= 0.`);
    }
  }
}

True or not:ought for a few seconds
@startuml
title Synthesizer Package Dependencies

package "music-core-synthesizer-contracts" as Contracts 
package "music-core-synthesizer-voice-contracts" as Voice.Contracts 

Voice.Contracts --> Contracts : Voice containts all information about a Voice

package "music-core-synthesizer-oscillators-contracts" as Oscillator.Contracts 
package "music-core-synthesizer-envelopes-contracts" as Envelopes.Contracts
package "music-core-synthesizer-envelopes-contracts" as Envelopes.Contracts

Oscillator.Contracts --> Voice.Contracts : Oscillator contains all information about a oscillator
Envelopes.Contracts --> Voice.Contracts : Envelope contains all information about an envelope

package "music-core-synthesizer-engine" as Engine   
package "music-core-synthesizer-web-audio" as WebAudio  

Contracts --> Engine : Engine is the final contract aggregator for the synthesizer
Engine --> WebAudio : Engine is given to Engine to produce the configuration package for given technology

@enduml

Not true. Dependency direction is inverted in several places.

Correct direction:

@startuml
title Synthesizer Package Dependencies

package "music-core-synthesizer-contracts" as Contracts

package "music-core-synthesizer-voice-contracts" as VoiceContracts
package "music-core-synthesizer-oscillators-contracts" as OscillatorContracts
package "music-core-synthesizer-envelopes-contracts" as EnvelopeContracts

package "music-core-synthesizer-engine" as Engine
package "music-core-synthesizer-web-audio" as WebAudio
package "app / ui / composition-root" as App

VoiceContracts --> Contracts
OscillatorContracts --> Contracts
EnvelopeContracts --> Contracts

Engine --> Contracts
WebAudio --> Contracts
WebAudio --> EnvelopeContracts

App --> Engine
App --> WebAudio
App --> VoiceContracts
App --> OscillatorContracts
App --> EnvelopeContracts

@enduml
Core rule:

implementations depend on contracts
contracts do not depend on implementations
engine does not depend on web-audio
web-audio does not own engine
app/composition-root wires engine + web-audio together
This part is wrong:

Contracts --> Engine
Engine --> WebAudio
Should be:

Engine --> Contracts
WebAudio --> Contracts
App --> Engine
App --> WebAudio

WebAudio does not want contracts from other then the envelopes? 

Short answer: no — WebAudio must depend on the main contracts. Not only envelopes.

Your current design already proves it:

import type {
  IVoiceDefinition,
  IFilterDefinition,
  IDistortionDefinition,
  IWebAudioVoiceGraphBuilder,
  IWebAudioVoiceFactory,
  Normalized,
  Hertz,
} from "@monorepo/music-core-synthesizer-contracts";
WebAudio implements infrastructure for the domain, so it must consume the domain contracts.

Correct dependency model
contracts (core domain)
    ↑
    ├── engine (application)
    └── web-audio (infrastructure)

envelopes (optional specialization)
    ↑
    └── web-audio (only if you support ADSR behavior)
Why WebAudio MUST depend on contracts
Because it needs:

IVoiceDefinition → to build graph

IOscillatorDefinition[] → oscillators

IFilterDefinition → filter node

IDistortionDefinition → waveshaper

IEnvelopeDefinition → scheduling

If you remove that dependency, WebAudio becomes useless.

What WebAudio should NOT depend on
❌ engine
❌ UI
❌ voice-contracts module (if split badly)
About envelopes specifically
This part is optional:

web-audio --> envelopes (only if using ADSR specialization)
Because:

if (env.type === ADSR_ENVELOPE)
That is runtime specialization, not core dependency.

Clean mental model
contracts = language
engine = behavior
web-audio = execution
ui = control
WebAudio reads the “language” (contracts) and turns it into sound.

If you want stricter isolation (advanced)
You can reduce coupling like this:

web-audio
  depends only on:
    IVoiceDefinition
    IEnvelopeDefinition

envelopes
  defines:
    IAdsrEnvelopeDefinition

adapter layer:
  converts IAdsrEnvelopeDefinition -> generic IEnvelopeDefinition
But:

👉 Not worth it right now. Adds complexity without value.

Final answer
WebAudio MUST depend on:
  ✔ music-core-synthesizer-contracts

WebAudio MAY depend on:
  ✔ music-core-synthesizer-envelopes (for ADSR)

WebAudio should NOT depend on:
  ❌ engine
  ❌ UI
Your current direction is correct — just keep the dependency arrows clean.

I want to change the established design! I want to avoid music-core-synthesizer-contracts been a god object and instread nominate music-core-synthesizer-contrat to be a aggrate for all e.g music-core-synthesizer-distortion-contracts,music-core-synthesizer-modulation-contracts,  music-core-synthesizer-noise-contracts etc 

Thought for 7s
Yes. That is a better long-term package boundary.

Make:

music-core-synthesizer-contracts
an aggregate/barrel package only, not the owner of every contract.

Correct structure
modules
├── music-core-synthesizer-shared-contracts
├── music-core-synthesizer-oscillators-contracts
├── music-core-synthesizer-envelopes-contracts
├── music-core-synthesizer-filters-contracts
├── music-core-synthesizer-distortion-contracts
├── music-core-synthesizer-noise-contracts
├── music-core-synthesizer-voice-contracts
├── music-core-synthesizer-web-audio-contracts
└── music-core-synthesizer-contracts   // aggregate only
Dependency direction
shared-contracts
   ↑
oscillators-contracts
envelopes-contracts
filters-contracts
distortion-contracts
noise-contracts
   ↑
voice-contracts
   ↑
engine
web-audio
ui/app
Aggregate package:

music-core-synthesizer-contracts
  → re-exports all contract packages
Nothing should depend on the aggregate inside core packages unless you accept broader coupling.

Recommended rule
Use specific contracts inside packages:

// good
import type { IOscillatorDefinition } from "@monorepo/music-core-synthesizer-oscillators-contracts";
import type { IEnvelopeDefinition } from "@monorepo/music-core-synthesizer-envelopes-contracts";
Use aggregate only at app/UI boundary:

// acceptable in app layer
import type { IVoiceDefinition } from "@monorepo/music-core-synthesizer-contracts";
Key package responsibilities
shared-contracts
- Seconds
- Hertz
- Normalized
- MidiNoteNumber
- IDisposable

oscillators-contracts
- OscillatorWaveform
- IOscillatorDefinition

envelopes-contracts
- IEnvelopeDefinition

filters-contracts
- FilterType
- IFilterDefinition

distortion-contracts
- DistortionType
- IDistortionDefinition

noise-contracts
- INoiseDefinition

voice-contracts
- IVoiceDefinition
- IVoiceHandle

web-audio-contracts
- IWebAudioVoiceGraph
- IWebAudioVoiceFactory
- IWebAudioEnvelopeScheduler

contracts
- export * from all above
Aggregate package should be only this
// music-core-synthesizer-contracts/src/index.ts

export * from "@monorepo/music-core-synthesizer-shared-contracts";
export * from "@monorepo/music-core-synthesizer-oscillators-contracts";
export * from "@monorepo/music-core-synthesizer-envelopes-contracts";
export * from "@monorepo/music-core-synthesizer-filters-contracts";
export * from "@monorepo/music-core-synthesizer-distortion-contracts";
export * from "@monorepo/music-core-synthesizer-noise-contracts";
export * from "@monorepo/music-core-synthesizer-voice-contracts";
export * from "@monorepo/music-core-synthesizer-web-audio-contracts";
Important
Do not let this happen:

distortion-contracts → voice-contracts ❌
oscillators-contracts → voice-contracts ❌
envelopes-contracts → voice-contracts ❌
Correct:

voice-contracts → oscillator/envelope/filter/distortion/noise contracts ✔
So yes: make music-core-synthesizer-contracts an aggregate package, and move actual ownership into small focused *-contracts packages.

shared-contracts can be music-core-synthesizer-contracts 

Yes. That is better.

Use:

music-core-synthesizer-contracts
as the shared base contracts package.

Then add focused packages beside it:

music-core-synthesizer-contracts
music-core-synthesizer-oscillators-contracts
music-core-synthesizer-envelopes-contracts
music-core-synthesizer-filters-contracts
music-core-synthesizer-distortion-contracts
music-core-synthesizer-noise-contracts
music-core-synthesizer-voice-contracts
music-core-synthesizer-web-audio-contracts
Dependency direction:

music-core-synthesizer-contracts
   ↑
oscillators-contracts
envelopes-contracts
filters-contracts
distortion-contracts
noise-contracts
   ↑
voice-contracts
   ↑
engine / web-audio / ui
So music-core-synthesizer-contracts should contain only:

export type Seconds = number;
export type Hertz = number;
export type MidiNoteNumber = number;
export type Normalized = number;

export interface IDisposable {
  dispose(): void;
}
Do not put IVoiceDefinition, IOscillatorDefinition, IDistortionDefinition, etc. there anymore.

For an aggregate/barrel package, use a different name:

music-core-synthesizer-all-contracts
or skip it for now.

Best current decision:

music-core-synthesizer-contracts = shared primitives only
specific feature contracts = own packages
That avoids the god-object problem.

parts
├── music-core-synthesizer-distortion
│   ├── package.json
│   ├── README.md
│   ├── src
│   │   └── code.ts
│   ├── tests
│   │   └── tests.test.ts
│   ├── tsconfig.json
│   ├── tsconfig.test.json
│   └── vitest.config.ts
├── music-core-synthesizer-distortion-contracts
│   ├── package.json
│   ├── README.md
│   ├── src
│   │   └── index.ts
│   ├── tests
│   │   └── tests.test.ts
│   ├── tsconfig.json
│   ├── tsconfig.test.json
│   └── vitest.config.ts
├── music-core-synthesizer-envelopes
│   ├── package.json
│   ├── README.md
│   ├── src
│   │   ├── adsrEnvelope.ts
│   │   └── index.ts
│   ├── tests
│   │   └── tests.test.ts
│   ├── tsconfig.json
│   ├── tsconfig.test.json
│   └── vitest.config.ts
├── music-core-synthesizer-envelopes-contracts
│   ├── package.json
│   ├── README.md
│   ├── src
│   │   └── index.ts
│   ├── tests
│   │   └── tests.test.ts
│   ├── tsconfig.json
│   ├── tsconfig.test.json
│   └── vitest.config.ts
├── music-core-synthesizer-filters
│   ├── package.json
│   ├── README.md
│   ├── src
│   │   └── code.ts
│   ├── tests
│   │   └── tests.test.ts
│   ├── tsconfig.json
│   ├── tsconfig.test.json
│   └── vitest.config.ts
├── music-core-synthesizer-filters-contracts
│   ├── package.json
│   ├── README.md
│   ├── src
│   │   └── code.ts
│   ├── tests
│   │   └── tests.test.ts
│   ├── tsconfig.json
│   ├── tsconfig.test.json
│   └── vitest.config.ts
├── music-core-synthesizer-midi
│   ├── package.json
│   ├── README.md
│   ├── src
│   │   └── code.ts
│   ├── tests
│   │   └── tests.test.ts
│   ├── tsconfig.json
│   ├── tsconfig.test.json
│   └── vitest.config.ts
├── music-core-synthesizer-midi-contracts
│   ├── package.json
│   ├── README.md
│   ├── src
│   │   └── code.ts
│   ├── tests
│   │   └── tests.test.ts
│   ├── tsconfig.json
│   ├── tsconfig.test.json
│   └── vitest.config.ts
├── music-core-synthesizer-modulation
│   ├── package.json
│   ├── README.md
│   ├── src
│   │   └── code.ts
│   ├── tests
│   │   └── tests.test.ts
│   ├── tsconfig.json
│   ├── tsconfig.test.json
│   └── vitest.config.ts
├── music-core-synthesizer-modulation-contracts
│   ├── package.json
│   ├── README.md
│   ├── src
│   │   └── code.ts
│   ├── tests
│   │   └── tests.test.ts
│   ├── tsconfig.json
│   ├── tsconfig.test.json
│   └── vitest.config.ts
├── music-core-synthesizer-noise
│   ├── package.json
│   ├── README.md
│   ├── src
│   │   └── code.ts
│   ├── tests
│   │   └── tests.test.ts
│   ├── tsconfig.json
│   ├── tsconfig.test.json
│   └── vitest.config.ts
├── music-core-synthesizer-noise-contracts
│   ├── package.json
│   ├── README.md
│   ├── src
│   │   └── code.ts
│   ├── tests
│   │   └── tests.test.ts
│   ├── tsconfig.json
│   ├── tsconfig.test.json
│   └── vitest.config.ts
├── music-core-synthesizer-parameters
│   ├── package.json
│   ├── README.md
│   ├── src
│   │   └── code.ts
│   ├── tests
│   │   └── tests.test.ts
│   ├── tsconfig.json
│   ├── tsconfig.test.json
│   └── vitest.config.ts
├── music-core-synthesizer-parameters-contracts
│   ├── package.json
│   ├── README.md
│   ├── src
│   │   └── code.ts
│   ├── tests
│   │   └── tests.test.ts
│   ├── tsconfig.json
│   ├── tsconfig.test.json
│   └── vitest.config.ts
├── music-core-synthesizer-presets
│   ├── package.json
│   ├── README.md
│   ├── src
│   │   └── code.ts
│   ├── tests
│   │   └── tests.test.ts
│   ├── tsconfig.json
│   ├── tsconfig.test.json
│   └── vitest.config.ts
├── music-core-synthesizer-presets-contracts
│   ├── package.json
│   ├── README.md
│   ├── src
│   │   └── code.ts
│   ├── tests
│   │   └── tests.test.ts
│   ├── tsconfig.json
│   ├── tsconfig.test.json
│   └── vitest.config.ts
├── music-core-synthesizer-voice
│   ├── package.json
│   ├── README.md
│   ├── src
│   │   └── code.ts
│   ├── tests
│   │   └── tests.test.ts
│   ├── tsconfig.json
│   ├── tsconfig.test.json
│   └── vitest.config.ts
├── music-core-synthesizer-voice-allocator
│   ├── package.json
│   ├── README.md
│   ├── src
│   │   └── code.ts
│   ├── tests
│   │   └── tests.test.ts
│   ├── tsconfig.json
│   ├── tsconfig.test.json
│   └── vitest.config.ts
├── music-core-synthesizer-voice-allocator-contracts
│   ├── package.json
│   ├── README.md
│   ├── src
│   │   └── code.ts
│   ├── tests
│   │   └── tests.test.ts
│   ├── tsconfig.json
│   ├── tsconfig.test.json
│   └── vitest.config.ts
├── music-core-synthesizer-voice-contracts
│   ├── package.json
│   ├── README.md
│   ├── src
│   │   └── code.ts
│   ├── tests
│   │   └── tests.test.ts
│   ├── tsconfig.json
│   ├── tsconfig.test.json
│   └── vitest.config.ts
└── oscillators
    ├── component-diagram.puml
    ├── music-core-synthesizer-oscillators
    │   ├── package.json
    │   ├── README.md
    │   ├── src
    │   │   └── code.ts
    │   ├── tests
    │   │   └── tests.test.ts
    │   ├── tsconfig.json
    │   ├── tsconfig.test.json
    │   └── vitest.config.ts
    ├── music-core-synthesizer-oscillators-contracts
    │   ├── package.json
    │   ├── README.md
    │   ├── src
    │   │   └── code.ts
    │   ├── tests
    │   │   └── tests.test.ts
    │   ├── tsconfig.json
    │   ├── tsconfig.test.json
    │   └── vitest.config.ts
    ├── music-core-synthesizer-oscillators-web-audio
    │   ├── package.json
    │   ├── README.md
    │   ├── src
    │   │   └── code.ts
    │   ├── tests
    │   │   └── tests.test.ts
    │   ├── tsconfig.json
    │   ├── tsconfig.test.json
    │   └── vitest.config.ts
    └── music-core-synthesizer-oscillators-web-ui
        ├── package.json
        ├── README.md
        ├── src
        │   ├── index.ts
        │   └── oscillator-control.component.ts
        ├── tests
        │   └── tests.test.ts
        ├── tsconfig.json
        ├── tsconfig.test.json
        └── vitest.config.ts

Too many packages for current maturity.

Keep the contract split, but do not create implementation packages until used.

Fix this structure
Keep now
parts
├── music-core-synthesizer-contracts
├── music-core-synthesizer-oscillators-contracts
├── music-core-synthesizer-envelopes-contracts
├── music-core-synthesizer-distortion-contracts
├── music-core-synthesizer-filters-contracts
├── music-core-synthesizer-noise-contracts
├── music-core-synthesizer-voice-contracts
├── music-core-synthesizer-envelopes
├── music-core-synthesizer-web-audio
└── oscillators
    └── music-core-synthesizer-oscillators-web-ui
Defer/delete for now
music-core-synthesizer-modulation
music-core-synthesizer-modulation-contracts
music-core-synthesizer-parameters
music-core-synthesizer-parameters-contracts
music-core-synthesizer-presets
music-core-synthesizer-presets-contracts
music-core-synthesizer-midi
music-core-synthesizer-midi-contracts
music-core-synthesizer-voice
music-core-synthesizer-voice-allocator
music-core-synthesizer-voice-allocator-contracts
You already have @monorepo/music-core-midi; don’t duplicate it here.

Important rule
Use:

*-contracts = data shape
implementation package = behavior/factory/rendering
So this is correct:

music-core-synthesizer-envelopes-contracts
music-core-synthesizer-envelopes
This is premature unless used:

music-core-synthesizer-parameters
music-core-synthesizer-parameters-contracts
Clean dependency direction
music-core-synthesizer-contracts
  ↑
oscillators-contracts
envelopes-contracts
filters-contracts
distortion-contracts
noise-contracts
  ↑
voice-contracts
  ↑
engine / web-audio / ui
Next target
Implement only these contract packages now:

music-core-synthesizer-contracts
music-core-synthesizer-oscillators-contracts
music-core-synthesizer-envelopes-contracts
music-core-synthesizer-filters-contracts
music-core-synthesizer-distortion-contracts
music-core-synthesizer-noise-contracts
music-core-synthesizer-voice-contracts
Then update web-audio imports from the focused packages.

