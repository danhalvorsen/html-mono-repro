# audio-function-midi-streamer-ui

## Responsibility

Lit 3 Web Component UI for selecting songs and streaming MIDI data as typed DOM events to slotted/listening components.

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