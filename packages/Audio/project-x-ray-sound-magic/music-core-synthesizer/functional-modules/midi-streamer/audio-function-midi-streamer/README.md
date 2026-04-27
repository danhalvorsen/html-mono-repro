# audio-function-midi-streamer

## Responsibility

Domain/application MIDI stream orchestration. Reads song definitions through abstractions and emits deterministic MIDI stream events.

## Package Role

This package belongs to the MIDI Streamer feature module group.

``text
audio-function-midi-streamer-contracts
audio-function-midi-streamer
audio-function-midi-streamer-ui
audio-function-midi-streamer-web-audio
``

## Architecture Rule

Keep dependencies pointing inward.

Domain/application code must not depend on DOM, Lit, Web Audio, or browser MIDI APIs.